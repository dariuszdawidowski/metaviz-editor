/**
 * Metaviz Arrange
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizArrangeAlign extends MetavizGeometry {

    arrange(nodes, args) {
        if (args.direction == 'horizontal') {
            return this.arrangeHorizontal(nodes, args);
        }
        else if (args.direction == 'vertical') {
            return this.arrangeVertical(nodes, args);
        }
    }

    arrangeHorizontal(nodes, args) {
        const bounds = this.getBounds(nodes);
        const margin = this.getAvgHorizMargin(nodes);
        let cursorX = bounds.left;
        nodes.sort((a, b) => a.transform.x - b.transform.x).forEach((node) => {
            metaviz.editor.history.store({
                action: 'move',
                nodes: [node.id],
                position: {x: cursorX, y: bounds.center.y}
            });
            node.transform.x = cursorX;
            node.transform.y = bounds.center.y;
            cursorX += node.transform.w + margin;
        });
        metaviz.render.layers.update(nodes);
    }

    arrangeVertical(nodes, args) {
        const bounds = this.getBounds(nodes);
        const margin = this.getAvgVertMargin(nodes);
        let cursorY = bounds.top;
        nodes.sort((a, b) => a.transform.y - b.transform.y).forEach((node) => {
            metaviz.editor.history.store({
                action: 'move',
                nodes: [node.id],
                position: {x: bounds.center.x, y: cursorY}
            });
            node.transform.x = bounds.center.x;
            node.transform.y = cursorY;
            cursorY += node.transform.h + margin;
        });
        metaviz.render.layers.update(nodes);
    }

}
