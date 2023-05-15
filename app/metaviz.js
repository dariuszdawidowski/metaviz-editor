/**
 * Metaviz
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */


// Global Registry
const registry = {

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
     * proto: class prototype
     * name: display name (optional)
     * slug: slug identifier (optional)
     * menu: sub-menu name to attach to (optional)
     */

    add: function(args) {
        // Node or Link
        if ('proto' in args) {
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
        else if (args.type.startsWith('MetavizTheme')) {
            this.themes[args.name] = args.vars;
        }
    }

};


// Metaviz global structure

class Metaviz {

    /**
     * Constructor
     */

    constructor() {

        // App version
        this.version = '0.9.6';

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
            db: null

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

        // Global instances of main components
        this.config = null;
        this.state = null;
        this.format = {};
        this.storage = {};
        this.render = null;
        this.events = null;
        this.editor = null;
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

            // Language e.g. 'pl-PL'
            language: null,

            // Browser features
            features: {
                nativeFileSystemApi: false
            },

            // Passed browser features compability
            compatible: false,

            // Display info
            info: function() {
                return this;
            }
        };

        // Local info
        if (window.location.protocol == 'file:') {
            this.agent.name = document.querySelector('meta[name="metaviz:agent:name"]')?.content;
            this.agent.client = 'browser';
            this.agent.data = 'local';
            this.agent.db = 'file';
        }

    }

    /**
     * Init everything
     * @param containerID: string with id of main container
     * @param spinnerID: string with id of logo
     */

    init(containerID, spinnerID) {

        // Container
        this.container.id = containerID;
        this.container.element = document.getElementById(containerID);
        this.container.spinnerID = spinnerID;

        // Contructors (order matters)
        this.config = new MetavizConfig();
        this.state = new MetavizViewerState();
        this.format = {
            json: {
                in: new MetavizInJSON(),
                out: new MetavizOutJSON()
            },
            html: {
                out: new MetavizOutHTML()
            },
            stack: {
                in: new MetavizInStack(),
                out: new MetavizOutStack()
            },
        };
        this.storage = {
            filesystem: new MetavizFilesystem(),
            db: new MetavizIndexedDB(),
            dbNames: ['files', 'boards', 'localOptions'],
            dbVersion: 4
        };
        this.render = new MetavizRender({
            container: this.container.element,
            nodes: new MetavizNodesManager(),
            links: new MetavizLinksManager()
        });
        this.events = new MetavizEventManager();
        this.editor = new MetavizEditorBrowser();

        // Load custom plugins
        if (this.agent.name == 'standalone') {
            const script = document.createElement('script');
            script.src = 'metaviz-plugins.js';
            script.onload = (event) => this.editor.menu.regenerateNodesList();
            document.body.appendChild(script);
        }

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

            // Theme
            for (const [key, value] of Object.entries(registry.themes[localStorage.getItem('metaviz.config.theme') || 'Iron'])) {
                document.documentElement.style.setProperty(key, value);
            }

            // Load config from browser
            this.storage.db.init(this.storage.dbNames, this.storage.dbVersion)
                .then(status => {

                    // Clear current diagram
                    this.editor.new();

                    // Ready
                    this.editor.idle();

                    // Dispatch final event
                    this.events.call('on:loaded');

                })
                .catch(error => {
                    logging.error('IDB: Initialization error (IndexedDB corrupted?)');
                });

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
             * Language
             */

            this.system.language = window.navigator.language.substring(0, 2);

            /**
             * Browser minumum version
             */

            switch(this.system.browser.name) {

                // Safari
                case 'safari':
                    if (this.system.browser.major < 15) return false;
                    break;

                // Chrome
                case 'chrome':
                    if (this.system.browser.major < 105) return false;
                    break;

                // Firefox
                case 'firefox':
                    if (this.system.browser.major < 104) return false;
                    break;

                // Edge
                case 'edge':
                    if (this.system.browser.major < 105) return false;
                    break;

                // Opera
                case 'opera':
                    if (this.system.browser.major < 90) return false;
                    break;

            }

            /**
             * Features support
             */

            // https://caniuse.com/#feat=native-filesystem-api
            this.system.features.nativeFileSystemApi = ('showOpenFilePicker' in window);

            const features = [
                Element.prototype.closest // https://caniuse.com/#feat=element-closest
            ];
            if (this.system.browser.name == 'edge') features.push(
                window.PointerEvent,      // https://caniuse.com/#feat=mdn-api_pointerevent
            );
            this.system.compatible = true;
            features.forEach((feature) => {
                if (!feature) this.system.compatible = false;
            });

            // Return true if browser is compatible
            return this.system.compatible;
        }

        return false;
    } // compatibilityTest

}
