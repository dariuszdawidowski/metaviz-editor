/**
 * Metaviz Node Label
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
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

        // CSS Container
        this.element.style.container = 'textbox / size';

        // Controls
        this.addControls({

            // Input control
            input: new MetavizControlInput({
                name: 'text',
                value: this.params.text,
                placeholder: _('Label'),
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
                placeholder: _('Style'),
                options: {
                    'label': {text: _('Style') + ': ' + _('Label')},
                    'bubble': {text: _('Style') + ': ' + _('Bubble')},
                    'text': {text: _('Style') + ': ' + _('Only text')},
                    'underline': {text: _('Style') + ': ' + _('Underline')},
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
                    this.setSize({border: this.getBorder()});
                }
            }),

            // Color
            color: new TotalProMenuSelect({
                placeholder: _('Color'),
                options: {
                    '0': {icon: '<div class="menu-icon-square" style="background-color: var(--paper-2)"></div>', text: _('Color') + ': ' + _('Default')},
                    '1': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 117, 188)"></div>', text: _('Color') + ': ' + _('Water')},
                    '2': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 67, 136)"></div>', text: _('Color') + ': ' + _('Navy')},
                    '3': {icon: '<div class="menu-icon-square" style="background-color: var(--color-jade)"></div>', text: _('Color') + ': ' + _('Jade')},
                    '4': {icon: '<div class="menu-icon-square" style="background-color: rgb(254, 192, 11)"></div>', text: _('Color') + ': ' + _('Sunny')},
                    '5': {icon: '<div class="menu-icon-square" style="background-color: #e89191"></div>', text: _('Color') + ': ' + _('Fire')}
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
                placeholder: _('Font'),
                options: {
                    'Roboto': {text: _('Font') + ': Roboto'},
                    'Playfair Display': {text: _('Font') + ': Playfair Display'},
                    'Source Code Pro': {text: _('Font') + ': Source Code Pro'},
                    'Allura': {text: _('Font') + ': Allura'},
                    'Mansalva': {text: _('Font') + ': Mansalva'},
                    'Oswald': {text: _('Font') + ': Oswald'},
                    'Bangers': {text: _('Font') + ': Bangers'},
                    'Lemon': {text: _('Font') + ': Lemon'},
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

        const fontIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="var(--paper-2)" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><line x1="5" y1="5" x2="15" y2="5" /><line x1="5" y1="5" x2="5" y2="6.5" /><line x1="15" y1="5" x2="15" y2="6.5" /><line x1="10" y1="5" x2="10" y2="16" /><line x1="9" y1="16" x2="11" y2="16" /></svg>`;

        // Popover options
        this.addPopovers({

            // Style
            style: new MetavizPopoverTextSelect({
                options: {
                    'label': {icon: '<div class="popover-icon popover-icon-label-basic">S</div>', text: _('Style') + ': ' + _('Label')},
                    'bubble': {icon: '<div class="popover-icon popover-icon-label-bubble">S</div>', text: _('Style') + ': ' + _('Bubble')},
                    'text': {icon: '<div class="popover-icon popover-icon-label-text">S</div>', text: _('Style') + ': ' + _('Only text')},
                    'underline': {icon: '<div class="popover-icon popover-icon-label-underline">S</div>', text: _('Style') + ': ' + _('Underline')},
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
                    this.setSize({border: this.getBorder()});
                }
            }),

            color: new MetavizPopoverColorPicker({
                options: [
                    'var(--paper-2)',
                    'rgb(0, 117, 188)',
                    'rgb(0, 67, 136)',
                    'var(--color-jade)',
                    'rgb(254, 192, 11)',
                    '#e89191'
                ],
                value: this.params.color,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {color: value},
                        prev: {color: this.params.color}
                    });
                    this.params.set('color', value.toString());
                }
            }),

            // Font
            font: new MetavizPopoverTextSelect({
                options: {
                    'Roboto': {icon: fontIcon, text: _('Font') + ': Roboto'},
                    'Playfair Display': {icon: fontIcon, text: _('Font') + ': Playfair Display'},
                    'Source Code Pro': {icon: fontIcon, text: _('Font') + ': Source Code Pro'},
                    'Allura': {icon: fontIcon, text: _('Font') + ': Allura'},
                    'Mansalva': {icon: fontIcon, text: _('Font') + ': Mansalva'},
                    'Oswald': {icon: fontIcon, text: _('Font') + ': Oswald'},
                    'Bangers': {icon: fontIcon, text: _('Font') + ': Bangers'},
                    'Lemon': {icon: fontIcon, text: _('Font') + ': Lemon'},
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
        this.setSize({resize: 'free', width: 176, height: 24, minWidth: 176, minHeight: 24, maxWidth: 2048, border: this.getBorder()});

        // Classes
        this.element.classList.add('color-' + this.params.color);
        this.element.classList.add('style-' + this.params.style);

        // Meta setter
        this.params.set = (key, value) => {
            this.params[key] = value.trim();

            // Color
            if (key == 'color') {
                Object.keys(this.options.color.options).forEach(optionKey => {
                    this.element.classList.remove(`color-${optionKey}`);
                });
                this.element.classList.add('color-' + this.params.color);
                this.update();
            }

            // Style
            else if (key == 'style') {
                Object.keys(this.options.style.options).forEach(optionKey => {
                    this.element.classList.remove(`style-${optionKey}`);
                });
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
     * Return border width
     */

    getBorder() {
        switch (this.params.style) {
            case 'label':
                return 1;
                break;
            case 'bubble':
                return 3;
                break;
            case 'text':
                return 0;
                break;
            case 'underline':
                return 0;
                break;
        }
        return 0;
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
     * Export node to different format
     */

    export(format, args = {}) {

        const {offsetX = 0, offsetY = 0, content = null} = args;

        if (format == 'miniature') {
            return `<div class="miniature metaviz-node-label color-${this.params.color}" data-id="${this.id}">${content ? this.params.text.synopsis(3) : 'Label'}</div>`;
        }

        else if (format == 'image/svg+xml') {
            let buffer = `<rect x="${this.transform.x - offsetX - (this.transform.w / 2)}" y="${this.transform.y - offsetY - (this.transform.h / 2)}" width="${this.transform.w}" height="${this.transform.h}" rx="5" ry="5" style="fill:rgb(235,236,237);stroke-width:0" />`;
            buffer += `<text x="${this.transform.x - offsetX}" y="${this.transform.y - offsetY}" fill="rgb(12,12,12)" text-anchor="middle" dominant-baseline="middle" style="font-size: 16px;">${this.params.text}</text>`;
            return buffer;
        }

        return super.export(format);
    }

}

global.registry.add({proto: MetavizNodeLabel, name: 'Label', icon: '<span class="mdi mdi-label"></span>'});

i18n['pl']['label'] = 'etykieta';
i18n['pl']['bubble'] = 'bąbel';
i18n['pl']['only text'] = 'czysty tekst';
i18n['pl']['underline'] = 'podkreślony';
i18n['pl']['sky'] = 'niebo';
i18n['pl']['water'] = 'woda';
i18n['pl']['navy'] = 'żeglarski';
i18n['pl']['jade'] = 'jadeitowy';
i18n['pl']['sunny'] = 'słoneczny';
i18n['pl']['fire'] = 'ognisty';

i18n['eo']['label'] = 'etikedo';
i18n['eo']['bubble'] = 'veziko';
i18n['eo']['only text'] = 'nur teksto';
i18n['eo']['underline'] = 'substreki';
i18n['eo']['sky'] = 'ĉielo';
i18n['eo']['water'] = 'akvo';
i18n['eo']['navy'] = 'naŭtika';
i18n['eo']['jade'] = 'jado';
i18n['eo']['sunny'] = 'sunplena';
i18n['eo']['fire'] = 'arda';
 