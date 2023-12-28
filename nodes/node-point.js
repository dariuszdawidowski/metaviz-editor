/**
 * Metaviz Node Point
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodePoint extends MetavizNode {

    constructor(args) {
        super(args);

        // Set size
        this.setSize({width: 12, height: 12, minWidth: 12, minHeight: 12, resize: 'none'});

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
     * Export node to different format
     */

    export(format, args = {}) {

        const {offsetX = 0, offsetY = 0} = args;

        if (format == 'miniature') {
            return `<div class="miniature metaviz-node-point" data-id="${this.id}"></div>`;
        }

        else if (format == 'image/svg+xml') {
            return `<circle cx="${this.transform.x - offsetX}" cy="${this.transform.y - offsetY}" r="${this.transform.w - 4}" stroke="rgb(255, 255, 255)" stroke-width="4" fill="transparent" />`;
        }

        return super.export(format);
    }

}

global.registry.add({proto: MetavizNodePoint, name: 'Point', icon: '<span class="mdi mdi-record-circle-outline"></span>'});

i18n['pl']['point'] = 'punkt';
i18n['eo']['point'] = 'punkto';
