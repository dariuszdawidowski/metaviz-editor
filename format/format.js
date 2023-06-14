/**
 * Metaviz Format Manager
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizFormat {

    /**
     * Constructor
     */

    constructor() {

        // Register formats here for autodetection
        this.in = {};
        this.out = {};
    }

    /**
     * Register new format
     */

    register(mimetype, pointer) {
        this.in[mimetype] = pointer.in;
        this.out[mimetype] = pointer.out;
    }

    /**
     * Generic serialize
     */

    serialize(mimetype, data) {
        console.log(this, mimetype, data)
        return this.out[mimetype].serialize(data);
    }

    /**
     * Generic deserialize
     */

    deserialize(mimetype, data, args = {}) {
        this.in[mimetype].deserialize(data, args);
    }

}
