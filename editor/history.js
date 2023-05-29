/***************************************************************************************************
 *                                                                                                 *
 *          wWw             Metaviz History                                                        *
 *         (___)            Packet queue system for Undo/Redo.                                     *
 *           Y              MIT License                                                            *
 *          \//             (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.                 *
 *      ^^^^^^^^^^^                                                                                *
 **************************************************************************************************/

/*
    History packet base:
    {
        timestamp: ...,
        action: ...,
        instance: ..., // Generated tabID (better than session ID because user can browse in many tabs)
        board: ..., // Board ID
        session: ..., // Session ID for pseudo-user (local standalone only)
        ...other params...
    }

    History packet add/del:
    {
        action: 'add' | 'del',
        nodes: [serialized MetavizNode, ...], (optional)
        links: [serialized MetavizLink, ...], (optional)
    }

    History packet move:
    {
        action: 'move',
        nodes: [id, ...],
        offset: {x: ..., y: ...}
        or
        position: {x: ..., y: ...}
        positionPrev: {x: ..., y: ...}
    }

    History packet resize:
    {
        action: 'resize',
        nodes: [id, ...],
        size: {w: ..., h: ...}
        sizePrev: {w: ..., h: ...}
    }

    History packet param:
    {
        action: 'param',
        node: {id: ...},
        data: {...},
        prev: {...}
    }

    History packet board:
    {
        action: 'board',
        name: ...,
        namePrev: ...
    }
*/

class MetavizHistory {

    /**
     * Constructor
     */

    constructor() {
        // Unsaved change
        this.dirty = false;
        // Undo
        this.history = [];
        // Redo
        this.future = [];
        // Last added node (for dblclick)
        this.last = {type: 'MetavizNodeText'};
    }

    /**
     * Store state into history
     */

    store(args) {

        // Migrate meta -> data, metaPrev -> prev
        if ('meta' in args) {
            args['data'] = args['meta'];
            delete args['meta'];
        }
        if ('metaPrev' in args) {
            args['prev'] = args['metaPrev'];
            delete args['metaPrev'];
        }
        if ('dataPrev' in args) {
            args['prev'] = args['dataPrev'];
            delete args['dataPrev'];
        }

        // Anything really changed?
        if ('data' in args && 'prev' in args && (JSON.stringify(args.data) === JSON.stringify(args.prev))) return;

        // Timestamp
        args['timestamp'] = Date.now();

        // Remember last node created
        if (args.action == 'add' && 'nodes' in args) {
            const node = args.nodes[args.nodes.length - 1];
            this.last.type = node.type;
        }

        // Mark dirty
        this.dirty = true;

        // Store history packet
        this.history.push(args);
        metaviz.events.call('add:history', args);

    }

    /**
     * Restore state from history
     */

    restore(args) {

        // Add -> remove
        if (args.action == 'add') {

            // Nodes
            if ('nodes' in args) {
                let nodesToDelete = structuredClone(args.nodes);
                while (nodesToDelete.length) {
                    const node = nodesToDelete.pop();
                    metaviz.render.nodes.del(metaviz.render.nodes.get(node.id))
                }
            }

            // Links
            if ('links' in args) {
                let linksToDelete = structuredClone(args.links);
                while (linksToDelete.length) {
                    const link = linksToDelete.pop();
                    const fullLink = metaviz.render.links.get(link.id);
                    if (fullLink) metaviz.render.links.del(fullLink);
                }
            }

        }

        // Del -> recreate
        else if (args.action == 'del') {

            // Nodes
            if ('nodes' in args) {
                let newNodes = [];
                for (const node of args.nodes) {
                    const newNode = metaviz.render.nodes.add(node);
                    newNodes.push(newNode);
                }
                // Call start on all recreated nodes
                for (const node of newNodes) {
                    node.start();
                }
            }

            // Links
            if ('links' in args) {
                // TODO: w linkach zmieniłem id nodów na obiekty
                for (const link of args.links) metaviz.render.links.add(link);
            }

        }

        // Move -> move back
        else if (args.action == 'move') {
            for (const nodeID of args.nodes) {
                const node = metaviz.render.nodes.get(nodeID);
                if ('offset' in args) {
                    node.subPosition(args.offset);
                }
                else if ('position' in args) {
                    node.setPosition(args.positionPrev);
                }
                // Update node
                node.update();
                node.links.get().forEach(link => link.update());
            }
        }

        // New size -> old size
        else if (args.action == 'resize') {
            const node = metaviz.render.nodes.get(args.nodes[0]);
            node.transform.w = args.sizePrev.w;
            node.transform.h = args.sizePrev.h;
            node.update();
        }

        // Param new value -> Param old value
        else if (args.action == 'param') {
            const node = metaviz.render.nodes.get(args.node.id);
            for (const [param, value] of Object.entries(args.prev)) {
                node.meta.set(param, value);
            }
        }

        // Parent -> Old parent
        else if (args.action == 'parent') {
            const node = metaviz.render.nodes.get(args.node.id);
            node.setParent(args.node.parentPrev);
            node.setPosition(args.node.positionPrev);
            node.render();
            node.update();
        }

        // Board new name -> Board old name
        else if (args.action == 'board') {
            metaviz.editor.setBoardName(args.namePrev);
        }

        // Chat message
        else if (args.action == 'chat') {
            const fullNode = metaviz.render.nodes.get(args.node.id);
            fullNode.recvMessage(args.datetime, args.avatar, args.user, args.body);
        }

    }

    /**
     * Undo to previous state
     * returns true if moved to previous state
     */

