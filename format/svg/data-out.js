/**
 * SVG Encoder
 * (c) 2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutSVG {

    /**
     * Convert objects to svg
     */

    serialize(nodes) {

        // Compute sizes
        const bbox = metaviz.render.getBounds(nodes);

        // Buffer
        let svg = `<svg width="${bbox.width}" height="${bbox.height}" xmlns="http://www.w3.org/2000/svg" style="background: #dddfe1;">\n`;

        // Nodes
        nodes.forEach(node => {
            svg += '  ' + node.export('image/svg+xml', {offsetX: bbox.left, offsetY: bbox.top}) + '\n';
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