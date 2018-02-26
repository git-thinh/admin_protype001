function _removeCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    var para = module.para;

    //console.log(moduleID, para);
    //console.log('callbackID', callbackID);
    
    var _kit_form = 'form_remove_' + moduleID;
    $rootScope.regKit(moduleID, _kit_form);

    var title = para['title'];
    var fields = para['fields'];
    var records = para['records'];

    $().w2grid({
        name: _kit_form, 
        show: { 
            toolbar: true,
            footer: true,
            toolbarSearch: false,
            toolbarInput: false,
            lineNumbers: true,
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
        columns: fields,
        records: records,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Remove', type: 'button', caption: lang.ui.remove, icon: 'fa fa-trash', checked: true },
                { id: 'Close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) { 
                if (event.target == 'Remove') { 
                    ////var itemSel = w2ui[_kit_form].getSelection();
                    ////if (itemSel.length == 0) return; 
                    ////var a_remove = _.filter(records, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                    //////console.log('a_remove = ', a_remove);
                    ////if (a_remove.length > 0) 
                    ////    API.module_Callback(module.backID, { type: 'remove', item: a_remove });

                    API.module_Callback(module.backID, { type: 'remove', item: records });
                    API.module_Close(moduleID);
                }
                if (event.target == 'Close') API.module_Close(moduleID);
            }
        },
        onRender: function (event) {
            event.onComplete = function () {
                w2ui[_kit_form].selectAll();
            }
        }
    });

    API.module_Render(moduleID, _kit_form);
}