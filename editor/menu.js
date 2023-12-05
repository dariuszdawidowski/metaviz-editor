/***************************************************************************************************
 *                                                                                                 *
 *                            Metaviz Editor Context Menu                                          *
 *  (\(\   o ( (  o  (\__/)   Create menu and bind all options.                                    *
 *  (-.-) /   )))  \ ('.'=)   MIT License                                                          *
 * o(")(")  (()())  (")(")_)  (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^                                                                       *
 **************************************************************************************************/

class MetavizContextMenu extends TotalProMenu {

    constructor(args) {
        super({ container: metaviz.render.container });
        const {projectName = ''} = args;

        // Add node
        this.subAddNode = new TotalProSubMenu({ text: 'Add node' });
        this.panel.left.add(this.subAddNode);

        // Generate list of available nodes
        const menuAddNode = this.generateNodesList();

        // Edit selection
        const subEditSelection = new TotalProSubMenu({ text: 'Edit selection' });
        this.panel.left.add(subEditSelection);

        // Navigation
        const subNavigation = new TotalProSubMenu({ text: 'Navigation' });
        this.panel.left.add(subNavigation);
        subNavigation.add(new TotalProMenuGroup({ text: 'Navigation', widgets: [

            // Navigation: Centre Board
            new TotalProMenuOption({
                text: 'Centre',
                onChange: () => {
                    this.hide();
                    metaviz.render.focusBounds();
                }
            }),

        ] }));

        // Node options
        subEditSelection.add(new TotalProMenuGroup({ text: 'Node options', widgets: []}));

        // Node local options
        subEditSelection.add(new TotalProMenuGroup({ text: 'Node local options', widgets: []}));

        // ----
        // subEditSelection.add(new TotalProMenuSeparator());

        // Node edit
        subEditSelection.add(new TotalProMenuGroup({ text: 'Node functions', widgets: []}));

        // Lock movement
        subEditSelection.add(new TotalProMenuSwitch({
            text: 'Lock movement',
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('move');
                else metaviz.editor.selection.getFocused().unlock('move');
            }
        }));

