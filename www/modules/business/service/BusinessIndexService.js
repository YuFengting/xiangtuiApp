'use strict';
angular.module('xtui').factory('BusinessIndexService', function (ConfigService, $q, UtilService, UserService) {
  var buserlist = [];
  var totalbuserlist = [];
  var pageno = 1;
  var hasNextPage = true;
  var totalpage = 0;
  var readedarr = [];
  var sharetask = [];
  return {
    readedarr: readedarr,
    sharetask: sharetask,
    pagination: function (industry, sort, city, sortindex) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'nStask',
        func: 'getTaskList',
        userid: UserService.user.id,
        data: {industry: industry, sort: sort, city: city, tasktype: "cps", querytype: sort == "recommand" ? "1" : 2},
        page: {"pageNumber": pageno, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          if (angular.isUndefined(data.data) || data.data.length == 0) {
          } else {
            totalbuserlist[sortindex] = totalbuserlist[sortindex].concat(data.data);
            hasNextPage = pageno < totalpage;
            pageno++;
          }
        }
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh: function (industry, sort, city, sortindex) {
      totalbuserlist[sortindex] = [];
      //推荐  1  其他2
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'nStask',
        func: 'getTaskList',
        userid: UserService.user.id,
        data: {industry: industry, sort: sort, city: city, tasktype: "cps", querytype: sort == "recommand" ? "1" : 2},
        page: {"pageNumber": 1, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          totalpage = angular.fromJson(data.page).totalPage;
          totalbuserlist[sortindex] = data.data;
          if (angular.isUndefined(totalbuserlist[sortindex]) || totalbuserlist[sortindex].length == 0) {
            totalbuserlist[sortindex] = [];
            hasNextPage = false;
          } else {
            hasNextPage = totalpage > 1;
          }
        }
        pageno = 2;
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getBuserList: function (sortindex) {
      return totalbuserlist[sortindex];
    },
    hasNextPage: function () {
      return hasNextPage;
    },
    resetData: function () {
      totalbuserlist = [];
      pageno = 1;
      hasNextPage = true;
    },
    getPageNo: function () {
      return pageno;
    },
    setPageNo: function (no) {
      pageno = no
    },
    setTotalList: function (totallist) {
      totalbuserlist = totallist
    },
    getIndustry: function () {
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getIndustryListOfAllTask",
        userid: UserService.user.id,
        page: null,
        data: {}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data.data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }, getIndexType: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getIndexType",
        userid: UserService.user.id,
        data: {type: 3304}
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
