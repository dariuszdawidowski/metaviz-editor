/**
 * Metaviz Editor Render HTML5
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizEditorRender extends TotalDiagramRenderHTML5 {

    /**
     * Perform pan damping
     */

    damp(factor = 0.97, minSpeed = 300) {

        this.transform.calcSpeed();

        const dampAnimation = () => {
            this.transform.delta.x *= factor;
            this.transform.delta.y *= factor;
            this.transform.x += this.transform.delta.x / window.devicePixelRatio;
            this.transform.y += this.transform.delta.y / window.devicePixelRatio;
            metaviz.editor.cage.update();
            this.update();

            if (Math.abs(this.transform.delta.x) > 0.1 || Math.abs(this.transform.delta.y) > 0.1) {
                requestAnimationFrame(dampAnimation);
            }
        };

        if (this.transform.speed > minSpeed) dampAnimation();
    }

}
