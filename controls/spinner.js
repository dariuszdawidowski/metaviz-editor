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
        this.control = this.element; // DEPRECATED (backward compatibility)
        this.element.classList.add('metaviz-control-spinner');
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

}
