angular.module('xtui')
//个人中心
  .controller("ShanController", function (MsgService, $scope, $rootScope, SqliteUtilService, $ionicHistory, UserService, ConfigService, UtilService, $window, $timeout, $ionicSlideBoxDelegate, StorageService, IMSqliteUtilService,$interval,$stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      SqliteUtilService.deleteData("DROP TABLE hometask");
      SqliteUtilService.deleteData("DROP TABLE topic");
    });

    $scope.$on("$ionicView.beforeLeave", function () {
      $interval.cancel($scope.times);
    });

    $scope.imgurl = $stateParams.imgurl;
    $scope.ifshowpage = true;
    $scope.checkSlideState = function () {
      var pagenum = $ionicSlideBoxDelegate.$getByHandle('welpage').currentIndex();
      $scope.ifshowpage = pagenum != 3;
    };

    var flg = 0;
    var getData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var load = $scope.loaddata = resultData;
          if (load == null || load == "" || load == undefined) {
            flg = 0;
          } else {
            var us = load.split(",");
            UserService.user.id = us[0];
            UserService.user.tel = us[1];
            UserService.user.pwd = us[2];
            UserService.user.avate = us[3];
            UserService.user.nick = us[4];
            flg = 1;
          }
        }, function () {
          flg = 0;
        }, "loadpage");
      }
      catch (e) {
        flg = 0;
      }
    };
    getData();

    var goflg = 0;
    $scope.goHome = function () {
      if(goflg != 0){
        return;
      }
      goflg = 1;
      if (flg == 0) {
        $scope.go('login');
      } else {
        $scope.go('tab.home');
      }
      $timeout(function () {
        goflg = 0;
      },1000);
    };

    var intertime = function () {
      var time = 3;
      $scope.timemsg = time + "s";
      $scope.times = $interval(function () {
        $scope.timemsg = time + "s";
        if(time<=0){
          $scope.goHome();
        }
        if(time>0){
          time--;
        }
      },1000);
    };

    $timeout(function () {
      navigator.splashscreen.hide();
      intertime();
    }, 1000);

  });
