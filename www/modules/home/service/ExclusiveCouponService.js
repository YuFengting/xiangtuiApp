'use strict';
angular.module('xtui').factory('ExclusiveCouponService', function (ConfigService, $q, UtilService, UserService) {
  return {
    getExclusiveCoupon: function (taskid) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getExclusiveCoupon",
        userid: UserService.user.id,
        data: {taskid:taskid}
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
