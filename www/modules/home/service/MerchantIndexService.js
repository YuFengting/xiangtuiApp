'use strict';
angular.module('xtui').factory('MerchantIndexService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 1;
  var hasNextPage = true;
  var mlist = [];
  return {
    pagination: function (extraParams) {
      extraParams.pageno = pageno;
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NStask",
        func: "getSearchList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data: extraParams
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果   nextPage hasNextPage 在service处理;
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isDefined(data.data) && data.data.length > 0) {
            mlist = mlist.concat(data.data);
            hasNextPage = data.data.length >= 10;
            pageno++;
            //只取前5页
            if (pageno == 6) {
              hasNextPage = false;
            }
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh: function (extraParams) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getSearchList",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 50},
        data: extraParams
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.data != null && data.data.length == 50) {
          mlist = data.data;
          hasNextPage = true;
        } else {
          hasNextPage = false;
        }
        pageno++;
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
      pageno = 1;
      mlist = [];
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    },
    getmlist: function () {
      return mlist;
    }
  }
});
