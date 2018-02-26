'use strict';

localStorage.clear();


/**********************************************************/
/* VARIABLE */

var _ADD = '_add';
var _EDIT = '_edit';
var _REMOVE = '_remove';
var _LOGIN = 'login';
var _EXIT = 'exit';

var lang = {};
var m_menu = [];
var m_config = { VIEW_DEFAULT: 'login' };
var ui_menu = null;
var ui_layout = null;
var ui_view = null;
var ui_loading = null;
var ui_process = null;
var m_packageTotal = 0;
var m_packageIndex = 0;

/**********************************************************/
/* FUNCTION */

function formatText(text) {
    if (text.indexOf('♣') != -1) text = text.split('♣').join('\r');
    if (text.indexOf('∆') != -1) text = text.split('∆').join('\r');
    return text;
}

function convertNumber(text) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(text))
        return Number(text);
    return null;
}

function uiShow() {
    ui_loading.style.display = 'none';
    ui_menu.style.display = 'block';
    ui_layout.style.display = 'block';
    ui_view.style.display = 'block';
}

function cooSet(cname, cvalue, exdays) {
    if (exdays == null) exdays = 1;
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function cooGet(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function aready(func) {
    angular.element(document).ready(function () {
        func();
    });
}

function getAPI() {
    if (m_ready)
        return angular.element(document.body).injector().get('API');
}

/**********************************************************/

function scope(moduleID) {
    return angular.element('#' + moduleID).scope();
}

function module_Callback(backID, data) {
    var $body = angular.element(document.body);
    var $rootScope = $body.injector().get('$rootScope');

    $rootScope.$apply(function () {
        $rootScope.$broadcast(backID, data);
    });
}

function module_Close(moduleID) {
    var $body = angular.element(document.body);
    var api = $body.injector().get('API');
    api.module_Close(moduleID);
}

function module_Load(configID, event) {
    var funcName = 'module_Load';
    var $body = angular.element(document.body);
    var $api = $body.injector().get('API');
    var $rootScope = $body.injector().get('$rootScope');

    var para = null;
    if (configID != null && configID.length > 0)
        para = $rootScope.getCache(configID);
    if (para == null) para = {};

    var moduleID = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    para['id'] = moduleID;

    //console.log('module_Load = id: ' + moduleID, para);
    //console.log('module_Load = event: ' + moduleID, event.target);

    if (event != null) {
        var it = event.target;
        para['backTarget'] = it;
    }

    if ($api[funcName] != null)
        $api[funcName](para);
}

/**********************************************************/
/* APP */

angular
    .module('app', ['app.services', 'app.directives'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('');
    }])
    .run(function ($rootScope, API) {
        ui_menu = document.getElementById('menu');
        ui_layout = document.getElementById('layout_main');
        ui_view = document.getElementById('view');
        ui_loading = document.getElementById('loading');
        ui_process = document.getElementById('progress');

        /************************/
        /** Cache Data */
        /* This should now be available in controllers: function abcCtrl = function($scope) { $scope.save = function() { $scope.getCacheAll(); } }; */
        var cacheData = {};
        $rootScope.getCacheAll = function () {
            return cacheData;
        };
        $rootScope.getCache = function (key) {
            // console.log('<#> getCache = ', cacheData);
            return cacheData[key];
        };
        $rootScope.getCallback = function (key) {
            return cacheData[key + '.callback'];
        };
        $rootScope.setCache = function (key, value) {
            cacheData[key] = value;
            // console.log('<#> setCache = ', cacheData);
        };
        $rootScope.lookupID = function (value) {
            var key = 'lookup_xxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            value['id'] = key;
            value['mode'] = 'select';
            cacheData[key] = value;
            // console.log('<#> cacheID = ', cacheData);
            return key;
        };
        $rootScope.removeCache = function (key) {
            if (cacheData.hasOwnProperty(key) != null)
                delete cacheData[key];
            //console.log('removeCache + cacheData = ', cacheData);
        };
        $rootScope.regKit = function (key, kitID) {
            var it = cacheData[key];
            var arrayKit = it['kit'];
            if (arrayKit == null) arrayKit = [];
            if (arrayKit.indexOf(kitID) == -1)
                arrayKit.push(kitID);
            it['kit'] = arrayKit;
            cacheData[key] = it;
            //console.log('regKit = ', it);
        };

        /************************/
        API.module_Load({ code: 'login', mode: '' });

        var worker = new Worker('worker.js');
        ////var worker = new Worker(window.URL.createObjectURL(new Blob(['self.onmessage = function(e) { var es = new EventSource(location.origin + "/db"); es.onmessage = function (event) { self.postMessage(event.data); }; };'])));
        worker.onmessage = function (e) {
            var text = e.data.toString();
            if (m_packageTotal == 0) {
                m_packageTotal = convertNumber(text);
                ui_process.setAttribute('max', m_packageTotal);
            } else {
                if (text == 'COMPLETE') {
                    ui_process.setAttribute('value', m_packageTotal);
                    console.log('cache [COMPLETE]');
                    API.pageReady();
                } else if (text.length > 0) {
                    m_packageIndex++;
                    ui_process.setAttribute('value', m_packageIndex);

                    console.log('caching ............');
                    if (text.indexOf('♣') != -1) text = text.split('♣').join('\r');
                    var pos = text.indexOf('|');
                    var key = text.substring(0, pos);
                    var data = text.substring(pos + 1, text.length);
                    localStorage[key] = data;
                }
            }
        }
        //worker.postMessage(window.navigator.userAgent);
        worker.postMessage(location.origin);

        /************************/
    });

/**********************************************************/
/* Directives */

angular
    .module('app.directives', [])
    .directive('ngResize', function ($window, $rootScope) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return {
                    'h': w.height(),
                    'w': w.width()
                };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;

                scope.resizeClass = function () {
                    var css = 'pc';
                    if (newValue.w < 480)
                        css = 'mobile';
                    else if (newValue.w < 1024)
                        css = 'tablet';

                    $rootScope.device = css;

                    //if (css == 'mobile' && document.getElementById('w2ui-popup') != null) {
                    //    try {
                    //        jQuery().w2popup('min');
                    //        w2popup.resize();
                    //    } catch (err) { }
                    //    setTimeout(function () { try { jQuery().w2popup('max'); w2popup.resize(); } catch (err) { } }, 500);
                    //}

                    return css;
                };
            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    });

