$(function () {
  'use strict';
  angular.module('xtui').controller("relatedNumberController2", relatedNumberController2);

  //依赖注入
  relatedNumberController2.$inject = ['$scope','$ionicModal','UtilService','$stateParams'];
  function relatedNumberController2($scope,$ionicModal,UtilService,$stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.showloading = false;
    //用户信息
    $scope.user = {};
    $scope.user.tel = $stateParams.tel;
    var loginnick = $stateParams.nick;
    var loginavate = $stateParams.avate;
    var loginflag = $stateParams.loginflag;
    var loginuserid = $stateParams.loginuserid;

    //1:图片验证码方式,0:滑块验证码
    $scope.checkFlag = 1;
    $(".fuwu").hide();
    //默认同意协议
    $scope.showagree = true;
    $scope.changeAggree = function () {
      $scope.showagree = !$scope.showagree;
    };
    /*点击关闭条款*/
    $scope.hideTK = function () {
      $(".loginHead").show();
      $scope.closefuwuModal();
    };
    /*点击打开服务条款*/
    $scope.showTK = function () {
      $(".loginHead").hide();
      $scope.openfuwuModal();
    };

    $ionicModal.fromTemplateUrl('fuwuModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openfuwuModal = function () {
      $scope.modal.show();
    };
    $scope.closefuwuModal = function () {
      $scope.modal.hide();
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

    $scope.sendcodelogin = function (isuser, mtype) {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      if ($scope.showagree == false) {
        UtilService.showMess("请先阅读享推用户服务协议！");
        return;
      }

      $scope.showloading = true;
      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 102).then(function (data) {
        if (data.status == "000000") {
          //发送短信验证码
          $scope.showloading = false;
          //发送短信验证码
          if (mtype != "sms") {
            UtilService.showMess("验证码已发送，请注意接听来电！");
          } else {
            UtilService.showMess("短信验证码已发送，请注意查收！");
          }
          $scope.go("relatednumber4", {"loginflag": loginflag, "nick":loginnick,"avate":loginavate,"loginuserid":loginuserid,"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
        } else if (data.status == "100101") {
          $scope.showloading = false;
          UtilService.showMess("请60s之后再试！");
        } else {
          $scope.showloading = false;
          // UtilService.showMess("请不要重复验证！");
          UtilService.showMess(data.msg);
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };

    $scope.ismobile = function(tel) {
        return UtilService.isMobile(tel);
    };

  }
}());
