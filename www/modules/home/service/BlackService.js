angular.module('xtui').factory('BlackService', function ($q, UtilService, ConfigService, $cordovaGeolocation, $http, UserService) {
  var addresspro = "";
  var addresscity = "";
  var locationdescribe = "";
  var district = "";
  return {
    getLocationImg: function () {
      var deferred = $q.defer();
      if (device.platform == "Android") {
        this.baiduaddress().then(function (arr) {
          var long = arr[2];
          var lat = arr[3];
          var url = "http://api.map.baidu.com/staticimage/v2";
          url += "?center=" + long + "," + lat;
          url += "&scale=1";
          url += "&zoom=18&ak=pQzymZWANF2v0G9ekQkflSB0";
          url += "&mcode=7f6e61c239c02301ed9a8f852bdb53f3";
          deferred.resolve(url);
        }, function () {
          UtilService.showMess("定位失败");
          deferred.reject();
        });
      } else {
        this.gpsaddress().then(function (arr) {
          var x = arr[2];
          var y = arr[3];
          var url = "http://api.map.baidu.com/staticimage/v2";
          url += "?center=" + x + "," + y;
          url += "&scale=1";
          url += "&zoom=18&ak=pQzymZWANF2v0G9ekQkflSB0";
          url += "&mcode=7f6e61c239c02301ed9a8f852bdb53f3";
          deferred.resolve(url);
        }, function () {
          UtilService.showMess("定位失败");
          deferred.reject();
        });
      }
      return deferred.promise;
    },
    baiduaddress: function () {
      var deferred = $q.defer();
      if (device.platform == "Android") {
        baidulocation.getCurrentPosition(function (resultData) {
          //resultData 包括省份和城市，以逗号分隔开
          var arr = resultData.split(",");
          arr[1] = arr[1].replace("市", "");
          UserService.location = {
            'x': arr[2],
            'y': arr[3],
            'city': arr[1],
            'province': arr[0],
            'locationdescribe': arr[4]
          };
          deferred.resolve(arr);
        }, function () {
          addresspro = "";
          addresscity = "";
          deferred.reject();
        });
      } else {
        var arr = [];
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          var x = position.coords.longitude;//经度
          var y = position.coords.latitude;//纬度
          $http({
            method: "get",
            url: "http://api.map.baidu.com/geocoder/v2/",
            params: {
              "output": "json",
              "coordtype": "gcj02ll",
              "location": y + "," + x,
              "ak": "pQzymZWANF2v0G9ekQkflSB0",
              "mcode": "7f6e61c239c02301ed9a8f852bdb53f3"
            }
          }).success(function (data) {
            if (data.status == 0) {
              addresspro = data.result.addressComponent.province;
              addresscity = data.result.addressComponent.city;
              district = data.result.addressComponent.district;
              addresscity = addresscity.replace("市", "");
              locationdescribe = data.result.formatted_address;
            } else {
              addresspro = "";
              addresscity = "";
            }
            UserService.location = {
              'x': x,
              'y': y,
              'city': addresscity,
              'province': addresspro,
              'locationdescribe': locationdescribe,
              'district': district
            };
            arr.push(addresspro);
            arr.push(addresscity);
            arr.push(x);
            arr.push(y);
            arr.push(locationdescribe);
            arr.push(district);
            deferred.resolve(arr);
          }).error(function () {
            deferred.reject();
            addresscity = "";
          });
        }, function () {
          deferred.reject();
          addresscity = "";
        });
      }
      return deferred.promise;
    },
    gpsaddress: function () {
      var deferred = $q.defer();
      var arr = [];
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var x = position.coords.longitude;//经度
        var y = position.coords.latitude;//纬度
        $http({
          method: "get",
          url: "http://api.map.baidu.com/geocoder/v2/",
          params: {
            "output": "json",
            "coordtype": "gcj02ll",
            "location": y + "," + x,
            "ak": "pQzymZWANF2v0G9ekQkflSB0",
            "mcode": "7f6e61c239c02301ed9a8f852bdb53f3"
          }
        }).success(function (data) {
          if (data.status == 0) {
            addresspro = data.result.addressComponent.province;
            addresscity = data.result.addressComponent.city;
            addresscity = addresscity.replace("市", "");
            locationdescribe = data.result.formatted_address;
          } else {
            addresspro = "";
            addresscity = "";
          }
          UserService.location = {
            'x': x,
            'y': y,
            'city': addresscity,
            'province': addresspro,
            'locationdescribe': locationdescribe
          };
          arr.push(addresspro);
          arr.push(addresscity);
          arr.push(x);
          arr.push(y);
          deferred.resolve(arr);
        }).error(function () {
          deferred.reject();
          addresscity = "";
        });
      }, function () {
        deferred.reject();
        addresscity = "";
      });
      return deferred.promise;
    }
    , senduuid: function (phonetype, arr) {
      ConfigService.no = device.uuid;
      var params = {
        mod: "nComm",
        func: "install",
        data: {
          from: ConfigService.from,//渠道码
          machine: device.model,//机型
          phoneversion: device.version,//手机版本号
          appversion: ConfigService.versionno,//app版本号
          province: arr[0],
          area: arr[1],//地区
          no: device.uuid, //机器码
          type: phonetype,
          apptype: "s"
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
      })
    }
    , login: function () {
      var deferred = $q.defer();
      var tel = UserService.user.tel;
      var pwd = UserService.user.pwd;
      var params = {
        mod: "nUser",
        func: "login",
        data: {
          tel: tel,
          passwd: pwd,
          type: 's',
          from: ConfigService.from,
          appversion: ConfigService.versionno,//app版本号
          province: UserService.location.province,
          area: UserService.location.city,//地区
          no: device.uuid
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          UserService.user = data.data;
          UserService.autologin = true;
          if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
            if (device.platform == "Android") {
              GeTuiSdkPlugin.bindAlias(function () {
              }, UserService.user.id);
            } else {
              GeTuiSdk.bindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
            }
          }
        }
        deferred.resolve(data);
      }).error(function () {
        deferred.reject();
      });
      return deferred.promise;
    }
    , clearXGToken: function () {
      var deferred = $q.defer();
      var params = {
        mod: "Comm",
        func: "clearXGToken",
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        deferred.resolve(data);
      }).error(function () {
        deferred.reject();
      });
      return deferred.promise;
    }
  }
});
