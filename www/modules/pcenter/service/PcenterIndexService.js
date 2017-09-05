'use strict';
angular.module('xtui').factory('PcenterIndexService', function (ConfigService, $q, UtilService, UserService) {
  return {
    //获取用户信息完善标志
    getUserInfoFlag: function(){
      var deferred = $q.defer();
      var params = {
        mod:'nUser',
        func:'getSUserInfo',
        userid:UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //获取我的账户信息
    getMyAccount:function(){
      var deferred=$q.defer();
      var params={
        mod:'nAccount',
        func:'getInfo',
        userid:UserService.user.id
      };
      UtilService.post(ConfigService.server,{'jsonstr':angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //获取系统定义的banner标签
    getbanner:function(){
      var deferred=$q.defer();
      var params = {
        mod : 'nUser',
        func : 'getCenterBannerList',
        userid:UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //获取个人中心数据
    getUser:function(){
      var deferred=$q.defer();
      var params = {
        mod : 'nUser',
        func : 'getUser',
        userid:UserService.user.id
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },





  }
});
