/**
 * Metaviz Editor Keyboard
 * (c) 2009-2022 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizEditorKeyboard {

    constructor(editor) {
        // Editor
        this.editor = editor;

        // Keys state machine
        this.key = {
            ctrl: false, // or cmd
            alt: false,
            shift: false,
            clear: function()
            {
                this.ctrl = false;
                this.alt = false;
                this.shift = false;
            }
        };

        // Assign events callbacks
        this.initEvents();
    }

    /**
     * Events
     */

    initEvents() {

        // Key down (can be used inside textarea and input)

        metaviz.events.subscribe('editor:textsafe:keydown', document, 'keydown', (event) => {

            // CTRL/CMD key global state
            if (event.keyCode == 17 || (metaviz.system.os.name == 'macos' && (event.keyCode == 91 || event.keyCode == 93 || event.keyCode == 224))) {
                this.key.ctrl = true;
            }

            // ALT key global state
            if (event.keyCode == 18) {
                this.key.alt = true;
            }

            // SHIFT key global state
            if (event.keyCode == 16) {
                this.key.shift = true;
            }

            // CTRL/CMD+S: Save
            else if (this.key.ctrl && !this.key.alt && event.keyCode == 83) {
                event.preventDefault();
                if (this.editor.history.dirty) this.editor.save();
            }

            // CTRL/CMD+L: Create/Delete Link
            else if (this.key.ctrl && !this.key.alt && event.keyCode == 76) {
                event.preventDefault();
                this.editor.linkToggleSelected();
            }

        });

        // Key down

        metaviz.events.subscribe('editor:keydown', document, 'keydown', (event) => {
            // No node is selected and editing is not locked
            if (!this.editor.interaction.locked) {

                // CTRL/CMD+A: Select All
                if (this.key.ctrl && !this.key.alt && event.keyCode == 65) {
                    event.preventDefault();
                    this.editor.selection.all();
                }

                // CTRL/CMD+E: Export
                /*else if (this.key.ctrl && !this.key.alt && event.keyCode == 69) {
                    event.preventDefault();
                    this.editor.export();
                }*/

                // CTRL/CMD+C: Copy (can't be native event 'copy')
                /*else if (this.key.ctrl && !this.key.alt && event.keyCode == 67) {
                    event.preventDefault();
                    this.editor.copy();
                }*/

                // CTRL/CMD+R: Arrange Nodes
                /*else if (this.key.ctrl && !this.key.alt && event.keyCode == 82) {
                    event.preventDefault();
                    this.arrangeSort();
                }*/

                // CTRL/CMD+Z: Undo
                else if (this.key.ctrl && !this.key.alt && !this.key.shift && event.keyCode == 90) {
                    event.preventDefault();
                    if (this.editor.history.undo()) {
                        metaviz.render.layers.current.render();
                        metaviz.render.layers.current.update();
                    }
                }

                // CTRL/CMD+SHIFT+Z: Redo
                else if (this.key.ctrl && !this.key.alt && this.key.shift && event.keyCode == 90) {
                    event.preventDefault();
                    if (this.editor.history.redo()) {
                        metaviz.render.layers.current.render();
                        metaviz.render.layers.current.update();
                    }
                }

                // CTRL/CMD+Del: Delete instantly
                else if (this.key.ctrl && !this.key.alt && event.keyCode == 46) {
                    event.preventDefault();
                    this.editor.nodeDeleteSelectedInstantly();
                }

                // Del: Delete
                else if (event.keyCode == 46) {
                    event.preventDefault();
                    this.editor.nodeDeleteSelected();
                }

                // Button 'ESC': Exit from several things
                else if (event.keyCode == 27) {
                    event.preventDefault();
                    // Hide menu
                    this.editor.menu.hide();
                }

                // Prevent defaults: space out of text editing and backspace forward history in Firefox
                else if ((event.keyCode == 32 || event.keyCode == 8) && !event.target.isContentEditable && !(['INPUT', 'TEXTAREA'].includes(event.target.nodeName))) {
                    event.preventDefault();
                }

            }

        });

        // Key up (can be used inside textarea and input)

        metaviz.events.subscribe('editor:textsafe:keyup', document, 'keyup', (event) => {

            // Clear
            if (this.key.ctrl && (event.keyCode == 17 || (metaviz.system.os.name == 'macos' && (event.keyCode == 91 || event.keyCode == 93 || event.keyCode == 224)))) this.key.ctrl = false;
            if (this.key.alt && event.keyCode == 18) this.key.alt = false;
            if (this.key.shift && event.keyCode == 16) this.key.shift = false;

        });

    }

}
