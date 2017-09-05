(function(){
  'use strict';
  angular
    .module("xtui")
    .factory("PhonebookService", PhonebookService);

  PhonebookService.$inject = ["ConfigService","$q","UtilService","UserService"];

  function PhonebookService(ConfigService,$q,UtilService,UserService) {

    return {
      checkmobiles: function(mobiles){
        //控制ajax请求异步变同步
        var deferred = $q.defer();
        var params = {
          mod: "IM",
          func: "checkMobilesIsReigster",
          userid: UserService.user.id,
          data:{"mobiles":mobiles}
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          if(data.status == "000000") {
            deferred.resolve(data);
          }else{
            deferred.reject(data);
          }
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      sendInviteMsg: function(tel){
        //控制ajax请求异步变同步
        var deferred = $q.defer();
        var params = {
          mod: "NComm",
          func: "sendInviteMsg",
          userid: UserService.user.id,
          data:{"tel":tel}
        };
        UtilService.post(ConfigService.server, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getSUserByTelOrNick: function(key){
        //控制ajax请求异步变同步
        var deferred = $q.defer();
        var params = {
          mod: "NUser",
          func: "getSUserByTelOrNick",
          userid: UserService.user.id,
          data:{"key":key}
        };
        UtilService.post(ConfigService.server, {"jsonstr": angular.toJson(params)}).success(function(data){
          if(data.status == "000000") {
            deferred.resolve(data);
          }else{
            deferred.reject(data);
          }
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      }


    };

  }



})()
