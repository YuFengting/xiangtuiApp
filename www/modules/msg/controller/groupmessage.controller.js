(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('GroupmessageController', GroupmessageController);

  GroupmessageController.$inject=["UserService","$ionicPopup","$scope","$state","$stateParams","MsgService","GroupChatService","$timeout"];

  function GroupmessageController(UserService,$ionicPopup,$scope,$state,$stateParams,MsgService,GroupChatService,$timeout){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();

      init();
    })
    $scope.deleteSuccess="none";
    var init = function() {
      var imgroupid = $stateParams.imgroupid;
      if(imgroupid){
        MsgService.queryGroupInfo(imgroupid).then(function(data){
          $scope.groupinfo = data.data;

          $scope.isCreator = data.data.creator == UserService.user.id;
          $scope.isSGroup=data.data.bgroup==0;
          $scope.notify=$scope.groupinfo.notify==1;
        }, function(){});
      }
    };


    $scope.setGroupNotify=function(id,notify){
      $scope.groupinfo.notify = notify==1?0:1;
      $scope.notify=$scope.groupinfo.notify==1;
      MsgService.setGroupNotify(id,$scope.groupinfo.notify).then(function(data){},function(){});
    }
    //弹窗
    // 一个确认对话框
    $scope.invitepopupAdd = function() {
      var invitepopup = $ionicPopup.show({
        title: '当前群聊人数较多。为减少打扰，经对方同意邀请后才会进入群聊，现在邀请？',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">邀请</span>',
            type: 'button-positive',
            onTap:function(e){
              $scope.addinfopopup();
            }
          },
          {
            text: '<span style="color: #ff3b30">取消</span>',
            type:'button-go'
          },
        ]
      });
    };

    $scope.deletegroup = function() {
      var deletegrouppop = $ionicPopup.confirm({
        title: '退出后不会再接收此群消息，是否退出群聊?',
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '确定', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-positive' // String (默认: 'button-positive')。OK按钮的类型。
      });

      deletegrouppop.then(function(res) {
        if(res) {
          GroupChatService.deleteChatGroup($stateParams.imgroupid).then(function(data){if(data.status=="000000"){
            $scope.deleteSuccess="block";
            $timeout(function(){
              $scope.deleteSuccess="none";
              MsgService.deleteChatfirst($stateParams.imgroupid);
              //var from = GroupChatService.getMsgGroupFrom();
              //from = from=="addgroup"?"tab.msg":from;
              $scope.go("tab.msg");

            },1000);
          }},function(){});
        }
      });


    };

    $scope.openHome = function (userid, usertype) {
      if (usertype == 1) {
        //商家
        var params = {
          mod: 'nUser',
          func: 'getBuserByuserid',
          userid: UserService.user.id,
          data: {"merchantid":userid}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if(data.status == "103006"){
            UtilService.showMess("该商家已下架");
          }else{
            $scope.go('business', {merchantid: userid});
          }
        });


      } else {
        $scope.go('shome', {suserid: userid});
      }
    };

    function getChooseids(){

      var groupmemberids =[];

      angular.forEach($scope.groupinfo.members,function(value){
        groupmemberids.push(value.userid);
      });
      return groupmemberids;
    }
    //页面跳转
    $scope.gotogdel=function(){
      $state.go('deletegroupmember',{imgroupid:$stateParams.imgroupid,groupmemberids:getChooseids()});
    }
    $scope.gotogadd=function(){

      $state.go('addmoremember',{imgroupid:$stateParams.imgroupid,groupmemberids:getChooseids()});
    }
    $scope.gotogname=function(){
      $state.go('changegroupname',{imgroupid:$stateParams.imgroupid,groupname:$scope.groupinfo.name});
    }
    $scope.gotogmemb=function(){
      $state.go('groupmember',{imgroupid : $stateParams.imgroupid});
    };

  }

})()
