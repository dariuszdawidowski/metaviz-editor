/**
 * Metaviz Node Text
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeText extends MetavizNode {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);

        // Predefined style
        this.looks = {
            'sticky': {name: _('Sticky Note'), width: 168, height: 168},
            'a6': {name: _('Page A6'), width: 232, height: 328},
            'a5': {name: _('Page A5'), width: 400, height: 565},
            'a4': {name: _('Page A4'), width: 800, height: 1131},
            'comic': {name: _('Comic Cloud'), width: 180, height: 100},
        };

        // Color palette
        this.colors = {
            '0': {icon: '<div class="menu-icon-square" style="background-color: var(--paper-2)"></div>', text: _('Color') + ': ' + _('Default'), class: 'palette-0'},
            '1': {icon: '<div class="menu-icon-square" style="background-color: var(--color-sky)"></div>', text: _('Color') + ': ' + _('Sky'), class: 'palette-1'},
            '2': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 117, 188)"></div>', text: _('Color') + ': ' + _('Water'), class: 'palette-2'},
            '3': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 67, 136)"></div>', text: _('Color') + ': ' + _('Navy'), class: 'palette-3'},
            '4': {icon: '<div class="menu-icon-square" style="background-color: var(--color-jade)"></div>', text: _('Color') + ': ' + _('Jade'), class: 'palette-4'},
            '5': {icon: '<div class="menu-icon-square" style="background-color: rgb(254, 192, 11)"></div>', text: _('Color') + ': ' + _('Sunny'), class: 'palette-5'}            
        };

        // Meta defaults
        if (!('look' in this.params)) this.params['look'] = 'sticky';
        if (!('spellcheck' in this.params)) this.params['spellcheck'] = true;
        if (!('page_1' in this.params)) this.params['page_1'] = '';
        if (!('lastpage' in this.params)) this.params['lastpage'] = 1;
        if (!('currpage' in this.params)) this.params['currpage'] = 1;
        if (!('palette' in this.params)) this.params['palette'] = '0';

        // Current page number
        this.page = this.params['currpage'];

        // Current color scheme
        this.element.classList.add('palette-' + this.params.palette);

        // Popup handler
        this.popup = null;
        this.popupTextarea = null;

        // Initial size
        this.setSize({resize: 'free'});
        if (this.transform.w == 0) this.setSize({width: this.looks[this.params.look].width, height: this.looks[this.params.look].height});

        // Controls
        this.addControls({

            // Text area control
            textarea: new MetavizControlRichText({
                name: `page_${this.page}`,
                value: this.getText(),
                spellcheck: this.params.spellcheck,
                onChange: (value) => {

                    // Packet
                    const packet = {
                        action: 'param',
                        node: {id: this.id},
                        params: {},
                        prev: {}
                    };
                    packet.params[`page_${this.page}`] = value;
                    packet.prev[`page_${this.page}`] = this.params[`page_${this.page}`];
                    metaviz.editor.history.store(packet);

                    // Value
                    this.params[`page_${this.page}`] = value;

                    // Resubscribe
                    metaviz.events.enable('viewer:keydown');
                    metaviz.events.enable('viewer:keyup');
                    metaviz.events.enable('editor:paste');
                    metaviz.events.enable('editor:keydown');
                    metaviz.events.enable('editor:keyup');
                },
                onPrevPage: () => {
                    if (this.page > 1) {

                        // Packet
                        const packet = {
                            action: 'param',
                            node: {id: this.id},
                            params: {},
                            prev: {}
                        };

                        // Store previous and current page
                        packet.prev[`page_${this.page}`] = this.params[`page_${this.page}`];
                        packet.params[`page_${this.page}`] = this.controls.textarea.get();
                        this.params[`page_${this.page}`] = this.controls.textarea.get();

                        // Back to previous page
                        this.page --;
                        this.params.currpage = this.page;
                        this.controls.textarea.set(this.params[`page_${this.page}`]);
                        this.controls.textarea.page(this.params.currpage, this.params.lastpage);

                        // Store current page
                        packet.params['currpage'] = this.params.currpage;
                        packet.prev['currpage'] = this.params.currpage + 1;

                        // Store
                        metaviz.editor.history.store(packet);
                        this.update();
                    }
                },
                onNextPage: () => {

                    // Packet
                    const packet = {
                        action: 'param',
                        node: {id: this.id},
                        params: {},
                        prev: {}
                    };

                    // Store previous and current page
                    packet.prev[`page_${this.page}`] = this.params[`page_${this.page}`];
                    packet.params[`page_${this.page}`] = this.controls.textarea.get();
                    this.params[`page_${this.page}`] = this.controls.textarea.get();

                    // Advance to next page
                    this.page ++;
                    this.params.currpage = this.page;

                    // Store current page
                    packet.params['currpage'] = this.params.currpage;
                    packet.prev['currpage'] = this.params.currpage - 1;

                    // Create new page if needed
                    if (this.params.lastpage < this.page) {
                        this.params.lastpage ++;
                        this.controls.textarea.clear();
                        packet.params['lastpage'] = this.params.lastpage;
                        packet.prev['lastpage'] = this.params.lastpage - 1;
                    }
                    // Or switch to next page
                    else {
                        this.controls.textarea.set(this.params[`page_${this.page}`]);
                    }
                    this.controls.textarea.page(this.params.currpage, this.params.lastpage);

                    // Store
                    metaviz.editor.history.store(packet);
                    this.update();
                },
            }),

        });
        this.controls.textarea.hideToolbar();

        // Menu options
        this.addOptions({

            // Appearance preset
            look: new TotalProMenuSelect({
                placeholder: _('Look'),
                options: this.genLookOptions(),
                value: this.params.look,
                onChange: (value) => {

                    // Store value
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {look: value},
                        prev: {look: this.params.look}
                    });
                    this.params.set('look', value);

                    // Change size
                    this.setSize(this.looks[this.params.look], true);
                    this.setLook(value);

                    // Cage update
                    metaviz.editor.cage.update();

                    // Hide menu
                    metaviz.editor.menu.hide();
                }
            }),

            // Colors
            palette: new TotalProMenuSelect({
                placeholder: _('Color palette'),
                options: this.colors,
                value: this.params.palette,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {palette: value},
                        prev: {palette: this.params.palette}
                    });
                    this.params.set('palette', value);
                    metaviz.editor.menu.hide();
                }
            }),

            // Spellcheck turn on/off
            spellcheck: new TotalProMenuSwitch({
                text: _('Spellcheck'),
                value: this.params.spellcheck,
                onChange: (value) => {
                    metaviz.editor.history.store({
                        action: 'param',
                        node: {id: this.id},
                        params: {spellcheck: value},
                        prev: {spellcheck: this.params.spellcheck}
                    });
                    this.params.spellcheck = value;
                    this.controls.textarea.spellcheck(value);
                }
            }),

        });

        // Next page
        this.textblockRight = document.createElement('div');
        this.textblockRight.classList.add('nextpage', 'right');
        this.element.append(this.textblockRight);
        this.textblockBottom = document.createElement('div');
        this.textblockBottom.classList.add('nextpage', 'bottom');
        this.element.append(this.textblockBottom);
        this.textblockCorner = document.createElement('div');
        this.textblockCorner.classList.add('nextpage', 'corner');
        this.element.append(this.textblockCorner);

        // Meta setter
        this.params.set = (key, value) => {

            this.params[key] = value;

            if (key.startsWith('page_')) {
                const page = parseInt(key.replace('page_', ''));
                if (page == this.page) this.controls.textarea.set(value);
            }

            else if (key == 'palette') {
                for (const [key, color] of Object.entries(this.colors)) this.element.classList.remove(color.class);
                this.element.classList.add(this.colors[this.params.palette].class);
                this.update();
            }

        }

        // Sockets
        this.addSockets();
    }

    /**
     * Start
     */

    start() {
        // Look (wait for dimensions)
        this.setLook(this.params.look);
        // Pages on toolbar
        this.controls.textarea.page(this.params.currpage, this.params.lastpage);
    }

    /**
     * Look and setting
     */

    setLook(value) {

        // Class
        for (const [key, look] of Object.entries(this.looks)) this.element.classList.remove(key);
        this.element.classList.add(value);

        // More than one page
        if (this.params.lastpage == 1) this.element.classList.add('singlepage');
        else this.element.classList.remove('singlepage')

        // Toolbar
        if (this.transform.w < 200 || this.transform.h < 200) this.controls.textarea.hideToolbar();
        else if (this.selected) this.controls.textarea.showToolbar();
    }

    /**
     * Double Click: show text editor window
     */

    dblclick() {
        if (!this.popup) {
            this.popupTextarea = new MetavizControlRichText({
                name: `page_${this.page}`,
                value: this.getText(),
                spellcheck: this.params.spellcheck,
                toolbar: 'top',
                icons: {bold: true, italic: true, underline: true, style: true, del: true, superscript: true, subscript: true, hr: true, prev: true, page: true, next: true},
                onChange: (value) => {
                    this.controls.textarea.set(value);
                },
                onPrevPage: () => {
                    this.controls.textarea.onPrevPage();
                    this.popupTextarea.set(this.params[`page_${this.page}`]);
                },
                onNextPage: () => {
                    this.controls.textarea.onNextPage();
                    this.popupTextarea.set(this.params[`page_${this.page}`]);
                }
            });

            // Popup window
            const viewport = metaviz.editor.getDimensions();
            const params = {
                container: metaviz.render.container,
                width: metaviz.render.container.offsetWidth * 0.6,
                height: metaviz.render.container.offsetHeight * 0.8,
                minWidth: 400,
                minHeight: 400,
                margin: {top: viewport.margin.top + 15, bottom: viewport.margin.bottom + 15, left: viewport.margin.left + 15, right: viewport.margin.right + 15},
                side: metaviz.system.os.name == 'macos' ? 'left' : 'right',
                content: this.popupTextarea.element,
                borderWidth: 6,
                callback: {
                    onMinimize: () => {
                        // Enable all events again
                        metaviz.events.disable('browser:prevent');
                        metaviz.events.enable('viewer:*');
                        metaviz.events.enable('editor:*');
                        // Switch to miniature
                        this.popup.miniaturize({
                            width: 160,
                            height: 36,
                            left: 0,
                            bottom: 0,
                            title: this.synopsis(25)
                        });
                    },
                    onMaximize: () => {
                        // Disable all events
                        metaviz.events.disable('viewer:*');
                        metaviz.events.disable('editor:*');
                        metaviz.events.enable('browser:prevent');
                    },
                    onDemaximize: () => {
                        // Enable all events again
                        metaviz.events.disable('browser:prevent');
                        metaviz.events.enable('viewer:*');
                        metaviz.events.enable('editor:*');
                    },
                    onClose: () => {
                        // Enable all events again
                        metaviz.events.disable('browser:prevent');
                        metaviz.events.enable('viewer:*');
                        metaviz.events.enable('editor:*');
                        // Exit
                        this.popupTextarea.edit(false);
                        this.popup = null;
                    }
                }
            };
            if (metaviz.system.os.name == 'windows') {
                params['icons'] = {
                    minimize: '&#11451;',
                    maximize: '&#9723;',
                    demaximize: '&#10064;',
                    close: '&#215;',
                    locked: '&#129181;'
                };
            }
            this.popup = new TotalPopupWindow(params);
        }
        this.popup.maximize();
        this.popupTextarea.edit(true);
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        for (const [key, value] of Object.entries(this.params)) {
            if (key.startsWith('page_')) {
                return value?.toLowerCase().includes(text.toLowerCase());
            }
        }
        return false;
    }

    /**
     * Short description of the contents
     */

    synopsis(length = 40) {
        return this.getText(1).synopsis(length);
    }

    /**
     * Export node to different format
     * @param: format 'miniature' | 'image/svg+xml'
     * @args.offsetX: offset x for svg export
     * @args.offsetY: offset y for svg export
     */

    export(format, args = {}) {

        const {offsetX = 0, offsetY = 0} = args;

        if (format == 'miniature') {
            return `<div class="miniature metaviz-node-text" data-id="${this.id}">${`<h2>${this.getText(1).synopsis(10)}</h2>▬▬▬▬▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬`}</div>`;
        }

        else if (format == 'image/svg+xml') {
            let buffer = `<rect x="${this.transform.x - offsetX - (this.transform.w / 2)}" y="${this.transform.y - offsetY - (this.transform.h / 2)}" width="${this.transform.w}" height="${this.transform.h}" style="fill:rgb(108,121,132);stroke-width:0" />`;
            buffer += `<text x="${this.transform.x - offsetX - (this.transform.w / 2) + 8}" y="${this.transform.y - offsetY - (this.transform.h / 2) + 8 + 10}" fill="rgb(227,229,237)" style="font-size: 12px;">${this.params.page_1}</text>`;
            return buffer;
        }

        return super.export(format);
    }

    /**
     * Selection
     */

    select() {
        super.select();
        if (this.transform.w > 199 && this.transform.h > 199) this.controls.textarea.showToolbar();
    }

    deselect() {
        super.deselect();
        this.controls.textarea.hideToolbar();
    }

    /**
     * Generate options for menu
     */

    genLookOptions() {
        const options = {};
        for (const [key, look] of Object.entries(this.looks)) {
            options[key] = {icon: '', text: look.name};
        }
        return options;
    }

    /**
     * Get current page text
     * nr = int page number 1..n
     */

    getText(nr = this.page) {
        // All pages
        if (nr == 'all') {
            const pages = '';
            for (let nr = 0; nr < this.params.lastpage; nr ++) {
                pages += this.params[`page_${nr}`];
            }
            return pages;
        }
        // Single page
        return this.params[`page_${nr}`];
    }

    /**
     * Flush all data
     */

    flush() {
        const packet = {action: 'param', node: {id: this.id}, params: {}, prev: {}};
        packet.params[`page_${this.page}`] = this.controls.textarea.get();
        packet.prev[`page_${this.page}`] = this.params[`page_${this.page}`];
        metaviz.editor.history.store(packet);
    }

    /**
     * Update (everyframe when something is changed e.g. move)
     */

    update() {
        super.update();
        this.setLook(this.params.look);
    }

}

global.registry.add({proto: MetavizNodeText, name: 'Text', icon: '<span class="mdi mdi-text-box"></span>'});

i18n['pl']['text'] = 'tekst';
i18n['pl']['sticky note'] = 'karteczka';
i18n['pl']['page a6'] = 'strona A6';
i18n['pl']['page a5'] = 'strona A5';
i18n['pl']['page a4'] = 'strona A4';
i18n['pl']['comic cloud'] = 'chmurka komiksowa';

i18n['eo']['text'] = 'teksto';
i18n['eo']['sticky note'] = 'notu';
i18n['eo']['page a6'] = 'paĝo A6';
i18n['eo']['page a5'] = 'paĝo A5';
i18n['eo']['page a4'] = 'paĝo A4';
i18n['eo']['comic cloud'] = 'komika nubo';


