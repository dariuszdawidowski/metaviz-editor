/**
 * Metaviz Config
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizConfig {

    constructor() {

        // Pointer options
        this.pointer = {

            /**
             * Click on desktop
             * 'pan' | 'box'
             * metaviz.config.pointer.desktop
             */

            desktop: {
                value: '',
                set: function(val) {
                    this.value = val;
                },
                get: function() {
                    return this.value;
                }
            },

        };

        // Touchpad options
        this.touchpad = {

            /**
             * Swipe (two-fingers drag)
             * 'pan' | 'zoom'
             * metaviz.config.touchpad.swipe
             */

            swipe: {
                value: '',
                set: function(val) {
                    this.value = val;
                },
                get: function() {
                    return this.value;
                }
            },

        };

        // Theme
        this.theme = {
            value: '',
            set: function(val) {
                this.value = val;
            },
            get: function() {
                return this.value;
            }
        };

        // Toolbars options 
        this.toolbars = {
            /**
             * Get saved toolbars from localStorage
             * Json format:
             * {
             *   'top': {
             *     autohide: false,
             *     size: 40,
             *     toolbars: [{name: 'system', row: 0, spotIndex: 0, locked: true}, ...]
             *   },
             *   'right': {...},
             *   'bottom': {...},
             *   'left': {...}
             * }
             */

            default: function() {
                return {
                    'top': {'autohide': false, 'size': 40, 'toolbars': []},
                    'right': {'autohide': false, 'size': 200, 'toolbars': []},
                    'bottom': {'autohide': false, 'size': 40, 'toolbars': []},
                    'left': {'autohide': false, 'size': 200, 'toolbars': []},
                    toolbarsCount: function() {
                        return this.top.toolbars.length + this.right.toolbars.length + this.bottom.toolbars.length + this.left.toolbars.length;
                    }
                };
            },

            load: function() {
                const storage = localStorage.getItem('metaviz.spots');
                if (storage) {
                    let spots = JSON.parse(storage);
                    spots.toolbarsCount = function() {
                        return this.top.toolbars.length + this.right.toolbars.length + this.bottom.toolbars.length + this.left.toolbars.length;
                    }
                    return spots;
                }
                return this.default();
            },

            /**
             * Add toolbar and save toolbars in localStorage
             */

            save: function(name, side, row, spotIndex, locked=false, size=null) {
                let spots = this.load();
                const nr = this.find(name, side, row, spotIndex);
                if (size != null) spots[side].size = size;
                if (nr != -1) {
                    spots[side].toolbars[nr] = {name, row, spotIndex, locked};
                }
                else {
                    spots[side].toolbars.push({name, row, spotIndex, locked});
                }
                localStorage.setItem('metaviz.spots', JSON.stringify(spots));
            },

            /**
             * Auto hide on/off
             * side: spot name
             * value: true/false
             */

            autoHide: function(side, value) {
                let spots = this.load();
                spots[side].autohide = value;
                localStorage.setItem('metaviz.spots', JSON.stringify(spots));
            },

            /**
             * Remove toolbar and save toolbars in localStorage
             */

            remove: function(name, side, row, spotIndex) {
                let spots = this.load();
                for (const toolbar of spots[side].toolbars) {
                    if (toolbar.name == name && toolbar.row == row && toolbar.spotIndex == spotIndex) {
                        //spots[side].toolbars.remove(toolbar);
                        arrayRemove(spots[side].toolbars, toolbar);
                    }
                }
                localStorage.setItem('metaviz.spots', JSON.stringify(spots));
            },

            /**
             * Find toolbar
             */

            find: function(name, side, row, spotIndex) {
                const spots = this.load();
                for (let nr = 0; nr < spots[side].toolbars.length; nr ++) {
                    if (spots[side].toolbars[nr].name == name &&
                        spots[side].toolbars[nr].row == row &&
                        spots[side].toolbars[nr].spotIndex == spotIndex) {
                        return nr;
                    }
                }
                return -1;
            },

        };

        // Notifications
        this.notifications = {
            value: '',
            set: function(val) {
                this.value = val;
            },
            get: function() {
                return this.value;
            }
        };

        // Helpers
        this.snap = {

            /**
             * Snap to grid
             * metaviz.config.snap.grid.enabled
             */
            grid: {
                enabled: true
            },

        };

        this.load();
    }

    load() {
        this.pointer.desktop.set(localStorage.getItem('metaviz.config.pointer.desktop') || 'pan');
        this.touchpad.swipe.set(localStorage.getItem('metaviz.config.touchpad.swipe') || 'zoom');
        this.theme.set(localStorage.getItem('metaviz.config.theme') || 'Iron');
        this.notifications.set(localStorage.getItem('metaviz.config.notifications') || 'minimal');
        this.snap.grid.enabled = (localStorage.getItem('metaviz.config.snap.grid.enabled') == 'false') ? false : true;
    }

    save() {
        localStorage.setItem('metaviz.config.pointer.desktop', this.pointer.desktop.get());
        localStorage.setItem('metaviz.config.touchpad.swipe', this.touchpad.swipe.get());
        localStorage.setItem('metaviz.config.theme', this.theme.get());
        localStorage.setItem('metaviz.config.notifications', this.notifications.get());
        localStorage.setItem('metaviz.config.snap.grid.enabled', this.snap.grid.enabled);
    }

}
