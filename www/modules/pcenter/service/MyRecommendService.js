'use strict';
angular.module('xtui').factory('MyRecommendService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 2;
  var hasNextPage = false;
  var myRecommendList = [];
  return {
    getMyrecommends: function (type) {
      myRecommendList = [];
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRecommentList",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (angular.isUndefined(data.data) || data.data.length == 0) {
          hasNextPage = false;
        } else {
          myRecommendList = data.data;
          pageno = 2;
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    loadMoreRecommend: function () {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRecommentList",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = false;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            hasNextPage = false;
          } else {
            myRecommendList = myRecommendList.concat(data.data);
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
    getMyrecommendsList: function () {
      return myRecommendList;
    },
    hasNextPage: function () {
      return hasNextPage;
    }
  }
});
