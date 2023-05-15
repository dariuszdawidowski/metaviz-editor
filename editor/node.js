/**
 * Metaviz Node (Editor)
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

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

        // Parent as object reference MetavizNode
        this.parentNode = null;

        // Slot name (string)
        this.slot = 'meta' in args && 'slot' in args.meta ? args.meta.slot : null;

        // Children list parented to this node
        //this.children = [];

        // Meta data
        this.meta = args.meta ?? {};
        // Setter and getter
        this.meta.set = function(key, value) { this[key] = value; };
        this.meta.get = function(key) { return this[key]; };

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
                    socket.visualize(false);
                });
            }

        };

        // Visibility
        this.isVisible = true;

        // Locked
        this.locked = 'locked' in args ? args.locked : false;

        // Controls
        this.controls = {};

        // Custom css class
        this.element.classList.add('metaviz-node-' + registry.nodes[args.type]?.slug);

        // Menu options
        this.options = {};

        // Options keep locally for all nodes of given type
        // IndexedDB: commonOptions: id = 'board_id-node_type', option = '...'
        this.localOptions = {
            set: (name, value) => {
                metaviz.storage.db.table['localOptions'].set({ 'id': metaviz.editor.id + '-' + this.constructor.name, 'option': name, 'value': value });
            },
            get: async (name) => {
                return await metaviz.storage.db.table['localOptions'].get({ 'id': metaviz.editor.id + '-' + this.constructor.name, 'option': name });
            }
        };

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
     * Set template
     */

    setTemplate(template) {
        this.element.innerHTML = template;
    }

    /**
     * Add single control
     * obj: MetavizControl* object
     */

    addControl(obj) {
        this.controls[obj.name] = obj;
        this.element.append(obj.control);
    }

    /**
     * Remove single control
     * obj: MetavizControl* object
     */

    delControl(obj) {
        this.element.remove(obj.control);
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
        for (const [key, control] of Object.entries(this.controls)) {
            control.edit(enable);
        }
        if (enable == true) metaviz.events.call('on:edit');
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
        /* Overload */
    }

    dblclick() {
        /* Overload */
    }

    /**
     * Toggle lock/unlock
     */

    lockToggle() {
        if (this.locked) this.unlock();
        else this.lock();
    }

    /**
     * Out focus
     */

    blur() {
        for (const [key, control] of Object.entries(this.controls)) {
            control.blur();
        }
        this.element.blur();
        metaviz.events.call('on:edited');
    }

    /**
     * Set or get visibility
     */

    visible(state = null) {
        // Setter
        if (state !== null) {
            // Show/Hide
            this.element.style.display = state ? 'flex' : 'none';
            for (const link of this.links.get()) {
                link.visible(state);
            }
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
        if (this.parentNode instanceof MetavizNodeGroup || this.parentNode instanceof MetavizNodeFrame) {
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
        }
        // Record children
        //this.parent.children.push(this);
    }

    unParent() {
        //this.parent.children.remove(this);
        this.parent = null;
        this.parentNode = null;
        if (this.slot) this.slot = null;
    }

    getParentFolder() {
        for (const parent of this.getUpTree()) {
            if (parent.id == this.id) continue;
            if (parent instanceof MetavizNodeFolder) return parent;
        }
        return null;
    }

    setChildren(node, slot, offset = null) {
        node.setParent(this, slot);
    }

    unChildren(node) {
        node.unParent(this);
    }

    /**
     * Get children list with deep tree and node itself
     */

    getTree() {
        const children = [this];
        for (const node of metaviz.render.nodes.get()) {
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
            this.links.get().forEach(link => {
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
            metaviz.render.nodes.get().forEach(node => {
                if (node.id != this.id) node.links.get().forEach(link => {
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
        let cleanData = {...this.meta};
        if (cleanData.hasOwnProperty('set')) delete cleanData['set'];
        if (cleanData.hasOwnProperty('get')) delete cleanData['get'];
        return {
            id: this.id,
            parent: this.parent,
            type: this.constructor.name,
            data: cleanData,
            locked: this.locked
        };
    }

    serializeWithTransform() {
        let cleanData = {...this.meta};
        if (cleanData.hasOwnProperty('set')) delete cleanData['set'];
        if (cleanData.hasOwnProperty('get')) delete cleanData['get'];
        return {
            id: this.id,
            parent: this.parent,
            type: this.constructor.name,
            data: cleanData,
            locked: this.locked,
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
        if (!('v' in this.meta)) this.meta['v'] = version;
        /* Overload version migration for node */
    }

    /**
     * Size
     * size: {width: .., height: ..}, save: [bool]
     */

    setSize(size, save = false) {
        super.setSize(size);
        if (save) {
            // Set current layer node size
            const vnode = metaviz.render.layers.current.getNode(this.id);
            vnode.w = size.width;
            vnode.h = size.height;

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
            // Resize mode ('avg' = average, 'free' = separate x,y, 'ratio' = proportional)
            mode: 'ratio'
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
     * Pipeline
     *
     * Gathers all meta from connected ancestor nodes
     */

    pipeline() {
        // New stream
        const stream = new MetavizEngineStream();

        // Traverse all links endpoints and fetch pipeline data
        for (const link of this.links.get()) {
            if (link.end.id == this.id) {
                stream.add(link.start.pipeline());
            }
        }

        // Return pipeline
        return stream;
    }

    /**
     * Manual send (message-like)
     */

    pipelineSend(stream) {
        // Traverse all links endpoints and send pipeline data
        for (const link of this.links.get()) {
            if (link.start.id == this.id) {
                link.end.pipelineRecv(stream);
            }
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
        // Render
        this.render();
    }

    deselect() {
        // Clear text selection
        window.clearSelection();
        // Hide highlight frame
        this.highlight.style.display = 'none';
        // Deselect
        this.blur();
        this.element.classList.remove('selected');
        // Switch
        this.selected = false;
    }

    /**
     * Focus
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
        metaviz.editor.cage.show(this.transform, this.resize);
        // Render
        this.render();
    }

    unfocus() {
        // Class
        this.element.classList.remove('focused');
        // Restore highlight frame
        this.highlight.style.display = 'block';
        // Hide empty sockets
        this.sockets.hide();
        // Hide resizing cage
        metaviz.editor.cage.hide();
        // Switch
        this.focused = false;
    }

    /**
     * Calculate collision with other box (in world coordinates)
     * leftTop: {x: .., y: ..}
     * rightBottom: {x: .., y: ..}
     */

    intersects(leftTop, rightBottom) {
        // Not in current folder or parented into group/frame
        if (this.parent != metaviz.render.nodes.parent) return false;
        // Compare left-top corner inside box
        if (this.transform.x >= leftTop.x && this.transform.y >= leftTop.y && this.transform.x <= rightBottom.x && this.transform.y <= rightBottom.y) return true;
        // Compare right-top corner inside box
        if (this.transform.x + this.transform.w >= leftTop.x && this.transform.y >= leftTop.y && this.transform.x + this.transform.w <= rightBottom.x && this.transform.y <= rightBottom.y) return true;
        // Compare right-bottom corner inside box
        if (this.transform.x + this.transform.w >= leftTop.x && this.transform.y + this.transform.h >= leftTop.y && this.transform.x + this.transform.w <= rightBottom.x && this.transform.y <= rightBottom.y + this.transform.h) return true;
        // Compare left-bottom corner inside box
        if (this.transform.x >= leftTop.x && this.transform.y + this.transform.h >= leftTop.y && this.transform.x <= rightBottom.x && this.transform.y <= rightBottom.y + this.transform.h) return true;
        // Not intersects
        return false;
    }

    /**
     * Get proper URI
     */

    fixURI(uri) {
        if (uri == '') return '';
        return (uri.substring(0, 4) == 'http' || uri.substring(0, 4) == 'file') ? uri : 'media/' + uri;
    }

    /**
     * Search meta data for given text
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
     */

    lock() {
        this.locked = true;
        // Undo/Sync
        metaviz.editor.history.store({action: 'lock', node: {id: this.id, locked: true}});
    }

    /**
     * Unlock all node actions
     */

    unlock() {
        this.locked = false;
        // Undo/Sync
        metaviz.editor.history.store({action: 'lock', node: {id: this.id, locked: false}});
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
        this.animIcon.innerHTML = html;
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
     * Miniature version
     */

    miniature(content = false) {
        /* Overload */
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
                socket.visualize(directionsWorld[socket.name]);
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
