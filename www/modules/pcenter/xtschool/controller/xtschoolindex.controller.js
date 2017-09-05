$(function () {
  'use strict';
  angular.module('xtui')
    .controller('xtschoolindexController', xtschoolindexController);

  xtschoolindexController.$inject = ["$scope", "UtilService", "XtSchoolService", "$ionicScrollDelegate", "UserService", "$ionicSlideBoxDelegate","$timeout"];
  function xtschoolindexController($scope, UtilService, XtSchoolService, $ionicScrollDelegate, UserService, $ionicSlideBoxDelegate,$timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $ionicSlideBoxDelegate.$getByHandle('xtschoolSlide').enableSlide(false);
      if(UserService.xtschoolflg){
        $scope.type = XtSchoolService.getType();//0s端  1b端
        if($scope.type == 1){
          $scope.title = "玩赚享推(商家)";
          $ionicSlideBoxDelegate.$getByHandle('xtschoolSlide').slide(1, 300);
        }else {
          $scope.title = "玩赚享推";
          $ionicSlideBoxDelegate.$getByHandle('xtschoolSlide').slide(0, 300);
        }
        $scope.ptype = 0;
        $scope.XtInfoList = [[], []];//分别存放销售、商家数据
        $scope.hasNextPage = [[], []];//分别存放销售、商家是否有下一页
        $scope.pageno = [[], []];//分别存放销售、商家分页页码
        $scope.noinfolist = "none";
        $('.xtsCheckBox').removeAttr("checked");
        $scope.getXTSchoolIndexInfo();
        UserService.xtschoolflg = false;
      }else {
        if(angular.isDefined(XtSchoolService.getQuestionId()) && XtSchoolService.getQuestionId() != ""){
          $scope.getOneXtSchoolQInfo();
        }
      }
    });

    $scope.getXTSchoolIndexInfo = function () {
      if ($scope.type == 0) {
        $ionicScrollDelegate.$getByHandle('XtSchollIndexScroll').scrollTop();
      } else {
        $ionicScrollDelegate.$getByHandle('XtSchollBIndexScroll').scrollTop();
      }
      XtSchoolService.getXTSchoolInfo($scope.type, $scope.ptype).then(function (response) {
        $scope.withmenum = response.data.withmenum;
        $scope.XtInfoList[$scope.type] = XtSchoolService.getXtInfoList($scope.type);
        $scope.hasNextPage[$scope.type] = XtSchoolService.hasNextPage();
        $scope.pageno[$scope.type] = XtSchoolService.getPageNo();
        if (angular.isUndefined($scope.XtInfoList[$scope.type]) || $scope.XtInfoList[$scope.type].length == 0) {
          $scope.noinfolist = "block";
        } else {
          $scope.noinfolist = "none";
        }
      }, function () {
        if ($scope.XtInfoList[$scope.type].length == 0) {
          $scope.noinfolist = "block";
          UtilService.showMess("网络不给力，请稍后重试！");
        }
        if (angular.isUndefined($scope.withmenum)) {
          $scope.withmenum = 0;
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.loadMoreXTSchoolIndexInfo = function () {
      XtSchoolService.loadMoreXTSchoolInfo($scope.type, $scope.ptype).then(function () {
        $scope.XtInfoList[$scope.type] = XtSchoolService.getXtInfoList($scope.type);
        $scope.hasNextPage[$scope.type] = XtSchoolService.hasNextPage();
        $scope.pageno[$scope.type] = XtSchoolService.getPageNo();
      }, function () {
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.getOneXtSchoolQInfo = function () {
      XtSchoolService.getOneXtSchoolQInfo(XtSchoolService.getQuestionId()).then(function (response) {
        $scope.withmenum = response.data.withmenum;
        if(response.data.queinfo != "0"){
          $scope.XtInfoList[$scope.type][XtSchoolService.getQueIndex()] = response.data.queinfo;
        }else {
          $scope.XtInfoList[$scope.type].splice(XtSchoolService.getQueIndex(),1)
        }
        XtSchoolService.setQueIndex(0);
        XtSchoolService.setQuestionId("");
      }, function () {
      });
    };

    //记录查看官方标志
    var selectflg = false;
    //仅看享推官方
    $scope.select = function () {
      if ($scope.ptype == 0) {
        $('.xtsCheckBox').attr("checked",true);
        $scope.ptype = 2;
        $scope.getXTSchoolIndexInfo();
      } else {
        $('.xtsCheckBox').removeAttr("checked");
        $scope.ptype = 0;
        $scope.getXTSchoolIndexInfo();
      }
      selectflg = true;
    };

    //调整问题详情
    $scope.goXtSchoolQuestionDetail = function (que,index) {
      $scope.go('xtschooldetail', {qid: que.id});
      $timeout(function () {
        if (XtSchoolService.readedarr.indexOf(que.id) < 0)
          XtSchoolService.readedarr.push(que.id);
        XtSchoolService.setQuestionId(que.id);
        XtSchoolService.setQueIndex(index);
      },200);
    };

    $scope.checkReaded = function (id) {
      var list = XtSchoolService.readedarr;
      return list.indexOf(id) >= 0;
    };

    $scope.goXtsRelateMe = function () {
      $scope.go('xtsrelateme');
      $timeout(function () {
        $scope.withmenum = 0;
      },500);
    };

    $scope.goQuestion = function () {
      $scope.go('question',{type:$scope.type});
    };

    //切换商家/销售
    $scope.goXtBIndex = function () {
      if ($scope.type == 0) {
        $scope.type = 1;
        $scope.title = "玩赚享推(商家)";
        $ionicSlideBoxDelegate.$getByHandle('xtschoolSlide').slide(1, 300)
      } else {
        $scope.type = 0;
        $scope.title = "玩赚享推";
        $ionicSlideBoxDelegate.$getByHandle('xtschoolSlide').slide(0, 300)
      }
      XtSchoolService.setPageNo($scope.pageno[$scope.type]);
      //对应切换没有数据则刷新，切换过查看官方则刷新
      if($scope.hasNextPage[$scope.type].length == 0 || selectflg){
        $scope.getXTSchoolIndexInfo();
        selectflg = false;
      }
      XtSchoolService.setType($scope.type);
    };

  }
}());
