/**
 * MetavizStack Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInStack {

    /**
     * Recreate history stack to nodes & links
     */

    deserialize(json, args = {}) {
        metaviz.editor.id = json.id;
        metaviz.editor.history.set(json.history);
        metaviz.editor.history.recreate();
    }

}
