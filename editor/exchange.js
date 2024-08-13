/***************************************************************************************************
 *                                                                                                 *
 *                      _     Metaviz Data Exchange and File Download                              *
 *      _      _       (o)-   Transfer data between system and browser.                            *
 *   __(o)< __(o)> \___||     MIT License                                                          *
 *   \___)  \___)  \_/__)     (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/

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
     * offset: position on board
     * node: upload to existing node <MetavizNode object>
     */

    uploadFile(file, offset = {x: 0, y: 0}, node = null) {

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
            this.processBlob(file, offset, node);
        }
    }

    /**
     * URL text -> Node URL | Node Image
     */

    processURL(url, position) {

        const mimetype = this.detectExtension(url);

        // Image
        if (mimetype == '*/image') {
            metaviz.editor.nodeAdd('MetavizNodeImage', position, {uri: url});
        }

        // Generic URL
        else {
            metaviz.editor.nodeAdd('MetavizNodeURL', position, {url: url});
        }

        // Check empty board/folder
        metaviz.editor.checkEmpty();

    }

    /**
     * Plain text -> Create Node
     */

    processText(text, position) {

        // Create Sticky Note (generic text)
        metaviz.editor.nodeAdd('MetavizNodeText', position, {page_1: text});

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
     * position: {x,y} on board
     * node: assign to exising node <MetavizNode object>
     */

    processBlob(file, position, node = null) {

        if (!this.detectImage(file.type)) {
            alert(`Not an image file! Accepted extensions: ${global.cache['MetavizNodeImage']['extensions'].join(', ')}`);
            return;
        }

        // Exceed max file size
        if (file.size > global.cache['MetavizNodeFile']['maxSize']) {
            alert(`Exceed maximum file size! Limit is ${global.cache['MetavizNodeFile']['maxSize'] / 1024 / 1024} MB.`);
            return;
        }

        // Pick proper icon according to type
        const fileIcon = this.detectIcon(file);

        // Accept given node?
        if (node) {
            if (node.constructor.name == 'MetavizNodeImage') {
                if (node.params.uri) node = null;
            }
            else {
                node = null;
            }
        }
        // Create new node
        if (!node) {
            node = metaviz.editor.nodeAdd('MetavizNodeImage', position, {style: 'minimal'});
        }

        // Read bitmap
        if (node) this.sendBlob(file, node);

    }

    /**
     * Read binary data and convert to Base64
     * file: File object
     * node: MetavizNode object
     * onLoad: callback (optional)
     */

    sendBlob(file, node, onLoad = null) {
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
                    nodes: [node.serialize('transform')]
                });

                // Callback
                if (onLoad) onLoad();
            });

        }
        reader.readAsDataURL(file);
    }

    /**
     * Guess mimetype based on structure
     */

    detectFormat(text) {

        // Detecting 'text/url'
        const patternURL = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
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
        const ext = uri.ext();
        if (global.cache['MetavizNodeImage']['extensions'].includes(ext)) return '*/image';
        else if (ext == 'pdf') return 'application/pdf';
        else if (ext == 'json') return 'application/json';
        else if (ext == 'xml') return 'text/xml';
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
     * @param args.data: download from raw blob buffer
     * @param args.path: or download from url path
     * @param args.name: file name
     */

    async downloadFile(args) {

        // Blob data
        let blob = null;

        // Download data from url path (allows to set file name)
        if ('path' in args) {
            const response = await fetch(args.path);
            blob = await response.blob();
        }
        // Or download from buffer
        else if ('data' in args) {
            blob = args.data;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'name' in args ? args.name : 'downloaded.file';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

}
