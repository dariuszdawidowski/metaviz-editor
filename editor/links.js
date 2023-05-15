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
     * @param args.id <string>: Unique ID
     * @param args.type <string>: Link class name
     * @param args.start <TotalDiagramNode>: Start node
     * @param args.end <TotalDiagramNode>: End node
     */

    add(args, visible = true) {

        // Optional: decode string to json
        if (typeof(args) == 'string') args = JSON.parse(args)

        // Check if nodes exists
        if (!args.start || !args.end) return null;

        // Create
        const newLink = new registry.links[args.type].proto(args);

        // Store link
        this.list.push(newLink);

        // Add to current layer (if layer exist and link is freshly created in the editor)
        if (this.layers.current && !this.layers.current.getLink(newLink.id)) {
            this.layers.current.setLink({
                id: newLink.id,
                type: args.type,
                start: args.start,
                end: args.end,
            });
        }

        // Add to DOM
        this.render.board.append(newLink.element);

        // It's not visible?
        if (!visible) newLink.visible(false);

        // Return new link
        return newLink;

    }

}
