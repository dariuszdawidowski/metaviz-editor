/**
 * Metaviz
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */


// Global
const global = {

    // Global registry for Nodes, Links and Themes
    registry: {

        /*
         * Nodes registry:
         * {
         *     'MetavizNodeX':
         *     {
         *         proto: MetavizNodeX, // class prototype
         *         type: 'MetavizNodeX', // class name as a string
         *         name: 'X', // display name (optional - fallback to type.humanize())
         *         slug: 'x', // slug (optional - fallback to name.slug())
         *         menu: '', // menu name (optional - root in null) TODO
         *     },
         *     ...
         * }
         */
        nodes: {},

        /*
         * Links registry:
         * {
         *     'MetavizLinkX':
         *     {
         *         proto: MetavizLinkX, // class prototype
         *         type: 'MetavizLinkX', // class name as a string
         *         name: 'X', // display name (optional - fallback to type.humanize())
         *         slug: 'x', // slug (optional - fallback to name.slug())
         *         menu: '', // menu name (optional - root in null) TODO
         *     },
         *     ...
         * }
         */
        links: {},

        /*
         * Themes registry:
         * {
         *     'MetavizThemeX':
         *     {
         *         type: 'MetavizTheme',
         *         name: 'X', // name
         *         vars: {'--var-name': value, ...}
         *     },
         *     ...
         * }
         */
        themes: {},

        /**
         * Register node type {args}
         * @param node: node class prototype
         * @param link: node class prototype
         * @param theme: node class prototype
         * @param vars: variables for theme
         * @param proto: class prototype guess (starts with 'MetavizNode' | 'MetavizLink' | 'MetavizTheme')
         * @param name: display name
         * @param slug: slug identifier
         * @param menu: sub-menu name to attach to
         * @param icon: icon to display on menu
         */

        add: function(args) {

            // Node
            if ('node' in args) {

                // Prototype
                const protoName = args.node.prototype.constructor.name;
                args.type = protoName;
                args.proto = args.node;

                // Generate display name if not given
                if (!('name' in args)) args.name = args.type.humanize();

                // Slug
                if (!('slug' in args)) args.slug = args.name.slug();

                // Node
                this.nodes[protoName] = args;
            }

            // Link
            else if ('link' in args) {

                // Prototype
                const protoName = args.link.prototype.constructor.name;
                args.type = protoName;
                args.proto = args.link;

                // Generate display name if not given
                if (!('name' in args)) args.name = args.type.humanize();

                // Slug
                if (!('slug' in args)) args.slug = args.name.slug();

                // Link
                this.links[protoName] = args;
            }

            // Guess Node or Link
            else if ('proto' in args) {
                // Type
                const protoName = args.proto.prototype.constructor.name;
                args.type = protoName;

                // Generate display name if not given
                if (!('name' in args)) args.name = args.type.humanize();

                // Slug
                if (!('slug' in args)) args.slug = args.name.slug();

                // Node
                if (protoName.startsWith('MetavizNode')) {
                    this.nodes[protoName] = args;
                }

                // Link
                else if (protoName.startsWith('MetavizLink')) {
                    this.links[protoName] = args;
                }

            }

            // Theme
            else if (('theme' in args) && ('vars' in args)) {
                this.themes[args.name] = args;
            }
        },

        /**
         * Get dictionary of nodes sorted by group
         * @param type: string 'nodes'
         */

        get: function(type) {

            // Nodes
            if (type == 'nodes') {
                const nodes = {'Default': []};
                for (const [className, args] of Object.entries(this.nodes)) {
                    // Group
                    const group = ('menu' in args) ? args.menu : 'Default';
                    // Create grop if not exist
                    if (!(group in nodes)) nodes[group] = [];
                    // Push node info
                    nodes[group].push(args);
                }
                return nodes;
            }

            return null;
        }

    },

    // Global cache system
    cache: {}

};


// Metaviz global structure

class Metaviz {

    /**
     * Constructor
     */