/**********************************************************/
/* Services */

angular.module('app.services', [])
.factory('API', function ($rootScope, $compile) {
    var api = {
        pageReady: function () {
            lang = JSON.parse(localStorage['lang-en.json']);
            uiShow();
            //getAPI().module_Load({ code: 'login' });

            api.dashboard_Init();
            //api.module_Load({ code: m_config.VIEW_DEFAULT, mode: '' });
        },
        formatBeforSend: function (text) { if (text == null) return ''; return text.split('+').join('Γ'); },
        /***************************/
        /** Temp, File */
        /***************************/
        update_Temp: function (fileName, text, event) {
            text = api.formatBeforSend(text);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/temp?file=' + fileName);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(true);
            }
            xhr.onerror = function () {
                if (event != null && event.error != null) event.error();
            }
            xhr.send(text);
        },
        update_File: function (fileName, text, event) {
            text = api.formatBeforSend(text);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/json?file=' + fileName);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(true);
            }
            xhr.onerror = function () {
                if (event != null && event.error != null) event.error();
            }
            xhr.send(text);
        },
        /***************************/
        /** Images */
        /***************************/
        delete_Img: function (fileName, event) {
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/img?file=' + fileName);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(JSON.parse(xhr.responseText));
            }
            xhr.onerror = function () {
                if (event != null && event.error != null) event.error();
            }
            xhr.send(null);
        },
        post_Img: function (folder, fileName, fileData, event) {
            var fd = new FormData();
            fd.append('file', fileData);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/img?folder=' + folder + '&file=' + fileName);
            //xhr.setRequestHeader('Key', '');
            //xhr.setRequestHeader('FileName', file.name);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(JSON.parse(xhr.responseText));
            }
            xhr.onerror = function () {
                if (event != null && event.error != null) event.error();
            }
            xhr.send(fd);
        },
        get_Img: function (folder) {
            if (folder == null) folder = '';
            var url = '/img?folder=' + folder;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            if (xhr.status === 200)
                return JSON.parse(xhr.responseText);
            return [];
        },
        /***************************/
        /** Article */
        /***************************/
        add_update_Article: function (item, fields, event) {
            var aInt = _.filter(fields, function (x) { return x.type == 'int' || x.type == 'select' })
            aInt = _.pluck(aInt, 'field');
            if (aInt.length > 0)
                for (var key in item) {
                    var li = item[key];
                    if (aInt.indexOf(key) != -1) {
                        var vli = convertNumber(li);
                        item[key] = vli == null ? 0 : vli;
                    } else {
                        if (li != null && li.length > 0) {
                            var vli = li.split('"').join('').split("'").join('');
                            item[key] = vli;
                        }
                    }
                }

            var url = '/article';
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(xhr.responseText);
            }
            if (typeof (item) == 'object') item = JSON.stringify(item);
            item = api.formatBeforSend(item);
            console.log('post_Item ' + url, item);
            xhr.send(item);
        },
        delete_Article: function (id, event) {
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/article?id=' + id);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    if (event != null && event.ok != null) event.ok(xhr.responseText);
            }
            xhr.onerror = function () {
                if (event != null && event.error != null) event.error();
            }
            xhr.send(null);
        },
        /***************************/
        /** Module */
        /***************************/
        module_Callback: function (callbackID, data) {
            if (callbackID != null)
                $rootScope.$broadcast(callbackID, data);
        },
        module_Close: function (moduleID) {
            var pop = document.getElementById('module-' + moduleID);
            if (pop != null) {
                pop.remove();
                var kit = null;
                var it = $rootScope.getCache(moduleID);
                if (it != null) kit = it['kit'];
                //console.log('module close -> clear kit', kit);
                if (kit != null && kit.length > 0) {
                    for (var i = 0; i < kit.length; i++) {
                        var key = kit[i];
                        if (w2ui[key] != null) w2ui[key].destroy();
                        $rootScope.removeCache(key);
                    }
                }
                $rootScope.removeCache(moduleID);

                var moduleCode = pop.getAttribute('for');
                if (moduleCode == _LOGIN || moduleCode == _EXIT) {
                } else {
                    var _mode = pop.getAttribute('rel');
                    api.menu_CaptionHide(_mode);
                }
            }
        },
        module_Load: function (paraObj) {
            var moduleCode = paraObj['code'];
            var moduleType = paraObj['type'];
            if (moduleType == null || moduleType == '') moduleType = 'module';
            var moduleMode = paraObj['mode'];
            if (moduleMode == null || moduleMode == '') moduleMode = 'all';

            var backID = paraObj['backID'];
            var paraData = paraObj['para'];
            var backCode = '';
            if (backID != null && backID != null) {
                var backItem = $rootScope.getCache(backID);
                if (backItem != null && backItem['code'] != null)
                    backCode = backItem['code'];
            }

            if (moduleCode == null || moduleCode == '' || moduleCode == 'blank' || moduleCode == 'none') return;

            /** create id modal */
            var moduleID = paraObj['id'];
            if (moduleID == null || moduleID == '') moduleID = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            //var module = { type: moduleType, mode: moduleMode, id: moduleID, code: moduleCode, backID: backID, para: paraData };
            paraObj['type'] = moduleType;
            paraObj['mode'] = moduleMode;
            paraObj['id'] = moduleID;
            paraObj['code'] = moduleCode;
            paraObj['backID'] = backID;
            paraObj['para'] = paraData;
            console.log('///module_Load = ', paraObj);

            var moduleTitle = '';
            if (paraObj['title'] == null) {
                var mis = _.filter(m_menu, function (x) { return x.id == moduleCode; });
                if (mis != null && mis.length > 0) moduleTitle = mis[0]['text'];
                paraObj['caption'] = moduleTitle;
                console.log('///m_menu = ', m_menu);
                console.log('///moduleCaption = ', moduleTitle);
            } else {
                moduleTitle = paraObj['title'];
            }
            if (moduleCode == _ADD || moduleCode == _EDIT || moduleCode == _REMOVE) {
                moduleMode = 'action';
                if (moduleTitle == null || moduleTitle == '') moduleTitle = moduleCode.substring(1, moduleCode.length);
            }

            var pop = document.createElement('div');
            pop.className = 'module ' + (backCode == '' ? '' : backCode + '_') + moduleCode;
            pop.setAttribute('for', (backCode == '' ? '' : backCode + '_') + moduleCode);
            pop.title = moduleTitle;
            pop.id = 'module-' + moduleID;
            pop.setAttribute('rel', moduleMode);
            var element = document.createElement('div');
            element.setAttribute('for', moduleType);
            element.id = moduleID;
            element.className = 'module-controller';
            //element.style = 'width:100%;height:100%;';
            pop.appendChild(element);
            $('body').append(pop);
            //var element = document.getElementById('popup');

            var controllerName = moduleCode.split('-').join('').split('.').join('') + 'Ctrl';
            element.setAttribute('ng-controller', controllerName);

            var _notFind = false;
            var js = localStorage[moduleCode + '.js'];
            if (js == null) {
                if (moduleCode == 'login') {
                    js = api.getSynchronous('/view/login.js');
                } else {
                    _notFind = true;
                    js = 'function ' + controllerName + '($rootScope, $scope, API) {}';
                }
            }

            js = js.trim();
            var js_ext =
            ' $scope.$on("' + moduleID + '", function (events, msg_) { ' +
            '     $scope.callback(msg_); ' +
            ' }); ';
            js = js.substring(0, js.length - 1) + js_ext + ' } ';

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = localStorage[moduleCode + '.css'];
            if (css != null) {
                css = css.trim();
                var style = document.createElement('style');
                style.setAttribute("type", "text/css");
                style.innerHTML = css;
                element.parentElement.appendChild(style);
            }

            var temp = '';
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $rootScope.setCache(moduleID, paraObj);

            if (moduleCode == 'login') {
                $rootScope.module = paraObj;
                $compile(element)($rootScope);
            } else {
                $rootScope.module = null;
                var _scope = angular.element('#' + moduleID).scope();
                _scope.module = paraObj;
                $compile(element)(_scope);
                //$compile(element)($rootScope);
            }

            if (_notFind)
                api.module_Close(moduleID);

            if (moduleCode == _LOGIN || moduleCode == _EXIT) {
                pop.setAttribute('style', 'top:0px;');
            } else {
                api.menu_CaptionShow(moduleMode, moduleTitle);
            }
        },
        module_Render: function (moduleID, componentName, event) {
            if (componentName != null && componentName.length > 0)
                $('#' + moduleID).w2render(componentName);
            if (event != null) setTimeout(event, 111);
        },
        /***************************/
        /** Dashboard, Menu */
        /***************************/
        menu_CaptionHide: function (_mode) {
            setTimeout(function () {
                console.log('HIDE CAPTION = ' + _mode);
                switch (_mode) {
                    case 'all':
                        /* mode are module */
                        $('.module_title').html('');
                        $('.mode_title').html('');
                        $('.action_title').html('');
                        var lat = document.body.lastElementChild;
                        if (lat != null) {
                            var tit = lat.getAttribute('title');
                            if (tit == null) tit = '';
                            $('.module_title').html(tit);
                        }
                        break;
                    case 'action':
                        $('.action_title').html('');
                        $('.mode_title').html('');
                        break;
                    default:
                        /* mode are select,... */
                        $('.mode_title').html('');
                        break;
                }
            }, 300);
        },
        menu_CaptionShow: function (_mode, _title) {
            setTimeout(function () {
                console.log('UPDATE CAPTION = ' + _mode + ': ' + _title);

                if (_title == null) _title = '';
                if (_title != '') _title = '/' + _title;

                switch (_mode) {
                    case 'all':
                        /* mode are module */
                        $('.module_title').html(_title);
                        $('.mode_title').html('');
                        $('.action_title').html('');
                        break;
                    case 'action':
                        $('.action_title').html(_title);
                        $('.mode_title').html('');
                        break;
                    default:
                        /* mode are select,... */
                        $('.mode_title').html(_title);
                        break;
                }
            }, 300);
        },
        menu_Toggle: function () {
            var moduleID = 'menu';
            var element = document.getElementById('menu');
            if (element.style.display == 'block') {
                element.style.display = 'none';
                return;
            } else
                element.style.display = 'block';

            var controllerID = moduleID.split('-').join('').split('.').join('') + 'Ctrl';
            element.setAttribute('ng-controller', controllerID);

            var path = '/view/' + moduleID + '/';
            $rootScope.PATH = path;
            $rootScope.moduleID = moduleID;

            var js = api.getSynchronous(path + 'js.js');
            if (js == null)
                js = 'function ' + controllerID + '($scope) {}';

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = api.getSynchronous(path + 'css.css');
            if (css == null) css = '';
            var style = document.createElement('style');
            style.setAttribute("type", "text/css");
            style.innerHTML = css;
            element.parentElement.appendChild(style);

            var temp = '';//service.getSynchronous(path + 'temp.htm');
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $compile(element)($rootScope);

            jQuery("#menu").show();
        },
        dashboard_Ready: function () {
            ////$('#mainTab').w2render('mainTab');
            ////$('#leftTab').w2render('leftTab');

            w2ui['layout_main'].content('top', w2ui['toolbar_top']);
            //w2ui['layout_main'].content('left', w2ui['grid_left']);
            //w2ui['layout_main'].content('main', w2ui['grid_main']);
            //////w2ui['layout_main'].content('preview', w2ui['grid_preview']);


            ////////w2ui['grid_left'].records = m_page.left.grid;
            ////////w2ui['grid_left'].refresh();
            //////w2ui['grid_preview'].records = m_page.preview.grid;
            //////w2ui['grid_preview'].refresh();

            //////for (var i = 0 ; i < m_page.preview.grid.length; i++)
            //////    w2ui['grid_preview'].expand(i + 1);

            ////////console.log('this is ready state');
            ////////w2ui['grid_left'].expand(2);
            ////////w2ui['grid_left'].expand(3);

            ////////w2ui['grid_preview'].expand(2);
            //api.module_Load('manager_user');
        },
        dashboard_Init: function () {
            /***************************************************/
            var menus = JSON.parse(localStorage['menu.json']);
            console.log('menus = ', menus);
            if (menus.length > 0 && menus[0]['items'] != null)
                m_menu = menus[0]['items'];

            if (w2ui['toolbar_top'] != null) w2ui['toolbar_top'].destroy();
            $().w2toolbar({
                name: 'toolbar_top',
                style: 'background-color: #ccc !important;',
                items: menus,
                onClick: function (event) {
                    var id = event.target;
                    if (id.indexOf(':') != -1) id = id.substring(id.indexOf(':') + 1, id.length);
                    switch (id) {
                        case 'root':
                            break;
                        case 'menu':
                            //api.menu_Toggle();
                            break;
                        default:
                            api.module_Load({ code: id });
                    }

                    //console.log(id, event);
                    //////switch (id) {
                    //////    case 'mn_menu':
                    //////        if ($rootScope.device == 'mobile') {
                    //////            w2ui['layout_main'].hide('bottom');
                    //////            w2ui['layout_main'].hide('right');
                    //////        }
                    //////        w2ui['layout_main'].toggle('left', window.instant);
                    //////        break;
                    //////    case 'mn_grammar':
                    //////        w2ui['layout_main'].toggle('bottom', window.instant);
                    //////        break;
                    //////    case 'mn_bookmark':
                    //////        if ($rootScope.device == 'mobile') {
                    //////            w2ui['layout_main'].hide('bottom');
                    //////            w2ui['layout_main'].hide('left');
                    //////        }
                    //////        w2ui['layout_main'].toggle('right', window.instant);
                    //////        break;
                    //////    case 'mn_manager_menu':
                    //////        location.href = '/#/login';
                    //////        break;
                    //////    case 'mn_manager_user':
                    //////        break;
                    //////    case 'mn_edit_theme_home':
                    //////        break;
                    //////    case 'mn_edit_theme_news':
                    //////        break;
                    //////    case 'mn_setting':
                    //////        //location.href = '/login';
                    //////        location.href = '/#/login';
                    //////        //document.getElementById('link').click();
                    //////        break;
                    //////    case 'mn_change_pass':
                    //////        menu_OpenPopup();
                    //////        break;
                    //////    case 'mn_logout':
                    //////        w2confirm('Bạn chắc chắn muốn thoát phiên làm việc?')
                    //////           .yes(function () {
                    //////               //cooSet('userid', '');
                    //////               location.href = '/#/login';
                    //////               //window.location.assign("/#/login");
                    //////           })
                    //////        .no(function () { });
                    //////        break;
                    //////}
                }
            });

            if (w2ui['leftTab'] != null) w2ui['leftTab'].destroy();
            var _leftTab = '<div id="leftPanel"><div id="leftTab"></div><div id="topicTab" class="tab"></div><div id="tagTab" class="tab"></div><div id="listenTab" class="tab"></div><div id="searchTab" class="tab"></div></div>';
            $().w2tabs({
                name: 'leftTab',
                active: 'topicTab',
                tabs: [
                    { id: 'topicTab', caption: 'Topic' },
                    { id: 'tagTab', caption: 'Tag' },
                    { id: 'listenTab', caption: 'Listen' },
                    { id: 'searchTab', caption: 'Search' },
                ],
                onRender: function (event) {
                    event.onComplete = function () {
                        $('#leftPanel .tab').hide();
                        $('#leftPanel #topicTab').show();
                    }
                },
                onClick: function (event) {
                    $('#leftPanel .tab').hide();
                    $('#leftPanel #' + event.target).show();
                }
            });

            if (w2ui['mainTab'] != null) w2ui['mainTab'].destroy();
            var _mainTab = '<div id="mainPanel"><div id="mainTab"></div><div id="contentTab" class="tab"><div id="article"></div></div><div id="mediaTab" class="tab"></div><div id="grammarTab" class="tab"></div><div id="bookmarkTab" class="tab"></div></div>';
            $().w2tabs({
                name: 'mainTab',
                active: 'contentTab',
                tabs: [
                    { id: 'contentTab', caption: 'Article' },
                    { id: 'mediaTab', caption: 'Media' },
                    { id: 'grammarTab', caption: 'Grammar' },
                    { id: 'bookmarkTab', caption: 'BookMark' },
                ],
                onRender: function (event) {
                    event.onComplete = function () {
                        $('#mainPanel .tab').hide();
                        $('#mainPanel #contentTab').show();
                    }
                },
                onClick: function (event) {
                    $('#mainPanel .tab').hide();
                    $('#mainPanel #' + event.target).show();
                }
            });

            if (w2ui['layout_main'] != null) w2ui['layout_main'].destroy();
            var pstyle = 'border: 1px solid #dfdfdf; padding: 0px;';
            $().w2layout({
                name: 'layout_main',
                panels: [
                    { type: 'top', size: 29, resizable: false, style: pstyle },
                    { type: 'left', size: 320, resizable: false, hidden: false, style: '', content: _leftTab },
                    { type: 'main', style: pstyle + 'border-top: 0px;', content: _mainTab },
                    { type: 'preview', size: '70%', resizable: true, hidden: true, style: pstyle, content: 'preview' },
                    { type: 'right', size: 320, resizable: false, hidden: true, style: pstyle, content: 'right' },
                    { type: 'bottom', size: '30%', resizable: false, hidden: true, style: pstyle, content: 'bottom' }
                ]
            });

            $('#layout_main').w2render('layout_main');

            w2ui['layout_main'].on('resize', function (event) {
                if ($rootScope.ready == null || $rootScope.ready == false) {
                    $rootScope.ready = true;
                    api.dashboard_Ready();
                }
            });
            /***************************************************/
        },
        /***************************/
        /** Popup */
        /***************************/
        popupClose: function (scope) {
            var popupID = scope.popupID;
            if (popupID != null) {
                document.getElementById(popupID).remove();
            }
        },
        popupShow: function (scope, moduleID, data) {
            //var moduleID = 'article-view';

            var parent = scope.$parent;
            if (data != null) {
                for (var key in data) {
                    parent[key] = data[key];
                }
            }

            /** create id modal */
            var id = 'popup-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            parent.popupID = id;

            var pop = document.createElement('div');
            pop.id = id;
            var element = document.createElement('div');
            element.className = 'popup';
            pop.appendChild(element);
            $('body').append(pop);
            //var element = document.getElementById('popup');

            var controllerID = moduleID.split('-').join('').split('.').join('') + 'Ctrl';

            element.setAttribute('ng-controller', controllerID);

            console.log('goView moduleID = ' + moduleID);
            console.log('goView controllerID = ' + controllerID);

            var path = '/Modules/' + moduleID + '/';
            scope.PATH = path;
            scope.moduleID = moduleID;

            var js = service.getSynchronous(path + 'controller.js');
            if (js == null) {
                js = '';
                element.getAttribute('ng-controller', 'noneCtrl');
                alertShow({ type: 'error', content: 'Cannot find controller: ' + controllerID });
            }

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = service.getSynchronous(path + 'css.css');
            if (css == null) css = '';
            var style = document.createElement('style');
            style.setAttribute("type", "text/css");
            style.innerHTML = css;
            element.parentElement.appendChild(style);

            var temp = service.getSynchronous(path + 'temp.htm');
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $compile(element)(parent);

            jQuery("#popup").show();
        },
        /***************************/
        /** Temp, File */
        /***************************/
        getModuleCode: function () {
            //console.log('document.location.hash = ', document.location.hash);
            var moduleCode = document.location.hash;
            if (moduleCode == '' || moduleCode == '/' || moduleCode == '#/')
                moduleCode = m_config.VIEW_DEFAULT;
            else moduleCode = moduleCode.substring(2);
            return moduleCode;
        },
        checkLink: function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);  // `false` makes the request synchronous
            request.send(null);

            if (request.status === 200) {
                return true;
            }
            return false;
        },
        getSynchronous: function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send(null);

            if (request.status === 200) {
                return request.responseText;
            }
            return null;
        }
    };
    return api;
});



