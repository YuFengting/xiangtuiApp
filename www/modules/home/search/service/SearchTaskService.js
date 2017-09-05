'use strict';
angular.module('xtui').factory('SearchTaskService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 1;
  var readedarr = [];
  return {
    readedarr: readedarr,
    searchTask: function (extraParams) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getSearchTaskList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 20},
        data: extraParams
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    searchMerchant: function (extraParams) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getSearchMerchantList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 20},
        data: extraParams
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
