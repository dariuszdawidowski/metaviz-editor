/**
 * Metaviz Agent JSON Decoder
 * (c) 2009-2026 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInAgent extends MetavizInJSON {

    /**
     * Convert json to nodes & links
     */

    deserialize(json, args = {}) {
        const data = {
            format: 'MetavizJSON',
            mimetype: 'text/metaviz+json',
            version: 40,
            nodes: json.nodes,
            links: json.links
        };
        return super.deserialize(data, args);
    }

}
