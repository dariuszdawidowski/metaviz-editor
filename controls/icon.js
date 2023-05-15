/**
 * Metaviz Node Control Icon Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlIcon extends MetavizControl {

    /**
     * Constructor
     * family: icon family
     *   fa-: Font Awesome 6.x
     *   fas: Font Awesome Solid
     *   fab: Font Awesome Brands
     *   svg: regular svg file
     *   img: bitmap image
     *   emoji: emoji text
     * name: name of the Font Awesome or url to svg file
     */

    constructor(family, name = '') {
        super();

        // Variables
        this.family = family;
        this.name = name;

        // Create icon in DOM
        this.build();
    }

    /**
     * Set new icon
     */

    set(family, name) {
        this.family = family;
        this.name = name;
        const parent = this.element.parentNode;
        this.destroy();
        this.build();
        parent.append(this.element)
    }

    /**
     * Build icon
     */

    build() {
        // Font Awesome
        if (this.family.startsWith('fa-') || this.family == 'fas' || this.family == 'far' || this.family == 'fab') {
            this.element = document.createElement('i');
            this.element.classList.add('metaviz-control');
            this.element.classList.add('metaviz-control-icon');
            this.element.classList.add(this.family);
            this.element.classList.add(this.name);
            this.element.classList.add('metaviz-control-icon-' + this.name.slug());
        }

        // SVG file or IMG bitmap image
        else if (this.family == 'svg' || this.family == 'img') {
            this.element = document.createElement('img');
            this.element.classList.add('metaviz-control');
            this.element.classList.add('metaviz-control-icon');
            if (this.name) {
                this.element.src = this.name;
                this.element.classList.add('metaviz-control-icon-' + this.name.slug());
            }
        }

        // Emoji text
        else if (this.family == 'emoji') {
            this.element = document.createElement('div');
            this.element.classList.add('metaviz-control');
            this.element.classList.add('metaviz-control-icon');
            this.element.classList.add('metaviz-control-icon-emoji');
            if (this.name) {
                this.element.innerText = this.name;
            }
        }

        // Prevent system drag
        if (this.element) this.element.ondragstart = function() { return false; };
    }

    /**
     * Destroy icon
     */

    destroy() {
        this.element.remove();
        this.element = null;
    }

}
