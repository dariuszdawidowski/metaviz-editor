/**
 * Metaviz Node Control Button Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlButton extends MetavizControl {

    constructor(text = null) {
        super();

        // Button
        this.element = document.createElement('button');
        this.control = this.element; // DEPRECATED (backward compatibility)
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-button');
        if (text) {
            this.element.classList.add('metaviz-control-button-' + text.slug());
            this.set(text);
        }

        // View mode
        if (metaviz.editor.interaction == 'view') this.edit(false);
    }

    /**
     * Button text
     */

    set(text) {
        this.element.innerText = text;
    }

    get() {
        return this.element.innerText;
    }

    /**
     * Can't edit button text
     */

    edit(enable) {
        this.editing = false;
    }

}
