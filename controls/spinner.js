/**
 * Metaviz Node Control Spinner Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlSpinner extends MetavizControl {

    /**
     * Constructor
     */

    constructor() {
        super();
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-control-spinner');
        this.counter = document.createElement('div');
        this.counter.classList.add('counter');
        this.element.append(this.counter);
    }

    show() {
        this.counter.innerText = '';
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    set(percent) {
        this.counter.innerText = `${Math.round(percent)}%`;
    }

}
