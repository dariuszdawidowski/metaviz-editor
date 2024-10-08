/***************************************************************************************************
 *   ..  ~  ~  ~  ~   { }                                                                          *
 *   ||          \       }    Metaviz 3d space navigator                                           *
 *         |\_/|  \    }      Pan and zoom view.                                                   *
 *        -(o.O)-  \ {        MIT License                                                          *
 *          \O /    \         (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *        _(__)_     \                                                                             *
 **************************************************************************************************/

class MetavizNavigatorBrowser {

    constructor() {

        // Interaction
        this.interaction = {
            // Interaction mode
            mode: 'idle', // 'idle' | 'drag'
            // Transformed object
            object: null, // null | 'desktop' | 'node' | 'socket' | 'box'
        };

        // Pointer transform values
        this.transform = {

            // Pointer arrow or finger coordinates in screen space (not board space)
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,

            // Offset from last position
            delta: {
                x: 0,
                y: 0,
                get: function() { return this.x + this.y }
            },

            start: (x, y) => {
                this.transform.x = x - metaviz.render.size.left;
                this.transform.y = y - metaviz.render.size.top;
                metaviz.render.transform.delta.x = 0;
                metaviz.render.transform.delta.y = 0;
            },

            update: (x, y) => {
                this.transform.delta.x = x - metaviz.render.size.left - this.transform.x;
                this.transform.delta.y = y - metaviz.render.size.top - this.transform.y;
                this.transform.x = x - metaviz.render.size.left;
                this.transform.y = y - metaviz.render.size.top;
            },

            end: () => {
                this.transform.delta.x = 0;
                this.transform.delta.y = 0;
            }
        };

        this.initFulscreenSwitch();

        // Register events
        this.initEvents();
    }

    /*** EVENTS ********************************************************************************************************************/

    initEvents() {
        // Keyboard
        this.initViewerKeyboardEvents();
        // Mouse+Touchpad
        this.initViewerMouseEvents();
        // Touchpad
//         this.initViewerTrackpadEvents();
        // Touchscreen
        if ('ontouchstart' in window) this.initViewerTouchEvents();
    }

    /**
     * Keyboard events
     */

    initViewerKeyboardEvents() {

        // Key down
        metaviz.events.subscribe('viewer:keydown', document, 'keydown', (event) => {
        /*
            // Button '0': Center camera to origin
            if (event.keyCode == 48)
            {
                event.preventDefault();
                metaviz.render.center();
                metaviz.render.centerZoom();
            }

            // Button '-': Zoom out max
            else if (event.keyCode == 189)
            {
                event.preventDefault();
                metaviz.render.zoom(metaviz.render.size.center.x, metaviz.render.size.center.y, 0.5, 1);
            }

            // Button '+': Zoom in max
            else if (event.keyCode == 187)
            {
                event.preventDefault();
                metaviz.render.zoom(metaviz.render.size.center.x, metaviz.render.size.center.y, -0.5, 1);
            }

            // Arrow up: Pan up
            else if (event.keyCode == 38)
            {
                metaviz.render.pan(0, 100);
            }

            // Arrow up: Pan right
            else if (event.keyCode == 39)
            {
                metaviz.render.pan(-100, 0);
            }

            // Arrow up: Pan down
            else if (event.keyCode == 40)
            {
                metaviz.render.pan(0, -100);
            }

            // Arrow up: Pan left
            else if (event.keyCode == 37)
            {
                metaviz.render.pan(100, 0);
            }*/
        });

        // Key up

        metaviz.events.subscribe('viewer:keyup', document, 'keyup', (event) => {
        });
    }

    /**
     * Mouse events
     */

