(function(){
  'use strict';
  angular.module("xtui").factory("BusinessIndexService", BusinessIndexService);

  BusinessIndexService.$inject = ["ConfigService","$q","UtilService","UserService"];
  function BusinessIndexService(ConfigService,$q,UtilService,UserService) {
    var readedarr = [];
    return {
      readedarr: readedarr,
      getBusinessDetailAndList: function (merchantid) {
        var deferred = $q.defer();
        var params = {
          mod: "nStask",
          func: "getBusinessDetailAndList",
          userid: UserService.user.id,
          data: {"merchantid": merchantid}
        };
        UtilService.post(ConfigService.server, {"jsonstr": angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      concernBusiness:function (merchantid) {
        var deferred = $q.defer();
        var params = {
          mod: "nUser",
          func: "storeMerchant",
          userid: UserService.user.id,
          data: {"merchantid": merchantid}
        };
        UtilService.post(ConfigService.server, {"jsonstr": angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      delFriend:function (merchantid) {
        var deferred = $q.defer();
        var params = {
          mod: "IM",
          func: "delFriend",
          userid: UserService.user.id,
          data: {
            friendid: merchantid
          }
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      }
    };
  }

})();
