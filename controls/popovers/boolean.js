/**
 * Metaviz Popover: Boolean
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizPopoverBoolean {

    /**
     * Constructor
     * args:
     *    text: label
     *    value: current value (bool)
     *    onChange: callback on change providing value bool
     */

    constructor(args) {

        const { text = '', value = false, onChange = null } = args;

        // Icon
        this.element = document.createElement('span');
        this.element.classList.add('toolbar-action', 'popover-boolean');

        // Cloud
        const cloud = document.createElement('div');
        cloud.classList.add('menu-select-cloud', 'top', 'toolbar-cloud', 'popover-cloud');
        this.element.append(cloud);

        // Switcher
        const switcher = new TotalProMenuSwitch({text, value, onChange: (value) => {
            this.set(value);
            if (onChange) onChange(value);
        }});
        cloud.append(switcher.element);

        // Initial value
        this.set(value);
    }

    /**
     * Set appearance
     */

    set(value) {
        if (value == true)
            this.element.innerHTML = '<svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="var(--paper-2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" rx="3" ry="3" stroke="var(--paper-2)" fill="none"/><path d="M5 10l3 3l7-7" /></svg>';
        else
            this.element.innerHTML = '<svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="var(--paper-2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" rx="3" ry="3" stroke="var(--paper-2)" fill="none"/></svg>';
    }

}
