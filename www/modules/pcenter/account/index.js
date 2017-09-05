angular.module('xtui')
  /*我的账户*/
  .controller("AccountController", function ($scope, $rootScope, $timeout, $state, UserService, UtilService, ConfigService, $ionicScrollDelegate, $ionicActionSheet, NewHandService, SqliteUtilService,AccountService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    //新手引导显示
    var newhandShow = function () {
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step < 7) {
            if (data[0].step == 6) {
              $rootScope.step7 = true;
              NewHandService.syncNewHandStep(7).then(function () {
                NewHandService.newHandLastEnd();
                var dataList = [{id: 1, step: 7}];
                SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
              }, function () {
              });
            }
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step < 7) {
                if (res.data.step == 6) {
                  $rootScope.step7 = true;
                  NewHandService.syncNewHandStep(7).then(function () {
                    NewHandService.newHandLastEnd();
                    var dataList = [{id: 1, step: 7}];
                    SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
                  }, function () {
                  });
                }
              }
            }
          }, function () {
          })
        }
      }, function () {
      });
    };
    //新手引导第六步点击方法
    $rootScope.closeNewHandStepSix = function () {
      $rootScope.step7 = false;
    };

    $scope.user = UserService.user;
    $scope.type = 0;
    $scope.indexnav_w = 0;
    $scope.loglist = [];
    $scope.logsflag = [];
    $scope.nonelog = false;
    $scope.hasNextPage = false;
    $scope.showmask = false;
    $scope.showadd = true;
    $scope.newhandflag = false;

    //分类
    $scope.typelist = [
      {id: '0', name: '全部', value: "all"},
      {id: '1', name: '任务收入', value: "task"},
      {id: '2', name: '收付款', value: "impay"},
      {id: '3', name: '活动奖励', value: "act"},
      {id: '4', name: '提现', value: "out"},
      {id: '5', name: '充值', value: "charge"},
      {id: '6', name: '邀请好友', value: "invite"}
    ];
    //默认任务收入
    $scope.choosetype = $scope.typelist[0];
    //流水类型列表
    $scope.changeAccList = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '<span class="xt-blue" ng-class="">全部</span>'},
          {text: '<span class="xt-blue">任务收入</span>'},
          {text: '<span class="xt-blue">收付款</span>'},
          {text: '<span class="xt-blue">活动奖励</span>'},
          {text: '<span class="xt-blue">提现</span>'},
          {text: '<span class="xt-blue">充值</span>'},
          {text: '<span class="xt-blue">邀请好友</span>'}
        ],
        buttonClicked: function (index) {
          $scope.getLogs($scope.typelist[index]);
          return true;
        }
      });
    };

    var pageno = 1;
    //获取账户流水
    $scope.getLogs = function (type) {
      $scope.type = type.id;
      pageno = 1;
      $scope.hasNextPage = false;
      $scope.nonelog = false;
      $scope.hasmore = false;
      $scope.showmask = false;
      //关闭
      if (type.name == '提现' || type.name == '充值') {
        $scope.showadd = false;
      } else {
        $scope.showadd = true;
      }
      $scope.choosetype = type;
      $scope.loglist = [];
      //请求账户数据
      AccountService.getLogs(type,1).then(function (data) {
        if (data.status == '000000') {
          /* 新手引导判断*/
          newhandShow();
          $scope.loglist = data.data;
          //判断是否有流水
          $scope.nonelog = $scope.loglist.length <= 0;
          //判断是否有下一页
          var page = angular.fromJson(data.page).totalPage;
          if (page > 1) {
            $scope.hasNextPage = true;
          }
          UtilService.tongji('cashtype', {'type': type.value});
          UtilService.customevent("accountList", type.name);
          UtilService.log($scope.loglist);
        } else if (data.status == '500004') {
          UtilService.showMess(data.msg);
        }
      },function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      });
      UtilService.customevent("account", type.name);
    };

    //加载更多数据
    $scope.loadMore = function () {
      $scope.hasNextPage = false;
      pageno++;
      AccountService.getLogs($scope.choosetype,pageno).then(function (data) {
        if (data.status == '000000') {
          //当前页小于等于总页数时，关闭上拉加载
          var page = angular.fromJson(data.page).totalPage;
          $scope.hasNextPage = page > pageno;
          if (!$scope.hasNextPage && pageno >= 2) {
            $scope.hasmore = true;
          } else {
            $scope.hasmore = false;
          }
          if (data.data.length != 0) {
            $scope.loglist = $scope.loglist.concat(data.data);
          }
        }
      },function () {
        $scope.hasNextPage = false;
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    //秒赚列表页跳转
    $scope.gofastget = function () {
      UserService.fastget = true;
      $scope.go("fastget");
    };
    //任务收入列表，点击跳转任务详情
    $scope.goTaskDetail = function (log) {
      if (log.log.type == "13" || log.log.type == "11"|| log.log.type == "14") {
        if ($scope.type == 1) {
          UserService.accountlogid = 1;
        }
        if (log.tasktype == "0") {
          //跳cpc
          $scope.go("taskdetail", {"taskid": log.taskid});
        }
        if (log.tasktype == "2") {
          if(log.bstatus=="4"){
            //商家下架提示
            UtilService.showMess("商家已下架");
          }else {
            //跳cpv
            $scope.go("cpvdetail", {"taskid": log.taskid});
          }
        }
        if (log.tasktype == "1") {
          //cps提示任务已结束
          UtilService.showMess("任务已结束");
        }
      }
    };

    //获取我的账户信息,下拉刷新,初始化
    $scope.myacc = function () {
      AccountService.getMyAccount().then(function (data) {
        if (data.status == '000000') {
          $scope.account = UserService.account = data.data;
        }
      },function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
      //刷新账户流水
      if (angular.isDefined(UserService.accountlogid) && UserService.accountlogid == 1) {
        $scope.choosetype = $scope.typelist[1];
        UserService.accountlogid = 0;
      }
      $scope.getLogs($scope.choosetype);
    };
    $scope.myacc();

    //拆红包
   /* $scope.purseClick = function(log){
      AccountService.openRedPacket(log.taskid).then(function(response){
        log.redstatus=2;
        if(response.status=='000000'){
          //更新账户金额
          $scope.accountmoney+=log.redmoney;
        }
      });
      //红包标志改变--已拆开
      /!*$timeout(function(){
        log.redstatus=2;
      },2000)*!/

    }*/

  })
  .directive("accountUserMoney",function(AccountService, $timeout){
    return {
      restrict: 'EA',
      transclude:true,
      scope: {
        userMoney: "="
      },
      link: function ($scope, ele, attr) {
        $scope.$watch("userMoney",function(newValue,oldValue){
          var getAccountVal = AccountService.getPcenterMoney();
          if(newValue != undefined && newValue != getAccountVal){
            var getNum = newValue - getAccountVal;
            var newNum = getNum.toFixed(2);
            if(newNum < 0){
            }else{
              $(".profitNum").text("+"+newNum);
            }
            $(".addProfitBox").addClass("addProgifAnimate");
            $timeout(function(){
              //$(".addProfitBox").css({"opacity":0});
              $(".addProfitBox").removeClass("addProgifAnimate");
              newValue = newValue.toFixed(2);
              $(ele).text(newValue);
              AccountService.setPcenterMoney(newValue);
            },1000);
            // }
          }else{
            if(getAccountVal > -1){
              $(ele).text(getAccountVal);
            }
          }
        });
      }
    }
  })
  /*微信提现*/
  .controller("WXwithdrawController", function ($scope, $timeout, $stateParams, UserService, UtilService, ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.account = UserService.account;
    var cashouttoken = $stateParams.token;
    $scope.showsucc = false;
    $scope.acc = {};

    //获取我的账户信息
    $scope.myacc = function () {
      var params = {
        mod: 'nAccount',
        func: 'getInfo',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        cashouttoken = data.token;
        if (data.status == '000000') {
          $scope.account = data.data;
        }
      });
    };
    $scope.myacc();
    var flg = 0;
    $scope.goCashOut = function () {
      if (flg != 0) {
        return;
      }
      flg = 1;
      $timeout(function () {
        flg = 0;
      }, 1000);
      if (isNaN($scope.acc.money)) {
        UtilService.showMess("请输入正确的提现金额");
        return;
      }
      if (angular.isUndefined($scope.acc.money) || $scope.acc.money == "") {
        UtilService.showMess("提现金额不能为空");
        return;
      }
      if (!/^\d+\.?\d{0,2}$/.test($scope.acc.money)) {
        UtilService.showMess("提现金额最多为两位小数");
        return;
      }
      if (parseFloat($scope.acc.money) > $scope.account.restmoney) {
        UtilService.showMess("提现金额超出可提现金额，请重新输入");
        return;
      }
      if (angular.isUndefined($scope.acc.money) || $scope.acc.money == "" || isNaN($scope.acc.money) || parseFloat($scope.acc.money) <= 1) {
        UtilService.showMess("提现金额必须大于1");
        return;
      }
      cashOut();
    };
    var cashOut = function () {
      var params = {
        mod: "nAccount",
        func: "cashOut",
        userid: $scope.user.id,
        data: {
          money: $scope.acc.money,
          btype: 0
        },
        token: cashouttoken
      };
      UtilService.get(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        cashouttoken = data.token;
        if (data.status == '000000') {
          $scope.showsucc = true;
          //IM微信提现通知
          var newDate = new Date();
          var FomatorString = "YYYY-MM-DD HH:MI:SS";
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 4,
              content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "申请提现" + $scope.acc.money + "元至微信，平台将于两个工作日内审核并打款，请注意查收!",
              receiverid: $scope.user.id
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});
          $timeout(function () {
            $scope.showsucc = false;
            $scope.goback();
          }, 2000)
        } else if (data.status == '100604') {
          UtilService.showMess("该账号有金额尚在提现中，暂时无法提现！");
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      }).error(function () {
      });
    };
    UtilService.customevent("withdrow", "wxwithdrow");
  })
  /*支付宝提现*/
  .controller("AlipaywithdrawController", function ($scope, $ionicPopup, $timeout, $stateParams, UserService, UtilService, ConfigService,$window) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.account = UserService.account;
    var cashouttoken = $stateParams.token;
    $scope.showsucc = false;
    $scope.acc = {};

    //获取我的账户信息
    $scope.myacc = function () {
      var params = {
        mod: 'nAccount',
        func: 'getInfo',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        cashouttoken = data.token;
        if (data.status == '000000') {
          $scope.account = data.data;
        }
      });
    };

      //前往微信
      $scope.goweixin = function () {
        var popup = $ionicPopup.confirm({
          title:'公众号已复制，请去微信中搜索xiangtui2的公众号，按步骤进行提现。',
          cancelText: "取消",
          cancelType: "button-cancel",
          okText: "打开微信",
          okType: 'button-go'
        });
        popup.then(function (res) {
          if (res) {
            cordova.plugins.clipboard.copy("xiangtui2");
            $window.weixinplugin.openweixin();
          }
        });
      };

    $scope.myacc();
    var flg = 0;
    $scope.goCashOut = function () {
      //监控重复提交
      if (flg != 0) {
        return;
      }
      flg = 1;
      $timeout(function () {
        flg = 0;
      }, 1000);
      if (isNaN($scope.acc.money)) {
        UtilService.showMess("请输入正确的提现金额");
        return;
      }
      if (angular.isUndefined($scope.acc.money) || $scope.acc.money == "") {
        UtilService.showMess("提现金额不能为空");
        return;
      }
      if (!/^\d+\.?\d{0,2}$/.test($scope.acc.money)) {
        UtilService.showMess("提现金额最多为两位小数");
        return;
      }
      if (parseFloat($scope.acc.money) > $scope.account.restmoney) {
        UtilService.showMess("提现金额超出可提现金额，请重新输入");
        return;
      }
      if (angular.isUndefined($scope.acc.money) || $scope.acc.money == "" || isNaN($scope.acc.money) || parseFloat($scope.acc.money) <= 1) {
        UtilService.showMess("提现金额必须大于1");
        return;
      }
      if ($scope.acc.money < 50) {
        $scope.showPopup();
        return;
      }
      cashOut();
    };
    var cashOut = function () {
      var params = {
        mod: "nAccount",
        func: "cashOut",
        userid: $scope.user.id,
        data: {
          money: $scope.acc.money,
          btype: 1
        },
        token: cashouttoken
      };
      UtilService.get(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        cashouttoken = data.token;
        if (data.status == '000000') {
          $scope.showsucc = true;
          //IM支付宝提现通知
          var newDate = new Date();
          var FomatorString = "YYYY-MM-DD HH:MI:SS";
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 4,
              content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "申请提现" + $scope.acc.money + "元至支付宝，平台将于两个工作日内审核并打款，请注意查收!",
              receiverid: $scope.user.id
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});
          $timeout(function () {
            $scope.showsucc = false;
            $scope.goback();
          }, 2000)
        } else if (data.status == '100604') {
          UtilService.showMess("该账号有金额尚在提现中，暂时无法提现！");
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      }).error(function () {
      });
    };

    //弹窗
    $scope.showPopup = function () {
      var confirmPopup1 = $ionicPopup.confirm({
        template: "<div class='withdraw-wenzi'>提现金额低于50元，支付宝将收取1元的手续费，是否确认提现？</div>",
        cancelText: "取消",
        cancelType: "button-cancel",
        okText: "继续",
        okType: 'button-go'
      });
      confirmPopup1.then(function (res) {
        if (res) {
          cashOut();
        }
      });
    };
    UtilService.customevent("withdrow", "zfbwithdrow");
  })
  /*绑定支付宝*/
  .controller("SetzhifubaoController", function ($scope, UserService, UtilService, AccountService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.account = UserService.account;
    $scope.showapcl = false;
    $scope.shownacl = false;
    $scope.title = "";
    if ($scope.account.isset == 0) {
      $scope.title = "绑定支付宝帐号";
    } else {
      $scope.title = "更换绑定的支付宝帐号";
    }

    //支付宝账号判断
    $scope.checkAlipay = function () {
      if (angular.isUndefined($scope.account.alipay) || $scope.account.alipay == "" || $scope.account.alipay == null) {
        $scope.showapcl = false;
      } else {
        $scope.showapcl = true;
      }
    };
    $scope.showAlipayClear = function () {
      if (angular.isUndefined($scope.account.alipay) || $scope.account.alipay == "" || $scope.account.alipay == null) {
        $scope.showapcl = false;
      } else {
        $scope.showapcl = true;
      }
    };

    //聚焦  判断名称是否显示清空按钮
    $scope.showNameClear = function () {
      if (angular.isUndefined($scope.account.name) || $scope.account.name == "" || $scope.account.name == null) {
        $scope.shownacl = false;
      } else {
        $scope.shownacl = true;
      }
    };
    $scope.checkName = function () {
      if (angular.isUndefined($scope.account.name) || $scope.account.name == "" || $scope.account.name == null) {
        $scope.shownacl = false;
      } else {
        $scope.shownacl = true;
      }
    };

    //失去焦点
    $scope.hideAlipayClear = function () {
      $scope.showapcl = false;
    };
    $scope.hideNameClear = function () {
      $scope.shownacl = false;
    };
    //清除支付宝账号
    $scope.clearAlipay = function () {
      $scope.account.alipay = "";
      $('#account_alipay').focus;
      $scope.checkNull('alipay');
    };

    //清除支付宝真实姓名
    $scope.clearName = function () {
      $scope.account.name = "";
      $('#account_name').focus;
      $scope.checkNull('name');
    };
    $scope.goCheckCode = function () {
      if (angular.isUndefined($scope.account.alipay) || $scope.account.alipay == "" || $scope.account.alipay == null) {
        UtilService.showMess("支付宝账号不能为空！");
        return;
      }
      if (angular.isUndefined($scope.account.name) || $scope.account.name == "" || $scope.account.name == null) {
        UtilService.showMess("真实姓名不能为空！");
        return;
      }
      if (!UtilService.isNameStr($scope.account.name)) {
        UtilService.showMess("请输入中文或英文姓名！");
        return;
      }
      //验证支付宝账号是否存在
      AccountService.checkAlipay($scope.account.alipay).then(function (response) {
        if (response) {
          UserService.alipayid = $scope.account.alipay;
          UserService.alipayname = $scope.account.name;
          $scope.go('safeRZ');
        } else {
          UtilService.showMess("支付宝账号已存在！");
        }
      });
    }
  })
  /*绑定支付宝-安全认证*/
  .controller("saferzController", function ($scope, $timeout, UserService, UtilService, ConfigService, $stateParams, $window) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.alipay = UserService.alipayid;
    $scope.name = UserService.alipayname;
    $scope.codeinfo = {};
    $scope.showloading = false;
    var token = "";
    $scope.user = UserService.user;
    $scope.user.fscode = "";

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
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#alipayurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };

    //获取显示滑块或图片验证码标识
    var getCheckFlag = function () {
      var params = {
        mod: 'nComm',
        func: 'getCaptchaType'
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.checkFlag = data.data;
          //图片验证码方式
          if ($scope.checkFlag == 1) {
            //setpiccode();
          } else {
            //滑块验证码方式
            $scope.checkpicshow = false;
          }
        } else {
          $scope.checkFlag = 1;
        }
      });
    };
    getCheckFlag();
    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#alipayurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };
    var flag = 0;
    var showGtCaptcha = function (isuser, mtype) {
      if (flag == 0) {
        flag = 1;
        $timeout(function () {
          flag = 0;
        }, 2000);
        $scope.showloading = true;
        $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.id, function (result) {
          $scope.codeinfo.geetest_challenge = result.geetest_challenge;
          $scope.codeinfo.geetest_validate = result.geetest_validate;
          $scope.codeinfo.geetest_seccode = result.geetest_seccode;
          $scope.codeinfo.id = $scope.user.id;
          //滑动正确后，会获得以上三个值。
          UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 103).success(function (data) {
            if (data.status == "000000") {
              $scope.showloading = false;
              UtilService.showMess("短信验证码已发送，请注意查收！");
              //发送短信验证码
              $scope.go("testcode", {"alipay": $scope.alipay, "name": $scope.name});
            } else if (data.status == "500005") {
              $scope.showloading = false;
              UtilService.showMess("验证码验证失败，请重试！");
            } else if (data.status == "100101") {
              $scope.showloading = false;
              UtilService.showMess("请60s之后再试！");
            } else {
              $scope.showloading = false;
              // UtilService.showMess("请不要重复验证！");
                UtilService.showMess(data.msg);
            }
          }).error(function () {
            $scope.showloading = false;
            UtilService.showMess("请重试！")
          })
        }, function () {
          $scope.$apply(function () {
            $scope.showloading = false;
          });
        });
      } else {
        UtilService.showMess("请不要重复点击！");
      }
    };

    $scope.sendcode = function (isuser, mtype) {
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 103).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          $scope.go("testcode", {"alipay": $scope.alipay, "name": $scope.name});
        } else {
          UtilService.showMess("图片验证码检查失败，请重试！")
        }
      }).error(function () {
        UtilService.showMess("图片验证码过期，请重试！")
      });
    };

    $scope.sendcode2 = function (isuser, mtype) {
      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 101).then(function (data) {
        if (data.status == "000000") {
          //发送短信验证码
          if (mtype != "sms") {
            UtilService.showMess("验证码已发送，请注意接听来电！");
          } else {
            UtilService.showMess("短信验证码已发送，请注意查收！");
          }
          $scope.go("testcode");
        } else if (data.status == "100101") {
          $scope.showloading = false;
          UtilService.showMess("请60s之后再试！");
        } else {
          $scope.showloading = false;
          UtilService.showMess(data.msg);
          // UtilService.showMess("请不要重复验证！");
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };

    //发送手机验证码(短信)
    $scope.checkPicType = function (isuser, mtype) {
      if ($scope.checkFlag == 0) {
        showGtCaptcha(isuser, mtype);
      } else {
        setpiccode();
        $scope.checkpicshow = true;
      }
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }
  })
  /*绑定支付宝-填写验证码*/
  .controller("testcodeController", function ($scope, $ionicHistory, $timeout, UserService, UtilService, ConfigService, $stateParams, $window) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user = UserService.user;
    $scope.alipay = {};
    $scope.alipayaccount = UserService.alipayid;
    $scope.name = UserService.alipayname;
    $scope.showcodecl = false;
    $scope.showYy = false;
    $scope.user.fscode = "";
    $scope.codeinfo = {};

    $scope.clearSmsCode = function () {
      $scope.alipay.smscode = "";
      $scope.showcodecl = false;
      $('#alipay_smscode').focus;
    };

    $scope.checkCode = function () {
      if (angular.isUndefined($scope.alipay.smscode) || $scope.alipay.smscode == "" || $scope.alipay.smscode == null) {
        $scope.showcodecl = false;
      } else {
        $scope.showcodecl = true;
      }
    };

    $scope.showCodecl = function () {
      if (angular.isUndefined($scope.alipay.smscode) || $scope.alipay.smscode == "" || $scope.alipay.smscode == null) {
        $scope.showcodecl = false;
      } else {
        $scope.showcodecl = true;
      }
    };

    $scope.hideCodecl = function () {
      $scope.showcodecl = false;
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
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

    var token = "";
    $scope.user = UserService.user;
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#alipayurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };
    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#alipayurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };
    //获取显示滑块或图片验证码标识
    var getCheckFlag = function () {
      var params = {
        mod: 'nComm',
        func: 'getCaptchaType'
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        //token = data.data;
        if (data.status == '000000') {
          $scope.checkFlag = data.data;
          //图片验证码方式
          if ($scope.checkFlag == 1) {
            setpiccode();
          } else {
            //滑块验证码方式
            $scope.checkpicshow = false;
          }
        } else {
          $scope.checkFlag = 1;
        }
      });
    };
    getCheckFlag();

    var flag = 0;
    var showGtCaptcha = function (isuser, mtype) {
      if (flag == 0) {
        flag = 1;
        $timeout(function () {
          flag = 0;
        }, 1000);
        $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.id, function (result) {
          $scope.codeinfo.geetest_challenge = result.geetest_challenge;
          $scope.codeinfo.geetest_validate = result.geetest_validate;
          $scope.codeinfo.geetest_seccode = result.geetest_seccode;
          $scope.codeinfo.id = $scope.user.id;
          //滑动正确后，会获得以上三个值。
          UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 103).success(function (data) {
            if (data.status == "000000") {
              UtilService.showMess("请注意接听语音验证码！")
            } else if (data.status == "500005") {
              UtilService.showMess("验证码验证失败，请重试！");
            } else if (data.status == "100101") {
              UtilService.showMess("请60s之后再试！");
            } else {
              // UtilService.showMess("请不要重复验证！");
              UtilService.showMess(data.msg);
            }
          }).error(function () {
            UtilService.showMess("error")
          })
        });
      } else {
        UtilService.showMess("请不要重复点击！");
      }
    };
    $scope.sendcode = function (isuser, mtype) {
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 103).success(function (data) {
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
      }).error(function () {
        UtilService.showMess("图片验证码过期，请重试！")
      });
    };
    $scope.sendcode2 = function (isuser, mtype) {
      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 101).then(function (data) {
        if (data.status == "000000") {
          //发送短信验证码
          if (mtype != "sms") {
            UtilService.showMess("验证码已发送，请注意接听来电！");
          } else {
            UtilService.showMess("短信验证码已发送，请注意查收！");
          }
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
    //发送手机验证码(语音)
    $scope.checkPicType = function (isuser, mtype) {
      if ($scope.checkFlag == 0) {
        showGtCaptcha(isuser, mtype);
      } else {
        setpiccode();
        $scope.checkpicshow = true;
      }
    };

    //检测验证码
    $scope.checkcode = function () {
      //检验验证码格式
      if (UtilService.isSmsCode($scope.alipay.smscode)) {
        UtilService.checkCode($scope.user.tel, $scope.alipay.smscode).success(function (data) {
          if (data.status == '000000') {
            token = data.token;
            $scope.bindalipay();
          } else if (data.status != '500004') {
            UtilService.showMess(data.msg);
          }
        })
      } else {
        UtilService.showMess("请输入正确的短信验证码！");
      }
    };

    //提交绑定-支付宝
    $scope.bindalipay = function () {
      //提交更新数据
      var params = {
        mod: 'nAccount',
        func: 'bindAlipay',
        userid: $scope.user.id,
        token: token,
        data: {
          'alipay': $scope.alipayaccount,
          'name': $scope.name
        }
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UserService.account.alipay = $scope.alipayaccount;
          UserService.account.name = $scope.name;
          UtilService.showMess("恭喜！您的享推帐号绑定支付宝成功");
          $timeout(function () {
            $ionicHistory.goBack(-3);
          }, 1000)

        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      })
    }
  })
  /*个人账户*/
  .controller("perAccountController", function ($scope, UserService, UtilService, ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    //红包点击
    $scope.purseClicked = false;
    $scope.purseClicking = false;
    function purseClick(event){
      $scope.purseClicking = true;
      $timeout(function(){
        $scope.purseClicked = true;
      },2000)
    }

    $scope.myacc = function () {
      var params = {
        mod: 'nAccount',
        func: 'getInfo',
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.account = UserService.account = data.data;
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.myacc();
    //綁定支付宝
    $scope.bindAlipay = function () {
      if ($scope.account.per == 0) {
        UtilService.showMess("您的账号存在异常，不能执行此项操作，请联系4000505811咨询");
      } else {
        $scope.go('setzhifubao');
      }
    }

  });

