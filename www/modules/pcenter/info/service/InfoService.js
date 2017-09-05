/**
 * Created by wangjie on 2016/3/11.
 */
'use strict';
angular.module('xtui').factory('InfoService', function(ConfigService,$q,UtilService,UserService) {
  return {
    updateUser: function(param){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod : 'nUser',
        func : 'setSUser',
        userid:UserService.user.id,
        data :param
      }
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function (data) {
        console.log(data.status);
        if (data.status == '000000') {
        }else if(data.status != '500004') {
          UtilService.showMess(data.msg);
        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },setSUserNickAndAvate: function(param){
    //控制ajax请求异步变同步
    var deferred = $q.defer();
    var params = {
      mod : 'nUser',
      func : 'setSUserNickAndAvate',
      userid:UserService.user.id,
      data :param
    }
    UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function (data) {
      console.log(data.status);
      if (data.status == '000000') {
      }else if(data.status != '500004') {
        UtilService.showMess(data.msg);
      }
      deferred.resolve(data);
    }).error(function(data){
      deferred.reject(data);
    });
    return deferred.promise;
  },
    getTasks:function (){
    }
  }
});
