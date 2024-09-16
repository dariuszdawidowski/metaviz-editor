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

        // Options
        this.options = options;

        // Container
        this.element = document.createElement('span');
        this.element.classList.add('toolbar-action');

        // Icon
        this.icon = document.createElement('span');
        this.icon.classList.add('popover-icon');
        this.element.append(this.icon);

        // Cloud
        const cloud = document.createElement('div');
        cloud.classList.add('menu-select-cloud', 'top', 'toolbar-cloud', 'popover-cloud');
        cloud.style.flexDirection = 'column';
        this.element.append(cloud);

        // Generate text labels
        Object.entries(options).forEach(([value, option]) => {
            const label = document.createElement('div');
            label.classList.add('popover-option', 'popover-option-text');
            label.dataset.value = value;
            label.insertAdjacentHTML('afterbegin', option.icon);
            const text = document.createElement('div');
            text.innerText = option.text;
            text.classList.add('popover-option-content')
            label.append(text);
            if (onChange) label.addEventListener('click', () => {
                this.deselectAll();
                this.select(label.dataset.value);
                onChange(label.dataset.value);
            });
            cloud.append(label);
        });

        // Select current
        this.select(value);
    }

    /**
     * Select
     */

    select(value) {
        this.icon.innerHTML = this.options[value].icon;
        this.element.querySelectorAll('.popover-option').forEach(text => {
            if (text.dataset.value == value) text.classList.add('selected');
        });
    }

    /**
     * Clear all selection
     */

    deselectAll() {
        this.element.querySelectorAll('.popover-option').forEach(text => {
            text.classList.remove('selected');
        });
    }

}
