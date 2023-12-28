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
        const margin = 10;

        // Buffer
        let svg = `<svg width="${bbox.width + (margin * 2)}" height="${bbox.height + (margin * 2)}" xmlns="http://www.w3.org/2000/svg" style="background: #dddfe1;font-family: sans-serif;">\n`;

        // Nodes
        nodes.forEach(node => {
            svg += '  ' + node.export('image/svg+xml', {offsetX: bbox.left - margin, offsetY: bbox.top - margin}) + '\n';
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