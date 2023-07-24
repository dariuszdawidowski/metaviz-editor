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
     * @param args.onChange: callabck
     */

    constructor(args) {
        super();

        // Params
        const { name = null, value = null, placeholder = null, onChange = null } = args;

        // Control name
        this.name = name;

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
                const customev = new CustomEvent('broadcast:input', { detail: {name: this.name, value: event.target.innerText} });
                metaviz.render.container.dispatchEvent(customev);
            }
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
     * Enable (write)
     */

    enable() {
        this.element.removeAttribute('readonly');
    }

    /**
     * Disable (read-only)
     */

    disable() {
        this.element.setAttribute('readonly', '');
    }

    /**
     * Set selected text
     */

    getSelection() {
        let selectedText = '';

        if (typeof this.element.selectionStart === 'number' && typeof this.element.selectionEnd === 'number') {
            const startIndex = this.element.selectionStart;
            const endIndex = this.element.selectionEnd;

            if (startIndex !== endIndex) {
                selectedText = this.element.value.substring(startIndex, endIndex);
            }
        }
        else if (document.selection && document.selection.createRange) {
            const range = document.selection.createRange();
            if (range.text) {
              selectedText = range.text;
            }
        }

        return selectedText;
    }

}
