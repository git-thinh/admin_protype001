function loginCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    var para = module.para;

    //console.log(moduleID, para);
    //console.log('callbackID', callbackID);

    var _kit_form = 'form_' + moduleID;
    $rootScope.regKit(moduleID, _kit_form);

    var title = 'LOGIN SYSTEM';
    var fields = [
        { field: 'username', type: 'text', required: true, html: { caption: 'Username', attr: '' } },
        { field: 'password', type: 'password', required: true, html: { caption: 'Password' } },
    ];
    var prop_add = {};
    var validate = function () { };
    var config = {};

    var options = {
        name: _kit_form,
        header: title,
        fields: fields,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Save', type: 'button', caption: 'Login', icon: 'fa fa-key', checked: true },
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
                            else
                                data[p] = prop_add[p];
                        }
                    }
                    console.log('LOGIN = ', data);

                    var m_listData = JSON.parse(localStorage['user.json']);
                    var login = (_.filter(m_listData, function (x) { return x.username == data.username && x.password == data.password; })).length > 0;
                    if (login)
                        API.module_Close(moduleID);
                    else
                        w2alert('Login fail, Username or Password wrong.');
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