/**
 * Metaviz Cage
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizCage {

    /**
     * Constructor
     */

    constructor(args) {

        // Current node
        this.node = null;

        // Margin size
        this.margin = 8;

        // Resize square width
        this.resize = 4;

        // Left-top hook
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-cage');
        this.element.style.display = 'none';

        // North frame
        this.n = document.createElement('div');
        this.n.classList.add('frame');
        this.element.append(this.n);

        // East frame
        this.e = document.createElement('div');
        this.e.classList.add('frame');
        this.element.append(this.e);

        // South frame
        this.s = document.createElement('div');
        this.s.classList.add('frame');
        this.element.append(this.s);

        // West frame
        this.w = document.createElement('div');
        this.w.classList.add('frame');
        this.element.append(this.w);

        // North-West resize
        this.nw = document.createElement('div');
        this.nw.classList.add('resize');
        this.nw.classList.add('corner');
        this.nw.classList.add('nw');
        this.element.append(this.nw);

        // North-East resize
        this.ne = document.createElement('div');
        this.ne.classList.add('resize');
        this.ne.classList.add('corner');
        this.ne.classList.add('ne');
        this.element.append(this.ne);

        // South-East resize
        this.se = document.createElement('div');
        this.se.classList.add('resize');
        this.se.classList.add('corner');
        this.se.classList.add('se');
        this.element.append(this.se);

        // South-West resize
        this.sw = document.createElement('div');
        this.sw.classList.add('resize');
        this.sw.classList.add('corner');
        this.sw.classList.add('sw');
        this.element.append(this.sw);

        // Append cage to container
        metaviz.render.container.append(this.element);

        // Offset
        this.offset = {
            prevX: 0,
            prevY: 0,
            direction: {x: 1, y: 1},

            // Init prev values x,y: screen relative coordinates
            init: function(x, y) {
                this.prevX = x;
                this.prevY = y;
            },

            // Returns difference x,y before last mouse move
            delta: function(x, y) {
                const result = {x: (x - this.prevX) * this.direction.x * window.devicePixelRatio, y: (y - this.prevY) * this.direction.y * window.devicePixelRatio};
                this.prevX = x;
                this.prevY = y;
                return result;
            },

            // Returns difference x,y before last mouse move in average scale
            deltaAvg: function(x, y) {
                const result = this.delta(x, y);
                const avg = (result.x + result.y) / 2;
                return {x: avg, y: avg};
            },

            // Returns difference x,y before last mouse move in picture ratio rx, ry scale
            deltaRatio: function(x, y, rx, ry) {
                const result = this.delta(x, y);
                const move = Math.abs(result.x) > Math.abs(result.y) ? result.x : result.y;
                return {x: move * rx, y: move * ry};
            }
        };

        // Events
        this.resizeStartEvent = this.resizeStart.bind(this);
        this.resizeDragEvent = this.resizeDrag.bind(this);
        this.resizeEndEvent = this.resizeEnd.bind(this);
        this.resizeOutEvent = this.resizeOut.bind(this);
        this.nw.addEventListener('pointerdown', this.resizeStartEvent);
        this.ne.addEventListener('pointerdown', this.resizeStartEvent);
        this.se.addEventListener('pointerdown', this.resizeStartEvent);
        this.sw.addEventListener('pointerdown', this.resizeStartEvent);
    }

    /**
     * Assign to node
     */

    assign(node) {
        this.node = node;
    }

    /**
     * Show cage
     * transform: {x: <Number>, y: <Number>}
     */

    show() {
        // Hide/show resizing squares
        if (this.node.getSize().resize == 'none') {
            this.nw.style.display = 'none';
            this.ne.style.display = 'none';
            this.se.style.display = 'none';
            this.sw.style.display = 'none';
        }
        else {
            this.nw.style.display = 'block';
            this.ne.style.display = 'block';
            this.se.style.display = 'block';
            this.sw.style.display = 'block';
        }
        this.update();
        this.element.style.display = 'block';

        // Disable base navigation events
        metaviz.events.disable('editor:paste');
        metaviz.events.disable('editor:keydown');
        metaviz.events.disable('editor:keyup');
        metaviz.events.enable('browser:prevent');
    }

    /**
     * Hide cage and restore events
     */

    hide() {
        // Hide
        this.element.style.display = 'none';

        // Restore base navigation events
        metaviz.events.disable('browser:prevent');
        metaviz.events.enable('editor:paste');
        metaviz.events.enable('editor:keydown');
        metaviz.events.enable('editor:keyup');
    }

    /**
     * Start resize
     */

    resizeStart(event) {
        event.stopPropagation();
        metaviz.editor.menu.hide();
        metaviz.events.disable('viewer:mousedown');
        metaviz.events.disable('editor:pointermove');
        if (event.target.hasClass('nw')) this.offset.direction = {x: -1, y: -1};
        else if (event.target.hasClass('ne')) this.offset.direction = {x: 1, y: -1};
        else if (event.target.hasClass('se')) this.offset.direction = {x: 1, y: 1};
        else if (event.target.hasClass('sw')) this.offset.direction = {x: -1, y: 1};
        const size = metaviz.editor.selection.getFocused().storeSize();
        // this.offset.init(event.x, event.y);
        const world = metaviz.render.screen2World({x: event.x, y: event.y});
        this.offset.init(world.x, world.y);
        metaviz.render.container.addEventListener('pointermove', this.resizeDragEvent);
        metaviz.render.container.addEventListener('pointerup', this.resizeEndEvent);
        document.addEventListener('mouseout', this.resizeOutEvent);
    }

    /**
     * Resizing
     */

    resizeDrag(event) {
        const size = this.node.getSize();
        const world = metaviz.render.screen2World({x: event.x, y: event.y});
        let offset = null;
        switch (size.resize) {
            case 'free':
                offset = this.offset.delta(world.x, world.y);
                break;
            case 'avg':
                offset = this.offset.deltaAvg(world.x, world.y);
                break;
            case 'ratio':
                const ratio = (this.node.transform.w / this.node.transform.h).toFixed(2);
                offset = this.offset.deltaRatio(world.x, world.y, ratio, 1);
                break;
        }
        this.node.setSize({
            width: Math.min(Math.max(size.width + offset.x, size.minWidth), size.maxWidth),
            height: Math.min(Math.max(size.height + offset.y, size.minHeight), size.maxHeight)
        });
        this.node.update();
        for (const link of this.node.links.get('*')) link.update();
        this.update(this.node.transform);
    }

    /**
     * Stop resize
     */

    resizeEnd(event) {

        // Save final size
        const size = this.node.getSize();
        this.node.setSize({
            width: size.width,
            height: size.height
        }, true);

        // Remove events
        metaviz.render.container.removeEventListener('pointermove', this.resizeDragEvent);
        metaviz.render.container.removeEventListener('pointerup', this.resizeEndEvent);
        document.removeEventListener('mouseout', this.resizeOutEvent);
        metaviz.events.enable('viewer:mousedown');
        metaviz.events.enable('editor:pointermove');
    }

    /**
     * Cancel resize
     */

    resizeCancel() {
        metaviz.render.container.removeEventListener('pointermove', this.resizeDragEvent);
        metaviz.render.container.removeEventListener('pointerup', this.resizeEndEvent);
        document.removeEventListener('mouseout', this.resizeOutEvent);
        metaviz.events.enable('viewer:mousedown');
        metaviz.events.enable('editor:pointermove');
    }

    /**
     * Cursor out of screen
     */

    resizeOut(event) {
        const from = event.relatedTarget || event.toElement;
        if (!from || from.nodeName == 'HTML') {
            this.resizeEnd(event);
        }
    }

    /**
     * Update dimensions
     */

    update() {
        if (this.node) {
            const container = metaviz.container.getOffset();
            const leftTop = metaviz.render.world2Screen({
                x: this.node.transform.x - this.node.transform.ox - this.margin + container.x - this.node.transform.border + window.scrollX,
                y: this.node.transform.y - this.node.transform.oy - this.margin + container.y - this.node.transform.border + window.scrollY
            });
            const rightBottom = metaviz.render.world2Screen({
                x: this.node.transform.x - this.node.transform.ox + this.node.transform.w + this.margin + container.left + this.node.transform.border + window.scrollX,
                y: this.node.transform.y - this.node.transform.oy + this.node.transform.h + this.margin + container.top + this.node.transform.border + window.scrollY
            });
            const width = rightBottom.x - leftTop.x;
            const height = rightBottom.y - leftTop.y;
            this.element.style.transform = `translate(${leftTop.x}px, ${leftTop.y}px)`;
            this.n.style.transform = `translate(${0}px, ${0}px)`;
            this.n.style.width = `${width}px`;
            this.e.style.transform = `translate(${width}px, ${0}px)`;
            this.e.style.height = `${height}px`;
            this.s.style.transform = `translate(${0}px, ${height}px)`;
            this.s.style.width = `${width}px`;
            this.w.style.transform = `translate(${0}px, ${0}px)`;
            this.w.style.height = `${height}px`;
            this.nw.style.transform = `translate(${-this.resize}px, ${-this.resize}px)`;
            this.ne.style.transform = `translate(${width - this.resize}px, ${-this.resize}px)`;
            this.se.style.transform = `translate(${width - this.resize}px, ${height - this.resize}px)`;
            this.sw.style.transform = `translate(${-this.resize}px, ${height - this.resize}px)`;
            // Re-render node
            this.node.render();
        }
    }

}
