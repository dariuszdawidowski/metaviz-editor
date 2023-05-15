/**
 * Metaviz Editor Interface
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

/*                                                      _
                 .---------.      (\___/)             _( )_
      |\_/|  .o ( Editooor! ) o. -(o . o)-           (_)@(_)
     -(o.o)-     `---------'     (       )/\          /(_)
      _(_)_                      (_______)_/        \\//
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

*/

class MetavizEditorBrowser extends MetavizNavigatorBrowser {

    constructor(args) {
        // Viewer constructor (also init events)
        super(args);

        // Board main ID
        this.id = null;

        // Board main name
        this.name = '';

        // Interacted nodes
        this.interaction = {

            mode: 'idle',

            // Is dragging
            drag: false,

            // Currently dragged link
            link: null,
            
            // Editing is locked?
            locked: false,

            // Lock editing
            lock: () => {
                this.interaction.locked = true;
            },

            // Unlock editing
            unlock: () => {
                this.interaction.locked = false;
            },

            // Reset state
            clear: () => {
                this.interaction.mode = 'idle';
                this.interaction.drag = false;
                this.interaction.locked = false;
            }

        };

        // Selected nodes
        this.selection = new MetavizSelection();

        // Arranger
        this.arrange = {
            sort: new MetavizArrangeSort(),
            align: new MetavizArrangeAlign(),
            settings: {
                margin: 40
            }
        };

        // Undo/Redo
        this.history = new MetavizHistory();

        // Create menu
        this.menu = new MetavizContextMenu({projectName: this.name});

        // Keyboard
        this.keyboard = new MetavizEditorKeyboard(this);

        // Pointer
        this.pointer = new MetavizEditorPointer(this);

        // Transform cage
        this.cage = new MetavizCage();

        // File
        this.file = {

            // File System API handle
            handle: null,

            // Reset state
            clear: () => {
                this.file.handle = null;
            }
        };

        // Spinner
        this.spinner = document.getElementById(metaviz.container.spinnerID);

        // Focus on canvas
        metaviz.render.container.focus();

    }

    /** EVENTS *********************************************************************************************************************/

    initEvents() {

        // Viewer events
        super.initEvents();

        // Editor leave events
        this.initEditorLeaveEvents();

        // Open context menu
        this.initEditorMenuEvents();
    }

    /**
     * Close window and pointer out
     */

