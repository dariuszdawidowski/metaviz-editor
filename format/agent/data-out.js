/**
 * Metaviz Agent JSON Encoder
 * (c) 2009-2026 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutAgent extends MetavizOutJSON {

    /**
     * Convert nodes & links to json
     */

    serialize(data, args = {}) {
        const json = super.serialize(data, args);
        return {
            nodes: json.nodes.filter(node => {
                const outNode = node;
                if (outNode.type == 'MetavizNodeClipart') outNode.type = 'clipart';
                else if (outNode.type == 'MetavizNodeImage') outNode.type = 'image';
                else if (outNode.type == 'MetavizNodeLabel') outNode.type = 'label';
                else if (outNode.type == 'MetavizNodePoint') outNode.type = 'point';
                else if (outNode.type == 'MetavizNodeText') outNode.type = 'text';
                else if (outNode.type == 'MetavizNodeURL') outNode.type = 'url';
                else return null; // Remove nodes with unrecognized types
                return outNode;
            }),
            links: json.links
        };
    }

}
