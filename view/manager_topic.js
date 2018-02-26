function manager_topicCtrl($rootScope, $scope, API) {
    /***************************************************/
    //#region VARIABLE 

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _hideMobile = $rootScope.device != 'mobile';
    var _title = lang.topic.header;
    if (module.mode == 'select')
        _title = lang.topic.select;

    var _field_grid = [
        { field: 'name', caption: lang.topic.name, size: '50%' },
        { field: 'link', caption: lang.topic.link, size: '50%' }
    ];
    var _field_form_add = [
        { field: 'pid', type: 'int', required: true, html: { caption: lang.topic.pid, attr: 'disabled' } },
        { field: 'name', type: 'text', required: true, html: { caption: lang.topic.name } },
        { field: 'link', type: 'text', required: true, html: { caption: lang.topic.link } }
    ];
    var _field_form_edit = [
        { field: 'pid', type: 'int', required: true, html: { caption: lang.topic.pid, attr: 'disabled' } },
        { field: 'name', type: 'text', required: true, html: { caption: lang.topic.name } },
        { field: 'link', type: 'text', required: true, html: { caption: lang.topic.link } }
    ];

    var _kit_grid = 'grid_' + moduleID;
    $rootScope.regKit(moduleID, _kit_grid);

    var m_listData = JSON.parse(localStorage['topic.json']);
    var m_objectSelect = {};

    //#endregion

    /***************************************************/
    //#region  FUNCTION 

    $scope.close = function () {
        if (module.mode == 'select') {
            API.module_Close(moduleID);
        } else {
            w2confirm('Bạn chắc chắn muốn thoát?')
               .yes(function () {
                   API.module_Close(moduleID);
               }).no(function () { });
        }
    }

    $scope.select_Post = function () {
        console.log('SELECT = ', m_objectSelect);

        if (module['backEvent'] != null)
            module['backEvent'](module, m_objectSelect);
        API.module_Close(moduleID);
    }

    $scope.bindData = function () {
        var mn_root = _.filter(m_listData, function (mn) { return mn.pid == 0; });
        if (mn_root == null || mn_root.length == 0) mn_root = [];
        if (w2ui[_kit_grid] != null) {
            w2ui[_kit_grid].clear();
            w2ui[_kit_grid].records = mn_root;
            w2ui[_kit_grid].total = mn_root.length;
            w2ui[_kit_grid].refresh();
        }
    };

    $scope.submit = function () {
        console.log('SUBMIT = ', m_listData);
        var file = 'topic.json';
        var data = JSON.stringify(m_listData);
        API.update_File(file, data, {
            ok: function (rs) {
                if (rs) {
                    localStorage[file] = data;
                    w2alert(lang.ui.update_success);
                }
            }
        });
    }

    //#endregion

    /***************************************************/
    //#region EVENT 

    $scope.toolbar_RootClick = function (event) {
        switch (event.target) {
            case 'add':
                API.module_Load({
                    code: _ADD,
                    backID: moduleID,
                    para: {
                        title: lang.ui.add_item,
                        property: { pid: 0 },
                        fields: _field_form_add
                    }
                });
                break;
            case 'edit':
                var itemSel = w2ui[_kit_grid].getSelection();
                if (itemSel.length != 1) {
                    w2alert(lang.ui.select_only_item);
                    return;
                }

                var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                console.log('edit = ', mn_edit);

                API.module_Load({
                    code: _EDIT,
                    backID: moduleID,
                    para: {
                        title: lang.ui.edit_item,
                        fields: _field_form_edit,
                        records: mn_edit[0],
                    }
                });
                break;
            case 'remove':
                var itemSel = w2ui[_kit_grid].getSelection();
                if (itemSel.length == 0) {
                    w2alert(lang.ui.select_only_item);
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.module_Load({
                    code: _REMOVE,
                    backID: moduleID,
                    para: {
                        title: lang.ui.confirm_remove,
                        fields: _field_grid,
                        records: mn_remove,
                    }
                });

                break;
            case 'select':
                scope(module.id).select_Post();
                break;
            case 'save':
                w2confirm(lang.ui.confirm_save)
                   .yes(function () {
                       scope(module.id).submit();
                   }).no(function () { });
                break;
            case 'close':
                scope(module.id).close();
                break;
        }
    }

    $scope.toolbar_SubClick = function (event, _kit_grid_sub, _pid) {
        switch (event.target) {
            case 'add':
                API.module_Load({
                    code: _ADD,
                    backID: moduleID,
                    para: {
                        title: lang.ui.add_item,
                        property: { pid: _pid },
                        fields: _field_form_add,
                    }
                });
                break;
            case 'edit':
                var itemSel = w2ui[_kit_grid_sub].getSelection();
                if (itemSel.length != 1) {
                    w2alert(lang.ui.select_only_item);
                    return;
                }
                var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                console.log('edit = ', mn_edit);

                API.module_Load({
                    code: _EDIT,
                    backID: moduleID,
                    para: {
                        title: lang.ui.edit_item,
                        fields: _field_form_edit,
                        records: mn_edit[0],
                    }
                });
                break;
            case 'remove':
                var itemSel = w2ui[_kit_grid_sub].getSelection();
                if (itemSel.length == 0) {
                    w2alert(lang.ui.select_only_item);
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.module_Load({
                    code: _REMOVE,
                    backID: moduleID,
                    para: {
                        title: lang.ui.confirm_remove,
                        fields: _field_grid,
                        records: mn_remove,
                    }
                });

                break;
        }
    }

    //#endregion

    /***************************************************/
    //#region VIEW 

    $().w2grid({
        name: _kit_grid,
        show: {
            toolbar: true,
            footer: true,
            toolbarSearch: false,
            toolbarInput: false,
            lineNumbers: _hideMobile,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: module.mode == 'select',
            columnHeaders: true,
        },
        multiSearch: false,
        multiSelect: module.mode == 'select',
        searches: [
            { field: 'name', caption: 'Tìm kiếm', type: 'text' },
        ],
        columns: _field_grid,
        records: [],
        toolbar: {
            items: [
                { id: 'search', type: 'button', caption: '', icon: 'fa fa-search', checked: true },
                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { type: 'spacer' },
                { id: 'select', type: 'button', caption: lang.ui.select, icon: 'fa fa-check', checked: true, hidden: (module.mode != 'select') },
                { id: 'save', type: 'button', caption: lang.ui.save, icon: 'fa fa-save', checked: true },
                { id: 'close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                scope(module.id).toolbar_RootClick(event);
            }
        },
        onExpand: function (event) {

            if (w2ui.hasOwnProperty('subgrid-' + event.recid)) w2ui['subgrid-' + event.recid].destroy();
            $('#' + event.box_id).css({ margin: '0px', padding: '0px', width: '100%' }).animate({ height: '205px' }, 100);

            setTimeout(function () {
                var _pid = event.recid;
                var _kit_grid_sub = 'subgrid-' + _pid;

                if (w2ui[_kit_grid_sub] != null) w2ui[_kit_grid_sub].destroy();

                var mn_sub = _.filter(m_listData, function (mn) { return mn.pid == _pid; });
                if (mn_sub == null || mn_sub.length == 0) mn_sub = [];

                $('#' + event.box_id)
                    .w2grid({
                        name: _kit_grid_sub,
                        show: {
                            toolbar: true,
                            footer: true,
                            toolbarSearch: false,
                            toolbarInput: false,
                            lineNumbers: _hideMobile,
                            toolbarReload: false,
                            toolbarColumns: false,
                            selectColumn: module.mode == 'select',
                            columnHeaders: true,
                        },
                        multiSearch: false,
                        multiSelect: module.mode == 'select',
                        fixedBody: true,
                        columns: _field_grid,
                        records: mn_sub,
                        toolbar: {
                            items: [
                                { type: 'spacer' },
                                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true }
                            ],
                            onClick: function (event) {
                                scope(module.id).toolbar_SubClick(event, _kit_grid_sub, _pid);
                            }
                        },
                        onSelect: function (event) {
                            var recid = parseInt(event.recid);
                            var itemSelect = _.filter(m_listData, function (mn) { return mn.recid == recid; });
                            m_objectSelect[recid] = itemSelect[0]['name'];
                            console.log('m_objectSelect = ', m_objectSelect);
                        },
                        onUnselect: function (event) {
                            var recid = parseInt(event.recid);
                            if (m_objectSelect[recid] != null) delete m_objectSelect[recid];
                            console.log('m_objectSelect = ', m_objectSelect);
                        }
                    });

                w2ui['subgrid-' + event.recid].resize();

            }, 300);
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    });

    //#endregion

    /***************************************************/
    //#region END MODULE

    $scope.callback = function (data) {
        console.log('callback = ', data);
        var item = data['item'];
        var type = data['type'];
        if (item == null || item.length == 0) return;
        switch (type) {
            case 'add':
                var recid = 0;
                if (m_listData.length == 0)
                    recid = 1;
                else
                    recid = (_.max(m_listData, function (it) { return it.recid; }))['recid'] + 1;

                var pid = parseInt(item['pid']);
                item['recid'] = recid;
                item['pid'] = pid;
                m_listData.push(item);

                $scope.bindData();

                console.log('ADD item = ', item);
                console.log('ADD = ', m_listData);
                break;
            case 'edit':
                var aNew = [];
                for (var i = 0; i < m_listData.length; i++) {
                    if (item['recid'] == m_listData[i]['recid'])
                        aNew.push(item);
                    else
                        aNew.push(m_listData[i]);
                }
                m_listData = aNew;

                $scope.bindData();
                break;
            case 'remove':
                var pid = item[0]['pid'];
                var keys = _.pluck(item, 'recid');
                console.log('REMOVE = ', keys);
                console.log('REMOVE pid = ', pid);

                var rs = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });
                m_listData = _.filter(rs, function (mn) { return keys.indexOf(mn.pid) == -1; });

                console.log('REMOVE = ', m_listData);

                $scope.bindData();
                break;
        }
    };

    API.module_Render(moduleID, _kit_grid);

    //#endregion
}