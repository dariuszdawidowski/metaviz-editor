/**
 * Metaviz Socket
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizSocket {

    /**
     * Constructor
     * args:
     * name: <string>
     * node: {id: <uuid4>}
     * parent: [DOMElement]
     * transform: {x: [Number], y: [Number]}
     */

    constructor(args) {

        // Node name
        this.name = args.name;

        // Main DOM element
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-socket-hook');
        this.element.style.position = 'absolute';
        this.element.style.display = 'none';

        // Representation DOM element
        this.circle = document.createElement('div');
        this.circle.classList.add('metaviz-socket');
        this.circle.style.position = 'absolute';
        this.circle.style.display = 'none';
        this.circle.dataset.nodeId = args.node.id;
        metaviz.render.container.append(this.circle);

        // Transform
        this.transform = {
            x: 0,
            y: 0,
            border: 0,
            set: (coords) => {
                this.transform.x = coords.x;
                this.transform.y = coords.y;
                if ('border' in coords) this.transform.border = coords.border;
            }
        };
        assign(this.transform, args.transform);

        // Parent DOM element
        this.parent = null;
        if ('parent' in args) this.attachTo(args.parent);
    }

    /**
     * Destructor
     */

    destructor() {
        if (this.parent) this.parent.remove(this.element);
    }

    /**
     * Attach to parent
     * parent: DOM element
     */

    attachTo(parent) {
        this.parent = parent;
        this.parent.append(this.element);
    }

    /**
     * Visualization (different than this.element)
     * coords {x,y} or false to hide
     */

    visualize(coords) {
        if (typeof(coords) == 'object') {
            const container = metaviz.container.getOffset();
            this.circle.style.transform = `translate(${coords.x - 6 + this.transform.border + container.left}px, ${coords.y - 6 + this.transform.border + container.top}px)`;
            this.circle.style.display = 'block';
        }
        else if (typeof(coords) == 'boolean' && coords == false) {
            this.circle.style.display = 'none';
        }
    }

}
