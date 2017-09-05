'use strict';
angular.module('xtui').factory('RegistService', function (ConfigService, $q, UtilService,UserService) {
  return {
    checkAlipay: function (token, fscode) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Comm",
        func: "checkPicCodeForRegister",
        data: {'token': token, 'fscode': fscode}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          deferred.resolve(true);
        } else if (data.status != '500004') {
          deferred.resolve(false);
        }
      }).error(function () {
        deferred.reject(false);
      });
      return deferred.promise;
    }
  }
});
