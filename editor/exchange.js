/**
 * Metaviz File Download
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizExchange {

    /**
     * Constructor
     */

    constructor() {

        // Hack: dummy a href for download
        this.a = document.createElement('a');
        this.a.style.display = 'none';
        this.a.style.position = 'absolute';
        this.a.style.left = '-3000px';
        metaviz.render.container.appendChild(this.a);
    }
        
    /**
     * Paste file or item from system clipboard
     */

    paste(clipboardData, offset = {x: 0, y: 0}) {
        for (const item of clipboardData.items) {
            // Item
            if (item.kind == 'string' && item.type == 'text/plain') {
                item.getAsString((text) => {
                    this.item(text, offset);
                });
            }
        }
    }

    /**
     * Detect Item type and advance to processing
     */

    item(text, offset = {x: 0, y: 0}) {
        const data = this.detectFormat(text);

        // Create whole diagram from json
        if (data.mime == 'text/metaviz+json') {
            this.processMV(data.json, offset);
        }
    }

    /**
     * MetavizJSON -> Append diagram
     */

    processMV(json, offset) {

        // Decode
        const newNodes = metaviz.format.deserialize('text/metaviz+json', json, {offset, reindex: true, reparent: true, realign: true, save: true});
console.log(newNodes)
        // Redraw
        metaviz.editor.update();

        // Launch start for nodes
        for (const node of newNodes) node.start();

        // Check empoty board/folder
        metaviz.editor.checkEmpty();
    }

    /**
     * Detect formats
     */

    detectFormat(text) {

        // Detecting 'text/metaviz+json'
        let json = null;
        try { json = JSON.parse(text); } catch(error) {}
        if (json && json.format == 'MetavizJSON') return {mime: 'text/metaviz+json', json: json};

        // Unreckognized format returns plain text
        return {mime: 'text/plain', text: text};
    }

    /**
     * Download file from raw data
     * @param args.data: raw blob data
     * @param args.path: path to file or raw blob data
     * @param atgs.name: file name
     */

    download(args) {
        const { data = null, path = null, name = 'file' } = args; 

        // File from disk
        if (path) {
            this.a.href = data;
        }

        // Raw blob
        else if (data) {
            const blob = new Blob([data]);
            this.a.href = URL.createObjectURL(blob);
        }

        // File name
        if (name) this.a.download = name;

        // Simulate click to start download
        this.a.click();
    }

}
