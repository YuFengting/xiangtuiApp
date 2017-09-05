/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("mypurseController", mypurseController);

  //依赖注入
  mypurseController.$inject = ['$scope', '$interval','$timeout','$ionicModal','MyRedpackagService','UtilService','$rootScope','NewHandService','SqliteUtilService'];
  function mypurseController($scope, $interval,$timeout,$ionicModal,MyRedpackagService,UtilService,$rootScope,NewHandService,SqliteUtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.openpurse=false;
    $scope.step6p = false;
    //新手引导显示
    var newhandShow = function () {
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step < 6) {
            if (data[0].step == 5) {
              $rootScope.step6 = true;
            }
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step < 6) {
                if (res.data.step == 5) {
                  $rootScope.step6 = true;
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
    $scope.closepursenewhand = function () {
      $scope.step6p = false;
      $scope.go('account');
    };
    //新手引导第六步点击方法
    $scope.openpursenewhand = function () {
      $rootScope.step6 = false;
      $scope.purseClick(0,$scope.purselist[0]);

      NewHandService.syncNewHandStep(6).then(function () {
        var dataList = [{id: 1, step: 6}];
        SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
      }, function () {
      });

      $timeout(function(){
        $scope.step6p = true;
      },2000);
    };

    //列表数据
    $scope.purselist = [];
    //加载效果
    $scope.listloadding=true;
    //是否有下一页
    $scope.hasNextPage=false;
    //没有更多了提示标志
    $scope.hasnomore = false;
    //没有记录缺省页
    $scope.hasnopurse= false;

    $scope.loadpurselist = function(){
      //第一页不用出现没有更多提示
      $scope.hasnomore=false;
      $scope.hasnopurse=false;
      MyRedpackagService.getRedpackage().then(function(response){
        $scope.listloadding=false;
        if(response.status=='000000'){
          if(angular.isUndefined(MyRedpackagService.getpackageList())||MyRedpackagService.getpackageList().length==0){
            $scope.hasnopurse=true;
          }else{newhandShow();}
          $scope.purselist=MyRedpackagService.getpackageList();
          var respage = angular.fromJson(response.page);
          $scope.hasNextPage=respage.totalCount>10;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    $scope.loadpurselist();

    $scope.loadmorepurselist = function(){
      MyRedpackagService.loadMoreRedpackage().then(function(response){
        if(response.status=='000000'){
          $scope.purselist=MyRedpackagService.getpackageList();
          $scope.hasNextPage=MyRedpackagService.hasNextPage();
          $scope.hasnomore = !$scope.hasNextPage;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }



    //红包点击
    $scope.purseClicked = false;
    $scope.purseClicking = false;
    $scope.purseid=-1;
    $scope.purseClick = function(index,purse){
      $scope.openpurse=true;
      if(purse.workid){
        MyRedpackagService.openRedPackage(purse.workid).then(function(res){
          if(res.status=='000000'){
            $scope.purseid=index;
            //红包消失
            $timeout(function(){
              $scope.purselist[index].getredpackageflag=2;
            },500);
            //红包金额置空
            $timeout(function(){
              $scope.purselist[index].redpackagemoney=0;
            },1000);
          }else{
            UtilService.showMess(res.msg);
          }
        },function(){
          UtilService.showMess("网络不给力，请稍后再试！");
        })
      }else{
        $scope.purseid=index;
        //红包消失
        $timeout(function(){
          $scope.purselist[index].getredpackageflag=2;
        },500);
        //红包金额置空
        $timeout(function(){
          $scope.purselist[index].redpackagemoney=0;
        },1000);
      }
    }
    //一键领取
    $scope.pursePop = false;
    $ionicModal.fromTemplateUrl('pursemodal.html', {
      scope: $scope,
      animation: 'none'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.allmoney=0;
    $scope.openPurseModal = function() {
      MyRedpackagService.openAllRedPackage().then(function(res){
        if(res.status=='000000'){
          $scope.purseClicking = true;
          angular.forEach($scope.purselist,function(list,index){
            if($scope.purselist[index].getredpackageflag==1){
              $scope.purselist[index].getredpackageflag=3;
            }
            $scope.allmoney+=$scope.purselist[index].redpackagemoney;
            $scope.purselist[index].redpackagemoney=0;
          })
          if($scope.allmoney==0){
            UtilService.showMess("没有可拆红包！");
            return;
          }

          $scope.pursePop = false;
          $scope.purseShaked = false;
          $scope.modal.show();
          $timeout(function(){
            $scope.purseShaked = true;
          },1500)
          $timeout(function(){
            $scope.pursePop = true;
          },1900)
        }else{
          UtilService.showMess(res.msg);
        }
      },function(){
        UtilService.showMess("网络不给力，请稍后再试！");
      })
    };
    $scope.closePurseModal = function() {
      $scope.pursePop = false;
      $scope.purseShaked = false;
      $scope.modal.hide();
      $scope.purseClick();
    };


  }
}());