    undo() {
        // Pop previous state from queue
        const previous = this.history.pop();

        if (previous) {
            // Restore state
            this.restore(previous);

            // Store for Redo
            this.future.push(this.mirror(previous));

            // Moved to previous state
            return true;

        }

        return false;
    }

    /**
     * Any undo on queue
     */

    hasUndo() {
        return this.history.length;
    }

    /**
     * Redo to future state
     * returns true if moved to future state
     */

    redo() {
        // Pop next state from queue
        const next = this.future.pop();

        if (next) {

            // Restore state
            this.restore(next);

            // Store for Undo
            this.history.push(this.mirror(next));

            // Moved to future state
            return true;

        }

        return false;
    }

    /**
     * Any redo on queue
     */

    hasRedo() {
        return this.future.length;
    }

    /**
     * Recreate history from scratch
     */

    recreate() {
        this.get(true).forEach(args => {

            // Add
            if (args.action == 'add') {

                // Nodes
                if ('nodes' in args) {
                    let newNodes = [];
                    for (const node of args.nodes) {
                        const newNode = metaviz.render.nodes.add(node);
                        newNode.update();
                        newNodes.push(newNode);
                    }
                    // Call start on all recreated nodes
                    for (const node of newNodes) {
                        node.start();
                    }
                }

                // Links
                if ('links' in args) {
                    for (const link of args.links) metaviz.render.links.add(link);
                }

            }

            // Del
            else if (args.action == 'del') {

                // Nodes
                if ('nodes' in args) {
                    for (const id of args.nodes) {
                        metaviz.render.nodes.del(metaviz.render.nodes.get(id));
                    }
                }

                // Links
                if ('links' in args) {
                    for (const id of args.links) {
                        metaviz.render.links.del(metaviz.render.links.get(id));
                    }
                }

            }

            // Move
            else if (args.action == 'move') {

                for (const nodeID of args.nodes) {

                    const node = metaviz.render.nodes.get(nodeID);

                    // Offset/position
                    if ('offset' in args) {
                        node.addPosition(args.offset);
                    }
                    else if ('position' in args) {
                        node.setPosition(args.position);
                    }

                    // Update node
                    node.update();
                    node.links.get().forEach(link => link.update());
                }

            }

            // Size
            else if (args.action == 'resize') {
                const node = metaviz.render.nodes.get(args.nodes[0]);
                node.setSize({width: args.size.w, height: args.size.h});
                node.update();
            }

            // Param
            else if (args.action == 'param') {
                const node = metaviz.render.nodes.get(args.node.id);
                for (const [param, value] of Object.entries(args.data)) {
                    node.meta.set(param, value);
                }
            }

            // Parent
            else if (args.action == 'parent') {
                const node = metaviz.render.nodes.get(args.node.id);
                node.setParent(args.node.parent);
                node.setPosition(args.node.position);
                node.render();
                node.update();
            }

            // Board new name -> Board old name
            else if (args.action == 'board') {
                metaviz.editor.setBoardName(args.name);
            }

            // Chat message
            else if (args.action == 'chat') {
                const fullNode = metaviz.render.nodes.get(args.node.id);
                fullNode.recvMessage(args.datetime, args.avatar, args.user, args.body);
            }

        });
    }

    /**
     * Is dirty (has unsaved changes)
     */

    isDirty() {
        return this.dirty;
    }

    /**
     * Reverse action
     */

    mirror(orgState) {

        // Object copy to avoid change in references
        const state = {...orgState};

        // Add
        if (state.action == 'add') state.action = 'del';

        // Del
        else if (state.action == 'del') state.action = 'add';

        // Move by offset
        else if (state.action == 'move' && 'offset' in state) {
            state.offset.x = -state.offset.x;
            state.offset.y = -state.offset.y;
        }

        // Move to position
        else if (state.action == 'move' && 'position' in state) {
            const temp_x = state.position.x;
            const temp_y = state.position.y;
            state.position.x = state.positionPrev.x;
            state.position.y = state.positionPrev.y;
            state.positionPrev.x = temp_x;
            state.positionPrev.y = temp_y;
        }

        // Param
        else if (state.action == 'param' && 'data' in state && 'prev' in state) {
            const temp = state.data;
            state.data = state.prev;
            state.prev = temp;
        }

        // Resize
        else if (state.action == 'resize' && 'size' in state && 'sizePrev' in state) {
            const temp_size = state.size;
            state.size = state.sizePrev;
            state.sizePrev = temp_size;
        }

        // Parent
        else if (state.action == 'parent' && 'node' in state) {
            const temp_parent = state.node.parent;
            state.node.parent = state.node.parentPrev;
            state.node.parentPrev = temp_parent;
            const temp_position = state.node.position;
            state.node.position.x = state.node.positionPrev.x;
            state.node.position.y = state.node.positionPrev.y;
            state.node.positionPrev.x = temp_position.x;
            state.node.positionPrev.y = temp_position.y;
        }

        // Board
        else if (state.action == 'board') {
            const newName = state.name;
            const oldName = state.namePrev;
            state.name = oldName;
            state.namePrev = newName;
        }

        return state;
    }

    /**
     * Set history records
     */

    set(history) {
        this.history = history;
    }

    /**
     * Get history records
     */

    get(sorted = false) {
        if (sorted) return this.history.sort((a, b) => a.timestamp - b.timestamp);
        else return this.history;
    }

    /**
     * Reset state
     */

    clearHistory() {
        // Undo
        this.history = [];
    }

    clearFuture() {
        // Redo
        this.future = [];
    }

    clear() {
        this.clearHistory();
        this.clearFuture();
    }

}
