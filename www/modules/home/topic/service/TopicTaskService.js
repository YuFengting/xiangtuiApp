'use strict';
angular.module('xtui').factory('TopicTaskService', function (ConfigService, $q, UtilService, UserService) {
  var tasklist = [];
  var pageno = 1;
  var hasNextPage = true;
  return {
    pagination: function (id) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NStask",
        func: "getTopicTaskList",
        userid: UserService.user.id,
        data: {"topicid": id}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果   nextPage hasNextPage 在service处理
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            if (pageno == 1) {
              tasklist = "";
            }
          } else {
            if (pageno == 1) {
              tasklist = data.data;
            } else {
              tasklist = tasklist.concat(data.data);
            }
            if (data.data.length == 10) {
              hasNextPage = true;
            }
            pageno++;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh: function (id) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getTopicTaskList",
        userid: UserService.user.id,
        data: {"topicid": id}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        tasklist = data.data;
        pageno = 2;
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            tasklist = "";
          } else {
            if (data.data.length == 10) {
              hasNextPage = true;
            }
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getTasks: function () {
      return tasklist;
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      tasklist = [];
      pageno = 1;
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    },
    getTopicMerchantList: function (ids) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getTopicMerchantList",
        userid: UserService.user.id,
        data: {"ids": ids.join(",")}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }, getTopicById: function (id) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nComm",
        func: "getTopicById",
        userid: UserService.user.id,
        data: {"id": id}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
