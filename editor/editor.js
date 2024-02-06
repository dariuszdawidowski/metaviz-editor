/***************************************************************************************************
 *                                                                                                 *
 *         (\___/)            Metaviz Editor Interface                                             *
 *        -(o . o)-           Add, delete, move, copy, paste links and nodes.                      *
 *        (       )/\         MIT License                                                          *
 *        (_______)_/         (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/

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

            // Node waiting for chaining?
            chainNode: false,
            
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
                this.interaction.chainNode = false;
            }

        };

        // Selected nodes
        this.selection = new MetavizSelection();

        // Arranger
        this.arrange = {
            sort: typeof MetavizArrangeSort === 'function' ? new MetavizArrangeSort() : null,
            align: typeof MetavizArrangeSort === 'function' ? new MetavizArrangeAlign() : null,
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

        // Clipboard
        this.clipboard = new MetavizClipboardLegacy(metaviz.render.container);

        // File
        this.file = {

            // File System API handle
            handle: null,

            // Reset state
            clear: () => {
                this.file.handle = null;
            }
        };

        // Info bubble in the center of board
        this.info = document.createElement('div');
        this.info.classList.add('info-bubble');
        this.info.style.display = 'none';

        // Spinner
        this.spinner = document.getElementById(metaviz.container.spinnerID);

        // Focus on canvas
        metaviz.render.container.focus();

    }

    /** EVENTS *********************************************************************************************************************/

    initEvents() {

        // Viewer events
        super.initEvents();

        // Paste events
        this.initEditorCopyPasteEvents();

        // System drag&drop files
        this.initEditorDropEvents();

        // Editor leave events
        this.initEditorLeaveEvents();

        // Open context menu
        this.initEditorMenuEvents();
    }

    /**
     * Copy/Paste data
     */

    initEditorCopyPasteEvents() {

        // Copy
        metaviz.events.subscribe('editor:copy', document, 'copy', async (event) => {
            this.copy();
        });

        // Paste
        metaviz.events.subscribe('editor:paste', document, 'paste', async (event) => {
            this.paste(event);
        });

    }

    /**
     * Drop external text/image/file
     */

    initEditorDropEvents() {

        metaviz.events.subscribe('editor:dragover', metaviz.render.container, 'dragover', (event) => {
            // Needed for takeovering drop event
            event.preventDefault();
        });

        metaviz.events.subscribe('editor:drop', metaviz.render.container, 'drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.drop(event);
        });

        // Stack offset for dropping multiple items
        this.stack = {
            x: 0,
            y: 0,
            add: function(pixels) {
                this.x += pixels;
                this.y += pixels;
            },
            get: function(offset) {
                return {x: offset.x + this.x, y: offset.y + this.y};
            },
            clear: function() {
                this.x = 0;
                this.y = 0;
            }
        };
    }

    /**
     * Close window and pointer out
     */

    initEditorLeaveEvents() {

        // Prevent closing window/tab
        metaviz.events.subscribe('window:close', window, 'beforeunload', (event) => {
            if ('db' in metaviz.storage) metaviz.storage.db.close();
            this.flush(true);
            const confirmationMessage = '\o/';
            if (this.history.isDirty()) {
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

                // Clear keyboard
                this.keyboard.key.clear();

                // Clear selection box
                this.dragBoxCancel();

                // Clear drag nodes
                if (this.interaction.mode == 'drag' && this.interaction.object == 'node') {
                    this.dragSelectionCancel();
                    this.interaction.mode = 'idle';
                    this.interaction.object = null;
                }

                // Clear blossoming
                else if (this.interaction.mode == 'drag' && this.interaction.object == 'blossom') {
                    this.dragBlossomCancel();
                    this.interaction.mode = 'idle';
                    this.interaction.object = null;
                }

                // Clear drag link
                else if (this.interaction.mode == 'drag' && this.interaction.object == 'socket' && this.interaction.link) {
                    this.dragLinkCancel();
                }

                // Flush
                this.flush(false);
            }
        });

    }

    /**
     * Open menu
     */

    initEditorMenuEvents() {

        metaviz.events.subscribe('editor:menu', metaviz.render.container, 'contextmenu', (event) => {

            // Prevent default context menu
            event.preventDefault();
            event.stopPropagation();

            // Open menu
            this.menu.show({x: event.clientX, y: event.clientY, target: event.target});

        });

    }

    /** START **********************************************************************************************************************/

    /**
     * Run after self-creation
     */

    start() {
        /*** Overload ***/
    }

    /** NODES **********************************************************************************************************************/

    /**
     * Create node
     * nodeType: <string> class name
     * transform: {x: ..., y: ...}
     */

    nodeAdd(nodeType, transform) {

        // Position
        let position = metaviz.render.screen2World(transform);
        if (metaviz.config.snap.grid.enabled) position = this.snapToGrid(position.x, position.y);

        // Create node
        const newNode = metaviz.render.nodes.add({id: crypto.randomUUID(), parent: metaviz.render.nodes.parent, type: nodeType, ...position});

        // Update
        newNode.render();
        newNode.update();
        newNode.start();

        // Store
        this.history.clearFuture();
        this.history.store({action: 'add', nodes: [newNode.serialize('transform')]});

        // Link if node chaining is active
        if (this.interaction.chainNode) {
            this.dragLinkEnd(newNode);
            this.interaction.clear();
        }

        // Show info
        this.checkEmpty();
    }

    /**
     * Delete selected node(s)
     */

    nodeDeleteSelected() {
        if (this.selection.count() > 0) {
            this.nodeDelete(this.selection.get(), true);
            this.selection.clear();
            this.checkEmpty();
        }
    }

    /**
     * Delete selected node(s) without confirm
     */

    nodeDeleteSelectedInstantly() {
        if (this.selection.count() > 0) {
            this.nodeDelete(this.selection.get(), false);
            this.selection.clear();
            this.checkEmpty();
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

            // Collect
            const allNodes = list.flatMap(node => node.getTree());
            const nodes = allNodes.filter(node => !node.locked.delete);
            const links = [...new Set(nodes.flatMap(node => node.links.get('out').map(link => link.serialize())).map(item => item.id))].map(linkId => metaviz.render.links.get(linkId).serialize());

            // Undo/Sync
            this.history.store({
                action: 'del',
                nodes: nodes.map(node => node.serialize('transform')),
                links: links
            });

            // Delete
            for (const node of allNodes) {
                if (!node.locked.delete) {
                    metaviz.render.nodes.del(node);
                }
                else {
                    node.animateIcon('🔒');
                }
            }

        }

        // Check empty board
        this.checkEmpty();
    }

    /**
     * Calculate snapping node to virtual grid
     */

    snapToGrid(x, y, width = 16) {
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

            const link = metaviz.render.links.add({
                type: 'MetavizLinkBezier',
                start: this.selection.nodes[0].id,
                end: this.selection.nodes[1].id
            });

            // Undo/Sync
            this.history.store({action: 'add', links: [link.serialize()]});
            this.selection.clear();

            // Re-render
            this.update()
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
                    this.update();
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
            if (!node.locked.move) {

                // Send signal to parent
                if (node.slot) node.parentNode.dragSelectionStart();

                // Add 'drag' class
                node.element.classList.add('drag');

                // Store position for undo
                node.transform.prev.store();
            }
            else {
                node.animateIcon('🔒');
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
            if (!node.locked.move) {

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
                    for (const linkNodeLink of node.links.get('*')) {
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
     * parent: node dropped on
     */

    dragSelectionEnd(parent = null) {

        // Dropped on parent
        let mounted = false;
        if (parent) {
            // Unparent
            if (parent == 'unChildren') {
                this.selection.getFocused().parentNode.unChildren(this.selection.get().filter(node => !node.locked.move));
            }
            // Parent to other node
            else {
                mounted = parent.setChildren(this.selection.get().filter(node => !node.locked.move));
            }
        }

        // Dropped on board
        if (!mounted) {

            // Dragged node returns to normal z-index and events
            for (const node of this.selection.get()) {

                // Unlocked only
                if (!node.locked.move) {

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

                            // Sync to undo
                            this.history.store({
                                action: 'move',
                                nodes: [node.id],
                                position: {x: node.transform.x, y: node.transform.y},
                                positionPrev: {x: node.transform.prev.x, y: node.transform.prev.y}
                            });
                        }
                    }

                    // Node in slot
                    else {
                        node.parentNode.dragSelectionEnd();
                    }

                }

            }

            // Show cage again
            this.cage.show();

        }

    }

    /**
     * Undo selection to original position
     */

    dragSelectionCancel() {

        // Substract offset
        for (const node of this.selection.get()) {

            // Unlocked only
            if (!node.locked.move) {

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

        // Clear selection
        this.selection.clear();

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
            links: {
                add: (node) => {}
            },
            sockets: {
                get: (coords) => {
                    return {
                        x: endNode.transform.x,
                        y: endNode.transform.y
                    }
                }
            },
        };

        // Create
        this.interaction.link = new global.registry.links['MetavizLinkBezier'].proto({start: startNode, end: endNode});
        startNode.links.add(this.interaction.link);
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
            node.links.add(this.interaction.link);
            this.interaction.link.end = node;
            this.interaction.link.update();

            // History / send to server
            this.history.store({action: 'add', links: [this.interaction.link.serialize()]});

            // Store in renderer
            metaviz.render.links.list.push(this.interaction.link);

            // Broadcast creation event
            const event = new CustomEvent('broadcast:addlink', { detail: this.interaction.link });
            metaviz.render.container.dispatchEvent(event);
        }

        // Dropped on board: Open Menu
        else {
            this.interaction.chainNode = true;
            this.menu.show({target: document.querySelector('#metviz-diagram'), x: this.transform.x, y: this.transform.y});
        }

        // Clear
        this.selection.clear();
    }

    /**
     * Cancel dragging link
     */

    dragLinkCancel() {
        this.interaction.link.start.links.del(this.interaction.link);
        this.interaction.link.element.remove();
        this.interaction.clear();
    }

    /**
     * Start blossoming
     */

    dragBlossomStart() {
        // Start node
        const startNode = this.pointer.clicked;

        // End node
        const cursor = metaviz.render.screen2World(this.transform);
        const endNode = metaviz.render.nodes.add({
            id: crypto.randomUUID(),
            parent: metaviz.render.nodes.parent,
            type: startNode.constructor.name,
            ...cursor
        });
        endNode.render();
        endNode.update();
        endNode.start();

        // Create link
        this.interaction.link = new global.registry.links['MetavizLinkBezier'].proto({start: startNode, end: endNode});
        startNode.links.add(this.interaction.link);
        metaviz.render.board.append(this.interaction.link.element);

        // Deselect start, select end
        this.selection.clear();
        this.selection.add(endNode);
        this.cage.hide();
        startNode.sockets.hide();
        endNode.sockets.hide();
    }

    /**
     * During blossoming
     */

    dragBlossomMove() {
        this.dragSelectionMove();
    }

    /**
     * Finish blossoming
     */

    dragBlossomEnd(node) {

        // Store Node
        this.history.store({action: 'add', nodes: [this.selection.get()[0].serialize('transform')]});

        // End Node
        this.dragSelectionEnd();

        // Store Link
        this.history.store({action: 'add', links: [this.interaction.link.serialize()]});

        // Store in renderer
        metaviz.render.links.list.push(this.interaction.link);

        // Broadcast creation event
        const event = new CustomEvent('broadcast:addlink', { detail: this.interaction.link });
        metaviz.render.container.dispatchEvent(event);

        // Clear
        this.selection.clear();
    }

    /**
     * Cancel blossoming
     */

    dragBlossomCancel() {
        const endNode = this.interaction.link.end;

        // Delete link
        this.interaction.link.start.links.del(this.interaction.link);
        this.interaction.link.element.remove();
        this.interaction.clear();

        // Delete node
        metaviz.render.nodes.del(endNode);
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
        this.selection.box.intersection(metaviz.render.nodes.get('*'));
        this.selection.box.hide();
    }

    /**
     * Cancel selection box drag
     */

    dragBoxCancel() {
        this.selection.box.clear();
        this.selection.box.hide();
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
                node.setPosition({x: positions[i].x, y: positions[i].y});
                node.update();
            });
            this.update();
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

    /** CLIPBOARD ******************************************************************************************************************/

    /**
     * Copy
     */

    async copy(nodes = this.selection.get()) {

        // Disable event to avoid of recursive loop
        metaviz.events.disable('editor:copy');

        let copy = 'json';
        let data = null;
        let html = null;

        // Any nodes selected?
        if (this.selection.count() > 0) {

            // If currently editing text and text is selected then copy raw text not node json
            const control = this.selection.getFocused().getEditingControl();
            if (control) {
                html = control.getSelection('html');
                data = html.stripHTML('formatted');
                if (data) copy = 'text';
            }

            // Copy inner contents (RAW)
            if (copy == 'text') {
                this.copyText(this.selection.getFocused(), data, html);
            }

            // Copy node(s) if no selected text (MetavizJSON)
            else if (copy == 'json') {
                this.copyJson(this.selection.get());
            }
        }

        // Enable event back
        metaviz.events.enable('editor:copy');
    }

    /**
     * Copy pure text
     * node: parent node
     * data: plain text data
     * html: same data but html formatted
     */

    async copyText(node, data, html) {

        // Copy to clipboard
        if (metaviz.system.features.clipboardApi) {
            await navigator.clipboard.writeText(data);
            this.clipboard.set(null, {html: html});
        }

        // Legacy version needs copy in internal clipboard
        else {
            this.clipboard.set(data, {html: html});
        }

        // Store copy history
        metaviz.events.call('update:clipboard', {data: data, miniature: node.export('miniature')});
    }

    /**
     * Copy node JSON
     * nodes: [MetavizNodeX, ...]
     */

    async copyJson(nodes) {

        // If any nodes
        if (nodes.length) {

            // Serialize JSON
            const json = metaviz.format.serialize('text/metaviz+json', nodes);

            // Reset base ID and layer ID
            json.id = 0;
            json.layers[0].id = 0;

            // Reset name
            json.name = '';

            // Correct center
            const bounds = this.arrange.align.getBounds(json.layers[0].nodes);
            for (let i = 0; i < json.layers[0].nodes.length; i ++) {
                json.layers[0].nodes[i].x -= bounds.center.x;
                json.layers[0].nodes[i].y -= bounds.center.y;
            }

            // Clear history
            if ('undo' in json) delete json['undo'];

            // Copy to clipboard
            const data = JSON.stringify(json);

            // New Clipboard API (checking readText is ok because FF supports writeText only but should use legacy version)
            if (metaviz.system.features.clipboardApi) {
                await navigator.clipboard.writeText(data);
            }
            
            // Legacy version needs copy in internal clipboard
            else {
                await this.clipboard.set(data);
            }

            // Store copy history
            metaviz.events.call('update:clipboard', {data: data, miniature: nodes[0].export('miniature')});

        }

    }

    /**
     * Cut
     */

    cut(nodes = this.selection.get()) {
        this.copy(nodes);
        this.nodeDeleteSelectedInstantly();
    }

    /**
     * Paste
     */

    async paste(event = false, offset = null) {

        // Table of sent items {'size:type': <bool sent>, ...}
        const items = {};

        // Compute offset (if present then it comes from Duplicate Node):
        if (!offset) {
            // From system event (CTRL/CMD+V)
            if (event) offset = metaviz.render.screen2World({x: this.transform.x, y: this.transform.y});
            // From internal clipboard (Menu Paste)
            else offset = metaviz.render.screen2World(this.menu.position());
        }

        // Text (Clipboard API)
        if (metaviz.system.features.clipboardApi) {
            const text = await navigator.clipboard.readText();
            if (text != '') {
                // If not sent anything yet
                if (Object.keys(items).length == 0) {
                    metaviz.exchange.uploadText(text, offset);
                }
            }

        }

        // Text (Legacy clipboard)
        else {

            // Paste from system event (CTRL+V)
            if (event) {
                for (const item of event.clipboardData.items) {
                    if (item.kind == 'string' && item.type == 'text/plain') {
                        item.getAsString((text) => {
                            metaviz.exchange.uploadText(text, offset);
                        });
                    }
                }
            }

            // Paste from internal clipboard (menu copy or duplicate)
            else {
                metaviz.exchange.uploadText(this.clipboard.get(), offset);
            }

        }

    }

    /**
     * Duplicate
     */

    async duplicate() {
        await this.copy();
        const bounds = this.arrange.align.getBounds(this.selection.get());
        await this.paste(false, {x: bounds.right + 20, y: bounds.bottom + 20});
    }

    /** DROP SYSTEM ITEM/FILE ******************************************************************************************************/

    /**
     * Mouse drag & drop item (text) from OS to browser
     */

    drop(event) {

        // Dropped position
        const offset = metaviz.render.screen2World({x: event.clientX, y: event.clientY});

        // Collide with exising node?
        const collision = metaviz.render.nodes.get(event.target)

        // Start stack
        this.stack.clear();

        // Items
        for (const item of event.dataTransfer.items) {

            // Text
            if (item.type == 'text/plain') {
                item.getAsString((text) => {
                    metaviz.exchange.uploadText(text, offset);
                });
            }
        }

        // Files
        for (const file of event.dataTransfer.files) {

            // File or Image
            metaviz.exchange.uploadFile(file, this.stack.get(offset), collision);

            // Add to stack
            this.stack.add(40);
        }

    }

    /** BOARD PROJECT FILE ********************************************************************************************************/

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
        this.name = text;
        document.title = this.name;
        metaviz.events.call('update:boardname', text);
    }

    randomBoardName() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = today.getMonth() + 1;
        const dd = today.getDate();
        const startRange = 0x1F600;
        const endRange = 0x1F64F;
        const emoji = String.fromCodePoint(Math.floor(Math.random() * (endRange - startRange + 1) + startRange));
        this.setBoardName(`Board-${yyyy}-${mm < 10 ? '0' : ''}${mm}-${dd < 10 ? '0' : ''}${dd} ${emoji}`);
    }

    getBoardName() {
        return this.name;
    }

    /**
     * New board
     */

    new() {
        // Clear selection
        this.selection.clear();
        // Interaction
        this.interaction.clear();
        // Loaded file
        this.file.clear();
        // History
        this.history.clear();
        // Clipboard
        this.clipboard.clear();
        // Clear DOM on board
        metaviz.render.clear();
        // Centre board
        metaviz.render.center();
        // Generate new board ID
        this.id = crypto.randomUUID();
        // Generate name
        this.randomBoardName();
        // Empty info
        this.checkEmpty();
    }

    /**
     * Open board file
     */

    async open(boardID = null) {

        if (metaviz.system.features.nativeFileSystemApi) {

            // Reset if already something is open
            this.new();

            // Lock interaction
            this.interaction.lock();

            // If not boardID: open file dialog
            if (!boardID) {
                try {
                    const handle = await window.showOpenFilePicker({
                        types: [{
                                description: 'Metaviz file .mv/.xml',
                                accept: {
                                    'text/metaviz+json': ['.mv'],
                                    'text/mvstack+xml': ['.xml']
                                },
                            },
                        ],
                        excludeAcceptAllOption: true,
                        multiple: false,
                    });
                    if (handle.length) this.file.handle = handle[0];
                }
                catch(error) {
                    logging.info(error);
                }
            }

            // Or open file from stored handler
            else {
                const record = await metaviz.storage.db.table['boards'].get({'id': boardID});
                const allow = await this.grantFile(record);
                if (allow) this.file.handle = record.handle;
            }

            // Open file
            if (this.file.handle) {

                // Get file data
                const f = await this.file.handle.getFile();
                const text = await f.text();

                // JSON
                if (text[0] == '{') {
                    let json = null;
                    try {
                        json = JSON.parse(text);
                    }
                    catch(error) {
                        alert("Can't recognize Metaviz json file.");
                    }
                    if (json) {

                        // Save handler in IndexedDB
                        metaviz.storage.db.table['boards'].put({'id': json.id, 'name': json.name, 'handle': this.file.handle});
                        metaviz.storage.db.table['boards'].set({'id': json_id, 'timestamp': new Date().getTime()});

                        // Set ?board=<id> in URL
                        window.history.replaceState(null, null, metaviz.state.url.param('board').set(json.id));

                        // Decode
                        if (json.format == 'MetavizJSON')
                            metaviz.format.deserialize('text/metaviz+json', json);

                        // Empty folder?
                        this.checkEmpty();

                        // Centre
                        metaviz.render.focusBounds();

                        // Launch start
                        for (const node of metaviz.render.nodes.get('*')) node.start();

                        // Dispatch final event
                        metaviz.events.call('on:loaded');
                    }
                }

                // XML
                else if (text.substring(0, 4) == '<mv>') {
                    const parser = new DOMParser();
                    let xml = null;
                    try {
                        xml = parser.parseFromString(text, 'text/xml');
                    }
                    catch(error) {
                        alert("Can't recognize Metaviz xml file.");
                    }
                    if (xml) {

                        const xml_id = xml.querySelector('mv > id').textContent;
                        const xml_name = xml.querySelector('mv > name').textContent;

                        // Save handler in IndexedDB
                        metaviz.storage.db.table['boards'].put({'id': xml_id, 'name': xml_name, 'handle': this.file.handle});
                        metaviz.storage.db.table['boards'].set({'id': xml_id, 'timestamp': new Date().getTime()});

                        // Set ?board=<id> in URL
                        window.history.replaceState(null, null, metaviz.state.url.param('board').set(xml_id));

                        // Decode
                        if (xml.querySelector('mv > format').textContent == 'MetavizStack')
                            metaviz.format.deserialize('text/mvstack+xml', xml);
    
                        // Empty folder?
                        this.checkEmpty();

                        // Centre
                        metaviz.render.focusBounds();

                        // Launch start
                        for (const node of metaviz.render.nodes.get('*')) node.start();

                        // Dispatch final event
                        metaviz.events.call('on:loaded');
                    }
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
        const json = metaviz.format.serialize('text/mvstack+xml', this.history.get());

        // Save to disk using File System API
        if (this.file.handle) {
            this.saveLocalFile(json);
        }

        // Fallback: download file
        else {
            metaviz.exchange.downloadFile({data: json, name: `${this.getBoardName().slug()}.mv`});
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

    /**
     * Export diagram file
     */

    export(format) {
        const nodes = this.selection.count() ? this.selection.get() : metaviz.render.nodes.get('*').filter(node => node.parent == metaviz.render.nodes.parent);
        const svg = metaviz.format.serialize('image/svg+xml', nodes);
        metaviz.exchange.downloadFile({data: svg, name: `${this.getBoardName().slug()}.svg`});
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

    centerNode(args) {

        const { node = null, animated = false, select = false, zoom = false } = args;

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
        
        // Reset zoom
        if (zoom) metaviz.render.centerZoom();

        // Center
        metaviz.render.center(nodeObj.getPosition(), 'none', animated ? 'smooth' : 'hard');

        // Select centered node (optional)
        if (select) this.selection.add(nodeObj);

    }

    /**
     * Get view dimensions
     */

    getDimensions() {
        const dim = metaviz.render.container.getBoundingClientRect();
        return {x: dim.x, y: dim.y, width: dim.width, height: dim.height, margin: {left: 0, right: 0, top: 0, bottom: 0}};
    }

    /** INFO BUBBLE ***************************************************************************************************************/

    /**
     * Show empty board/folder information
     * @param icon: icon to display
     * @param text: html to display || element: html to display
     */

    showInfoBubble(args) {
        if (!metaviz.render.board.querySelector('.info-bubble')) metaviz.render.board.append(this.info);
        this.info.innerHTML = `<span style="font-size: 20px; margin: 12px 24px 12px 12px">${args.icon}</span> ${args.text}`;
        this.info.style.display = 'flex';
    }

    hideInfoBubble() {
        this.info.style.display = 'none';
    }

    /**
     * Show cookie bar
     * @param text: html to display
     * @param position: 'bottom-left' | 'bottom-center' (default) | 'bottom-right'
     */

    showCookieBubble(args) {
        const { text = '', position = 'bottom-center' } = args;
        const element = document.createElement('div');
        element.classList.add('cookie-bubble');
        element.innerHTML = text;
        const x = document.createElement('div');
        x.classList.add('x');
        x.innerHTML = '&#215;';
        x.addEventListener('click', () => { element.remove(); });
        element.append(x);
        document.body.append(element);
        const transform = element.getBoundingClientRect();
        if (position == 'bottom-left') {
            element.style.left = '0px';
            element.style.bottom = '0px';
        }
        else if (position == 'bottom-center') {
            element.style.left = `calc(50% - ${transform.width / 2}px)`;
            element.style.bottom = '0px';
        }
        else if (position == 'bottom-right') {
            element.style.right = '0px';
            element.style.bottom = '0px';
        }
    }

    /**
     * Check if board/folder is empty
     */

    isEmpty() {
        // Obviously empty
        if (metaviz.render.nodes.list.length == 0) return true;
        // Search in current parent
        for (const node of metaviz.render.nodes.get('*')) if (node.parent == metaviz.render.nodes.parent) return false;
        // Empty
        return true;
    }

    /**
     * Check if board/folder is empty and show/hide info
     */

    async checkEmpty() {
        if (this.isEmpty()) {

            const emojis = ['🎈', '🧨', '👓', '🧸', '🔔', '💡', '📐', '😎', '🙄', '🤠', '🙈', '🙉', '🙊', '🐸', '🐧', '🐌', '⚡', '💥', '🛸', '✨', '🎀', '💻', '😺', '🤖', '👾', '🐯', '🦊', '🐻', '🐨', '🐲', '🐳', '🐉'];
            let emoji = emojis[Math.randomRangeInt(0, emojis.length - 1)];
            let message = '';

            // File from URL ?board=...
            const params = window.location.search.uriToDict();
            if (metaviz.agent.db == 'file' && 'board' in params) {
                const recent = await this.checkFile(params['board']);
                emoji = '💾';
                if (recent != '') message =
                    '<div>' +
                        '<div style="">' +
                            '<span id="info-bubble-recent-files">' + recent + '</span>' +
                        '</div>' +
                    '</div>';
                else message =
                    '<div>' +
                        _('This is empty board') +
                    '</div>'
            }

            // Info about empty board with recent files
            else if (metaviz.agent.db == 'file' && metaviz.render.nodes.parent == null) {
                const recent = await this.checkRecentFiles();
                if (recent != '') message =
                    '<div>' +
                        '<div style="padding: 15px 0 5px 5px">' +
                            _('This is empty board') +
                        '</div>' +
                        '<div style="padding: 5px 0 15px 5px">' +
                            '<span id="info-bubble-recent-files">' + recent + '</span>' +
                        '</div>' +
                    '</div>'
                else message =
                    '<div>' +
                        _('This is empty board') +
                    '</div>'
            }

            // Info about empty folder
            else if (metaviz.render.nodes.parent != null) {
                message = _('This is empty folder');
            }

            // Show bubble
            this.showInfoBubble({
                icon: emoji,
                text: message
            });
        }
        else {
            this.hideInfoBubble();
        }
    }

    /** FILES *********************************************************************************************************************/

    /**
     * Check recent files
     */

    async checkRecentFiles() {
        let buffer = '';
        const records = await metaviz.storage.db.table['boards'].get('*');
        if (records.length) {
            records.sort((a, b) => b.timestamp - a.timestamp);
            buffer += `${_('Recent files')}: `;
            for (let i = 0; i < Math.min(records.length, 3); i ++) {
                const board = records[i];
                buffer += `<span class="file" onclick="metaviz.editor.open('${board.id}')">💾 ${board.name || board.handle.name}</span>`;
            }
        }
        return buffer;
    }

    /**
     * Check file from ?board=...
     */

    async checkFile(boardID) {
        let buffer = '';
        const board = await metaviz.storage.db.table['boards'].get({id: boardID});
        if (board) {
            buffer += `<span class="file" onclick="metaviz.editor.open('${board.id}')">${_('Click here to open file')}: ${board.name || board.handle.name}</span>`;
        }
        return buffer;
    }

    /**
     * Check and optionally ask about file access permission
     */

    async grantFile(record) {
        const options = {mode: 'readwrite'};

        // Check stored permission in IndexedDB.
        // if ('permission' in record && record.permission == true) {
        //     return true;
        // }

        // Check stored permission in handle.
        if ((await record.handle.queryPermission(options)) === 'granted') {
            return true;
        }

        // Request permission. If the user grants permission, return true.
        if ((await record.handle.requestPermission(options)) === 'granted') {
            // metaviz.storage.db.table['boards'].set({'id': record.id, 'permission': true});
            return true;
        }

        // The user didn't grant permission, so return false.
        return false;
    }

    /** RENDER ********************************************************************************************************************/

    /**
     * Set current folder and node
     */

    render() {

        // Clear selection
        this.selection.clear();

        // Hide menu
        this.menu.hide();

        // Hide all nodes
        for (const node of metaviz.render.nodes.get('*')) {
            node.visible(false);
        }

        // Force redraw
        metaviz.render.redraw();
    }

    /**
     * Refresh view
     */

    update() {
        /* Overload */
    }

}
