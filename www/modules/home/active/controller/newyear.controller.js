$(function () {
  'use strict';
  angular.module('xtui').controller('newyearController', newyearController);
  newyearController.$inject = ["$scope", "UtilService","MerryService", "$ionicScrollDelegate", "$timeout"];
  function newyearController($scope, UtilService,  MerryService, $ionicScrollDelegate, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $scope.getChristmasData();
      $scope.getChristmasList();
      document.addEventListener("backbutton", $scope.goBackPage, false);
    });
    var setInter;
    $scope.hasNextPage = false;
    $scope.appleflag = true;
    $scope.animation = "slide-top";
    $scope.animation_money = "spin-toggle";

    //防止按钮多次点击
    var merryflag = true;
    if (merryflag) {
      $(".rewardBtn").addClass("activated");
      $timeout(function () {
        $(".rewardBtn").removeClass("activated");
      }, 500);
      merryflag = false;
    }

    $scope.getBotArrow = true;//向下箭头
    $scope.activeMask = false;//弹窗遮罩层
    $scope.getMoneyWays = false;//赚钱攻略弹窗
    $scope.activeRules = false;//活动规则弹窗
    $scope.getReward = false;//抽到奖品弹窗
    $scope.nogetReward = false;//未抽到奖品弹窗

    //老虎机对象声明
    var machine1 = $("#machine1").slotMachine({
      active: 10,
      delay: 500
    });

    var machine2 = $("#machine2").slotMachine({
      active: 10,
      delay: 500
    });

    var machine3 = $("#machine3").slotMachine({
      active: 10,
      delay: 500
    });

    var machine4 = $("#machine4").slotMachine({
      active: 10,
      delay: 500
    });

    //滚动日志
    $scope.scrollLog = function () {
      var getNum = $(".nameList p").length;
      if(getNum > 2){
        setInter = setInterval(function(){
          $(".nameList").stop(true).animate({marginTop:"-30px"},500,function(){$(this).css("marginTop","0px").append($(this).find('p:first'))});
        },2000);
      }
    }
    //滚动一屏内容
    $scope.getContentScroll = function () {
      $scope.getBotArrow = false;
      var getH = window.screen.height;
      $ionicScrollDelegate.$getByHandle('xtui_active_content').scrollTo(0, getH, true);
      $('.getBotArrow').hide();
      // $scope.getBotArrow = false;
    }

    $scope.scrollContent = function () {
      $scope.getBotArrow = false;
    }



    $scope.getMoneyWaysFun = function () {
      $scope.activeMask = true;
      $scope.getMoneyWays = true;
    }



    $scope.activeRulesFun = function () {
      $scope.activeMask = true;
      $scope.activeRules = true;
      if($scope.getReward){
        $scope.getReward = false;
      }
      if($scope.nogetReward){
        $scope.nogetReward = false;
      }
      if($scope.getMoneyWays){
        $scope.getMoneyWays = false;
      }
      if(!$scope.appleflag){
        $scope.appleflag = true;
      }
    }

    $scope.activeMaskFun = function (type) {
      $scope.activeMask = false;
      $scope.getMoneyWays = false;
      $scope.activeRules = false;
      $scope.getReward = false;
      $scope.nogetReward = false;
      if (type == 1) {
        $scope.getContentScroll();
      }
      if (type == 2) {
        $scope.getChristmasData();
      }
      if(!$scope.appleflag){
        $scope.appleflag = true;
      }
    }


    //获取用户苹果数量与滚动日志列表
    $scope.getChristmasData = function () {
      MerryService.getChristmasIndexInfo("鸡祥金蛋").then(function (res) {
        if (res.status == '000000') {
          $scope.logList = MerryService.getAppleLogList();
          $scope.myapple = MerryService.getMyAppleNumber();
          $scope.appleToken = res.token;
          if ($scope.logList.length > 2) {
            $scope.scrollLog();
          }
        }
      }, function () {
        UtilService.showMess1("网络不给力，请稍后刷新");
      })
    }

    //获取活动任务列表
    $scope.getChristmasList = function () {
      $scope.getChristmasData();
      MerryService.addChristmasActUser("鸡祥金蛋").then(function (resadd) {
      });
      MerryService.getChristmasIndexList("鸡祥金蛋").then(function (res) {
        if (res.status == '000000') {
          $scope.taskList = MerryService.getAppleTaskList();
        }
      }, function () {
        UtilService.showMess1("网络不给力，请稍后刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.getChristmasList();
      clearInterval(setInter);
      $scope.scrollLog();
    }

    //老虎机滚动
    $scope.showmoney = function () {
      if ($scope.appleflag) {
        $scope.appleflag = false;
        if ($scope.myapple == 0) {
          $scope.activeMask = true;
          $scope.nogetReward = true;
        } else {
          MerryService.getConsumeRewardLog("鸡祥金蛋", $scope.appleToken).then(function (res) {
            if (res.status == "000000") {
              $scope.appleToken = res.token;
              $scope.appleMoney = res.data.money;
              var moneyArray = new Array();
              var str = $scope.appleMoney.toString().replace(".", "");
              for (var i = 0; i < str.length; i++) {
                moneyArray.push(str.substring(i, i + 1));
              }
              var time1 = $timeout(function () {
                machine1.shuffle(4, null, 0);
              }, 0)
              var time2 = $timeout(function () {
                machine2.shuffle(4, null, moneyArray[0]);
              }, 0);
              var time3 = $timeout(function () {
                machine3.shuffle(4, null, moneyArray[1]);
              }, 0);
              var time4 = $timeout(function () {
                machine4.shuffle(4, null, moneyArray[2]);
              }, 0).then(function () {
                $timeout(function () {
                  $scope.activeMask = true;
                  $scope.getReward = true;
                }, 2500)
              });
              $timeout.cancel();
              $scope.myapple--;
            }
          }, function () {
            UtilService.showMess1("网络不给力，请稍后刷新");
          }).finally(function(){
            $scope.appleflag = true;
          });
        }
      }
    }

    //跳转任务详情
    $scope.goDetail = function (task) {
      $scope.go('taskdetail', {'taskid': task.id, 'showtype': task.showtype});
    }

    $scope.goBackPage = function () {
      $scope.activeRules = false;
      $scope.activeMask = false;
      $scope.getMoneyWays = false;
      $scope.goback();
    }
  }
}());
