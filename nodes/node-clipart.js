/**
 * Metaviz Node Clipart
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeClipart extends MetavizNode {

    constructor(args) {
        super(args);

        // Emoji Picker https://github.com/nolanlawson/emoji-picker-element
        this.require('emoji-picker-element', 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js');

        // Meta defaults
        if (!('name' in this.params)) this.params['name'] = '';

        // Controls
        this.addControls({

            // Icon control
            icon: new MetavizControlIcon(...this.getIconName())

        });

        // Size
        this.setSize({ width: 70, height: 70, minWidth: 16, minHeight: 16 });

        // Menu options
        this.addOptions({

            picker: new MetavizEmojiPicker({
                onClick: (emoji) => {
                    if (!this.locked.content) {
                        this.params.set('name', emoji.unicode);
                        metaviz.editor.history.store({
                            action: 'param',
                            node: {id: this.id},
                            params: {name: emoji.unicode},
                            prev: {url: this.params.name}
                        });
                        metaviz.editor.menu.hide();
                    }
                }
            })

        });

        // Meta setter
        this.params.set = (key, value) => {
            if (key == 'name') {
                this.params.name = value;
                this.controls.icon.set(...this.getIconName());
                this.controls.icon.element.style.fontSize = (this.transform.w * 0.76) + 'px';
            }
        };

        // Sockets
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
        Object.values(this.options).forEach(option => !this.locked.content ? option.enable() : option.disable());
    }

    /**
     * Smart return name
     */

    getIconName() {
        // Emoji
        const regex = /\p{Extended_Pictographic}/ug
        if (regex.test(this.params.name)) {
            return ['emoji', this.params.name];
        }

        // Flag emoji (just unicode fallback, flags can't be detected by one regex)
        const regexFlag = /[^\u0000-\u007F]/g;
        if (regexFlag.test(this.params.name)) {
            return ['emoji', this.params.name];
        }

        // Fallback
        return ['emoji', '😀'];
    }

    /**
     * Size 
     * {width: .., height: ..}
     */

    setSize(size, save = false) {
        super.setSize(size, save);
        this.controls.icon.element.style.fontSize = (size.width * 0.76) + 'px';
    }

    /**
     * Show context menu callback
     */

    contextmenu() {
        // Content locked?
        Object.values(this.options).forEach(option => !this.locked.content ? option.enable() : option.disable());
    }

    /**
     * Edit (allow pick emoji)
     */

    edit(enable) {
        Object.values(this.options).forEach(option => enable ? option.enable() : option.disable());
        super.edit(enable);
    }

    /**
     * No text edit in this control
     */

    getEditingControl() {
        return null;
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        return this.params.name.toLowerCase().includes(text.toLowerCase());
    }

    /**
     * Export node to different format
     */

    export(format) {

        if (format == 'miniature') {
            return `<div class="miniature miniature-node-clipart" style="width: 100%; height: 100%;" data-id="${this.id}">${content ? this.control.icon.control.outerHTML : '<span class="mdi mdi-palette"></span>'}</div>`;
        }

        else if (format == 'image/svg+xml') {
            return ``;
        }

        return null;
    }

}

global.registry.add({proto: MetavizNodeClipart, name: 'Clipart', icon: '<span class="mdi mdi-palette"></span>'});


/*** Emoji Picker ***/

class MetavizEmojiPicker extends TotalProMenuWidget {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);

        // Element class
        this.element.classList.add('metaviz-emoji-picker');

        // Picker
        const picker = document.createElement('emoji-picker');
        picker.classList.add('light');
        picker.addEventListener('emoji-click', event => args.onClick(event.detail));
        this.element.append(picker);

    }

}

i18n['pl']['clipart'] = 'grafika';
i18n['eo']['clipart'] = 'grafikaĵoj';
