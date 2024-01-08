/**
 * Metaviz Bezier Default Link
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizLinkBezier extends MetavizLink {

    /**
     * Constructor args = {...}
     * start: <MetavizNode>
     * end: <MetavizNode>
     */

    constructor(args) {
        // Engine Link constructor
        super(args);

        // Bezier curvature
        this.curvature = 'curvature' in args ? args.curvature : 0.4;

        // Link DOM element
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.element.classList.add('metaviz-link');
        this.element.classList.add('metaviz-link-bezier');

        // Copy ID onto DOM element
        this.element.dataset.id = this.id;

        // Bezier DOM element
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.element.appendChild(this.path);

        // Arrow DOM element
        this.arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        this.element.appendChild(this.arrow);

        // Circle start DOM element
        this.circleStart = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circleStart.setAttribute('r', 6);
        this.element.appendChild(this.circleStart);

        // Circle end DOM element
        this.circleEnd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circleEnd.setAttribute('r', 6);
        this.element.appendChild(this.circleEnd);

        // Update
        this.update();
    }

    /**
     * Export
     */

    export(type, args = {}) {

        const {offsetX = 0, offsetY = 0} = args;

        if (type == 'image/svg+xml') {

            // {x: ..., y: ...}
            let start = null;
            let end = null;

            // arrow direction
            let dir = 0;

            // Left->right
            if (this.start.transform.x <= this.end.transform.x) {
                start = this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y});
                end = this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y});
                dir = -6;
            }
            // Right->left
            else {
                start = this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y})
                end = this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y})
                dir = 6;
            }

            const {x1, y1, x2, y2, hx1, hx2, cx, cy, angle} = this.calculate(
                {x: start.x - offsetX, y: start.y - offsetY},
                {x: end.x - offsetX, y: end.y - offsetY}
            );

            const color = {
                '--link-color': '#6c7984',
            };

            let buffer = '<g>';
            buffer += `<path d="M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}" style="fill:none;stroke:${color['--link-color']};stroke-width:2" />`;
            buffer += `<polyline points="${cx + dir}, ${cy - 4} ${cx - dir}, ${cy} ${cx + dir}, ${cy + 4} ${cx + dir}, ${cy - 4}" transform="rotate(${angle * (180 / Math.PI)} ${cx} ${cy})" style="fill:${color['--link-color']};stroke:${color['--link-color']};stroke-width:1" />`;
            buffer += `<circle r="6" cx="${x1}" cy="${y1}" style="fill:${color['--link-color']};stroke:${color['--link-color']};stroke-width:1" />`;
            buffer += `<circle r="6" cx="${x2}" cy="${y2}" style="fill:${color['--link-color']};stroke:${color['--link-color']};stroke-width:1" />`;
            buffer += '</g>';
            return buffer;
        }
        return super.export(type, args);
    }

    /**
     * Calculate position
     */

    calculate(start, end) {
        const hx1 = start.x + Math.abs(end.x - start.x) * this.curvature;
        const hx2 = end.x - Math.abs(end.x - start.x) * this.curvature;
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const angle = Math.atan2(end.y - start.y, ((end.x + hx2) / 2) - ((start.x + hx1) / 2));
        return {x1: start.x, y1: start.y, x2: end.x, y2: end.y, hx1, hx2, cx, cy, angle};
    }

    /**
     * Update position
     */

    update() {
        // Left->right
        if (this.start.transform.x <= this.end.transform.x) {
            const {x1, y1, x2, y2, hx1, hx2, cx, cy, angle} = this.calculate(
                this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y}),
                this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y})
            );
            this.path.setAttribute('d', `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`);
            this.arrow.setAttribute('points', `${cx - 6}, ${cy - 4} ${cx + 6}, ${cy} ${cx - 6}, ${cy + 4} ${cx - 6}, ${cy - 4}`);
            this.arrow.setAttribute('transform', `rotate(${angle * (180 / Math.PI)} ${cx} ${cy})`);
            this.circleStart.setAttribute('cx', x1);
            this.circleStart.setAttribute('cy', y1);
            this.circleEnd.setAttribute('cx', x2);
            this.circleEnd.setAttribute('cy', y2);
        }
        // Right->left
        else {
            const {x1, y1, x2, y2, hx1, hx2, cx, cy, angle} = this.calculate(
                this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y}),
                this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y})
            );
            this.path.setAttribute('d', `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`);
            this.arrow.setAttribute('points', `${cx + 6}, ${cy - 4} ${cx - 6}, ${cy} ${cx + 6}, ${cy + 4} ${cx + 6}, ${cy - 4}`);
            this.arrow.setAttribute('transform', `rotate(${angle * (180 / Math.PI)} ${cx} ${cy})`);
            this.circleStart.setAttribute('cx', x1);
            this.circleStart.setAttribute('cy', y1);
            this.circleEnd.setAttribute('cx', x2);
            this.circleEnd.setAttribute('cy', y2);
        }
    }

}

global.registry.add({proto: MetavizLinkBezier, name: 'Link'});

