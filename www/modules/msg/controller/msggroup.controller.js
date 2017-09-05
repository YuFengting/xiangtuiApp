(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('MsggroupController', MsggroupController);

  MsggroupController.$inject = ['$rootScope','$window','$ionicModal','$ionicPopup','MsgService','$interval','$scope','$ionicSlideBoxDelegate','$ionicActionSheet','ConfigService',
    'UserService','$timeout','$ionicScrollDelegate','$cordovaImagePicker','UtilService','$stateParams','$state','BlackService','EmojiData','GroupChatService','$location','$ionicHistory'];

  function MsggroupController($rootScope,$window,$ionicModal,$ionicPopup,MsgService,$interval,$scope,$ionicSlideBoxDelegate,$ionicActionSheet,ConfigService,
                              UserService,$timeout,$ionicScrollDelegate,$cordovaImagePicker,UtilService,$stateParams,$state,BlackService,EmojiData,GroupChatService,$location,$ionicHistory) {

    $scope.attr_id = "_"+$stateParams.imgroupid;

    var chatlogids = {};

    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
      //清除该imgroup在会话首页的未读角标
      MsgService.clearUnread($stateParams.imgroupid);

      init();
      var bv = $ionicHistory.backView().stateName;
      GroupChatService.setMsgGroupFrom(bv);
      $rootScope.checkedList = [];

      if(UtilService.goStatus[$state.current.name] != undefined) {
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(false);
          delete UtilService.goStatus[$state.current.name];
      }
      queryNew();
      intervalTask = $interval(function(){
          queryNew();
      }, ConfigService.queryGap);

      $scope.message = "";
      $scope.morebtn = true;
      $scope.sendbtn = false;

      $scope.contentBoxName = 'groupchat';
    });

      $scope.$on("$ionicView.beforeLeave", function () {
          if(intervalTask != null) {
              $interval.cancel(intervalTask);
              intervalTask = null;
          }
      });

    var imgroupid,otheruserid;
    $scope.emojidata1=[];
    $scope.emojidata2=[];
    $scope.emojidata3=[];
    var init = function() {
      $scope.currentitem=0;
      if($scope.emojidata1.length==0){
        $scope.emojidata1= EmojiData.get()[0];
        $scope.emojidata2= EmojiData.get()[1];
        $scope.emojidata3= EmojiData.get()[2];
      }
      imgroupid=otheruserid= $stateParams.imgroupid;
      ConfigService.currentIMgrpid = imgroupid;
      if(imgroupid){
        //获取群信息
        MsgService.queryGroupInfo(imgroupid).then(function(data){
          $scope.groupinfo = data.data;
          $scope.groupname=$scope.groupinfo.name;
          $scope.groupmembernuminfo=$scope.groupinfo.members.length;
        }, function(){});
      }
    };

    //设置群信息
    $scope.checkgroupmessage=function(){
      $state.go('groupmessage',{"imgroupid":$scope.groupinfo.id});
    };

    $scope.ifyichu=false;
    $scope.ifyichu2=false;
    //撤销刚刚加群的好友
    $scope.revert= function(id,delusers,content,e){
      var length =content.length;
      content = $.trim(content.substring(0,content.length-6));
      var delnames = content.split("、");
      var delids = delusers.split(",");
      var delmap = [];
      for(var i=0;i<delids.length;i++){
        if(delids[i].length>0&&delids[i]!=$scope.groupinfo.creator&&delnames[i].length>0)
          delmap.push({id:delids[i],name:delnames[i]});
      }
      var friendsids= [];
      $($scope.groupinfo.members).each(function(n,v){
        if(v.userid!=$scope.groupinfo.creator)
          friendsids.push(v.userid);
      })


      var arr=[];//符合删除条件的好友id集合
      var arrNames1=[];//符合删除条件的好友集合对应的名称
      var arrNames2=[];//不符合删除条件的好友集合对应的名称
      $(delmap).each(function(n,v){
        var muserid = v.id;
        if(friendsids.indexOf(muserid)>=0){//符合删除条件（还是好友）
          arr.push(muserid);
          arrNames1.push(v.name);
        }else{//已经不是好友
          arrNames2.push(v.name);
        }
      });

      var title = "";
      if(arrNames1.length==0){//全部已经被删除了

        if(arrNames2.length<=3){
          title= arrNames2.join("、")+'已经被移除';
        }else{
          title= arrNames2.splice(0,3).join("、")+'等人已经被移除';
        }
        UtilService.showMess(title);
        var parent =$(e.target).parent().parent();
        parent.css("width",length*28+"px");
        $(e.target).remove();
        MsgService.setIsread(id);
      }else{
        if(arrNames2.length>0){//只要删除部分
          var errormsg ="";
          if(arrNames2.length<=3){
            errormsg= arrNames2.join("、")+'已经被移除';
          }else{
            errormsg= arrNames2.splice(0,3).join("、")+'等人已经被移除';
          }
          title= errormsg+"<br/>";
          if(arrNames1.length<=3){
            title += '将'+arrNames1.join("、")+'移除群聊?';
          }else{
            title += '将'+arrNames1.splice(0,3).join("、")+'等人移除群聊?';
          }
        }else{//全部都要删除
          if(arrNames1.length<=3){
            title= '将'+arrNames1.join("、")+'移除群聊?';
          }else{
            title= '将'+arrNames1.splice(0,3).join("、")+'等人移除群聊?';
          }
        }

        var deletepop = $ionicPopup.confirm({
          title: title,
          cancelText: '移除群聊', // String (默认: 'Cancel')。一个取消按钮的文字。
          cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
          okText: '取消', // String (默认: 'OK')。OK按钮的文字。
          okType: 'button-positive' // String (默认: 'button-positive')。OK按钮的类型。
        });
        deletepop.then(function(res) {
          if(res==undefined||res==true){
          }else{
            $scope.ifyichu=true;
            var parent =$(e.target).parent().parent();
            parent.css("width",length*28+"px");
            $(e.target).remove();
            GroupChatService.kickGroupMember($scope.groupinfo.id,arr.join(",")).then(function(data){
              MsgService.setIsread(id);
              $scope.ifyichu=false;
              $scope.ifyichu2=true;
              $timeout(function(){
                $scope.ifyichu2=false;
              },1000);
            },function(){})

          }
        });
      }

    };

    //检测是否符合撤销好友的条件
    $scope.checkRevert=function(userchat){
      return userchat.contenttype==-1&&$scope.user.id==userchat.senderid&&userchat.content!=$scope.user.id&&userchat.isread!==0;

    };

    //跳转到任务详情页
    $scope.gotoTaskDetail=function(taskid){
      var params = {
        mod: 'NStask',
        func: 'judgeTaskOrBuserExamine',
        userid: UserService.user.id,
        data: {"taskid": taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "103005") {
          UtilService.showMess("该任务已下架");
        }else if(data.status == "103006"){
          UtilService.showMess("该商家已下架");
        }else{
          if(data.data.tasktype==0){
            $scope.go('taskdetail', {'taskid': data.data.taskid})
          }else if(data.data.tasktype==1){
            $scope.go('helpselldetail', {'taskid': data.data.taskid})
          }
        }
      });
    };
    //跳转到销售支持页（非团购）
    $scope.gotoSupDetail=function(narticle){
      if(narticle.type==0||narticle.type==1){
        $scope.go('goodarticle', {'taskid': narticle.taskid,'articleid': narticle.articleid});
      }else if(narticle.type==2){
        $scope.go('coupon', {'taskid': narticle.taskid,'articleid': narticle.articleid});
      }
    };
    //跳转到团长活动审核页
    $scope.gotoTeamheadexamineDetail=function(ngbuyrl){
      $scope.go("teamheadmodel",{taskid:ngbuyrl.taskid,articleid:ngbuyrl.articleid});
    };
    //跳转到商家详情页
    $scope.gotoMerchantDetail=function(merchantid){
      var params = {
        mod: 'nUser',
        func: 'getBuserByuserid',
        userid: UserService.user.id,
        data: {"merchantid": merchantid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if(data.status == "103006"){
          UtilService.showMess("该商家已下架");
        }else{
          $scope.go("business",{merchantid:data.data.merchantid});
        }
      });
    };

    $scope.mygoback = function(){
      if (cordova.plugins.Keyboard.isVisible) {
        cordova.plugins.Keyboard.close();
      } else {
        var bv = $ionicHistory.backView().stateName;
        if (bv == "addgroup"){
          $scope.go("tab.msg");
        }else{
          $scope.go("tab.msg");
          //$ionicHistory.goBack();
        }
      }
    }


    //假数据
    $scope.addresslist=[
      {'addressname':'常州创意产业基地','address':'江苏省常州市新北区太湖东路9-2','checked':false},
      {'addressname':'常高新CHTC','address':'江苏省常州市新北区太湖东路9-1','checked':false},
      {'addressname':'常州创意产业基地','address':'江苏省常州市新北区太湖东路9-2','checked':false},
      {'addressname':'常州创意园','address':'江苏省常州市新北区太湖东路9号（太湖路南侧、老藻江河老藻江河老藻江河)','checked':false},
      {'addressname':'常高新chtce幢','address':'江苏省常州市新北区太湖东路9-4','checked':false},
      {'addressname':'常州创意产业基地','address':'江苏省常州市新北区太湖东路9-2','checked':false}
    ]
    $scope.sendopacity='.56';
    $scope.hasselect=false;

    $scope.selectposition=function(select){
      for(var i=0;i< $scope.addresslist.length;i++){
        $scope.addresslist[i].checked=false;
      }
      $scope.sendopacity=1;
      $scope.hasselect=true;
      select.checked=true;
    }
    $scope.closepositionlist=function(){
      if(  $scope.hasselect){

        $scope.sendopacity='.56';
        $scope.closepolistModal();
        for(var i=0;i< $scope.addresslist.length;i++){
          $scope.addresslist[i].checked=false;
        }
      }
      //$scope.closefoot();
    }
    $scope.sendposition=function(){
      $scope.closepositionlist();
      $scope.getLocation();
    }
    //位置列表
    $ionicModal.fromTemplateUrl('positionlist.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(polist) {
      $scope.polist = polist;
    });
    $scope.openpolistModal = function() {
      $scope.polist.show();
    };
    $scope.closepolistModal = function() {
      $scope.polist.hide();
    };


    //付款新开页

    //任务modal
    //付款
    $ionicModal.fromTemplateUrl('getmoney.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getmoney) {
      $scope.getmoney = getmoney;
    });
    $scope.opengetmoneytaskModal = function() {
      $scope.getmoney.show();
    };
    $scope.closegetmoneytaskModal = function() {
      $scope.getmoney.hide();
    };


    //任务modal
    //收款
    $ionicModal.fromTemplateUrl('paymoney.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(paymoney) {
      $scope.paymoney = paymoney;
    });
    $scope.opentaskModal = function() {
      $scope.paymoney.show();
    };
    $scope.closetaskModal = function() {
      $scope.paymoney.hide();
    };
    //任务modal
    //申请佣金
    $ionicModal.fromTemplateUrl('getbusmoney.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getbusmoney) {
      $scope.getbusmoney = getbusmoney;
    });
    $scope.opengetbusmoneytaskModal = function() {
      $scope.getbusmoney.show();
    };
    $scope.closegetbusmoneytaskModal = function() {
      $scope.getbusmoney.hide();
    };


    $scope.user = UserService.user;
    $scope.message = "";
    $scope.contenttype = "";
    $scope.content = "";
    $scope.showimg = false;
    $scope.showbase64 = false;
    $rootScope.chatLargeImgShow = false;
    $scope.pay = {};
    $scope.showpaypwd = false;

    var token;
    $scope.paylist=[{"title":""},{"title":""},{"title":""},{"title":""},{"title":""},{"title":""}];

    $scope.openHome = function(usertype, senderid) {
      if(usertype == "b") {
        var params = {
          mod: 'nUser',
          func: 'getBuserByuserid',
          userid: UserService.user.id,
          data: {"merchantid": senderid}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if(data.status == "103006"){
            UtilService.showMess("该商家已下架");
          }else{
            $scope.go('business', {merchantid:senderid});
          }
        });
      } else {
        $scope.go('shome', {suserid:senderid});
      }
    };

    var intervalTask = null;


    $scope.stopFun = function (e) {
      e.preventDefault();
    }

    var kbOpen = false;
    $scope.msgfootersty={ "bottom":'0px' };
    $scope.hasmsgfootersty={ "bottom":'76px'};
    $scope.showAddfunc=false;
    $scope.showEmoji=false;
    function onKbOpen(e) {
      kbOpen = true;
      getInput.selectionStart = getInput.textLength;
      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      //$scope.hasmsgfootersty={'margin-bottom':'0px'};
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform == "Android") {
        $scope.hasmsgfootersty = {'margin-bottom': '0px','bottom':getH + 'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom();
        }, 100);
      }else{
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.msgfootersty = {'bottom': numpercent + 'px'}
        $scope.hasmsgfootersty = {'margin-bottom': numpercent +'px','bottom':getH + 'px'};
        $timeout(function () {

          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom();
        }, 100);
      }
    }
    function onKbClose(e) {
      kbOpen = false;
      startPos = getInput.selectionStart;
      endPos = getInput.selectionEnd;
      if (device.platform == "Android") {
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom()
        }, 100);
      }else{
        var getH = parseInt($(".footInforBox").css('height'))-2;
        $scope.msgfootersty = {'bottom': 0 + 'px'};
        $scope.hasmsgfootersty = {'bottom': getH+'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true)
        }, 100);
      }
    }


    var timeoutTask = null;
    var queryNewChat = function() {
      var gtid = null;
      if($scope.userchatlist && $scope.userchatlist.length > 0) {
        gtid = $scope.userchatlist[$scope.userchatlist.length - 1].id;
      }
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data:{
          imgroupid: imgroupid,
          gtid: gtid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == "000000") {
          if(data.data && data.data.length > 0) {
            $scope.userchatlist = $scope.userchatlist.concat(data.data);
            //开启页面滚动条到底部
            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('groupchat').resize();
              $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
            },100)
          }

        }
      }).error(function(){

      }).finally(function(){
        resetTimeoutTask();
      });
    };
    var resetTimeoutTask = function() {
      if(timeoutTask != null) {
        $timeout.cancel(timeoutTask);
      }

      if(ConfigService.imtimeout > 0) {
        timeoutTask = $timeout(function(){
          queryNewChat();
        }, ConfigService.imtimeout);
      }
    };

    if(ConfigService.imtimeout > 0) {
      timeoutTask = $timeout(function(){
        queryNewChat();
      }, ConfigService.imtimeout);
    }

    //  $scope.$on('$ionicView.beforeEnter', function() {
    //
    //});






    $scope.$on('$ionicView.unloaded', function() {
      $interval.cancel(intervalTask);
      //取消监听推送消息
      if(window.location.href.substring(0, 4) == "file") {
        //$window.xgpush.un("message",onMessage);

        ConfigService.currentIMgrpid = "";

        window.removeEventListener('native.keyboardshow', onKbOpen);
        window.removeEventListener('native.keyboardhide', onKbClose);
      }

      if(timeoutTask != null) {
        $timeout.cancel(timeoutTask);
      }
    });




    var ltid = null;
    var gtid = null;
    //queryChatLog();

    //当下拉查询以前的记录时调用
    //查询10条消息。该方法仅在进入聊天页的时候调用一次。
    var queryChatLog = function () {
      var option = {
        imgroupid: $stateParams.imgroupid, //imgroupid,
        limit: 10
      };
      MsgService.queryChatlogFromSqlite(option).then(function(res){
        if(res && res.length > 0) {
          ltid = res[0].id;
          gtid = res[res.length - 1].id;

          for(var i=0;i<res.length;i++) {
            if(chatlogids[res[i].id]) {
              res[i].sendstatus = 4;
            } else {
              chatlogids[res[i].id] = 1;
            }
            //设置最新的头像和昵称
            $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
          }

        }
        if($scope.userchatlist && $scope.userchatlist.length > 0) {
          $scope.userchatlist = $scope.userchatlist.concat(res);
        } else {
          $scope.userchatlist = res;
        }
        $timeout(function () {

          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
        },1000)
      }, function(){
        //alert("error");
      });
    }
    //下拉调用
    $scope.queryOld = function() {
      if(ltid) {
        var option = {
          imgroupid: imgroupid,
          ltid: ltid,
          limit: 10
        };
        MsgService.queryChatlogFromSqlite(option).then(function(res){
          if(res && res.length > 0) {
            ltid = res[0].id;
            $scope.userchatlist = res.concat($scope.userchatlist);
            if(gtid == null) {
              gtid = res[res.length - 1].id;
            }

            for(var i=res.length-1;i>=0;i--) {
              if(!$scope.avateAnaName[res[i].senderid]) {
                $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
              }
            }
          }
        }, function(){
        });
      } else {
        //当没有ltid时，调用queryChatLog
        queryChatLog();
      }
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.avateAnaName = {};
    $scope.avateAnaName[UserService.user.id] = {name:UserService.user.nick, avate:UserService.user.avate};
    //该方法从sqlite查询出比gtid更大的记录，并追加到末尾.这段要定时调用
    var queryNew = function() {
      if(ConfigService.pause == true) {
        return;
      }

      if(gtid) {
        var option = {
          imgroupid: imgroupid,
          gtid: gtid
        };
        MsgService.queryChatlogFromSqlite(option).then(function(res){
          if(res && res.length > 0) {
            //遍历列表，隐藏发送成功的
            /*
             if($scope.userchatlist && $scope.userchatlist.length > 0) {
             for(var i=0;i<$scope.userchatlist.length;i++) {
             if($scope.userchatlist[i].sendstatus == 3) {
             $scope.userchatlist[i].sendstatus = 4;
             }
             }
             }
             */
            for(var i=0;i<res.length;i++) {
              if(chatlogids[res[i].id]) {
                res[i].sendstatus = 4;
              } else {
                chatlogids[res[i].id] = 1;
              }
              //设置最新的头像和昵称
              $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
            }

            gtid = res[res.length - 1].id;
            $scope.userchatlist = $scope.userchatlist.concat(res);
            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('groupchat').resize();
              $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
            },100)

            if(ltid == null) {
              ltid = res[0].id;
            }
          }
        }, function(){
        });
      } else {
        //当没有gtid时，调用queryChatLog
        queryChatLog();
      }
    };



    // queryNew();
    // intervalTask = $interval(function(){
    //   queryNew();
    // }, ConfigService.queryGap);

    //监听推送消息
    if(window.location.href.substring(0, 4) == "file") {
      //$window.xgpush.on("message",onMessage);

      window.addEventListener('native.keyboardshow', onKbOpen);
      window.addEventListener('native.keyboardhide', onKbClose);
    }
    $scope.startfun();

    //该方法返回若干条未读消息
    var queryUnreadChatLog = function() {
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data:{
          imgroupid: imgroupid,
          //otheruserid:otheruserid,//好友userid
          gtid: $scope.userchatlist[$scope.userchatlist.length - 1].id //greater than id
        },
        page:{
          pageSize:4
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == "000000") {
          $scope.userchatlist = $scope.userchatlist.concat(data.data);
        }
        //开启页面滚动条到底部
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('groupchat').resize();
          $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
        },100)
      }).error(function(){

      });
    };

    $scope.back = function() {
      if(kbOpen == true) {
        var tmp = function() {
          window.removeEventListener('native.keyboardhide', tmp);
          $scope.goback();
        };
        window.addEventListener('native.keyboardhide', tmp);
      } else {
        $scope.goback();
      }
    }

    $scope.goTop = function() {
      $ionicScrollDelegate.$getByHandle('groupchat').scrollTop();
    };

    var isLoadingChatLog = false;
    $scope.loadChatLog = function () {
      if(isLoadingChatLog) {
        return;
      }
      isLoadingChatLog = true;
      //var len = $scope.userchatlist.length -1;
      var receiveid =  $scope.userchatlist[0].id;
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data:{
          imgroupid: imgroupid,//
          //otheruserid:otheruserid,//好友userid
          ltid:receiveid
        },
        page:{
          pageSize:10
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == "000000") {
          var templist = data.data.concat($scope.userchatlist);
          $scope.userchatlist = templist;

        }
        //开启页面滚动条到底部
        //$ionicScrollDelegate.$getByHandle('groupchat').scrollTop();
      }).error(function(){
      }).finally(function () {
        isLoadingChatLog = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.resend = function(index) {
      if($scope.userchatlist[index].contenttype == 1) {
        //先上传图片
        var uploadPic = function (urls) {
          UtilService.uploadPictures(urls).then(function(res){
            if(res && res.length > 0) {
              $scope.userchatlist[index].sendstatus = 1;
              var params = {
                mod: 'IM',
                func: 'sendMsg',
                userid: $scope.user.id,
                data:{
                  imgroupid:imgroupid,
                  receiverid:otheruserid,//好友userid
                  senderid:$scope.user.id,
                  content:res[0],
                  contenttype:$scope.userchatlist[index].contenttype
                },
                token:token
              };
              UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
                token = data.token;
                if(data.status == '000000'){
                  $scope.userchatlist[index].sendstatus = 0;
                  $scope.userchatlist[index].id = data.data;
                  chatlogids[data.data] = 1;
                  //queryChatLog();
                }else {
                  $scope.userchatlist[index].sendstatus = 2;
                }

              }).error(function(){
                $scope.userchatlist[index].sendstatus = 2;
              }).finally(function () {
                //$ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
              })
            } else {
              $scope.userchatlist[index].sendstatus = 2;
              UtilService.showMess("上传图片失败");
            }
          }, function(){
            $scope.userchatlist[index].sendstatus = 2;
            UtilService.showMess("上传图片失败");
          });
        };

        if(device.platform == "Android") {
          uploadPic([$scope.userchatlist[index].content]);
        } else {
          navigator.xtuiPlugin.compressPicture([$scope.userchatlist[index].content], function (urls) {
            uploadPic(urls);
          }, function () {
            $scope.showloading = false;
            UtilService.showMess("上传图片失败");
          });
        }
      } else {
        $scope.userchatlist[index].sendstatus = 1;
        var params = {
          mod: 'IM',
          func: 'sendMsg',
          userid: $scope.user.id,
          data:{
            imgroupid:imgroupid,
            receiverid:otheruserid,//好友userid
            senderid:$scope.user.id,
            content:$scope.userchatlist[index].content,
            contenttype:$scope.userchatlist[index].contenttype
          },
          token:token
        };
        UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
          token = data.token;
          if(data.status == '000000'){
            $scope.userchatlist[index].sendstatus = 0;
            $scope.userchatlist[index].id = data.data;
            chatlogids[data.data] = 1;
          }else {
            $scope.userchatlist[index].sendstatus = 2;
          }

        }).error(function(){
          $scope.userchatlist[index].sendstatus = 2;
        }).finally(function () {
          //$ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
        })
      }

    }

    $scope.sendMessage = function (contenttype) {
      //$scope.closefoot();
      $scope.morebtn = true;
      $scope.sendbtn = false;
      //$scope.hasmsgfootersty={'overflow-y':'scroll !importent'};
      var chatlen;
      //判断发送消息的类型
      if(contenttype == '0'){
        if($scope.message==""){
          UtilService.showMess("您未输入任何消息(含全空格)，请输入");
          return;
        }
        $scope.content = $scope.message;
      } else if(contenttype == '1'){
        $scope.content = $scope.image;
      } else if(contenttype == '5'){
        $scope.content = $scope.locationImgUrl;
      }else if (contenttype == '4') {
        $scope.content = $scope.voicePath;
      }
      if(!$scope.userchatlist) {
        $scope.userchatlist = [];
      }
      var myDate = new Date();
      var sec = myDate.getSeconds();
      if(sec < 10){
        sec = "0"+sec;
      }
      var min = myDate.getMinutes();
      if(min < 10){
        min = "0"+min;
      }
      var hour = myDate.getHours();
      if (hour < 10) {
        hour = "0" + hour;
      }
      var inittime = hour + ":" + min + ":" + sec;
      //本地消息组装
      var mychat = {
        name:$scope.user.nick,
        avate:$scope.user.avate,
        imgroupid:imgroupid,
        position:"1",
        contenttype:contenttype,
        senderid:$scope.user.id,
        content:$scope.content,
        status:0,
        sendstatus:"1", //发送状态：0 成功 1 发送中 2 发送失败
        imgtype : "1",
        inittime:inittime,
        audiolength:$scope.audiolength
      }

      //if(contenttype == 1) {
      //  mychat.content = $scope.localimage;
      //}

      //插入消息列表
      $scope.userchatlist.push(mychat);
      chatlen = $scope.userchatlist.length-1;
      //回滚到消息底部
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('groupchat').resize();
        $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
      },100)

      if(contenttype == 1) {
        //先上传图片
        var uploadPic = function (urls) {
          UtilService.uploadPictures(urls).then(function(res){
            if(res && res.length > 0) {
              var params = {
                mod: 'IM',
                func: 'sendMsg',
                userid: $scope.user.id,
                data:{
                  imgroupid:imgroupid,
                  receiverid:otheruserid,//好友userid
                  senderid:$scope.user.id,
                  content:res[0],
                  contenttype:contenttype,
                  audiolength:$scope.audiolength
                }
              };
              UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
                token = data.token;
                if(data.status == '000000'){
                  $scope.userchatlist[chatlen].sendstatus = 0;
                  $scope.userchatlist[chatlen].id = data.data;
                  chatlogids[data.data] = 1;
                  //queryChatLog();
                }else if(data.status == '150001'){
                  //已不是好友
                  UtilService.showMess("你已被移除该聊天群，无法聊天。");
                  $scope.userchatlist[chatlen].sendstatus = 2;
                  // MsgService.deleteChatfirst(imgroupid);
                  // $scope.go("tab.msg");
                } else {
                  if(contenttype == '4'){
                    $scope.userchatlist[chatlen].sendstatus = 4;
                    UtilService.showMess("网络不给力，请稍后再试");
                  }else{
                    $scope.userchatlist[chatlen].sendstatus = 2;
                  }
                }

              }).error(function () {
                if(contenttype == '4'){
                  $scope.userchatlist[chatlen].sendstatus = 4;
                  UtilService.showMess("网络不给力，请稍后再试");
                }else{
                  $scope.userchatlist[chatlen].sendstatus = 2;
                }
              })
            } else {
              $scope.userchatlist[chatlen].sendstatus = 2;
              UtilService.showMess("上传图片失败");
            }
          }, function(){
            $scope.userchatlist[chatlen].sendstatus = 2;
            UtilService.showMess("上传图片失败");
          });
        };

        if(device.platform == "Android") {
          uploadPic([mychat.content]);
        } else {
          navigator.xtuiPlugin.compressPicture([mychat.content], function (urls) {
            uploadPic(urls);
          }, function () {
            $scope.showloading = false;
            UtilService.showMess("上传图片失败");
          });
        }
      } else {
        var params = {
          mod: 'IM',
          func: 'sendMsg',
          userid: $scope.user.id,
          data:{
            imgroupid:imgroupid,
            receiverid:otheruserid,//好友userid
            senderid:$scope.user.id,
            content:$scope.content,
            contenttype:contenttype,
            audiolength:$scope.audiolength
          }
        };
        UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
          token = data.token;
          if(data.status == '000000'){
            $scope.userchatlist[chatlen].sendstatus = 0;
            $scope.userchatlist[chatlen].id = data.data;
            chatlogids[data.data] = 1;
          } else if(data.status == '150001'){
            //已不是好友
            UtilService.showMess("你已被移除该聊天群，无法聊天。");
            $scope.userchatlist[chatlen].sendstatus = 2;
            // MsgService.deleteChatfirst(imgroupid);
            // $scope.go("tab.msg");
          } else {
            if(contenttype == '4'){
              $scope.userchatlist[chatlen].sendstatus = 4;
              UtilService.showMess("网络不给力，请稍后再试");
            }else{
              $scope.userchatlist[chatlen].sendstatus = 2;
            }
          }
        }).error(function(){
          if(contenttype == '4'){
            $scope.userchatlist[chatlen].sendstatus = 4;
            UtilService.showMess("网络不给力，请稍后再试");
          }else{
            $scope.userchatlist[chatlen].sendstatus = 2;
          }
        })
      }

      $scope.message = "";

    }

    $scope.getPicture= function() {
      var options = {
        maximumImagesCount: 1, //需要显示的图片的数量
        width: 800,
        //height: 300,
        quality: 80
      };
      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          if(results && results.length > 0){
            $scope.image = results[0];
            $scope.sendMessage('1');
          }
        }, function (error) {
          // error getting photos
          UtilService.showMess("获取照片失败");
        });
      /*
       var cameraOptions = {
       quality: 80,//0-100
       destinationType: Camera.DestinationType.DATA_URL,//DATA_URL或FILE_URI
       sourceType: Camera.PictureSourceType.PHOTOLIBRARY,//PHOTOLIBRARY或CAMERA
       encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
       targetWidth: 1080,//像素
       //targetHeight: 1080,//像素
       //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
       allowEdit: false,
       cropwindow:0  //0正方形 1长方形 2无限制
       };
       //cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
       navigator.camera.getPicture(function(imageData) {
       $scope.$apply(function () {
       $scope.image = imageData;
       $scope.sendMessage('1');

       });
       }, function(message) {

       }, cameraOptions);
       */


      $timeout(function(){
        var query = {
          mod: "nuser",
          func: "nSaveUserBehavior",
          data: {'fromurl':$location.path(),'tourl':$location.path(),'param':{type:type.value},'func':'cashtype'},
          userid:UserService.user.id
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {})
      },100)
      UtilService.tongji("groupchat", {type: 0});
      UtilService.customevent("groupchat","zhaopian");
    };

    $scope.getLocation = function() {
      if(!UtilService.checkNetwork()){
        UtilService.showMess("网络不给力，请稍后刷新");
        return;
      }
      BlackService.getLocationImg().then(function(url){
        $scope.locationImgUrl = url;
        $scope.sendMessage('5');
      }, null);
      UtilService.tongji("groupchat", {type: 1});
      UtilService.customevent("groupchat","dingwei");
    };

    $scope.repeatSendMsg = function(index,contenttype) {
      var confirmPopup = $ionicPopup.confirm({
        title: '重发该消息？', // String. 弹窗标题。
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '重发', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      confirmPopup.then(function(res) {
        if(res) {
          //$scope.sendMessage($scope.contenttype,"repeat",index);
          $scope.resend(index);

        } else {
        }
      });
    };

    $scope.enlargePic = function (userchat, mode) {
      if(userchat.contenttype==5){
        return;
      }
      if(mode == "external") {
        $scope.showLocImg = true;
        $rootScope.chatLargeImgShow = true;
        $scope.imageurl = userchat.content;
        $scope.imagesendstatus =userchat.sendstatus;
        $scope.imageid = userchat.id;
      } else if(userchat.imgtype == '1'){
        $scope.showbase64 = true;
        $rootScope.chatLargeImgShow = true;
        $scope.imageurl = userchat.content;
        $scope.imagesendstatus =userchat.sendstatus;
        $scope.imageid = userchat.id;
      }else {
        $scope.showimg = true;
        $rootScope.chatLargeImgShow = true;
        var fdStart = userchat.content.indexOf("file");
        if(fdStart == 0||userchat.content.indexOf("http")==0){
          $scope.imageurl = userchat.content;
          $scope.imagesendstatus =userchat.sendstatus;
          $scope.imageid = userchat.id;
        }else if(fdStart == -1&&userchat.content.indexOf("http")==-1){
          $scope.imageurl = ConfigService.picserver+userchat.content;
          $scope.imagesendstatus =userchat.sendstatus;
          $scope.imageid = userchat.id;
        }
      }

      $timeout(function(){
        var bpic = $('.big-pic');
        var a = bpic.height()/bpic.width();
        var sW = window.screen.width;
        var sh =640*window.screen.height/window.screen.width;
        if(a<window.screen.height/window.screen.width){
          bpic.css('margin-top',sh/2-bpic.height()/2+'px');
        }else{
          bpic.css('margin-left',640/2-bpic.width()/2+'px')
        }
        bpic.css("opacity",1);
      },50)

    };

    $scope.shrinkPic = function () {
      $scope.showimg = false;
      $scope.showbase64 = false;
      $scope.showLocImg = false;
      $rootScope.chatLargeImgShow = false;
    }

    //保存、转发图片
    $scope.optionPic = function(){
      $ionicActionSheet.show({
        buttons: [
          { text: '发送给好友' },
          { text: '保存图片' },
        ],
        cancelText: '取消',
        buttonClicked: function(index) {
          switch (index){
            //转发图片
            case 0:
              if($scope.imagesendstatus==0||angular.isUndefined($scope.imagesendstatus)||$scope.imagesendstatus==null){
                $scope.go('selectcontact',{shareid: $scope.imageid,name: "[图片]",type:'1'});
              }else{
                UtilService.showMess("发送失败请检查网络！");
              }
              break;
            //保存图片到本地
            case 1:
              $('.action-sheet-backdrop').remove();
              if($scope.imageurl.indexOf("file")!=0){
                if($scope.imageid!=null&&angular.isDefined($scope.imageid)){
                  var params ={
                    mod: 'IM',
                    func: 'getImgurlByid',
                    userid: $scope.user.id,
                    data: {
                      'chatlogid':$scope.imageid
                    }
                  }
                  UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
                    if(data.status == '000000'){
                      imgdownload(data.data.imgurl,1);
                    }
                  }).error(function () {})
                }else{
                  UtilService.showMess("图片保存失败，请检查网络！");
                }
              }else{
                imgdownload($scope.imageurl,2);
              }
              break;
            default:
              break;
          }
          return true;
        }
      });
    }
    var imgdownload = function(url,index){
      var fileTransfer = new FileTransfer();
      var uri;
      var fileURL;
      var formaturl;
      if (device.platform != "Android") {
        formaturl=cordova.file.tempDirectory;
      }else{
        formaturl=cordova.file.externalRootDirectory+"xtui/images/";
      }
      if(index==2){
        uri=encodeURI(url)
        fileURL =formaturl+uri.substr(uri.length-24)+".jpg";
      }else{
        uri=encodeURI(ConfigService.picserver+url)
        fileURL =formaturl+uri.substr(uri.length-17);
      }
      fileTransfer.download(
        uri,
        fileURL,
        function (entry) {
          if (device.platform != "Android") {
            fileTransfer.saveimageios(entry.toURL(),function (entry) {},function (error) {} );
            UtilService.showMess("图片下载成功！");
          }else{
            saveImageToPhone(entry.toURL(), function(msg){
              UtilService.showMess("图片下载成功！");
            }, function(err){
              console.error(err);
            });
          }
        },
        function (error) {
        },null, {}
      );
    }
    var saveImageToPhone = function(url, success, error) {
      var canvas, context, imageDataUrl, imageData;
      var img = new Image();
      img.onload = function() {
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        try {
          imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
          imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
          cordova.exec(
            success,
            error,
            'Canvas2ImagePlugin',
            'saveImageDataToLibrary',
            [imageData]
          );
        }
        catch(e) {
          error(e.message);
        }
      };
      try {
        img.src = url;
      }
      catch(e) {
        error(e.message);
      }
    }


    var sendPayMessage = function (contenttype,pay_len,paylogid) {
      var params = {
        mod: 'IM',
        func: 'sendMsg',
        userid: $scope.user.id,
        data:{
          imgroupid:imgroupid,
          receiverid:otheruserid,//好友userid
          senderid:$scope.user.id,
          content:paylogid,
          contenttype:contenttype
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          $scope.userchatlist[pay_len].sendstatus = 0;
          $scope.userchatlist[pay_len].id = data.data;
          chatlogids[data.data] = 1;
          //queryChatLog();
        }else {
          $scope.userchatlist[pay_len].sendstatus = 2;
        }

      }).error(function(){
        $scope.userchatlist[pay_len].sendstatus = 2;
      })
    }

    //发送按钮
    $scope.sendbtn = false;
    //加号按钮
    $scope.morebtn = true;
    $scope.isInputShow = true;
    /***语音***/
    $scope.voiceText = "按住说话";
    var video;
    $timeout(function () {
        video = document.getElementById("voiceAudio"+$scope.attr_id);
    }, 0);
    var lastid="";
    $scope.playVoice = function(obj){
      //更新已读标志
      if(obj.position==0){
        MsgService.setIsread(obj.id);
      }
      //录音时关闭所有播放语音
      if(lastid!=obj.id&&!video.paused){
        video.pause();
        lastid=obj.id;
      }
      var msgTip = document.getElementById(obj.id);
      var msgleft = document.getElementById(obj.id+"_left");
      var msgright = document.getElementById(obj.id+"_right");
      $('.voiceImgPlay_fl').attr('src','img/yuyin_fl.png');
      $('.voiceImgPlay_fr').attr('src','img/yuyin_fr.png');
      if(video.paused){
        msgTip.removeAttribute('class');
        video.setAttribute("src",obj.content);
        video = document.getElementById("voiceAudio"+$scope.attr_id);
        video.play();
        $timeout(function () {
          if(video.readyState!=4){
            UtilService.showMess("网络不给力，请稍后再试");
            if(obj.position==1){
              msgright.setAttribute("src","img/yuyin_fr.png");
            }else{
              msgleft.setAttribute("src","img/yuyin_fl.png");
            }
            video.pause();
          }
        }, 3000)
        if(obj.position==1){
          msgright.setAttribute("src","img/yuyin_gif_fr.gif");
        }else{
          msgleft.setAttribute("src","img/yuyin_gif_fl.gif");
        }
      }else{
        video.pause();
        if(obj.position==1){
          msgright.setAttribute("src","img/yuyin_fr.png");
        }else{
          msgleft.setAttribute("src","img/yuyin_fl.png");
        }
      }
      video.addEventListener("play",function(){
      });
      video.addEventListener("ended",function(){
        if(obj.position==1){
          msgright.setAttribute("src","img/yuyin_fr.png");
        }else{
          msgleft.setAttribute("src","img/yuyin_fl.png");
        }
      });
    }
    //点击语音按钮
    $scope.voiceBox = function(){
      $scope.showAddfunc = false;
      $scope.showEmoji = false;
      $scope.voiceGroup = 'block';
      $scope.hasmsgfootersty = {'margin-bottom': '0px'};
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height','78px');
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('groupchat').resize();
        $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom()
      }, 100);
      if($scope.isInputShow){
        $scope.isInputShow = false;
        $scope.sendbtn = false;
        $scope.morebtn = true;
      }else if($scope.message == "") {
        $scope.isInputShow = true;
        $(".footInforBox").css('height',getInputH+'px');
        $scope.contentStyle = {'bottom': getInputH + 'px'};
        $timeout(function () {
          document.getElementById('inputBox'+$scope.attr_id).focus();
        }, 0);
      } else {
        $scope.isInputShow = true;
        $(".footInforBox").css('height',getInputH+'px');
        $scope.contentStyle = {'bottom': getInputH + 'px'};
        $timeout(function () {
          document.getElementById('inputBox'+$scope.attr_id).focus();
        }, 0);
        $scope.sendbtn = true;
        $scope.morebtn = false;
      }
    }

    var dy;
    var voiceflag=0;//0:正在录音，1：停止录音
    var date1;
    var date2;
    var timeout1=null;
    //上滑取消
    $scope.onDrag = function($event){
      if($scope.competence==0&&voiceflag==0) {
        dy = $event.gesture.deltaY;
        if (Math.abs(dy) >= 30) {
          $(".voiceTipPopup1").hide();
          $(".voiceTipPopup2").show();
        } else {
          $(".voiceTipPopup1").show();
          $(".voiceTipPopup2").hide();
        }
      }
    };
    //开始录音
    $scope.startVoice = function($event){
      $window.xtui_speex.checkpermission(function (data) {
        $scope.competence=data;
        //录音权限打开才能使用语音功能
        if($scope.competence==0){
          $(".voiceTipPopup1").show();
          $(".voiceTip").removeClass("voiceTipStart").addClass("voiceTipEnd");
          $scope.voiceText = "松开结束";
          //开始录音之前先暂停所有录音
          if(!video.paused){
            video.pause();
            $('.voiceImgPlay_fl').attr('src','img/yuyin_fl.png');
            $('.voiceImgPlay_fr').attr('src','img/yuyin_fr.png');
          }
          // 开始录制音频
          $window.xtui_speex.recordvoice(function () {}, function () {});
          date1=new Date();
          voiceflag=0;
          //60s后自动停止录制音频
          timeout1=$timeout(function(){
            //date2=new Date();
            if(voiceflag!=1){
              //60s后自动发送录音
              $(".voiceTip").removeClass("voiceTipEnd").addClass("voiceTipStart");
              $(".voiceTipPopup1").hide();
              $(".voiceTipPopup2").hide();
              $(".voiceTipPopup4").show();
              $timeout(function(){
                $(".voiceTipPopup4").hide();
              },2000);
              $timeout.cancel(timeout1);
              voiceflag=1;
              $window.xtui_speex.stopvoice(function (path) {
                $scope.audiolength=60;
                var options =new FileUploadOptions();
                options.fileKey="file";
                options.mimeType="audio/spx";
                options.chunkedMode = false;
                var ft =new FileTransfer();
                ft.upload(path,ConfigService.voiceserver,function win(r) {
                  if(r.response=="null"||r.response==null||angular.isUndefined(r.response)){
                    UtilService.showMess("网络不给力，请稍后再试");
                    return;
                  }else{
                    $scope.voicePath=ConfigService.picserver+r.response;
                    $scope.sendMessage('4');
                    $window.xtui_speex.deletevoice(function () {}, function () {},path);
                  }
                }, function fail(error) {
                  UtilService.showMess("网络不给力，请稍后再试");
                },options);
              }, function(){});
              dy="";
            }
          },60000);
        }else{
          UtilService.showMess("麦克风权限未开启!");
        }
      }, function () {});
    }
    //结束录音
    $scope.endVoice = function(){
      //录音权限打开才能使用语音功能
      if($scope.competence==0){
        $scope.voiceText = "按住说话";
        $(".voiceTip").removeClass("voiceTipEnd").addClass("voiceTipStart");
        $(".voiceTipPopup1").hide();
        $(".voiceTipPopup2").hide();
        if(voiceflag==1){
          return;
        }else{
          date2 = new Date();
          if(angular.isUndefined(dy)||dy==""||Math.abs(dy)<=30){
            if(date2.getTime()-date1.getTime()<1500){
              $timeout.cancel(timeout1);
              voiceflag=1;
              $window.xtui_speex.stopvoice(function (resultData) {
                $window.xtui_speex.deletevoice(function () {}, function () {},resultData);
              }, function () {});
              $(".voiceTipPopup3").show();
              $timeout(function(){
                $(".voiceTipPopup3").hide();
              },1000);
            }else{
              $scope.audiolength=Math.round((date2.getTime()-date1.getTime())/1000);
              $timeout.cancel(timeout1);
              voiceflag=1;
              $window.xtui_speex.stopvoice(function (path) {
                var options =new FileUploadOptions();
                options.fileKey="file";
                options.mimeType="audio/spx";
                options.chunkedMode = false;
                var ft =new FileTransfer();
                ft.upload(path,ConfigService.voiceserver,function win(r) {
                  if(r.response=="null"||r.response==null||angular.isUndefined(r.response)){
                    UtilService.showMess("网络不给力，请稍后再试");
                    return;
                  }else{
                    $scope.voicePath=ConfigService.picserver+r.response;
                    $scope.sendMessage('4');
                    $window.xtui_speex.deletevoice(function () {}, function () {},path);
                  }
                }, function fail(error) {
                  UtilService.showMess("网络不给力，请稍后再试");
                },options);
              }, function(){});
            }
          }else{
            $timeout.cancel(timeout1);
            voiceflag=1;
            $window.xtui_speex.stopvoice(function (resultData) {
              $window.xtui_speex.deletevoice(function () {}, function () {},resultData);
            }, function () {});
          }
        }
        dy="";
      }else{
        UtilService.showMess("麦克风权限未开启!");
      }
    }

    //发送按钮
    $scope.sendFunc=function(){
      if(angular.isDefined($scope.message) && $scope.message!=null && $scope.message!=""){
        $scope.morebtn = false;
        $scope.sendbtn = true;
      }else {
        $scope.morebtn = true;
        $scope.sendbtn = false;
      }
    }

    //发送表情
    $scope.emojiHide = function(){
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if($scope.showAddfunc || $scope.showEmoji){
        //$scope.hasmsgfootersty.bottom='76px';
        $scope.hasmsgfootersty = {'bottom': getH+'px'};
      }
      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('groupchat').resize();
        $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
      },400)
    }

    var openEmoji = function() {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      //$scope.hasmsgfootersty={'margin-bottom':'300px'};
      $scope.hasmsgfootersty = {'margin-bottom': '300px','bottom':getH+'px'};
      $scope.isInputShow = true;
      $('#inputBox'+$scope.attr_id).blur();
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height',getInputH+'px');
      $ionicScrollDelegate.$getByHandle('groupchat').resize();
      $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
      $scope.showAddfunc=false;
      $scope.currentitem=1;
      var myInput = document.getElementById('inputBox'+$scope.attr_id);
      if (myInput == document.activeElement) {
        $timeout(function(){
          $scope.showEmoji=true;
          $ionicSlideBoxDelegate.update();
        },200)
      } else {
        $scope.showEmoji=true;
        $ionicSlideBoxDelegate.update();
      }
    };
    $scope.emojiBox = function(){
      if(kbOpen) {
        var handler = function() {
          window.removeEventListener('native.keyboardhide', handler);
          openEmoji();
        };
        window.addEventListener('native.keyboardhide', handler);
      } else {
        openEmoji();
      }
    }

    $scope.backspace = function(){
      var getVal = document.getElementById("inputBox"+$scope.attr_id).value;
      var newVal = getVal.replace(/(.|\[[^\]]*?\])$/,'');
      $scope.message = newVal;
      $scope.sendFunc();
    }

    var startPos = 0;
    var endPos = 0;
    var getInput;
    $timeout(function(){
      getInput = document.getElementById("inputBox"+$scope.attr_id);
    },0);
    $scope.getAttr = function (event) {
      var getTitle = event.target.getAttribute("title");
      var getEmoji = "[" + getTitle + "]";
      if (getInput.selectionStart || getInput.selectionStart == "0") {
        //startPos = (device.platform == "Android") ? getInput.selectionStart:getInput.selectionStart+getLength ;
        //endPos = (device.platform == "Android") ? getInput.selectionEnd:getInput.selectionEnd+getLength;
        var restoreTop = getInput.scrollTop;
        getInput.value = getInput.value.substring(0, startPos) + getEmoji + getInput.value.substring(startPos, getInput.value.length);
        if (restoreTop > 0) {
          getInput.scrollTop = restoreTop;
        }
        startPos += getEmoji.length;
      } else {
        getInput.value += getEmoji;
        //getInput.focus();
      }
      $scope.message = getInput.value;
      $scope.sendFunc();
    }

    var openFunc = function() {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      //$scope.hasmsgfootersty={'margin-bottom':'300px'};
      $scope.hasmsgfootersty = {'margin-bottom': '300px','bottom':getH+'px'};
      $ionicScrollDelegate.$getByHandle('groupchat').resize();
      $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
      $scope.isInputShow = true;
      $('#inputBox'+$scope.attr_id).blur();
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height',getInputH+'px');
      $scope.showEmoji=false;
      $scope.currentitem=2;
      var myInput = document.getElementById('inputBox'+$scope.attr_id);
      if (myInput == document.activeElement) {
        $timeout(function(){
          $scope.showAddfunc=true;
        },200)
      } else {
        $scope.showAddfunc=true;
      }
    };
    $scope.functionBox = function(){
      if(kbOpen) {
        var handler = function() {
          window.removeEventListener('native.keyboardhide', handler);
          openFunc();
        };
        window.addEventListener('native.keyboardhide', handler);
      } else {
        openFunc();
      }
    }
    $scope.closefoot=function(){
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
      if($scope.showAddfunc ||  $scope.showEmoji){
        $ionicScrollDelegate.$getByHandle('groupchat').resize();
        $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);              }
      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      $scope.currentitem=0;
      //$scope.hasmsgfootersty={'bottom':'76px','margin-bottom':'0px'};
      $scope.hasmsgfootersty = {'bottom': getH+"px"};
