/**
 * Metaviz Arrange
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
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
            node.setPosition({x: cursorX, y: bounds.center.y});
            node.update();
            cursorX += node.transform.w + margin;
        });
        metaviz.editor.update();
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
            node.setPosition({x: bounds.center.x, y: cursorY});
            node.update();
            cursorY += node.transform.h + margin;
        });
        metaviz.editor.update();
    }

}
