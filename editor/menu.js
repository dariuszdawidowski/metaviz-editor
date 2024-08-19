/***************************************************************************************************
 *                                                                                                 *
 *                            Metaviz Editor Context Menu                                          *
 *  (\(\   o ( (  o  (\__/)   Create menu and bind all options.                                    *
 *  (-.-) /   )))  \ ('.'=)   MIT License                                                          *
 * o(")(")  (()())  (")(")_)  (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^                                                                       *
 **************************************************************************************************/

class MetavizContextMenu extends TotalProMenu {

    constructor(args) {
        super({ container: metaviz.render.container });
        this.build(args);
    }

    build(args) {

        const {projectName = ''} = args;

        // Add node
        this.subAddNode = new TotalProSubMenu({
            id: 'menu-add-node',
            text: _('Add node')
        });
        this.panel.left.add(this.subAddNode);

        // Generate list of available nodes
        const menuAddNode = this.generateNodesList();

        // Edit selection
        const subEditSelection = new TotalProSubMenu({
            id: 'menu-edit-selection',
            text: _('Edit selection')
        });
        this.panel.left.add(subEditSelection);

        // Navigation
        const subNavigation = new TotalProSubMenu({
            id: 'menu-navigation',
            text: _('Navigation')
        });
        this.panel.left.add(subNavigation);
        subNavigation.add(new TotalProMenuGroup({
            text: _('Navigation'),
            widgets: [

                // Navigation: Centre Board
                new TotalProMenuOption({
                    icon: '<span class="mdi mdi-image-filter-center-focus"></span>',
                    text: _('Centre'),
                    onChange: () => {
                        this.hide();
                        metaviz.render.focusBounds();
                    }
                }),

            ]
        }));

        // Node options
        subEditSelection.add(new TotalProMenuGroup({
            id: 'menu-node-options',
            text: _('Node options'),
            widgets: []
        }));

        // Node local options
        subEditSelection.add(new TotalProMenuGroup({
            id: 'menu-node-local-options',
            text: _('Node local options'),
            widgets: []
        }));

        // Node edit
        subEditSelection.add(new TotalProMenuGroup({
            id: 'menu-node-functions',
            text: _('Node functions'),
            widgets: []
        }));

        // Lock movement
        subEditSelection.add(new TotalProMenuSwitch({
            id: 'menu-node-lock-movement',
            text: _('Lock movement'),
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('move');
                else metaviz.editor.selection.getFocused().unlock('move');
            }
        }));

