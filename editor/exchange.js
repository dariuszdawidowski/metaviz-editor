/**
 * Metaviz Data Exchange and File Download
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizExchange {
        
    /**
     * Detect text type and create node
     */

    uploadText(text, offset = {x: 0, y: 0}) {
        const data = this.detectFormat(text);

        // Create Node Image from url
        if (data.mime == 'text/url') {
            this.processURL(data.url, offset);
        }

        // Create Node Note filled with text
        else if (data.mime == 'text/plain') {
            this.processText(data.text, offset);
        }

        // Create whole diagram from json
        else if (data.mime == 'text/metaviz+json') {
            this.processMetavizJSON(data.json, offset);
        }
    }

    /**
     * Detect File type and advance to processing
     * file: File object
     */

    uploadFile(file, offset = {x: 0, y: 0}) {

        // Metaviz JSON/XML file
        if (file.name.ext('mv')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Detecting format
                const data = this.detectFormat(event.target.result);

                // Create whole diagram from json
                if (data.mime == 'text/metaviz+json') {
                    // Preserve IDs
                    data.json.id = metaviz.editor.id;
                    if (data.json.version > 13) data.json.views[0].id = metaviz.render.layers.getBaseLayerId();
                    this.processMetavizJSON(data.json, offset);
                }

                // XML file should be loaded via menu
                else if (data.mime == 'text/mvstack+xml') {
                    alert('This file should be loaded via Menu -> File -> Open...');
                }
            }
            reader.readAsText(file);
        }

        // Regular file or image
        else {
            this.processBlob(file, offset);
        }
    }

    /**
     * URL text -> Node URL | Node Image
     */

    processURL(url, position) {

        // Image
        if (this.detectExtension(url) == '*/image') {
            const node = metaviz.render.nodes.add({
                id: crypto.randomUUID(),
                type: 'MetavizNodeImage',
                parent: metaviz.render.nodes.parent,
                x: position.x,
                y: position.y,
                params: {uri: url}
            });
            metaviz.editor.history.store({action: 'add', nodes: [{...node.serialize('transform'), ...position}]});
        }

        // Generic URL
        else {
            const node = metaviz.render.nodes.add({
                id: crypto.randomUUID(),
                type: 'MetavizNodeURL',
                parent: metaviz.render.nodes.parent,
                x: position.x,
                y: position.y,
                params: {url: url}
            });
            metaviz.editor.history.store({action: 'add', nodes: [{...node.serialize('transform'), ...position}]});
        }

        // Check empty board/folder
        metaviz.editor.checkEmpty();

    }

    /**
     * Plain text -> Create Node
     */

    processText(text, position) {

        // Create Sticky Note (generic text)
        const node = metaviz.render.nodes.add({
            id: crypto.randomUUID(),
            type: 'MetavizNodeText',
            parent: metaviz.render.nodes.parent,
            x: position.x,
            y: position.y,
            params: {
                'page_1': text
            }
        });
        metaviz.editor.history.store({
            action: 'add',
            nodes: [{...node.serialize('transform'), ...position}]
        });

        // Check empty board/folder
        metaviz.editor.checkEmpty();

    }

    /**
     * MetavizJSON -> Append diagram
     */

    processMetavizJSON(json, offset) {

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
     * Generic file upload
     * file: File object
     */

    processBlob(file, position) {

        // Exceed max file size
        if (file.size > global.cache['MetavizNodeFile']['maxSize']) {
            alert(`Exceed maximum file size! Limit is ${global.cache['MetavizNodeFile']['maxSize'] / 1024 / 1024} MB.`);
            return;
        }

        // Pick proper icon according to type
        const fileIcon = this.detectIcon(file);

        // Create Image Node
        if (this.detectImage(file.type)) {

            // New node
            const node = metaviz.render.nodes.add({
                id: crypto.randomUUID(),
                parent: metaviz.render.nodes.parent,
                type: 'MetavizNodeImage',
                name: 'Image',
                filename: file.name,
                icon: fileIcon,
                params: {style: 'minimal'},
                ...position
            });

            // Read bitmap and convert to Base64
            const reader = new FileReader();
            reader.onload = (event) => {

                // Rescale bitmap
                this.rescaleImage({
                    data: event.target.result,
                    width: global.cache['MetavizNodeImage']['minWidth']
                }).then((img) => {

                    // Set image data
                    node.params.set('resX', img.width);
                    node.params.set('resY', img.height);
                    node.params.set('uri', img.data);
                    node.setSize({width: img.width + 8, height: img.height + 8});

                    // Undo/Store
                    metaviz.editor.history.store({
                        action: 'add',
                        nodes: [{...node.serialize('transform'), ...position}]
                    });
                });

            }
            reader.readAsDataURL(file);
        }

        // Check empty board/folder
        metaviz.editor.checkEmpty();

    }

    /**
     * Guess mimetype based on structure
     */

    detectFormat(text) {

        // Detecting 'text/url'
        const patternURL = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // or ipv4 address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
            "i"
        );
        if (patternURL.test(text)) return {mime: 'text/url', url: text};

        // Detecting 'text/metaviz+json'
        let json = null;
        try { json = JSON.parse(text); } catch(error) {}
        if (json && json.format == 'MetavizJSON') return {mime: 'text/metaviz+json', json: json};

        // Detecting 'text/mvstack+xml'
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            const errors = xmlDoc.getElementsByTagName('parsererror');
            if (errors.length === 0 && xmlDoc.querySelector('mv > mimetype').textContent == 'text/mvstack+xml') return {mime: 'text/mvstack+xml', xml: xmlDoc};
        } catch (e) {
        }

        // Unreckognized format returns plain text
        return {mime: 'text/plain', text: text};
    }

    /**
     * Guess mimetype based on file extension
     */

    detectExtension(uri) {
        if (global.cache['MetavizNodeImage']['extensions'].includes(uri.ext())) return '*/image';
        return 'text/uri-list';
    }

    /**
     * Is on settings.IMAGE_FORMATS list
     */

    detectImage(mimetype) {
        return global.cache['MetavizNodeImage']['formats'].includes(mimetype);
    }

    /**
     * Guess the best icon based on mimetype
     */

    detectIcon(file) {
        let fileIcon = 'mdi-file';
        if (this.detectImage(file.type)) fileIcon = 'mdi-file-image';
        return fileIcon;
    }

    /**
     * Resize bitmap
     */

    rescaleImage(args = {}) {
        return new Promise((resolve, reject) => {
            let { data = null, width = null, height = null } = args;
            const img = new Image();
            img.src = data;
            img.addEventListener('load', (event) => {
                if (img.src.startsWith('data:image')) {

                    // Regex mimetype
                    const mimetype = img.src.substring(img.src.indexOf(':') + 1, img.src.indexOf(';'));

                    // Guess height
                    if (height === null) {
                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                        height = Math.round(width / aspectRatio);
                    }

                    // Resize (if big enough and not SVG)
                    if ((width < img.naturalWidth || height < img.naturalHeight) && mimetype != 'image/svg+xml') {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        ctx.drawImage(img, 0, 0, width, height);

                        const resizedImageData = canvas.toDataURL(mimetype);
                        resolve({width, height, data: resizedImageData});
                    }
                    // Don't resize (returns original)
                    else {
                        resolve({width: img.naturalWidth, height: img.naturalHeight, data: img.src});
                    }

                }
            });
        });
    }

    /**
     * Download file
     *
     * @param args.data: raw blob data
     * @param args.path: path to file
     * @param atgs.name: file name
     */

    downloadFile(args) {
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
