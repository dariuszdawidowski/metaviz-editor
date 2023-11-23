/***************************************************************************************************
 *         ________                                                                                *
 *       /\ -- . - |          Metaviz Clipboard functionality                                      *
 *       `| -- - - |          Legacy copy/paste system for non-AsyncClipboard API                  *
 *        | --=- --|          https://caniuse.com/async-clipboard                                  *
 *        | _______|_         MIT License                                                          *
 *        |/________/         (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/


class MetavizClipboardLegacy {

    constructor(container) {
        // Pastebin (proxy dom element for system paste)
        this.pastebin = document.createElement('textarea');
        this.pastebin.style.display = 'none';
        this.pastebin.style.position = 'absolute';
        this.pastebin.style.left = '-1000px';
        container.appendChild(this.pastebin);
    }

    /**
     * Pastebin container: open
     */

    open() {
        this.pastebin.style.display = 'inline-block';
        this.pastebin.focus();        
    }

    /**
     * Pastebin container: close
     */

    close() {
        this.pastebin.style.display = 'none';
        this.pastebin.blur();
    }

    /**
     * Set content
     */

    set(data, miniature = null) {
        if (data) {
            this.open();
            this.pastebin.value = data;
            this.pastebin.select();
            this.pastebin.setSelectionRange(0, data.length);
            document.execCommand('copy');
            this.close();
        }
    }

    /**
     * Get content
     */

    get() {
        return this.pastebin.value;
    }

    /**
     * Reset state
     */

    clear() {
        this.pastebin.value = '';
        this.close();
    }

    /**
     * Length of data
     */

    count() {
        return this.pastebin.value.length;
    }

}
