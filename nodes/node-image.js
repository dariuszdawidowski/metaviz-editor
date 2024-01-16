/**
 * Metaviz Node Image
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
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
        if (!('style' in this.params)) this.params['style'] = 'instant'; // minimal | raw | instant | postcard
        if (!('resX' in this.params)) this.params['resX'] = 0; // Natural image
        if (!('resY' in this.params)) this.params['resY'] = 0; // resolution (not miniature, not node)
        if (!('rotate' in this.params)) this.params['rotate'] = 0; // should be rotated by angle

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
                placeholder: _('Image'),
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
                placeholder: 'URI',
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
                placeholder: _('Style'),
                options: {
                    'raw': {icon: '', text: _('Style') + ': ' + _('Raw')},
                    'minimal': {icon: '', text: _('Style') + ': ' + _('Minimalistic')},
                    'instant': {icon: '', text: _('Style') + ': ' + _('Instant')},
                    'postcard': {icon: '', text: _('Style') + ': ' + _('Postcard')},
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
                icon: this.params.uri ? '<span class="mdi mdi-cloud-download"></span>' : '<span class="mdi mdi-cloud-upload"></span>',
                text: this.params.uri ? _('Download file') : _('Upload file'),
                onChange: () => {
                    // Download
                    if (this.params.uri) {
                        metaviz.exchange.downloadFile({
                            path: this.fixURI(this.params.uri),
                            name: this.params.filename || 'image'
                        });
                    }
                    // Upload
                    else {
                        this.uploadFile();
                    }
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
     */

    getSize() {
        return {
            width: this.transform.w,
            height: this.transform.h,
            minWidth: 128,
            minHeight: 128,
            maxWidth: 8192,
            maxHeight: 8192,
            resize: 'ratio'
        };
    }

    /**
     * Upload image
     */

    async uploadFile() {

        // File object
        let file = null;

        // Open file dialog
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            file = await fileHandle.getFile();
        }
        catch (error) {
        }

        // Send file
        if (file && metaviz.exchange.detectImage(file.type)) {
            metaviz.exchange.sendBlob(file, this, () => {
                this.options.download.setIcon('<span class="mdi mdi-cloud-download"></span>');
                this.options.download.setName(_('Download file'));
            });
        }
    }

    /**
     * Click: upload image if empty
     */

    click() {
        if (!this.fixURI(this.params.uri) && this.focused) this.uploadFile();
    }

    /**
     * Double Click: show image on lightbox
     */

    dblclick() {
        // Has image
        if (this.fixURI(this.params.uri)) {

            // Compute resolution if not present
            if (this.params.resX == 0 || this.params.resY == 0) {
                const resolution = this.controls.bitmap.getResolution();
                this.params.resX = resolution.width;
                this.params.resY = resolution.height;
            }

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
            if (this.params.resY >= this.params.resX) {
                const aspect = this.params.resY / this.params.resX;
                size_w = Math.round(size_h / aspect);
            }
            else if (this.params.rotate == 90 || this.params.rotate == 270) {
                const aspect = this.params.resX / this.params.resY;
                size_w = Math.round(size_h / aspect);
            }

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
        this.element.classList.remove('style-raw', 'style-minimal', 'style-instant', 'style-postcard');
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
            case 'minimal':
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
     * Export node to different format
     */

    export(format, args = {}) {

        const {offsetX = 0, offsetY = 0} = args;

        if (format == 'miniature') {
            return `<div class="miniature metaviz-control-bitmap" style="background-image: url(${this.fixURI(this.getResized(this.params.uri))});" data-id="${this.id}"></div>`;
        }

        else if (format == 'image/svg+xml') {
            let buffer = `<rect x="${this.transform.x - offsetX - (this.transform.w / 2)}" y="${this.transform.y - offsetY - (this.transform.h / 2)}" width="${this.transform.w}" height="${this.transform.h}" style="fill:rgb(247,250,250);stroke-width:0" />`;
            if (this.params.uri != '')
                buffer += `<image href="${this.params.uri}" x="${this.transform.x - offsetX - (this.transform.w / 2) + 12}" y="${this.transform.y - offsetY - (this.transform.h / 2) + 12}" width="${this.transform.w - 24}" height="${this.transform.h - 24 - 19}" preserveAspectRatio="xMidYMid slice" />`;
            else
                buffer += `<rect x="${this.transform.x - offsetX - (this.transform.w / 2) + 12}" y="${this.transform.y - offsetY - (this.transform.h / 2) + 12}" width="${this.transform.w - 24}" height="${this.transform.h - 24 - 19}" style="fill:rgb(65,52,43);stroke-width:0;" />`;
            buffer += `<text x="${this.transform.x - offsetX}" y="${this.transform.y - offsetY + this.transform.h - 112}" fill="rgb(12,12,12)" text-anchor="middle" dominant-baseline="middle" style="font-size: 15px;font-style:italic">${this.params.name}</text>`;
            return buffer;
        }

        return null;
    }

}

global.registry.add({proto: MetavizNodeImage, name: 'Image', icon: '<span class="mdi mdi-image"></span>'});

i18n['pl']['image'] = 'obraz';
i18n['pl']['raw'] = 'surowy';
i18n['pl']['minimalistic'] = 'minimalistyczny';
i18n['pl']['instant'] = 'zdjęcie';
i18n['pl']['postcard'] = 'pocztówka';

i18n['eo']['image'] = 'bildo';
i18n['eo']['raw'] = 'kruda';
i18n['eo']['minimalistic'] = 'minimumisma';
i18n['eo']['instant'] = 'foto';
i18n['eo']['postcard'] = 'poŝtkarto';
