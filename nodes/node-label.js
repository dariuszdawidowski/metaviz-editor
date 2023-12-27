/**
 * Metaviz Node Label
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeLabel extends MetavizNode {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);

        // Meta defaults
        if (!('text' in this.params)) this.params['text'] = '';
        if (!('color' in this.params)) this.params['color'] = '0';
        if (!('style' in this.params)) this.params['style'] = 'label';
        if (!('font' in this.params)) this.params['font'] = 'Roboto';

        // Migrate Meta
        if (typeof(this.params['color']) == 'number') this.params['color'] = this.params['color'].toString();

        // Controls
        this.addControls({

            // Input control
            input: new MetavizControlInput({
                name: 'text',
                value: this.params.text,
                placeholder: 'Label',
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {text: value},
                        prev: {text: this.params.text}
                    });
                    this.params.text = value;
                }
            })

        });

        // Menu options
        this.addOptions({

            // Style
            style: new TotalProMenuSelect({
                placeholder: 'Style',
                options: {
                    'label': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Label'},
                    'text': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Only text'},
                    'underline': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Underline'},
                },
                value: this.params.style,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {style: value},
                        prev: {style: this.params.style}
                    });
                    this.params.set('style', value);
                }
            }),

            // Color
            color: new TotalProMenuSelect({
                placeholder: 'Color',
                options: {
                    '0': {icon: '<div class="menu-icon-square" style="background-color: var(--paper-2)"></div>', text: 'Color: Default'},
                    '1': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 117, 188)"></div>', text: 'Color: Water'},
                    '2': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 67, 136)"></div>', text: 'Color: Navy'},
                    '3': {icon: '<div class="menu-icon-square" style="background-color: var(--color-jade)"></div>', text: 'Color: Jade'},
                    '4': {icon: '<div class="menu-icon-square" style="background-color: rgb(254, 192, 11)"></div>', text: 'Color: Sunny'},
                    '5': {icon: '<div class="menu-icon-square" style="background-color: #e89191"></div>', text: 'Color: Fire'}
                },
                value: this.params.color,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {color: value},
                        prev: {color: this.params.color}
                    });
                    this.params.set('color', value);
                }
            }),

            // Font
            font: new TotalProMenuSelect({
                placeholder: 'Font',
                options: {
                    'Roboto': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Roboto'},
                    'Allura': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Allura'},
                    'Mansalva': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Mansalva'},
                },
                value: this.params.font,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {font: value},
                        prev: {font: this.params.font}
                    });
                    this.params.set('font', value);
                }
            }),

        });

        // Font
        this.controls.input.element.style.fontFamily = this.params.font;

        // Size
        this.setSize({width: 176, height: 24, minWidth: 176, minHeight: 24});

        // Classes
        this.element.classList.add('color-' + this.params.color);
        this.element.classList.add('style-' + this.params.style);

        // Meta setter
        this.params.set = (key, value) => {
            this.params[key] = value.trim();

            // Color
            if (key == 'color') {
                this.element.classList.remove('color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5');
                this.element.classList.add('color-' + this.params.color);
                this.update();
            }

            // Style
            else if (key == 'style') {
                this.element.classList.remove('style-label', 'style-text', 'style-underline');
                this.element.classList.add('style-' + this.params.style);
                this.update();
            }

            // Font
            else if (key == 'font') {
                this.controls.input.element.style.fontFamily = this.params.font;
            }

            // Text
            else if (key == 'text') {
                this.controls.input.set(value);
            }

        }

        // Sockets
        this.addSockets({
            east: new MetavizSocket({
                name: 'east',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox + (this.transform.w / 2),
                    y: this.transform.oy
                }
            }),
            west: new MetavizSocket({
                name: 'west',
                node: {id: this.id},
                parent: this.element,
                transform: {
                    x: this.transform.ox - (this.transform.w / 2),
                    y: this.transform.oy
                }
            })
        });
    }

    /**
     * Return control if in edit mode
     */

    getEditingControl() {
        return this.controls.input;
    }

    /**
     * Serialize
     */

    serialize() {
        this.params.text = this.controls.input.get();
        return super.serialize();
    }

    /**
     * Pipeline: add own data
     */

    pipeline() {
        const stream = super.pipeline();
        stream.add({
            text: this.controls.input.get() + '\n',
            calc: Number(this.controls.input.get().replace(/[^\d-\.]/g, ''))
        });
        return stream;
    }

    /**
     * Size
     * {width: .., height: ..}
     */

    setSize(size, save = false) {
        super.setSize(size, save);
        this.controls.input.element.style.fontSize = (size.height * 0.69) + 'px';
    }

    getSize() {
        return {
            width: this.transform.w,
            height: this.transform.h,
            minWidth: 64,
            minHeight: 16,
            maxWidth: 1024,
            maxHeight: 1024,
            mode: 'free'
        };
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        return this.params.text.toLowerCase().includes(text.toLowerCase());
    }

    /**
     * Short description of the contents
     */

    synopsis(length = 40) {
        return this.params.text.synopsis(length);
    }

    /**
     * Make node elastic
     */

    elastic(state) {
        if (state == true) {
            super.elastic(true);
            this.controls.input.element.style.width = '100%';
            this.controls.input.element.style.height = '100%';
        }
        else {
            super.elastic(false);
        }
    }

    /**
     * Miniature version
     */

    miniature(content=false) {
        return `<div class="miniature metaviz-node-label color-${this.params.color}" data-id="${this.id}">${content ? this.params.text.synopsis(3) : 'Label'}</div>`;
    }

}

global.registry.add({proto: MetavizNodeLabel, name: 'Label', icon: '<span class="mdi mdi-label"></span>'});

i18n['pl']['label'] = 'napis';
i18n['eo']['label'] = 'etikedo';
