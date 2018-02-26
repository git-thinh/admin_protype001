var __upload_image_not_resize = 'off';

/* Utility function to convert a canvas to a BLOB */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

function imgBrowserUpload(_width, _folder, moduleID, backID) {
    console.log('__upload_image_not_resize = ', __upload_image_not_resize);

    w2popup.lock('Đang tải...', true);

    var fileInput = document.getElementById("browserFile");
    var file = fileInput.files[0];
    console.log('file = ', file);

    // Ensure it's an image
    if (file.type.match(/image.*/)) {
        console.log('An image has been loaded', file.size);


        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {
                if (__upload_image_not_resize == 'on' || image.width < 801)
                    _width = image.width;
                else
                    _width = 800;

                console.log(file.size, _width);

                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = _width, // 544,// TODO : pull max size from a site config
                    width = image.width,
                    height = image.height;

                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = dataURLToBlob(dataUrl);
                //$.event.trigger({
                //    type: "imageResized",
                //    blob: resizedImage,
                //    url: dataUrl
                //});

                //console.log('dataUrl = ', dataUrl);
                console.log('resizedImage = ', resizedImage);

                //post_msg(resizedImage);

                var data = {};


                //if (prop_add != null) {
                //    for (var p in prop_add) {
                //        if (data[p])
                //            _.extend(data[p], prop_add[p]);
                //        else
                //            data[p] = prop_add[p];
                //    }
                //}

                module_Callback(backID, { type: 'upload_image', folder: _folder, name: file.name, width: _width, item: resizedImage });
                w2popup.close();
                module_Close(moduleID);

                //////var $body = angular.element(document.body);            // 1
                //////var $rootScope = $body.injector().get('$rootScope');   // 2b
                //////$rootScope.$apply(function () {
                //////    var callbackID = $rootScope.getCallback(moduleID);
                //////    var eleID = $rootScope.getCache(callbackID);              // 3                    
                //////    $rootScope.$broadcast(eleID, { type: 'upload', item: resizedImage });
                //////});


                //////var fd = new FormData();
                //////fd.append('file', resizedImage);
                //////var xhr = new XMLHttpRequest();
                //////xhr.open('POST', '/img?file=123');
                //////xhr.setRequestHeader('Key', '');
                //////xhr.setRequestHeader('FileName', file.name);

                //////xhr.onreadystatechange = function () {
                //////    if (xhr.readyState == 4 && xhr.status == 200) {
                //////        w2popup.unlock();
                //////        w2alert('Đăng ảnh lên đám mây thành công!').ok(function () {
                //////            imgLoad();
                //////        });
                //////    }
                //////}
                //////xhr.onerror = function () {
                //////    console.log(xhr.status);
                //////    alert('Upload image error.');
                //////    w2popup.unlock();
                //////}
                //////xhr.send(fd);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }


    ////var fd = new FormData();
    ////fd.append('file', file);
    ////var xhr = new XMLHttpRequest();
    ////xhr.open('POST', '/img?file=123');

    ////xhr.onreadystatechange = function () {
    ////    if (xhr.readyState == 4 && xhr.status == 200) {
    ////        console.log(xhr.responseText);
    ////        imgLoad();
    ////    }
    ////}
    ////xhr.onerror = function () {
    ////    console.log(xhr.status);
    ////}
    ////xhr.send(fd);
}


function upload_imageCtrl($rootScope, $scope, API) {
    var module = $scope.module;
    var moduleID = module.id;
    var para = module.para;

    var title = para['title'];
    var fields = para['fields'];
    var prop_add = para['property'];

    var _width = 1024;
    var _folder = para.folder == null ? '' : para.folder;

    $().w2popup({
        title: title,
        body: '<div id="boxUploadImg" style="width: 100%; height: 100%;"><div class="w2ui-field w2ui-span3"><div>' +
            '<input id="browserFile" onchange="imgBrowserUpload(' + _width + ', \'' + _folder + '\', \'' + moduleID + '\', \'' + module.backID + '\');" type="file" />' +
            '<br/><input type="checkbox" onchange="__upload_image_not_resize = this.value;" /><lable>Nguyên kích thước</label>' +
            '</div></div></div>',
        style: 'padding: 15px 0px 0px 0px;overflow: hidden;',
        width: 320,
        height: 150,
        showClose: true,
        showMax: false,
        keyboard: false,
        modal: true,
        onToggle: function (event) {
            event.onComplete = function () {
            }
        },
        onOpen: function (event) {
            event.onComplete = function () {
            }
        },
        onClose: function (event) {
            event.onComplete = function () {
                API.module_Close(moduleID);
            }
        }
    });

    API.module_Render(moduleID);
}