/**
 * Metaviz Symlink
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizLinkSymlink extends MetavizLink {

    /**
     * Constructor args = {...}
     * start: <MetavizNode>
     * end: <MetavizNode>
     */

    constructor(args) {
        // Engine Link constructor
        super(args);

        // Link DOM element
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.element.classList.add('metaviz-link');
        this.element.classList.add('metaviz-link-symlink');

        // Copy ID onto DOM element
        this.element.dataset.id = this.id;

        // Bezier DOM element
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.element.appendChild(this.line);

        // Update
        this.update();
    }

    /**
     * Update position
     */

    update() {
        // Get start socket closest to end node
        const {x: x1, y: y1} = this.start.sockets.get({x: this.end.transform.x, y: this.end.transform.y});
        // Get end socket closest to start node
        const {x: x2, y: y2} = this.end.sockets.get({x: this.start.transform.x, y: this.start.transform.y});
        this.line.setAttribute('x1', x1);
        this.line.setAttribute('y1', y1);
        this.line.setAttribute('x2', x2);
        this.line.setAttribute('y2', y2);
    }

}

global.registry.add({proto: MetavizLinkSymlink, name: 'Symlink'});

