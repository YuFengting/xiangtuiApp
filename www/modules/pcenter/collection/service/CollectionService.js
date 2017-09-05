'use strict';
angular.module('xtui').factory('CollectionService', function (ConfigService, $q, UtilService, UserService) {
  return {
    //获得收藏
    getStore: function (type,pageno) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getStorelist",
        userid: UserService.user.id,
        data: {type:type},
        page: {"pageNumber": pageno, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //删除任务
    deleteTask:function(taskid,type){
      var deferred=$q.defer();
      var params = {
        mod: "nStask",
        func: "storeTask",
        userid: UserService.user.id,
        data: {"taskid": taskid,tasktype:type}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    //检查任务是否存在
    judgeTaskExist:function(taskid){
      var deferred=$q.defer();
      var params={
        mod: 'NStask',
        func: 'judgeTaskOrBuserExamine',
        userid: UserService.user.id,
        data: {"taskid": taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },


  }
});