    constructor() {

        // App version
        this.version = '0.9.18';

        // Build version
        this.build = null;

        // Agent Information about client properties
        this.agent = {

            // Name: 'saas' | 'metaboard' | 'comix' | etc.
            name: null,

            // Clent host: 'browser' (loaded in browser) | 'app' (launched app)
            client: null,

            // Server host: 'php' (single user basic php server) | 'django' (sync main server) | 'wordpress' (sync php-wp plugin)
            server: null,

            // Data: 'local' (stored on disk) | 'remote' (send via network)
            data: null,

            // DB: 'file' (stored in file) | 'sql' (stored in relational database)
            db: null,

            // Ext: extension of the file stored on disk
            ext: null,

            // Static protocol: 'http' | 'https' | 'file'
            protocol: null

        };

        // Main div for everything
        this.container = {

            // ID name string (without #)
            id: null,

            // DOM element
            element: null,

            // Spinner ID name string (without #)
            spinnerID: null,

            // Return offsets of container {x, y, width, height}
            getOffset: function() {
                return this.element.getBoundingClientRect();
            },

            // Make fullscreen
            expand: function() {
                this.element.style.position = 'absolute';
                this.element.style.width = '100%';
                this.element.style.minWidth = '100%';
                this.element.style.maxWidth = '100%';
                this.element.style.height = '100%';
                this.element.style.minHeight = '100%';
                this.element.style.maxHeight = '100%';
            },

            // Back to initial size
            compress: function() {
                this.element.style.position = 'relative';
                this.element.style.removeProperty('width');
                this.element.style.removeProperty('min-width');
                this.element.style.removeProperty('max-width');
                this.element.style.removeProperty('height');
                this.element.style.removeProperty('min-height');
                this.element.style.removeProperty('max-height');
            },

            // Is smaller than window
            isSmaller: function() {
                const offset = this.getOffset();
                if (offset.left > 0 || offset.top > 0 || window.innerWidth > offset.width || window.innerHeight > offset.height) return true;
                return false;
            }

        };

        // URLs info
        this.url = {

            // Update info url
            update: null

        };

        // Pseudo user
        this.user = {

            // User pseudo ID
            id: null,

        };

        // Global instances of main components
        this.config = null;
        this.format = null;
        this.storage = {};
        this.render = null;
        this.events = null;
        this.exchange = null;
        this.editor = null;
        this.state = null;
        this.unittest = null;

        // Sysinfo
        this.system = {

            // os: 'macos' | 'windows' | 'linux' | 'ios' | 'android' | null (unknown)
            os: {
                name: null,
                version: null
            },

            // browser: 'safari' | 'firefox' | 'chrome' | 'edge' | 'opera' | 'qtwebengine' | others | null (unknown)
            browser: {
                name: null,
                version: null,
                major: null,
                mobile: null,
                zoomFactor: null,
                pinchFactor: null
            },

            // Language detection
            language: {

                code: null,
                iso: null,

                /**
                 * Get language symbol (if not supported then returns standard fallback)
                 * @param type: null or 'code'=single code e.g. 'pl', 'iso'=ISO code e.g. 'pl-PL'
                 * @param list: list of accepted languages if not then returns fallback
                 */
                get: function(type = null, list = null) {
                    let symbol = (type === null || type == 'code') ? this.code : this.iso;
                    if (list) {
                        if (list.includes(symbol)) return symbol;
                        else return (type === null || type == 'code') ? 'en' : 'en-US';
                    }
                    return symbol;
                },

            },

            // Browser features
            features: {
                nativeFileSystemApi: false,
                clipboardApi: false
            },

            // Passed browser features compability
            compatible: false,

            // Display info
            info: function() {
                return this;
            }
        };

        // Local info
        this.agent.name = document.querySelector('meta[name="metaviz:agent:name"]')?.content;
        this.agent.client = document.querySelector('meta[name="metaviz:agent:client"]')?.content;
        this.agent.server = window.location.hostname;
        this.agent.data = document.querySelector('meta[name="metaviz:agent:data"]')?.content;
        this.agent.db = document.querySelector('meta[name="metaviz:agent:db"]')?.content;
        this.agent.ext = document.querySelector('meta[name="metaviz:agent:ext"]')?.content;
        this.agent.protocol = window.location.origin.split('://')[0];

        // URL info
        this.url.update = document.querySelector('meta[name="metaviz:url:update"]')?.content;

        // Language
        this.system.language.iso = window.navigator.language;
        this.system.language.code = window.navigator.language.split('-')[0];

        // Pseudo-user session for local standalone
        if (this.agent.client == 'browser' && this.agent.data == 'local') {
            this.user.id = localStorage.getItem('metaviz.user.pseudoID');
            if (!this.user.id) {
                this.user.id = crypto.randomUUID();
                localStorage.setItem('metaviz.user.pseudoID', this.user.id);
            }
        }

    }

