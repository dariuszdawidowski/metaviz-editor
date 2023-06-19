/**
 * Metaviz Node Clipart
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeClipart extends MetavizNode {

    constructor(args) {
        super(args);

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
                    this.params.set('name', emoji.unicode);
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {name: emoji.unicode},
                        prev: {url: this.params.name}
                    });
                    metaviz.editor.menu.hide();
                }
            })

        });

        // Meta setter
        this.params.set = (key, value) => {
            if (key == 'name') {
                this.params.name = value;
                this.controls.icon.set(...this.getIconName());
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
     * Search meta data for given text
     */

    search(text) {
        return this.params.name.toLowerCase().includes(text.toLowerCase());
    }

    /**
     * Miniature version
     */

    miniature(content=false) {
        return `<div class="miniature miniature-node-clipart" style="width: 100%; height: 100%;" data-id="${this.id}">${content ? this.control.icon.control.outerHTML : '<i class="fa-solid fa-palette"></i>'}</div>`;
    }

}

registry.add({proto: MetavizNodeClipart, name: 'Clipart', icon: '<i class="fas fa-palette"></i>'});


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
