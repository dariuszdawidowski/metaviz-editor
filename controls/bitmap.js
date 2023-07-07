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
        const { uri = null } = args;

        // URI
        this.uri = null;

        // Element
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-bitmap');

        // Set bitmap image
        if (uri) this.set(uri);
    }

    /**
     * Set image by url or File object
     */

    set(uri) {
        this.element.style.backgroundColor = 'white';

        // URI String
        if (uri.constructor.name == 'String') {
            this.element.style.backgroundImage = `url(${uri})`;
            this.uri = uri;
        }

        // Encoded File
        else if (uri.constructor.name == 'File') {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.element.style.backgroundImage = `url(${event.target.result})`;
                this.uri = event.target.result;
            }
            reader.readAsDataURL(uri);
        }

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
