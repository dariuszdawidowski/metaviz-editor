/**
 * Metaviz Node Control Bitmap Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlBitmap extends MetavizControl {

    /**
     * Constructor
     * @param arg.name: name of the image
     * @param arg.uri: uri to image bitmap
     * @param arg.onLoad: loaded callback
     */

    constructor(args = {}) {
        super();

        // Params
        const { name = null, uri = null, onLoad = null } = args;

        // Control name
        this.name = name;

        // URI
        this.uri = uri;

        // Element
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-bitmap');
        if (this.name) this.element.classList.add('metaviz-control-bitmap-' + this.name.slug());

        // Img
        this.img = new Image();
        this.img.draggable = false;
        this.element.append(this.img);

        // Callback
        this.img.addEventListener('load', this.loaded.bind(this));

        // Set bitmap image
        if (uri) this.set(uri, onLoad);
    }

    /**
     * Set image by uri string (http(s) URL | data:image/*)
     */

    set(uri, onLoad = null) {
        this.onLoad = onLoad;
        //this.element.style.backgroundColor = 'white';
        this.img.src = uri;
    }

    /**
     * Callback manager
     */

    loaded() {
        if (this.onLoad) {
            this.onLoad();
            this.onLoad = null;
        }
    }

    /**
     * Get URI
     */

    get() {
        return this.uri;
    }

    /**
     * Get resolution
     * (onLoad depended)
     * @param args: {maxWidth: <Number>} get resolution but not higher than given one
     * @returns: {width: <Number>, height: <Number>}
     */

    getResolution(args = {}) {
        if ('maxWidth' in args) {
            const factor = (this.img.naturalWidth > args.maxWidth) ? args.maxWidth / this.img.naturalWidth : 1;
            return {width: this.img.naturalWidth * factor, height: this.img.naturalHeight * factor};
        }
        return {width: this.img.naturalWidth, height: this.img.naturalHeight};
    }

}
