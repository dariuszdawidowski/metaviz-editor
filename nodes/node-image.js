/**
 * Metaviz Node Image
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeImage extends MetavizNode {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);

        // Meta defaults
        if (!('uri' in this.params)) this.params['uri'] = '';
        if (!('name' in this.params)) this.params['name'] = '';
        if (!('style' in this.params)) this.params['style'] = 'instant';
        if (!('resX' in this.params)) this.params['resX'] = 0; // Natural image
        if (!('resY' in this.params)) this.params['resY'] = 0; // resolution (not miniature, not node)

        // Migration
        if (this.params['style'] == 'minimal') this.params['style'] = 'raw';

        // Size 0: get from image, N: override image (resized by hand)
        this.transform.w = ('w' in args) ? args['w'] : 0;
        this.transform.h = ('h' in args) ? args['h'] : 0;

        // Image border
        this.border = 8;

        // Map of mimetypes
        this.mimetypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'apng': 'image/apng',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'ico': 'image/x-icon',
            'svg': 'image/svg+xml'
        };

        // Controls
        this.addControls({

            // Bitmap control
            bitmap: new MetavizControlBitmap({
                uri: this.fixURI(this.getResized(this.params.uri)),
                onLoad: () => {
                    // Set initial style (for old image from server)
                    this.setImageAppearance();
                    this.update();
                    metaviz.editor.cage.update();
                    if (this.params['uri'].startsWith('data:image')) this.options.uri.hide();
                }
            }),

            // Input control: Under Icon Name
            name: new MetavizControlInput({
                name: 'name',
                value: this.params.name,
                placeholder: 'Photo',
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {name: value},
                        prev: {name: this.params.name}
                    });
                    this.params.name = value;
                }
            }),

            // Spinner control
            spinner: new MetavizControlSpinner(),
        });

        // Menu options
        this.addOptions({

            // URI in menu
            uri: new TotalProMenuInput({
                placeholder: 'Image URI',
                value: this.params.uri,
                onChange: (value) => {
                    // Undo/Sync
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {uri: value},
                        prev: {uri: this.params.uri}
                    });
                    // New bitmap
                    this.params.set('uri', value);
                }
            }),

            // Style
            style: new TotalProMenuSelect({
                placeholder: 'Style',
                options: {
                    'raw': {icon: '', text: 'Style: Raw'},
                    'instant': {icon: '', text: 'Style: Instant'},
                    'postcard': {icon: '', text: 'Style: Postcard'},
                },
                value: this.params.style,
                onChange: (value) => {

                    // Save new style
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {style: value},
                        prev: {style: this.params.style}
                    });
                    this.params.set('style', value);

                    // Save new size
                    this.setSize({width: this.transform.w, height: this.transform.h}, true);

                    // Cage update
                    metaviz.editor.cage.update();

                    // Hide menu
                    metaviz.editor.menu.hide();
                }
            }),

            // Download file
            download: new TotalProMenuOption({
                icon: '<i class="fas fa-cloud-download-alt"></i>',
                text: 'Download file',
                onChange: () => {
                    metaviz.exchange.downloadFile({path: this.fixURI(this.params.uri), name: 'file'});
                }
            }),

        });

        // Meta setter
        this.params.set = (key, value) => {
            // Set meta
            this.params[key] = value;
            // Properties
            if (key == 'uri' && value != '') {
                this.controls.bitmap.set(this.fixURI(this.getResized(value)), () => {
                    // Set style (for new image)
                    this.setImageAppearance();
                    this.update();
                    metaviz.editor.cage.update();
                    if (this.params['uri'].startsWith('data:image')) this.options.uri.hide();
                });
            }
            else if (key == 'style') {
                this.transform.w = this.transform.h = 0;
                this.setImageAppearance();
                this.update();
                metaviz.editor.cage.update();
            }
            else if (key == 'name') {
                this.controls.name.set(value);
            }
        };

        // Sockets
        this.addSockets();

        // Set appearance for empty image
        if (!('filename' in args) && this.params.uri == '') {
            this.setImageAppearance();
            this.update();
        }

    }

    /**
     * Awake
     */

    awake() {
        // Content locked?
        if (!this.locked.content) this.options.uri.enable();
        else this.options.uri.disable();
    }

    /**
     * Size
     * {width: .., height: ..}
     */

    getSize() {
        return {
            width: this.transform.w,
            height: this.transform.h,
            minWidth: 128,
            minHeight: 128,
            maxWidth: 8192,
            maxHeight: 8192,
            mode: 'ratio'
        };
    }

    /**
     * Click: show image on lightbox
     */

    dblclick() {
        if (this.fixURI(this.params.uri)) {
            // Div for image
            const div = document.createElement('div');
            div.style.backgroundImage = `url(${this.fixURI(this.params.uri)})`;
            div.classList.add('slideshow-image');

            // Disable all events
            metaviz.events.disable('viewer:*');
            metaviz.events.disable('editor:*');
            metaviz.events.enable('browser:prevent');

            // Window size
            const margin = 6;
            const toolbar = 26;
            let size_w = Math.min(Math.round(window.innerWidth * 0.95), this.params.resX + (margin * 2));
            let size_h = Math.min(Math.round(window.innerHeight * 0.95), this.params.resY + toolbar + (margin * 2));

            // Portrait
            const aspect = this.params.resY / this.params.resX;
            if (this.params.resY > this.params.resX) size_w = Math.round(size_h / aspect);

            // Popup window
            const popup = new TotalPopupWindow({
                container: metaviz.render.container,
                width: size_w,
                height: size_h,
                minWidth: 320,
                minHeight: 240,
                margin: {top: 50},
                side: metaviz.system.os.name == 'macos' ? 'left' : 'right',
                content: div,
                borderWidth: 6,
                callback: {
                    onClose: () => {
                        // Enable all events again
                        metaviz.events.disable('browser:prevent');
                        metaviz.events.enable('viewer:*');
                        metaviz.events.enable('editor:*');
                    }
                }
            });

        }
    }

    /**
     * Get resized URI
     * width: miniature width
     */

    getResized(uri) {
        // Base64 data url
        if (uri.startsWith('data:')) return uri;
        // Not remote and listed in supported formats
        if (!this.isRemote() && global.cache['MetavizNodeImage']['miniatures'].includes(this.mimetypes[uri.ext().toLowerCase()])) {
            const name = uri.split('.' + uri.ext());
            return `${name[0]}-${global.cache['MetavizNodeImage']['minWidth']}w.${uri.ext()}`;
        }
        // Fallback original
        return uri;
    }

    /**
     * Is it remote url ?
     */

    isRemote() {
        return this.params.uri.startsWith('http');
    }

    /**
     * Choose theme
     */

    setImageAppearance() {
        this.element.classList.remove('style-raw', 'style-instant', 'style-postcard');
        this.element.classList.add(`style-${this.params.style}`);
        switch (this.params.style) {
            case 'raw':
                // If not set then get dimensions from image size (just created node)
                if (this.transform.w == 0) {
                    const resolution = this.controls.bitmap.getResolution({maxWidth: 1000});
                    this.transform.w = resolution.width + this.border;
                    this.transform.h = resolution.height + this.border;
                }
                break;
            case 'instant':
                // If not set then get standard instant photo dimensions
                if (this.transform.w == 0) {
                    this.transform.w = 168;
                    this.transform.h = 200;
                }
                break;
            case 'postcard':
                // If not set then get standard postcard dimensions
                if (this.transform.w == 0) {
                    this.transform.w = 352;
                    this.transform.h = 256;
                }
                break;
        }

        // Set size
        this.setSize({width: this.transform.w, height: this.transform.h});
    }

    /**
     * Show context menu callback
     */

    contextmenu() {
        // Content locked?
        if (!this.locked.content) this.options.uri.enable();
        else this.options.uri.disable();
    }

    /**
     * Edit (allow pick emoji)
     */

    edit(enable) {
        // Content locked?
        if (!this.locked.content) this.options.uri.enable();
        else this.options.uri.disable();
        super.edit(enable);
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        if (this.params.name.toLowerCase().includes(text.toLowerCase())) return true;
        if (this.params.uri.toLowerCase().includes(text.toLowerCase())) return true;
        return false;
    }

    /**
     * Short description of the contents
     */

    synopsis(length = 40) {
        return this.params.name.synopsis(length);
    }

    /**
     * Make node elastic
     */

    elastic(state) {
        if (state == true) {
            this.element.style.maxWidth = '100%';
            this.element.style.maxHeight = '100%';
            super.elastic(true);
            this.controls.bitmap.element.style.width = '100%';
            this.controls.bitmap.element.style.height = '100%';
            this.controls.bitmap.element.style.margin = '0';
            this.controls.bitmap.element.style.backgroundSize = 'cover';
            this.controls.name.element.style.position = 'absolute';
            this.controls.name.element.style.bottom = '0';
            this.controls.name.element.style.borderBottom = 'none';
            this.controls.name.element.style.width = 'calc(100% - 10px)';
            this.controls.name.element.style.textAlign = 'left';
            this.controls.name.element.style.color = 'white';
            this.controls.name.element.style.margin = '5px';
        }
        else {
            super.elastic(false);
        }
    }

    /**
     * Miniature version
     */

    miniature(content = false) {
        return `<div class="miniature metaviz-control-bitmap" style="background-image: url(${this.fixURI(this.getResized(this.params.uri))});" data-id="${this.id}"></div>`;
    }

}

global.registry.add({proto: MetavizNodeImage, name: 'Image', icon: '<span class="mdi mdi-image"></span>'});
