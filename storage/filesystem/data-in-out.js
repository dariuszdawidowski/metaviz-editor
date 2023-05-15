/**
 * Metaviz Filesystem
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

/*
     ______________
    |o | ______ |  |
    |  | ______ |  |
    |  | ______ |  |
    |  |________|  |
    |   ________   |
    |  | [ ]    |  |
    \__|_[_]____|__|

*/

class MetavizFilesystem {

    /**
     * Open file using browser's Native File System API
     */

    async openFile(id) {
        if (metaviz.system.features.nativeFileSystemApi) {

            // Get file handle
            const data = await metaviz.storage.db.tables['boards'].get({ 'id': id });
            if (data.handle) {
                metaviz.editor.file.handle = data.handle;

                // Verify permissions
                let permission = true;
                if (await data.handle.queryPermission({'mode': 'readwrite'}) !== 'granted') {
                    permission = false;
                    if (await data.handle.requestPermission({'mode': 'readwrite'}) === 'granted') {
                        permission = true;
                    }
                }

                // Read file and return the content
                if (permission) {

                    // Read file
                    const f = await data.handle.getFile();

                    // Parse json
                    let json = null;
                    try {
                        json = JSON.parse(await f.text());
                    }
                    catch(error) {
                        alert("Error: Can't recognize Metaviz file.");
                    }

                    // Decode
                    if (json) {
                        if (metaviz.format.json.in.deserialize(json)) {
                            metaviz.render.layers.set('Base Layer');
                            metaviz.render.layers.current.update();
                        }
                        else {
                            alert("Error: Unknown version or not a Metaviz file.");
                        }
                    }

                    // Finalizing event broadcast
                    metaviz.events.call('on:loaded');
                }
            }
        }
        else {
            alert('Native File System API not supported!')
        }
    }

}
