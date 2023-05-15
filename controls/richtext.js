/**
 * Metaviz Node Control Rich Text
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

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

        // Textarea
        this.editor.setAttribute('contenteditable', false);

        // Toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.classList.add('toolbar');
        this.element.append(this.toolbar);

        // Toolbar icons
        this.icons = {
            bold: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-bold"></i>',
                onClick: () => {
                    document.execCommand('bold', false, null);
                    this.editor.focus();
                }
            }),
            italic: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-italic"></i>',
                onClick: () => {
                    document.execCommand('italic', false, null);
                    this.editor.focus();
                }
            }),
            underline: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-underline"></i>',
                onClick: () => {
                    document.execCommand('underline', false, null);
                    this.editor.focus();
                }
            }),
            style: new MenuSelect({
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
                content: '<i class="fa-solid fa-grip-lines"></i>',
                onClick: () => {
                    document.execCommand('insertHorizontalRule', false, null);
                    this.element.focus();
                }
            }),
            prev: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-circle-chevron-left"></i>',
                onClick: () => {
                    if (onPrevPage) onPrevPage();
                }
            }),
            page: new MetavizControlRichTextLabel({
                content: '1/1'
            }),
            next: new MetavizControlRichTextButton({
                content: '<i class="fa-solid fa-circle-chevron-right"></i>',
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

        // Track cursor position
        this.editor.addEventListener('click', (event) => {
            this.readStyle();
        });
        this.editor.addEventListener('keydown', (event) => {
            this.readStyle();
        });
        this.editor.addEventListener('keyup', (event) => {
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
            if (this.onChange) this.onChange(this.get());
            metaviz.render.layers.current.update();
        }
    }

    /**
     * Toolbar
     */

    showToolbar() {
        this.toolbar.style.display = 'flex';
        this.editor.classList.remove('without-toolbar');
        this.editor.classList.add('with-toolbar');
    }

    hideToolbar() {
        this.toolbar.style.display = 'none';
        this.editor.classList.remove('with-toolbar');
        this.editor.classList.add('without-toolbar');
    }

    /**
     * Set page number and total pages
     */

    page(nr, total) {
        this.icons.page.set(`${nr}/${total}`);
    }

    /**
     * Caret position
     */

    getCursorPosition(element = this.editor) {
        let start = 0;
        let end = 0;
        const doc = element.ownerDocument || element.document;
        const win = doc.defaultView || doc.parentWindow;
        let sel;
        let anchor;
        if (typeof win.getSelection != 'undefined') {
            sel = win.getSelection();
            anchor = sel.anchorNode;
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                start = preCaretRange.toString().length;
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                end = preCaretRange.toString().length;
            }
        }
        else if ((sel = doc.selection) && sel.type != 'Control') {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToStart', textRange);
            start = preCaretTextRange.text.length;
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            end = preCaretTextRange.text.length;
        }
        return { start: start, end: end, anchor, parent: anchor.nodeType == 3 ? anchor.parentNode : anchor};
    }

    /**
     * Read current paragraph style from carret position
     */

    readStyle() {
        const cursor = this.getCursorPosition();
        let style = cursor.parent.nodeName;
        if (!['DIV', 'H1', 'H2', 'H3', 'H4', 'H5'].includes(style)) style = 'div';
        this.icons.style.set(style.toLowerCase());
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
