function _editCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;

    var para = module.para;
    console.log('MODULE = ', module);
    console.log('PARA = ', para);

    //console.log('callbackID', callbackID);

    var _kit_form = 'form_' + moduleID;
    $rootScope.regKit(moduleID, _kit_form);

    var title = para['title'];
    var fields = para['fields'];
    var records = para['records'];
    var validate = para['validate'];
    var config = para['config'];

    console.log('edit form records: ', records);

    var options = {
        name: _kit_form, 
        fields: fields,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Save', type: 'button', caption: 'Save', icon: 'fa fa-save', checked: true },
                { id: 'Close', type: 'button', caption: 'Close', icon: 'fa fa-close', checked: true },
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

                    if (data != null) {
                        for (var p in records) {
                            if (data[p]) {
                               // _.extend(data[p], records[p]);
                            } else data[p] = records[p];
                        }
                    }
                     
                    var fsInput = _.filter(fields, function (x) { return x.type == 'text' });
                    var fieldNames = _.pluck(fsInput, 'field');
                    //console.log('fieldNames = ', fieldNames);
                    fieldNames.forEach(function (field) {
                        data[field] = $('#' + moduleID + ' #' + field).val();
                    });

                    console.log('Form Data = ', data);

                    API.module_Callback(module.backID, { type: 'edit', item: data });
                    API.module_Close(moduleID);
                }
                if (event.target == 'Close') API.module_Close(moduleID, [_kit_form]);
            }
        },
        onRender: function (event) {
            event.onComplete = function () {

                for (var i = 0; i < fields.length; i++) {
                    var fi = fields[i]['field'];
                    w2ui[_kit_form].record[fi] = records[fi];
                }

                w2ui[_kit_form].refresh();
            }
        }
    };

    if (config != null)
        for (var p in config)
            options[p] = config[p];

    /***************************************************/
    /* VIEW */

    $().w2form(options);

    /***************************************************/
    /* END MODULE */

    API.module_Render(moduleID, _kit_form);
}