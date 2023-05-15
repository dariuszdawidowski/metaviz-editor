/**
 * Metaviz Node Control Links Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlLink extends MetavizControl {

    constructor(href = null, filename = null) {
        super();
        // Input
        this.element = document.createElement('a');
        this.control = this.element; // DEPRECATED (backward compatibility)
        if (href) {
            this.element.href = href;
            this.element.download = filename || href.basename();
        }
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-link');
    }

    /* Link url */

    set(href, filename = null) {
        this.element.href = href;
        this.element.download = filename || href.basename();
    }

    get() {
        return this.element.href;
    }

}
