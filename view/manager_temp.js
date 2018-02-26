function manager_tempCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _hideMobile = $rootScope.device != 'mobile';

    var _field_grid = [
                { field: 'name', caption: 'Tag', size: '100%' },
    ];
    var _field_form_add = [
        { field: 'name', type: 'text', required: true, html: { caption: 'Tag', attr: '' } },
    ];
    var _field_form_edit = [
        { field: 'name', type: 'text', required: true, html: { caption: 'Tag', attr: '' } },
    ];

    var _kit_layout = '_kit_layout_' + moduleID;
    $rootScope.regKit(moduleID, _kit_layout);
    var _kit_toolbar = 'toolbar_' + moduleID;
    $rootScope.regKit(moduleID, _kit_toolbar);
    var _kit_sidebar = 'sidebar_' + moduleID;
    $rootScope.regKit(moduleID, _kit_sidebar);

    var edit_template = null;
    var m_tag = null;

    /***************************************************/
    //#region FUNCTION

    $scope.close = function () {
        w2confirm('Bạn chắc chắn muốn thoát?')
           .yes(function () {
               API.module_Close(moduleID);
           }).no(function () { });
    }

    $scope.save = function () {
        if (m_tag == null || m_tag == '') return;

        var temp = edit_template.value;
        API.update_File(m_tag, temp, {
            ok: function (rs) {
                if (rs) {
                    var html = temp;

                    if (temp.indexOf('<%') != -1) {
                        var items = JSON.parse(localStorage['article.json']);
                        console.log('items = ', items);
                        html = _.template(temp, { variable: 'items' })(items);
                        //console.log('HTML = ', html);
                    }

                    API.update_Temp(m_tag, html, {
                        ok: function (rs) {
                            if (rs) {
                                localStorage[m_tag] = temp;
                                w2alert(lang.ui.update_success);
                            }
                        }
                    }); 
                }
            }
        });
    }

    /***************************************************/
    /* EVENT */

    $scope.toolbar_MainClick = function (event) {
        switch (event.target) {
            case 'save':
                scope(module.id).save();
                break;
            case 'close':
                scope(module.id).close();
                break;
        }
    }

    $scope.toolbarClick = function (event) {
        switch (event.target) {
            case 'add':
                API.module_Load({
                    code: _ADD,
                    backID: moduleID,
                    para: {
                        title: lang.ui.add_item,
                        property: { pid: 0 },
                        fields: _field_form_add,
                        validate: function (data) {
                            var val = data['name'];
                            if (val == null || val.length > val.replace(/[^\x20-\x7E]+/g, '').length) {
                                w2alert('Vui lòng nhập giá trị không dấu');
                                return false;
                            }
                            return true;
                        }
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
                        validate: function (data) {
                            var val = data['name'];
                            if (val == null || val.length > val.replace(/[^\x20-\x7E]+/g, '').length) {
                                w2alert('Vui lòng nhập giá trị không dấu');
                                return false;
                            }
                            return true;
                        }
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

    if (w2ui[_kit_layout] != null) w2ui[_kit_layout].destroy();
    $().w2layout({
        name: _kit_layout,
        padding: 0,
        panels: [
            { type: 'top', size: 32, content: '', style: '' },
            { type: 'left', size: 99, resizable: false },
            { type: 'main', minSize: 350, overflow: 'hidden', content: '<textarea id="edit_template"></textarea>' }
        ]
    });

    if (w2ui[_kit_toolbar] != null) w2ui[_kit_toolbar].destroy();
    $().w2toolbar({
        name: _kit_toolbar,
        items:
            [
                { type: 'html', html: '<div id="folder_title" style="padding: 3px 10px;">[ EDIT TEMP ]</div>' },
                { type: 'spacer' },
                { id: 'save', type: 'button', caption: 'Save', icon: 'fa fa-save', checked: true },
                { id: 'close', type: 'button', caption: 'Close', icon: 'fa fa-close', checked: true },
            ],
        onClick: function (event) {
            scope(module.id).toolbar_MainClick(event);
        }
    });


    var m_listTag = [];
    var aTag = JSON.parse(localStorage['tag.json']);
    aTag.forEach(function (it) { m_listTag.push({ id: it.name, text: it.name }); });

    if (w2ui[_kit_sidebar] != null) w2ui[_kit_sidebar].destroy();
    $().w2sidebar({
        name: _kit_sidebar,
        nodes: m_listTag,
        onClick: function (event) {
            m_tag = event.target + '.htm';
            var htm = localStorage[m_tag];
            if (htm == null || htm == undefined || htm == 'undefined') html = '';
            else htm = formatText(htm);
            edit_template.value = htm;
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
        var file = 'tag.json';
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
                item['recid'] = recid;
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

    API.module_Render(moduleID, _kit_layout, function () {
        edit_template = document.getElementById('edit_template');

        w2ui[_kit_layout].content('top', w2ui[_kit_toolbar]);
        w2ui[_kit_layout].content('left', w2ui[_kit_sidebar]);
    });
}