/**
 * MetavizStack Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInStack {

    /**
     * Recreate json history stack to nodes & links
     */

    deserialize(json, args = {}) {
        metaviz.editor.history.set(json.history);
        metaviz.editor.history.recreate();
    }

}
