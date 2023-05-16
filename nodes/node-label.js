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
        if (!('text' in this.meta)) this.meta['text'] = '';
        if (!('color' in this.meta)) this.meta['color'] = '0';
        if (!('style' in this.meta)) this.meta['style'] = 'label';
        if (!('font' in this.meta)) this.meta['font'] = 'Roboto';
        if (!('rotate' in this.meta)) this.meta['rotate'] = 0;

        // Migrate Meta
        if (typeof(this.meta['color']) == 'number') this.meta['color'] = this.meta['color'].toString();

        // Controls
        this.addControls({
            // Input control
            input: new MetavizControlInput({name: 'text', value: this.meta.text, onChange: (value) => {
                metaviz.editor.history.store({action: 'param', node: {id: this.id}, data: {text: value}, prev: {text: this.meta.text}});
                this.meta.text = value;
            }})
        });

        // Font
        this.controls.input.element.style.fontFamily = this.meta.font;

        // Size
        this.setSize({width: 176, height: 24});

        // Rotate
        if (this.meta['rotate'] != 0) this.controls.input.element.style.rotate = this.meta['rotate'] + 'deg';

        // Classes
        this.element.classList.add('color-' + this.meta.color);
        this.element.classList.add('style-' + this.meta.style);

        // Meta setter
        this.meta.set = (key, value) => {
            this.meta[key] = value;
            if (key == 'color') {
                this.element.classList.remove('color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5');
                this.element.classList.add('color-' + this.meta.color);
                this.update();
            }
            else if (key == 'style') {
                this.element.classList.remove('style-label', 'style-text', 'style-underline');
                this.element.classList.add('style-' + this.meta.style);
                this.update();
            }
            else if (key == 'font') {
                this.controls.input.element.style.fontFamily = this.meta.font;
            }
            else if (key == 'text') {
                this.controls.input.set(value);
            }
            else if (key == 'rotate') {
                this.controls.input.element.style.rotate = value + 'deg';
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
     * Serialize
     */

    serialize() {
        this.meta.text = this.controls.input.get();
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
     * Menu options
     */

    menu() {

        return {
            options: [

                // Style
                new MenuSelect({
                    placeholder: 'Style',
                    options: {
                        'label': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Label'},
                        'text': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Only text'},
                        'underline': {icon: '<i class="fa-solid fa-user-tie"></i>', text: 'Style: Underline'},
                    },
                    value: this.meta.style,
                    onChange: (value) => {
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, data: {style: value}, prev: {style: this.meta.style}});
                        this.meta.set('style', value);
                    }
                }),

                // Color
                new MenuSelect({
                    placeholder: 'Color',
                    options: {
                        '0': {icon: '<div class="menu-icon-square" style="background-color: var(--paper-2)"></div>', text: 'Color: Default'},
                        '1': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 117, 188)"></div>', text: 'Color: Water'},
                        '2': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 67, 136)"></div>', text: 'Color: Navy'},
                        '3': {icon: '<div class="menu-icon-square" style="background-color: var(--color-jade)"></div>', text: 'Color: Jade'},
                        '4': {icon: '<div class="menu-icon-square" style="background-color: rgb(254, 192, 11)"></div>', text: 'Color: Sunny'},
                        '5': {icon: '<div class="menu-icon-square" style="background-color: #e89191"></div>', text: 'Color: Fire'}
                    },
                    value: this.meta.color,
                    onChange: (value) => {
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, data: {color: value}, prev: {color: this.meta.color}});
                        this.meta.set('color', value);
                    }
                }),

                // Font
                new MenuSelect({
                    placeholder: 'Font',
                    options: {
                        'Roboto': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Roboto'},
                        'Allura': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Allura'},
                        'Mansalva': {icon: '<i class="fa-solid fa-font"></i>', text: 'Font: Mansalva'},
                    },
                    value: this.meta.font,
                    onChange: (value) => {
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, data: {font: value}, prev: {font: this.meta.font}});
                        this.meta.set('font', value);
                    }
                }),

                // Rotate
                new MenuInput({
                    placeholder: 'Rotate',
                    value: this.meta.rotate,
                    onChange: (event) => {
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, data: {rotate: parseInt(event.target.value)}, prev: {rotate: this.meta.rotate}});
                        this.meta.set('rotate', parseInt(event.target.value));
                    }
                }),

            ]
        };
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
        const bounds = this.getBounds(
            this.transform.x - (this.transform.w / 2),
            this.transform.y - (this.transform.h / 2),
            this.transform.x + (this.transform.w / 2),
            this.transform.y + (this.transform.h / 2),
            this.meta['rotate']
        );
        return {
            width: bounds.w,
            height: bounds.h,
            minWidth: 64,
            minHeight: 16,
            maxWidth: 1024,
            maxHeight: 1024,
            mode: 'free'
        };
    }

    getBounds(left, top, right, bottom, deg) {
        // Współrzędne wierzchołków prostokąta
        var x1 = left, y1 = top; // lewy górny róg
        var x2 = right, y2 = top; // prawy górny róg
        var x3 = right, y3 = bottom; // prawy dolny róg
        var x4 = left, y4 = bottom; // lewy dolny róg

        // Współrzędne środka prostokąta
        var centerX = (x1 + x2 + x3 + x4) / 4;
        var centerY = (y1 + y2 + y3 + y4) / 4;

        // Kąt obrotu prostokąta (w radianach)
        var angle = deg * (Math.PI / 180);

        // Wartości sinusa i cosinusa kąta obrotu
        var sinAngle = Math.sin(angle);
        var cosAngle = Math.cos(angle);

        // Nowe współrzędne punktów wierzchołków prostokąta
        var newX1 = cosAngle * (x1 - centerX) - sinAngle * (y1 - centerY) + centerX;
        var newY1 = sinAngle * (x1 - centerX) + cosAngle * (y1 - centerY) + centerY;

        var newX2 = cosAngle * (x2 - centerX) - sinAngle * (y2 - centerY) + centerX;
        var newY2 = sinAngle * (x2 - centerX) + cosAngle * (y2 - centerY) + centerY;

        var newX3 = cosAngle * (x3 - centerX) - sinAngle * (y3 - centerY) + centerX;
        var newY3 = sinAngle * (x3 - centerX) + cosAngle * (y3 - centerY) + centerY;

        var newX4 = cosAngle * (x4 - centerX) - sinAngle * (y4 - centerY) + centerX;
        var newY4 = sinAngle * (x4 - centerX) + cosAngle * (y4 - centerY) + centerY;

        // Granice prostokąta na podstawie nowych współrzędnych punktów wierzchołków
        var left = Math.min(newX1, newX2, newX3, newX4);
        var top = Math.min(newY1, newY2, newY3, newY4);
        var right = Math.max(newX1, newX2, newX3, newX4);
        var bottom = Math.max(newY1, newY2, newY3, newY4);

        return {left, top, right, bottom, w: right - left, h: bottom - top};
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        return this.meta.text.toLowerCase().includes(text.toLowerCase());
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
        this.serialize();
        return `<div class="miniature metaviz-node-label color-${this.meta.color}" data-id="${this.id}">${content ? this.meta.text.synopsis(3) : 'Label'}</div>`;
    }

}

registry.add({proto: MetavizNodeLabel, name: 'Label', icon: '<i class="fas fa-tag"></i>'});
