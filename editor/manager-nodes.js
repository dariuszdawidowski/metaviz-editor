/**
 * Metaviz Nodes Manager
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodesManager extends TotalDiagramNodesManager {

    /**
     * Constructor
     */

    constructor() {
        super();

        // Layers reference
        this.layers = null;

        // Store current parent folder
        this.parent = null;
    }

    /**
     * Add node to scene
     * args: node args from Metaviz Json
     * visible: should be visible after creation
     */

    add(args, visible = true) {

        // Optional: decode string to json
        if (typeof(args) == 'string') args = JSON.parse(args)

        // New node to create
        let newNode = null;

        // Create
        if (args.type in registry.nodes) {
            if (!('name' in args)) args['name'] = registry.nodes[args.type].name;
            newNode = new registry.nodes[args.type].proto(args);
            this.list.push(newNode);
        }
        // Type of node not found: create Quarantine Node instead
        else {
            newNode = new MetavizNodeDummy(args);
            this.list.push(newNode);
        }

        // It it visible?
        if (!visible) newNode.visible(false);

        // Add to DOM
        this.render.board.append(newNode.element);

        // Call node awake function sice it's added into DOM tree
        newNode.awake();

        // Return new node instance
        return newNode;

    }

}
