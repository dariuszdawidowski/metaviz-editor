/**
 * Metaviz File Download
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizExchange {
        
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

        // Clean source board info (appending to current board)
        delete json.id;
        delete json.name;

        // Decode
        const [newNodes, newLinks] = metaviz.format.deserialize('text/metaviz+json', json, {offset, reindex: true, reparent: true, realign: true});

        // Save to history & databse
        metaviz.editor.history.clearFuture();
        metaviz.editor.history.store({
            action: 'add',
            nodes: newNodes.map(n => {
                return n.serialize('transform');
            }),
            links: newLinks.map(l => {
                return l.serialize();
            })
        });

        // Redraw
        metaviz.editor.update();

        // Launch start for nodes
        for (const node of newNodes) node.start();

        // Check empty board/folder
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
     * Download file
     *
     * @param args.data: raw blob data
     * @param args.path: path to file
     * @param atgs.name: file name
     */

    download(args) {
        const { data = null, path = null, name = null } = args;

        // Create link element
        const a = document.createElement('a');

        // File from disk
        if (path) {
            a.href = path;
        }

        // Raw blob
        else if (data) {
            const blob = new Blob([data]);
            a.href = URL.createObjectURL(blob);
        }

        // File name
        if (name) a.download = name;

        // Start download hack
        a.click();
    }

}
