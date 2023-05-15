/**
 * Metaviz Cage
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizCage {

    /**
     * Constructor
     */

    constructor(args) {

        // Mode ('avg' = average proportional resizing, 'free' = separate x,y, 'ratio' = proportional)
        this.mode = 'ratio';

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
                const result = {x: (x - this.prevX) * this.direction.x, y: (y - this.prevY) * this.direction.y};
                this.prevX = x;
                this.prevY = y;
                return result;
            },

            // Returns difference x,y before last mouse move in average scale
            deltaAvg: function(x, y) {
                const factor = 2.0;
                const result = {x: x - this.prevX, y: y - this.prevY};
                this.prevX = x;
                this.prevY = y;
                const avg = ((result.x * this.direction.x) + (result.y * this.direction.y)) / 2;
                return {x: avg * factor, y: avg * factor};
            },

            // Returns difference x,y before last mouse move in picture ratio rx, ry scale
            deltaRatio: function(x, y, rx, ry) {
                const factor = 2.0;
                const result = {x: (x - this.prevX) * this.direction.x, y: (y - this.prevY) * this.direction.y};
                this.prevX = x;
                this.prevY = y;
                const move = Math.abs(result.x) > Math.abs(result.y) ? result.x : result.y;
                return {x: move * rx * factor, y: move * ry * factor};
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
     * Show cage
     * transform: {x: <Number>, y: <Number>}
     */

    show(transform) {
        this.update(transform);
        this.element.style.display = 'block';
        // Disable base navigation events
        metaviz.events.disable('viewer:*');
        metaviz.events.disable('editor:paste');
        metaviz.events.disable('editor:keydown');
        metaviz.events.disable('editor:keyup');
        metaviz.events.enable('browser:prevent');
    }

    /**
     * Hide cage and restore events
     */

    hide() {
        this.element.style.display = 'none';
        // Restore base navigation events
        metaviz.events.disable('browser:prevent');
        metaviz.events.enable('viewer:*');
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
        this.offset.init(event.x, event.y);
        metaviz.render.container.addEventListener('pointermove', this.resizeDragEvent);
        metaviz.render.container.addEventListener('pointerup', this.resizeEndEvent);
        document.addEventListener('mouseout', this.resizeOutEvent);
    }

    /**
     * Resizing
     */

    resizeDrag(event) {
        const node = metaviz.editor.selection.getFocused();
        const size = node.getSize();
        let offset = null;
        switch (size.mode) {
            case 'free':
                offset = this.offset.delta(event.x, event.y);
                break;
            case 'avg':
                offset = this.offset.deltaAvg(event.x, event.y);
                break;
            case 'ratio':
                const ratio = (node.transform.w / node.transform.h).toFixed(2);
                offset = this.offset.deltaRatio(event.x, event.y, ratio, 1);
                break;
        }
        node.setSize({
            width: Math.min(Math.max(size.width + offset.x, size.minWidth), size.maxWidth),
            height: Math.min(Math.max(size.height + offset.y, size.minHeight), size.maxHeight)
        });
        node.update();
        for (const link of node.links.get()) link.update();
        this.update(node.transform);
    }

    /**
     * Stop resize
     */

    resizeEnd(event) {

        // Snap size
        const size = metaviz.editor.selection.nodes[0].getSize();
        const offset = size.mode == 'avg' ? this.offset.deltaAvg(event.x, event.y) : this.offset.delta(event.x, event.y);
        const snappedSize = metaviz.editor.snapToGrid(
            Math.min(Math.max(size.width + offset.x, size.minWidth), size.maxWidth),
            Math.min(Math.max(size.height + offset.y, size.minHeight), size.maxHeight)
        );

        // Set rendered node size
        metaviz.editor.selection.nodes[0].setSize({
            width: snappedSize.x,
            height: snappedSize.y
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
     * transform: {x: <Number>, y: <Number>, ox: <Number>, oy: <Number>}
     */

    update(transform) {
        const container = metaviz.container.getOffset();
        const leftTop = metaviz.render.world2Screen({
            x: transform.x - transform.ox - this.margin + container.x,
            y: transform.y - transform.oy - this.margin + container.y
        });
        const rightBottom = metaviz.render.world2Screen({
            x: transform.x - transform.ox + transform.w + this.margin + transform.border + container.left,
            y: transform.y - transform.oy + transform.h + this.margin + transform.border + container.top
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
        if (metaviz.editor.selection.nodes.length) metaviz.editor.selection.getFocused().render();
    }

}