    initEditorLeaveEvents() {

        // Prevent closing window/tab
        metaviz.events.subscribe('window:close', window, 'beforeunload', (event) => {
            this.flush(true);
            const confirmationMessage = '\o/';
            if (this.history.dirty) {
                (event || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            }
            else {
                return null;
            }
        });

        // Mouse out of bounds
        metaviz.events.subscribe('window:out', window, 'mouseout', (event) => {
            if (event.relatedTarget == null || event.relatedTarget.nodeName == 'HTML') {
                this.keyboard.key.clear();
                this.flush(false);
            }
        });

    }

    /**
     * Open menu
     */

    initEditorMenuEvents() {

        metaviz.events.subscribe('editor:menu', metaviz.render.container, 'contextmenu', (event) => {
            this.menu.show(event, this);
        });

    }

    /** START **********************************************************************************************************************/

    /**
     * Run after self-creation
     */

    start() {
    }

    /** NODES **********************************************************************************************************************/

    /**
     * Create node
     * nodeType: <string> class name
     * transform: {x: ..., y: ...}
     */

    nodeAdd(nodeType, transform) {
        let position = metaviz.render.screen2World(transform);
        if (metaviz.config.snap.grid.enabled) position = this.snapToGrid(position.x, position.y);
        const newNode = metaviz.render.nodes.add({id: uuid(), parent: metaviz.render.nodes.parent, type: nodeType, ...position});
        newNode.render();
        newNode.update();
        newNode.start();
        this.history.clearFuture();
        this.history.store({action: 'add', nodes: [newNode.serializeWithTransform()]});
    }

    /**
     * Delete selected node(s)
     */

    nodeDeleteSelected() {
        if (this.selection.count() > 0) {
            this.nodeDelete(this.selection.get(), true);
            this.selection.clear();
        }
    }

    /**
     * Delete selected node(s) without confirm
     */

    nodeDeleteSelectedInstantly() {
        if (this.selection.count() > 0) {
            this.nodeDelete(this.selection.get(), false);
            this.selection.clear();
        }
    }

    /**
     * Delete given node(s)
     */

    nodeDelete(list, ask = false) {

        let rusure = false;

        if (ask) {
            // Compose message
            let message = null;
            if (list.length == 1) message = `Delete node and it's contents?`;
            else if (list.length == 2) message = `Delete 2 nodes and it's contents?`;
            else if (list.length > 2) message = `Multiple nodes selected. Delete all ${this.selection.nodes.length} nodes and it's contents?`;
            rusure = confirm(message);
        }
        else {
            rusure = true;
        }

        if (rusure) {
            // Delete
            const nodesTree = list.flatMap(node => { return node.getTree(); });
            const nodes = nodesTree.map(node => { return node.serializeWithTransform(); });
            const links = [...new Set(nodesTree.flatMap(node => node.links.get().map(link => link.serialize())).map(item => item.id))].map(linkId => metaviz.render.links.get(linkId).serialize());

            // Undo/Sync
            this.history.store({
                action: 'del',
                nodes: nodes,
                links: links
            });

            // Delete
            for (const node of nodesTree) {
                metaviz.render.nodes.del(node);
            }

            // Refresh
            metaviz.render.layers.current.render();
            metaviz.render.layers.current.update();
        }
    }

    snapToGrid(x, y, width=16) {
        return {
            x: Math.round(x / width) * width,
            y: Math.round(y / width) * width
        }
    }

    /** LINKS **********************************************************************************************************************/

    /**
     * Create link
     */

    linkSelected() {
        if (this.selection.count() == 2) {
            let linkType = 'MetavizLinkBezier';

            // Special treat for Node Teleport (TODO make it universal)
            if (this.selection.nodes[0].constructor.name == 'MetavizNodeTeleport') {
                linkType = 'MetavizLinkSymlink';
                if (this.selection.nodes[0].links.get().length > 0) {
                    alert('Only one link for this node is allowed');
                    return;
                }
            }

            // Special treat for Node Collection (TODO make it universal)
            else if (this.selection.nodes[0].constructor.name == 'MetavizNodeCollection' || this.selection.nodes[1].constructor.name == 'MetavizNodeCollection') {
                linkType = 'MetavizLinkSymlink';
            }

            // Create link
            const link = metaviz.render.links.add({
                id: uuid(),
                type: linkType,
                start: this.selection.nodes[0],
                end: this.selection.nodes[1]
            });

            // Undo/Sync
            this.history.store({action: 'add', links: [link.serialize()]});
            this.selection.clear();

            // Re-render
            metaviz.render.layers.current.render();
            metaviz.render.layers.current.update();
        }
    }

    /**
     * Delete link
     */

    linkDeleteSelected(ask = true) {
        if (this.selection.count() == 2) {
            // Ask in modal window
            let confirmed = !ask;
            if (ask && confirm('Delete link?')) confirmed = true;
            if (confirmed) {
                // Find link
                const link = metaviz.render.links.get(this.selection.nodes[0], this.selection.nodes[1]);
                if (link) {
                    // Undo/Sync
                    this.history.store({action: 'del', links: [link.serialize()]});
                    // Delete
                    metaviz.render.links.del(link);
                    // Clear
                    this.selection.clear();
                    // Update
                    metaviz.render.layers.current.render();
                    metaviz.render.layers.current.update();
                }
            }
        }
    }

    /**
     * Create or Delete link
     */

    linkToggleSelected() {
        if (this.selection.count() == 2) {
            const link = metaviz.render.links.get(this.selection.nodes[0], this.selection.nodes[1]);
            if (link) this.linkDeleteSelected(false);
            else this.linkSelected();
        }
    }

    /** TRANSFORM *************************************************************************************************************/

    /**
     * Start drag selected nodes
     */

    dragSelectionStart() {

        /* Overriden by containers */

        // Cancel cage
        this.cage.resizeCancel();
        this.cage.hide();

        // Deselect
        window.clearSelection();

        // Update all nodes
        for (const node of this.selection.get()) {

            // Hide sockets
            node.sockets.hide();

            // Unlocked only
            if (!node.locked) {

                // Send signal to parent
                if (node.slot) node.parentNode.dragSelectionStart();

                // Add 'drag' class
                node.element.classList.add('drag');
            }
            else {
                node.animateIcon('<i class="fa-solid fa-lock"></i>');
            }

            // Cancel piemenu
            node.piemenu?.hide();
        }

    }

    /**
     * Drag selected nodes
     */

    dragSelectionMove() {

        // Selection offset
        this.selection.transform.update({x: this.transform.delta.x / metaviz.render.offset.z,
                                         y: this.transform.delta.y / metaviz.render.offset.z});

        // Update all nodes
        for (const node of this.selection.get()) {

            // Unlocked only
            if (!node.locked) {

                // Regular Node
                if (!node.slot) {
                    // Higher z-index and no events for a dragged objects
                    node.setStyle('z-index', 'var(--z-node-drag)');
                    node.setStyle('pointer-events', 'none');

                    // Move selected nodes
                    node.addPosition({x: this.transform.delta.x / metaviz.render.offset.z,
                                      y: this.transform.delta.y / metaviz.render.offset.z});

                    // Update position
                    node.update();
                    for (const linkNodeLink of node.links.get()) {
                        linkNodeLink.update();
                    }
                }

                // Node in slot
                else {
                    node.parentNode.dragSelectionMove();
                }

            }

        }

    }

    /**
     * Drop selected nodes
     */

    dragSelectionEnd() {

        // Dragged node returns to normal z-index and events
        for (const node of this.selection.get()) {

            // Unlocked only
            if (!node.locked) {

                // Remove drag class
                node.element.classList.remove('drag');

                // Snap to grid if enabled
                if (metaviz.config.snap.grid.enabled) {
                    node.setPosition(this.snapToGrid(node.transform.x, node.transform.y));
                    node.update();
                    node.links.update();
                }

                // Regular Node
                if (!node.slot) {
                    node.setStyle('pointer-events', 'auto');
                    node.setStyle('z-index', 'var(--z-node)');
                    node.edit(true);

                    // Update/Undo/Sync
                    if (this.selection.transform.total() != 0) {

                        // Update layer
                        const vnode = metaviz.render.layers.current.getNode(node.id);
                        const prev = {x: vnode.x, y: vnode.y};
                        vnode.x = node.transform.x;
                        vnode.y = node.transform.y;

                        // Sync to undo and server
                        this.history.store({
                            action: 'move',
                            nodes: [node.id],
                            position: {x: node.transform.x, y: node.transform.y},
                            positionPrev: {x: prev.x, y: prev.y}
                        });
                    }
                }

                // Node in slot
                else {
                    node.parentNode.dragSelectionEnd();
                }

            }

        }

    }

    /**
     * Undo selection to original position
     */

    dragSelectionCancel() {

        // Substract offset
        for (const node of this.selection.get()) {

            // Unlocked only
            if (!node.locked) {

                // Drag class
                node.element.classList.remove('drag');

                // Regular Node
                if (!node.slot) {
                    node.animated(true);
                    setTimeout(() => { node.animated(false) }, 1000);
                    node.subPosition(this.selection.transform.getOffset());
                    node.setStyle('pointer-events', 'auto');
                    node.setStyle('z-index', 'var(--z-node)');
                    node.edit(false);
                    node.update();
                }
                // Node in slot
                else {
                    node.parentNode.dragSelectionCancel();
                }

            }

        }

    }

    /**
     * Start dragging link
     */

    dragLinkStart() {
        // Start node
        const startNode = this.pointer.clicked;
        // Synthetic end node (which is cursor)
        const cursor = metaviz.render.screen2World(this.transform);
        const endNode = {
            transform: {
                x: cursor.x,
                y: cursor.y
            },
            sockets: {
                get: (coords) => {
                    return {
                        x: endNode.transform.x,
                        y: endNode.transform.y
                    }
                }
            },
            addLink: function(link) {}
        };
        // Create
        this.interaction.link = new registry.links['MetavizLinkBezier'].proto({start: startNode, end: endNode});
        startNode.addLink(this.interaction.link);
        metaviz.render.board.append(this.interaction.link.element);
    }

    /**
     * During dragging link
     */

    dragLinkMove() {
        if (this.interaction.link && this.interaction.link.end) {
            const cursor = metaviz.render.screen2World(this.transform);
            this.interaction.link.end.transform.x = cursor.x;
            this.interaction.link.end.transform.y = cursor.y;
            this.interaction.link.update();
        }
    }

    /**
     * Finish dragging link
     */

    dragLinkEnd(node) {

        // Attach to node (if not the same and has no link already)
        if (node && this.interaction.link.start.id != node.id && metaviz.render.links.get(this.interaction.link.start, node) == null) {

            // Add new link
            node.addLink(this.interaction.link);
            this.interaction.link.end = node;
            this.interaction.link.update();

            // History / send to server
            this.history.store({action: 'add', links: [this.interaction.link.serialize()]});

            // Store in renderer
            metaviz.render.links.list.push(this.interaction.link);

            // Add to current layer (if layer exist and link is freshly created in the editor)
            if (metaviz.render.layers.current && !metaviz.render.layers.current.getLink(this.interaction.link.id)) {
                metaviz.render.layers.current.setLink(this.interaction.link.serialize());
            }
        }

        // Cancel
        else {
            this.dragLinkCancel();
        }

        // Clear
        this.selection.clear();
    }

    /**
     * Cancel dragging link
     */

    dragLinkCancel() {
        this.interaction.link.start.delLink(this.interaction.link);
        this.interaction.link.element.remove();
        this.interaction.link = null;
    }

    /**
     * Start selection box drag
     */

    dragBoxStart(x, y) {
        this.selection.box.start(x, y);
        this.selection.box.show();
    }

    /**
     * Move selection box drag
     */

    dragBoxMove(x, y) {
        this.selection.box.end(x, y);
    }

    /**
     * End selection box drag
     */

    dragBoxEnd() {
        this.selection.box.intersection(metaviz.render.nodes.get());
        this.selection.box.hide();
    }

    /**
     * Cancel selection box drag
     */

    dragBoxCancel() {
    }

    /** ARRANGE ********************************************************************************************************************/

    /**
     * Arrange: Sort
     */

    arrangeSort() {
        if (!this.interaction.locked) {
            const nodes = this.selection.get();
            const positions = this.arrange.sort.arrange(nodes, this.arrange.settings);
            this.selection.clear();
            // Update nodes
            nodes.forEach((node, i) => {
                this.history.store({
                    action: 'move',
                    nodes: [node.id],
                    position: {x: positions[i].x, y: positions[i].y}
                });
                node.transform.x = positions[i].x;
                node.transform.y = positions[i].y;
            });
            metaviz.render.layers.update(nodes);
        }
    }

    /**
     * Arrange: Horizontal
     */

    arrangeHorizontal() {
        if (!this.interaction.locked) {
            this.arrange.align.arrange(this.selection.get(), {direction: 'horizontal', margin: this.arrange.settings.margin});
            this.selection.clear();
        }
    }

    /**
     * Arrange: Vertical
     */

    arrangeVertical() {
        if (!this.interaction.locked) {
            this.arrange.align.arrange(this.selection.get(), { direction: 'vertical', margin: this.arrange.settings.margin });
            this.selection.clear();
        }
    }

    /**
     * Arrange: z-sorting
     */

    arrangeZ(zindex) {
        for (const node of this.selection.get()) {
            node.setSortingZ(zindex);
            this.history.store({
                action: 'move',
                nodes: [node.id],
                zindex: zindex
            });
        }
    }

    /**
     * Arrange: Reset
     */

    arrangeReset() {
        if (!this.interaction.locked) {
            for (const node of this.selection.get()) {
                node.transform.clear();
                node.update();
                this.history.store({
                    action: 'move',
                    nodes: [node.id],
                    position: {x: 0, y: 0},
                    zindex: 0
                });
            }
            this.selection.clear();
        }
    }

    /** DIAGRAM PROJECT FILE ******************************************************************************************************/

    /**
     * Board ID
     */

    setBoardID(id) {
        this.id = id;
    }

    /**
     * Board name
     */

    setBoardName(text) {
        if (text) {
            this.name = text;
            document.title = this.name;
            // metaviz.render.container.dispatchEvent(new CustomEvent('update:projectname', { detail: text }));
            metaviz.events.call('update:projectname', text);
        }
    }

    getBoardName() {
        return this.name;
    }

    /**
     * Open diagram file
     */

    async open(boardID = null) {

        if (metaviz.system.features.nativeFileSystemApi) {

            // Lock interaction
            this.interaction.lock();
            // Open file dialog
            try {
                const handle = await window.showOpenFilePicker();
                if (handle.length) this.file.handle = handle[0];
            }
            catch(error) {
                logging.info(error);
            }
            if (this.file.handle) {

                // Get file data
                const f = await this.file.handle.getFile();

                // Parse json
                let json = null;
                try {
                    json = JSON.parse(await f.text());
                }
                catch(error) {
                    alert("Can't recognize Metaviz file.");
                }
                if (json) {

                    // Save handler in IndexedDB
                    //metaviz.storage.db.table['boards'].set({'id': json.id, 'handle': this.file.handle});

                    // Set ?board=<id> in URL
                    window.history.replaceState(null, null, metaviz.state.url.param('board').set(json.id));

                    // Decode
                    if (json.format == 'MetavizJSON')
                        metaviz.format.json.in.deserialize(json);
                    else if (json.format == 'MetavizStack')
                        metaviz.format.stack.in.deserialize(json);

                    // Create default layer
                    metaviz.render.layers.set('Base Layer');
                    metaviz.render.layers.current.update();

                    // Launch start
                    for (const node of metaviz.render.nodes.get()) node.start();

                    // Dispatch final event
                    metaviz.events.call('on:loaded');
                }
            }
            // Unlock interaction
            this.interaction.unlock();
        }
        else {
            alert('Native File System API not supported!');
        }
    }

    /**
     * Flush before save
     * hard: true = dump data & deselect all | false = soft dump data only without deselecting
     */

    flush(hard = true) {
        this.selection.get().forEach((node) => node.flush());
        if (hard) this.selection.clear();
    }

    /**
     * Save diagram file
     */

    save() {

        // Spinner
        this.busy();

        // Collect JSON data
        const json = metaviz.format.stack.out.serialize(this.history.get());

        // Save to disk using File System API
        if (this.file.handle) {
            this.saveLocalFile(json);
        }

        // Fallback: download file
        else {
            metaviz.transfer.download({data: json, name: 'metaviz-diagram.mv'});
            this.history.dirty = false;
            this.idle();
        }
    }

    /**
     * Save file
     */

    async saveLocalFile(data) {
        const writable = await this.file.handle.createWritable();
        await writable.write(data);
        await writable.close();
        this.history.dirty = false;
        this.idle();
    }

    /** VIEWPORT ******************************************************************************************************************/

    /**
     * Show busy spinner
     */

    busy() {
        metaviz.render.container.style.cursor = 'progress';
        this.spinner.style.fillOpacity = '1';
        this.spinner.style.display = 'block';
    }

    /**
     * Un-busy spinner
     */

    idle() {
        metaviz.render.container.style.cursor = 'default';
        this.spinner.style.fillOpacity = '0';
        setTimeout(() => { this.spinner.style.display = 'none'; }, 2000);
    }

    /**
     * Center view on node
     */

    centerNode(node, animated = false, select = false) {

        // Parent folder and Target node
        let parent = null;
        let nodeObj = null;

        // Get by string id
        if (typeof(node) == 'string') nodeObj = metaviz.render.nodes.get(node);
        // Node object
        else if (typeof(node) == 'object') nodeObj = node;

        // Clear
        this.selection.clear();
        this.menu.hide();

        metaviz.render.center(nodeObj.getPosition(), 'none', animated ? 'smooth' : 'hard');

        // Select centered node (optional)
        if (select) this.selection.add(nodeObj);

    }

    /**
     * Set current folder and node
     * state: {folder: <string id>}
     */

    render(state) {

        // Clear selection
        this.selection.clear();

        // Hide menu
        this.menu.hide();

        // Hide all nodes
        for (const node of metaviz.render.nodes.get()) {
            node.visible(false);
        }

        // Render
        metaviz.render.layers.current.render();

        // Force redraw
        metaviz.render.redraw();
    }

}
