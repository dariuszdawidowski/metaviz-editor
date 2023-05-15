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
     * Get selected content (browser based)
     */

    /*getSelection() {
        if (typeof window.getSelection != 'undefined') {
            return window.getSelection().toString();
        } else if (typeof document.selection != 'undefined' && document.selection.type == 'Text') {
            return document.selection.createRange().text;
        }

        return null;
    }*/

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
     * Enabled (write or action ready)
     */

    enable() {
        this.element.readOnly = false;
        this.element.disabled = false;
    }

    /**
     * Disabled (read-only or inactive)
     */

    disable() {
        this.element.readOnly = true;
        this.element.disabled = false;
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

}
