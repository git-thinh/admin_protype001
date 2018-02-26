function manager_replyCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _hideMobile = $rootScope.device != 'mobile';

    var _field_grid = [
                { field: 'recid', hidden: true },
                { field: 'phone', caption: lang.reply.phone, size: '77px' },
                { field: 'fullname', caption: lang.reply.fullname, size: '100px' },
                { field: 'note', caption: lang.reply.note, size: '70%' },
                { field: 'time', caption: lang.reply.time, size: '88px' },
    ];
    var _field_form_add = [
        { field: 'phone', type: 'text', required: true, html: { caption: lang.reply.phone  } },
        { field: 'fullname', type: 'text', required: true, html: { caption: lang.reply.fullname  } },
        { field: 'note', type: 'textarea', required: true, html: { caption: lang.reply.note } },
    ];
    var _field_form_edit = [
        { field: 'phone', type: 'text', required: true, html: { caption: lang.reply.phone, attr: ' readonly="readonly" ' } },
        { field: 'fullname', type: 'text', required: true, html: { caption: lang.reply.fullname, attr: ' readonly="readonly" ' } },
        { field: 'note', type: 'textarea', required: true, html: { caption: lang.reply.note, attr: ' readonly="readonly" ' } },
    ];

    var _kit_grid = 'grid_reply';
    $rootScope.regKit(moduleID, _kit_grid);

    /***************************************************/

    var m_listData = JSON.parse(localStorage['reply.json']);

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
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
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
        var file = 'reply.json';
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