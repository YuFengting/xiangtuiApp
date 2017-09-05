/**
 * Created by Administrator on 2016/8/12.
 */
(function () {
  'use strict';

  angular
    .module('xtui')
    .factory('RechargeService', RechargeService);

  RechargeService.$inject = ['$q','ConfigService', 'UtilService'];

  function RechargeService($q,config, util) {
    return {
      mobilePhoneRecharge: function (phone,userid) {
        var deferred = $q.defer();
        var params = {
          mod: "NUser",
          func: "mobilePhoneRecharge",
          userid:userid,
          data: phone
        };
        util.post(config.server, {'jsonstr': angular.toJson(params)}).success(function(res){
          deferred.resolve(res);
        }).error(function () {
          util.showMess("网络不给力，请稍后刷新");
        });
        return deferred.promise;
      },
      getAccountMoney:function(userid){
        var deferred = $q.defer();
        var params = {
          mod:'nAccount',
          func:'getInfo',
          userid:userid
        };
        util.post(config.server, {'jsonstr':angular.toJson(params)}).success(function (result) {
         deferred.resolve(result.data);
        }).error(function () {
          util.showMess("网络不给力，请稍后刷新");
        });
        return deferred.promise;
      }
    }
  }
}())
