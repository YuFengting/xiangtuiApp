'use strict';
angular.module('xtui').factory('MyCouponService', function (ConfigService, $q, UtilService, UserService) {

  var service = {
      /**
       * 获取我的cpv优惠券列表
       */
      getMyCpvCouponList: function (pageNumber, pageSize) {
          var deferred = $q.defer();
          var params = {
              mod: "nstask",
              func: "getMyCpvCouponList",
              userid: UserService.user.id,
              page: {"pageNumber": pageNumber, "pageSize": pageSize}
          };
          UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
              deferred.resolve(data);
          }).error(function (data) {
              deferred.reject(data);
          });
          return deferred.promise;
      },
      /**
       * 获取我的cpc优惠券列表
       */
      getMyWorkCouponList: function (pageNumber, pageSize) {
          var deferred = $q.defer();
          var params = {
              mod: "nstask",
              func: "getMyWorkCouponList",
              userid: UserService.user.id,
              page: {"pageNumber": pageNumber, "pageSize": pageSize}
          };
          UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
              deferred.resolve(data);
          }).error(function (data) {
              deferred.reject(data);
          });
          return deferred.promise;
      },
      /**
       * 根据coupon的id查询整套cpc优惠券信息
       */
      getMySimpleWorkCoupon: function (id) {
          var deferred = $q.defer();
          var params = {
              mod: "nstask",
              func: "getMySimpleWorkCoupon",
              userid: UserService.user.id,
              data: {"id": id}
          };
          UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
              deferred.resolve(data);
          }).error(function (data) {
              deferred.reject(data);
          });
          return deferred.promise;
      }
  };

  return service;
});
