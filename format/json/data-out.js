/**
 * MetavizJSON Encoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutJSON {

    /**
     * Convert objects to json
     */

    serialize(nodes) {

        // Structure
        const json = {
            'format': 'MetavizJSON',
            'mimetype': 'text/metaviz+json',
            'version': 27,
            'id': metaviz.editor.id,
            'name': metaviz.editor.name,
            'nodes': [],
            'layers': [{
                'id': crypto.randomUUID(),
                'name': 'Base Layer',
                'nodes': [],
                'links': []
            }],
        };

        // Nodes
        nodes.forEach(node => {
            const n = node.serialize();
            json.nodes.push({
                id: n.id,
                parent: n.parent,
                type: n.type,
                data: n.data,
                locked: n.locked
            });
            json.layers[0].nodes.push({
                id: n.id,
                x: n.x,
                y: n.y,
                w: n.w,
                h: n.h,
                zindex: n.zindex
            });
        });

        // Links
        nodes.forEach(node => {
            node.links.get('*').forEach(link => {
                // Link not on list already
                if (!json.layers[0].links.find(l => l.id == link.id)) {
                    // Start node exists
                    if (json.nodes.find(n => n.id == link.start.id)) {
                        // End node exists
                        if (json.nodes.find(n => n.id == link.end.id)) {
                            // Add link
                            json.layers[0].links.push(link.serialize());
                        }
                    }
                }
            });
        });

        return json;
    }

}