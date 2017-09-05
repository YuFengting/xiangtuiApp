'use strict';
angular.module('xtui').factory('MyRedpackagService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 2;
  var hasNextPage = false;
  var packageList = [];
  return {
    getRedpackage: function (type) {
      packageList = [];
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRedpackageList",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10},
        data: {v: ConfigService.versionno}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (angular.isUndefined(data.data) || data.data.length == 0) {
          hasNextPage = false;
        } else {
          packageList = data.data;
          pageno = 2;
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    loadMoreRedpackage: function (type) {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRedpackageList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            hasNextPage = false;
          } else {
            packageList = packageList.concat(data.data);
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
    getpackageList: function () {
      return packageList;
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    openRedPackage: function (workid) {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "openRedPackage",
        userid: UserService.user.id,
        data: {workid: workid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    openAllRedPackage: function () {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "openAllRedPackage",
        userid: UserService.user.id
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
