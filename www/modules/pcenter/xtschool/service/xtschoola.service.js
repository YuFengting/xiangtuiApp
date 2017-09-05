(function () {
  'use strict';
  angular.module('xtui')
    .factory('XtSchoolAService', XtSchoolAService);
  XtSchoolAService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];

  function XtSchoolAService($q, ConfigService, UtilService, UserService) {
    var pageNo = 1;
    var answerList = [];
    var hasNextPage = false;
    return {
      addXTSchoolAnswer: function (data) {//data => {id:xx,con:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "addXTSchoolAnswer",
          userid: UserService.user.id,
          data: data
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      },
      doRefresh: function (data) {
        pageNo=1;//data => {id:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolAnswers",
          userid: UserService.user.id,
          data: data,
          page: {"pageNumber": 1, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          if (res.status == '000000') {
            if (angular.isUndefined(res.data) || res.data.length == 0) {
              hasNextPage = false;
              answerList = [];
            } else {
              answerList = res.data;
              var respage = angular.fromJson(res.page);
              if (respage.totalPage > pageNo) {
                hasNextPage = true;
                pageNo=2;
              } else {
                hasNextPage = false;
              }
            }
          }
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      },
      loadMore: function (data) {//data => {id:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolAnswers",
          userid: UserService.user.id,
          data: data,
          page: {"pageNumber": pageNo, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          if (res.status == '000000') {
            if (angular.isUndefined(res.data) || res.data.length == 0) {
              hasNextPage = false;
            } else {
              answerList = answerList.concat(res.data);
              var respage = angular.fromJson(res.page);
              if (respage.totalPage > pageNo) {
                hasNextPage = true;
                pageNo++;
              } else {
                hasNextPage = false;
              }
            }
          }
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      },
      getXTSchoolRepliesByAnswerid: function (data) {//data => {id:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolRepliesByAnswerid",
          userid: UserService.user.id,
          data: data
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      },
      getList: function () {
        return answerList;
      },
      hasNextPage: function () {
        return hasNextPage;
      },
      xtSchoolPraise: function (data) {//data => {aid:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "xtSchoolPraise",
          userid: UserService.user.id,
          data: data
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      },
      delXTSchoolAnswerById: function (data) {//data => {aid:xx}
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "delXTSchoolAnswerById",
          userid: UserService.user.id,
          data: data
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (res) {
          deferred.reject(res);
        });
        return deferred.promise;
      }
    }
  }
})();
