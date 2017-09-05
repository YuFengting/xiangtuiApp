angular.module('xtui').factory('TaskIndexService', function ($q, UtilService, ConfigService, UserService) {
  var pageno = 1;
  var hasNextPage = true;
  var tlist = [];
  var readedarr = [];
  return {
    readedarr: readedarr,
    pagination: function (sort, city, tasktype) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      if (angular.isUndefined(UserService.user.id)) {
        UserService.user.id = "";
      }
      var params = {
        mod: "NStask",
        func: "getHomeTaskList",
        userid: UserService.user.id,
        data: {pageno: pageno, count: 50, sort: sort, city: city, tasktype: tasktype}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (angular.isDefined(data.data) && data.data.length > 0) {
          tlist = tlist.concat(data.data);
          if (data.data.length < 10) {
            hasNextPage = false;
          } else {
            hasNextPage = true;
          }
          pageno++;
          //只取前5页
          if (pageno == 6) {
            hasNextPage = false;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh: function (sort, city, tasktype, first) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      if (angular.isUndefined(UserService.user.id)) {
        UserService.user.id = "";
      }
      var params = {
        mod: "NStask",
        func: "getHomeTaskList",
        userid: UserService.user.id,
        data: {
          pageno: 1,
          count: 50,
          sort: sort,
          city: city,
          tasktype: tasktype,
          x: UserService.location.x,
          y: UserService.location.y
        }
      };
      if (first) {
        params.data = angular.extend(params.data, {first: 1});
      }
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        if (data.data.length < 10) {
          hasNextPage = false;
        } else {
          hasNextPage = true;
        }
        tlist = data.data;
        pageno = 2;
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
      tlist = [];
      hasNextPage = true;
    },
    getpageno: function () {
      return pageno;
    },
    getlist: function () {
      return tlist;
    },
    getTopicList: function (city) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getHomeTopics",
        userid: UserService.user.id,
        data: {
          city: city
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getIndustryList: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getHomeIndustries",
        data: {num: 6}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getIndexType: function (city) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getIndexType",
        userid: UserService.user.id,
        data: {type: 30501, city: city}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    setPageno: function (p) {
      pageno = p;
    },
    setHasNextpage: function (n) {
      hasNextPage = n;
    }
  }
});
