/**
 * Metaviz Node Control Label
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlLabel extends MetavizControl {

    constructor(params) {
        super();

        // Params
        const { name = null, value = null } = params;

        // Control name
        this.name = name;

        // Element
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-label');
        if (this.name) this.element.classList.add('metaviz-control-label-' + this.name.slug());

        // Content
        if (value) this.set(value);
    }

    /**
     * Set content text
     */

    set(text) {
        this.element.innerText = text;
    }

    /**
     * Get all text
     */

    get() {
        return this.element.innerText;
    }

}
