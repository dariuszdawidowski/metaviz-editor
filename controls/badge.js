/**
 * Metaviz Node Control Badge
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlBadge extends MetavizControl {

    /**
     * Constructor
     */

    constructor(number = 0) {
        super();
        this.element = document.createElement('div');
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-badge');
        this.set(number);
    }

    /**
     * Setter
     */

    set(number) {
        // 0
        if (number == 0) {
            this.element.innerText = '0';
            this.element.style.display = 'none';
        }
        // < 10
        else if (number < 10) {
            this.element.innerText = number;
            this.element.style.display = 'block';
        }
        // > 9
        else if (number > 9) {
            this.element.innerText = '9+';
            this.element.classList.add('wide');
            this.element.style.display = 'block';
        }
    }

    /**
     * Getter
     */

    get() {
        return this.element.innerText;
    }

}
