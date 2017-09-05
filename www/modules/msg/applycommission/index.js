angular.module('xtui')
//个人中心
  .controller("ApplyCommController", function ($timeout, $ionicModal, CustomerService, $ionicPopup, $state, $scope, $stateParams, UtilService, UserService, ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user = UserService.user;
    var merchantid = $stateParams.merchantid;
    $scope.company = $stateParams.company;
    $scope.avate = $stateParams.avate;
    var imgroupid = $stateParams.imgroupid;
    $scope.nonetask = false;
    $scope.formdata = {};
    var token;

    var apply = function () {
      //if (!UtilService.checkNetwork()) {
      //  UtilService.showMess("网络不给力，请稍后重试");
      //  return;
      //}
      $scope.applyPop = true;
      $scope.maskshow = true;

      var params = {
        mod: 'nStask',
        func: 'getChatLeads',
        userid: $scope.user.id,
        data: {"merchantid": merchantid, "status": "2"}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          $scope.chatleadslist2 = data.data;
          if (angular.isUndefined(data.data) || data.data.length == 0) {
            $scope.nonetask = true;
          } else {
            $scope.nonetask = false;
          }
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
        $scope.nonetask = true;
      });
      //UtilService.tongji("chat", {type: 5});
      //UtilService.customevent("bchat", "shenqingyongjin");
    };
    apply();

    //申请佣金
    $scope.yjPop = function (chatlead2) {

      var params = {
        mod: 'NStask',
        func: 'applyJudgeCommission',
        userid: UserService.user.id,
        data: {"nleadsid": chatlead2.id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          $scope.chatleadshoukuan = chatlead2;
          $scope.opengetbusmoneytaskModal();
        } else if (data.status == "130103") {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else if (data.status == "130104") {
          UtilService.showMess("有等待商家审核的佣金记录");
        } else if (data.status == "130105") {
          UtilService.showMess("该客户提交信息记录已经结束");
          $scope.chatleadshoukuan.status = 3;
        } else if (data.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (data.status == "130006") {
          UtilService.showMess("商家与您已解除雇佣关系");
        }
      });
    };

    /**
     * 提交佣金
     */
    $scope.subshoukuanyongjing = function () {
      if (angular.isUndefined($scope.formdata.pay) || $scope.formdata.pay == "" || $scope.formdata.pay == null) {
        UtilService.showMess("金额不能为空");
        return;
      }
      if (!UtilService.isNumber($scope.formdata.pay)) {
        UtilService.showMess("请输入正确的金额");
        return;
      }
      if ($scope.chatleadshoukuan.rstatus == 1) {
        UtilService.showMess("该客户提交信息记录被冻结");
        return;
      }
      if (angular.isDefined($scope.formdata.desc) && $scope.formdata.desc.length > 50) {
        UtilService.showMess("申请理由不能大于50字符");
        return;
      }
      $scope.formdata.leadsid = $scope.chatleadshoukuan.id;
      CustomerService.applymoney($scope.formdata).then(function (data) {
        token = data.token;
        if (data.status == "000000") {
          var newDate = new Date();
          var FomatorString = "YYYY-MM-DD HH:MI:SS";
          //发给B
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 3,
              content: data.data.nleadspayid,
              receiverid: merchantid,
              subtype: 1
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});

          //发给S
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 3,
              content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "向" + $scope.company + "申请佣金" + $scope.formdata.pay + "元，请耐心等待商家审核",
              receiverid: UserService.user.id
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});
          var params = {
            mod: 'IM',
            func: 'getSimplenLeadsPayByLeadId',
            userid: $scope.user.id,
            data: {"nleadpayid": data.data.nleadspayid}
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
            token = data.token;
            if (data.status == "000000") {
              shownleadPop(data.data.nleadpay, '11');
            }
          });
        } else if (data.status == "130103") {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else if (data.status == "130104") {
          UtilService.showMess("有等待商家审核的佣金记录");
        } else if (data.status == "130105") {
          UtilService.showMess("该客户提交信息记录已经结束");
          $scope.chatleadshoukuan.status = 3;
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

    //申请佣金
    $ionicModal.fromTemplateUrl('getbusmoney3.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (getbusmoney3) {
      $scope.getbusmoney3 = getbusmoney3;
    });
    $scope.opengetbusmoneytaskModal = function () {
      $scope.getbusmoney3.show();
      $timeout(function () {
        $scope.startfun();
      }, 0)
    };
    $scope.closegetbusmoneytaskModal = function () {
      $scope.getbusmoney3.hide();
    };
    //发送客户和佣金
    var shownleadPop = function (chatlead, contenttype) {
      if (angular.isDefined(chatlead) && chatlead != "") {
        var params = {
          mod: 'IM',
          func: 'sendMsg',
          userid: $scope.user.id,
          data: {
            imgroupid: imgroupid,
            receiverid: merchantid,//好友userid
            senderid: $scope.user.id,
            content: chatlead.nleadspayid,
            contenttype: contenttype
          }
        };
        UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
          token = data.token;
          if (data.status == '000000') {
            UtilService.showMess("佣金申请成功");
            $timeout(function () {
              $scope.getbusmoney3.hide();
              $scope.formdata = {};
            }, 1000)

          } else {
            UtilService.showMess("佣金申请失败");
          }
        }).error(function () {
        })
      }
    };

  });