//      $ionicScrollDelegate.$getByHandle('groupchat').scrollBottom(true);
    }

    $scope.copycontent = function (copyurl) {
      cordova.plugins.clipboard.copy(copyurl);
      UtilService.showMess("已复制");
    }


    //跳转内部连接
    $scope.showcontentinapp = function (event) {
      UtilService.showcontentinapputil(event);
    }

    $scope.changeMeg = function () {
      if(angular.isUndefined($scope.message) || $scope.message==null || $scope.message==""){
        $scope.morebtn = true;
        $scope.sendbtn = false;
      }
    }

    var sheight = window.screen.height;

    /*    $('ul.message li').click(function () {
     if (!$(this).hasClass('active')) {
     if ($(this).index() == 0) {
     $('ul.message').children().eq(0).addClass('active');
     $('ul.message').children().eq(0).siblings().removeClass('active');
     $ionicSlideBoxDelegate.$getByHandle('messageSlide').previous()

     $ionicScrollDelegate.$getByHandle('messageScroll').scrollTop(true);
     $('.talk-foot').hide();
     $('.has-subheader').removeClass('has-footer2');

     } else if ($(this).index() == 1) {

     $('ul.message').children().eq(1).addClass('active');
     $('ul.message').children().eq(1).siblings().removeClass('active');
     $ionicSlideBoxDelegate.$getByHandle('messageSlide').next()

     $timeout(function () {
     $ionicScrollDelegate.$getByHandle('$ionicScrollDelegate').scrollBottom(true);
     $('.has-subheader').addClass('has-footer2');
     $('.talk-foot').show();
     },800)
     }
     }
     })*/
    /*
     $scope.changed = function () {
     var slideIndex = $ionicSlideBoxDelegate.$getByHandle('messageSlide').currentIndex();
     $('ul.message').children().eq(slideIndex).addClass('active');
     $('ul.message').children().eq(slideIndex).siblings().removeClass('active');
     $('.sysInfo').css('height', sheight + 'px');

     if (slideIndex == 1) {
     $timeout(function () {

     $ionicScrollDelegate.$getByHandle('messageScroll').scrollBottom(true);
     $('.has-subheader').addClass('has-footer2');
     $('.talk-foot').show();
     }, 300)
     } else {

     $ionicScrollDelegate.$getByHandle('messageScroll').scrollTop();
     $('.talk-foot').hide();

     $('.has-subheader').removeClass('has-footer2');
     }
     }
     */
    $scope.goPayLog = function (paylogid) {
      $scope.go('ssaccountdetail',{'paylogid':paylogid,'otheruserid':otheruserid,usertype:'s'})
    }
  }

})()
