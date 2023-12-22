/***************************************************************************************************
 *            (                                                                                    *
 *           __\__            Metaviz Editor Pointer Events                                        *
 *          |__|__|           Mouse, touchpad and touchscreen.                                     *
 *          |  I  |           MIT License                                                          *
 *          |     |           (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *          '.___.'                                                                                *
 **************************************************************************************************/

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
            if (!this.editor.interaction.locked && event.pointerType == 'mouse' && event.buttons == 1 && ['node', 'blossom', 'socket', 'box'].includes(this.editor.interaction.object)) {
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

        // Click on Node
        for (const target of event.composedPath()) {
            // Div (on Node)
            if (target.nodeName == 'DIV' && target.hasClass('metaviz-node')) {
                this.clicked = metaviz.render.nodes.get(target.dataset.id);
                this.clicked.click();
            }
        }

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

        // Selection box
        else if (event.target.id == metaviz.container.id || event.target.hasClass('metaviz-link')) {

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
        }

        // Clicked Node or Board
        else {

            // Clicked on Node: Select node
            this.clicked = metaviz.render.nodes.get(event.target);
            if (this.clicked) {

                // Interaction with node
                this.editor.interaction.object = 'node';

                // If not already in selection
                if (!this.editor.selection.get(this.clicked)) {
    
                    // Add to selection
                    if (this.editor.keyboard.key.ctrl) {
                        this.editor.selection.add(this.clicked);
                    }

                    // Single selection
                    else {
                        this.editor.selection.set(this.clicked);
                    }
                }
            }

            // Clicked on Board: Clear all selected nodes
            else if (!this.editor.keyboard.key.ctrl) {
                this.editor.selection.clear();
                this.editor.interaction.object = null;
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

            // Start blossoming
            if (this.editor.keyboard.key.ctrl && ['node', 'socket'].includes(this.editor.interaction.object)) {
                this.editor.dragBlossomStart();
                this.editor.interaction.object = 'blossom';
                this.editor.interaction.mode = 'drag';
            }

            // Start drag: Socket
            else if (this.editor.interaction.object == 'socket') {
                this.editor.dragLinkStart();
                this.editor.interaction.mode = 'drag';
            }

            // Start drag: Node (unless SHIFT is pressed - used for text selection)
            else if (this.editor.interaction.object == 'node' && !this.editor.keyboard.key.shift) {
                this.editor.dragSelectionStart();
                if (this.editor.selection.count()) this.editor.interaction.mode = 'drag';
            }

            // Start drag: Selection Box
            else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxStart(event.x, event.y);
                this.editor.interaction.mode = 'drag';
            }

            this.dragStarted = true;
        }

        // Drag
        if (this.editor.interaction.mode == 'drag') {

            // Drag link from socket
            if (this.editor.interaction.object == 'socket') {
                this.editor.dragLinkMove();
            }

            // Drag blossoming
            else if (this.editor.interaction.object == 'blossom') {
                this.editor.dragBlossomMove();
            }

            // Move selected nodes
            else if (this.editor.interaction.object == 'node') {
                this.editor.dragSelectionMove();
            }

            // Selection box
            else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxMove(event.x, event.y);
            }
        }

    }

    /**
     * Up: Drop/End
     */

    pointerEnd(event) {

        // Drop element
        if (this.editor.interaction.mode == 'drag') {

            // Drop node(s)
            if (this.editor.interaction.object == 'node') {

                let parentFound = null;

                // Check elements that have been dropped on
                for (const target of event.composedPath()) {

                    if (target.nodeName == 'DIV' || target.nodeName == 'SPAN') {

                        // Drop on node
                        if (target.hasClass('metaviz-node') && metaviz.editor.selection.getFocused().id != target.dataset.id) {
                            parentFound = metaviz.render.nodes.get(target.dataset.id);
                            break;
                        }

                    }
                }

                // End of dragging node(s)
                this.editor.dragSelectionEnd(parentFound);

            }

            // End drag link
            else if (this.editor.interaction.object == 'socket') {

                let nodeFound = null;

                // Check elements that have been dropped on
                for (const target of event.composedPath()) {

                    if (target.nodeName == 'DIV' || target.nodeName == 'SPAN') {

                        // Link to Node
                        if (target.hasClass('metaviz-node')) {
                            nodeFound = metaviz.render.nodes.get(target.dataset.id);
                            break;
                        }

                    }

                }

                // End of dragging link
                this.editor.dragLinkEnd(nodeFound);
            }

            // End blossoming
            else if (this.editor.interaction.object == 'blossom') {
                this.editor.dragBlossomEnd();
            }

            // End box
            else if (this.editor.interaction.object == 'box') {
                this.editor.dragBoxEnd();
            }

            // Clear selection
            this.editor.selection.transform.clear();

        }

        // Clear
        this.editor.interaction.mode = 'idle';
        this.editor.interaction.object = null;
        this.dragStarted = false;
    }

    /**
     * Doubleclick
     */

    dblclick(event) {

        // Clicked on background - create new node
        if (!this.clicked && this.editor.keyboard.key.ctrl) {
            metaviz.editor.nodeAdd(this.editor.history.last.type || 'MetavizNodeText', {x: event.offsetX, y: event.offsetY});
        }

        // Send dblclick event to node
        else if (this.clicked) {
            this.clicked.dblclick();
        }

    }

}
