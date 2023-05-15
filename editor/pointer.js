/**
 * Metaviz Editor Pointer Events
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

/*
        (
       __\__
      |__|__|
      |  I  |
      |     |
      '.___.'

*/

class MetavizEditorPointer {

    constructor(editor) {
        // Editor
        this.editor = editor;

        // Current clicked node
        this.clicked = null;

        // How many pixels moved
        this.offset = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            start: function(x, y) {
                this.x1 = this.x2 = x;
                this.y1 = this.y2 = y;
            },
            update: function(x, y) {
                this.x2 = x;
                this.y2 = y;
            },
            get: function() {
                return Math.abs((this.x2 - this.x1) + (this.y2 - this.y1));
            },
            getCoords: function() {
                return {x: this.x2 - this.x1, y: this.y2 - this.y1};
            }
        };

        // Doubleclick timestamp
        this.timestamp = Date.now();
        this.dblclickThreshold = 300;

        // Dragging started
        this.dragStarted = false;

        // Assign events callbacks
        this.initMouseEvents();
        // this.initTouchEvents();
    }

    /**
     * Mouse Events
     */

    initMouseEvents() {

        /**
         * Mouse down: Left Click | Start drag
         */

        metaviz.events.subscribe('editor:pointerdown', metaviz.render.container, 'pointerdown', (event) => {
            // Not locked and click left button only
            if (!this.editor.interaction.locked && event.pointerType == 'mouse' && event.button == 0) {
                this.pointerStart(event);
            }
        });

        /**
         * Mouse move: Hover and Drag
         */

        metaviz.events.subscribe('editor:pointermove', metaviz.render.container, 'pointermove', (event) => {
            // Not locked and click left button only and node is selected
            if (!this.editor.interaction.locked && event.pointerType == 'mouse' && event.buttons == 1 && ['node', 'socket', 'box'].includes(this.editor.interaction.object)) {
                this.pointerMove(event);
            }
        });

        /**
         * Mouse up: Drop/End
         */

        metaviz.events.subscribe('editor:pointerup', metaviz.render.container, 'pointerup', (event) => {
            // Not locked
            if (!this.editor.interaction.locked && event.pointerType == 'mouse') {
                // Left Button
                if (event.button == 0) {
                    this.pointerEnd(event);
                }
                // Right button also selects with menu
                else if (event.button == 2) {
                    this.pointerEndForMenu(event);
                }
            }
        });

    }

    /**
     * Touchscreen Events
     */

    // initTouchEvents() {

    //     /**
    //      * Tap: Left Click | Start drag
    //      */

    //     metaviz.events.subscribe('editor:touchdown', document, 'touchstart', (event) => {
    //         // Not locked and one touch only
    //         if (!this.editor.interaction.locked && event.touches.length == 1) {
    //             this.pointerStart(event.target);
    //         }
    //     });

    //     /**
    //      * Move: Drag
    //      */

    //     metaviz.events.subscribe('editor:touchmove', document, 'touchmove', (event) => {
    //         // Not locked and one touch only and node is selected
    //         if (!this.editor.interaction.locked && event.touches.length == 1 && this.clicked) {
    //             this.pointerMove();
    //         }
    //     });

    //     /**
    //      * End: Drop/End
    //      */

    //     metaviz.events.subscribe('editor:touchup', document, 'touchend', (event) => {
    //         // Not locked and one touch only
    //         if (!this.editor.interaction.locked && event.touches.length == 1) {
    //             this.pointerEnd(event.target);
    //         }
    //     });

    // }

    /**
     * Down: Left Click | Start drag
     */

    pointerStart(event) {

        // Doubleclick
        const current = Date.now();
        if (current - this.timestamp < this.dblclickThreshold) {
            this.dblclick(event);
            return;
        }
        this.timestamp = current;

        // Clicked Socket
        if (event.target.nodeName == 'DIV' && event.target.hasClass('metaviz-socket')) {
            this.clicked = metaviz.render.nodes.get(event.target.dataset.nodeId);
            this.editor.interaction.object = 'socket';
        }

        // Select box (TEMPORARY DISABLED)
        /*else if (event.target.id == metaviz.container.id || event.target.hasClass('metaviz-link')) {
            // Deselect
            if (this.editor.selection.count() > 0) this.editor.selection.clear();
            // Start pan or box
            switch (metaviz.config.pointer.desktop.get()) {
                case 'pan':
                    if (this.editor.keyboard.key.ctrl) this.editor.interaction.object = 'box';
                    break;
                case 'box':
                    this.editor.interaction.object = 'box';
                    break;

            }
        }*/

        // Clicked Node
        else {
            this.clicked = metaviz.render.nodes.get(event.target);
            // Select node
            if (this.clicked && !this.editor.keyboard.key.ctrl && !this.editor.keyboard.key.alt) {
                this.editor.interaction.object = 'node';
                // Single select (if not already in selection list)
                if (!this.editor.selection.get(this.clicked)) {
                    this.editor.selection.set(this.clicked);
                }
            }
        }

        // Start calculating offset
        this.offset.start(event.x, event.y);
    }

    /**
     * Move: Hover and Drag
     */

    pointerMove(event) {

        // Drag start damper
        this.offset.update(event.x, event.y);
        if (!this.dragStarted && this.offset.get() > 2.0) {
            // Start drag: Socket
            if (this.editor.interaction.object == 'socket') {
                this.editor.dragLinkStart();
                this.editor.interaction.mode = 'drag';
            }
            // Start drag: Node
            else if (this.editor.interaction.object == 'node') {
                this.editor.dragSelectionStart();
                if (this.editor.selection.count()) this.editor.interaction.mode = 'drag';
            }
            // Start drag: Selection Box (TEMPORARY DISABLED)
            /*else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxStart(event.x, event.y);
                this.editor.interaction.mode = 'drag';
            }*/
            this.dragStarted = true;
        }

        // Drag
        if (this.editor.interaction.mode == 'drag') {
            // Drag link from socket
            if (this.editor.interaction.object == 'socket') {
                this.editor.dragLinkMove();
            }
            // Move selected nodes
            else if (this.editor.interaction.object == 'node') {
                this.editor.dragSelectionMove();
            }
            // Select box (TEMPORARY DISABLED)
            /*else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxMove(event.x, event.y);
            }*/
        }

    }

    /**
     * Up: Drop/End
     */

    pointerEnd(event) {

        // (De)Select element(s)
        if (this.editor.interaction.mode == 'idle') {

            // Clicked on node - select
            if (this.clicked) {
                // Multiple selection
                if (this.editor.keyboard.key.ctrl && !this.editor.keyboard.key.alt) {
                    // Add to selection (if not present in the selection already)
                    if (!this.editor.selection.get(this.clicked)) {
                        this.editor.selection.add(this.clicked);
                    }

                    // Remove from selection (if already in selection)
                    else {
                        this.editor.selection.del(this.clicked);
                    }
                }
                // Single click on selected node (don't clear)
                else if (!this.editor.keyboard.key.ctrl && !this.editor.keyboard.key.alt) {
                }
            }

            // Clicked on background - clear selection
            else {
                if (!this.editor.keyboard.key.ctrl && !this.editor.keyboard.key.alt) {
                    this.editor.selection.clear();
                }
            }

        }

        // Drop element
        else if (this.editor.interaction.mode == 'drag') {

            // Drop Node
            if (this.editor.interaction.object == 'node') {

                // Dropping collision with targets
                let parentFound = false;
                for (const target of event.composedPath()) {

                    // Div (on Node)
                    if (target.nodeName == 'DIV') {

                        // Parent (Folder, Group, Frame)
                        if (target.hasClass('metaviz-parent')) {
                            const parent = metaviz.render.nodes.get(target);
                            for (const child of this.editor.selection.get().filter(node => !node.locked)) {
                                child.setStyle('pointer-events', 'auto');
                                child.setStyle('z-index', 'var(--z-node)');
                                child.edit(false);
                                child.element.classList.remove('drag');
                                parent.setChildren(
                                    child,
                                    target.dataset.slot,
                                    this.offset.getCoords()
                                );
                            }
                            parentFound = true;
                            break;
                        }
                    }

                    // Span (on Toolbar)
                    else if (target.nodeName == 'SPAN') {

                        // Toolbar Breadcrumb (and not current folder)
                        if (target.hasClass('metaviz-breadcrumb') && target.dataset.folder != metaviz.render.nodes.parent) {
                            const parent = target.dataset.folder != undefined ? metaviz.render.nodes.get(target.dataset.folder) : null;
                            // Bind to root folder
                            if (parent == null) {
                                if (confirm('Move selected node(s) to the root folder?')) {
                                    for (const node of this.editor.selection.get()) {
                                        const parentPrev = node.parent;
                                        const positionPrev = {
                                            x: node.transform.x - this.offset.getCoords().x,
                                            y: node.transform.y - this.offset.getCoords().y
                                        };
                                        node.parent = null;
                                        node.transform.clear();
                                        node.render();
                                        node.update();
                                        node.setStyle('pointer-events', 'auto');
                                        node.setStyle('z-index', 'var(--z-node)');
                                        node.edit(false);
                                        node.element.classList.remove('drag');
                                        metaviz.editor.history.store({
                                            action: 'parent',
                                            node: {
                                                id: node.id,
                                                parent: null,
                                                parentPrev: parentPrev,
                                                position: {x: 0, y: 0},
                                                positionPrev: positionPrev
                                            }
                                        });
                                    }
                                }
                                else {
                                    metaviz.editor.dragSelectionCancel();
                                }
                            }
                            // Bind to new parent folder
                            else {
                                parent.setChildren(this.editor.selection.get(), target.dataset.slot);
                            }
                            parentFound = true;
                            break;
                        }
                        // Cancel move animation
                        metaviz.editor.dragSelectionCancel();
                    }
                }

                // End of dragging
                if (!parentFound) {
                    // Drop nodes
                    this.editor.dragSelectionEnd();
                }

            }

            // Link
            else if (this.editor.interaction.object == 'socket') {

                let nodeFound = false;

                for (const target of event.composedPath()) {

                    // Div
                    if (target.nodeName == 'DIV') {

                        // Link to Node
                        if (target.hasClass('metaviz-node')) {

                            this.editor.dragLinkEnd(metaviz.render.nodes.get(target.dataset.id));
                            nodeFound = true;
                            break;
                        }

                    }

                }

                // End of dragging
                if (!nodeFound) {
                    // Drop nodes
                    this.editor.dragLinkEnd(null);
                }
            }

            // Box
            else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxEnd();
            }

            // Clear selection
            this.editor.selection.transform.clear();

        }

        // Normal click-up
        else {

            // Passtrough click
            this.clicked.click();

        }

        // Clear
        this.editor.interaction.mode = 'idle';
        this.editor.interaction.object = null;
        this.dragStarted = false;
    }

    /**
     * Mouse up: Drop/End (right button)
     */

    pointerEndForMenu(event) {

        // If it's not during selection
        if (!this.editor.keyboard.key.ctrl) {

            // If any node is pointed
            this.clicked = metaviz.render.nodes.get(event.target);
            if (this.clicked) {

                // Clear selection
                this.editor.selection.clear();

                // Select this node
                this.editor.selection.set(this.clicked);

                // Interacting on node
                this.editor.interaction.object = 'node';
            }
        }
    }

    /**
     * Doubleclick
     */

    dblclick(event) {

        // Clicked on background - create new node
        if (!this.clicked && this.editor.keyboard.key.ctrl) {
            metaviz.editor.nodeAdd(this.editor.history.last.type, {x: event.offsetX, y: event.offsetY});
        }

        // Send dblclick event to node
        else if (this.clicked) {
            this.clicked.dblclick();
        }

    }

}
