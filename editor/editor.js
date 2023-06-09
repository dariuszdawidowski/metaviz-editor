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

        // Clipboard
        this.clipboard = new MetavizClipboard(metaviz.render.container);

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
        metaviz.events.subscribe('editor:copy', document, 'copy', (event) => {
            this.copy();
        });

        // Paste
        metaviz.events.subscribe('editor:paste', document, 'paste', (event) => {
            this.paste(event);
        });

    }

    /**
     * Close window and pointer out
     */

    initEditorLeaveEvents() {

        // Prevent closing window/tab
        metaviz.events.subscribe('window:close', window, 'beforeunload', (event) => {
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
                this.selection.box.clear();
                this.selection.box.hide();
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
        /*** Overload ***/
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
        const newNode = metaviz.render.nodes.add({id: crypto.randomUUID(), parent: metaviz.render.nodes.parent, type: nodeType, ...position});
        newNode.render();
        newNode.update();
        newNode.start();
        this.history.clearFuture();
        this.history.store({action: 'add', nodes: [newNode.serialize('transform')]});
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
            // Delete
            const nodesTree = list.flatMap(node => { return node.getTree(); });
            const nodes = nodesTree.map(node => { return node.serialize('transform'); });
            const links = [...new Set(nodesTree.flatMap(node => node.links.get('out').map(link => link.serialize())).map(item => item.id))].map(linkId => metaviz.render.links.get(linkId).serialize());

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
        }
        this.checkEmpty();
    }

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
            if (!node.locked) {

                // Send signal to parent
                if (node.slot) node.parentNode.dragSelectionStart();

                // Add 'drag' class
                node.element.classList.add('drag');

                // Store position for undo
                node.transform.prev.store();
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

        }

        // Show cage again
        this.cage.show();

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
        this.interaction.link = new registry.links['MetavizLinkBezier'].proto({start: startNode, end: endNode});
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
        this.interaction.link.start.links.del(this.interaction.link);
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
        this.selection.box.intersection(metaviz.render.nodes.get('*'));
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

    copy(nodes = this.selection.get()) {

        // Disable event to avoid of recursive loop
        metaviz.events.disable('editor:copy');

        let copy = 'json';
        let data = null;

        // Any nodes selected?
        if (this.selection.get().length > 0) {

            // If currently editing text and text is selected then copy raw text not node json
            const control = this.selection.getFocused().getEditingControl();
            if (control) {
                data = control.getSelection();
                if (data) copy = 'text';
            }

            // Copy inner contents (RAW)
            if (copy == 'text') {
                this.copyRaw(this.selection.getFocused(), data);
            }

            // Copy node(s) if no selected text (MetavizJSON)
            else if (copy == 'json') this.copyJson(this.selection.get());
        }

        // Enable event back
        metaviz.events.enable('editor:copy');
    }

    /**
     * Copy pure text
     */

    copyRaw(node, data) {

        // Copy to clipboard
        this.clipboard.set(data, node.miniature());

        // Enable event back
        metaviz.events.enable('editor:copy');

    }

    /**
     * Copy node JSON
     * nodes: [MetavizNodeX, ...]
     */

    copyJson(nodes) {

        // If any nodes
        if (nodes.length) {

            // Serialize JSON
            const json = metaviz.format.serialize('text/metaviz+json', nodes);

            // Reset layer ID
            json.layers[0].id = 0;

            // Correct center
            const bounds = this.arrange.align.getBounds(json.layers[0].nodes);
            for (let i = 0; i < json.layers[0].nodes.length; i ++) {
                json.layers[0].nodes[i].x -= bounds.center.x;
                json.layers[0].nodes[i].y -= bounds.center.y;
            }

            // Copy to clipboard
            this.clipboard.set(JSON.stringify(json), nodes[0].miniature());

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

    paste(event = false, offset = null) {

        // Paste from system event (CTRL+V)
        if (event) {
            metaviz.exchange.paste(event.clipboardData, metaviz.render.screen2World({x: this.transform.x, y: this.transform.y}));
        }

        // Paste from internal clipboard (menu copy or duplicate)
        else {
            if (!offset) offset = metaviz.render.screen2World(this.menu.position());
            metaviz.exchange.item(this.clipboard.get(), offset);
        }

    }

    /**
     * Duplicate
     */

    duplicate() {
        this.copy();
        const bounds = this.arrange.align.getBounds(this.selection.get());
        this.paste(false, {x: bounds.right + 20, y: bounds.bottom + 20});
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
        metaviz.events.call('update:projectname', text);
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
        // Reset board name
        this.setBoardName('');
        // Generate new board ID
        this.id = crypto.randomUUID();
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
                        //metaviz.storage.db.table['boards'].set({'id': json.id, 'handle': this.file.handle});

                        // Set ?board=<id> in URL
                        //window.history.replaceState(null, null, metaviz.state.url.param('board').set(json.id));

                        // Decode
                        if (json.format == 'MetavizJSON')
                            metaviz.format.deserialize('text/metaviz+json', json);

                        // Empty folder?
                        metaviz.editor.checkEmpty();

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

                        // Decode
                        if (xml.querySelector('mv > format').textContent == 'MetavizStack')
                            metaviz.format.deserialize('text/mvstack+xml', xml);
    
                        // Empty folder?
                        metaviz.editor.checkEmpty();

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
            metaviz.exchange.download({data: json, name: 'metaviz-diagram.mv'});
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
     * Show empty board/folder information
     */

    showInfoBubble(icon, msg) {
        if (!metaviz.render.board.querySelector('.info-bubble')) metaviz.render.board.append(this.info);
        this.info.innerHTML = `<span style="font-size: 20px; margin-right: 12px">${icon}</span> ${msg}`;
        this.info.style.display = 'flex';
    }

    hideInfoBubble() {
        this.info.style.display = 'none';
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

    checkEmpty() {
        if (this.isEmpty()) {
            const emojis = ['🎈', '🧨', '👓', '🧸', '🔔', '💡', '📐', '😎', '🙄', '🤠', '🙈', '🙉', '🙊', '🐸', '🐧', '🐌', '⚡', '💥'];
            this.showInfoBubble(
                emojis[Math.randomRangeInt(0, emojis.length - 1)],
                `This is empty ${metaviz.render.nodes.parent ? 'folder' : 'board'} - click &nbsp;<b>Right Mouse Button &rarr; Add Node</b>&nbsp; to start...`
            );
        }
        else {
            this.hideInfoBubble();
        }
    }

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