    /**
     * Init everything
     * @param containerID: string with id of main container
     * @param spinnerID: string with id of logo (optional)
     */

    init(containerID, spinnerID = null) {

        // Container
        this.container.id = containerID;
        this.container.element = document.getElementById(containerID);
        this.container.spinnerID = spinnerID;

        // Contructors (order matters)
        this.config = new MetavizConfig();
        this.state = new MetavizViewerState();
        this.format = new MetavizFormat();
        this.format.register('text/mvstack+xml', {
            in: new MetavizInStack(),
            out: new MetavizOutStack()
        });
        this.format.register('text/metaviz+json', {
            in: new MetavizInJSON(),
            out: new MetavizOutJSON()
        });
        this.format.register('image/svg+xml', {
            in: null,
            out: new MetavizOutSVG()
        });
        this.storage = {
            filesystem: new MetavizFilesystem(),
            db: new MetavizIndexedDB()
        };
        this.render = new MetavizEditorRender({
            container: this.container.element,
            nodes: new MetavizNodesManager(),
            links: new MetavizLinksManager()
        });
        this.ajax = {
            in: new MetavizInAjax()
        };
        this.exchange = new MetavizExchange();
        this.events = new MetavizEventManager();
        this.editor = new MetavizEditorBrowser();
    }

    /**
     * Start everything
     * @param boardID: optional string with uuid of the board to fetch (also can be passed in url get param)
     */

    start(boardID = null) {

        // Start editor
        this.editor.start();

        // For browser
        if (this.agent.client == 'browser') {

            // Clean tracking params
            if (this.agent.server != '') {
                const getParams = window.location.search.uriToDict();
                if ('utm_source' in getParams) delete getParams['utm_source'];
                if ('utm_medium' in getParams) delete getParams['utm_medium'];
                if ('utm_content' in getParams) delete getParams['utm_content'];
                window.history.replaceState(null, null, Object.keys(getParams).length ? `?${dictToUri(getParams)}` : '');
            }

            // Theme
            const theme = localStorage.getItem('metaviz.config.theme') || 'Iron';
            this.container.element.classList.add('theme-' + theme.toLowerCase());
            for (const [key, value] of Object.entries(global.registry.themes[theme].vars)) {
                document.documentElement.style.setProperty(key, value);
            }

            // Cookie info
            if (this.agent.server != '') {
                this.editor.showCookieBubble({
                    text: `${_('Site does NOT use cookies')} <a href='https://www.metaviz.net/privacy-policy/webapp/' target='_blank'>${_('Click here to read the Privacy Policy')}.</a> <input type="checkbox" onchange="metaviz.editor.hideCookieBubbleForever(this)"> ${_('Dont show again')}`,
                    position: 'bottom-center'
                });
            }

            // Check for updates
            if (this.url.update != '' && metaviz.config.updates.check) {
                metaviz.ajax.in.recv({server: this.url.update + '/check/', params: {version: metaviz.version, build: metaviz.build}, cors: true}).then(
                    response => {
                        if (response != 'error') {
                            const json = JSON.parse(response);
                            if ('update' in json && 'url' in json && json.update == true) {
                                if (confirm(_('Update available'))) window.open(json.url);
                            }
                        }
                    },
                    error => {
                    }
                );
            }

            // IndexedDB for file handlers
            if (this.agent.db != '') {
                this.storage.db.open({tables: ['boards'], version: 5})
                .then(status => {

                    // Clear current diagram
                    this.editor.new();

                    // Ready
                    this.editor.idle();

                    // Dispatch final event
                    this.events.call('on:loaded');

                })
                .catch(error => {
                    logging.error('IDB: Initialization error');
                });
            }

            // Start
            else {
                // Clear current diagram
                this.editor.new();

                // Ready
                this.editor.idle();

                // Dispatch final event
                this.events.call('on:loaded');
            }

        }

    } // start

