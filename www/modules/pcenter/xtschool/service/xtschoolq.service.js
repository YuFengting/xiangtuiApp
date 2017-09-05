(function () {
  'use strict';
  angular.module('xtui')
    .factory('XtSchoolQuestionService', XtSchoolQuestionService);
  XtSchoolQuestionService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];

  function XtSchoolQuestionService($q, ConfigService,UtilService, UserService) {
    return {
      addXtSchoolQ: function (str,type) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "addXtSchoolQ",
          userid: UserService.user.id,
          data: {
            "content": str,
            "type":type
          }
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getXTSchoolQuestionById: function (id) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "getXTSchoolQuestionById",
          userid: UserService.user.id,
          data: {"id": id}
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      increaseReadNum: function (id) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "increaseReadNum",
          userid: UserService.user.id,
          data: {"id": id}
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
