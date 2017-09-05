(function () {
  'use strict';
  angular.module('xtui')
    .factory('XtSchoolService', XtSchoolService);
  XtSchoolService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];

  function XtSchoolService($q, ConfigService, UtilService, UserService) {
    var pageNo = 1;
    var xtinfotlist = [];
    var hasNextPage = false;
    var questionid = "";
    var queindex = 0;
    var apptype = 0;//0s端  1b端
    var readedarr = [];
    return {
      readedarr: readedarr,
      getXTSchoolInfo: function (type, ptype) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolInfo",
          userid: UserService.user.id,
          data: {type: type, ptype: ptype},
          page: {"pageNumber": 1, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (angular.isUndefined(data.data.infolist) || data.data.infolist.length == 0) {
            hasNextPage = false;
            xtinfotlist[type] = [];
          } else {
            xtinfotlist[type] = data.data.infolist;
            var respage = angular.fromJson(data.page);
            hasNextPage = respage.totalPage > 1;
            pageNo = 2;
          }
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      loadMoreXTSchoolInfo: function (type, ptype) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolInfo",
          userid: UserService.user.id,
          data: {type: type, ptype: ptype},
          page: {"pageNumber": pageNo, "pageSize": 10}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            if (angular.isUndefined(data.data) || data.data.length == 0) {
              hasNextPage = false;
            } else {
              xtinfotlist[type] = xtinfotlist[type].concat(data.data.infolist);
              var respage = angular.fromJson(data.page);
              if (respage.totalPage > pageNo) {
                hasNextPage = true;
                pageNo++
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
      getXtInfoList: function (index) {
        return xtinfotlist[index];
      },
      hasNextPage: function () {
        return hasNextPage;
      },
      getPageNo: function () {
        return pageNo;
      },
      setPageNo: function (no) {
        pageNo = no
      },
      getQuestionId: function () {
        return questionid;
      },
      setQuestionId: function (queid) {
        questionid = queid
      },
      getQueIndex: function () {
        return queindex;
      },
      setQueIndex: function (index) {
        queindex = index
      },
      getType: function () {
      return apptype;
      },
      setType: function (t) {
        apptype = t
      },
      getOneXtSchoolQInfo: function (queid) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getOneXtSchoolQInfo",
          userid: UserService.user.id,
          data: {queid: queid}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  }
}());
