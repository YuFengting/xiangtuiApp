(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('DeletegroupmenberController', DeletegroupmenberController);

  DeletegroupmenberController.$inject = ['$scope',"$ionicScrollDelegate","MsgService","GroupChatService","$stateParams","$ionicHistory","UserService","$ionicPopup","PinyinConvertService"];

  function DeletegroupmenberController($scope,$ionicScrollDelegate,MsgService,GroupChatService,$stateParams,$ionicHistory,UserService,$ionicPopup,PinyinConvertService) {
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();

    })
    $scope.nocontact = false;
    $scope.hasSearch = false;
    $scope.showsearch=false;
    $scope.selectitem=0;
    $scope.memberids=$stateParams.groupmemberids;//群成员id
    $scope.imgroupid=$stateParams.imgroupid;//群成员id
    $scope.contactlistForHead = [];
    $scope.lista=[];
    function isChinaOrNumbOrLett(s) {//判断是否是汉字、字母、数字组成
      var regu = "^[0-9a-zA-Z\u4e00-\u9fa5]+$";
      var re = new RegExp(regu);
      if (re.test(s)) {
        return true;
      } else {
        return false;
      }
    }
      /**
       * 思路：获取成员，再对首字母进行归类
       */
    MsgService.queryGroupInfo($scope.imgroupid).then(function(res){
      var allLength=0;
      $scope.contactlist =[];
      var map =[];
      for(var i=1;i<=27;i++){
        map.push([]);
      }
      angular.forEach(res.data.members,function(member){
        var index = 0;
        var pingyin ="";
        var name ="";
        if(member.name==null||member.name==""){
          index = 26;
          name=null;
        }else {
          name = $.trim(member.name);
          pingyin = PinyinConvertService.convert(name)[0].substring(0,1);
          if(isNaN(pingyin)){
            if(!isChinaOrNumbOrLett(pingyin)){
              index=26;
            }else{
              pingyin =pingyin.toLowerCase();
              index = parseInt(pingyin.charCodeAt(0))-97;
            }
          }else{
            index=26;
          }
        }
        if(res.data.creator!=member.userid)
          map[index].push({name:name,userid:member.userid,avate:member.avate,ifchecked2:false});

      });
      $.each(map,function (n,v) {
        var code ="";
        if(n==26){
          code ="#";
        }else{
          code =String.fromCharCode(n+65);

        }
        if(v.length>0){
          var unity ={name_pinyin:code,array:v,haslength:true};
          $scope.contactlist.push(unity);
          allLength+=v.length;
        }
      })
       $scope.nocontact = allLength==0;
       $scope.hasSearch = allLength>0;
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
          obj.haslength=obj.array.length>0;
        }else{
          var length = obj.array.length;
          angular.forEach(obj.array,function(value){
            if(value.name.indexOf(key)==-1)length--;
          });
          obj.haslength=length>0;
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
      $(".scrollhead").css("overflow-x","scroll!important");
      if($scope.selectitem==0){
        //$('.queren').css({'opacity':.56});
        $scope.querenStyle = {
          'opacity':.56
        };
        $scope.ifgroup=false;
        $scope.showsearch=true;
      }else{
        //$('.queren').css({'opacity':1});
        $scope.querenStyle = {
          'opacity':1
        };
        $scope.ifgroup=true;
        $scope.showsearch=false;
      }
    };
    $scope.intogroup=function(){
      if( $scope.selectitem==0) return;
      var nameArr = [];
      var chooseids =[];
      angular.forEach($scope.contactlistForHead,function(obj){
        nameArr.push(obj.name);
        chooseids.push(obj.userid);
      })
      var title="";
      if(nameArr.length<=3){
        title= '确认要删除成员 '+nameArr.join("、")+"?";
      }else{
        title= '确认要删除成员 '+nameArr.splice(0,3).join("、")+'等人?';
      }

      var deletepop = $ionicPopup.confirm({
        title: title,
        cancelText: '取消 ', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '确认', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-positive' // String (默认: 'button-positive')。OK按钮的类型。
      });

      deletepop.then(function(res) {
        if(res==undefined||res==true) {
          GroupChatService.kickGroupMember($stateParams.imgroupid,chooseids.join(",")).then(function(data){if(data.status=="000000"){
            $ionicHistory.goBack();
          }},function(){});
        }else{
        }
      });


    }

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
  }
}());
