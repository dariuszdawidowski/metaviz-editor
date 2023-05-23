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

    constructor(args) {
        super();

        // Params
        const { name = null, value = null, options = null, onChange = null } = args;

        this.element = document.createElement('select');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-select');

        if (options) this.build(options);
        if (value) this.set(value);

        // Dirty on change
        this.element.addEventListener('change', (event) => {
            if (onChange) onChange(event.target.value);
        });

    }

    /**
     * Build options
     * @param options: {'value': 'Display Name', ....}
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
