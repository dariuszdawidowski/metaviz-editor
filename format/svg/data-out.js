/**
 * SVG Encoder
 * (c) 2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutSVG {

    /**
     * Convert objects to svg
     */

    serialize(nodes) {

        // Buffer
        let svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n`;

        // Nodes
        nodes.forEach(node => {
            svg += '  ' + node.export('image/svg+xml') + '\n';
        });

        // Links
        nodes.forEach(node => {
            node.links.get('out').forEach(link => {
            });
        });

        // Return string
        svg += '</svg>';
        return svg;
    }

}