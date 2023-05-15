/**
 * Metaviz Node Control Slider Renderer
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizControlSlider extends MetavizControl {

    constructor(label, min, max, value, step, orientation, tip) {
        super();

        // Mouse clicked down
        this.drag = false;

        // Parameters
        this.orientation = orientation || 'h';

        // Virtual values (desired result)
        this.virtual = {
            min: min,
            max: max,
            step: step,
            toVisual: (n) => {
                const percent = (n - this.virtual.min) / (this.virtual.max - this.virtual.min);
                return Math.round(percent * (this.visual.max - this.visual.min) + this.visual.min);
            }
        };

        // Visual values (pixels on screen)
        this.visual = {
            min: 1,
            max: 200,
            toVirtual: (n) => {
                const percent = (n - this.visual.min) / (this.visual.max - this.visual.min);
                const result = percent * (this.virtual.max - this.virtual.min) + this.virtual.min;
                return Math.round(result / this.virtual.step) * this.virtual.step;
            }
        };

        // Container
        this.element = document.createElement('div');
        this.control = this.element; // DEPRECATED (backward compatibility)
        this.element.classList.add('metaviz-control');
        this.element.classList.add('metaviz-control-slider');
        this.element.classList.add('metaviz-control-slider-' + this.orientation);

        // Label
        this.label = document.createElement('label');
        this.label.innerText = label;
        if (tip) this.label.title = tip;
        this.element.appendChild(this.label);

        // Bar background
        this.bar = document.createElement('div');
        this.bar.classList.add('bar');
        this.element.appendChild(this.bar);

        // Fader
        this.fader = document.createElement('div');
        this.fader.classList.add('fader');
        this.fader.position = (pixels) => {
            if (this.orientation == 'h') {
                this.fader.style.top = '0';
                this.fader.style.left = (pixels - 5) + 'px';
            }
            else if (this.orientation == 'v') {
                this.fader.style.top = (this.visual.max - pixels - 5) + 'px';
                this.fader.style.left = '0';
            }
        }
        this.fader.position(this.virtual.toVisual(value));
        this.bar.appendChild(this.fader);

        // Input
        this.input = document.createElement('input');
        if (value !== null) this.set(value);
        this.input.setAttribute('spellcheck', 'false');
        this.element.appendChild(this.input);

        // View mode
        if (metaviz.editor.interaction == 'view') {
            this.edit(false);
        }
        // Edit mode
        else
        {
            // Input: Change value
            this.input.addEventListener('change', (event) => {
                // Cut to min-max
                const val = Math.min(this.virtual.max, Math.max(this.virtual.min, this.input.value.toIntOrFloat()));
                this.input.value = val;
                this.fader.position(this.virtual.toVisual(val));
                //metaviz.editor.data.dirty(true); #TODO history store
            });

            // Input: Enter blurs
            this.input.addEventListener('keyup', (event) => {
                if (event.key == 'Enter') this.input.blur();
            });

            // Input: Disable editor events on Focus
            this.input.addEventListener('focus', (event) => {
                metaviz.events.disable('viewer:keydown');
                metaviz.events.disable('viewer:keyup');
                metaviz.events.disable('editor:paste');
                metaviz.events.disable('editor:keydown');
                metaviz.events.disable('editor:keyup');
            });

            // Input: Update nodes on Blur
            this.input.addEventListener('blur', (event) => {
                metaviz.events.enable('viewer:keydown');
                metaviz.events.enable('viewer:keyup');
                metaviz.events.enable('editor:paste');
                metaviz.events.enable('editor:keydown');
                metaviz.events.enable('editor:keyup');
                metaviz.render.layers.current.update();
            });

            // Fader Event: Mouse down
            this.fader.addEventListener('mousedown', (event) => {
                this.drag = true;
                metaviz.events.disable('editor:*');
            });

            // Fader Event: Mouse move
            this.element.addEventListener('mousemove', (event) => {
                if (this.drag) {
                    const barDim = this.bar.getBoundingClientRect();
                    let pos = 0;
                    if (this.orientation == 'h') {
                        pos = Math.min(Math.max(this.visual.min, Math.round(event.pageX - barDim.left)), this.visual.max);
                    }
                    else if (this.orientation == 'v') {
                        pos = Math.min(Math.max(this.visual.min, Math.round(this.visual.max - (event.pageY - barDim.top))), this.visual.max);
                    }
                    this.fader.position(pos);
                    this.input.value = this.visual.toVirtual(pos);
                    //metaviz.editor.data.dirty(true); #TODO history store
                }
            });

            // Fader Event: Mouse up
            this.element.addEventListener('mouseup', (event) => {
                if (this.drag) {
                    metaviz.events.enable('editor:*');
                    this.drag = false;
                }
            });

            // Fader Event: Mouse leave
            this.element.addEventListener('mouseleave', (event) => {
                if (this.drag) {
                    metaviz.events.enable('editor:*');
                    this.drag = false;
                }
            });

        }
    }

    /**
     * Value
     */

    set(value) {
        this.input.value = value;
    }

    get() {
        return this.input.value.toIntOrFloat();
    }

    /**
     * Label
     */

    setLabel(text) {
        this.label.innerText = text;
    }

    /**
     * Min
     */

    setMin(value) {
        // New bottom range
        this.virtual.min = value;
        // Clamp to new value
        this.set(Math.max(this.get(), value));
        // Redraw fader
        this.fader.position(this.virtual.toVisual(this.get()));
    }

    /* Max */

    setMax(value) {
        // New top range
        this.virtual.max = value;
        // Clamp to new value
        this.set(Math.min(this.get(), value));
        // Redraw fader
        this.fader.position(this.virtual.toVisual(this.get()));
    }

    /**
     * Step
     */

    setStep(value) {
        // New step value
        this.virtual.step = value;
    }

    /**
     * Tip
     */

    setTip(text) {
        this.label.title = text;
    }

    /**
     * Orientation h = horizontal v = vertical
     */

    setOrientation(text) {
        this.element.classList.remove('metaviz-control-slider-h', 'metaviz-control-slider-v');
        this.orientation = text;
        this.element.classList.add('metaviz-control-slider-' + this.orientation);
        this.fader.position(this.virtual.toVisual(this.get()));
    }

    /**
     * Enable (write)
     */

    enable() {
        this.input.removeAttribute('readonly');
    }

    /**
     * Disable (read-only)
     */

    disable() {
        this.input.setAttribute('readonly', '');
    }

}
