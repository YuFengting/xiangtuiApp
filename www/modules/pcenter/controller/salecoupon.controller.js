$(function () {
  'use strict';
  angular.module('xtui').controller("salecouponController", salecouponController);

  //依赖注入
  salecouponController.$inject = ['$scope', 'UtilService', '$ionicModal', '$timeout', '$ionicPopup', 'MyCouponService', '$stateParams'];
  function salecouponController($scope, UtilService, $ionicModal, $timeout, $ionicPopup, MyCouponService, $stateParams) {
    var re = this;
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    re.paymaskshow = false;
    re.paymentshow = false;
    re.showpayload = false;
    re.payload = false;
    re.paysucc = false;
    re.confirmPayment = confirmPayment;
    re.hidepaymask = hidepaymask;
    re.forgetpswd = forgetpswd;
    re.useCoupon = useCoupon;
    re.checkPayMoney = checkPayMoney;
    re.sureUseCoupon = sureUseCoupon;

    /*优惠券分享进度条*/
    re.percent = 0.5;
    $scope.progressSty = {
      'width': (re.percent * 390) + 'px'
    };

    function useCoupon() {
      re.paymaskshow = true;
      re.paymentshow = true;
    }

    //支付密码弹窗定义
    $ionicModal.fromTemplateUrl('pay-popup3.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (paypopup) {
      $scope.paypopup = paypopup;
    });
    //打开支付密码弹窗
    $scope.openpaypopupModal = function () {
      $scope.paypopup.show();
    };
    //关闭支付密码弹窗
    $scope.closepaypopupModal = function () {
      $scope.paypopup.hide();
      $scope.pswinfo = '';
    };


    //确认支付
    $scope.pswinfo = '';
    $scope.enterpsw = function (num) {
      if (num != 11) {
        if ($scope.pswinfo.length < 6) {
          $scope.pswinfo = $scope.pswinfo + num;
        }
      } else {
        $scope.pswinfo = $scope.pswinfo.substring(0, $scope.pswinfo.length - 1);
      }
      if ($scope.pswinfo.length >= 6) {
        $timeout(function () {
          $scope.paypopup.hide();
          re.passward = $scope.pswinfo;
          checkPayMoney();
          $scope.pswinfo = "";
        }, 200)
      }
    };

    //确认支付
    function confirmPayment() {
      re.paymentshow = false;
      re.paymaskshow = false;
      // re.payshoukuanPop = true;
      $scope.openpaypopupModal();
    }

    function checkPayMoney() {
      var passward = re.passward + '';
      // var paypwdlen = passward.length;
      if (passward.length == 6) {
        cordova.plugins.Keyboard.close();
        if (!UtilService.isPayPwd(re.passward)) {
          UtilService.showMess("请输入6位数字支付密码");
          return;
        }
        hidepaymask();
        re.showpayload = true;
        re.payload = true;
        re.paysucc = false;
      }
      /*} else {
       re.paylist[0].title = "";
       }*/
    }

    //忘记密码
    function forgetpswd() {
      $ionicPopup.show({
        title: '如您忘记密码，请直接联系<br />客服<span class="coler007a">400-0505-811</span>',
        scope: $scope,
        buttons: [
          {
            text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive'
          },
          {
            text: '<span style="color: #007aff">联系客服</span>',
            onTap: function () {
              window.open("tel:400-0505-811");
            }
          }
        ]
      });
    }

    function hidepaymask() {
      re.passward = "";
      $scope.pswinfo = "";
      re.paymaskshow = false;
      re.paymentshow = false;
      re.payshoukuanPop = false;
    }

    function sureUseCoupon(coupon) {
      if(coupon.level == undefined&&coupon.istimeout != 1&&coupon.isLock!=1) {
        $ionicPopup.show({
          title: '本套卡券只可使用一张，确认使用吗？',
          scope: $scope,
          buttons: [
            {
              text: '<span style="color: #007aff">取消</span>',
              type: 'button-positive',
              onTap: function () {
              }
            },
            {
              text: '<span style="color: #ff3b30">确定</span>',
              type: 'button-positive',
              onTap: function () {
                $scope.go('couponcode', {
                  title: coupon.taskname,
                  logo: coupon.logo,
                  companyalias: coupon.bname,
                  code: coupon.code,
                  tel: coupon.tel,
                  address: coupon.address
                });
              }
            }
          ]
        })
      }
    }

    function init() {
      if ($stateParams.workid != undefined) {
        MyCouponService.getMySimpleWorkCoupon($stateParams.workid).then(function (data) {
          if (data.status == "000000") {
            $scope.couponinfor = data.data;
            console.log($scope.couponinfor.datalist[1].nextPer*390);
            UtilService.log($scope.couponinfor);
          } else {
            UtilService.showMess(data.msg);
          }
        }, function () {
          UtilService.showMess("网络不给力，请稍候刷新");
        });
      }
    }

    init();

    $scope.shareagain = function () {
      $scope.go("taskdetail", {taskid: $scope.couponinfor.taskid});
    };

    $scope.goCouponDetail = function () {
      $scope.go("cpccoudetail", {taskid: $scope.couponinfor.taskid});
    };


  }
}());
