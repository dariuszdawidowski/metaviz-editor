/**
 * Metaviz Node URL
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 * (c) 2020-2023 Metaviz Sp. z o.o., All Rights Reserved.
 */

class MetavizNodeURL extends MetavizNode {

    constructor(args) {
        super(args);

        // Meta defaults
        if (!('url' in this.params)) this.params['url'] = '';
        if (!('name' in this.params)) this.params['name'] = 'URL';

        // Size
        this.setSize({width: 64, height: 64, minWidth: 64, minHeight: 64, resize: 'none'});

        // Controls
        this.addControls({

            // Icon control
            icon: new MetavizControlIcon('mdi', 'mdi-open-in-new'),

            // Input control: Formatted Name
            name: new MetavizControlInput({
                name: 'name',
                value: this.params.name,
                multiline: true,
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

        });

        // Options
        this.addOptions({

            // Path menu Control
            url: new TotalProMenuInput({
                placeholder: 'URL',
                value: this.params.url,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {url: value},
                        prev: {url: this.params.url}
                    });
                    this.params.set('url', value);
                }
            })

        });

        // Meta setter
        this.params.set = (key, value) => {
            this.params[key] = value;
            if (key == 'name') {
                this.controls.name.set(value);
            }
            else if (key == 'url') {
                this.options.url.set(value);
                this.update();
            }
        }

        // Add socket
        this.addSockets({
            center: new MetavizSocket({
                name: 'center',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox,
                    y: this.transform.oy
                }
            })
        });
    }

    /**
     * Awake
     */

    awake() {
        // Content locked?
        if (!this.locked.content) this.options.url.enable();
        else this.options.url.disable();
    }

    /**
     * Serialize
     */

    serialize() {
        this.params.name = this.controls.name.get();
        this.params.url = this.options.url.get();
        return super.serialize();
    }

    /**
     * Show context menu callback
     */

    contextmenu() {
        // Content locked?
        if (!this.locked.content) this.options.url.enable();
        else this.options.url.disable();
    }

    /**
     * Edit (allow pick emoji)
     */

    edit(enable) {
        // Content locked?
        if (!this.locked.content) this.options.url.enable();
        else this.options.url.disable();
        super.edit(enable);
    }

    /**
     * Doubleclick
     */

    dblclick() {
        if (this.params.url != '') {
            const win = window.open(this.params.url, '_blank');
            win.focus();
        }
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        if (this.params.name.toLowerCase().includes(text.toLowerCase())) return true;
        if (this.params.url.toLowerCase().includes(text.toLowerCase())) return true;
        return false;
    }

    /**
     * Short description of the contents
     */

    synopsis(length = 40) {
        return this.params.name.synopsis(length);
    }

    /**
     * Export node to different format
     */

    export(format) {

        if (format == 'miniature') {
            return `<div class="miniature miniature-node-clipart" style="width: 100%; height: 100%;" data-id="${this.id}"><span class="mdi mdi-open-in-new"></span></div>`;
        }

        else if (format == 'image/svg+xml') {
            return ``;
        }

        return super.export(format);
    }

}

global.registry.add({proto: MetavizNodeURL, menu: 'Network', name: 'URL', icon: '<span class="mdi mdi-open-in-new"></span>'});
