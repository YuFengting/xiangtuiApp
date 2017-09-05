$(function () {
  'use strict';
  angular.module('xtui').controller("relatedNumberController", relatedNumberController);

  //依赖注入
  relatedNumberController.$inject = ['$scope','UtilService','ConfigService','$stateParams'];
  function relatedNumberController($scope,UtilService,ConfigService,$stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    var loginnick = $stateParams.nick;
    var loginavate = $stateParams.avate;
    var loginflag = $stateParams.loginflag;
    var loginuserid = $stateParams.loginuserid;

    //用户信息
    $scope.user = {};
    $scope.showloading = false;
    $scope.checktellogin = function () {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      $scope.showloading = true;
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, type: 's', isuser: 3}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == 0) {
          $scope.showloading = false;
          $scope.go("relatednumber2" ,{"loginflag": loginflag, "nick":loginnick,"avate":loginavate,"loginuserid":loginuserid,"tel": $scope.user.tel});
        } else if (data.status == 1) {
          $scope.showloading = false;
          $scope.go("relatednumber3",{"loginflag": loginflag, "nick":loginnick,"avate":loginavate,"loginuserid":loginuserid,"tel": $scope.user.tel});
        }
      }).error(function () {
        UtilService.showMess("网络存在异常！");
        $scope.showloading = false;
      });
    };

    //手机号变化事件
    $scope.telChange = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel)) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };

    //失去焦点
    $scope.showtelClear = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel)) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };
    $scope.hidetelClear = function () {
      $scope.showtelclear = false;
    };
    //清除手机号
    $scope.cleantel = function () {
      $scope.user.tel = "";
      $scope.showtelclear = false;
    };
  }
}());
