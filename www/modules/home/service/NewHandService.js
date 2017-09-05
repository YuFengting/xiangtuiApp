angular.module('xtui').factory('NewHandService', function ($q, UtilService, ConfigService, UserService) {
  return {
    //同步步数到数据库
    syncNewHandStep: function (step) {
      //控制ajax请求异步变同步-
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "syncNewHandStep",
        userid: UserService.user.id,
        data: {step: step, v: ConfigService.versionno}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //获取步数
    getNewHandStep: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "getNewHandStep",
        userid: UserService.user.id,
        data: {v: ConfigService.versionno}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //获取新手引导的类型
    checkNewHandType: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "checkNewHandType",
        userid: UserService.user.id,
        data: {tel: UserService.user.tel}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //第一次给的5块
    newHandFirstEnd: function (token, first) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "newHandFirstEnd",
        userid: UserService.user.id,
        data: {v: ConfigService.versionno},
        token: token
      };
      if (first) {
        params.data = angular.extend(params.data, {first: 1});
      }
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //首页判断分享无回调的情况是否有钱
    checkWhetherHasIncome: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "checkWhetherHasIncome",
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //首页判断分享无回调的情况是否有钱
    newHandLastEnd: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "Nuser",
        func: "newHandLastEnd",
        userid: UserService.user.id,
        data: {v: ConfigService.versionno}
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
