/**
 * Metaviz Node Dummy
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeDummy extends MetavizNode {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);
        const info = document.createElement('div');
        info.classList.add('info');
        info.innerHTML = `❌<br>${'type' in args ? args.type : 'Node'}<br>NOT found<br>☣️<br>Quarantined until repaired`;
        this.element.append(info);
        this.setSize({width: 120, height: 120});
        this.sockets.get = (transform) => {return {x: this.transform.x, y: this.transform.y}};
    }

}
