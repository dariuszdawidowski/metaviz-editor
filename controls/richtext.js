/***************************************************************************************************
 *                                                                                                 *
 *        o  o  o             Metaviz Control Rich Text                                            *
 *       /^\/^\/^\            Replace of textarea.                                                 *
 *       \<-<@>->/            MIT License                                                          *
 *        \_*_*_/             (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/

class MetavizControlRichText extends TotalText {

    constructor(args) {
        super(args);

        // Show/hide state
        this.display = null;

        // Editing state
        this.editing = false;

        // Params
        const { name = null, onPrevPage = null, onNextPage = null } = args;

        // Control name
        this.name = name;

        // Main element
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-richtext');
        if (this.name) this.element.classList.add('metaviz-control-richtext-' + this.name.slug());

        // Textarea
        this.editor.setAttribute('contenteditable', false);

        // Toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.classList.add('toolbar');
        this.element.append(this.toolbar);

        // Toolbar icons
        this.icons = {
            bold: new MetavizControlRichTextButton({
                content: '<b>B</b>',
                onClick: () => {
                    document.execCommand('bold', false, null);
                    this.editor.focus();
                }
            }),
            italic: new MetavizControlRichTextButton({
                content: '<i>I</i>',
                onClick: () => {
                    document.execCommand('italic', false, null);
                    this.editor.focus();
                }
            }),
            underline: new MetavizControlRichTextButton({
                content: '<u>U</u>',
                onClick: () => {
                    document.execCommand('underline', false, null);
                    this.editor.focus();
                }
            }),
            style: new TotalProMenuSelect({
                placeholder: 'Style',
                options: {
                    'div': {icon: '', text: 'Normal'},
                    'h1': {icon: '', text: 'Title'},
                    'h2': {icon: '', text: 'Subtitle'},
                    'h3': {icon: '', text: 'Header 1'},
                    'h4': {icon: '', text: 'Header 2'},
                    'h5': {icon: '', text: 'Header 3'}
                },
                side: 'top',
                value: 'div',
                onShow: () => {
                    this.editor.focus();
                },
                onChange: (value) => {
                    document.execCommand('formatBlock', false, value);
                    this.editor.focus();
                }
            }),
            /*del: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-text-slash"></i>',
                onClick: () => {
                    document.execCommand('strikethrough', false, null);
                    this.element.focus();
                }
            }),
            superscript: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-superscript"></i>',
                onClick: () => {
                    document.execCommand('superscript', false, null);
                    this.element.focus();
                }
            }),
            subscript: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-subscript"></i>',
                onClick: () => {
                    document.execCommand('subscript', false, null);
                    this.element.focus();
                }
            }),*/
            hr: new MetavizControlRichTextButton({
                content: '&#9473;',
                onClick: () => {
                    document.execCommand('insertHorizontalRule', false, null);
                    this.element.focus();
                }
            }),
            prev: new MetavizControlRichTextButton({
                content: '&#8678;',
                onClick: () => {
                    if (onPrevPage) onPrevPage();
                }
            }),
            page: new MetavizControlRichTextLabel({
                content: '1/1'
            }),
            next: new MetavizControlRichTextButton({
                content: '&#8680;',
                onClick: () => {
                    if (onNextPage) onNextPage();
                }
            }),
        };
        // Css tweaks
        this.icons.style.element.style.width = '70px';
        this.icons.style.element.style.height = '20px';
        this.icons.style.element.style.borderRadius = '10px';
        const menuSelectCurrent = this.icons.style.element.querySelector('.menu-select-current');
        menuSelectCurrent.style.marginLeft = '7px';
        menuSelectCurrent.style.color = '#666';
        const menuSelectCloud = this.icons.style.element.querySelector('.menu-select-cloud');
        menuSelectCloud.style.width = '116px';
        this.icons.prev.element.style.marginLeft = 'auto';
        // Add to toolbar
        for (const [key, icon] of Object.entries(this.icons)) {
            this.toolbar.append(icon.element);
        }

        // Page nr badge
        this.pageBadge = document.createElement('div');
        this.pageBadge.classList.add('page-badge');
        this.pageBadge.innerText = '1/1';
        this.element.append(this.pageBadge);

        // Process Paste
        this.editor.addEventListener('paste', (event) => {
            event.preventDefault();

            // Get data from clipboard
            const clipboardData = event.clipboardData || window.clipboardData;
            const pastedText = clipboardData.getData('text/plain');

            // Escape html
            const escapedText = pastedText.escape();

            // Convert end of lines to html
            const modifiedText = escapedText.split('\n').map(line => `<div>${line.trim() != '' ? line : '<br>'}</div>`).join('');

            // Get selection
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();

            // Inject text
            const fragment = range.createContextualFragment(modifiedText);
            range.insertNode(fragment);

            // Set cursor at the end
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            // Cleanup html
            this.cleanUpHtml();
        });

        // Mouse & keyboard events
        this.editor.addEventListener('click', (event) => {
            // Track carret position
            this.readStyle();
        });
        this.editor.addEventListener('keydown', (event) => {
            // Track carret position
            this.readStyle();

            // PageUp
            if (event.key == 'PageUp') {
                event.preventDefault();
                this.editor.scrollBy(0, -100);
            }

            // PageDown
            else if (event.key == 'PageDown') {
                event.preventDefault();
                this.editor.scrollBy(0, 100);
            }

        });
        this.editor.addEventListener('keyup', (event) => {
            // Track carret position
            this.readStyle();
        });

        // View mode
        if (metaviz.editor.interaction == 'view') this.edit(false);
    }

    /**
     * Show
     */

    show() {
        this.element.style.display = this.display || 'block';
    }

    /**
     * Hide
     */

    hide() {
        this.display = this.element.style.display;
        this.element.style.display = 'none';
    }

    /**
     * Enable (write)
     */

    enable() {
    }

    /**
     * Disable (read-only)
     */

    disable() {
    }

    /**
     * Title hover cloud
     */

    tooltip(text) {
        this.element.title = text;
    }

    /**
     * Launch focus event
     */

    focus() {
        this.element.focus();
    }

    /**
     * Launch blur event
     */

    blur() {
        this.cleanUpHtml();
        this.element.blur();
    }

    /**
     * Edit mode
     */

    edit(enable) {
        this.editing = enable;
        // Start editing
        if (enable) {
            // Unsubscribe conflicting events
            metaviz.events.disable('viewer:keydown');
            metaviz.events.disable('viewer:keyup');
            metaviz.events.disable('editor:paste');
            metaviz.events.disable('editor:keydown');
            metaviz.events.disable('editor:keyup');
            this.editor.classList.add('editing');
            this.editor.setAttribute('contenteditable', true);
        }
        // Finish editing
        else {
            this.editor.setAttribute('contenteditable', false);
            this.editor.classList.remove('editing');
            metaviz.events.enable('viewer:keydown');
            metaviz.events.enable('viewer:keyup');
            metaviz.events.enable('editor:paste');
            metaviz.events.enable('editor:keydown');
            metaviz.events.enable('editor:keyup');
            if (this.onChange) {
                this.onChange(this.get());
                const customev = new CustomEvent('broadcast:text', { detail: {name: this.name, value: this.get()} });
                metaviz.render.container.dispatchEvent(customev);
            }
        }
    }

    /**
     * Toolbar
     */

    showToolbar() {
        this.toolbar.style.display = 'flex';
        this.pageBadge.style.display = 'none';
        this.editor.classList.remove('without-toolbar');
        this.editor.classList.add('with-toolbar');
    }

    hideToolbar() {
        this.toolbar.style.display = 'none';
        this.pageBadge.style.display = 'flex';
        this.editor.classList.remove('with-toolbar');
        this.editor.classList.add('without-toolbar');
    }

    /**
     * Set page number and total pages
     */

    page(nr, total) {
        this.icons.page.set(`${nr}/${total}`);
        this.pageBadge.innerText = `${nr}/${total}`;
    }

    /**
     * Read current paragraph style from carret position
     */

    readStyle() {
        const caret = this.getCaretPosition();
        if (caret.element && !(caret.element.hasClass('editor') && caret.element.parentNode.hasClass('total-text'))) {
            let style = caret.element.nodeName;
            if (!['DIV', 'H1', 'H2', 'H3', 'H4', 'H5'].includes(style)) style = 'div';
            this.icons.style.set(style.toLowerCase());
        }
    }

    /**
     * Cleanup odd html tags in editor's content
     */

    cleanUpHtml() {

        // Remove empty <div></div>
        const elementsToRemove = [];
        for (const child of this.editor.children) {
            if ((child.tagName === 'DIV' && child.innerHTML.trim() === '')) {
                elementsToRemove.push(child);
            }
        }
        elementsToRemove.forEach((element) => {
            this.editor.removeChild(element);
        });            

    }

}

class MetavizControlRichTextButton {

    constructor(args) {

        this.element = document.createElement('div');
        this.element.classList.add('button');
        this.element.innerHTML = args.content;

        this.element.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            args.onClick();
        });

    }

}

class MetavizControlRichTextLabel {

    constructor(args) {

        this.element = document.createElement('div');
        this.element.classList.add('label');
        this.element.innerHTML = args.content;

    }

    set(text) {
        this.element.innerHTML = text;
    }

}
