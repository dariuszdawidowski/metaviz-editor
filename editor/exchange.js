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
