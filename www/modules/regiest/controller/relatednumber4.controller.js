$(function () {
  'use strict';
  angular.module('xtui').controller("relatedNumberController4", relatedNumberController4);

  //依赖注入
  relatedNumberController4.$inject = ['$scope','UtilService','ConfigService','$stateParams','$timeout','$window'];
  function relatedNumberController4($scope,UtilService,ConfigService,$stateParams,$timeout,$window) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.showloading = false;
    $scope.checkFlag = $stateParams.checkFlag;
    var loginnick = $stateParams.nick;
    var loginavate = $stateParams.avate;
    var loginflag = $stateParams.loginflag;
    var loginuserid = $stateParams.loginuserid;

    //用户信息
    $scope.user = {};
    $scope.user.tel = $stateParams.tel;
    $scope.user.code="";
    $scope.pcodeserver = ConfigService.pcodeserver;
    $scope.checkpicshow = false;
    $scope.codeinfo = {};

    var token = "";
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };

    //验证码变化事件
    $scope.showcodeclear = false;
    $scope.codeChange = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code) && $scope.user.code != null) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    //清除验证码
    $scope.cleancode = function () {
      $scope.user.code = "";
      $scope.showcodeclear = false;
    };
    //失去焦点
    $scope.showcodeClear = function () {
      if ($scope.user.code != "" && $scope.user.code != null && angular.isDefined($scope.user.code)) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    $scope.hidecodeClear = function () {
      $scope.showcodeclear = false;
    };

    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefreshlogin = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };

    $scope.textinputfocus = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '22%', 'bottom': 'auto'});
      }
    };
    $scope.textinputblur = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '0', 'bottom': 0});
      }
    };

    //发送语音验证码
    var flag = 0;
    $scope.sendcode = function (isuser, mtype) {
      $scope.user.code = "";
      if ($scope.checkFlag == 0) {
        if (flag == 0) {
          flag = 1;
          $timeout(function () {
            flag = 0;
          }, 2000);
          $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
            $scope.codeinfo.geetest_challenge = result.geetest_challenge;
            $scope.codeinfo.geetest_validate = result.geetest_validate;
            $scope.codeinfo.geetest_seccode = result.geetest_seccode;
            $scope.codeinfo.id = $scope.user.tel;
            //滑动正确后，会获得以上三个值。
            UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
              if (data.status == "000000") {
                //发送短信验证码
                UtilService.showMess("请注意接听语音验证码！");
              } else if (data.status == "500005") {
                UtilService.showMess("验证码验证失败，请重新填写！");
              } else if (data.status == "100101") {
                UtilService.showMess("请60s之后再试！");
              } else {
                // UtilService.showMess("请不要重复验证！");
                UtilService.showMess(data.msg);
              }
            });
          });
        } else {
          UtilService.showMess("请不要重复点击！");
        }
      } else {
        setpiccode();
        $scope.checkpicshow = true;
      }
    };

    $scope.sendvoicelogin = function (isuser, mtype) {
      $scope.user.code = "";

      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 102).then(function (data) {
        if (data.status == "000000") {
          if(mtype == "voice") {
              UtilService.showMess("请注意接听语音验证码！");
          } else {
              UtilService.showMess("请注意接收短信验证码！");
          }
        } else if (data.status == "500005") {
          UtilService.showMess("验证码验证失败，请重试！");
        } else if (data.status == "100101") {
          UtilService.showMess("请60s之后再试！");
        } else {
          // UtilService.showMess("请不要重复验证！");
          UtilService.showMess(data.msg);
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };

    //验证图片验证码
    $scope.checkpicmalogin = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          UtilService.showMess("请注意接听语音验证码！");
        } else if (data.status == "500005") {
          UtilService.showMess("图片验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
          UtilService.showMess(data.msg);
        }
      });
    };
    //验证短信、语音验证码
    $scope.checkmesglogin = function () {
      if (!UtilService.isSmsCode($scope.user.code)) {
        UtilService.showMess("请输入正确的短信验证码！");
      } else {
        //验证手机号、短信是否正确
        UtilService.checkCode($scope.user.tel, $scope.user.code).success(function (data) {
          token = data.token;
          $scope.codema = data.data;
          if (data.status == '000000') {
            $scope.go("relatednumber5", {"loginflag": loginflag, "nick":loginnick,"avate":loginavate,"loginuserid":loginuserid,"token": token, "tel": $scope.user.tel});
          } else {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络连接异常！");
        })
      }
    };

    //隐藏弹窗
    $scope.hideTClogin = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }

  }
}());
