/**
 * Metaviz Node Point
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodePoint extends MetavizNode {

    constructor(args) {
        super(args);

        // Set size
        this.setSize({width: 20, height: 20});

        // Add socket
        this.addSockets({
            center: new MetavizSocket({
                name: 'center',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox,
                    y: this.transform.oy
                }
            })
        });
    }

    /**
     * Make node elastic
     */

    elastic(state) {
        if (state == true) {
            this.transform.ox = 0;
            this.transform.oy = 0;
            this.setStyle('transform', 'translate(0px, 0px) scale(1)');
        }
        else {
            super.elastic(false);
        }
    }

    /**
     * Miniature version
     */

    miniature(content=false) {
        return `<div class="miniature metaviz-node-point" data-id="${this.id}"></div>`;
    }

}

registry.add({proto: MetavizNodePoint, name: 'Point', icon: '<i class="fas fa-bullseye"></i>'});
