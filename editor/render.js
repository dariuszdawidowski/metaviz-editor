/**
 * Metaviz Editor Render HTML5
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizEditorRender extends TotalDiagramRenderHTML5 {

    /**
     * Perform pan damping
     */

    damp(factor = 0.97, minSpeed = 250) {

        const dampAnimation = () => {
            this.offset.delta.x *= factor;
            this.offset.delta.y *= factor;
            this.offset.x += this.offset.delta.x / window.devicePixelRatio;
            this.offset.y += this.offset.delta.y / window.devicePixelRatio;
            metaviz.editor.cage.update();
            this.update();

            if (Math.abs(this.offset.delta.x) > 0.1 || Math.abs(this.offset.delta.y) > 0.1) {
                requestAnimationFrame(dampAnimation);
            }
        };

        if (this.offset.speed > minSpeed) dampAnimation();
    }

}
