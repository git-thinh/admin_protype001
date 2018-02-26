function manager_userCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _hideMobile = $rootScope.device != 'mobile';

    var _field_grid = [
                { field: 'username', caption: lang.user.username, size: '30%' },
                { field: 'password', caption: lang.user.password, hidden: true },
                { field: 'fullname', caption: lang.user.fullname, size: '40%' },
                { field: 'system', caption: lang.user.system, size: '30%' },
    ];
    var _field_form_add = [
        { field: 'username', type: 'text', required: true, html: { caption: lang.user.username, attr: '' } },
        { field: 'password', type: 'password', required: true, html: { caption: lang.user.password } },
        { field: 'fullname', type: 'text', required: true, html: { caption: lang.user.fullname } },
        { field: 'system', type: 'text', required: true, html: { caption: lang.user.system } },
    ];
    var _field_form_edit = [
        { field: 'username', type: 'text', required: true, html: { caption: lang.user.username, attr: '' } },
        { field: 'password', type: 'password', required: true, html: { caption: lang.user.password } },
        { field: 'fullname', type: 'text', required: true, html: { caption: lang.user.fullname } },
        { field: 'system', type: 'text', required: true, html: { caption: lang.user.system } },
    ];

    var _kit_grid = 'grid_user';
    $rootScope.regKit(moduleID, _kit_grid);

    /***************************************************/

    var m_listData = JSON.parse(localStorage['user.json']);

    /***************************************************/
    /* EVENT */

    $scope.toolbarClick = function (event) {
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
            case 'save':
                w2confirm(lang.ui.confirm_save)
                   .yes(function () {
                       $scope.submit();
                   }).no(function () { });
                break;
            case 'close':
                w2confirm(lang.ui.confirm_close)
                   .yes(function () {
                       API.module_Close(moduleID);
                   }).no(function () { });
                break;
        }
    };

    /***************************************************/

    if (w2ui[_kit_grid] != null) w2ui[_kit_grid].destroy();
    $().w2grid({
        name: _kit_grid,
        show: {
            toolbar: true,
            footer: true,
            toolbarSearch: false,
            toolbarInput: false,
            lineNumbers: true,
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
                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { type: 'spacer' },
                { id: 'save', type: 'button', caption: lang.ui.save, icon: 'fa fa-save', checked: true },
                { id: 'close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                scope(module.id).toolbarClick(event);
            }
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    });

    /***************************************************/

    $scope.bindData = function () {
        if (w2ui[_kit_grid] != null) {
            w2ui[_kit_grid].clear();
            w2ui[_kit_grid].records = m_listData;
            w2ui[_kit_grid].total = m_listData.length;
            w2ui[_kit_grid].refresh();
        }
    };

    $scope.submit = function () {
        console.log('SUBMIT = ', m_listData);
        var file = 'user.json';
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

    $scope.callback = function (data) {
        console.log('callback = ', data);
        var item = data['item'];
        var type = data['type'];
        if (item == null || item.length == 0) return;
        switch (type) {
            case 'add':
                var recid = (_.max(m_listData, function (it) { return it.recid; }))['recid'] + 1;
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
                var keys = _.pluck(item, 'recid');
                m_listData = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });

                console.log('REMOVE = ', keys);
                console.log('REMOVE = ', m_listData);

                $scope.bindData();
                break;
        }
    };

    API.module_Render(moduleID, _kit_grid);
}