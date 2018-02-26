function change_passCtrl($rootScope, $scope, API) {
    var moduleID = $scope.moduleID = 'change_pass';

    var m_objectData = { recid: 1, password: 'admin' };

    var _field_form = [
        { field: 'password', type: 'password', required: true, html: { caption: 'Mật khẩu' } },
        { field: 'new_password', type: 'password', required: true, html: { caption: 'Mật khẩu mới' } },
        { field: 're_new_password', type: 'password', required: true, html: { caption: 'Nhập lại mật khẩu' } },
    ];

    var _kit_form = '_form_change_pass';

    /***************************************************/

    $().w2form({
        name: _kit_form,
        header: 'Change password',
        fields: _field_form,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Save', type: 'button', caption: 'Change pasword', icon: 'fa fa-save', checked: true },
                { id: 'Close', type: 'button', caption: 'Close', icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                if (event.target == 'Save') {
                    var vali = w2ui[_kit_form].validate();
                    if (vali != null && vali.length > 0) { 
                        return;
                    }

                    //var data = w2ui[_kit_form].getChanges();
                    m_objectData['password'] = w2ui[_kit_form].record.new_password;
                    console.log(' m_objectData = ', m_objectData);

                    w2confirm('Bạn chắc chắn muốn đổi mật khẩu?')
                    .yes(function () {
                        API.module_Close(moduleID, [_kit_form]);
                    })
                    .no(function () {
                        API.module_Close(moduleID, [_kit_form]);
                    });

                }
                if (event.target == 'Close') API.module_Close(moduleID, [_kit_form]);
            }
        },
        onValidate: function (event) {
            var pass_old = this.record.password;
            var pass_new = this.record.new_password;
            var pass_new2 = this.record.re_new_password;

            if (pass_old != m_objectData['password'])
                event.errors.push({ field: this.get('password'), error: '' });

            if (pass_new != pass_new2)
                event.errors.push({ field: this.get('re_new_password'), error: '' });
        },
        onRender: function (event) {
            event.onComplete = function () { 
            }
        }
    });

    /***************************************************/


    $scope.submit = function () {
        console.log('SUBMIT = ', m_objectData);
    }

    $scope.callback = function (data) {
    };

    API.module_Render(moduleID, _kit_form);
}