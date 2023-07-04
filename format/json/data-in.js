/**
 * MetavizJSON Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
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

        // Version 27..28
        if (json.format == 'MetavizJSON' && json.version >= 27 && json.version <= 28) {

            // Board ID
            if ('id' in json && json.id) metaviz.editor.id = json.id;

            // Board name (optional)
            if ('name' in json && json.name) metaviz.editor.setBoardName(json.name);

            // Board last change
            if ('updated' in json && json.updated) metaviz.editor.sync.updated = json.updated;

            // Prepare lookup table for reindex uuids
            let reindexLookup = {};
            if (reindex) {
                for (const node of json.nodes) {
                    reindexLookup[node.id] = crypto.randomUUID();
                }
            }

            // Base Layer
            const layer = json.layers.find(layer => layer.name == 'Base Layer' || layer.id == 0);
            if (layer) {

                // Create nodes
                for (const node of json.nodes) {

                    // Store transform before reindex
                    const vnode = layer.nodes.find(n => n.id == node.id);

                    // Optional reindex ID
                    if (reindex) node.id = reindexLookup[node.id];

                    // Optional reparent
                    if (reparent) node.parent = metaviz.render.nodes.parent;

                    // Create
                    const newNode = metaviz.render.nodes.add(node, false);
                    newNode.setPosition({x: vnode.x + offset.x, y: vnode.y + offset.y})
                    newNode.setSize({width: vnode.w, height: vnode.h})
                    newNode.transform.zindex = vnode.zindex;
                    newNode.render();
                    newNode.update();
                    newNodes.push(newNode);
                }

                // Create links
                for (const link of layer.links) {
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

            }

            // Successfully created
            return [newNodes, newLinks];

        }

        return false;
    }

}
