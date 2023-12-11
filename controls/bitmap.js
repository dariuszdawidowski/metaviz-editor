/**
 * Metaviz Node Control Bitmap Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlBitmap extends MetavizControl {

    /**
     * Constructor
     * @param arg.url: url to image bitmap
     */

    constructor(args = {}) {
        super();

        // Params
        const { name = null, uri = null } = args;

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
        this.img = document.createElement('img');
        this.element.append(this.img);

        // Set bitmap image
        if (uri) this.set(uri);
    }

    /**
     * Set image by uri string (http(s) URL | data:image/*)
     */

    set(uri) {
        this.element.style.backgroundColor = 'white';
        this.img.src = uri;
    }

    /**
     * Get URI
     */

    get() {
        return this.uri;
    }

    /**
     * Get resolution (async)
     * @param constraints: {maxWidth: <Number>}
     * @returns: {width: <Number>, height: <Number>}
     */

    getResolution(constraints) {
        return new Promise((resolve, reject) => {
            const imgElement = document.createElement('img');
            imgElement.src = this.uri;
            const image = new Image();
            image.addEventListener('load', () => {
                const factor = (image.naturalWidth > constraints.maxWidth) ? constraints.maxWidth / image.naturalWidth : 1;
                let width = image.naturalWidth * factor;
                let height = image.naturalHeight * factor;
                resolve({width, height});
            });
            image.src = imgElement.src;
        });
    }

}
