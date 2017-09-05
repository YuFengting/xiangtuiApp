'use strict';
angular.module('xtui').factory('TabbindexService', function (ConfigService, $q, UtilService, UserService) {
  var buserindexs = [];
  var pageno = 1;
  var hasNextPage = true;
  return {
    getBusinessDetail: function (buserid) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'nUser',
        func: 'merchantSimple',
        userid: UserService.user.id,
        data: {buserid: buserid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getBusinessList: function (buserid) {
      var deferred = $q.defer();
      var params = {
        mod: 'nStask',
        func: 'getTaskListByMerchantId',
        userid: UserService.user.id,
        data: {merchantid: buserid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      buserindexs = [];
      pageno = 1;
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    }
  }
});
