/**
 * Created by Administrator on 2016/8/12.
 */
$(function () {
    'use strict';

    angular.module('xtui').controller("RechargeController", RechargeController);

    //依赖注入
    RechargeController.$inject = ['$scope', '$ionicPopup', '$timeout', 'UserService', 'UtilService', 'ConfigService','RechargeService', '$ionicModal'];

    function RechargeController($scope, $ionicPopup, $timeout, userservice, utilservice,configservice, reservice, $ionicModal) {
      var re = this;


      $scope.$on("$ionicView.beforeEnter", function () {
        $scope.startfun();
        re.phonenumber = userservice.user.tel; //登录用户手机号码
        getBillAndFlow();
      });
      re.paylist = [{'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}];//密码输入框
      re.forgetPop = "none";
      re.changeBox = changeBox;
      re.popupSure = popupSure;
      re.popupMaillist = popupMaillist;
      re.choseSize = choseSize;
      re.hidepaymask = hidepaymask;
      re.checkPayMoney = checkPayMoney;
      re.confirmPayment = confirmPayment;
      re.forgetpswd = forgetpswd;

      $(".rechargeSelect .rechargeMoney").click(function () {
        $(this).addClass('current').siblings().removeClass('current');
      });


      //切换话费和流量充值
      function changeBox(type) {

        re.type = type;
        if (type == 0) {
          re.billactive = true;
          re.flowactive = false;
          re.size = re.bill[0].size;
          re.money = re.bill[0].money;
        } else {
          re.billactive = false;
          re.flowactive = true;
          re.size = re.flow[0].size;
          re.money = re.flow[0].money;
        }
        $timeout(function () {
          utilservice.tongji('recharge', {'type': type});
        }, 20);
      }


      //确认充值
      function popupSure() {
        if (re.phonenumber == "") {
          utilservice.showMess("请输入需要充值的手机号！");
          return;
        }
        if (!utilservice.isMobile(re.phonenumber)) {
          utilservice.showMess("手机号码格式不正确！");
          return;
        }
        if (re.restmoney < 10) {
          utilservice.showMess("您的余额不足无法进行充值操作！");
          re.showhfbtn = true;
          re.showllbtn = true;
          return;
        }
        re.paymaskshow = true;
        re.paymentshow = true;
      }

      //支付密码弹窗定义
      $ionicModal.fromTemplateUrl('pay-popup2.html', {
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
      }

      //确认支付
      function confirmPayment() {
        re.paymentshow = false;
        re.paymaskshow = false;
        // re.payshoukuanPop = true;
        $scope.openpaypopupModal();
      }

      //访问手机通讯录
      function popupMaillist() {
        navigator.contacts.pickContact(function (contact) {

          for (var i = 0; i < contact.phoneNumbers.length; i++) {
            var phonenumber = contact.phoneNumbers[i].value.replace(/\s+/g, "");
            var pno = phonenumber.replace(/\-/g, "");
            pno = pno.replace("+86", "");
            pno = pno.replace(/^\s+/, "");
            if (/^1[0-9]{10}$/.test(pno)) {
              re.phonenumber = pno;
              $scope.$apply();
              break;
            }
          }

        }, function (contactError) {
          if (contactError == 2) {
            showErrorMessage("超时，请重新选择通讯录！");
          }
          if (contactError == 5) {
            showErrorMessage("当前系统版本不支持！");
          }
          if (contactError == 20) {
            showErrorMessage("你还没有开启通讯录权限,请到设置中允许享推访问您的通讯录！");
          }
        });
      }

      function showErrorMessage(str) {
        $timeout(function () {
          utilservice.showMess(str);
        }, 200)
      }


      //初始化
      //判断用户账户余额
      //超过余额则显示灰色底色不可用
      function getBillAndFlow() {
        re.type = 0; //充值类型
        re.billactive = true;
        re.flowactive = false;
        re.resuccess = true; //充值成功遮层
        re.paymaskshow = false;
        re.payshoukuanPop = false;
        re.passwrong = false;
        re.moneyless = false;
        re.showpayload = false;
        re.payload = false;
        re.paysucc = false;

        re.bill = [
          {size: 10, money: 10, dis: false, chosen: true},
          {size: 20, money: 20, dis: false, chosen: false},
          {size: 30, money: 30, dis: false, chosen: false},
          {size: 50, money: 50, dis: false, chosen: false},
          {size: 100, money: 100, dis: false, chosen: false},
          {size: 200, money: 200, dis: false, chosen: false},
          {size: 300, money: 300, dis: false, chosen: false},
          {size: 500, money: 500, dis: false, chosen: false}
        ];
        re.flow = [
          {size: 100, money: 10, dis: false, chosen: true},
          {size: 200, money: 20, dis: false, chosen: false},
          {size: 300, money: 25, dis: false, chosen: false},
          {size: 500, money: 30, dis: false, chosen: false},
          {size: 1000, money: 50, dis: false, chosen: false},
          {size: 2000, money: 70, dis: false, chosen: false}
        ];
        re.showhfbtn = false;
        re.showllbtn = false;
        reservice.getAccountMoney(userservice.user.id).then(function (res) {
          re.restmoney = res.restmoney;
          if (re.restmoney < 10) {
            re.showhfbtn = true;
            re.showllbtn = true;
            re.bill[0].chosen = false;
            re.flow[0].chosen = false;
          }

          re.size = re.bill[0].size;
          re.money = re.bill[0].money;
          for (var i = 0; i < re.flow.length; i++) {
            if (re.flow[i].money > re.restmoney) {
              re.flow[i].dis = true;
            }
          }
          for (var i = 0; i < re.bill.length; i++) {
            if (re.bill[i].money > re.restmoney) {
              re.bill[i].dis = true;
            }
          }
        }, function (err) {
          utilservice.showMess("网络不给力，请稍后刷新");
        });
      }


      //选择充值面值
      function choseSize(phone) {
        if (phone.dis == false) {
          re.size = 0; //充值大小
          re.money = 0; //充值金额
          if (re.type == 0) {//充话费
            for (var i = 0; i < re.bill.length; i++) {
              re.bill[i].chosen = false;
            }
          } else {//充流量
            for (var i = 0; i < re.flow.length; i++) {
              re.flow[i].chosen = false;
            }
          }
          phone.chosen = true;
          re.size = phone.size;
          re.money = phone.money;
        } else {
          utilservice.showMess("您的余额不足，无法充值！");
        }
      }


      function hidepaymask() {
        /*if (cordova.plugins.Keyboard.isVisible) {
         cordova.plugins.Keyboard.close();
         }*/
        re.passward = "";
        $scope.pswinfo = "";
        re.paylist = [{'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}, {'title': ''}];
        re.paymaskshow = false;
        re.paymentshow = false;
        re.payshoukuanPop = false;
      }

      //IM通知
      function casheOut(money) {
        var newDate = new Date();
        var FomatorString = "YYYY-MM-DD HH:MI:SS";
        var recharge_content = "您于" + utilservice.DatetoString(newDate, FomatorString) + "申请话费充值" + money + "元，将于20分钟内到达您的账户，请注意查收！";
        var params = {
          mod: "IM",
          func: "insertIMMessage",
          data: {
            type: 4,
            content: recharge_content,
            receiverid: userservice.user.id
          }
        };
        utilservice.post(configservice.imserver, {'jsonstr': angular.toJson(params)});
      }

      //充值话费
      function checkPayMoney() {
        var passward = re.passward + '';
        // var paypwdlen = passward.length;
        if (passward.length == 6) {
          cordova.plugins.Keyboard.close();
          var paypwd = hex_md5(re.passward.toString());
          if (!utilservice.isPayPwd(re.passward)) {
            utilservice.showMess("请输入6位数字支付密码");
            return;
          }
          hidepaymask();
          re.showpayload = true;
          re.payload = true;
          re.paysucc = false;
          var phone = {};
          phone.phonenumber = re.phonenumber;
          phone.size = re.size;
          phone.type = re.type;
          phone.money = re.money;
          phone.paypwd = paypwd;
          reservice.mobilePhoneRecharge(phone, userservice.user.id).then(function (res) {
            re.passward = "";
            var a = $timeout(function () {
              re.payload = false;
            }, 1000);
            a.then(function () {
              if (res.status == '100304') {
                re.passwrong = true;
                var b = $timeout(function () {
                  getBillAndFlow();
                }, 1000);
              } else if (res.status == '180001') {
                useriszb();
                re.showpayload = false;
              } else if (res.status == '000000') {
                casheOut(re.money);
                re.paysucc = true;
                var b = $timeout(function () {
                  getBillAndFlow();
                }, 1000);
              } else if (res.status == '500003') {
                re.moneyless = true;
                var b = $timeout(function () {
                  getBillAndFlow();
                }, 1000);
              }
            }, function (err) {

            });
          }, function (err) {
            utilservice.showMess("网络不给力，请稍后刷新");
          }).finally(function () {
            $timeout.cancelAll();
          });
        }
        /*} else {
         re.paylist[0].title = "";
         }*/
      }


      //忘记密码
      function forgetpswd() {
        var fgtpsw = $ionicPopup.show({
          title: '如您忘记密码，请直接联系<br />客服<span class="coler007a">400-0505-811</span>',
          scope: $scope,
          buttons: [
            {
              text: '<span style="color: #007aff">取消</span>',
              type: 'button-positive'
            },
            {
              text: '<span style="color: #007aff">联系客服</span>',
              onTap: function (e) {
                window.open("tel:400-0505-811");
              }
            }
          ]
        });
      }

      function useriszb() {
        var fgtpsw = $ionicPopup.show({
          title: '抱歉，由于您的账号有问题，<br/>目前无法进行话费充值，<br />如有疑问请联系客服<span class="coler007a">(400-0505-811)</span>',
          scope: $scope,
          buttons: [
            {
              text: '<span style="color: #007aff">取消</span>',
              type: 'button-positive'
            },
            {
              text: '<span style="color: #007aff">联系客服</span>',
              onTap: function (e) {
                window.open("tel:400-0505-811");
              }
            }
          ]
        });
      }


    }
  }
  ()
)
