'use strict';
angular.module('xtui').factory('RecommendService', function (ConfigService, $q, UtilService, UserService) {
  var pageno = 2;
  var hasNextPage = true;
  var RecommendList = [];
  var recommendmoreflg ="";
  return {
    getRecommend: function (taskid,workid) {
      RecommendList = [];
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRecommendDetail",
        userid: UserService.user.id,
        page: {"pageNumber": 1, "pageSize": 10},
        data :{"taskid":taskid,"workid":workid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = true;
        recommendmoreflg=data.data.getmoreflg;
        if (angular.isUndefined(data.data) || data.data.length == 0) {
          hasNextPage = false;
        } else {
          RecommendList = data.data.couponlist;
          pageno = 2;
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    loadMoreRecommend: function (taskid,workid) {
      var deferred = $q.defer();
      var params = {
        mod: "nUser",
        func: "getRecommendDetail",
        userid: UserService.user.id,
        page: {"pageNumber": pageno, "pageSize": 10},
        data :{"taskid":taskid,"workid":workid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        hasNextPage = false;
        recommendmoreflg=data.data.getmoreflg;
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            hasNextPage = false;
          } else {
            RecommendList = RecommendList.concat(data.data);
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
    getRecommendList: function () {
      return RecommendList;
    },
    getRecommendMoreFlag: function () {
      return recommendmoreflg;
    },
    hasNextPage: function () {
      return hasNextPage;
    }
  }
});
