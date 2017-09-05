//处理中（结算=>已结算）
angular.module('xtui')
  .controller("customerDetail3Controller", function ($timeout,$scope, $state, $stateParams, ConfigService, CustomerService, CustomerSubmitService, UserService, UtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();

      window.addEventListener('native.keyboardshow', onKbOpen1);
      window.addEventListener('native.keyboardhide', onKbClose1);

    });
    $scope.leads = $stateParams.leads;
    $scope.haspic = $scope.leads.pics!=null&&$scope.leads.pics.length>0;
    $scope.showpic = false;
    $scope.picgetbig=function(pic,index){
      $scope.showpic=true;
      $scope.showimgIndex = index;

      $timeout(function(){
        var picNum = $('.picSlide').find('.big-pic');
        //alert(picNum.length)
        for (var i=0;i<picNum.length;i++) {
          var currnetImg = picNum.eq(i);
          var a = currnetImg.height() / currnetImg.width();
          var sW = window.screen.width;
          var sh = 640 * window.screen.height / window.screen.width;
          if (a < window.screen.height / window.screen.width) {
            currnetImg.css('margin-top', sh / 2 - currnetImg.height() / 2 + 'px');
          } else {
            currnetImg.css('margin-left', 640 / 2 - currnetImg.width() / 2 + 'px')
          }
          currnetImg.css("opacity",1);
        }
      },50)

    };

    $scope.shrinkPic=function(){
      $('.big-pic').hide();
      $scope.showpic=false;
    };

    /*图片部分结束*/
    $scope.formdata = {};
    $scope.leadsLogList = [];
    $scope.leadsPayList = [];

    //键盘监听事件
    //键盘监听事件
    $scope.applyMoneyListSty={'top':'50%'};

    function onKbOpen1(e) {
      if (device.platform == "Android") {
      } else {
        $timeout(function(){$scope.applyMoneyListSty={'top':'30%'}},350)
      }
    }


    function onKbClose1(e) {
      if (device.platform == "Android") {
      } else {
        $timeout(function(){$scope.applyMoneyListSty={'top':'50%'}},350)
      }
    }
    $scope.$on('$ionicView.unloaded', function () {
      window.removeEventListener('native.keyboardshow', onKbOpen1);
      window.removeEventListener('native.keyboardhide', onKbClose1);

    });


    CustomerService.getDealingLeadsDetail($scope.leads.leadsid).then(function (data) {
      $scope.leadsLogList = data.data.leadslog;
      $scope.leadsPayList = data.data.leadsPays;
    }, function (data) {

    }).finally(function () {
      $scope.$broadcast('scroll.refreshComplete');
    });


    /**
     * 展示提交佣金的窗口
     */
    $scope.showApplymoney = function () {
      if ($scope.leads.rstatus == 1) {
        UtilService.showMess("该客户提交信息记录被冻结");
        return;
      }
      var flg = false;
      $.each($scope.leadsPayList, function (n, v) {
        if (v.status == 0 || v.status == 1 || v.status == 3 || v.status == 4) {
          flg = true;
          return false;
        }
      });
      if (flg) {
        UtilService.showMess("有等待商家审核的佣金记录");
        return;
      }

      //再次实时监测leads的状态防止提交错误数据
      CustomerService.getLeadsById($scope.leads.leadsid).then(function (data) {
        var leads = data.data;
        if (leads.status == 3) {
          UtilService.showMess("该客户提交信息记录已经结束");
        } else if (leads.rstatus == 1) {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else {
          $(".applyMoneyDialog").show();
        }
      }, function () {
      })
    };

    $(".applyMoneyDialog").click(function () {
      $(this).hide();
    });
    $(".applyMoneyList").click(function (e) {
      e.stopPropagation();
    });
    var isNumber = function (str) {
      //-3：非数字 -2：非正浮点数 -1：非正整数 0：正整数 1：1-2位小数 2：3位或者以上的小数
      var reg = /^-?[1-9]\d*$/;
      if (reg.test(str)) {
        if (parseInt(str) > 0) {
          return 0;
        } else {
          return -1;
        }

      }
      else {
        var num = 0;
        for (i = 0; i < str.length; i++) {
          if (str.charAt(i) == ".") {
            num++;
          }
        }
        if (num > 2) {
          return -3;
        }


        reg = /^(-?\d+)(\.\d+)?$/;
        if (reg.test(str)) {
          if (parseFloat(str) > 0) {
            str = parseFloat(str) + "";
            reg = /^[0-9]+(.[0-9]{1,2})?$/;
            if (reg.test(str)) {
              return 1;
            } else {
              return 2;
            }
          } else {
            return -2;
          }
        } else {
          return -3;
        }
      }
    };
    /**
     * 提交佣金
     */
    $scope.subApplymoney = function () {
      if (angular.isUndefined($scope.formdata.pay) || $scope.formdata.pay == "") {
        UtilService.showMess("请输入佣金");
        return;
      }

      var numres = isNumber($.trim($scope.formdata.pay));
      if (numres == -3) {
        UtilService.showMess("佣金必须是数字");
        return;
      }
      if (numres == -2 || numres == -1) {
        UtilService.showMess("佣金必须是正数");
        return;
      }
      if (numres == 2) {
        UtilService.showMess("佣金必须是1-2位的小数");
        return;
      }
      var payfloat = parseFloat($.trim($scope.formdata.pay));
      if (payfloat > 999999) {
        UtilService.showMess("交易额不能超过999999元");
        return;
      }
      if ($scope.leads.rstatus == 1) {
        UtilService.showMess("该客户提交信息记录被冻结");
        return;
      }

      if (angular.isDefined($scope.formdata.memo) && $scope.formdata.memo.length > 50) {
        UtilService.showMess("备注信息长度不能超过50");
        return;
      }
      $scope.formdata.leadsid = $scope.leads.leadsid;
      CustomerService.applymoney($scope.formdata).then(function (data) {
        $(".applyMoneyDialog").hide();
        $scope.formdata = {};

        if (data.status == "000000") {
          UtilService.tongji("applymoney", {leadsid: $scope.leads.leadsid});
          CustomerService.getDealingLeadsDetail($scope.leads.leadsid).then(function (data) {
            $scope.leadsPayList = data.data.leadsPays;
          }, function (data) {
          }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
          });
          var resData = data.data;
          CustomerSubmitService.sendMsgWhileApplyingMoney(resData.nleadspayid, resData.pay, resData.buserid, resData.alias);
        } else if (data.status == "130103") {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else if (data.status == "130104") {
          UtilService.showMess("有等待商家审核的佣金记录");
        } else if (data.status == "130105") {
          UtilService.showMess("该客户提交信息记录已经结束");
          $scope.lead.status = 3;
          $scope.go("customerdetail4", $scope.lead);
        } else if (data.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (data.status == "130006") {
          UtilService.showMess("商家与您已解除雇佣关系");
        }
      }, function (data) {

      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.responseCancel = function (id, acc) {
      CustomerService.responseCancel(id, acc).then(function (res) {
        if (res.status == "000000") {
          for (var i = 0; i < $scope.leadsPayList.length; i++) {
            if ($scope.leadsPayList[i].id == id) {
              $scope.leadsPayList[i].status = acc == 0 ? 5 : 4;
              break;
            }
          }

        }
      }, function () {
      });
    }


  });
