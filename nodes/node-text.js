/**
 * Metaviz Node Text
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizNodeText extends MetavizNode {

    /**
     * Constructor
     */

    constructor(args) {
        super(args);

        // Predefined style
        this.looks = {
            'sticky': {name: 'Sticky Note', width: 168, height: 168},
            'a6': {name: 'Page A6', width: 232, height: 328},
            'a5': {name: 'Page A5', width: 400, height: 565},
            'a4': {name: 'Page A4', width: 800, height: 1131},
            'comic': {name: 'Comic Cloud', width: 180, height: 100},
        };

        // Color palette
        this.colors = {
            '0': {icon: '<div class="menu-icon-square" style="background-color: var(--paper-2)"></div>', text: 'Color Default', class: 'palette-0'},
            '1': {icon: '<div class="menu-icon-square" style="background-color: var(--color-sky)"></div>', text: 'Color Sky', class: 'palette-1'},
            '2': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 117, 188)"></div>', text: 'Color Water', class: 'palette-2'},
            '3': {icon: '<div class="menu-icon-square" style="background-color: rgb(0, 67, 136)"></div>', text: 'Color Navy', class: 'palette-3'},
            '4': {icon: '<div class="menu-icon-square" style="background-color: var(--color-jade)"></div>', text: 'Color Jade', class: 'palette-4'},
            '5': {icon: '<div class="menu-icon-square" style="background-color: rgb(254, 192, 11)"></div>', text: 'Color Sunny', class: 'palette-5'}            
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

        // Initial size
        if (this.transform.w == 0) this.setSize({width: this.looks[this.params.look].width, height: this.looks[this.params.look].height});

        // Controls
        this.addControls({

            // Text area control
            textarea: new MetavizControlRichText({
                name: `page_${this.page}`,
                value: this.getText(),
                spellcheck: this.params.spellcheck,
                onChange: (value) => {
                    // Store
                    const packet = {action: 'param', node: {id: this.id}, params: {}, prev: {}};
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
                        this.params[`page_${this.page}`] = this.controls.textarea.get();
                        this.page --;
                        this.params.currpage = this.page;
                        this.controls.textarea.set(this.params[`page_${this.page}`]);
                        this.controls.textarea.page(this.params.currpage, this.params.lastpage);
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {currpage: this.params.currpage}, prev: {currpage: this.params.currpage + 1}});
                        this.update();
                    }
                },
                onNextPage: () => {
                    this.params[`page_${this.page}`] = this.controls.textarea.get();
                    this.page ++;
                    this.params.currpage = this.page;
                    // Create new page
                    if (this.params.lastpage < this.page) {
                        this.params.lastpage ++;
                        this.controls.textarea.clear();
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {lastpage: this.params.lastpage}, prev: {lastpage: this.params.lastpage - 1}});
                    }
                    // Switch to next page
                    else {
                        this.controls.textarea.set(this.params[`page_${this.page}`]);
                    }
                    this.controls.textarea.page(this.params.currpage, this.params.lastpage);
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {currpage: this.params.currpage}, prev: {currpage: this.params.currpage - 1}});
                    this.update();
                },
            }),

        });
        this.controls.textarea.hideToolbar();

        // Menu options
        this.addOptions({

            // Appearance preset
            look: new TotalProMenuSelect({
                placeholder: 'Look',
                options: this.genLookOptions(),
                value: this.params.look,
                onChange: (value) => {

                    // Store value
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {look: value}, prev: {look: this.params.look}});
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
                placeholder: 'Color palette',
                options: this.colors,
                value: this.params.palette,
                onChange: (value) => {
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {palette: value}, prev: {palette: this.params.palette}});
                    this.params.set('palette', value);
                    metaviz.editor.menu.hide();
                }
            }),

            // Spellcheck turn on/off
            spellcheck: new TotalProMenuSwitch({
                text: 'Spellcheck',
                value: this.params.spellcheck,
                onChange: (value) => {
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, params: {spellcheck: value}, prev: {spellcheck: this.params.spellcheck}});
                    this.params.spellcheck = value;
                    this.controls.textarea.spellcheck(value);
                }
            }),

        });

        // Second page
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
     * Get Size
     */

    getSize() {
        return {
            width: this.transform.w,
            height: this.transform.h,
            minWidth: this.transform.wmin,
            minHeight: this.transform.hmin,
            maxWidth: this.transform.wmax,
            maxHeight: this.transform.hmax,
            mode: 'free'
        };
    }

    /**
     * Search meta data for given text
     */

    search(text) {
        for (const [key, value] of Object.entries(this.params)) {
            if (key.startsWith('page_')) {
                return value.toLowerCase().includes(text.toLowerCase());
            }
        }
        return false;
    }

    /**
     * Miniature version
     */

    miniature(content = false) {
        return `<div class="miniature metaviz-node-text" data-id="${this.id}">${content ? `<h2>${this.getText(1).synopsis(10)}</h2>▬▬▬▬▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬` : 'Page'}</div>`;
    }

    /**
     * Selection
     */

    select() {
        super.select();
        if (this.transform.w > 199 && this.transform.h > 199) this.controls.textarea.showToolbar();
        if (!this.locked.content) this.controls.textarea.edit(true);
        else this.animateIcon('<span class="mdi mdi-lock"></span>');
    }

    deselect() {
        super.deselect();
        this.controls.textarea.edit(false);
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