        // Lock content
        subEditSelection.add(new TotalProMenuSwitch({
            id: 'menu-node-lock-content',
            text: _('Lock content'),
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('content');
                else metaviz.editor.selection.getFocused().unlock('content');
            }
        }));

        // Lock delete
        subEditSelection.add(new TotalProMenuSwitch({
            id: 'menu-node-lock-delete',
            text: _('Lock delete'),
            value: false,
            onChange: (value) => {
                if (value) metaviz.editor.selection.getFocused().lock('delete');
                else metaviz.editor.selection.getFocused().unlock('delete');
            }
        }));

        // Link / Unlink
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-link-variant"></span>',
            id: 'menu-node-link',
            text: _('Link'),
            shortcut: [17, 76],
            onChange: () => {
                metaviz.editor.linkToggleSelected();
                this.hide();
            }
        }));

        // ----
        subEditSelection.add(new TotalProMenuSeparator());

        // Arrange
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-arrange-bring-to-front"></span>',
            id: 'menu-node-sort',
            text: _('Sort'),
            onChange: () => {
                metaviz.editor.arrangeSort();
                this.hide();
            }
        }));
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-focus-field-horizontal"></span>',
            id: 'menu-node-align-horizontal',
            text: _('Align Horizontal'),
            onChange: () => {
                metaviz.editor.arrangeHorizontal();
                this.hide();
            }
        }));
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-focus-field-vertical"></span>',
            id: 'menu-node-align-vertical',
            text: _('Align Vertical'),
            onChange: () => {
                metaviz.editor.arrangeVertical();
                this.hide();
            }
        }));
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-chevron-up"></span>',
            id: 'menu-node-move-foreground',
            text: _('Move to Foreground'),
            onChange: () => {
                metaviz.editor.arrangeZ(1);
                this.hide();
            }
        }));
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-chevron-down"></span>',
            id: 'menu-node-move-background',
            text: _('Move to Background'),
            onChange: () => {
                metaviz.editor.arrangeZ(-1);
                this.hide();
            }
        }));
        subEditSelection.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-circle-off-outline"></span>',
            id: 'menu-node-reset-translations',
            text: _('Reset Translations'),
            onChange: () => {
                metaviz.editor.arrangeReset();
                this.hide();
            }
        }));

        // File
        if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {

            const subFile = new TotalProSubMenu({
                id: 'menu-file',
                text: _('File')
            });
            this.panel.left.add(subFile);
            subFile.add(new TotalProMenuGroup({
                text: _('File operations'),
                widgets: [

                    // New
                    new TotalProMenuOption({
                        icon: '<span class="mdi mdi-file-plus"></span>',
                        id: 'menu-file-new',
                        text: _('New'),
                        onChange: () => {
                            this.hide();
                            let msg = 'Create new board?';
                            if (metaviz.editor.history.isDirty()) msg += '\nUnsaved changes will be lost.';
                            if (confirm(msg)) {
                                // URL clear
                                let url = new URL(window.location.href);
                                url.search = '';
                                window.history.replaceState({}, document.title, url.toString());
                                // New board
                                metaviz.editor.new();
                            }
                        }
                    }),

                    // Open
                    new TotalProMenuOption({
                        icon: '<span class="mdi mdi-file-edit"></span>',
                        id: 'menu-file-open',
                        text: _('Open') + '...',
                        shortcut: [17, 79],
                        onChange: () => {
                            this.hide();
                            metaviz.editor.open();
                        }
                    }),

                    // Save
                    new TotalProMenuOption({
                        icon: '<span class="mdi mdi-content-save"></span>',
                        id: 'menu-file-save',
                        text: _('Save'),
                        shortcut: [17, 83],
                        onChange: () => {
                            this.hide();
                            if (metaviz.editor.history.isDirty()) metaviz.editor.save();
                        }
                    }),

                    // Export
                    new TotalProMenuOption({
                        icon: '<span class="mdi mdi-file-export"></span>',
                        id: 'menu-file-export-svg',
                        text: _('Export to SVG'),
                        onChange: () => {
                            this.hide();
                            metaviz.editor.export('image/svg+xml');
                        }
                    })

                ]
            }));

            // Recent files
            subFile.add(new TotalProMenuGroup({
                id: 'menu-file-recent',
                text: _('Recent files'),
                widgets: []
            }));

            // ----
            this.panel.left.add(new TotalProMenuSeparator());
        }

        // Undo
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-undo"></span>',
            id: 'menu-undo',
            text: _('Undo'),
            shortcut: [17, 90],
            onChange: () => {
                this.hide();
                metaviz.editor.history.undo();
            }
        }));

        // Redo
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-redo"></span>',
            id: 'menu-redo',
            text: _('Redo'),
            shortcut: [17, 16, 90],
            onChange: () => {
                this.hide();
                metaviz.editor.history.redo();
            }
        }));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        // Cut
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-content-cut"></span>',
            id: 'menu-cut',
            text: _('Cut'),
            shortcut: [17, 88],
            onChange: () => {
                metaviz.editor.cut();
                this.hide();
            }
        }));

        // Copy
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-content-copy"></span>',
            id: 'menu-copy',
            text: _('Copy'),
            shortcut: [17, 67],
            onChange: () => {
                metaviz.editor.copy();
                this.hide();
            }
        }));

        // Paste
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-content-paste"></span>',
            id: 'menu-paste',
            text: _('Paste'),
            shortcut: [17, 86],
            onChange: () => {
                metaviz.editor.paste();
                this.hide();
            }
        }));

        // Duplicate
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-content-duplicate"></span>',
            id: 'menu-duplicate',
            text: _('Duplicate'),
            shortcut: [17, 68],
            onChange: () => {
                metaviz.editor.duplicate();
                this.hide();
            }
        }));

        // Select All Nodes / Text
        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-select-all"></span>',
            id: 'menu-select-all',
            text: _('Select All'),
            shortcut: [17, 65],
            onChange: () => {
                if (this.panel.left.find('menu-select-all').getName() == _('Select All Nodes')) {
                    metaviz.editor.selection.all();
                }
                else if (this.panel.left.find('menu-select-all').getName() == _('Select All Text')) {
                    const edit = metaviz.editor.selection.getFocused().getEditingControl();
                    if (edit) edit.setSelection();
                }
            }
        }));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        this.panel.left.add(new TotalProMenuOption({
            icon: '<span class="mdi mdi-delete-forever"></span>',
            id: 'menu-delete',
            text: _('Delete'),
            onChange: () => {
                metaviz.editor.nodeDeleteSelected();
                this.hide();
            }
        }));

        // ----
        this.panel.left.add(new TotalProMenuSeparator());

        // Project Settings
        let subSettings = null;
        if (metaviz.agent.client != 'app') {
            subSettings = new TotalProSubMenu({
                id: 'menu-settings',
                text: _('Settings')
            });
            this.panel.left.add(subSettings);
            subSettings.add(new TotalProMenuGroup({
                text: _('Project settings'),
                widgets: [

                    // Project name
                    new TotalProMenuInput({
                        id: 'menu-board-name',
                        placeholder: _('Board name'),
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

                ]
            }));

            // On update project name
            metaviz.events.listen('update:boardname', (event) => {
                const menuInput = this.panel.left.find('menu-board-name');
                if (menuInput) menuInput.set(event.detail);
            }, false);

            // ----
            subSettings.add(new TotalProMenuSeparator());

            // Browser Settings
            subSettings.add(new TotalProMenuGroup({
                text: _('Local settings') + ':',
                widgets: []
            }));

            // Navigation
            subSettings.add(new TotalProMenuGroup({
                text: _('Navigation'),
                widgets: [

                    // Swipe
                    new TotalProMenuSelect({
                        placeholder: _('Primal pointer device'),
                        options: {
                            'pan': {icon: '', text: _('Primary device: Touchpad')},
                            'zoom': {icon: '', text: _('Primary device: Mouse')}
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
                        placeholder: _('Click on board'),
                        options: {
                            'pan': {icon: '', text: _('Click on board: Pan view')},
                            'box': {icon: '', text: _('Click on board: Selection')}
                        },
                        value: metaviz.config.pointer.desktop.get(),
                        onChange: (value) => {
                            metaviz.config.pointer.desktop.set(value);
                            metaviz.config.save();
                        }
                    }),

                ]
            }));

            // Helpers
            subSettings.add(new TotalProMenuGroup({
                text: _('Helpers'),
                widgets: [

                    // Auto-Align
                    new TotalProMenuSwitch({
                        text: _('Auto-Align'),
                        value: metaviz.config.snap.grid.enabled,
                        onChange: (value) => {
                            metaviz.config.snap.grid.enabled = value;
                            metaviz.config.save();
                        }
                    }),

                ]
            }));

            // Look & feel
            const themes = {};
            const themeClasses = [];
            for (const [key, value] of Object.entries(global.registry.themes)) {
                themes[key] = {icon: '', text: _('Theme') + ': ' + _(key)};
                themeClasses.push('theme-' + global.registry.themes[key].name.toLowerCase());
            }
            subSettings.add(new TotalProMenuGroup({
                text: _('Look & feel'),
                widgets: [

                    new TotalProMenuSelect({
                        placeholder: _('Select color theme'),
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

                ]
            }));

            // Permissions
            subSettings.add(new TotalProMenuGroup({
                text: _('Permissions'),
                widgets: [

                    // Allow system clipboard
                    (metaviz.system.features.clipboardApi ?
                    new TotalProMenuSwitch({
                        id: 'menu-settings-allow-clipboard',
                        text: _('Allow system clipboard'),
                        value: false,
                        onChange: (value) => {
                            if (value == true) navigator.clipboard.readText();
                            else alert(_('Disable clipboard'));
                            this.hide();
                        }
                    }) : null),

                    // Allow cookie info bar
                    new TotalProMenuSwitch({
                        text: _('Show cookie info'),
                        value: metaviz.config.cookies.show,
                        onChange: (value) => {
                            metaviz.config.cookies.show = value;
                            metaviz.config.save();
                        }
                    }),

                    // Check for updates
                    ((metaviz.url.update != '') ?
                    new TotalProMenuSwitch({
                        text: _('Check for updates'),
                        value: metaviz.config.updates.check,
                        onChange: (value) => {
                            metaviz.config.updates.check = value;
                            metaviz.config.save();
                        }
                    }) : null),

                ]
            }));

            // Updates
            if (metaviz.url.update != '') {
            }

        } // Project Settings

        // Help selection
        const subHelp = new TotalProSubMenu({
            id: 'menu-help',
            text: _('Help')
        });
        this.panel.left.add(subHelp);
        subHelp.add(new TotalProMenuGroup({
            text: `Metaviz ${metaviz.version}\nBuild ${metaviz.build}`,
            widgets: [

                // Help: GitHub Page
                new TotalProMenuOption({
                    icon: '<span class="mdi mdi-open-in-new"></span>',
                    text: _('GitHub page'),
                    onChange: () => window.open('https://github.com/dariuszdawidowski/metaviz-editor')
                }),

                // Help: Submit issue
                new TotalProMenuOption({
                    icon: '<span class="mdi mdi-bug"></span>',
                    text: _('Submit issue'),
                    onChange: () => window.open('https://github.com/dariuszdawidowski/metaviz-editor/issues')
                }),

            ]
        }));

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
                id: `menu-node-${args.name.slug()}`,
                icon: args.icon || '<span class="mdi mdi-atom"></span>',
                text: _(args.name),
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

        // If only one node is selected and not clicked on node then deselect all
        else if (metaviz.editor.selection.count() == 1) {
            metaviz.editor.selection.clear();
        }

        // Enable Add node (only for no selection)
        if (metaviz.editor.selection.count() == 0) {
            this.panel.left.find('menu-add-node')?.enable().select();
        }

        // Activate Edit Selection (only for 1 node)
        else if (metaviz.editor.selection.count() == 1) {

            // Enable Edit Selection
            this.panel.left.find('menu-edit-selection')?.enable();

            // Activate
            this.panel.left.find('menu-edit-selection')?.select();

            // Node Menu Options {options: [TotalProMenuOption, ...], localOptions: [TotalProMenuOption, ...]}
            const data = metaviz.editor.selection.getFocused().menu();
            // Node options
            const options = this.panel.left.find('menu-node-options');
            options.del();
            options.hide();
            // Node local options
            const localOptions = this.panel.left.find('menu-node-local-options');
            localOptions.del();
            localOptions.hide();
            // Has options
            if ('options' in data && Object.keys(data.options).length) {
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
                options.add(new TotalProMenuOption({
                    text: '- ' + _('No options') + ' -',
                    disabled: true
                }));
            }
            options.show();

            // Has local options
            if ('localOptions' in data && data.localOptions.length) {
                for (const option of data.localOptions) {
                    localOptions.add(option);
                }
                localOptions.show();
            }

            // Menu callback
            if (clicked) clicked.contextmenu();

        } // Edit Selection

        // Multiple selection
        else if (metaviz.editor.selection.count() > 1) {
            // Enable Edit Selection
            this.panel.left.find('menu-edit-selection')?.enable();

            // Activate
            this.panel.left.find('menu-edit-selection')?.select();

            // Node options
            const options = this.panel.left.find('menu-node-options');
            options.del();
            options.hide();

            // Node local options
            const localOptions = this.panel.left.find('menu-node-local-options');
            localOptions.del();
            localOptions.hide();

            // No options
            options.add(new TotalProMenuOption({
                text: '- ' + _('No options') + ' -',
                disabled: true
            }));
        }

        // Lock
        if (metaviz.editor.selection.count() == 1) {
            this.panel.left.find('menu-node-lock-movement').set(metaviz.editor.selection.getFocused().locked.move);
            this.panel.left.find('menu-node-lock-content').set(metaviz.editor.selection.getFocused().locked.content);
            this.panel.left.find('menu-node-lock-delete').set(metaviz.editor.selection.getFocused().locked.delete);
        }

        // Arrange
        if (metaviz.editor.selection.count() > 1) {
            this.panel.left.find('menu-node-sort')?.enable();
            this.panel.left.find('menu-node-align-horizontal')?.enable();
            this.panel.left.find('menu-node-align-vertical')?.enable();
        }
        else {
            this.panel.left.find('menu-node-sort')?.disable();
            this.panel.left.find('menu-node-align-horizontal')?.disable();
            this.panel.left.find('menu-node-align-vertical')?.disable();
        }

        // Unanchor
        if (metaviz.editor.selection.count() == 1 && metaviz.editor.selection.getFocused().parentNode?.element.hasClass('metaviz-anchor')) this.panel.left.find('menu-unanchor')?.enable();
        else this.panel.left.find('menu-unanchor')?.disable();

        // Link / Unlink (only for two)
        if (metaviz.editor.selection.count() == 2) {
            // Unlink
            if (metaviz.render.links.get(metaviz.editor.selection.nodes[0], metaviz.editor.selection.nodes[1])) {
                this.panel.left.find('menu-node-link')?.enable().setIcon('<span class="mdi mdi-link-variant-off"></span>').setName(_('Unlink'));
            }
            // Link
            else {
                this.panel.left.find('menu-node-link')?.enable().setIcon('<span class="mdi mdi-link-variant"></span>').setName(_('Link'));
            }
        }
        // Inactive
        else if (metaviz.editor.selection.count() != 2) {
            this.panel.left.find('menu-node-link')?.disable();
        }

        // Delete
        if (metaviz.editor.selection.count() > 0)
        {
            this.panel.left.find('menu-delete')?.setName(_('Delete') + ` (${metaviz.editor.selection.count()})`);
            this.panel.left.find('menu-delete')?.enable();
        }
        else
        {
            this.panel.left.find('menu-delete')?.setName(_('Delete'));
            this.panel.left.find('menu-delete')?.disable();
        }

        // File functions
        if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {

            // Enable main file option
            this.panel.left.find('menu-file')?.enable();

            // Enable New
            this.panel.left.find('menu-file-new')?.enable();

            // Enable Open File...
            this.panel.left.find('menu-file-open')?.enable();

            // Enable Save
            if (metaviz.editor.history.isDirty()) {
                this.panel.left.find('menu-file-save')?.enable();
            }
            else {
                this.panel.left.find('menu-file-save')?.disable();
            }

            // Enable Export
            if (metaviz.render.nodes.list.length) {
                this.panel.left.find('menu-file-export-svg')?.enable();
            }
            else {
                this.panel.left.find('menu-file-export-svg')?.disable();
            }

        }

        // Enable Undo/Redo
        if (metaviz.editor.history.hasUndo()) this.panel.left.find('menu-undo')?.enable();
        if (metaviz.editor.history.hasRedo()) this.panel.left.find('menu-redo')?.enable();
        
        // Enable Cut/Copy/Duplicate
        if (metaviz.editor.selection.count() > 0) {
            this.panel.left.find('menu-cut')?.enable();
            this.panel.left.find('menu-copy')?.enable();
            this.panel.left.find('menu-duplicate')?.enable();
        }

        // Enable Paste
        this.checkClipboardToPaste();

        // Select All
        if (metaviz.editor.selection.count() == 0) {
            this.panel.left.find('menu-select-all')?.enable().setName(_('Select All Nodes'));
        }
        else if (metaviz.editor.selection.count() == 1) {
            if (metaviz.editor.selection.getFocused().getEditingControl()) {
                this.panel.left.find('menu-select-all')?.enable().setName(_('Select All Text'));
            }
            else {
                this.panel.left.find('menu-select-all')?.enable().setName(_('Select All Nodes'));
            }
        }

        // Enable Navigation (always)
        this.panel.left.find('menu-navigation')?.enable();

        // Recent files
        this.updateRecentFiles();

        // Enable Toolbar (always)
        this.panel.left.find('menu-toolbars')?.enable();

        // Enable Project settings (always)
        this.panel.left.find('menu-settings')?.enable();

        // Enable Help (always)
        this.panel.left.find('menu-help')?.enable();

        // Show menu at pointer coords
        const container = metaviz.container.getOffset();
        super.show({left: args.x - container.x, top: args.y - container.y});

        // Permissions: Clipboard
        if (metaviz.system.features.clipboardApi && metaviz.system.features.clipboardAllowed) {
            this.panel.left.find('menu-settings-allow-clipboard')?.set(true);
        }
        else {
            this.panel.left.find('menu-settings-allow-clipboard')?.set(false);
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
     * Fill file menu with recently opened files
     */

    async updateRecentFiles() {
        const menuRecentFiles = this.panel.left.find('menu-file-recent');
        if (menuRecentFiles) {
            menuRecentFiles.del();
            const records = await metaviz.storage.db.table['boards'].get('*');
            if (records.length) {
                records.sort((a, b) => b.timestamp - a.timestamp);
                for (const board of records) {
                    menuRecentFiles.add(new TotalProMenuOption({
                        icon: '<span class="mdi mdi-file-clock"></span>',
                        text: board.name || board.handle.name,
                        value: board.id,
                        onChange: (value) => {
                            this.hide();
                            if (value) metaviz.editor.open(value);
                        }
                    }));
                }
            }
            // No recent files
            else {
                menuRecentFiles.add(new TotalProMenuOption({
                    text: '- ' + _('No options') + ' -',
                    disabled: true
                }));
            }
        }
    }

    /**
     * Check whether clipboard contains any elements and enable paste
     */

    async checkClipboardToPaste() {
        if (metaviz.system.features.clipboardApi && metaviz.system.features.clipboardAllowed) {
            try {
                const items = await navigator.clipboard.read();
                const text = await navigator.clipboard.readText();
                if (items.length > 0 || text != '') this.panel.left.find('menu-paste')?.enable();
            }
            catch {
            }
        }
        else {
            if (metaviz.editor.clipboard?.count() > 0) {
                this.panel.left.find('menu-paste')?.enable();
            }
        }
    }

}
