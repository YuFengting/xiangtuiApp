'use strict';
angular.module('xtui').factory('BusinessService', function (ConfigService, $q, UtilService, UserService) {
  var busertaskindexs = [];
  var pageno = 1;
  var hasNextPage = true;
  return {
    pagination: function (buserid, clouduser) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Stask",
        func: "getBuserTasklist",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data: {"merchantid": buserid, "clouduser": clouduser}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果   nextPage hasNextPage 在service处理
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data.taskList) || data.data.taskList.length == 0) {
            if (pageno == 1) {
              busertaskindexs = [];
            }
          } else {
            if (pageno == 1) {
              busertaskindexs = data.data.taskList;
            } else {
              busertaskindexs = busertaskindexs.concat(data.data.taskList);
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
    refresh: function (buserid, clouduser) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Stask",
        func: "getBuserTasklist",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10},
        data: {"merchantid": buserid, "clouduser": clouduser}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        busertaskindexs = data.data.taskList;
        pageno = 2;
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data.taskList) || data.data.taskList.length == 0) {
            busertaskindexs = [];
          } else {
            hasNextPage = data.data.taskList.length == 10;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getBuserTasks: function () {
      return busertaskindexs;
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      busertaskindexs = [];
      pageno = 1;
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    }
  }
});
