(function () {
  'use strict';
  angular.module('xtui')
    .factory('XtSchoolRelateService', XtSchoolRelateService);
  XtSchoolRelateService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];

  function XtSchoolRelateService($q, ConfigService, UtilService, UserService) {
    var pageno = 1;
    var relatemelist = [];
    var hasNextPage = false;
    return {
      getRelateMe: function (type) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "XtSchoolRelateMe",
          userid: UserService.user.id,
          page: {"pageNumber": 1, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (angular.isUndefined(data.data) || data.data.length < 10) {
            relatemelist = data.data;
            hasNextPage = false;
          } else {
            hasNextPage = true;
            relatemelist = data.data;
            pageno = 2;
          }
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getMoreRelateMe: function (type) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "XtSchoolRelateMe",
          userid: UserService.user.id,
          page: {"pageNumber": pageno, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            if (data.data.length == 10) {
              relatemelist = relatemelist.concat(data.data);
              hasNextPage = true;
              pageno++;
            } else {
              relatemelist = relatemelist.concat(data.data);
              hasNextPage = false;
            }
          }
          deferred.resolve(data);
        }).error(function (data) {
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      updateRelateMe: function (list) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "updateRelateMe",
          userid: UserService.user.id,
          data: {'relatelist': list}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            console.log("success");
          }
          deferred.resolve(data);
        }).error(function (data) {
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getrelatemelist: function () {
        return relatemelist;
      },
      hasNextPage: function () {
        return hasNextPage;
      }
    }
  }
}());
