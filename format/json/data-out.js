/**
 * MetavizJSON Encoder
 * (c) 2009-2025 Dariusz Dawidowski, All Rights Reserved.
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
            'version': 40,
            'id': metaviz.editor.id,
            'name': metaviz.editor.name,
            'nodes': [],
            'links': []
        };

        // Nodes
        nodes.forEach(node => {
            const n = node.serialize();
            json.nodes.push({
                id: n.id,
                parent: n.parent,
                type: n.type,
                params: n.params,
                x: n.x,
                y: n.y,
                z: n.zindex,
                w: n.w,
                h: n.h
            });
        });

        // Links
        nodes.forEach(node => {
            node.links.get('out').forEach(link => {
                // Link not on list already
                if (!json.links.find(l => l.id == link.id)) {
                    // Start node exists
                    if (json.nodes.find(n => n.id == link.start.id)) {
                        // End node exists
                        if (json.nodes.find(n => n.id == link.end.id)) {
                            // Add link
                            if (link.type != 'MetavizLinkVirtual') json.links.push(link.serialize());
                        }
                    }
                }
            });
        });

        return json;
    }

}