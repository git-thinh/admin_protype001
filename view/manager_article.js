function manager_articleCtrl($rootScope, $scope, $controller, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _isMobile = $rootScope.device == 'mobile';
    console.log('$rootScope.device = ', $rootScope.device);
    console.log('_isMobile = ', _isMobile);

    var _lookupID_selectImage = $rootScope.lookupID({
        code: 'manager_image',
        backID: module.id,
        backEvent: function (v_module, v_value) {
            var arrayPhoto = [];
            for (var propertyName in v_value)
                arrayPhoto.push(v_value[propertyName]);
            var data = arrayPhoto.join(';');

            var backTarget = v_module['backTarget'];
            backTarget.value = data;

            //console.log('_lookupID_selectImage module = ', v_module);
            //console.log('_lookupID_selectImage data = ',data);

            API.module_Close(v_module.id);
        },
        para: {
            title: lang.image.select,
            fields: []
        }
    });
    $rootScope.regKit(moduleID, _lookupID_selectImage);


    var _lookupID_selectTopic = $rootScope.lookupID({
        code: 'manager_topic',
        backID: module.id,
        backEvent: function (v_module, v_value) {
            var arrayID = [];
            var arrayName = [];
            for (var key in v_value) {
                arrayID.push(key);
                arrayName.push(v_value[key]);
            }
            var ids = arrayID.join(';');
            var name = arrayName.join(';');

            var backTarget = v_module['backTarget'];
            backTarget.value = name;

            console.log('_lookupID_selectTopic name = ', name);
            console.log('_lookupID_selectTopic v_module = ', v_module);
            console.log('_lookupID_selectTopic v_value = ', v_value);

            API.module_Close(v_module.id);
        },
        para: {
            title: lang.topic.select,
            fields: []
        }
    });
    $rootScope.regKit(moduleID, _lookupID_selectTopic);


    //$rootScope.regKit(moduleID, _lookupID_selectImage);
    var _kit_grid = 'grid_' + moduleID;
    $rootScope.regKit(moduleID, _kit_grid);

    var _field_grid = [
                { field: 'recid', caption: lang.article.recid, hidden: true },
                { field: 'url', caption: lang.article.url, hidden: true },
                { field: 'title', caption: lang.article.title, size: '90%' },
                { field: 'tag', caption: lang.article.tag, size: '300px', hidden: _isMobile },
                { field: 'active', caption: lang.article.ok, size: '33px', editable: { type: 'checkbox', style: 'text-align: center;pointer-events: none;' } },
                { field: 'image', caption: lang.article.image, hidden: true },
                { field: 'image_position', caption: lang.article.image_position, hidden: true },
                { field: 'keyword', caption: lang.article.keyword, hidden: true },
                { field: 'content', caption: lang.article.content, hidden: true },
                { field: 'order', caption: 'order', hidden: true },
    ];
    var _field_form_add = [
        { field: 'active', type: 'checkbox', html: { caption: lang.article.active, attr: '' } },
        { field: 'recid', type: 'int', html: { caption: lang.article.recid, attr: ' readonly="readonly" ' }, hidden: true },
        { field: 'url', type: 'text', html: { caption: lang.article.url, attr: ' readonly="readonly" ' }, hidden: true },
        { field: 'title', type: 'text', required: true, html: { caption: lang.article.title, attr: '' } },
        {
            field: 'topic', type: 'text', html:
              { caption: lang.article.topic, attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectTopic + '\', event)" ' }
        },
        {
            field: 'image', type: 'text', html: {
                caption: lang.article.image, attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectImage + '\', event)" '
            }
        },
        {
            field: 'image_position', type: 'select', html: { caption: lang.article.image_position, attr: '' },
            options: {
                items: [{ id: 0, text: 'Đầu bài viết' }, { id: 1, text: 'Ngẫu nhiên' }, { id: 2, text: 'Cuối bài viết' }],
            },
        },
        { field: 'tag', type: 'text', html: { caption: lang.article.tag, attr: '' } },
        { field: 'order', type: 'int', html: { caption: 'Order', attr: '' } },
        { field: 'keyword', type: 'textarea', html: { caption: lang.article.keyword, attr: '' } },
        { field: 'content', type: 'textarea', required: true, html: { caption: lang.article.content, attr: '' } },
    ];
    var _field_form_edit = [
        { field: 'active', type: 'checkbox', html: { caption: lang.article.active, attr: '' } },
        { field: 'recid', type: 'int', html: { caption: lang.article.recid, attr: ' readonly="readonly" ' }, hidden: true },
        { field: 'url', type: 'text', html: { caption: lang.article.url, attr: ' readonly="readonly" ' } },
        { field: 'title', type: 'text', required: true, html: { caption: lang.article.title, attr: '' } },
        {
            field: 'topic', type: 'text', html:
              { caption: lang.article.topic, attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectTopic + '\', event)" ' }
        },
        {
            field: 'image', type: 'text', html: {
                caption: lang.article.image, attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectImage + '\', event)" '
            }
        },
        {
            field: 'image_position', type: 'select', html: { caption: lang.article.image_position, attr: '' },
            options: {
                items: [{ id: 0, text: 'Đầu bài viết' }, { id: 1, text: 'Ngẫu nhiên' }, { id: 2, text: 'Cuối bài viết' }],
            },
        },
        { field: 'tag', type: 'text', html: { caption: lang.article.tag, attr: '' } },
        { field: 'order', type: 'int', html: { caption: 'Order', attr: '' } },
        { field: 'keyword', type: 'textarea', html: { caption: lang.article.keyword, attr: '' } },
        { field: 'content', type: 'textarea', required: true, html: { caption: lang.article.content, attr: '' } },
    ];

    var sListData = localStorage['article.json'];
    //console.log('sListData = ', sListData);
    var m_listData = JSON.parse(sListData);
    //console.log('m_listData = ', m_listData);

    var _config_grid = {
        name: _kit_grid,
        show: {
            toolbar: true,
            footer: true,
            lineNumbers: true,
            toolbarSearch: false,
            toolbarInput: false,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: module.mode == 'select',
            columnHeaders: true,
        },
        multiSearch: false,
        multiSelect: module.mode == 'select',
        columns: _field_grid,
        records: [],
        toolbar: {
            items: [
                { id: 'search', type: 'button', caption: '', icon: 'fa fa-search', checked: true },
                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { id: 'link', type: 'button', caption: '', icon: 'fa fa-link', checked: true },
                { type: 'spacer' },
                { id: 'close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                scope(module.id).toolbarClick(event);
            },
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    };

    if (module.mode == 'select')
        _config_grid = {
            name: _kit_grid,
            header: lang.article.header,
            show: {
                header: true,
                toolbar: true,
                footer: true,
                lineNumbers: true,
                toolbarSearch: false,
                toolbarInput: false,
                toolbarReload: false,
                toolbarColumns: false,
                selectColumn: module.mode == 'select',
                columnHeaders: true,
            },
            multiSearch: false,
            multiSelect: module.mode == 'select',
            columns: _field_grid,
            records: [],
            toolbar: {
                items: [
                    { id: 'search', type: 'button', caption: '', icon: 'fa fa-search', checked: true },
                    { type: 'spacer' },
                    { id: 'select', type: 'button', caption: lang.ui.select, icon: 'fa fa-save', checked: true },
                    { id: 'close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
                ],
                onClick: function (event) {
                    scope(module.id).toolbarClick(event);
                },
            },
            onRender: function (event) {
                event.onComplete = function () {
                    $scope.bindData();
                }
            }
        };

    /***************************************************/
    /* FUNCTION */

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
    }

    /***************************************************/
    /* EVENT */

    $scope.toolbarClick = function (event) {
        switch (event.target) {
            case 'search':
                break;
            case 'add':
                API.module_Load({
                    code: _ADD,
                    backID: module.id,
                    para:
                    {
                        title: 'Thêm mới bài viết',
                        property: { pid: 0 },
                        fields: _field_form_add,
                        config: {
                            record: {
                                image_position: 1
                            },
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

                var sitem = localStorage[itemSel[0]];
                if (sitem == null)
                    w2alert(lang.ui.can_not_find);
                else {
                    sitem = sitem.split('∆').join('\\r')
                    var it_edit = JSON.parse(sitem);
                    console.log('edit item = ', it_edit);

                    API.module_Load({
                        code: _EDIT,
                        backID: module.id,
                        para:
                        {
                            title: lang.article.edit,
                            property: { pid: 0 },
                            fields: _field_form_edit,
                            records: it_edit,
                            config: {
                                record: {
                                    image_position: 1
                                },
                            }
                        }
                    });
                }
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
                    backID: module.id,
                    para: {
                        title: lang.ui.confirm_remove,
                        fields: _field_grid,
                        records: mn_remove,
                    }
                });
                break;
            case 'link':
                var itemSel = w2ui[_kit_grid].getSelection();
                if (itemSel.length == 0) {
                    w2alert(lang.ui.select_only_item);
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                var link = document.getElementById('link');
                link.href = mn_remove[0].url;
                link.click();

                break;
            case 'select':
                API.module_Callback(module.backID, { type: 'select', item: m_listData });
                scope(module.id).close();
                break;
            case 'close':
                scope(module.id).close();
                break;
        }
    };

    /***************************************************/
    /* VIEW */

    $().w2grid(_config_grid);

    /***************************************************/
    /* END MODULE */

    $scope.callback = function (data) {
        console.log('callback = ', data);
        var item = data['item'];
        var type = data['type'];
        if (item == null || item.length == 0) return;
        switch (type) {
            case 'add':
                API.add_update_Article(item, _field_form_add, {
                    ok: function (rs) {
                        var obj = JSON.parse(rs);
                        console.log('RESUL = ', obj);
                        localStorage['article.json'] = JSON.stringify(obj['list']);
                        localStorage[obj.item.recid] = JSON.stringify(obj.item);
                        m_listData = obj['list'];
                        $scope.bindData();
                    }
                });
                break;
            case 'edit':
                API.add_update_Article(item, _field_form_edit, {
                    ok: function (rs) {
                        var obj = JSON.parse(rs);
                        console.log('RESUL = ', obj);
                        localStorage['article.json'] = JSON.stringify(obj['list']);
                        localStorage[obj.item.recid] = JSON.stringify(obj.item);
                        m_listData = obj['list'];
                        $scope.bindData();
                    }
                });

                break;
            case 'remove':
                var keys = _.pluck(item, 'recid');
                //m_listData = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });
                if (keys.length > 0) {
                    var key = keys[0];
                    console.log('REMOVE = ', key);
                    API.delete_Article(key, {
                        ok: function (rs) {
                            //console.log('REMOVE = ', rs);
                            localStorage.removeItem(key);
                            localStorage['article.json'] = rs;
                            m_listData = JSON.parse(rs);
                            $scope.bindData();
                        }
                    });
                }
                break;
        }
    };

    API.module_Render(module.id, _kit_grid);
}