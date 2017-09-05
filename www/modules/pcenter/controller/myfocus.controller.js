/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("myfocusController", myfocusController);

  //依赖注入
  myfocusController.$inject = ['$scope', '$interval','ConfigService','BusinessIndexService','MyAttentionService','UserService','$ionicHistory','MsgService','UtilService'];
  function myfocusController($scope, $interval,ConfigService,BusinessIndexService,MyAttentionService,UserService,$ionicHistory,MsgService,UtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //列表数据
    $scope.focuslist = [];
    //加载效果
    $scope.listloadding=true;
    //是否有下一页
    $scope.hasNextPage=false;
    //没有更多了提示标志
    $scope.hasnomore = false;
    //没有记录缺省页
    $scope.hasnofocus= false;

    $scope.loadfocuslist = function(){
      //第一页不用出现没有更多提示
      $scope.hasnomore=false;
      $scope.hasnofocus=false;
      MyAttentionService.getAttention().then(function(response){
        $scope.listloadding=false;
        if(response.status=='000000'){
          if(angular.isUndefined(MyAttentionService.getAttentionList())||MyAttentionService.getAttentionList().length==0){
            $scope.hasnofocus=true;
          }
          $scope.focuslist=MyAttentionService.getAttentionList();
          var respage = angular.fromJson(response.page);
          $scope.hasNextPage=respage.totalCount>10;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    $scope.loadfocuslist();

    $scope.loadmorefocuslist = function(){
      MyAttentionService.loadMoreAttention().then(function(response){
        if(response.status=='000000'){
          $scope.focuslist=MyAttentionService.getAttentionList();
          $scope.hasNextPage=MyAttentionService.hasNextPage();
          $scope.hasnomore = !$scope.hasNextPage;
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.goskip = function(focus){
        var params = {
          mod: 'nUser',
          func: 'getBuserByuserid',
          userid: UserService.user.id,
          data: {"merchantid": focus.buserid}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if (data.status == "103006") {
            UtilService.showMess("该商家已下架");
          } else {
            if($ionicHistory.backView().stateName=="tab.pcenter"){
              UserService.focusskipflag="";
              $scope.go('business', {'merchantid': focus.buserid});
            }else if($ionicHistory.backView().stateName=="tab.msg"){
              MsgService.createTemporaryChat(focus.buserid).then(function(data) {
                if(data.status == "000000") {
                  $scope.go('msgdetail', {
                    'imgroupid': data.data.imgroupid,
                    'otheruserid': focus.buserid,
                    'otherusername': focus.busername,
                    'istmp': data.data.istmp,
                    'avate': focus.buserlogo
                  });
                } else {
                  UtilService.showMess(data.msg);
                }
              }, function () {
                UtilService.showMess("网络不给力，请稍候刷新");
              });
            }else{
              UserService.focusskipflag="";
              $scope.go('business', {'merchantid': focus.buserid});
            }
          }
        });
    }

    $scope.msgDelete = function(focus,index){
      //关注、取消关注商户
        BusinessIndexService.concernBusiness(focus.buserid).then(function (response) {
          if (response.status == '000000') {
            if(response.data.msg == "0"){
              UtilService.showMess("关注成功！");
            }else {
              UtilService.showMess("取消关注成功！");
              $scope.focuslist[index].isshow=false;
              BusinessIndexService.delFriend(focus.buserid).then(function (response) {
                if(response.status=='000000'){
                  MsgService.deleteChatfirst(response.data);
                }
              },function () {
              });

            }
          } else {
            UtilService.showMess(response.msg);
          }
        }, function () {
          UtilService.showMess("网络不给力，请稍后重试");
        });
    };

  }
}());