    compatibilityTest() {

        // Browser capabilities
        if (window.navigator) {

            /**
             * Operating system
             */

            const clientStrings = [
                {os:['windows', '10'], reg:/(Windows 10.0|Windows NT 10.0)/}, // Also 11 is detected as 10
                {os:['windows', '8.1'], reg:/(Windows 8.1|Windows NT 6.3)/},
                {os:['windows', '8'], reg:/(Windows 8|Windows NT 6.2)/},
                {os:['windows', '7'], reg:/(Windows 7|Windows NT 6.1)/},
                {os:['windows', 'Vista'], reg:/Windows NT 6.0/},
                {os:['windows', 'Server 2003'], reg:/Windows NT 5.2/},
                {os:['windows', 'XP'], reg:/(Windows NT 5.1|Windows XP)/},
                {os:['windows', '2000'], reg:/(Windows NT 5.0|Windows 2000)/},
                {os:['windows', 'ME'], reg:/(Win 9x 4.90|Windows ME)/},
                {os:['windows', '98'], reg:/(Windows 98|Win98)/},
                {os:['windows', '95'], reg:/(Windows 95|Win95|Windows_95)/},
                {os:['windows', 'NT 4.0'], reg:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {os:['windows', 'CE'], reg:/Windows CE/},
                {os:['windows', '3.11'], reg:/Win16/},
                {os:['windows', null], reg:/Windows/},
                {os:['android', null], reg:/Android/},
                {os:['openbsd', null], reg:/OpenBSD/},
                {os:['sunos', null], reg:/SunOS/},
                {os:['chromeos', null], reg:/CrOS/},
                {os:['gnulinux', null], reg:/(Linux|X11(?!.*CrOS))/},
                {os:['ios', null], reg:/(iPhone|iPad|iPod)/},
                {os:['macos', null], reg:/Mac OS X/},
                {os:['macos', null], reg:/(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                {os:['qnx', null], reg:/QNX/},
                {os:['unix', null], reg:/UNIX/},
                {os:['beos', null], reg:/BeOS/},
                {os:['os/2', null], reg:/OS\/2/},
                {os:['bot', null], reg:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];

            for (const clientString of clientStrings) {
                if (clientString.reg.test(navigator.userAgent)) {
                    this.system.os.name = clientString.os[0];
                    this.system.os.version = clientString.os[1];
                    break;
                }
            }

            // OS version

            if (this.system.os.name == 'android') {
                this.system.os.version = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(navigator.userAgent)[1];
            }
            else if (this.system.os.name == 'ios') {
                const osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(navigator.appVersion);
                this.system.os.version = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            }


            /**
             * Python standalone application
             */

            if (/QtWebEngine/i.test(window.navigator.userAgent)) {
                this.system.browser.name = 'qtwebengine';
                const version = /QtWebEngine\/(\d[\d.]+)/.exec(window.navigator.appVersion);
                if (version && version.length == 2) {
                    this.system.browser.version = version[1];
                    this.system.browser.major = parseInt(version[1].split('.')[0]);
                }
            }

            /**
             * Browser
             */

            else {

                let nameOffset, verOffset, ix;

                // Opera
                if ((verOffset = navigator.userAgent.indexOf('Opera')) != -1) {
                    this.system.browser.name = 'opera';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 6);
                    if ((verOffset = navigator.userAgent.indexOf('Version')) != -1) {
                        this.system.browser.version = navigator.userAgent.substring(verOffset + 8);
                    }
                }
                // Opera Next
                if ((verOffset = navigator.userAgent.indexOf('OPR')) != -1) {
                    this.system.browser.name = 'opera';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 4);
                }
                // Legacy Edge (Pre-Chromium)
                else if ((verOffset = navigator.userAgent.indexOf('Edge')) != -1) {
                    this.system.browser.name = 'legacyedge';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 5);
                } 
                // Edge (Chromium)
                else if ((verOffset = navigator.userAgent.indexOf('Edg')) != -1) {
                    this.system.browser.name = 'edge';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 4);
                }
                // MSIE
                else if ((verOffset = navigator.userAgent.indexOf('MSIE')) != -1) {
                    this.system.browser.name = 'ie';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 5);
                }
                // Chrome
                else if ((verOffset = navigator.userAgent.indexOf('Chrome')) != -1) {
                    this.system.browser.name = 'chrome';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 7);
                }
                // Safari
                else if ((verOffset = navigator.userAgent.indexOf('Safari')) != -1) {
                    this.system.browser.name = 'safari';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 7);
                    if ((verOffset = navigator.userAgent.indexOf('Version')) != -1) {
                        this.system.browser.version = navigator.userAgent.substring(verOffset + 8);
                    }
                }
                // Firefox
                else if ((verOffset = navigator.userAgent.indexOf('Firefox')) != -1) {
                    this.system.browser.name = 'firefox';
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 8);
                }
                // MSIE 11+
                else if (navigator.userAgent.indexOf('Trident/') != -1) {
                    this.system.browser.name = 'ie';
                    this.system.browser.version = navigator.userAgent.substring(navigator.userAgent.indexOf('rv:') + 3);
                }
                // Other browsers
                else if ((nameOffset = navigator.userAgent.lastIndexOf(' ') + 1) < (verOffset = navigator.userAgent.lastIndexOf('/'))) {
                    this.system.browser.name = navigator.userAgent.substring(nameOffset, verOffset);
                    this.system.browser.version = navigator.userAgent.substring(verOffset + 1);
                    if (this.system.browser.name.toLowerCase() == this.system.browser.name.toUpperCase()) {
                        this.system.browser.name = navigator.appName;
                    }
                }

                // Trim the version string
                if ((ix = this.system.browser.version.indexOf(';')) != -1) this.system.browser.version = this.system.browser.version.substring(0, ix);
                if ((ix = this.system.browser.version.indexOf(' ')) != -1) this.system.browser.version = this.system.browser.version.substring(0, ix);
                if ((ix = this.system.browser.version.indexOf(')')) != -1) this.system.browser.version = this.system.browser.version.substring(0, ix);

                this.system.browser.major = parseInt('' + this.system.browser.version, 10);
                if (isNaN(this.system.browser.major)) {
                    this.system.browser.version = '' + parseFloat(navigator.appVersion);
                    this.system.browser.major = parseInt(navigator.appVersion, 10);
                }

                // mobile version
                this.system.browser.mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion);
            }

            /**
             * Factors
             */

            switch(this.system.browser.name) {

                // Safari
                case 'safari':
                    this.system.browser.zoomFactor = 500;
                    this.system.browser.pinchFactor = 100;
                    break;

                // Chrome
                case 'chrome':
                    this.system.browser.zoomFactor = 1000;
                    this.system.browser.pinchFactor = 100;
                    break;

                // Firefox
                case 'firefox':
                    this.system.browser.zoomFactor = 1000;
                    this.system.browser.pinchFactor = 100;
                    break;

                // Edge
                case 'edge':
                    this.system.browser.zoomFactor = 1000;
                    this.system.browser.pinchFactor = 100;
                    break;

                // Opera
                case 'opera':
                    this.system.browser.zoomFactor = 1000;
                    this.system.browser.pinchFactor = 120;
                    break;

                // Python Application
                case 'qtwebengine':
                    this.system.browser.zoomFactor = 500;
                    this.system.browser.pinchFactor = 100;
                    break;

            }

            /**
             * Browser minimum version
             */

            switch(this.system.browser.name) {

                // Safari
                case 'safari':
                    if (this.system.browser.major < 16) return false;
                    break;

                // Chrome
                case 'chrome':
                    if (this.system.browser.major < 106) return false;
                    break;

                // Firefox
                case 'firefox':
                    if (this.system.browser.major < 110) return false;
                    break;

                // Edge
                case 'edge':
                    if (this.system.browser.major < 106) return false;
                    break;

                // Opera
                case 'opera':
                    if (this.system.browser.major < 94) return false;
                    break;

            }

            /**
             * Optional features support
             */

            // https://caniuse.com/#feat=native-filesystem-api
            this.system.features.nativeFileSystemApi = ('showOpenFilePicker' in window);

            // https://caniuse.com/async-clipboard (full read/write support) Note: local file supports api but always ask about permission which is unacceptable
            this.system.features.clipboardApi = (this.agent.protocol != 'file') ? ('readText' in navigator.clipboard) && ('read' in navigator.clipboard) : false;

            /**
             * Mandatory features support
             */

            const requirements = [
                (typeof BigInt !== 'undefined'), // Generic way to check ECMAScript 2020 (ES11)
                Element.prototype.closest,       // https://caniuse.com/#feat=element-closest
            ];
            if (this.system.browser.name == 'edge') requirements.push(
                window.PointerEvent,             // https://caniuse.com/#feat=mdn-api_pointerevent
            );
            this.system.compatible = true;
            requirements.forEach((feature) => {
                if (!feature) this.system.compatible = false;
            });

            // Return true if browser is compatible
            return this.system.compatible;
        }

        return false;
    } // compatibilityTest

}
