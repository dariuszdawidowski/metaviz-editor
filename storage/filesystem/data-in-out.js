/***************************************************************************************************
 *        __________                                                                               *
 *       |o| ==== |o|         Metaviz Filesystem                                                   *
 *       | |______| |         Interface for Native Filesystem API.                                 *
 *       |  ______  |         MIT License                                                          *
 *       | |[]    | |         (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 *       \_|[]____|_|                                                                              *
 **************************************************************************************************/

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
                        alert(_('Not mv file'));
                    }

                    // Decode
                    if (json) {
                        if (metaviz.format.deserialize('text/metaviz+json', json)) {
                            metaviz.render.layers.set('Base Layer');
                            metaviz.render.layers.current.update();
                        }
                        else {
                            alert(_('Not mv file'));
                        }
                    }

                    // Finalizing event broadcast
                    metaviz.events.call('on:loaded');
                }
            }
        }
        else {
            alert(_('Save file not supported'))
        }
    }

}
