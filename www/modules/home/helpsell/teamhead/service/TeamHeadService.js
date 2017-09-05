angular.module('xtui').factory('TeamHeadService', function (ConfigService, $q, UtilService, UserService) {
  return {
    getTeamHeadDetail : function(articleid){
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getGroupByDetail",
        userid: UserService.user.id,
        data: {articleid: articleid}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    saveBean : function(param){
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "saveTeamHeadExamine",
        userid: UserService.user.id,
        data: param
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
    },
    saveWork : function(param){
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "saveWork",
        userid: UserService.user.id,
        data: param
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
