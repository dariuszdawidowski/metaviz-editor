/**
 * Metaviz Selection Basic
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizSelection {

    constructor() {

        // All selected nodes [MetavizNode, ...]
        this.nodes = []; 

        // Move offset for undo/sync
        this.transform = {
            x: 0,
            y: 0,
            update: function(delta) {
                this.x -= delta.x;
                this.y -= delta.y;
            },
            getOffset: function(start={x: 0, y: 0}) {
                return {x: -this.x + start.x, y: -this.y + start.y};
            },
            total: function() {
                return this.x + this.y;
            },
            clear: function() {
                this.x = 0;
                this.y = 0;
            }
        };

        // Selection box
        this.box = {
            element: null,
            startPos: {x: 0, y: 0},
            endPos: {x: 0, y: 0},
            position: function(x1, y1, x2, y2) {
                let left = 0;
                let top = 0;
                let width = 0;
                let height = 0;
                // Right
                if (x2 > x1) {
                    left = x1;
                    width = x2 - x1;
                }
                // Left
                else {
                    left = x1 - (x1 - x2);
                    width = x1 - x2;
                }
                // Down
                if (y2 > y1) {
                    top = y2 - (y2 - y1);
                    height = y2 - y1;
                }
                // Up
                else {
                    top = y2;
                    height = y1 - y2;
                }
                this.element.style.transform = `translate(${left}px, ${top}px)`;
                this.element.style.width = `${width}px`;
                this.element.style.height = `${height}px`;
            },
            start: function(x, y) {
                this.startPos.x = x;
                this.startPos.y = y;
                this.position(this.startPos.x, this.startPos.y, this.startPos.x, this.startPos.y);
            },
            end: function(x, y) {
                this.endPos.x = x;
                this.endPos.y = y;
                this.position(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
            },
            leftTop: function() {
                let left = 0;
                let top = 0;
                // Right
                if (this.endPos.x > this.startPos.x) {
                    left = this.startPos.x;
                }
                // Left
                else {
                    left = this.endPos.x;
                }
                // Down
                if (this.endPos.y > this.startPos.y) {
                    top = this.startPos.y;
                }
                // Up
                else {
                    top = this.endPos.y;
                }
                return {x: left, y: top};
            },
            rightBottom: function() {
                let right = 0;
                let bottom = 0;
                // Right
                if (this.endPos.x > this.startPos.x) {
                    right = this.endPos.x;
                }
                // Left
                else {
                    right = this.startPos.x;
                }
                // Down
                if (this.endPos.y > this.startPos.y) {
                    bottom = this.endPos.y;
                }
                // Up
                else {
                    bottom = this.startPos.y;
                }
                return {x: right, y: bottom};
            },
            show: function() {
                this.element.style.display = 'block';
            },
            hide: function() {
                this.element.style.display = 'none';
            },
            intersection: (nodes) => {
                nodes.forEach((node) => {
                    if (node.intersects(metaviz.render.screen2World(this.box.leftTop()), metaviz.render.screen2World(this.box.rightBottom()))) this.add(node);
                });
            }
        };
        this.box.element = document.createElement('div');
        this.box.element.classList.add('metaviz-selection');
        this.box.hide();
        metaviz.render.container.append(this.box.element);
    }

    /**
     * Add a new node to selection
     */

    add(node) {

        // Add to the list
        this.nodes.push(node);

        // Re-highlight all the selected nodes
        this.nodes.forEach(n => {
            n.unfocus();
            n.select();
        });

        // Focus current node: show cage and disable highlight
        node.focus();

        // Cancel all piemenus if > 1
        if (this.nodes.length > 1) {
            this.nodes.forEach(n => {
                n.piemenu?.hide();
            });
        }
    }

    /**
     * Delete desired node from selection
     */

    del(node) {
        this.nodes.forEach(n => {
            n.unfocus();
        });
        node.deselect();
        //this.nodes.remove(node);
        arrayRemove(this.nodes, node);
    }

    /**
     * Set new selection
     */

    set(node) {
        this.clear();
        this.add(node);
    }

    /**
     * Get
     * MetavizNode object: find
     * null: get list of nodes
     */

    get(node = null) {
        if (node) {
            return this.nodes.find(n => n.id == node.id);
        }

        return this.nodes;
    }

    /**
     * Get first selected
     */

    getFirst() {
        if (this.nodes.length > 0) return this.nodes[0];
        return null;
    }

    /**
     * Get focused
     */

    getFocused() {
        for (const node of this.nodes) {
            if (node.focused) return node;
        }
        return null;
    }

    /**
     * Add all nodes on desktop to selection
     */

    all() {
        this.clear();
        for (const node of metaviz.render.nodes.get()) if (node.parent == metaviz.render.nodes.parent) this.add(node);
    }

    /**
     * Deselect nodes and clear all selection
     */

    clear() {
        for (const node of this.nodes) {
            node.unfocus();
            node.deselect();
        }
        this.nodes = [];
    }

    /**
     * Returns number of selected nodes
     */

    count() {
        return this.nodes.length;
    }

}
