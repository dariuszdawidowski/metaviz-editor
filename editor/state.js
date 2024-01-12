/***************************************************************************************************
 *                                                                                                 *
 *  (\(\   o ( (  o  (\__/)   Metaviz Viewer State                                                 *
 *  (-.-) /   )))  \ ('.'=)   URL tools and manager.                                               *
 * o(")(")  (()())  (")(")_)  MIT License                                                          *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^  (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/


class MetavizViewerState {

    constructor() {
        // Browser history events
        this.initUrlStateEvents();

        this.url = {

            /**
             * Check current URL state and take proper action
             */

            state: () => {
                const params = window.location.search.uriToDict();
                console.log('params', params);

                // Local: Load ?board=... or clear URL GET params
                if (metaviz.agent.client == 'browser' && metaviz.agent.db == 'file') {
                    // Open file
                    if ('board' in params) {
                        const divbg = document.createElement('div');
                        divbg.classList.add('metaviz-load-bg');
                        const logo = document.createElement('img');
                        logo.setAttribute('src', '//cdn1.metaviz.net/metaviz-mark-mono-light.svg');
                        logo.classList.add('metaviz-load-logo');
                        divbg.appendChild(logo);
                        const button = document.createElement('button');
                        button.classList.add('metaviz-load-button');
                        button.innerHTML = '<i class="fas fa-box-open"></i> Click to open diagram from file';
                        divbg.appendChild(button);
                        metaviz.render.container.appendChild(divbg);
                        button.addEventListener('click', (event) => {
                            // Hide loading info
                            divbg.remove();
                            // Theme
                            for (const [key, value] of Object.entries(global.registry.themes[localStorage.getItem('metaviz.config.theme') || 'Iron'])) {
                                document.documentElement.style.setProperty(key, value);
                            }
                            // Lock interaction
                            metaviz.editor.interaction.lock();
                            // Open file
                            // TODO: await
                            metaviz.storage.filesystem.openFile(decodeURIComponent(params['diagram']));
                            // Unlock interaction
                            metaviz.editor.interaction.unlock();
                        });
                    }
                    // Run Unit Tests
                    else if ('unittest' in params && typeof MetavizUnitTest === 'function') metaviz.unittest = new MetavizUnitTest();
                    // Clear
                    else this.folder.clear();
                }
            },

            /**
             * URL GET parameter
             */

            param: (name) => {
                return {

                    // Store name
                    name: name,

                    // Set param (return string with all params to use)
                    set: function(value) {
                        let search = [];
                        // Re-add old params and change new
                        for (let [paramName, paramValue] of Object.entries(window.location.search.uriToDict())) {
                            if (paramName == name) paramValue = value;
                            if (paramValue != null) search.push(paramName + '=' + paramValue);
                        }
                        // Add new it doesn't exist
                        if (!(name in window.location.search.uriToDict()) && value != null) search.push(name + '=' + value);
                        // Return new string
                        return '?' + search.join('&');
                    },

                    // Returns param
                    get: function() {
                        const params = window.location.search.uriToDict();
                        if (metaviz.editor.name in params) return decodeURIComponent(params[metaviz.editor.name]);
                        return null;
                    }
                };
            },

        };

        this.folder = {

            /**
             * Push into history
             * folders: <uuid> or array [<uuid>, ...]
             */

            set: (folders) => {
                // Array
                if (folders != null && folders.constructor.name == 'Array') {
                    for (const folderId of folders) {
                        window.history.pushState({'folder': folderId}, '', metaviz.state.url.param('folder').set(folderId));
                    }
                    metaviz.events.call('update:historystate', {'folder': folders[folders.length - 1]});
                }
                // Single or null (root)
                else {
                    window.history.pushState({'folder': folders}, '', metaviz.state.url.param('folder').set(folders));
                    metaviz.events.call('update:historystate', {'folder': folders});
                }
            },

            /**
             * Clear history and url
             */

            clear: () => {
                window.history.replaceState({}, '', window.location.protocol + '//' + window.location.host + window.location.pathname);
            },

        };

    }

    /**
     * URL push/pop state events
     */

    initUrlStateEvents() {

        // Pop state <-
        window.addEventListener('popstate', (event) => {
            //Render
            metaviz.editor.render(event.state);
            // Centre
            metaviz.render.focusBounds();
            // Broadcast event
            metaviz.events.call('update:historystate', event.state);
        });

        // Push state ->
        window.addEventListener('pushstate', (event) => {
            // Render
            metaviz.editor.render(event.state);
            // Centre
            metaviz.render.focusBounds();
            // Broadcast event
            metaviz.events.call('update:historystate', event.state);
        });
    }

}
