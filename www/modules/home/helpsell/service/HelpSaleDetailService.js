angular.module('xtui').factory('HelpSaleDetailService', function($q,UtilService,ConfigService,UserService) {

  return {
    getcpsdetail: function(taskid){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getCpsTaskDetail",
        userid: UserService.user.id,
        data:{taskid:taskid}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getcpsRecommTask: function(taskid,cityname){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getCpsMerRecommTask",
        userid: UserService.user.id,
        data:{taskid:taskid,cityname:cityname}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    storetask: function(taskid){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"storeTask",
        userid: UserService.user.id,
        data:{taskid:taskid}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
