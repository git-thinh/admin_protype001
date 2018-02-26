function manager_imageCtrl($rootScope, $scope, API) {
    /***************************************************/
    //#region VARIABLE 

    var module = $scope.module;
    var moduleID = module.id;
    var _hideMobile = $rootScope.device != 'mobile';

    var _title = 'Quản lý hình ảnh';
    if (module.mode == 'select')
        _title = 'Chọn hình ảnh';

    var _kit_layout = 'layout_' + moduleID;
    var _kit_toolbar = 'toolbar_' + moduleID;
    var _kit_grid = 'grid_' + moduleID;

    $rootScope.regKit(moduleID, _kit_layout);
    $rootScope.regKit(moduleID, _kit_toolbar);
    $rootScope.regKit(moduleID, _kit_grid);

    var _field_grid_root = [{ field: 'name', caption: 'Thư mục', size: '100%' }];
    var _field_grid_sub = [{ field: 'name', caption: 'Hình ảnh', size: '100%' }];

    var _field_form_add = [{ field: 'name', type: 'text', required: true, html: { caption: 'Thư mục' } }];
    var _field_form_edit = [{ field: 'name', type: 'text', required: true, html: { caption: 'Thư mục' } }];

    var m_objectSelect = {};
    var m_listData = API.get_Img('');
    console.log(' m_listData = ', m_listData);

    //#endregion

    /***************************************************/
    //#region FUNCTION

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
        if (module['backEvent'] != null)
            module['backEvent'](module, m_objectSelect);
        API.module_Close(moduleID);
    }

    $scope.bindData = function () {
        //var mn_root = _.filter(m_listData, function (mn) { return mn.pid == 0; });
        if (w2ui[_kit_grid] != null) {
            w2ui[_kit_grid].clear();
            w2ui[_kit_grid].records = m_listData;
            w2ui[_kit_grid].total = m_listData.length;
            w2ui[_kit_grid].refresh();
        }
    };

    //#endregion

    /***************************************************/
    //#region EVENT 

    $scope.toolbar_MainClick = function (event) {
        switch (event.target) {
            case 'select':
                scope(module.id).select_Post();
                break;
            case 'close':
                scope(module.id).close();
                break;
        }
    }

    $scope.toolbar_folderClick = function (event) {
        switch (event.target) {
            case 'add':
                API.module_Load({
                    code: _ADD,
                    backID: moduleID,
                    para: {
                        title: 'Thêm mới thư mục',
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
                    w2alert('Vui lòng chọn duy nhất 1 bản ghi để cập nhật');
                    return;
                }

                var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                console.log('edit = ', mn_edit);

                API.module_Load({
                    code: _EDIT,
                    backID: moduleID,
                    para: {
                        title: 'Cập nhật thư mục',
                        fields: _field_form_edit,
                        records: mn_edit[0],
                        validate: function (data) {
                            var val = data['name'];
                            if (val == null || val.length > val.replace(/[^\x20-\x7E]+/g, '').length) {
                                w2alert('Vui lòng nhập tên thư mục không dấu');
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
                    w2alert('Vui lòng chọn 1 bản ghi để xóa');
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.module_Load({
                    code: _REMOVE,
                    backID: moduleID,
                    para: {
                        title: 'Bạn đồng ý xóa thư mục?',
                        fields: _field_grid_root,
                        records: mn_remove,
                    }
                });

                break;
        }
    }

    $scope.toolbar_fileClick = function (event, _folder, _kit_grid_sub, mn_sub) {
        switch (event.target) {
            case 'upload_img':
                API.module_Load({
                    code: 'upload_image',
                    backID: moduleID,
                    para: {
                        title: 'Đăng ảnh lên đám mây',
                        folder: _folder,
                        property: { pid: _folder },
                        fields: _field_form_add,
                    }
                });
                break;
            case 'remove_img':
                var itemSel = w2ui[_kit_grid_sub].getSelection();
                if (itemSel.length == 0) {
                    w2alert('Vui lòng chọn 1 hình ảnh để xóa');
                    return;
                }

                var mn_remove = _.filter(mn_sub, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.module_Load({
                    code: _REMOVE,
                    backID: moduleID,
                    para: {
                        title: 'Bạn đồng ý xóa các hình ảnh?',
                        fields: _field_grid_root,
                        records: mn_remove,
                    }
                });

                break;
        }
    }

    //#endregion

    /***************************************************/
    //#region VIEW */

    $().w2layout({
        name: _kit_layout,
        padding: 0,
        panels: [
            { type: 'top', size: 30, resizable: false, style: 'background-color:#D1E0F1;' },
            { type: 'main', content: '<center><img id="manager_image_viewer" src=""/></center>' },
            { type: 'preview', size: '75%', resizable: false },
        ]
    });

    $().w2toolbar({
        name: _kit_toolbar,
        items:
            module.mode == 'select' ?
            [
                { type: 'html', html: '<div id="folder_title" style="padding: 3px 10px;">[' + _title + ']</div>' },
                { type: 'spacer' },
                { id: 'select', type: 'button', caption: 'Select', icon: 'fa fa-check', checked: true },
                { id: 'close', type: 'button', caption: '', icon: 'fa fa-close', checked: true },
            ]
            :
            [
                { type: 'html', html: '<div id="folder_title" style="padding: 3px 10px;">[' + _title + ']</div>' },
                { type: 'spacer' },
                { id: 'close', type: 'button', caption: '', icon: 'fa fa-close', checked: true },
            ],
        onClick: function (event) {
            scope(module.id).toolbar_MainClick(event);
        }
    });

    $().w2grid({
        name: _kit_grid,
        show: {
            toolbar: true,
            footer: true,
            lineNumbers: _hideMobile,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: false,
            columnHeaders: true,
        },
        multiSearch: false,
        multiSelect: false,
        searches: [
            { field: 'name', caption: 'Tìm kiếm', type: 'text' },
        ],
        columns: _field_grid_root,
        records: [],
        toolbar: {
            items: [
                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
            ],
            onClick: function (event) {
                scope(module.id).toolbar_folderClick(event);
            }
        },
        onExpand: function (event) {

            if (w2ui.hasOwnProperty('subgrid-' + event.recid)) w2ui['subgrid-' + event.recid].destroy();
            $('#' + event.box_id).css({ margin: '0px', padding: '0px', width: '100%' }).animate({ height: '205px' }, 100);

            setTimeout(function () {
                var _pid = event.recid;
                var _kit_grid_sub = 'subgrid-' + _pid;
                var _itParent = _.filter(m_listData, function (mn) { return mn.recid == _pid; });
                var _folder = _itParent.length > 0 ? _itParent[0]['name'] : '';

                $scope.PID = _pid;

                if (w2ui[_kit_grid_sub] != null) w2ui[_kit_grid_sub].destroy();

                //var mn_sub = _.filter(m_listData, function (mn) { return mn.pid == _pid; });
                //if (mn_sub == null || mn_sub.length == 0) mn_sub = [];
                var mn_sub = API.get_Img(_folder);

                $('#' + event.box_id)
                    .w2grid({
                        name: _kit_grid_sub,
                        show: {
                            toolbar: true,
                            footer: true,
                            lineNumbers: false,
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
                        fixedBody: true,
                        columns: _field_grid_sub,
                        records: mn_sub,
                        toolbar: {
                            items: [
                                { id: 'upload_img', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                                { id: 'remove_img', type: 'button', caption: '', icon: 'fa fa-trash', checked: true }
                            ],
                            onClick: function (event) {
                                scope(module.id).toolbar_fileClick(event, _folder, _kit_grid_sub, mn_sub);
                            }
                        },
                        onSelect: function (event) {
                            var recid = event.recid;
                            var itemSelect = _.filter(mn_sub, function (mn) { return mn.recid == recid; });
                            if (itemSelect.length > 0) itemSelect = itemSelect[0]['name']; else itemSelect = '';
                            console.log(itemSelect);

                            document.getElementById('manager_image_viewer').src = location.origin + '/' + itemSelect;

                            if (itemSelect != '') m_objectSelect[recid] = itemSelect;
                            console.log(m_objectSelect);
                        },
                        onUnselect: function (event) {
                            var recid = event.recid;
                            console.log(recid);
                            if (m_objectSelect[recid] != null) delete m_objectSelect[recid];
                            console.log(m_objectSelect);
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

    /***************************************************/
    /* END MODULE */

    $scope.callback = function (data) {
        console.log('callback = ', data);

        var item = data['item'];
        var type = data['type'];
        if (item == null || item.length == 0) return;
        switch (type) {
            case 'remove':
                var pid = item[0]['pid'];
                if (pid == null || pid.length == 0) {
                } else { 
                    var fileName = item[0]['name'];
                    API.delete_Img(fileName, {
                        ok: function (rs) {
                            //console.log(rs);
                            $scope.bindData();
                        }
                    });
                }
                break;
            case 'upload_image':
                var folder = data.folder;
                var fileName = data.name;
                var fileData = data.item;
                API.post_Img(folder, fileName, fileData, {
                    ok: function (rs) {
                        //console.log(rs);
                        $scope.bindData();
                    }
                });;
                break;
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
        }
    };

    API.module_Render(moduleID, _kit_layout, function () {
        w2ui[_kit_layout].content('top', w2ui[_kit_toolbar]);
        w2ui[_kit_layout].content('preview', w2ui[_kit_grid]);
    });
}