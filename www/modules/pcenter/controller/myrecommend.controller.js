/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("myrecommendController", myrecommendController);

  //依赖注入
  myrecommendController.$inject = ['$scope','MyRecommendService','UtilService'];
  function myrecommendController($scope,MyRecommendService,UtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //列表数据
    $scope.myrecommendlist = [];
    //加载效果
    $scope.listloadding=true;
    //是否有下一页
    $scope.hasNextPage=false;
    //没有更多了提示标志
    $scope.hasnocommendmore = false;
    //没有记录缺省页
    $scope.hasnoremycommend= false;

    $scope.loadmyrecommendlist = function(){
      //第一页不用出现没有更多提示
      $scope.hasnocommendmore=false;
      $scope.hasnoremycommend=false;
      MyRecommendService.getMyrecommends().then(function(response){
        $scope.listloadding=false;
        console.log(response);
        if(response.status=='000000'){
          if(angular.isUndefined(MyRecommendService.getMyrecommendsList())||MyRecommendService.getMyrecommendsList().length==0){
            $scope.hasnoremycommend=true;
          }
          $scope.myrecommendlist=MyRecommendService.getMyrecommendsList();
          var respage = angular.fromJson(response.page);
          $scope.hasNextPage=respage.totalCount>10;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    $scope.loadmyrecommendlist();

    $scope.loadmoremyrecommendlist = function(){
      MyRecommendService.loadMoreRecommend().then(function(response){
        if(response.status=='000000'){
          $scope.myrecommendlist=MyRecommendService.getMyrecommendsList();
          $scope.hasNextPage=MyRecommendService.hasNextPage();
          $scope.hasnocommendmore = !$scope.hasNextPage;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.goreclist = function(myrecommend){
      if(myrecommend.takenumber==0){
        UtilService.showMess("还没有用户领取你的优惠券哦！");
      }else{
        $scope.go("reclist",{"taskid":myrecommend.taskid,"workid":myrecommend.workid});
      }
    }
  }
}());
