/**
 * Metaviz Popover: Color picker
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizPopoverTextSelect {

    /**
     * Constructor
     * args:
     *    options: dict {value: {icon: '...', text: '...'}, ...}
     *    value: current value
     *    onChange: callback on change providing value nr
     */

    constructor(args) {

        const { options = {}, value = null, onChange = null } = args;

        // Icon
        this.element = document.createElement('span');
        this.element.classList.add('toolbar-action');
        this.element.innerHTML = options[value].icon;

        // Cloud
        const cloud = document.createElement('div');
        cloud.classList.add('menu-select-cloud', 'top', 'toolbar-cloud', 'popover-cloud');
        cloud.style.flexDirection = 'column';
        this.element.append(cloud);

        // Generate text labels
        Object.entries(options).forEach(([value, option]) => {
            const label = document.createElement('div');
            label.classList.add('popover-option', 'popover-option-text');
            label.innerText = option.text;
            label.dataset.value = value;
            if (onChange) label.addEventListener('click', () => {
                onChange(label.dataset.value);
            });
            cloud.append(label);
        });

    }

}
