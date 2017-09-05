'use strict';
angular.module('xtui').factory('MyAttentionService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 2;
  var hasNextPage = false;
  var AttentionList = [];
  return {
    getAttention: function (type) {
      AttentionList = [];
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getAttentionList",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (angular.isUndefined(data.data) || data.data.length == 0) {
          hasNextPage = false;
        } else {
          AttentionList = data.data;
          pageno = 2;
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    loadMoreAttention: function (type) {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getAttentionList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            hasNextPage = false;
          } else {
            AttentionList = AttentionList.concat(data.data);
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
    getAttentionList: function () {
      return AttentionList;
    },
    hasNextPage: function () {
      return hasNextPage;
    }
  }
});
