/***************************************************************************************************
 *               o                                                                                 *
 *    ><(((o>    .            Metaviz Control Input Renderer                                       *
 *               .            Input text in line.                                                  *
 *                >°))))><    MIT License                                                          *
 *   ) ) )                    (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *  ( ( (  .    >+++o>                                                                             *
 **************************************************************************************************/

class MetavizControlInput extends MetavizControl {

    /**
     * Constructor
     * @param args.name: name of the control
     * @param args.value: inital value
     * @param args.placeholder: helping message
     * @param args.multiline: editable in multiple lines (default false)
     * @param args.onChange: callback
     * @param args.broadcast: broadcast event message (optional)
     */

    constructor(args) {
        super();

        // Params
        const { name = null, value = null, placeholder = null, multiline = false, onChange = null, broadcast = null } = args;

        // Control name
        this.name = name;

        // Store value
        this.value = value;

        // Broadcast event message
        this.broadcast = broadcast;

        // Input
        this.element = document.createElement('div');
        if (value) this.set(value);
        if (placeholder) this.element.placeholder = placeholder;
        this.element.setAttribute('contenteditable', 'true');
        this.element.setAttribute('spellcheck', 'false');
        this.element.setAttribute('autocomplete', 'off');
        this.element.setAttribute('name', 'notASearchField'); // Safari hack to prevent autofill
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-input');
        if (this.name) this.element.classList.add('metaviz-control-input-' + this.name.slug());

        // Single line mode
        if (!multiline) this.element.classList.add('metaviz-control-input-single-line');

        // View mode
        if (metaviz.editor.interaction == 'view') this.edit(false);

        // Enter blurs
        this.element.addEventListener('keyup', (event) => {
            if (event.key == 'Enter') this.element.blur();
        });

        // Disable editor events on Focus
        this.element.addEventListener('focus', (event) => {
            metaviz.events.disable('viewer:keydown');
            metaviz.events.disable('viewer:keyup');
            metaviz.events.disable('editor:paste');
            metaviz.events.disable('editor:keydown');
            metaviz.events.disable('editor:keyup');
            this.edit(true);
        });

        // Update nodes on Blur
        this.element.addEventListener('blur', (event) => {
            this.edit(false);
            metaviz.events.enable('viewer:keydown');
            metaviz.events.enable('viewer:keyup');
            metaviz.events.enable('editor:paste');
            metaviz.events.enable('editor:keydown');
            metaviz.events.enable('editor:keyup');
            // Callback
            if (onChange) {
                onChange(event.target.innerText);
            }
            // Broadcast event
            if (this.broadcast) {
                const customev = new CustomEvent('broadcast:input', {
                    detail: {
                        message: this.broadcast,
                        type: this.constructor.name,
                        name: this.name,
                        value: this.get(),
                        prev: this.value
                    }
                });
                metaviz.render.container.dispatchEvent(customev);
            }
            // Update value
            this.value = this.get();
        });

        // Process Paste
        this.element.addEventListener('paste', (event) => {
            event.preventDefault();
            const clipboardData = event.clipboardData || window.clipboardData;
            const pastedText = clipboardData.getData('text/plain');
            this.element.innerText = pastedText;
        });
    }

    /* Input value */

    set(text) {
        this.element.innerText = text;
    }

    get() {
        return this.element.innerText;
    }

    /**
     * Set selected text
     */

    setSelection(from = 'begin', to = 'end') {
        const range = document.createRange();
        range.selectNodeContents(this.element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Get selected text
     */

    getSelection() {
        const selection = window.getSelection();
        let selectedText = '';

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            selectedText = container.textContent || container.innerText;
        }

        return selectedText;
    }

    /**
     * Edit mode
     */

    edit(enable) {
        this.editing = enable;
        // Start editing
        if (enable) {
            this.element.classList.add('editing');
            this.element.setAttribute('contenteditable', true);
        }
        // Finish editing
        else {
            this.element.removeAttribute('contenteditable');
            this.element.classList.remove('editing');
        }
    }

}
