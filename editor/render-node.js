/***************************************************************************************************
 *                    _                                                                            *
 *                  _( )_     Metaviz Node (Editor)                                                *
 *      |\_/|      (_)@(_)    Extended node functionality.                                         *
 *     -(o.o)-      /(_)      MIT License                                                          *
 *      _(_)_    \\//         (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/

class MetavizNode extends TotalDiagramNode {

    /**
     * Constructor
     */

    constructor(args) {
 
        super(args);

        // Class
        this.element.classList.add('metaviz-node');

        // Folder or slot parent node (ID)
        this.parent = 'parent' in args ? args.parent : null;

        // This node is container
        this.container = false;

        // Parent as object reference MetavizNode
        this.parentNode = null;

        // Meta data
        this.params = args.params ?? {};
        // Setter and getter
        this.params.set = function(key, value) { this[key] = value; };
        this.params.get = function(key) { return this[key]; };

        // Slot name (string)
        this.slot = 'params' in args && 'slot' in args.params ? args.params.slot : null;

        // Extend transform
        this.transform.resize = 'ratio';
        this.transform.prev = {
            x: 0,
            y: 0,
            store: () => {
                this.transform.prev.x = this.transform.x;
                this.transform.prev.y = this.transform.y;
            }
        };

        // Sockets
        this.sockets = {

            list: [], // [MetavizSocket, ...]

            /**
             * Add and assign
             * socket: <MetavizSocket> with local position transform: {x: <Number>, y: <Number>}
             */

            add: (socket) => {
                this.sockets.list.push(socket);
            },

            /**
             * Unassign
             * socket: <MetavizSocket>
             */

            del: (socket) => {
                socket.destructor();
                //this.sockets.list.remove(socket);
                arrayRemove(this.sockets.list, remove);
            },

            /**
             * Get socket(s)
             * no options for get all list
             * transform: find socket closest to given transform {x: <Number>, y: <Number>}
             */

            get: (transform = null) => {
                // Whole list
                if (transform === null) return this.sockets.list;

                // Find socket closest to given transform
                else if (typeof(transform) == 'object') {
                    let closest = {socket: null, distance: Infinity};
                    this.sockets.list.forEach((socket) => {
                        const a = transform.x - (this.transform.x + socket.transform.x);
                        const b = transform.y - (this.transform.y + socket.transform.y);
                        const distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
                        if (closest.distance > distance) closest = {socket, distance};
                    });
                    return {
                        x: this.transform.x - this.transform.ox + (closest.socket ? closest.socket.transform.x : 0),
                        y: this.transform.y - this.transform.oy + (closest.socket ? closest.socket.transform.y : 0)
                    };
                }

                return null;
            },

            hide: () => {
                this.sockets.list.forEach((socket) => {
                    socket.hide();
                });
            }

        };

        // Visibility
        this.isVisible = true;

        // Locked
        this.locked = {
            move: 'settings' in args && 'lockedMove' in args['settings'] ? args['settings']['lockedMove'] : false,
            content: 'settings' in args && 'lockedContent' in args['settings'] ? args['settings']['lockedContent'] : false,
            delete: 'settings' in args && 'lockedDelete' in args['settings'] ? args['settings']['lockedDelete'] : false,
        };

        // Paperclip
        this.paperclip = 'paperclip' in args ? args.paperclip : false;
        if (this.paperclip) this.addPaperclip();

        // Controls
        this.controls = {};

        // Custom css class
        this.element.classList.add(`metaviz-node-${global.registry.nodes[args.type] ? global.registry.nodes[args.type]?.slug : 'dummy'}`);

        // Menu options
        this.options = {};

        // Options keep locally for all nodes of given type
        // IndexedDB: commonOptions: id = 'board_id-node_type', option = '...'
        // this.localOptions = {
        //     set: (name, value) => {
        //         metaviz.storage.db.table['localOptions'].set({ 'id': metaviz.editor.id + '-' + this.constructor.name, 'option': name, 'value': value });
        //     },
        //     get: async (name) => {
        //         return await metaviz.storage.db.table['localOptions'].get({ 'id': metaviz.editor.id + '-' + this.constructor.name, 'option': name });
        //     }
        // };

        // Popovers options
        this.popovers = {};
        
        // Selected
        this.selected = false;

        // Focused (current selection)
        this.focused = false;

        // Selected box
        this.selectedBox = document.createElement('div');

        // Highlight
        this.highlight = document.createElement('div');
        this.highlight.classList.add('metaviz-node-highlight');
        this.highlight.style.display = 'none';
        this.element.append(this.highlight);

        // Animated icon
        this.animIcon = document.createElement('div');
        this.animIcon.classList.add('anim-icon');
        this.animIcon.style.position = 'absolute';
        this.animIcon.style.zIndex = 'var(--z-node-anim-icon)';
        this.animIcon.style.display = 'none';
        this.element.append(this.animIcon);

        // Previous size
        this.sizePrev = {w: null, h: null};

        // Elastic mode as children
        this.isElastic = false;

    }

    /**
     * Init after node is added into DOM tree
     */

    awake() {
        for (const [name, control] of Object.entries(this.controls)) {
            control.awake();
        }
    }

    /**
     * Style
     */

    setStyle(key, value = null) {
        if (value !== null) this.element.style[key] = value;
    }

    getStyle(key = null) {
        if (key !== null) return this.element.style[key];
        else return this.element.style;
    }

    /**
     * Add single control
     * obj: MetavizControl* object
     */

    addControl(obj) {
        this.controls[obj.name] = obj;
        this.element.append(obj.element);
        obj.awake();
    }

    /**
     * Remove single control
     * obj: MetavizControl* object
     */

    delControl(obj) {
        this.element.remove(obj.element);
        delete this.controls[obj.name];
    }

    /**
     * Add controls
     * dict of controls to add to this.controls
     */

    addControls(dict) {
        for (const [name, control] of Object.entries(dict)) {
            this.controls[name] = control;
            this.element.append(control.element);
        }
    }

    /**
     * Edit text
     */

    edit(enable) {
        if (enable == true && !this.locked.content) {
            Object.values(this.controls).forEach(control => control.edit(true));
            metaviz.events.call('on:edit');
        }
        else {
            Object.values(this.controls).forEach(control => control.edit(false));
        }
    }

    /**
     * Return control if in edit mode
     */

    getEditingControl() {
        for (const [key, control] of Object.entries(this.controls)) {
            if (control.editing) return control;
        }
        return null;
    }

    /**
     * Click events
     */

    click() {
        if (this.selected && this.locked.content) this.animateIcon('🔒');
    }

    dblclick() {
        /* Overload double click */
    }

    contextmenu() {
        /* Overload right click */
    }

    /**
     * Set or get visibility
     */

    visible(state = null) {
        // Setter
        if (state !== null) {
            // Show
            if (state) {
                this.element.style.removeProperty('display');
            }
            // Hide
            else {
                this.element.style.display = 'none';
            }
            // Show/hide related links
            for (const link of this.links.get('*')) {
                link.visible(state);
            }
            // Set current state
            this.isVisible = state;
        }
        // Getter
        else {
            return this.isVisible;
        }
    }

    /**
     * Get position
     * transform {x: float, y: float}
     */

    getPosition() {
        let x = this.transform.x;
        let y = this.transform.y;
        if (this.parentNode?.container) {
            const parentTransform = this.parentNode.getPosition();
            x += parentTransform.x;
            y += parentTransform.y;
        }
        return {x, y};
    }

    /**
     * Parenting
     * node: MetavizNode | ID
     */

    setParent(node, slot) {
        /*
        // Root
        if (node == null) {
            this.parent = null;
            this.parentNode = null;
            if (slot) this.slot = slot;
        }
        // Slot
        else if (typeof(node) == 'object') {
            this.parent = node.id;
            this.parentNode = metaviz.render.nodes.get(node.id);
            if (slot) this.slot = slot;
        }
        // Parent
        else {
            this.parent = node;
            this.parentNode = metaviz.render.nodes.get(node.id);
        }*/
    }

    unParent() {
        /*
        this.parent = null;
        this.parentNode = null;
        if (this.slot) this.slot = null;
        */
    }

    getParentFolder() {
        for (const parent of this.getUpTree()) {
            if (parent.id == this.id) continue;
            if (parent instanceof MetavizNodeFolder) return parent;
        }
        return null;
    }

    /**
     * Attach given nodes as childrens
     * returns true if childrens were attached
     */

    setChildren(nodes, slot = null, offset = null) {
        //for (const node of nodes) node.setParent(this, slot);
        return false;
    }

    unChildren(node) {
        //node.unParent(this);
        node.parent = null;
        node.parentNode = null;
        node.slot = null;
    }

    /**
     * Enable paperclip
     */

    addPaperclip() {
        const paperclip = document.createElement('div');
        paperclip.classList.add('paperclip');
        paperclip.innerHTML = '📎';
        this.element.append(paperclip);
        this.paperclip = true;
    }

    /**
     * Get children list with deep tree and node itself
     */

    getTree() {
        const children = [this];
        for (const node of metaviz.render.nodes.get('*')) {
            if (this.id == node.parent) children.push(...node.getTree());
        }
        return children;
    }

    /**
     * Get parent list and node itself
     */

    getUpTree() {
        const parents = [this];
        if (this.parentNode) parents.push(...this.parentNode.getUpTree());
        return parents;
    }

    /**
     * Get directly linked nodes list
     * args:
     *   direction: 'out' (default) | 'in' | 'both'
     *   type: 'node class name'
     *   types: ['node class name', ...]
     *   TODO: levels: 1 (default) level of tree depth (TODO instead of getTree)
     */

    getDownTree(args = {}) {
        // Arguments
        const {direction = 'out', types = []} = args;
        if ('type' in args) types.push(args.type);
        // Collection
        const children = [];
        // Out direction
        if (direction == 'out' || direction == 'both') {
            this.links.get('out').forEach(link => {
                if (types.length) {
                    if (types.includes(link.end.constructor.name)) children.push(link.end);
                }
                else {
                    children.push(link.end);
                }
            });
        }
        // In direction
        if (direction == 'in' || direction == 'both') {
            metaviz.render.nodes.get('*').forEach(node => {
                if (node.id != this.id) node.links.get('out').forEach(link => {
                    if (link.end.id == this.id) {
                        if (types.length) {
                            if (types.includes(node.constructor.name)) children.push(node);
                        }
                        else {
                            children.push(node);
                        }
                    }
                });
            });
        }
        return children;
    }

    /**
     * Serialization
     */

    serialize() {
        let cleanData = {...this.params};
        if (cleanData.hasOwnProperty('set')) delete cleanData['set'];
        if (cleanData.hasOwnProperty('get')) delete cleanData['get'];
        const settings = {};
        if (this.locked.move) settings['lockedMove'] = this.locked.move;
        if (this.locked.content) settings['lockedContent'] = this.locked.content;
        if (this.locked.delete) settings['lockedDelete'] = this.locked.delete;
        return {
            id: this.id,
            parent: this.parent,
            type: this.constructor.name,
            settings: settings,
            params: cleanData,
            x: this.transform.x,
            y: this.transform.y,
            w: this.transform.w,
            h: this.transform.h,
            zindex: this.transform.zindex
        };
    }

    /**
     * Migrate
     */

    migrate(version) {
        if (!('v' in this.params)) this.params['v'] = version;
        /* Overload version migration for node */
    }

    /**
     * Size
     * @param size.width: <Number>
     * @param size.height: <Number>
     * @param size.minWidth: <Number>
     * @param size.minHeight: <Number>
     * @param size.maxWidth: <Number>
     * @param size.maxHeight: <Number>
     * @param size.border: [Number]
     * @param size.resize: [string] ('none' = can't resize, 'avg' = average, 'free' = separate x,y, 'ratio' = proportional)
     * @param save: [bool]
     */

    setSize(size, save = false) {
        super.setSize(size);
        if ('resize' in size) this.transform.resize = size.resize;
        if (save) {

            // Redraw
            this.update();

            // Save
            metaviz.editor.history.store({
                action: 'resize',
                nodes: [this.id],
                size: {w: this.transform.w, h: this.transform.h},
                sizePrev: {w: this.sizePrev.w, h: this.sizePrev.h}
            });
        }
    }

    /**
     * Get Size
     */

    getSize() {
        return {
            width: this.transform.w,
            height: this.transform.h,
            minWidth: this.transform.wmin,
            minHeight: this.transform.hmin,
            maxWidth: this.transform.wmax,
            maxHeight: this.transform.hmax,
            border: this.transform.border,
            resize: this.transform.resize
        };
    }

    /**
     * Store current size for Undo/Redo
     */

    storeSize() {
        assign(this.sizePrev, this.transform);
    }

    /**
     * Create set of standard sockets
     */

    addSockets(dict = null) {
        if (dict) {
            for (const [name, socket] of Object.entries(dict)) {
                this.sockets.add(socket);
            }
        }
        /* Default */
        else {
            // Socket north
            this.sockets.add(new MetavizSocket({
                name: 'north',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox,
                    y: this.transform.oy - (this.transform.h / 2)
                }
            }));
            // Socket east
            this.sockets.add(new MetavizSocket({
                name: 'east',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox + (this.transform.w / 2),
                    y: this.transform.oy
                }
            }));
            // Socket south
            this.sockets.add(new MetavizSocket({
                name: 'south',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox,
                    y: this.transform.oy + (this.transform.h / 2)
                }
            }));
            // Socket west
            this.sockets.add(new MetavizSocket({
                name: 'west',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox - (this.transform.w / 2),
                    y: this.transform.oy
                }
            }));
        }
    }

    /**
     * Recalculate sockets positions
     */

    updateSockets() {
        this.sockets.list.forEach((socket) => {
            switch(socket.name) {
                case 'north':
                    socket.transform.x = this.transform.ox;
                    socket.transform.y = this.transform.oy - (this.transform.h / 2);
                    break;
                case 'east':
                    socket.transform.x = this.transform.ox + (this.transform.w / 2);
                    socket.transform.y = this.transform.oy;
                    break;
                case 'south':
                    socket.transform.x = this.transform.ox;
                    socket.transform.y = this.transform.oy + (this.transform.h / 2);
                    break;
                case 'west':
                    socket.transform.x = this.transform.ox - (this.transform.w / 2);
                    socket.transform.y = this.transform.oy;
                    break;
            }
        });
    }

    /**
     * Add menu options
     * dict of options to add to this.options
     */

    addOptions(dict) {
        for (const [name, option] of Object.entries(dict)) {
            this.options[name] = option;
        }
    }

    /**
     * Add popover options
     * dict of options to add to this.popovers
     */

    addPopovers(dict) {
        for (const [name, option] of Object.entries(dict)) {
            this.popovers[name] = option;
        }
    }

    /**
     * Generate options for a cloud menu
     */

    getPopovers() {
        return Object.values(this.popovers);
    }

    /**
     * Collect connected nodes traversing up to tree
     */

    getLinkedUpTree(node = null) {
        const nodes = [];
        if (node) nodes.push(node);
        for (const link of this.links.get('in')) {
            nodes.push(...link.start.getLinkedUpTree(link.start));
        }
        return nodes;
    }

    /**
     * Collect connected nodes traversing down to tree
     */

    getLinkedDownTree(node = null) {
        const nodes = [];
        if (node) nodes.push(node);
        for (const link of this.links.get('out')) {
            nodes.push(...link.end.getLinkedDownTree(link.end));
        }
        return nodes;
    }

    /**
     * Pipeline
     *
     * Gathers all meta from connected ancestor nodes
     */

    pipeline() {
        // New stream
        const stream = new MetavizStream();

        // Traverse all links endpoints and fetch pipeline data
        for (const link of this.links.get('in')) {
            stream.add(link.start.pipeline());
        }

        // Return pipeline
        return stream;
    }

    /**
     * Manual send (message-like)
     */

    pipelineSend(stream) {
        // Traverse all links endpoints and send pipeline data
        for (const link of this.links.get('out')) {
            link.end.pipelineRecv(stream);
        }
    }

    /**
     * Manual receive (message-like)
     */

    pipelineRecv(stream) {
        /* Overload */
    }

    /**
     * Manual return (message-like)
     */

    pipelineReturn(data) {
        /* Overload */
    }

    /**
     * Selection
     */

    select() {

        // Switch
        this.selected = true;

        // Select
        this.element.classList.add('selected');

        // Show highlight frame
        this.highlight.style.display = 'block';

    }

    deselect() {

        // Hide highlight frame
        this.highlight.style.display = 'none';

        // Deselect
        this.element.classList.remove('selected');

        // Switch
        this.selected = false;

    }

    /**
     * Focus (currently selected node with transform cage)
     */

    focus() {

        // Switch
        this.focused = true;

        // Class
        this.element.classList.add('focused');

        // Hide highlight frame
        this.highlight.style.display = 'none';

        // Refresh size information (for rotated nodes)
        const size = this.getSize();
        this.transform.w = size.width;
        this.transform.h = size.height;

        // Show resizing cage
        metaviz.editor.cage.assign(this);
        metaviz.editor.cage.show();

        // Render
        this.render();

        // Focus controls
        this.getEditingControl()?.focus();

        // Enable editing in all controls
        this.edit(true);
    }

    blur() {

        // Disable editing in all controls
        this.edit(false);

        // Class
        this.element.classList.remove('focused');

        // Restore highlight frame
        this.highlight.style.display = 'block';

        // Hide empty sockets
        this.sockets.hide();

        // Hide resizing cage
        metaviz.editor.cage.assign(null);
        metaviz.editor.cage.hide();

        // Switch
        this.focused = false;

        // Blur controls
        Object.values(this.controls).forEach(control => control.blur());

        // Blur DOM element
        this.element.blur();

        // Clear text selection
        window.clearSelection();

        // Broadcast event
        metaviz.events.call('on:edited');
    }

    /**
     * Calculate collision with other box (in world coordinates)
     * box1: {left: ..., top: ..., right: ..., bottom: ...}
     */

    intersects(box1) {
        // Not in current folder or parented into group/frame
        if (this.parent != metaviz.render.nodes.parent) return false;

        // Node area
        const box2 = {
            left: this.transform.x - (this.transform.w / 2),
            right: this.transform.x + (this.transform.w / 2),
            top: this.transform.y - (this.transform.h / 2),
            bottom: this.transform.y + (this.transform.h / 2)
        };

        // Check intersection
        if (box1.right >= box2.left && box2.right >= box1.left && box1.bottom >= box2.top && box2.bottom >= box1.top)
           return true;

        // Not intersects
        return false;
    }

    /**
     * Get proper URI
     */

    fixURI(uri) {
        if (uri == '') return '';
        if (uri.startsWith('data:')) return uri;
        if (metaviz.agent.server) return (uri.substring(0, 4) == 'http' || uri.substring(0, 4) == 'file') ? uri : 'media/' + uri;
        return uri;
    }

    /**
     * Search params data for given text
     */

    search(text) {
        /* Overload */
        return false;
    }

    /**
     * Convert node from one to another
     */

    convert() {
        /* Overload */
    }

    /**
     * Flush all data
     */

    flush() {
        /* Overload */
    }

    /**
     * Lock all node actions (until unlocked)
     * kind: what to lock 'move' | 'content' | 'delete'
     */

    lock(kind = 'move') {
        if (kind == 'move') {
            this.locked.move = true;
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedMove: true}});
        }
        else if (kind == 'content') {
            this.locked.content = true;
            this.edit(false);
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedContent: true}});
        }
        else if (kind == 'delete') {
            this.locked.delete = true;
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedDelete: true}});
        }
    }

    /**
     * Unlock all node actions
     * kind: what to unlock 'move' | 'content' | 'delete'
     */

    unlock(kind = 'move') {
        if (kind == 'move') {
            this.locked.move = false;
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedMove: false}});
        }
        else if (kind == 'content') {
            this.locked.content = false;
            this.edit(true);
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedContent: false}});
        }
        else if (kind == 'delete') {
            this.locked.delete = false;
            metaviz.editor.history.store({action: 'settings', node: {id: this.id, lockedDelete: false}});
        }
    }

    /**
     * Toggle lock/unlock
     */

    lockToggle(kind = 'move') {
        if (kind in this.locked) this.unlock(kind);
        else this.lock(kind);
    }

    /**
     * Dynamically load .js or .css
     */

    require(id, src) {
        if (!document.getElementById(id)) {

            // Load custom script
            if (src.ext() == 'js') {
                const script = document.createElement('script');
                script.id = id;
                script.setAttribute('type', 'module');
                script.setAttribute('src', src);
                script.onload = (event) => metaviz.editor.menu.regenerateNodesList();
                document.body.appendChild(script);
            }

            // Load custom style
            if (src.ext() == 'css') {
                const style = document.createElement('link');
                style.id = id;
                style.setAttribute('rel', 'stylesheet');
                style.setAttribute('type', 'stylesheet');
                style.setAttribute('href', src);
                document.body.appendChild(style);
            }

        }
    }

    /**
     * Get menu options
     */

    menu() {
        return { options: this.options };
    }

    /**
     * Show aniamted icon
     */

    animateIcon(html) {
        if (typeof(html) == 'string') this.animIcon.innerHTML = html;
        else if (typeof(html) == 'object') this.animIcon.append(html);
        this.animIcon.style.display = 'block';
        this.animIcon.style.left = (this.transform.ox - (this.animIcon.offsetWidth / 2)) + 'px';
        this.animIcon.style.top = (this.transform.oy - (this.animIcon.offsetHeight / 2)) + 'px';
        this.animIcon.style.animationPlayState = 'running';
        setTimeout(() => this.animateIconStop(), 790);
    }

    animateIconStop() {
        this.animIcon.style.animationPlayState = 'paused';
        this.animIcon.style.display = 'none';
    }

    /**
     * Make node elastic
     * state: enable=true/disable=false
     */

    elastic(state) {
        this.isElastic = state;

        // Enable elastic
        if (state == true) {
            this.transform.ox = 0;
            this.transform.oy = 0;
            this.setStyle('borderRadius', '0');
            // this.setStyle('width', 'calc(100% - 8px)');
            // this.setStyle('height', 'calc(100% - 8px)');
            this.setStyle('width', '100%');
            this.setStyle('height', '100%');
            this.setStyle('position', 'relative');
            this.setStyle('transform', 'translate(0px, 0px) scale(1)');
        }

        // Disable elastic
        else {
            this.element.removeAttribute('style');
            this.setSize({width: this.transform.w, height: this.transform.h});
            this.update();
        }
    }

    /**
     * Get assigned icon from registry
     */

    icon() {
        return global.registry.nodes[this.constructor.name].icon;
    }

    /**
     * Short description of the contents
     */

    synopsis(length) {
        /* Overload */
        return '';
    }

    /**
     * Export node to different format
     * This is fallback method, usually node requires own implementation
     */

    export(format, args = {}) {

        if (format == 'miniature') {
            return `<div class="miniature" data-id="${this.id}">${this.icon() || this.name}</div>`;
        }

        else if (format == 'image/svg+xml') {
            return `<rect width="100" height="100" rx="20" ry="20" style="fill:rgb(55,55,55);stroke-width:2;stroke:rgb(200,200,200)" /><text x="50" y="50" fill="white" text-anchor="middle" dominant-baseline="middle">${this.name}</text>`;
        }

        return null;
    }

    /**
     * Exit from runtime (browser quit)
     * return:
     *   true = allowed to exit
     *   false = show alert
     */

    exit() {
        /* Overload */
        return true;
    }

    /**
     * Render as children
     */

    renderChildren(node) {
        /* Overload */
    }

    /**
     * Render - recalculate look (rarely when something important hapens e.g. init or folder change)
     */

    render() {

        // Receive update from parent (folder for example)
        if (this.parent) {
            // Lazy cache parent node during first render
            if (!this.parentNode) this.parentNode = metaviz.render.nodes.get(this.parent);
            // Render children
            if (this.parentNode) this.parentNode.renderChildren(this);
        }
        else {
            // Show if parent is root
            if (metaviz.render.nodes.parent == null && !this.visible()) this.visible(true);
        }

        // Render sockets
        if (this.focused) {

            // Directions
            const directionsWorld = {
                // Socket north
                'north': metaviz.render.world2Screen({
                    x: this.transform.x,
                    y: this.transform.y - this.transform.oy
                }),
                // Socket east
                'east': metaviz.render.world2Screen({
                    x: this.transform.x + this.transform.ox,
                    y: this.transform.y + (this.transform.h / 2) - this.transform.oy
                }),
                // Socket south
                'south': metaviz.render.world2Screen({
                    x: this.transform.x,
                    y: this.transform.y + this.transform.h - this.transform.oy
                }),
                // // Socket west
                'west': metaviz.render.world2Screen({
                    x: this.transform.x - this.transform.ox,
                    y: this.transform.y + (this.transform.h / 2) - this.transform.oy
                }),
                // Socket center
                'center': metaviz.render.world2Screen({
                    x: this.transform.x,
                    y: this.transform.y
                })
            };

            // Visualize sockets if visible
            this.sockets.list.forEach((socket) => {
                socket.update(directionsWorld[socket.name]);
                socket.show();
            });
        }
    }

    /**
     * Update (everyframe when something is changed e.g. move)
     */

    update() {
        if (this.isElastic == false) super.update();
        this.updateSockets();
    }

}
