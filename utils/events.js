/**
 * Metaviz Event Manager
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizEventManager {

    /**
     * Constructor
     */

    constructor() {
        /**
         * Listeners registry
         * {'id': {type: 'real event name', target: 'DOM element', callback: <function>, active: bool}, ...}
         */
        this.listeners = {};
    }

    /**
     * Add event listener
     * 
     * id: identifier ('group:name' possible)
     * element: DOM element
     * type: javascript event name
     * callback: callback function
     */

    subscribe(id, element, type, callbackName) {
        this.listeners[id] = {target: element, type: type, callback: callbackName, active: true}; 
        element.addEventListener(type, callbackName);
    }

    /**
     * Subscrible global event
     */

    listen(name, callbackName) {
        this.subscribe(name, metaviz.render.container, name, callbackName);
    }

    /**
     * Call event
     */

    call(id, data = null) {
        if (id in this.listeners) {
            this.listeners[id].target.dispatchEvent(
                data === null ?
                new Event(id) :
                new CustomEvent(id, { detail: data })
            );
        }
    }

    /**
     * Remove event listener
     * 
     * id: identifier ('group:name' possible)
     */

    unsubscribe(id) {
        if (id in this.listeners) {
            this.listeners[id].target.removeEventListener(this.listeners[id].type, this.listeners[id].callback);
            delete this.listeners[id];
        }
    }

    /**
     * Enable disabled listener
     * 
     * id: identifier ('group:*' possible)
     */

    enable(id) {
        // Group
        if (id.slice(-2) == ':*') {
            const group = id.slice(0, -2);
            for (const listener of Object.keys(this.listeners)) {
                if (listener.split(':')[0] == group) {
                    if (!(listener in this.listeners) || !this.listeners[listener].active) {
                        this.listeners[listener].target.addEventListener(this.listeners[listener].type, this.listeners[listener].callback);
                        this.listeners[listener].active = true;
                    }
                }
            }
        }
        // Single
        else if (id in this.listeners) {
            if (!(id in this.listeners) || !this.listeners[id].active) {
                this.listeners[id].target.addEventListener(this.listeners[id].type, this.listeners[id].callback);
                this.listeners[id].active = true;
            }
        }
    }

    /**
     * Disable listener
     * 
     * id: identifier ('group:*' possible)
     */

    disable(id) {
        // Group
        if (id.slice(-2) == ':*') {
            const group = id.slice(0, -2);
            for (const listener of Object.keys(this.listeners)) {
                if (listener.split(':')[0] == group) {
                    this.listeners[listener].target.removeEventListener(this.listeners[listener].type, this.listeners[listener].callback);
                    this.listeners[listener].active = false;
                }
            }
        }
        // Single
        else if (id in this.listeners) {
            this.listeners[id].target.removeEventListener(this.listeners[id].type, this.listeners[id].callback);
            this.listeners[id].active = false;
        }
    }

}
