/**
 * Metaviz Link base class
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizLink extends TotalDiagramLink {

    /**
     * Constructor args = {...}
     * start: <MetavizNode> | id <uuid4>
     * end: <MetavizNode> | id <uuid4>
     */

    constructor(args) {
        super(args);

        // Start Node
        if ('start' in args) {
            if (typeof(args.start) == 'string') this.start = metaviz.render.nodes.get(args.start);
            else if (typeof(args.start) == 'object') this.start = args.start;
        }

        // End Node
        if ('end' in args) {
            if (typeof(args.end) == 'string') this.end = metaviz.render.nodes.get(args.end);
            else if (typeof(args.end) == 'object') this.end = args.end;
        }
    }

    /**
     * Set or get visibility
     */

    visible(state = null) {
        // Setter
        if (state !== null) {
            // Show
            if (state == true) {
                this.element.style.display = 'block';
            }
            // Hide
            else {
                this.element.style.display = 'none';
            }
        }
        // Getter
        else {
            return (this.element.style.display == 'block');
        }
    }

}
