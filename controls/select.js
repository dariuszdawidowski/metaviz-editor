/**
 * Metaviz Node Control Select Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlSelect extends MetavizControl {

    /**
     * Constructor
     * options: {'value': 'Display Name', ....}
     */

    constructor(node = null, varname = null, value = null, options = null) {
        super();

        this.element = document.createElement('select');
        this.control = this.element; // DEPRECATED (backward compatibility)
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-select');

        if (options) this.build(options);
        if (value) this.set(value);

        // Previous value
        this.valuePrev = value ? value : null;

        // Dirty on change
        this.element.addEventListener('change', (event) => {
            const params = {action: 'param', node: {id: node.id}, data: {}, dataPrev: {}};
            params.data[varname] = event.target.value;
            params.dataPrev[varname] = this.valuePrev;
            this.valuePrev = event.target.value;
            metaviz.editor.history.store(params);
        });

    }

    /**
     * Build options
     * options: {'value': 'Display Name', ....}
     */

    build(options) {
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            this.element.appendChild(option);
        }
    }

    /* Set/get value */

    set(text) {
        this.element.value = text;
    }

    get() {
        return this.element.value;
    }


}
