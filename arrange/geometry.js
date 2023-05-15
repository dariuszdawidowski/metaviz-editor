/**
 * Metaviz Geometry Measures and Utils
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizGeometry {

    /**
     * Nodes bound box with center
     * nodes: [MetavizNode, ...]
     * or
     * nodes as transforms without width and height: [{x: <Number>, y: <Number>}, ...]
     */

    getBounds(nodes) {
        const bounds = {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity, center: {x: 0, y: 0}, width: 0, height: 0};

        nodes.forEach((node) => {
            if ('transform' in node) {
                bounds.left = Math.min(node.transform.x - (node.transform.w / 2), bounds.left);
                bounds.top = Math.min(node.transform.y - (node.transform.h / 2), bounds.top);
                bounds.right = Math.max(node.transform.x + (node.transform.w / 2), bounds.right);
                bounds.bottom = Math.max(node.transform.y + (node.transform.h / 2), bounds.bottom);
            }
            else {
                if (node.x < bounds.left) bounds.left = node.x;
                if (node.x > bounds.right) bounds.right = node.x;
                if (node.y < bounds.top) bounds.top = node.y;
                if (node.y > bounds.bottom) bounds.bottom = node.y;
            }
        });

        bounds.center = {x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2};
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        
        return bounds;
    }

    /**
     * Nodes average position
     */

    /*getAvgPosition(nodes) {
        let avg = {x: 0, y: 0};
        nodes.forEach((node) =>
        {
            avg.x += node.transform.x;
            avg.y += node.transform.y;
        });
        return {x: avg.x / nodes.length, y: avg.y / nodes.length};
    }*/

    /**
     * Average horizontal margin
     */

    getAvgHorizMargin(nodes) {
        return 20;
    }

    /**
     * Average vertical margin
     */

    getAvgVertMargin(nodes) {
        return 20;
    }

    /**
     * Nodes total width
     */

    getTotalWidth(nodes, margin) {
        return nodes.reduce((acc, node) => acc + this.getSize(node, margin).x, 0);
    }

    /**
     * Nodes total height
     */

    getTotalHeight(nodes, margin) {
        return nodes.reduce((acc, node) => acc + this.getSize(node, margin).y, 0);
    }

    /**
     * Nodes max height
     */

    getMaxHeight(nodes, margin) {
        return Math.max(...nodes.map((node) => this.getSize(node, margin).y));
    }

    /**
     * Size of the node with margin
     */

    getSize(node, margin) {
        return {
            x: node.transform.w + (margin || 0),
            y: node.transform.h + (margin || 0)
        };
    }

}
