/**
 * Metaviz Popover: Color picker
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizPopoverColorPicker {

    /**
     * Constructor
     * args:
     *    options: array of string colors e.g. ['#fff', 'red', 'var(--color-1)']
     *    value: current value
     *    onChange: callback on change providing value nr
     */

    constructor(args) {

        const { options = ['var(--paper-2)'], value = 0, onChange = null } = args;

        // Icon
        this.element = document.createElement('span');
        this.element.classList.add('toolbar-action', 'circle');
        this.element.style.background = options[value];

        // Cloud
        const cloud = document.createElement('div');
        cloud.classList.add('menu-select-cloud', 'top', 'toolbar-cloud', 'popover-cloud');
        cloud.style.flexDirection = 'row';
        this.element.append(cloud);
       
        // Generate colors
        let nr = 0;
        options.forEach(option => {
            const color = document.createElement('span');
            color.classList.add('popover-option', 'circle', 'outline');
            color.style.background = option;
            color.dataset.value = nr;
            if (onChange) color.addEventListener('click', () => {
                const val = parseInt(color.dataset.value);
                this.element.style.background = options[val];
                onChange(val);
            });
            cloud.append(color);
            nr ++;
        });

    }

}
