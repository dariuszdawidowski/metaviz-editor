/**
 * MetavizStack Encoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutStack {

    /**
     * Convert objects to json
     */

    serialize(history) {
        let json = `{\n"format": "MetavizStack",\n"version": 1,\n"id": "${metaviz.editor.id}",\n"name": "${metaviz.editor.name}",\n`;
        json += `"history": [\n`;
        history.forEach((packet, index) => {
            let p = { ...packet };
            if ('prev' in p) delete p['prev'];
            if ('positionPrev' in p) delete p['positionPrev'];
            if ('sizePrev' in p) delete p['sizePrev'];
            if ('parentPrev' in p) delete p['parentPrev'];
            if ('namePrev' in p) delete p['namePrev'];
            json += JSON.stringify(p) + ((index < history.length - 1) ? ',\n' : '\n')
        });
        json += `]\n}`;
        return json;
    }

}