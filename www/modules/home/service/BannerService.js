angular.module('xtui').factory('BannerService', function ($q, UtilService, ConfigService, UserService) {
  var bannerlist = [];
  return {
    getbanner: function (city,rtype) {
      //rtype 0:首页头图banner，1:首页任务banner图，2:cpv任务banner图
      var deferred = $q.defer();
      var params = {
        mod: "nComm",
        func: "getBannerList",
        userid: UserService.user.id,
        data: {
          city: city,
          rtype:rtype
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        bannerlist = data.data;
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getcpvbanner: function (rtype) {
      //rtype 0:首页头图banner，1:首页任务banner图，2:cpv任务banner图
      var deferred = $q.defer();
      var params = {
        mod: "nComm",
        func: "getBannerList",
        userid: UserService.user.id,
        data: {
          rtype:rtype
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        bannerlist = data.data;
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    banner: function () {
      return bannerlist;
    }
    , clean: function () {
      var params = {
        mod: "nComm",
        func: "getBannerList"
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        this.bannerlist = data.data;
      }).error(function (data) {
      });
    }
  }
});
