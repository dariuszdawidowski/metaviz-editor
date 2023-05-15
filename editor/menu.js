/**
 * Metaviz Editor Context Menu
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

/**
 * Main context menu
 */

class MetavizContextMenu extends Menu {

    constructor(args) {
        super({ container: metaviz.render.container });
        const {projectName = ''} = args;

        // Add node
        this.subAddNode = new SubMenu({ text: 'Add node' });
        this.panel.left.add(this.subAddNode);

        // Generate list of available nodes
        const menuAddNode = this.generateNodesList();

        // Edit selection
        const subEditSelection = new SubMenu({ text: 'Edit selection' });
        this.panel.left.add(subEditSelection);

        // Navigation
        const subNavigation = new SubMenu({ text: 'Navigation' });
        this.panel.left.add(subNavigation);
        subNavigation.add(new MenuGroup({ text: 'Navigation', widgets: [

            // Navigation: Folder Up
            new MenuOption({ icon: '<i class="fa-solid fa-circle-up"></i>', text: 'Folder Up', onChange: () => {
                window.history.back();
            }}),

            // Navigation: Folder Down
            new MenuOption({ icon: '<i class="fa-solid fa-circle-down"></i>', text: 'Folder Down', onChange: () => {
                window.history.forward();
            }}),

            // Navigation: Centre Board
            new MenuOption({ icon: '<i class="fa-solid fa-arrows-to-dot"></i>', text: 'Centre Board', onChange: () => {
                metaviz.render.center();
            }}),

        ] }));

        // Node options
        subEditSelection.add(new MenuGroup({ text: 'Node options', widgets: []}));

        // Node local options
        subEditSelection.add(new MenuGroup({ text: 'Node local options', widgets: []}));

        // ----
        // subEditSelection.add(new MenuSeparator());

        // Node edit
        subEditSelection.add(new MenuGroup({ text: 'Node functions', widgets: []}));

        // Link / Unlink
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-link"></i>', text: 'Link', shortcut: [17, 76], onChange: () => {
            metaviz.editor.linkToggleSelected();
            this.hide();
        }}));

        // Lock
        subEditSelection.add(new MenuOption({ icon: '<i class="fa-solid fa-lock-open"></i>', text: 'Lock', onChange: () => {
            metaviz.editor.selection.nodes[0].lockToggle();
        }}));

        // Copy url of node
        if (!metaviz.agent.client == 'browser') {
            subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-bullseye"></i>', text: 'Copy url of node', onChange: () => {
                let params = window.location.search.uriToDict();
                params['node'] = metaviz.editor.selection.nodes[0].id;
                metaviz.editor.clipboard.set(location.protocol + '//' + location.host + location.pathname + '?' + dictToUri(params));
                this.hide();
            }}));
        }

        // ----
        subEditSelection.add(new MenuSeparator());

        // Arrange
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-th-large"></i>', text: 'Sort', onChange: () => {
            metaviz.editor.arrangeSort();
            this.hide();
        }}));
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-grip-horizontal"></i>', text: 'Align Horizontal', onChange: () => {
            metaviz.editor.arrangeHorizontal();
            this.hide();
        }}));
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-grip-vertical"></i>', text: 'Align Vertical', onChange: () => {
            metaviz.editor.arrangeVertical();
            this.hide();
        }}));
        subEditSelection.add(new MenuOption({ icon: '<i class="fa-solid fa-circle-chevron-up"></i>', text: 'Move to Foreground', onChange: () => {
            metaviz.editor.arrangeZ(1);
            this.hide();
        }}));
        subEditSelection.add(new MenuOption({ icon: '<i class="fa-solid fa-circle-chevron-down"></i>', text: 'Move to Background', onChange: () => {
            metaviz.editor.arrangeZ(-1);
            this.hide();
        }}));
        subEditSelection.add(new MenuOption({ icon: '<i class="fa-solid fa-arrows-to-dot"></i>', text: 'Reset Translations', onChange: () => {
            metaviz.editor.arrangeReset();
            this.hide();
        }}));

        // ----
        subEditSelection.add(new MenuSeparator());

        // Convert submenu
        /*
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-exchange-alt"></i>', text: 'Convert', onChange: () => {
            console.log('convert menu');
        }}));

        // ----
        subEditSelection.add(new MenuSeparator());
        */

        // Unanchor
        subEditSelection.add(new MenuOption({ icon: '<i class="fa-solid fa-anchor"></i>', text: 'Unanchor', onChange: () => {
            metaviz.editor.nodeUnanchorSelected();
            this.hide();
        }}));

        // Delete Node(s)
        subEditSelection.add(new MenuOption({ icon: '<i class="fas fa-trash-alt"></i>', text: 'Delete Node', onChange: () => {
            metaviz.editor.nodeDeleteSelected();
            this.hide();
        }}));

        // ----
        this.panel.left.add(new MenuSeparator());

        if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {
            // New
            this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-file"></i>', text: 'New', shortcut: [17, 78], onChange: () => {
                this.hide();
                let msg = 'Create new diagram?';
                if (metaviz.editor.history.dirty) msg += '\nUnsaved changes will be lost.';
                if (confirm(msg)) metaviz.editor.new();
            }}));

            // Open File
            this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-file-upload"></i>', text: 'Open File...', shortcut: [17, 79], onChange: () => {
                this.hide();
                metaviz.editor.open();
            }}));

            // Save
            this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-save"></i>', text: 'Save', shortcut: [17, 83], onChange: () => {
                this.hide();
                metaviz.editor.save();
            }}));

            // Export
            //this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-file-export"></i>', text: 'Export', shortcut: [17, 69], onChange: () => metaviz.editor.export() }));

            // ----
            this.panel.left.add(new MenuSeparator());
        }

        // Undo
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-undo"></i>', text: 'Undo', shortcut: [17, 90], onChange: () => {
            this.hide();
            metaviz.editor.history.undo();
        } }));

        // Redo
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-redo"></i>', text: 'Redo', shortcut: [17, 16, 90], onChange: () => {
            this.hide();
            metaviz.editor.history.redo();
        } }));

        // ----
        this.panel.left.add(new MenuSeparator());

        // Cut Copy Paste Duplicate
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-cut"></i>', text: 'Cut', shortcut: [17, 88], onChange: () => {
            metaviz.editor.cut();
            this.hide();
        }}));
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-copy"></i>', text: 'Copy', shortcut: [17, 67], onChange: () => {
            metaviz.editor.copy();
            this.hide();
        }}));
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-paste"></i>', text: 'Paste', shortcut: [17, 86], onChange: () => {
            metaviz.editor.paste();
            this.hide();
        }}));
        this.panel.left.add(new MenuOption({ icon: '<i class="fas fa-clone"></i>', text: 'Duplicate', shortcut: [17, 68], onChange: () => {
            metaviz.editor.duplicate();
            this.hide();
        }}));

        // ----
        this.panel.left.add(new MenuSeparator());

        // Toolbars
        let subToolbars = null;
        if (metaviz.agent.client != 'app' && metaviz.agent.server != 'wordpress') {
            subToolbars = new SubMenu({ text: 'Toolbars' });
            this.panel.left.add(subToolbars);
            subToolbars.add(new MenuGroup({ text: 'Add a toolbar', widgets: [

                // Add a toolbar: System
                new MenuOption({ icon: '<i class="fas fa-info-circle"></i>', text: 'System', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top', 0);
                    if (spot) {
                        const toolbar = new MetavizToolbarSystem(spot);
                        metaviz.config.toolbars.save('system', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Outliner
                new MenuOption({ icon: '<i class="fas fa-stream"></i>', text: 'Outliner', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('left', 0);
                    if (spot) {
                        const toolbar = new MetavizToolbarOutliner(spot);
                        metaviz.config.toolbars.save('outliner', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Search
                new MenuOption({ icon: '<i class="fa-solid fa-magnifying-glass"></i>', text: 'Search', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('left', 0);
                    if (spot) {
                        const toolbar = new MetavizToolbarSearch(spot);
                        metaviz.config.toolbars.save('search', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Navigation
                new MenuOption({ icon: '<i class="far fa-compass"></i>', text: 'Navigation', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top');
                    if (spot) {
                        const toolbar = new MetavizToolbarNavi(spot);
                        metaviz.config.toolbars.save('navi', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Video Call
                new MenuOption({ icon: '<i class="fas fa-video"></i>', text: 'Video Call', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top');
                    if (spot) {
                        const toolbar = new MetavizToolbarVideoCall(spot);
                        metaviz.config.toolbars.save('videocall', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Global chat
                new MenuOption({ icon: '<i class="fas fa-comment-alt"></i>', text: 'Global chat', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('left');
                    if (spot) {
                        const toolbar = new MetavizToolbarChat(spot);
                        metaviz.config.toolbars.save('chat', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Nodes
                new MenuOption({ icon: '<i class="fas fa-project-diagram"></i>', text: 'Nodes', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top');
                    if (spot) {
                        const toolbar = new MetavizToolbarNodes(spot);
                        metaviz.config.toolbars.save('nodes', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Templates
                new MenuOption({ icon: '<i class="fas fa-heart"></i>', text: 'Templates', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top');
                    if (spot) {
                        const toolbar = new MetavizToolbarTemplates(spot);
                        metaviz.config.toolbars.save('templates', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Shortcuts
                new MenuOption({ icon: '<i class="fas fa-external-link-square-alt"></i>', text: 'Shortcuts', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('top');
                    if (spot) {
                        const toolbar = new MetavizToolbarShortcuts(spot);
                        metaviz.config.toolbars.save('shortcuts', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Clipboard
                new MenuOption({ icon: '<i class="fas fa-clipboard"></i>', text: 'Clipboard', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('right');
                    if (spot) {
                        const toolbar = new MetavizToolbarClipboard(spot);
                        metaviz.config.toolbars.save('clipboard', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: History
                new MenuOption({ icon: '<i class="fas fa-history"></i>', text: 'History', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('right');
                    if (spot) {
                        const toolbar = new MetavizToolbarHistory(spot);
                        metaviz.config.toolbars.save('history', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Media
                new MenuOption({ icon: '<i class="fas fa-photo-video"></i>', text: 'Media', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('bottom');
                    if (spot) {
                        const toolbar = new MetavizToolbarMedia(spot);
                        metaviz.config.toolbars.save('media', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

                // Add a toolbar: Toolbar of toolbars
                new MenuOption({ icon: '<i class="fas fa-crown"></i>', text: 'Toolbar of Toolbars', onChange: () => {
                    const spot = metaviz.editor.dock.spots.findEmpty('left', 0);
                    if (spot) {
                        const toolbar = new MetavizToolbarToolbars(spot);
                        metaviz.config.toolbars.save('toolbars', spot.dataset.side, spot.dataset.row, spot.dataset.spotIndex);
                    }
                }}),

            ] }));

            const spots = metaviz.config.toolbars.load();

            subToolbars.add(new MenuGroup({ text: 'Options', widgets: [

                // Auto hide top
                new MenuSwitch({ text: 'Auto Hide Top', value: spots.top.autohide, onChange: (value) => {
                    metaviz.editor.dock.autoHide('top', value);
                    metaviz.config.toolbars.autoHide('top', value);
                }}),

                // Auto hide bottom
                new MenuSwitch({ text: 'Auto Hide Bottom', value: spots.bottom.autohide, onChange: (value) => {
                    metaviz.editor.dock.autoHide('bottom', value);
                    metaviz.config.toolbars.autoHide('bottom', value);
                }}),

                // Auto hide left
                new MenuSwitch({ text: 'Auto Hide Left', value: spots.left.autohide, onChange: (value) => {
                    metaviz.editor.dock.autoHide('left', value);
                    metaviz.config.toolbars.autoHide('left', value);
                }}),

                // Auto hide right
                new MenuSwitch({ text: 'Auto Hide Right', value: spots.right.autohide, onChange: (value) => {
                    metaviz.editor.dock.autoHide('right', value);
                    metaviz.config.toolbars.autoHide('right', value);
                }}),

            ] }));

        } // Toolbar

        // Project Settings
        let subSettings = null;
        if (metaviz.agent.client != 'app') {
            subSettings = new SubMenu({ text: 'Settings' });
            this.panel.left.add(subSettings);
            subSettings.add(new MenuGroup({ text: 'Project settings', widgets: [
                // Project name
                new MenuInput({ id: 'metaviz-menu-project-name', placeholder: 'Project name', value: projectName, onChange: (event) => {
                    // Undo/Sync
                    metaviz.editor.history.store({action: 'board', name: event.target.value, namePrev: metaviz.editor.getBoardName()});
                    // Set new name
                    metaviz.editor.setBoardName(event.target.value);
                }}),
            ] }));

            // On update project name
            metaviz.events.listen('update:projectname', (event) => {
                const menuInput = this.panel.left.find('metaviz-menu-project-name');
                if (menuInput) menuInput.set(event.detail);
            }, false);

            // ----
            subSettings.add(new MenuSeparator());

            // Browser Settings
            subSettings.add(new MenuGroup({ text: 'Local settings', widgets: [
            ] }));

            // Naviagtion
            subSettings.add(new MenuGroup({ text: 'Naviagtion', widgets: [

                // Swipe
                new MenuSelect({
                    placeholder: 'Primal pointer device',
                    options: {'pan': {'icon': '', text: 'Moving: Touchpad-centric'}, 'zoom': {icon: '', text: 'Moving: Mouse-centric'}},
                    value: metaviz.config.touchpad.swipe.get(),
                    onChange: (value) => {
                        metaviz.config.touchpad.swipe.set(value);
                        metaviz.config.save();
                        metaviz.editor.restartViewerMouseEvents();
                    }
                }),

                // Desktop Click
                new MenuSelect({
                    placeholder: 'Click on desktop',
                    options: {'pan': {'icon': '', text: 'Click on desktop: Pan view'}, 'box': {icon: '', text: 'Click on desktop: Selection'}},
                    value: metaviz.config.pointer.desktop.get(),
                    onChange: (value) => {
                        metaviz.config.pointer.desktop.set(value);
                        metaviz.config.save();
                    }
                }),

            ] }));

            // Helpers
            subSettings.add(new MenuGroup({ text: 'Helpers', widgets: [

                // Auto-Align
                new MenuSwitch({ text: 'Auto-Align', value: metaviz.config.snap.grid.enabled, onChange: (value) => {
                    metaviz.config.snap.grid.enabled = value;
                    metaviz.config.save();
                }}),

            ] }));

            // Look & feel
            subSettings.add(new MenuGroup({ text: 'Look & feel', widgets: [

                new MenuSelect({
                    placeholder: 'Select color theme',
                    options: {'Iron': {icon: '', text: 'Theme: Iron'}, 'Covellite': {icon: '', text: 'Theme: Covellite'}},
                    value: metaviz.config.theme.get(),
                    onChange: (value) => {
                        for (const [key, theme] of Object.entries(registry.themes[value])) {
                            document.documentElement.style.setProperty(key, theme);
                        }
                        metaviz.config.theme.set(value);
                        metaviz.config.save();
                    }
                }),

            ] }));

            // Notifications
            subSettings.add(new MenuGroup({ text: 'Notifications', widgets: [

                // Allow system notifications
                new MenuOption({
                    icon: '<i class="fa-solid fa-unlock-keyhole"></i>',
                    text: 'Allow notifications',
                    onChange: () => {
                        Notification.requestPermission().then((result) => {
                        });
                    }
                }),

                // Style of notification
                new MenuSelect({
                    placeholder: 'Text on notification box',
                    options: {
                        'sound': {icon: '', text: 'Play sound only'},
                        'minimal': {icon: '', text: 'Display notification'},
                        'user': {icon: '', text: 'Notification with user name'},
                        'message': {icon: '', text: 'Notification with message'}
                    },
                    value: metaviz.config.notifications.get(),
                    onChange: (value) => {
                        metaviz.config.notifications.set(value);
                        metaviz.config.save();
                    }
                }),

            ] }));

        } // Project Settings

        // Help selection
        const subHelp = new SubMenu({ text: 'Help' });
        this.panel.left.add(subHelp);
        subHelp.add(new MenuGroup({ text: `Metaviz ${metaviz.version}`, widgets: [
            // Help: Keyboard shortcuts
            new MenuOption({ icon: '<i class="fas fa-keyboard"></i>', text: 'Keyboard shortcuts', onChange: () => console.log('Keyboard shortcuts') }),

            // Help: Documentation
            new MenuOption({ icon: '<i class="fas fa-book"></i>', text: 'Documentation', onChange: () => console.log('Documentation') }),

            // Help: Changelog
            new MenuOption({ icon: '<i class="fas fa-list"></i>', text: 'Changelog', onChange: () => console.log('Changelog') }),

            // Help: Submit bug
            new MenuOption({ icon: '<i class="fas fa-bug"></i>', text: 'Submit bug', onChange: () => console.log('Submit bug') }),

            // Help: About
            new MenuOption({ icon: '<i class="fas fa-question-circle"></i>', text: 'About', onChange: () => console.log('About') })
        ] }));

        // Simulate scroll event
        this.element.addEventListener('scroll', (event) => {
            this.subAddNode.panel.scroll(0, this.subAddNode.panel.scrollTop - event.detail);
            subEditSelection.panel.scroll(0, subEditSelection.panel.scrollTop - event.detail);
            subNavigation.panel.scroll(0, subNavigation.panel.scrollTop - event.detail);
            if (subToolbars) subToolbars.panel.scroll(0, subToolbars.panel.scrollTop - event.detail);
            if (subSettings) subSettings.panel.scroll(0, subSettings.panel.scrollTop - event.detail);
            subHelp.panel.scroll(0, subHelp.panel.scrollTop - event.detail);
        });

    }

    /**
     * Generate nodes list
     */

    generateNodesList() {
        const menuAddNode = {'Default Nodes': []};
        for (const [className, args] of Object.entries(registry.nodes)) {
            const menuName = (('menu' in args) ? args.menu : 'Default Nodes');
            if (!(menuName in menuAddNode)) menuAddNode[menuName] = [];
            menuAddNode[menuName].push(new MenuOption({
                id: `metaviz-menu-node-${args.name.slug()}`,
                icon: args.icon || '<i class="fas fa-atom"></i>',
                text: args.name,
                onChange: () => {
                    metaviz.editor.nodeAdd(className, this.position('first click'));
                    this.hide();
                }
            }));
        }
        for (const [menuName, menuNodes] of Object.entries(menuAddNode)) {
            this.subAddNode.add(new MenuGroup({ text: menuName, widgets: menuNodes }));
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
     */

    show(event, editor) {

        // Not when overlay is visible or locked
        if (!editor.interaction.locked && !editor.popup.visible) {

            // Prevent default context menu
            event.preventDefault();
            event.stopPropagation();

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
            
            // Cancel cage
            //editor.cage.resizeCancel();
            //editor.cage.hide();

            // Disable all options
            this.panel.left.deselect();
            this.panel.left.disable();

            // If node is pointed then open Edit Selection section
            const clicked = metaviz.render.nodes.get(event.target);
            if (clicked) {
                editor.interaction.object = 'node';
                editor.selection.set(clicked);
            }
            // Clear selection if clicked on board background
            else {
                editor.selection.clear();
            }

            // Cancel piemenu
            for (const node of editor.selection.get()) {
                node.piemenu?.hide();
            }

            // Enable Add node (only for no selection)
            if (editor.selection.count() == 0) {
                this.panel.left.find('metaviz-menu-add-node')?.enable().select();
            }

            // Activate Edit Selection (only for 1+ node)
            if (editor.selection.count() > 0) {

                // Enable Edit Selection
                this.panel.left.find('metaviz-menu-edit-selection')?.enable();

                // Activate
                this.panel.left.find('metaviz-menu-edit-selection')?.select();

                // Node Menu Options {options: [MenuOption, ...], localOptions: [MenuOption, ...]}
                const data = editor.selection.getFocused().menu();
                // Node options
                const options = this.panel.left.find('metaviz-menu-node-options');
                options.del();
                options.hide();
                // Node local options
                const localOptions = this.panel.left.find('metaviz-menu-node-local-options');
                localOptions.del();
                localOptions.hide();
                // Show options (only for 1 node)
                if (editor.selection.count() == 1) {
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
                        options.add(new MenuOption({ icon: '<i class="fas fa-window-close"></i>', text: 'No options', disabled: true}));
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

            } // Edit Selection

            // Lock
            if (editor.selection.count() > 0) {
                if (metaviz.editor.selection.getFocused().locked) {
                    this.panel.left.find('metaviz-menu-lock')?.setIcon('<i class="fa-solid fa-lock"></i>').setName('Locked');
                }
                else {
                    this.panel.left.find('metaviz-menu-lock')?.setIcon('<i class="fa-solid fa-lock-open"></i>').setName('Unlocked');
                }
            }

            // Arrange
            if (editor.selection.count() > 1) {
                this.panel.left.find('metaviz-menu-sort')?.enable();
                this.panel.left.find('metaviz-menu-align-horizontal')?.enable();
                this.panel.left.find('metaviz-menu-align-vertical')?.enable();
            }
            else {
                this.panel.left.find('metaviz-menu-sort')?.disable();
                this.panel.left.find('metaviz-menu-align-horizontal')?.disable();
                this.panel.left.find('metaviz-menu-align-vertical')?.disable();
            }

            // Unanchor
            if (editor.selection.count() == 1 && editor.selection.getFocused().parentNode?.element.hasClass('metaviz-anchor')) this.panel.left.find('metaviz-menu-unanchor')?.enable();
            else this.panel.left.find('metaviz-menu-unanchor')?.disable();

            // Link / Unlink (only for two)
            if (editor.selection.count() == 2) {
                // Unlink
                if (metaviz.render.links.get(editor.selection.nodes[0], editor.selection.nodes[1])) {
                    this.panel.left.find('metaviz-menu-link')?.enable().setIcon('<i class="fas fa-unlink"></i>').setName('Unlink');
                }
                // Link
                else {
                    this.panel.left.find('metaviz-menu-link')?.enable().setIcon('<i class="fas fa-link"></i>').setName('Link');
                }
            }
            // Inactive
            else if (editor.selection.count() != 2) {
                this.panel.left.find('metaviz-menu-link')?.disable();
            }

            // Delete Node(s)
            this.panel.left.find('metaviz-menu-delete-node')?.setName(`Delete Node${(editor.selection.count() > 1 ? 's' : '')} (${editor.selection.count()})`);

            // File functions
            if (metaviz.agent.data == 'local' && metaviz.agent.db == 'file') {
                // Enable New
                this.panel.left.find('metaviz-menu-new')?.enable();

                // Enable Open File...
                this.panel.left.find('metaviz-menu-open-file')?.enable();

                // Enable Save/Export
                if (editor.history.dirty) {
                    this.panel.left.find('metaviz-menu-save')?.enable();
                }
            }

            // Enable Undo/Redo
            if (editor.history.hasUndo()) this.panel.left.find('metaviz-menu-undo')?.enable();
            if (editor.history.hasRedo()) this.panel.left.find('metaviz-menu-redo')?.enable();
            
            // Enable Cut/Copy/Paste/Duplicate
            if (editor.selection.count() > 0) {
                this.panel.left.find('metaviz-menu-cut')?.enable();
                this.panel.left.find('metaviz-menu-copy')?.enable();
                this.panel.left.find('metaviz-menu-duplicate')?.enable();
            }
            else if (editor.clipboard.count() > 0) {
                this.panel.left.find('metaviz-menu-paste')?.enable();
            }

            // Enable Navigation (always)
            this.panel.left.find('metaviz-menu-navigation')?.enable();

            // Enable Toolbar (always)
            this.panel.left.find('metaviz-menu-toolbars')?.enable();

            // Enable Project settings (always)
            this.panel.left.find('metaviz-menu-settings')?.enable();

            // Enable Help (always)
            this.panel.left.find('metaviz-menu-help')?.enable();

            // Show menu at pointer coords
            const container = metaviz.container.getOffset();
            super.show({left: event.clientX - container.x, top: event.clientY - container.y});
        }
    }

    /**
     * Hide context menu
     */

    hide() {
        super.hide();

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

}
