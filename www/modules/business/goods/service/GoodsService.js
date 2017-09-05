angular.module('xtui').factory('GoodsService', function ($q, UtilService, ConfigService) {
  return {
    getGoodsList: function (merchantId) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "nStask",
        func: "getnGoodByMerchantid",
        data: {"merchantId": merchantId}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
