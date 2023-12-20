/**
 * Metaviz Node Control base class
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControl {

    constructor() {
        // Main DOM element
        this.element = null;
        // Show/hide state
        this.display = null;
        // Editing state
        this.editing = false;
    }

    /**
     * Set content
     */

    set(text) {
        /* Override */
    }

    /**
     * Get content
     */

    get() {
        /* Override */
        return null;
    }

    /**
     * Edit mode
     */

    edit(enable) {
        this.editing = enable;
    }

    /**
     * Event callback
     */

    on(eventName, callbackName) {
        this.element.addEventListener(eventName, (event) => {
            callbackName(event.target.value || event.target.innerText);
        });
    }

    /**
     * Show
     */

    show() {
        this.element.style.display = this.display || 'block';
    }

    /**
     * Hide
     */

    hide() {
        this.display = this.element.style.display;
        this.element.style.display = 'none';
    }

    /**
     * Title hover cloud
     */

    tooltip(text) {
        this.element.title = text;
    }

    /**
     * Launch focus event
     */

    focus() {
        this.element.focus();
    }

    /**
     * Launch blur event
     */

    blur() {
        this.element.blur();
    }

    /**
     * Get selected text
     */

    getSelection() {
        return '';
    }
}
