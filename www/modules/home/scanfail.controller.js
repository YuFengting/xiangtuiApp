$(function () {
  'use strict';
  angular.module('xtui').controller("ScanFailController", ScanFailController);

  //依赖注入
  ScanFailController.$inject = ['$scope', '$interval'];
  function ScanFailController($scope, $interval) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    //切换扫一扫类型
    $scope.isyhq0 = true;
    $scope.changeScan = function (num) {
      $scope.isyhq0 = num == 0;
    };

    //券码验证
    $scope.goEnterCode = function () {
      $scope.go('entercode');
    };
    /*计时器*/
    $scope.countdown = 5;
    var time = 5;
    var Countdown = function () {
      var timer = $interval(function () {
        time--;
        $scope.countdown = time;
        if (time <= 0) {
          $interval.cancel(timer);
          $scope.goback();
        }
      }, 1000);
    };
    Countdown();

  }
}());
