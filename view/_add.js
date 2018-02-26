function _addCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    var para = module.para;

    //console.log(moduleID, para);
    //console.log('callbackID', callbackID);

    var _kit_form = 'form_' + moduleID;
    $rootScope.regKit(moduleID, _kit_form);

    var title = para['title'];
    var fields = para['fields'];
    var prop_add = para['property'];
    var validate = para['validate'];
    var config = para['config'];

    var options = {
        name: _kit_form, 
        fields: fields,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Save', type: 'button', caption: lang.ui.save, icon: 'fa fa-save', checked: true },
                { id: 'Close', type: 'button', caption: lang.ui.close, icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                if (event.target == 'Save') {
                    var vali = w2ui[_kit_form].validate();
                    if (vali != null && vali.length > 0) {
                        //w2alert('Vui lòng nhập chính xác dữ liệu!').ok(function () { console.log('ok'); });
                        return;
                    }

                    var data = w2ui[_kit_form].getChanges();

                    if (validate != null) {
                        var ok = validate(data);
                        if (ok == false) return;
                    }

                    if (prop_add != null) {
                        for (var p in prop_add) {
                            if (data[p])
                                _.extend(data[p], prop_add[p]);
                            //else data[p] = prop_add[p];
                        }
                    }

                    console.log('Form Data = ', data);

                    var fsInput = _.filter(fields, function (x) { return x.type == 'text' });
                    var fieldNames = _.pluck(fsInput, 'field');
                    //console.log('fieldNames = ', fieldNames);
                    fieldNames.forEach(function (field) {
                        data[field] = $('#' + moduleID + ' #' + field).val();
                    });

                    API.module_Callback(module.backID, { type: 'add', item: data });
                    API.module_Close(moduleID, [_kit_form]);
                }
                if (event.target == 'Close') {
                    API.module_Close(moduleID, [_kit_form]);
                }
            }
        },
        onRender: function (event) {
            event.onComplete = function () {

                if (prop_add != null)
                    for (var i = 0; i < fields.length; i++) {
                        var fi = fields[i]['field'];
                        if (prop_add[fi] != null) w2ui[_kit_form].record[fi] = prop_add[fi];
                    }

                w2ui[_kit_form].refresh();
            }
        }
    };

    if (config != null)
        for (var p in config)
            options[p] = config[p];

    /***************************************************/
    /* FUNCTION */

    /***************************************************/
    /* EVENT */

    /***************************************************/
    /* VIEW */

    $().w2form(options);

    /***************************************************/
    /* END MODULE */

    API.module_Render(moduleID, _kit_form);
}