    initViewerMouseEvents() {

        // Mouse Down
        this.mouseDown = (event) => {
            // Left or middle button
            if (event.button == 0 || event.button == 1) {
                document.addEventListener('mousemove', this.mouseMove);
                document.addEventListener('mouseup', this.mouseUp);
                this.transform.start(event.clientX, event.clientY);
            }
        };

        // Always track mouse movement
        this.mouseTrack = (event) => {
            this.transform.update(event.clientX, event.clientY);
        };

        // Mouse Move
        this.mouseMove = (event) => {
            if (event.buttons == 1 && (event.target.id == metaviz.container.id || event.target.hasClass('metaviz-link')) && !['node', 'socket', 'blossom', 'box'].includes(this.interaction.object)) {
                this.interaction.object = 'desktop';
                metaviz.container.element.style.cursor = 'grabbing';
                metaviz.render.pan(event.movementX, event.movementY);
                metaviz.editor.cage.update();
            }
            else if (event.buttons == 4) {
                this.interaction.object = 'desktop';
                metaviz.container.element.style.cursor = 'grabbing';
                metaviz.render.pan(event.movementX, event.movementY);
                metaviz.editor.cage.update();
            }
        };

        // Mouse Up
        this.mouseUp = (event) => {
            if (event) {
                if (metaviz.config.pointer.desktop.get() == 'pan' && (event.button == 0 || event.button == 1)) metaviz.render.damp();
                else if (event.button == 1) metaviz.render.damp();
            }
            metaviz.container.element.style.cursor = 'auto';
            document.removeEventListener('mousemove', this.mouseMove);
            document.removeEventListener('mouseup', this.mouseUp);
            this.transform.end();
        };

        // Mouse Wheel zoom view (classic style)
        this.mouseWheelZoom = (event) => {
            // Pan if not SHIFT (for native text scrolling)
            if (!metaviz.editor.keyboard.key.shift) {
                event.preventDefault();
                metaviz.render.zoom(event.pageX - window.scrollX, event.pageY - window.scrollY, event.deltaY, metaviz.system.browser.zoomFactor);
                metaviz.editor.cage.update();
            }
        };

        // Mouse Wheel pan and pinch zoom view (Mac style)
        this.mouseWheelPanPinch = (event) => {
            // Pan if not SHIFT (for native text scrolling)
            if (!metaviz.editor.keyboard.key.shift) {
                event.preventDefault();
                // Pinch
                if (event.ctrlKey) {
                    metaviz.render.zoom(event.pageX - window.scrollX, event.pageY - window.scrollY, event.deltaY, metaviz.system.browser.pinchFactor);
                    metaviz.editor.cage.update();
                }
                // Swipe
                else {
                    metaviz.render.pan(-event.deltaX / window.devicePixelRatio, -event.deltaY / window.devicePixelRatio);
                    metaviz.editor.cage.update();
                }
            }
        };

        // Prevent default behaviours
        this.prevent = (event) => {
            // Prevent if not SHIFT (for native text scrolling)
            if (!metaviz.editor.keyboard.key.shift) {
                event.preventDefault();
            }
        }

        // Click
        metaviz.events.subscribe('viewer:mousedown', metaviz.render.container, 'mousedown', this.mouseDown);

        // Pointer track
        metaviz.events.subscribe('always:pointertrack', metaviz.render.container, 'pointermove', this.mouseTrack);
        metaviz.events.subscribe('always:pointerenter', metaviz.render.container, 'pointerenter', this.mouseTrack);

        // Wheel bind
        metaviz.events.subscribe('viewer:mousewheel',
            metaviz.render.container,
            metaviz.system.browser.name == 'firefox' ? 'wheel' : 'mousewheel',
            metaviz.config.touchpad.swipe.get() == 'pan' ? this.mouseWheelPanPinch : this.mouseWheelZoom
        );

        // Wheel prevent
        metaviz.events.subscribe('browser:prevent',
            metaviz.render.container,
            metaviz.system.browser.name == 'firefox' ? 'wheel' : 'mousewheel',
            this.prevent
        );
        metaviz.events.disable('browser:prevent');

        // Leave screen
        metaviz.events.subscribe('viewer:mouseleave', document, 'mouseout', (event) => {
            const from = event.relatedTarget || event.toElement;
            if (!from || from.nodeName == 'HTML') {
                this.mouseUp(null);
            }
        });

    }

    clearViewerMouseEvents() {
        // viewer:mousedown @ metaviz.render.container
        metaviz.events.unsubscribe('viewer:mousedown');
        // viewer:mousewheel @ metaviz.render.container
        metaviz.events.unsubscribe('viewer:mousewheel');
        // viewer:pointertrack @ metaviz.render.container
        metaviz.events.unsubscribe('always:pointertrack');
        // viewer:pointerenter @ metaviz.render.container
        metaviz.events.unsubscribe('always:pointerenter');
        // viewer:mouseleave @ document
        metaviz.events.unsubscribe('viewer:mouseleave');
        // browser:prevent @ metaviz.render.container
        metaviz.events.unsubscribe('browser:prevent');
    }

    restartViewerMouseEvents() {
        this.clearViewerMouseEvents();
        this.initViewerMouseEvents();
    }

    /**
     * Trackpad events
     */

