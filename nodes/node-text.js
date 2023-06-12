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
        if (!('look' in this.meta)) this.meta['look'] = 'sticky';
        if (!('spellcheck' in this.meta)) this.meta['spellcheck'] = true;
        if (!('page_1' in this.meta)) this.meta['page_1'] = '';
        if (!('lastpage' in this.meta)) this.meta['lastpage'] = 1;
        if (!('currpage' in this.meta)) this.meta['currpage'] = 1;
        if (!('palette' in this.meta)) this.meta['palette'] = '0';

        // Current page number
        this.page = this.meta['currpage'];

        // Current color scheme
        this.element.classList.add('palette-' + this.meta.palette);

        // Initial size
        if (this.transform.w == 0) this.setSize({width: this.looks[this.meta.look].width, height: this.looks[this.meta.look].height});

        // Controls
        this.addControls({

            // Text area control
            textarea: new MetavizControlRichText({
                name: `page_${this.page}`,
                value: this.getText(),
                spellcheck: this.meta.spellcheck,
                onChange: (value) => {
                    // Store
                    const params = {action: 'param', node: {id: this.id}, meta: {}, metaPrev: {}};
                    params.meta[`page_${this.page}`] = value;
                    params.metaPrev[`page_${this.page}`] = this.meta[`page_${this.page}`];
                    metaviz.editor.history.store(params);

                    // Value
                    this.meta[`page_${this.page}`] = value;

                    // Resubscribe
                    metaviz.events.enable('viewer:keydown');
                    metaviz.events.enable('viewer:keyup');
                    metaviz.events.enable('editor:paste');
                    metaviz.events.enable('editor:keydown');
                    metaviz.events.enable('editor:keyup');
                },
                onPrevPage: () => {
                    if (this.page > 1) {
                        this.meta[`page_${this.page}`] = this.controls.textarea.get();
                        this.page --;
                        this.meta.currpage = this.page;
                        this.controls.textarea.set(this.meta[`page_${this.page}`]);
                        this.controls.textarea.page(this.meta.currpage, this.meta.lastpage);
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {currpage: this.meta.currpage}, metaPrev: {currpage: this.meta.currpage + 1}});
                        this.update();
                    }
                },
                onNextPage: () => {
                    this.meta[`page_${this.page}`] = this.controls.textarea.get();
                    this.page ++;
                    this.meta.currpage = this.page;
                    // Create new page
                    if (this.meta.lastpage < this.page) {
                        this.meta.lastpage ++;
                        this.controls.textarea.clear();
                        metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {lastpage: this.meta.lastpage}, metaPrev: {lastpage: this.meta.lastpage - 1}});
                    }
                    // Switch to next page
                    else {
                        this.controls.textarea.set(this.meta[`page_${this.page}`]);
                    }
                    this.controls.textarea.page(this.meta.currpage, this.meta.lastpage);
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {currpage: this.meta.currpage}, metaPrev: {currpage: this.meta.currpage - 1}});
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
                value: this.meta.look,
                onChange: (value) => {

                    // Store value
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {look: value}, metaPrev: {look: this.meta.look}});
                    this.meta.set('look', value);

                    // Change size
                    this.setSize(this.looks[this.meta.look], true);
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
                value: this.meta.palette,
                onChange: (value) => {
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {palette: value}, metaPrev: {palette: this.meta.palette}});
                    this.meta.set('palette', value);
                    metaviz.editor.menu.hide();
                }
            }),

            // Spellcheck turn on/off
            spellcheck: new TotalProMenuSwitch({
                text: 'Spellcheck',
                value: this.meta.spellcheck,
                onChange: (value) => {
                    metaviz.editor.history.store({action: 'param', node: {id: this.id}, meta: {spellcheck: value}, metaPrev: {spellcheck: this.meta.spellcheck}});
                    this.meta.spellcheck = value;
                    this.controls.textarea.spellcheck(value);
                }
            }),

        });

        // Meta setter
        this.meta.set = (key, value) => {

            this.meta[key] = value;

            if (key.startsWith('page_')) {
                const page = parseInt(key.replace('page_', ''));
                if (page == this.page) this.controls.textarea.set(value);
            }

            else if (key == 'palette') {
                for (const [key, color] of Object.entries(this.colors)) this.element.classList.remove(color.class);
                this.element.classList.add(this.colors[this.meta.palette].class);
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
        this.setLook(this.meta.look);
        // Pages on toolbar
        this.controls.textarea.page(this.meta.currpage, this.meta.lastpage);
    }

    /**
     * Look and setting
     */

    setLook(value) {
        // Class
        for (const [key, look] of Object.entries(this.looks)) this.element.classList.remove(key);
        this.element.classList.add(value);
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
        return false;
    }

    /**
     * Miniature version
     */

    miniature(content = false) {
        this.serialize();
        return `<div class="miniature metaviz-node-text" data-id="${this.id}">${content ? `<h2>${this.getText(1).synopsis(10)}</h2>▬▬▬▬▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬▬<br>▬▬▬▬▬▬▬▬<br>▬▬▬▬` : 'Page'}</div>`;
    }

    /**
     * Selection
     */

    select() {
        super.select();
        if (this.transform.w > 199 && this.transform.h > 199) this.controls.textarea.showToolbar();
        this.controls.textarea.edit(true);
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
            for (let nr = 0; nr < this.meta.lastpage; nr ++) {
                pages += this.meta[`page_${nr}`];
            }
            return pages;
        }
        // Single page
        return this.meta[`page_${nr}`];
    }

    /**
     * Flush all data
     */

    flush() {
        const params = {action: 'param', node: {id: this.id}, meta: {}, metaPrev: {}};
        params.meta[`page_${this.page}`] = this.controls.textarea.get();
        params.metaPrev[`page_${this.page}`] = this.meta[`page_${this.page}`];
        metaviz.editor.history.store(params);
    }

    /**
     * Update (everyframe when something is changed e.g. move)
     */

    update() {
        super.update();
        this.setLook(this.meta.look);
    }

}

registry.add({proto: MetavizNodeText, name: 'Text', icon: '<i class="fas fa-sticky-note"></i>'});
