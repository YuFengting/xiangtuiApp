'use strict';
angular.module('xtui').factory('AccountService', function (ConfigService, $q, UtilService, UserService) {
  var pcenter_money = -1;
  return {
    //验证支付宝账号
    checkAlipay: function (alipay) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nAccount",
        func: "checkAlipay",
        userid: UserService.user.id,
        data: {'alipay': alipay}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          deferred.resolve(true);
        } else if (data.status == '100901') {
          deferred.resolve(false);
        }
      }).error(function () {
        deferred.reject(false);
      });
      return deferred.promise;
    },
    setPcenterMoney: function (pcenterMoney) {
      pcenter_money = pcenterMoney;
    },
    getPcenterMoney: function () {
      return pcenter_money;
    },
    reastBackupMoney:function(){
      pcenter_money = -1;
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

    //获取账户流水信息
    getLogs:function(type,pageno){
      var deferred=$q.defer();
      var params = {
        mod: "nAccount",
        func: "getLogs",
        userid: UserService.user.id,
        data: {type: type.value},
        page: {pageNumber: pageno, pageSize: 10}
      };
      UtilService.get(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //拆红包
    openRedPacket:function(taskid){
      var deferred=$q.defer();
      var params = {
        mod: "nUser",
        func: "openRedPackage",
        userid: UserService.user.id,
        data: {taskid:taskid}
      };
      UtilService.post(ConfigService.server,{'jsonstr':angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
  }
});
