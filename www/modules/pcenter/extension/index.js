/**
 * Created by Administrator on 2016/6/15.
 */
angular.module('xtui')
  .controller("extensionController", function ($scope, $window, UserService, UtilService, ConfigService, ExtensionService, $ionicScrollDelegate) {
    $scope.$on("$ionicView.afterEnter", function () {
      $scope.startfun();
    })
    $scope.userid = UserService.user.id;
    $scope.type = 1;
    $scope.notaskflg = "none";
    $scope.cpsdatalist = [];
    $scope.cpcdatalist = [];
    $scope.cpsshowflg = "none";
    $scope.cpcshowflg = "none";
    $scope.active_show_cpc = true;
    $scope.active_show_cps = false;
    $scope.hide_con_cpc = false;
    $scope.hide_con_cps = true;
    $scope.CpcPageNo = 0;
    $scope.CpsPageNo = 0;
    $scope.domore = true;
    $scope.cpsdomore = true;
    $scope.cpcdomore = true;

    $(".cancelActiveBtn").click(function () {
      $(".quitBusinessMask").show();
    });
    $(".quitpopInfor").click(function (e) {
      e.stopPropagation();
    })
    $(".sureBtn").click(function () {
      $(".quitBusinessMask").hide();
    });
    $(".cancelBtn").click(function () {
      $(".quitBusinessMask").hide();
    });
    $(".quitBusinessMask").click(function () {
      $(".quitBusinessMask").hide();
    });

    $scope.loadPageDataList = function () {
      if ($scope.type == 0) {
        $scope.refrecpsList();
      } else {
        $scope.refreshList();
      }
    }

    $scope.loadPageDataMore = function () {
      if ($scope.type == 0) {
        $scope.loadCpsMore();
      } else {
        $scope.loadCpcMore();
      }
    }

    $scope.changeBox = function (type) {
      $scope.type = type;
      if ($scope.type == 0) {
        $scope.active_show_cpc = false;
        $scope.active_show_cps = true;
        if ($scope.CpsPageNo == 0) {
          $scope.refrecpsList();
        }
      } else {
        $scope.active_show_cpc = true;
        $scope.active_show_cps = false;
        if ($scope.CpcPageNo == 0) {
          $scope.refreshList();
        }
      }
      $ionicScrollDelegate.$getByHandle('dataHandler').scrollTop(); 
    }

    //cpc上拉加载
    $scope.loadCpcMore = function () {
      ExtensionService.pagination().then(function (response) {
          if (response.status == '000000') {
            $scope.cpcdatalist = ExtensionService.getCpcList();
            $scope.cpchasNextPage = ExtensionService.hasCpcNextPage();
          } else {
            $scope.cpchasNextPage = false;
          }
          $scope.domore = ExtensionService.getCpcDoMore();
          $scope.cpcdomore = $scope.domore;
          $scope.CpcPageNo = ExtensionService.getCpcpageno();
        }, function () {
          $scope.CpcPageNo = ExtensionService.getCpcpageno();
          $scope.cpchasNextPage = false;
          $scope.domore = true;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };
    //cps上拉加载
    $scope.loadCpsMore = function () {
      ExtensionService.loadmoreCps().then(function (response) {
          if (response.status == '000000') {
            $scope.cpsdatalist = ExtensionService.getCpsList();
            $scope.cpshasNextPage = ExtensionService.hasCpsNextPage();
          } else {
            $scope.cpshasNextPage = false;
          }
          $scope.domore = ExtensionService.getCpsDoMore();
          $scope.cpsdomore = $scope.domore;
          $scope.CpsPageNo = ExtensionService.getCpspageno();
        }, function () {
          $scope.CpsPageNo = ExtensionService.getCpspageno();
          $scope.cpshasNextPage = false;
          $scope.domore = true;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.refreshList = function () {
      // $scope.cpcshowflg = "none";
      $scope.domore = false;
      $scope.cpchasNextPage = false;
      ExtensionService.refresh().then(function (response) {
          if (response.status == '000000') {
            $scope.cpcdatalist = ExtensionService.getCpcList();
            $scope.cpchasNextPage = ExtensionService.hasCpcNextPage();
          } else {
            $scope.cpchasNextPage = false;
          }
          $scope.CpcPageNo = ExtensionService.getCpcpageno();
          if ($scope.cpcdatalist.length == 0 || $scope.cpcdatalist.length < 10) {
            $scope.domore = true;
          } else {
            $scope.domore = ExtensionService.getCpcDoMore();
          }
          if ($scope.cpcdatalist.length == 0) {
            $scope.cpcshowflg = "block";
          }
          $scope.cpcdomore = $scope.domore;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function () {
          UtilService.showMess("网络不给力，请稍后刷新");
          $scope.cpchasNextPage = false;
          $scope.CpcPageNo = 1;
          $scope.domore = true;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.refrecpsList = function () {
      // $scope.cpsshowflg = "none";
      $scope.domore = false;
      $scope.cpshasNextPage = false;
      ExtensionService.refreshCps().then(function (response) {
          if (response.status == '000000') {
            $scope.cpsdatalist = ExtensionService.getCpsList();
            $scope.cpshasNextPage = ExtensionService.hasCpsNextPage();
          } else {
            $scope.cpshasNextPage = false;
          }
          $scope.CpsPageNo = ExtensionService.getCpspageno();
          if ($scope.cpsdatalist.length == 0 || $scope.cpsdatalist.length < 10) {
            $scope.domore = true;
          } else {
            $scope.domore = ExtensionService.getCpsDoMore();
          }
          if ($scope.cpsdatalist.length == 0) {
            $scope.cpsshowflg = "block";
          }
          $scope.cpsdomore = $scope.domore;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function () {
          UtilService.showMess("网络不给力，请稍后刷新");
          $scope.cpshasNextPage = false;
          $scope.CpsPageNo = 1;
          $scope.domore = true;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    $scope.refreshList();
    $scope.refrecpsList();
    // $scope.loadPageDataList();
    $scope.goCpcShowList = function () {
      UserService.fastget = true;
      $scope.go("fastget");
    }


    $scope.goCpsShowList = function () {
      $scope.cleargo("tab.cloudsale");
    }

    $scope.goGoodarticle = function (act) {
      var obj = {articleid: act.articleid};
      if (act.type == 3) {
        $scope.go('teamheadmodel', {taskid: act.taskid, articleid: act.articleid});
      } else if (act.type == 2) {
        $scope.go('coupon', {'taskid': act.taskid, 'articleid': act.articleid});
      } else {
        $scope.go('goodarticle', {'taskid': act.taskid, 'articleid': act.articleid});
      }
    }

    $scope.goDetail = function (ctaskid) {
      var params = {
        mod: 'NStask',
        func: 'judgeTaskOrBuserExamine',
        userid: UserService.user.id,
        data: {"taskid": ctaskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "103005") {
          UtilService.showMess("该任务已下架");
        } else if (data.status == "103006") {
          UtilService.showMess("该商家已下架");
        } else {
          if (data.data.tasktype == 0) {
            $scope.go('taskdetail', {'taskid': data.data.taskid})
          } else if (data.data.tasktype == 1) {
            $scope.go('helpselldetail', {'taskid': data.data.taskid})
          }
        }
      });
    }
    UtilService.customevent("extension", "常用推广");
  })
