'use strict';
angular.module('xtui').factory('FastGetService', function (ConfigService, $q, UtilService, UserService) {
  var allsharelist = [];
  var pageno = 1;
  var hasNextPage = true;
  var readedarr = [];
  var sharetask = [];
  return {
    readedarr: readedarr,
    sharetask: sharetask,
    pagination: function (param, sortindex) {
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getTaskList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data: param
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            hasNextPage = false;
          } else {
            allsharelist[sortindex] = allsharelist[sortindex].concat(data.data);
            var respage = angular.fromJson(data.page);
            if (respage.totalPage > pageno) {
              hasNextPage = true;
              pageno++
            } else {
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
    refresh: function (param, sortindex) {
      pageno = 2;
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getTaskList",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10},
        data: param
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            allsharelist[sortindex] = [];
            hasNextPage = false;
          } else {
            allsharelist[sortindex] = data.data;
            var respage = angular.fromJson(data.page);
            hasNextPage = respage.totalPage > 1;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getIndexType: function () {
      var deferred = $q.defer();
      var params = {
        mod: "nComm",
        func: "getIndexType",
        userid: UserService.user.id,
        data: {type: 30502}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getAllShareList: function (sortindex) {
      return allsharelist[sortindex];
    },
    getNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      allsharelist = [];
      pageno = 1;
      hasNextPage = true;
    },
    getSharePageNo: function () {
      return pageno;
    },
    setSahrePageNo: function (no) {
      pageno = no
    },
    setAllSahreList: function (sharelist) {
      allsharelist = sharelist;
    }

  }
});
