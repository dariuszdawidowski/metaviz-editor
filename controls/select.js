/***************************************************************************************************
 *      ..&&&  ..       .                                                                          *
 *     &&&& - &&&&     &&&     Metaviz Control Select Renderer                                     *
 *         ... -__ \_// &&&&   Text value selector.                                                *
 *        &&&&&   (  )         MIT License                                                         *
 *    ___________.-__"-___     (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.              *
 *    \__________________/                                                                         *
 **************************************************************************************************/

class MetavizControlSelect extends MetavizControl {

    /**
     * Constructor
     * @param: name: optional name for control
     * @param: value: initial value
     * @param: options: set of available options {'foo': 'Bar', ....}
     */

    constructor(args = {}) {
        super();

        // Params
        const { name = null, value = null, options = null, onChange = null } = args;

        // Control name
        this.name = name;

        this.element = document.createElement('select');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-select');
        if (this.name) this.element.classList.add('metaviz-control-select-' + this.name.slug());

        if (options) this.build(options);
        if (value) this.set(value);

        // Dirty on change
        this.element.addEventListener('change', (event) => {
            if (onChange) {
                onChange(event.target.value);
                const customev = new CustomEvent('broadcast:select', { detail: {name: this.name, value: event.target.value} });
                metaviz.render.container.dispatchEvent(customev);
            }
        });

    }

    /**
     * Build options
     * @param options: {'value': 'Display Name', ....}
     */

    build(options) {
        if (this.element.children.length > 0) this.clear();
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            this.element.append(option);
        }
    }

    /**
     * Set value
     * @param text
     */

    set(text) {
        this.element.value = text;
    }

    /**
     * Get value
     * @return current value (string)
     */

    get() {
        return this.element.value;
    }

    /**
     * Remove all options
     */

    clear() {
        while (this.element.firstChild) {
            this.element.remove(this.element.firstChild);
        }        
    }

}
