(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('AddgroupController', AddgroupController);

  AddgroupController.$inject=["UserService","$scope","$timeout","$ionicScrollDelegate","MsgService","GroupChatService"];
  function AddgroupController(UserService,$scope,$timeout,$ionicScrollDelegate,MsgService,GroupChatService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();

    })


    $scope.groupname='群聊名称';
    $scope.selectitem=0;
    $scope.showsearch=false;
    $scope.nocontact=false;
    $scope.hasSearch=false;
    $scope.contactlistForHead = [];
    $scope.lista=[];
    MsgService.queryContacts({contactType:0}).then(function(res){
      var allLength =0;
      angular.forEach(res.data.susers,function(obj){
        var arr = [];
        angular.forEach(obj.array,function(value){
        value.ifchecked=false;
        value.ifchecked2=false;//头部选中
          arr.push(value);
        });
        obj.haslength=arr.length>0;
        if(obj.haslength){
          $scope.lista.push(obj.name_pinyin);
        }
        allLength+=arr.length;
      });
      $scope.nocontact = allLength==0;
      $scope.hasSearch = allLength>0;
      $scope.contactlist = res.data.susers;
    },function(){});

    $scope.ifgroup=false;
    $scope.checkmember=function(item){
      item.ifchecked2=!item.ifchecked2;

      if(item.ifchecked2){
        $scope.contactlistForHead.push(item);
        $scope.selectitem++;
      }else{
        var index;
        $.each($scope.contactlistForHead,function(n,v){
          if(v.userid ==item.userid ){
            index=n;
          }
        });
        $scope.contactlistForHead.splice(index,1);
        $scope.selectitem--;
      }
      $scope.renderCorner();
      $ionicScrollDelegate.$getByHandle('selectscroll').scrollTo($scope.selectitem*86, 0, true);
      for(var i=0;i<5;i++){//解决由于div长度不是固定的，导致不能滑动
        if($('.scrollhead').css("overflow")=="hidden"){
          $('.scrollhead').css("overflow","scroll");
        }
      }
    };
    $scope.chatGroup = {};
    $scope.chatGroupSearch = function(){
      var key =$scope.chatGroup.searchkey;
      $scope.lista=[];
      angular.forEach($scope.contactlist,function(obj){
        if($.trim(key)==""){
          obj.haslength=true;
        }else{
          var length = obj.array.length;
          angular.forEach(obj.array,function(value){
            if(value.name.indexOf(key)==-1) length--;
          });
          obj.haslength= length>0;
        }
        if(obj.haslength){
          $scope.lista.push(obj.name_pinyin);
        }
      });
    };
    $scope.reChoose = function(item){
      angular.forEach($scope.contactlist,function(obj){
        angular.forEach(obj.array,function(value){
          if(value.userid ==item.userid ){
            value.ifchecked2=false;//头部选中
          }
        })
      });
      var index;
      $.each($scope.contactlistForHead,function(n,v){
        if(v.userid ==item.userid ){
          index=n;
        }
      });
      $scope.contactlistForHead.splice(index,1);
      $scope.selectitem--;
      $scope.renderCorner();
    };
    $scope.renderCorner = function(){
      if($scope.selectitem==0){
        $scope.querenStyle = {
          'opacity':.56
        };
        $scope.ifgroup=false;
        $scope.showsearch=true;
      }else{
        $scope.querenStyle = {
          'opacity':1
        };
        $scope.ifgroup=true;
        $scope.showsearch=false;
      }
    };
    $scope.intogroup=function(){
      var ind = 2;
      var membernames =[];
      var memberids =[];
      membernames.push(UserService.user.nick);
      memberids.push(UserService.user.id);
      angular.forEach($scope.contactlistForHead,function(value){
          memberids.push(value.userid);
          if(ind>0)
            membernames.push(value.name);
          ind--;
      });
      var gname = membernames.join(",") +"...";
      var gmembers = memberids.join(",");
      if( $scope.ifgroup){
        $scope.ifgroup=false;
        $('.loaddingitem').fadeIn();
        $timeout(function(){ $('.loaddingitem').fadeOut();
          GroupChatService.createChatGroup(gname,gmembers).then(function(res){
              if(res.status=="000000"){
                $scope.go("msggroup",{imgroupid:res.data});
              }else{
                $scope.ifgroup=$scope.selectitem>0;
              }
          },function(){
            $scope.ifgroup=$scope.selectitem>0;
          });
        },3000);
      }

    };
    // 群聊成员查看界面
    $scope.opcityqr=.56;
    // 删除群聊成员页面
    $scope.showsearch='block';
    var a = 40;
    var b = 102;
    //  拖拽
    $scope.toNumber=function(e) {
      var index = parseInt((e.gesture.touches[0].pageY - 300) / 21);
      var topi=0;
      if(index>$scope.contactlist.length){
        index=$scope.contactlist.length;
      }else if(index<0){
        index=0;
      }
      for(var i =0;i<index;i++){
        topi+=$scope.contactlist[i].array.length*b+a;
      }
      $ionicScrollDelegate.$getByHandle('addscroll').scrollTo(0, topi, false);
    }
    //  点击
    $scope.ctoNumber=function(e) {
      var index =  $scope.lista.indexOf(e.target.innerText);
      var topi=0;
      for(var i =0;i<index;i++){
        topi+=$scope.contactlist[i].array.length*b+a;
      }
      $ionicScrollDelegate.$getByHandle('addscroll').scrollTo(0, topi, false);
    }

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }

  }


})()
