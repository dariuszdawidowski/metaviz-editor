/**
 * MetavizJSON Decoder
 * (c) 2009-2025 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInJSON {

    /**
     * Convert json to nodes & links
     */

    deserialize(json, args = {}) {
        const { reindex = false, reparent = false, realign = false } = args; 
        const offset = {x: 'offset' in args ? args.offset.x : 0, y: 'offset' in args ? args.offset.y : 0};

        // List of new created nodes and links
        const newNodes = [];
        const newLinks = [];
        const reindexLookup = {};

        // Version 40
        if (json.format == 'MetavizJSON' && json.version == 40) {

            // Board ID (optional)
            if ('id' in json && json.id) metaviz.editor.id = json.id;

            // Board name (optional)
            if ('name' in json && json.name) metaviz.editor.setBoardName(json.name);

            // Board last change
            if ('updated' in json && json.updated) metaviz.editor.sync.updated = json.updated;

            // Prepare lookup table for reindex uuids
            if (reindex) {
                for (const node of json.nodes) {
                    reindexLookup[node.id] = crypto.randomUUID();
                }
            }

            // Create nodes
            for (const node of json.nodes) {

                // Optional reindex ID
                if (reindex) node.id = reindexLookup[node.id];

                // Optional reparent
                if (reparent) node.parent = metaviz.render.nodes.parent;

                // Create
                const newNode = metaviz.render.nodes.add(node, false);
                newNode.setPosition({x: node.x + offset.x, y: node.y + offset.y})
                newNode.setSize({width: node.w, height: node.h})
                newNode.transform.zindex = node.z;
                newNode.render();
                newNode.update();
                newNodes.push(newNode);
            }

            // Create links
            for (const link of json.links) {
                if (reindex) {
                    link.id = crypto.randomUUID();
                    link.start = reindexLookup[link.start];
                    link.end = reindexLookup[link.end];
                }
                const newLink = metaviz.render.links.add({
                    id: link.id,
                    type: link.type,
                    start: link.start,
                    end: link.end,
                });
                newLinks.push(newLink);
            }

            return [newNodes, newLinks];
        }

        return false;
    }

}
