/**
 * Created by Administrator on 2016/12/13.
 */
(function () {
  'use strict';

  angular
    .module('xtui')
    .factory('MerryService', MerryService);

  MerryService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];

  function MerryService($q, ConfigService, UtilService, UserService) {
    var apple_log_list = [];
    var apple_task_list = [];
    var my_apple_number = 0;
    return {
      getChristmasIndexInfo: function (acname) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "getNewYearIndexInfo",
          userid: UserService.user.id,
          data: {actname: acname}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          apple_log_list = res.data.loglist;
          my_apple_number = res.data.appleno;
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getChristmasIndexList: function (acname) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "getNewYearIndexList",
          userid: UserService.user.id,
          data: {actname: acname}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          if (res.status == '000000') {
            if (angular.isUndefined(res.data) || res.data.length == 0) {
              apple_task_list = [];
            } else {
              apple_task_list = res.data;
            }
          }
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getFirstRewardLog: function (acname,cityname,version,deviceno) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "addNewYearFirstRewardLog",
          userid: UserService.user.id,
          data: {actname: acname, tel: UserService.user.tel,city:cityname,no:version,uuid:deviceno}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getConsumeRewardLog: function (acname, appleToken) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "consumeNewYearRewardLog",
          userid: UserService.user.id,
          token: appleToken,
          data: {actname: acname}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getActBanner: function (cityname,version) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "getCommactBanner",
          userid: UserService.user.id,
          data: {tel: UserService.user.tel,city:cityname,no:version}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      addChristmasActUser: function (acname) {
        var deferred = $q.defer();
        var params = {
          mod: "Commact",
          func: "addNewYearActUser",
          userid: UserService.user.id,
          data: {actname: acname}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getAppleTaskList: function () {
        return apple_task_list;
      },
      getAppleLogList: function () {
        return apple_log_list;
      },
      getMyAppleNumber: function () {
        return my_apple_number;
      }
    }
  }
}())
