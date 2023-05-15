/**
 * Metaviz Arrange Sort v 1.2.3 for Javascript(ES8/2017)
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizArrangeSort extends MetavizGeometry {

    generateLines(elements, maxWidth, margin) {
        const lines = [ [] ];

        elements.forEach((el) =>
        {
            if (this.getTotalWidth(lines[lines.length - 1].concat(el), margin) > maxWidth)
            {
                lines.push([el]);
            }
            else
            {
                lines[lines.length - 1].push(el);
            }
        });

        return lines;
    }

    arrange(nodes, args) {
        // Margin between objects
        const margin = 'margin' in args ? args.margin : 0;
        // Bounds of whole area
        const bounds = this.getBounds(nodes);
        // Generate lines
        const lines = this.generateLines(nodes, bounds.right - bounds.left, margin);
        // Total height
        const totalHeight = lines.map(line => this.getMaxHeight(line, margin)).reduce((acc, v) => acc + v, 0);
        // Final positions
        const positions = [];

        // Calculate
        let heightCounter = 0;
        lines.forEach(line => {
            const maxHeight = this.getMaxHeight(line, margin);
            const totalWidth = this.getTotalWidth(line, margin);
            const cy = bounds.center.y + (heightCounter - (totalHeight / 2) + (maxHeight / 2));

            let widthCounter = 0;
            line.forEach(el => {
                const c = { x: bounds.center.x + (widthCounter - (totalWidth / 2) + (this.getSize(el, margin).x / 2)), y: cy };

                positions.push({ x: c.x - (this.getSize(el, margin).x / 2), y: c.y - (this.getSize(el, margin).y / 2) });

                widthCounter += this.getSize(el, margin).x;
            });

            heightCounter += maxHeight;
        });

        return positions;

    }
}
