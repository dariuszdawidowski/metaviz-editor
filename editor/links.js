/**
 * Metaviz Links manager
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizLinksManager extends TotalDiagramLinksManager {

    /**
     * Constructor
     */

    constructor() {
        super();
        this.layers = null;
    }

    /**
     * Add a link between two nodes
     * @param args.id <string>: Unique ID (optional)
     * @param args.type <string>: Link class name
     * @param args.start <TotalDiagramNode>: Start node
     * @param args.end <TotalDiagramNode>: End node
     */

    add(args, visible = true) {

        // Optional: decode string to json
        if (typeof(args) == 'string') args = JSON.parse(args)

        // Nodes
        if (!args.start || !args.end) return null;
        const startNode = metaviz.render.nodes.get(args.start);
        const endNode = metaviz.render.nodes.get(args.end);
        if (!startNode || !endNode) return null;

        // Create
        const newLink = new registry.links[args.type].proto({
            id: 'id' in args ? args.id : crypto.randomUUID(),
            type: args.type,
            start: startNode,
            end: endNode
        });

        // Store link
        this.list.push(newLink);

        // Add to DOM
        this.render.board.append(newLink.element);

        // It's not visible?
        if (!visible) newLink.visible(false);

        // Return new link
        return newLink;

    }

}
