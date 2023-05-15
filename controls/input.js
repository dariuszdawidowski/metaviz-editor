/**
 * Metaviz Node Control Input Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 * 
 * Params:
 * name: name of the control
 * value: inital value
 * placeholder: helping message
 * onChange: callabck
 */

/*
                 o 
                 .          .      
   ><(((^>                      >°))))><
                                             <o)))><  
           ) ) )                         (
          ( ( (  .    >+++o>            ) ) )
*/

class MetavizControlInput extends MetavizControl {

    constructor(params) {
        super();

        // Params
        const { name = null, value = null, placeholder = null, onChange = null } = params;

        // Control name
        this.name = name;

        // Input
        this.element = document.createElement('input');
        if (value) this.set(value);
        if (placeholder) this.element.placeholder = placeholder;
        this.element.setAttribute('spellcheck', 'false');
        this.element.setAttribute('autocomplete', 'off');
        this.element.setAttribute('name', 'notASearchField'); // Safari hack to prevent autofill
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-input');
        if (this.name) this.element.classList.add('metaviz-control-input-' + this.name.slug());

        // Previous value
        // this.valuePrev = value ? value : null;

        // View mode
        if (metaviz.editor.interaction == 'view') this.edit(false);

        // Dirty on change
        this.element.addEventListener('change', (event) => {
            if (onChange) onChange(event.target.value);
        });

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
            metaviz.render.layers.current.update();
        });
    }

    /* Input value */

    set(text) {
        this.element.value = text;
    }

    get() {
        return this.element.value;
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

}
