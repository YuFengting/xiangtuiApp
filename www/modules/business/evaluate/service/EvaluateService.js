'use strict';
angular.module('xtui').factory('EvaluateService', function (ConfigService, $q, UtilService, UserService) {
  var busercommentindexs = [];
  var pageno = 1;
  var hasNextPage = true;
  return {
    pagination: function (buserid) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getCommentlist",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data: {"merchantid": buserid, "type": 0}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果   nextPage hasNextPage 在service处理
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            if (pageno == 1) {
              busercommentindexs = [];
            }
          } else {
            if (pageno == 1) {
              busercommentindexs = data.data;
            } else {
              busercommentindexs = busercommentindexs.concat(data.data);
            }
            hasNextPage = data.data.length == 10;
            pageno++;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh: function (buserid) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getCommentlist",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data: {"merchantid": buserid, "type": 0}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        busercommentindexs = data.data;
        pageno = 2;
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            busercommentindexs = [];
          } else {
            hasNextPage = data.data.length == 10;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getCommentdetail: function (buserid) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'nUser',
        func: 'getCommentdetail',
        data: {merchantid: buserid, "type": 0}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getBuserComments: function () {
      return busercommentindexs;
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      busercommentindexs = [];
      pageno = 1;
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    }
  }
});
