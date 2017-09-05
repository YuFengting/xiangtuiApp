angular.module('xtui')
    .factory('BarcodeService', function (UtilService, UserService, ConfigService, $q) {
        var service = {};

        service.ios_scan_flg = false;

        /**
        android和ios调用了不同插件，该方法为前端提供一个统一接口。
         统一返回格式(采用android的格式)：{code: 0, scanType: 1, result: "I love you."}
         code:0-扫描出了结果；1-要跳转到券验证码页面。
         */
        service.scan = function(option, success, fail) {
            var scanType = 0;
            if(option && option.scanType) {
                scanType = option.scanType;
            }
            if(device.platform == "Android") {
                navigator.xtuiScan.scan(parseInt(scanType), function(result){
                    if(result && result.code == -1) {
                        //取消
                    } else {
                        success({code: result.code, scanType: parseInt(result.scanType), result: result.result});
                    }
                }, function(errCode){
                    if(fail) {
                        fail();
                    }
                });
            } else {
                if(service.ios_scan_flg == true) {
                    return;
                } else {
                    service.ios_scan_flg = true;
                }

                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        service.ios_scan_flg = false;
                        if(result && result.cancelled == 1) {
                            //取消算作失败
                        } else {
                            var code = 0;
                            if(result && result.recognized == 1) {
                                code = 1;
                            }
                            success({code: code, scanType: parseInt(result.scanType), result: result.text});
                        }
                    },
                    function (error) {
                        service.ios_scan_flg = false;
                        if(fail) {
                            fail();
                        }
                    },
                    [String(scanType)]
                );
            }
        };

        service.generateQcode = function (content) {
            var deferred = $q.defer();
            var param = {
                mod:'nUser',
                func:'generateQcode',
                userid: UserService.user.id,
                data: {
                    content: content
                }
            };
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(param)}).success(function(data){
                deferred.resolve(data);
            }).error(function(data){
                deferred.reject(data);
            });
            return deferred.promise;
        };

        return service;
    });