        // Lock content
        subEditSelection.add(new TotalProMenuSwitch({
            text: 'Lock content',
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('content');
                else metaviz.editor.selection.getFocused().unlock('content');
            }
        }));

        // Lock delete
        subEditSelection.add(new TotalProMenuSwitch({
            text: 'Lock delete',
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('delete');
                else metaviz.editor.selection.getFocused().unlock('delete');
            }
        }));

        // Link / Unlink
        subEditSelection.add(new TotalProMenuOption({ text: 'Link', shortcut: [17, 76], onChange: () => {
            metaviz.editor.linkToggleSelected();
            this.hide();
        }}));

        // Copy url of node
        if (!metaviz.agent.client == 'browser') {
            subEditSelection.add(new TotalProMenuOption({ text: 'Copy url of node', onChange: () => {
                let params = window.location.search.uriToDict();
                params['node'] = metaviz.editor.selection.nodes[0].id;
                metaviz.editor.clipboard.set(location.protocol + '//' + location.host + location.pathname + '?' + dictToUri(params));
                this.hide();
            }}));
        }

        // ----
        subEditSelection.add(new TotalProMenuSeparator());

        // Arrange
        subEditSelection.add(new TotalProMenuOption({ text: 'Sort', onChange: () => {
            metaviz.editor.arrangeSort();
            this.hide();
        }}));
        subEditSelection.add(new TotalProMenuOption({ text: 'Align Horizontal', onChange: () => {
            metaviz.editor.arrangeHorizontal();
            this.hide();
        }}));
        subEditSelection.add(new TotalProMenuOption({ text: 'Align Vertical', onChange: () => {
            metaviz.editor.arrangeVertical();
            this.hide();
        }}));
        subEditSelection.add(new TotalProMenuOption({ text: 'Move to Foreground', onChange: () => {
            metaviz.editor.arrangeZ(1);
            this.hide();
        }}));
        subEditSelection.add(new TotalProMenuOption({ text: 'Move to Background', onChange: () => {
            metaviz.editor.arrangeZ(-1);
            this.hide();
        }}));
        subEditSelection.add(new TotalProMenuOption({ text: 'Reset Translations', onChange: () => {
            metaviz.editor.arrangeReset();
            this.hide();
        }}));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {
            // New
            this.panel.left.add(new TotalProMenuOption({ text: 'New', shortcut: [17, 78], onChange: () => {
                this.hide();
                let msg = 'Create new board?';
                if (metaviz.editor.history.isDirty()) msg += '\nUnsaved changes will be lost.';
                if (confirm(msg)) metaviz.editor.new();
            }}));

            // Open File
            this.panel.left.add(new TotalProMenuOption({ text: 'Open File...', shortcut: [17, 79], onChange: () => {
                this.hide();
                metaviz.editor.open();
            }}));

            // Save
            this.panel.left.add(new TotalProMenuOption({ text: 'Save', shortcut: [17, 83], onChange: () => {
                this.hide();
                metaviz.editor.save();
            }}));

            // ----
            this.panel.left.add(new TotalProMenuSeparator());
        }

        // Undo
        this.panel.left.add(new TotalProMenuOption({ text: 'Undo', shortcut: [17, 90], onChange: () => {
            this.hide();
            metaviz.editor.history.undo();
        } }));

        // Redo
        this.panel.left.add(new TotalProMenuOption({ text: 'Redo', shortcut: [17, 16, 90], onChange: () => {
            this.hide();
            metaviz.editor.history.redo();
        } }));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        // Cut
        this.panel.left.add(new TotalProMenuOption({ text: 'Cut', shortcut: [17, 88], onChange: () => {
            metaviz.editor.cut();
            this.hide();
        }}));

        // Copy
        this.panel.left.add(new TotalProMenuOption({ text: 'Copy', shortcut: [17, 67], onChange: () => {
            metaviz.editor.copy();
            this.hide();
        }}));

        // Paste
        this.panel.left.add(new TotalProMenuOption({ text: 'Paste', shortcut: [17, 86], onChange: () => {
            metaviz.editor.paste();
            this.hide();
        }}));

        // Duplicate
        this.panel.left.add(new TotalProMenuOption({ text: 'Duplicate', shortcut: [17, 68], onChange: () => {
            metaviz.editor.duplicate();
            this.hide();
        }}));

        // Select All Nodes / Text
        this.panel.left.add(new TotalProMenuOption({
            text: 'Select All',
            shortcut: [17, 65],
            onChange: () => {
                if (this.panel.left.find('total-pro-menu-select-all').getName() == 'Select All Nodes') {
                    metaviz.editor.selection.all();
                }
                else if (this.panel.left.find('total-pro-menu-select-all').getName() == 'Select All Text') {
                    const edit = metaviz.editor.selection.getFocused().getEditingControl();
                    if (edit) edit.setSelection();
                }
            }
        }));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        this.panel.left.add(new TotalProMenuOption({ text: 'Delete', onChange: () => {
            metaviz.editor.nodeDeleteSelected();
            this.hide();
        }}));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        // Project Settings
        let subSettings = null;
        if (metaviz.agent.client != 'app') {
            subSettings = new TotalProSubMenu({ text: 'Settings' });
            this.panel.left.add(subSettings);
            subSettings.add(new TotalProMenuGroup({ text: 'Project settings', widgets: [
                // Project name
                new TotalProMenuInput({
                    id: 'total-pro-menu-project-name',
                    placeholder: 'Project name',
                    value: projectName,
                    onChange: (value) => {
                        // Undo/Sync
                        metaviz.editor.history.store({
                            action: 'board',
                            name: value,
                            namePrev: metaviz.editor.getBoardName()
                        });
                        // Set new name
                        metaviz.editor.setBoardName(event.target.value);
                    }
                }),
            ] }));

            // On update project name
            metaviz.events.listen('update:projectname', (event) => {
                const menuInput = this.panel.left.find('total-pro-menu-project-name');
                if (menuInput) menuInput.set(event.detail);
            }, false);

            // ----
            subSettings.add(new TotalProMenuSeparator());

            // Browser Settings
            subSettings.add(new TotalProMenuGroup({ text: 'Local settings', widgets: [
            ] }));

            // Naviagtion
            subSettings.add(new TotalProMenuGroup({ text: 'Naviagtion', widgets: [

                // Swipe
                new TotalProMenuSelect({
                    placeholder: 'Primal pointer device',
                    options: {
                        'pan': {icon: '', text: 'Primary device: Touchpad'},
                        'zoom': {icon: '', text: 'Primary device: Mouse'}
                    },
                    value: metaviz.config.touchpad.swipe.get(),
                    onChange: (value) => {
                        metaviz.config.touchpad.swipe.set(value);
                        metaviz.config.save();
                        metaviz.editor.restartViewerMouseEvents();
                    }
                }),

                // Desktop Click
                new TotalProMenuSelect({
                    placeholder: 'Click on desktop',
                    options: {
                        'pan': {icon: '', text: 'Click on desktop: Pan view'},
                        'box': {icon: '', text: 'Click on desktop: Selection'}
                    },
                    value: metaviz.config.pointer.desktop.get(),
                    onChange: (value) => {
                        metaviz.config.pointer.desktop.set(value);
                        metaviz.config.save();
                    }
                }),

            ] }));

            // Helpers
            subSettings.add(new TotalProMenuGroup({ text: 'Helpers', widgets: [

                // Auto-Align
                new TotalProMenuSwitch({
                    text: 'Auto-Align',
                    value: metaviz.config.snap.grid.enabled,
                    onChange: (value) => {
                        metaviz.config.snap.grid.enabled = value;
                        metaviz.config.save();
                    }
                }),

            ] }));

            // Look & feel
            const themes = {};
            const themeClasses = [];
            for (const [key, value] of Object.entries(global.registry.themes)) {
                themes[key] = {icon: '', text: 'Theme: ' + key};
                themeClasses.push('theme-' + global.registry.themes[key].name.toLowerCase());
            }
            subSettings.add(new TotalProMenuGroup({ text: 'Look & feel', widgets: [

                new TotalProMenuSelect({
                    placeholder: 'Select color theme',
                    options: themes,
                    value: metaviz.config.theme.get(),
                    onChange: (value) => {
                        metaviz.container.element.classList.remove(...themeClasses);
                        metaviz.container.element.classList.add('theme-' + value.toLowerCase());
                        for (const [key, theme] of Object.entries(global.registry.themes[value].vars)) {
                            document.documentElement.style.setProperty(key, theme);
                        }
                        metaviz.config.theme.set(value);
                        metaviz.config.save();
                    }
                }),

            ] }));

        } // Project Settings

        // Help selection
        const subHelp = new TotalProSubMenu({ text: 'Help' });
        this.panel.left.add(subHelp);
        subHelp.add(new TotalProMenuGroup({ text: `Metaviz ${metaviz.version}`, widgets: [
            // Help: GitHub Page
            new TotalProMenuOption({ text: 'GitHub page', onChange: () => window.open('https://github.com/dariuszdawidowski/metaviz-editor') }),

            // Help: Submit issue
            new TotalProMenuOption({ text: 'Submit issue', onChange: () => window.open('https://github.com/dariuszdawidowski/metaviz-editor/issues') }),
        ] }));

        // Simulate scroll event
        this.element.addEventListener('scroll', (event) => {
            this.subAddNode.panel.scroll(0, this.subAddNode.panel.scrollTop - event.detail);
            subEditSelection.panel.scroll(0, subEditSelection.panel.scrollTop - event.detail);
            subNavigation.panel.scroll(0, subNavigation.panel.scrollTop - event.detail);
            if (subSettings) subSettings.panel.scroll(0, subSettings.panel.scrollTop - event.detail);
            subHelp.panel.scroll(0, subHelp.panel.scrollTop - event.detail);
        });

    }

    /**
     * Generate nodes list
     */

    generateNodesList() {
        const menuAddNode = {'Default Nodes': []};
        for (const [className, args] of Object.entries(global.registry.nodes)) {
            const menuName = (('menu' in args) ? args.menu : 'Default Nodes');
            if (!(menuName in menuAddNode)) menuAddNode[menuName] = [];
            menuAddNode[menuName].push(new TotalProMenuOption({
                id: `total-pro-menu-node-${args.name.slug()}`,
                text: args.name,
                onChange: () => {
                    metaviz.editor.nodeAdd(className, this.position('first click'));
                    this.hide();
                }
            }));
        }
        for (const [menuName, menuNodes] of Object.entries(menuAddNode)) {
            this.subAddNode.add(new TotalProMenuGroup({ text: menuName, widgets: menuNodes }));
        }
    }

    /**
     * Destroy old and generate fresh nodes list
     */

    regenerateNodesList() {
        this.subAddNode.del();
        this.generateNodesList();
    }

    /**
     * Prepare and show context menu
     * args:
     * x: left
     * y: top
     * target: clicked DOM element
     */

    show(args) {

        // Not when overlay is visible or locked
        if (!metaviz.editor.interaction.locked && !metaviz.editor.popup?.visible) {

            // Disable conflicting events
            metaviz.events.disable('viewer:*');
            metaviz.events.disable('editor:copy');
            metaviz.events.disable('editor:paste');
            metaviz.events.disable('editor:keydown');
            metaviz.events.disable('editor:keyup');
            metaviz.events.disable('editor:wheel');
            metaviz.events.disable('editor:pointerdown');
            metaviz.events.disable('editor:pointermove');
            metaviz.events.disable('editor:pointerup');
            metaviz.events.enable('browser:prevent');
            
            // Disable all options
            this.panel.left.deselect();
            this.panel.left.disable();

            // If node is pointed then open Edit Selection section
            const clicked = metaviz.render.nodes.get(args.target);
            if (clicked) {
                // Interaction object: node
                metaviz.editor.interaction.object = 'node';
                // If not part of selection
                if (!metaviz.editor.selection.get(clicked)) {
                    // If multiselection then clear others
                    if (metaviz.editor.selection.count() > 0) metaviz.editor.selection.clear();
                    // Add to selection
                    metaviz.editor.selection.add(clicked);
                }
            }
            // Clear selection if clicked on board background
            else {
                metaviz.editor.selection.clear();
            }

            // Cancel piemenu
            for (const node of metaviz.editor.selection.get()) {
                node.piemenu?.hide();
            }

            // Enable Add node (only for no selection)
            if (metaviz.editor.selection.count() == 0) {
                this.panel.left.find('total-pro-menu-add-node')?.enable().select();
            }

            // Activate Edit Selection (only for 1+ node)
            if (metaviz.editor.selection.count() > 0) {

                // Enable Edit Selection
                this.panel.left.find('total-pro-menu-edit-selection')?.enable();

                // Activate
                this.panel.left.find('total-pro-menu-edit-selection')?.select();

                // Node Menu Options {options: [TotalProMenuOption, ...], localOptions: [TotalProMenuOption, ...]}
                const data = metaviz.editor.selection.getFocused().menu();
                // Node options
                const options = this.panel.left.find('total-pro-menu-node-options');
                options.del();
                options.hide();
                // Node local options
                const localOptions = this.panel.left.find('total-pro-menu-node-local-options');
                localOptions.del();
                localOptions.hide();
                // Show options (only for 1 node)
                if (metaviz.editor.selection.count() == 1) {
                    // Has options
                    if ('options' in data) {
                        // Options given as array
                        if (Array.isArray(data.options)) for (const option of data.options) {
                            options.add(option);
                        }
                        // Options given as dict
                        else {
                            for (const option of Object.values(data.options)) {
                                options.add(option);
                            }
                        }
                    }
                    // No options
                    else {
                        options.add(new TotalProMenuOption({ text: 'No options', disabled: true}));
                    }
                    options.show();

                    // Has local options
                    if ('localOptions' in data && data.localOptions.length) {
                        for (const option of data.localOptions) {
                            localOptions.add(option);
                        }
                        localOptions.show();
                    }
                }

                // Menu callback
                if (clicked) clicked.contextmenu();

            } // Edit Selection

            // Lock
            if (metaviz.editor.selection.count() > 0) {
                this.panel.left.find('total-pro-menu-lock-movement').set(metaviz.editor.selection.getFocused().locked.move);
                this.panel.left.find('total-pro-menu-lock-content').set(metaviz.editor.selection.getFocused().locked.content);
                this.panel.left.find('total-pro-menu-lock-delete').set(metaviz.editor.selection.getFocused().locked.delete);
            }

            // Arrange
            if (metaviz.editor.selection.count() > 1) {
                this.panel.left.find('total-pro-menu-sort')?.enable();
                this.panel.left.find('total-pro-menu-align-horizontal')?.enable();
                this.panel.left.find('total-pro-menu-align-vertical')?.enable();
            }
            else {
                this.panel.left.find('total-pro-menu-sort')?.disable();
                this.panel.left.find('total-pro-menu-align-horizontal')?.disable();
                this.panel.left.find('total-pro-menu-align-vertical')?.disable();
            }

            // Unanchor
            if (metaviz.editor.selection.count() == 1 && metaviz.editor.selection.getFocused().parentNode?.element.hasClass('metaviz-anchor')) this.panel.left.find('total-pro-menu-unanchor')?.enable();
            else this.panel.left.find('total-pro-menu-unanchor')?.disable();

            // Link / Unlink (only for two)
            if (metaviz.editor.selection.count() == 2) {
                // Unlink
                if (metaviz.render.links.get(metaviz.editor.selection.nodes[0], metaviz.editor.selection.nodes[1])) {
                    this.panel.left.find('total-pro-menu-link')?.enable().setName('Unlink');
                }
                // Link
                else {
                    this.panel.left.find('total-pro-menu-link')?.enable().setName('Link');
                }
            }
            // Inactive
            else if (metaviz.editor.selection.count() != 2) {
                this.panel.left.find('total-pro-menu-link')?.disable();
            }

            // Delete
            if (metaviz.editor.selection.count() > 0)
            {
                this.panel.left.find('total-pro-menu-delete')?.setName(`Delete (${metaviz.editor.selection.count()})`);
                this.panel.left.find('total-pro-menu-delete')?.enable();
            }
            else
            {
                this.panel.left.find('total-pro-menu-delete')?.setName('Delete');
                this.panel.left.find('total-pro-menu-delete')?.disable();
            }

            // File functions
            if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {
                // Enable New
                this.panel.left.find('total-pro-menu-new')?.enable();

                // Enable Open File...
                this.panel.left.find('total-pro-menu-open-file')?.enable();

                // Enable Save/Export
                if (metaviz.editor.history.isDirty()) {
                    this.panel.left.find('total-pro-menu-save')?.enable();
                }
            }

            // Enable Undo/Redo
            if (metaviz.editor.history.hasUndo()) this.panel.left.find('total-pro-menu-undo')?.enable();
            if (metaviz.editor.history.hasRedo()) this.panel.left.find('total-pro-menu-redo')?.enable();
            
            // Enable Cut/Copy/Duplicate
            if (metaviz.editor.selection.count() > 0) {
                this.panel.left.find('total-pro-menu-cut')?.enable();
                this.panel.left.find('total-pro-menu-copy')?.enable();
                this.panel.left.find('total-pro-menu-duplicate')?.enable();
            }

            // Enable Paste
            this.checkClipboardToPaste();

            // Select All
            if (metaviz.editor.selection.count() == 0) {
                this.panel.left.find('total-pro-menu-select-all')?.enable().setName('Select All Nodes');
            }
            else {
                if (metaviz.editor.selection.getFocused().getEditingControl())
                    this.panel.left.find('total-pro-menu-select-all')?.enable().setName('Select All Text');
                else
                    this.panel.left.find('total-pro-menu-select-all')?.enable().setName('Select All Nodes');
            }

            // Enable Navigation (always)
            this.panel.left.find('total-pro-menu-navigation')?.enable();

            // Enable Toolbar (always)
            this.panel.left.find('total-pro-menu-toolbars')?.enable();

            // Enable Project settings (always)
            this.panel.left.find('total-pro-menu-settings')?.enable();

            // Enable Help (always)
            this.panel.left.find('total-pro-menu-help')?.enable();

            // Show menu at pointer coords
            const container = metaviz.container.getOffset();
            super.show({left: args.x - container.x, top: args.y - container.y});
        }
    }

    /**
     * Hide context menu
     */

    hide() {
        super.hide();

        // Reset node chaining if interrupted
        if (metaviz.editor.interaction.chainNode) {
            metaviz.editor.dragLinkCancel();
        }

        // Restore editor events
        metaviz.events.disable('browser:prevent');
        metaviz.events.enable('viewer:*');
        metaviz.events.enable('editor:copy');
        metaviz.events.enable('editor:paste');
        metaviz.events.enable('editor:keydown');
        metaviz.events.enable('editor:keyup');
        metaviz.events.enable('editor:wheel');
        metaviz.events.enable('editor:pointerdown');
        metaviz.events.enable('editor:pointermove');
        metaviz.events.enable('editor:pointerup');
    }

    /**
     * Check whether clipboard contains any elements and enable paste
     */

    async checkClipboardToPaste() {
        try {
            const items = await navigator.clipboard.read();
            const text = await navigator.clipboard.readText();
            if (items.length > 0 || text != '') this.panel.left.find('total-pro-menu-paste')?.enable();
        }
        catch (err) {
            if (metaviz.editor.clipboard?.count() > 0) {
                this.panel.left.find('total-pro-menu-paste')?.enable();
            }
        }
    }

}
