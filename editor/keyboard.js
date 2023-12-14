/**
 * Metaviz Editor Keyboard
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizEditorKeyboard {

    constructor(editor) {
        // Editor
        this.editor = editor;

        // Keys state machine
        this.key = {
            ctrl: false, // or cmd
            alt: false, // option
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
            if (event.key == 'Control' || (metaviz.system.os.name == 'macos' && event.key == 'Meta')) {
                this.key.ctrl = true;
            }

            // ALT key global state
            if (event.key == 'Alt') {
                this.key.alt = true;
            }

            // SHIFT key global state
            if (event.key == 'Shift') {
                this.key.shift = true;
            }

            // CTRL/CMD+O: Open
            if (this.key.ctrl && !this.key.alt && event.code == 'KeyO') {
                event.preventDefault();
                metaviz.editor.open();
            }

            // CTRL/CMD+S: Save
            else if (this.key.ctrl && !this.key.alt && event.code == 'KeyS') {
                event.preventDefault();
                if (this.editor.history.isDirty()) this.editor.save();
            }

            // CTRL/CMD+L: Create/Delete Link
            else if (this.key.ctrl && !this.key.alt && event.code == 'KeyL') {
                event.preventDefault();
                this.editor.linkToggleSelected();
            }

            // CTRL/CMD+F: Search
            else if (this.key.ctrl && !this.key.alt && event.code == 'KeyF') {
                event.preventDefault();
                const field = metaviz.container.element.querySelector('input.search');
                if (field) field.focus();
            }

        });

        // Key down

        metaviz.events.subscribe('editor:keydown', document, 'keydown', (event) => {
            // No node is selected and editing is not locked
            if (!this.editor.interaction.locked) {

                // CTRL/CMD+A: Select All
                if (this.key.ctrl && !this.key.alt && event.code == 'KeyA') {
                    event.preventDefault();
                    this.editor.selection.all();
                }

                // CTRL/CMD+Z: Undo
                else if (this.key.ctrl && !this.key.alt && !this.key.shift && event.code == 'KeyZ') {
                    event.preventDefault();
                    if (this.editor.history.undo()) {
                        metaviz.editor.update();
                    }
                }

                // CTRL/CMD+SHIFT+Z: Redo
                else if (this.key.ctrl && !this.key.alt && this.key.shift && event.code == 'KeyZ') {
                    event.preventDefault();
                    if (this.editor.history.redo()) {
                        metaviz.editor.update();
                    }
                }

                // CTRL/CMD+Del: Delete instantly
                else if (this.key.ctrl && !this.key.alt && event.key == 'Delete') {
                    event.preventDefault();
                    this.editor.nodeDeleteSelectedInstantly();
                }

                // Del: Delete
                else if (event.key == 'Delete') {
                    event.preventDefault();
                    this.editor.nodeDeleteSelected();
                }

                // Button 'ESC': Exit from several things
                else if (event.key == 'Escape') {
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
            if (this.key.ctrl && (event.key == 'Control' || (metaviz.system.os.name == 'macos' && event.key == 'Meta'))) this.key.ctrl = false;
            if (this.key.alt && event.key == 'Alt') this.key.alt = false;
            if (this.key.shift && event.key == 'Shift') this.key.shift = false;

        });

    }

}
