angular.module('xtui').factory('CityService', function ($q, UtilService, ConfigService) {
  var ischeck = false;
  var cities = null;
  var hotcities = null;
  var inCityPage = true;
  var inTaskDetail = false;
  return {
    getHotCityList: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getHotCities"
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }, getAllCities: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "getAllCities"
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }, search: function (key) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: "NComm",
        func: "searchCities",
        data: {key: key}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }, getCheck: function () {
      return ischeck;
    }, setCheck: function (c) {
      ischeck = c;
    }, getCityMap: function (data) {
      var map = [];
      for (i = 1; i <= 26; i++) {
        map.push([]);
      }
      $.each(data, function (n, v) {
        var start = v.abbrname.substring(0, 1);
        var index = parseInt(start.charCodeAt(0)) - 97;
        map[index].push(v);
      });
      var citymap = [];
      $.each(map, function (n, v) {
        var code = String.fromCharCode(n + 65);
        var unity = {key: code, value: v};
        if (v.length > 0)
          citymap.push(unity);
      });
      return citymap;
    },
    getCities: function () {
      return cities;
    },
    setCities: function (c) {
      cities = c;
    },
    getHotcities: function () {
      return hotcities;
    },
    setHotcities: function (c) {
      hotcities = c;
    },
    getInCityPage: function () {
      return inCityPage;
    },
    setInCityPage: function (icp) {
      inCityPage = icp;
    },
    getInTaskDetail: function () {
      return inTaskDetail;
    },
    setInTaskDetail: function (itd) {
      inTaskDetail = itd;
    }

  }
});
