/**
 * MetavizJSON Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInJSON {

    /**
     * Convert json to nodes & links
     */

    deserialize(json, args = {}) {
        const { reindex = false, reparent = false, realign = false, save = false } = args; 
        const offset = {x: 'offset' in args ? args.offset.x : 0, y: 'offset' in args ? args.offset.y : 0};

        // List of new created nodes
        const newNodes = [];

        // Version 27
        if (json.format == 'MetavizJSON' && json.version == 27) {

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

                    // Metadata
                    node['meta'] = (('data' in node) && node['data'] != null) ? node['data'] : {};
                    delete node['data'];

                    // Create
                    const newNode = metaviz.render.nodes.add(node, false);
                    newNode.setPosition({x: vnode.x + offset.x, y: vnode.y + offset.y})
                    newNode.setSize({width: vnode.w, height: vnode.h})
                    newNode.transform.zindex = vnode.zindex;
                    newNode.render();
                    newNode.update();
                    newNodes.push(newNode);
                }

                const newLinks = [];

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

                // Save to history & databse
                if (save) {
                    metaviz.editor.history.clearFuture();
                    metaviz.editor.history.store({
                        action: 'add',
                        nodes: newNodes.map(n => {
                            return n.serialize('transform');
                        }),
                        links: newLinks.map(l => {
                            return l.serialize();
                        })
                    });
                }

            }

            // Successfully created
            return newNodes;

        }

        return false;
    }

}