    /*initViewerTrackpadEvents() {

        // Pointer Start
        this.pointerMoveStart = function(event)
        {
            if (event.pointerType == 'touch') {
                event.preventDefault();
                this.transform.x = event.clientX;
                this.transform.y = event.clientY;
            }
        }.bind(this);

        // Pointer Move Pan
        this.pointerMovePan = function(event) {
            if (event.pointerType == 'touch') {
                event.preventDefault();
                //const deltaX = event.clientX - this.transform.x;
                //const deltaY = event.clientY - this.transform.y;
                this.transform.delta.x = event.clientX - this.transform.x;
                this.transform.delta.y = event.clientY - this.transform.y;
                this.transform.x = event.clientX;
                this.transform.y = event.clientY;
                //metaviz.render.pan(deltaX / window.devicePixelRatio, deltaY / window.devicePixelRatio);
                metaviz.render.pan(this.transform.delta.x / window.devicePixelRatio, this.transform.delta.y / window.devicePixelRatio);
            }
        }.bind(this);

        // Pointer Move Zoom
        this.pointerMoveZoom = function(event) {
            if (event.pointerType == 'touch') {
                event.preventDefault();
                //const deltaX = event.clientX - this.transform.x;
                //const deltaY = event.clientY - this.transform.y;
                this.transform.delta.x = event.clientX - this.transform.x;
                this.transform.delta.y = event.clientY - this.transform.y;
                this.transform.x = event.clientX;
                this.transform.y = event.clientY;
                //metaviz.render.zoom(metaviz.render.size.center.x, metaviz.render.size.center.y, -deltaY, metaviz.system.browser.zoomFactor);
                metaviz.render.zoom(metaviz.render.size.center.x, metaviz.render.size.center.y, this.transform.delta.y, metaviz.system.browser.zoomFactor);
            }
        }.bind(this);

        // Edge touchpad zoom or pan
        if (metaviz.system.browser.name == 'edge') {
            // metaviz.render.container.addEventListener('pointerdown', this.pointerMoveStart);
            metaviz.events.subscribe('editor:pointerdown', metaviz.render.container, 'pointerdown', this.pointerMoveStart);
            if (metaviz.config.trackpad.zoom == 'scroll') {
                // metaviz.render.container.addEventListener('pointermove', this.pointerMoveZoom);
                metaviz.events.subscribe('editor:pointermove', metaviz.render.container, 'pointermove', this.pointerMoveZoom);
            }
            else {
                // metaviz.render.container.addEventListener('pointermove', this.pointerMovePan);
                metaviz.events.subscribe('editor:pointermove', metaviz.render.container, 'pointermove', this.pointerMovePan);
            }
        }
    }*/

    /**
     * Touchscreen events
     */

    initViewerTouchEvents() {

        let lastTouch;
        let lastZoom;

        // Touch Start
        this.touchStart = (event) => {

            // Block event
            // event.preventDefault();
            // event.stopPropagation();

            // Pan
            if (event.touches.length == 1) {
                lastTouch = { x: event.touches[0].pageX, y: event.touches[0].pageY };
                document.addEventListener('touchmove', this.touchMove);
                document.addEventListener('touchend', this.touchEnd);
            }

            // Zoom
            else if (event.touches.length == 2) {
                lastZoom = Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
            }

        };

        // Touch Move
        this.touchMove = (event) => {

            // Block event
            // event.preventDefault();
            // event.stopPropagation();

            // Pan
            if (event.touches.length == 1) {
                metaviz.render.pan(event.touches[0].pageX - lastTouch.x, event.touches[0].pageY - lastTouch.y);
                lastTouch = { x: event.touches[0].pageX, y: event.touches[0].pageY };
            }

            // Zoom
            else if (event.touches.length == 2) {
                const x1 = event.touches[0].pageX;
                const y1 = event.touches[0].pageY;
                const x2 = event.touches[1].pageX;
                const y2 = event.touches[1].pageY;
                const zoom = Math.hypot(x1 - x2, y1 - y2);
                metaviz.render.pinchZoom(x1, y1, x2, y2, (zoom / lastZoom));
                lastZoom = zoom;
            }

        };

        // Touch End
        this.touchEnd = (event) => {

            // Block event
            // event.preventDefault();
            // event.stopPropagation();

            // Unbind events
            document.removeEventListener('touchmove', this.touchMove);
            document.removeEventListener('touchend', this.touchEnd);

        };

        // Event listening
        metaviz.events.subscribe('editor:touchstart', metaviz.render.container, 'touchstart', this.touchStart);
    }

    /*******************************************************************************************************************************/

    initFulscreenSwitch() {
        /**
         * Button
         * Expand: <i class="fa-solid fa-expand"></i>
         * Compress: <i class="fa-solid fa-compress"></i>
         */
        if (metaviz.container.isSmaller()) {
            const buttonFullscreen = document.createElement('i');
            buttonFullscreen.classList.add('metaviz-button-fullscreen', 'expand', 'fa-solid', 'fa-expand');
            buttonFullscreen.addEventListener('click', (event) => {
                if (buttonFullscreen.hasClass('expand')) {
                    buttonFullscreen.classList.remove('expand', 'fa-expand');
                    metaviz.container.expand();
                    buttonFullscreen.classList.add('compress', 'fa-compress');
                }
                else if (buttonFullscreen.hasClass('compress')) {
                    buttonFullscreen.classList.remove('compress', 'fa-compress');
                    metaviz.container.compress();
                    buttonFullscreen.classList.add('expand', 'fa-expand');
                }

            });
            metaviz.container.element.append(buttonFullscreen);
        }
    }

}
