/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("recListController", recListController);

  //依赖注入
  recListController.$inject = ['$scope','RecommendService','UtilService','$stateParams','UserService','ConfigService'];
  function recListController($scope, RecommendService,UtilService,$stateParams,UserService,ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $scope.matchcontacts();
    });
    var taskid = $stateParams.taskid;
    var workid = $stateParams.workid;
    $scope.recommendworkid=workid;
    //个人通讯录数据
    var m = new Map();
    //列表数据
    $scope.recommendlist = [];
    //加载效果
    $scope.listloadding=true;
    //是否有下一页
    $scope.hasNextPage=false;
    //没有更多了提示标志
    $scope.hasnomore = false;
    //没有记录缺省页
    $scope.hasnorecommend = false;
    $scope.recommendflag =0;
    //加载通讯录数据
    $scope.matchcontacts = function(){
      $scope.listloadding=false;
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      var filter = ["displayName", "addresses","phoneNumbers"];
      navigator.contacts.find(filter,
        function(contacts){
          angular.forEach(contacts,function(contact){
            m.set(contact.phoneNumbers[0].value, contact.displayName);
          })
        },function (contactError) {
          UtilService.showMess("通讯录匹配失败！");
        }, options);
    };
    //加载第一页数据
    $scope.loadrecommendlist = function(){
      //第一页不用出现没有更多提示
      $scope.hasnomore=false;
      $scope.hasnorecommend = false;

      RecommendService.getRecommend(taskid,workid).then(function(response){
        $scope.listloadding=false;
        if(response.status=='000000'){
          //获取更多优惠券
          $scope.recommendflag=RecommendService.getRecommendMoreFlag();
          if(angular.isUndefined(RecommendService.getRecommendList())||RecommendService.getRecommendList().length==0){
            $scope.hasnorecommend=true;
          }
          //匹配通讯录手机号
          var lists = RecommendService.getRecommendList();
          if(angular.isDefined(m)){
            angular.forEach(lists,function(list,index){
              if(angular.isDefined(m.get(list.otherstel))){
                lists[index].name=m.get(list.otherstel);
              }
            })
            $scope.recommendlist=lists;
          }else{
            $scope.recommendlist=RecommendService.getRecommendList();
          }
          var respage = angular.fromJson(response.page);
          $scope.hasNextPage=respage.totalCount>10;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    $scope.loadrecommendlist();
    //加载更多数据
    $scope.loadmorerecommendlist = function(){
      RecommendService.loadMoreRecommend(taskid,workid).then(function(response){
        if(response.status=='000000'){
          //获取更多优惠券
          $scope.recommendflag=RecommendService.getRecommendMoreFlag();
          //匹配通讯录手机号
          var lists = RecommendService.getRecommendList();
          if(angular.isDefined(m)){
            angular.forEach(lists,function(list,index){
              if(angular.isDefined(m.get(list.otherstel))){
                lists[index].name=m.get(list.otherstel);
              }
            })
            $scope.recommendlist=lists;
          }else{
            $scope.recommendlist=RecommendService.getRecommendList();
          }

          $scope.hasNextPage=RecommendService.hasNextPage();
          $scope.hasnomore = !$scope.hasNextPage;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.applymorecoupon = function(recommendworkid){
      var params = {
        mod: 'nUser',
        func: 'getMoreCoupon',
        userid: UserService.user.id,
        data: {"workid":recommendworkid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if(data.status == "000000") {
          UtilService.showMess("申请成功，继续分享给好友抢吧。");
          $scope.recommendflag=0;
        } else {
          UtilService.showMess(data.msg);
        }
      });
    }

  }
}());
