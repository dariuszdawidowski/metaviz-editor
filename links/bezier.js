/**
 * Metaviz Bezier Default Link
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
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
     * Update position
     */

    update() {
        // Left->right
        if (this.start.transform.x <= this.end.transform.x) {
            // Get start socket closest to end node
            const {x: x1, y: y1} = this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y});
            // Get end socket closest to start node
            const {x: x2, y: y2} = this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y});
            const hx1 = x1 + Math.abs(x2 - x1) * this.curvature;
            const hx2 = x2 - Math.abs(x2 - x1) * this.curvature;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const angle = Math.atan2(y2 - y1, ((x2 + hx2) / 2) - ((x1 + hx1) / 2));
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
            // Get end socket closest to start node
            const {x: x1, y: y1} = this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y});
            // Get start socket closest to end node
            const {x: x2, y: y2} = this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y});
            const hx1 = x1 + Math.abs(x2 - x1) * this.curvature;
            const hx2 = x2 - Math.abs(x2 - x1) * this.curvature;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const angle = Math.atan2(y2 - y1, ((x2 + hx2) / 2) - ((x1 + hx1) / 2));
            this.path.setAttribute('d', `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`);
            this.arrow.setAttribute('points', `${cx + 6}, ${cy - 4} ${cx - 6}, ${cy} ${cx + 6}, ${cy + 4} ${cx + 6}, ${cy - 4}`);
            this.arrow.setAttribute('transform', `rotate(${angle * (180 / Math.PI)} ${cx} ${cy})`);
            this.circleStart.setAttribute('cx', x2);
            this.circleStart.setAttribute('cy', y2);
            this.circleEnd.setAttribute('cx', x1);
            this.circleEnd.setAttribute('cy', y1);
        }
    }

}

global.registry.add({proto: MetavizLinkBezier, name: 'Link'});

