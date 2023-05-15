/**
 * JavaScript Logging v 0.2.0
 * Compatible with Python logging library
 * (c) 2022 Dariusz Dawidowski, All Rights Reserved.
 */

const logging = {

    CRITICAL: 50,
    ERROR: 40,
    WARNING: 30,
    INFO: 20,
    DEBUG: 10,
    NOTSET: 0,

    _config: {
        format: '%(asctime) %(message)',
        //filename: null,
        level: 0,
    },

    // args: {format: ..., filename: ..., level: ...}
    basicConfig: function(args) {
        // Format
        if ('format' in args) this._config.format = args.format;
        // Level
        if ('level' in args) this.setLevel(args.level);
    },

    // Set level to display this and above
    setLevel: function(level) {
        this._config.level = level;
    },

    // Returns current level
    getEffectiveLevel: function() {
        return this._config.level;
    },

    debug: function(msg, args=null) {
        if (this._config.level <= this.DEBUG) {
            if (args) console.debug(this._format(msg), args);
            else console.debug(this._format(msg));
        }
    },

    info: function(msg, args=null) {
        if (this._config.level <= this.INFO) {
            if (args) console.info(this._format(msg), args);
            else console.info(this._format(msg))
        }
    },

    warning: function(msg, args=null) {
        if (this._config.level <= this.WARNING) {
            if (args) console.warn(this._format(msg), args);
            else console.warn(this._format(msg));
        }
    },

    error: function(msg, args=null) {
        if (this._config.level <= this.ERROR) {
            if (args) console.error(this._format(msg), args);
            else console.error(this._format(msg));
        }
    },

    critical: function(msg, args=null) {
        if (this._config.level <= this.CRITICAL) {
            if (args) console.error(this._format(msg), args);
            else console.error(this._format(msg));
        }
    },

    log: function(level, msg, args=null) {
        if (this._config.level <= level) {
            if (args) console.log(this._format(msg), args);
            else console.log(this._format(msg));
        }
    },

    exception: function(msg, args=null) {
        if (this._config.level <= this.ERROR) {
            if (args) console.error(this._format(msg), args);
            else console.error(this._format(msg));
        }
    },

    _format: function(msg) {
        return this._config.format.replace('%(asctime)', (new Date()).toLocaleTimeString(metaviz.system.language)).replace('%(message)', msg);
    },

};
