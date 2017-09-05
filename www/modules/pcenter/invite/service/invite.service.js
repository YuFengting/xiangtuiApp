/**
 * Created by Administrator on 2016/8/12.
 */
(function () {
  'use strict';

  angular
    .module('xtui')
    .factory('InviteService', InviteService);

  InviteService.$inject = ['$q','ConfigService', 'UtilService','UserService'];

  function InviteService($q,config, util,userservice) {
    return {
      getZxcodePic: function (p_url,p_code) {
        var deferred = $q.defer();
        var params = {
          mod: "NUser",
          func: "getZxcodePic",
          userid:userservice.user.id,
          data: {
            url:p_url,
            code:p_code
          }
        };
        util.post(config.server, {'jsonstr': angular.toJson(params)}).success(function(res){
          deferred.resolve(res);
        }).error(function () {
          util.showMess("网络不给力，请稍后刷新");
        });
        return deferred.promise;
      }
    }
  }
}())
