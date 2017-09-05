angular.module('xtui')
  .controller('MessageController',function($interval,$state, $window, $scope,$stateParams, StorageService,$timeout,$ionicScrollDelegate,$rootScope,$ionicPopup,IMSqliteUtilService,UtilService,ConfigService,UserService,SysMsgService,MsgService,$ionicPopover) {
    /*
    $window.xgpush.addLocalNotification(1, "title", "content", function(obj){
      MsgService.msgNotice[obj] = {imgroupid:"57985814e4b023482c089522", type:1, otheruserid:"573eb461e4b0447df9208864", otherusername:"樱花国际日语"};//type:0-s聊天，1-商家聊天，2-群，3-临时商家聊天，4-固定系统通知，5-系统消息
    });
    */
    $(".newguidemask2").hide();
    var onMessage = function(data){
      if(data && data["redirect"]) {
        xg_data = data;
        for(k in xg_data){

          if(k=="redirect"&&noticefalg==true){
            var notice = document.getElementById('noticeCon');
            notice.innerHTML=xg_data["aps"].alert;
            //$('.messagePopup').show();
            //$('.index-mask').show();
          }else if(k=="redirect"&&noticefalg==false){
            var datajson = JSON.parse(xg_data[k]);
            if(datajson.params){
              $state.go(datajson.url,datajson.params);
            } else{
              $state.go(datajson.url);
            }
            noticefalg=true;
          }
        }
      } else {
        /*
        var customContent = angular.fromJson(data.customContent);
        if($state.current.name != "permsgdetail" || $state.params.imgroupid != customContent.imgroupid) {
          //遍历sysMesssageList，将相应的会话提前
          if($scope.sysMesssageList) {
            var index = 0;
            for(;index < $scope.sysMesssageList.length;index++) {
              if($scope.sysMesssageList[index].imgroupid == customContent.imgroupid) {
                var temp = $scope.sysMesssageList[index];
                temp.newreceiveid = customContent.chatlogid;
                temp.lastmsgtype = customContent.contenttype;
                temp.lastmsg = data.content;
                temp.inittime = customContent.inittime;
                temp.count++;
                var arr1 = $scope.sysMesssageList.slice(0,index);
                var arr2 = $scope.sysMesssageList.slice(index+1, $scope.sysMesssageList.length);
                $scope.sysMesssageList = [temp].concat(arr1).concat(arr2);
                //存入本地
                StorageService.setItem("chatfirst", $scope.sysMesssageList);
                break;
              }
            }
            if(index == $scope.sysMesssageList.length) {
              $scope.getMessage();
            }
          } else {
            $scope.getMessage();
          }
          $scope.$apply();
        }
        */
      }
    };

    $scope.stopFun = function (e) {
      e.preventDefault();
    }

    //隐藏底部tab
    var hideTabs = function() {
      $(".tab-nav").hide();
      //$(".has-tabs").css("bottom", "10px");
      $scope.hasTabsStyle = {
        "bottom":"10px"
      };
    };
    //显示tabs
    var showTabs = function() {
      $(".tab-nav").css({'display':'-webkit-flex'});
      //$(".has-tabs").css("bottom", "92px");
      $scope.hasTabsStyle = {
        "bottom":"92px"
      };
    };

    var checktype='0';
    var timeoutfun = null;
    var search = null;

    $scope.$on('$ionicView.loaded', function() {
    });

    $scope.concatTab = 0;
    $scope.$on('$ionicView.beforeEnter', function() {
      $('.workc_search input').focus(function(){
        $rootScope.hideTabs = true;
      })
      $('.workc_search input').blur(function(){
        $rootScope.hideTabs = false;
      })

      //监听推送消息
      if(window.location.href.substring(0, 4) == "file") {
        //$window.xgpush.on("message",onMessage);

        window.addEventListener('native.keyboardshow', hideTabs);
        window.addEventListener('native.keyboardhide', showTabs);
      }
      $scope.startfun();

      //$rootScope.chatBadge = 0;
      $scope.picserver = ConfigService.picserver;
      $scope.user = UserService.user;
      $scope.checkFlag=$stateParams.checkflag;
      checktype='0';
      $scope.checked = 0;
      timeoutfun = null;
      $scope.className = false;

      $scope.queryContact();

      $scope.respStatus = 0;

      search = null;

      //初始化tab页
      /*
      if(UserService.imtab==1){//通讯录
        $scope.achecked = false;
        $scope.bchecked = true;
        $scope.bchecke_dis = "block";
        $scope.cchecked = false;
        $scope.concatTab = UserService.concattab;
        $scope.changeMsgTab(1);
      }else if(UserService.imtab==2) {//工作圈
        $scope.achecked = false;
        $scope.bchecked = false;
        $scope.bchecke_dis = "none";
        $scope.cchecked = true;
        $scope.changeMsgTab(2);
      } else {
        $scope.achecked = true;
        $scope.bchecked = false;
        $scope.cchecked = false;
        $scope.bchecke_dis = "none";
      }
      */

      //刷新数据
      if(MsgService.refreshTask) {

      } else {
        freshFunc();
        MsgService.refreshTask = $interval(function(){
          freshFunc();
        }, ConfigService.queryGap);
      }

      UtilService.countpagecount("modules/msg/temp/message.html.会话");
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      //监听推送消息
      if(window.location.href.substring(0, 4) == "file") {
        $window.xgpush.un("message",onMessage);

        window.removeEventListener('native.keyboardshow', hideTabs);
        window.removeEventListener('native.keyboardhide', showTabs);
      }
      if(MsgService.refreshTask) {
        $interval.cancel(MsgService.refreshTask);
        MsgService.refreshTask = null;
      }
    });

    $scope.$on('$ionicView.unloaded', function() {
      //监听推送消息
      if(window.location.href.substring(0, 4) == "file") {
        $window.xgpush.un("message",onMessage);

        window.removeEventListener('native.keyboardshow', hideTabs);
        window.removeEventListener('native.keyboardhide', showTabs);
      }
      if(MsgService.refreshTask) {
        $interval.cancel(MsgService.refreshTask);
      }
      //记录现在是在哪个tab下
      //StorageService.setItem("", );
    });

    $scope.intervalTask = null;
    //会话首页定时刷新
    var freshFunc = function() {
      StorageService.getItem("systemmsg").then(function(obj){
        if(obj) {
          $scope.msgsystembean = obj;
        } else {
          $scope.msgsystembean = {
            count : 0,
            title : "这里会推送一些系统消息，请及时查收！"
          };
        }
      }, function(err){
      });

        StorageService.getItem("xtxx").then(function(obj){
            if(obj) {
                IMSqliteUtilService.selectImData("select * from systemmsg where (msgType = 0 or msgType is null) and id > '"+obj.lastreadid+"' order by id desc").then(function (res) {
                    $scope.xtxx = {
                        lastreadid: obj.lastreadid,
                        count : (res && obj.lastreadid.length > 1) ? res.length : 0,
                        title : (res && res[0]) ? res[0].title : obj.title
                    };
                    StorageService.setItem("xtxx", $scope.xtxx);
                }, function (err) {

                });
            } else {
                IMSqliteUtilService.selectImData("select * from systemmsg where (msgType = 0 or msgType is null) order by id desc limit 1").then(function (res) {
                  if(res && res.length > 0) {
                      $scope.xtxx = {
                          lastreadid: res[0].id,
                          count : 0,
                          title : res[0].title
                      };
                      StorageService.setItem("xtxx", $scope.xtxx);
                  }
                }, function (err) {

                });
            }
        }, function(err){
        });

        StorageService.getItem("hdts").then(function(obj){
            if(obj) {
                IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 1 and id > '"+obj.lastreadid+"' order by id desc").then(function (res) {
                    $scope.hdts = {
                        lastreadid: obj.lastreadid,
                        count : (res && obj.lastreadid.length > 1) ? res.length : 0,
                        title : (res && res[0]) ? res[0].title : obj.title
                    };
                    StorageService.setItem("hdts", $scope.hdts);
                }, function (err) {

                });
            } else {
                IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 1 order by id desc limit 1").then(function (res) {
                    if(res && res.length > 0) {
                        $scope.hdts = {
                            lastreadid: res[0].id,
                            count : 0,
                            title : res[0].title
                        };
                        StorageService.setItem("hdts", $scope.hdts);
                    }
                }, function (err) {

                });
            }
        }, function(err){
        });


      // StorageService.getItem("chatfirst").then(function(obj){
      IMSqliteUtilService.selectImData("select * from chatfirst order by exactlytime desc").then(function(obj){
        for(var i = 0;i<obj.length;i++) {
          if(obj[i].imgrouptype == 1) {
            //群，头像要转
              obj[i].avate = angular.fromJson(obj[i].avate);
          }
        }

        if(MsgService.forceFreshChatfirst === true) {
          MsgService.forceFreshChatfirst = false;
          $scope.sysMesssageList = obj;
          $scope.$apply();
        } else if($scope.sysMesssageList == null || obj == null || $scope.sysMesssageList.length != obj.length) {
          $scope.sysMesssageList = obj;
        } else {
          var countMap = {};
          var lastidMap = {};
          if(obj && obj.length > 0) {
            for(var i=0;i<obj.length;i++) {
              countMap[obj[i].imgroupid] = obj[i].count;
              lastidMap[obj[i].imgroupid] = obj[i].newreceiveid;
            }
          }
          if($scope.sysMesssageList && $scope.sysMesssageList.length > 0) {
            for(var i=0;i<$scope.sysMesssageList.length;i++) {
              var grpid = $scope.sysMesssageList[i].imgroupid;
              var showCount = $scope.sysMesssageList[i].count;
              if(parseInt(showCount) != parseInt(countMap[grpid]) || $scope.sysMesssageList[i].newreceiveid != lastidMap[grpid]) {
                $scope.sysMesssageList = obj;
                break;
              }
            }
          }
        }
        //刷新角标
        var tmpCount = 0;
        if($scope.sysMesssageList) {
          for(var i=0;i<$scope.sysMesssageList.length;i++) {
            if($scope.sysMesssageList[i].notify !== 1) {
              tmpCount += parseInt($scope.sysMesssageList[i].count);
            }
          }
        }
        if($scope.applys) {
          tmpCount += $scope.applys.length;
        }
        // if($scope.msgsystembean && $scope.msgsystembean.count > 0) {
        //   tmpCount += $scope.msgsystembean.count;
        // }
          if($scope.xtxx && $scope.xtxx.count > 0) {
              tmpCount += $scope.xtxx.count;
          }
          if($scope.hdts && $scope.hdts.count > 0) {
              tmpCount += $scope.hdts.count;
          }

        $rootScope.chatBadge = tmpCount;
        StorageService.setItem("chatBadge", $rootScope.chatBadge);
      }, function(){});
    };

    $scope.changeMsgTab = function (msgtype) {
      if($scope.concatTab ==  msgtype){
        return;
      }
      if(msgtype == '0' || msgtype == '1') {
        $scope.concatTab =  parseInt(msgtype);
        // UserService.imtab = msgtype;
      }
      $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTop();
      if(timeoutfun) {
        window.clearTimeout(timeoutfun);
      }
      $scope.checked = -1;
      if(msgtype == '0'){
        //$rootScope.chatBadge = 0;
        $scope.bchecke_dis = "none";
        $scope.respStatus = 0;
        //$scope.getMessage();
        $scope.queryContact();
        timeoutfun = setTimeout(function(){
          $scope.checked = 0;
          $scope.$apply();
        }, 0);

        UtilService.tongji("chat", {type: 0});
        UtilService.customevent("chat","huihua");
        cordova.plugins.Keyboard.close();
      }else if(msgtype == '1'){
        $scope.respStatus = 0;
        $scope.queryContact();
        timeoutfun = setTimeout(function(){
          $scope.checked = 1;
          $scope.bchecke_dis = "block";
          /*
          if($scope.concatTab == 0) {
            $scope.bPhone();
          } else {
            $scope.perPhone();
          }
          */
          $scope.$apply();
        }, 0);
        if (device.platform == "Android") {
          //Android
          $scope.topinfo='0px';
        }else{
          //IOS 放开
           var screenW0 = window.screen.width;
           var stateH0 =  640*20 / screenW0;
           $scope.topinfo=stateH0-2+'px';
        }
        cordova.plugins.Keyboard.close();
        UtilService.tongji("chat", {type: 1});
        UtilService.customevent("chat","tongxunlu");
      }else{

      }
    }

    //获取消息列表
    $scope.getMessage = function () {
      StorageService.getItem("chatfirst").then(function(obj){
        $scope.sysMesssageList = obj;
      }, function(){

      });
    }

    /*
    StorageService.getItem("chatfirst").then(function(obj){
      $scope.sysMesssageList = obj;
      $scope.getMessage();
    }, null);
    */

    //清除未读状态
    $scope.msgdetailss = function(sysMsg,index) {
      $("#"+sysMsg.imgroupid).hide();
      $scope.sysMesssageList[index].count=0;
      StorageService.setItem("chatfirst", $scope.sysMesssageList).then(function(obj){
      }, null);

      $timeout(function () {
        $scope.sysMesssageList[index].existed = true;
        IMSqliteUtilService.saveOrUpdateImData("chatfirst", [$scope.sysMesssageList[index]]);
      }, 0);

      if(sysMsg.msgtype==0){
        if(sysMsg.imgrouptype == 0) {
          //跳转商家或者S的聊天详情页
          if (sysMsg.usertype == 's') {
            $scope.go('permsgdetail', {'otheruserid': sysMsg.imuserid, 'otherusername': sysMsg.name,'avate': sysMsg.avate,"imgroupid":sysMsg.imgroupid});//个人聊天详情页
          } else if (sysMsg.usertype == 'b') {
            $scope.go('msgdetail', {'otheruserid': sysMsg.imuserid, 'otherusername': sysMsg.name,'istmp':sysMsg.istmp,'avate': sysMsg.avate,"imgroupid":sysMsg.imgroupid});//商家聊天详情页
          }
        } else {
          //群
          $scope.go('msggroup', {imgroupid:sysMsg.imgroupid});
        }

      }else if(sysMsg.msgtype==1){
        $scope.go('msgdetailss', {'sysmsgtype':sysMsg.type, 'sysmsgtypename': sysMsg.name});
      }
    }

      //系统公告跳转详情
      $scope.gomsgsysytem = function(msgsystemid, msgType) {
        $scope.msgsystembean.count = 0;
        StorageService.setItem("systemmsg", $scope.msgsystembean);
        UserService.msgsystemflg = 1;
        $scope.go('msgsystem', {msgType:msgType});
      }

      //系统公告首页显示
      $scope.firstmsgsystem = function() {
        var params = {
          mod: 'nComm',
          func : 'getSysMsgGroupById',
          userid: UserService.user.id,
          data: {"msgsystemid":$scope.user.msgsystemid}
        }
        UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function (data) {
          $scope.msgsystembean=data.data;
        });
      }

    //消息列表左滑删除
    $scope.msgDelete = function(event, index){
      var mggrpid = $scope.sysMesssageList[index].imgroupid;
      if($scope.sysMesssageList[index].msgtype == 1){ //表示是系统消息
        var params = {
          mod: 'IM',
          func : 'updateIMSysMsgStatusByType',
          userid: UserService.user.id,
          data: {"sysmsgtype": $scope.sysMesssageList[index].type}
        }
        UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function (data) {
          IMSqliteUtilService.deleteImData("delete from sysmsg where type = "+mggrpid);
          IMSqliteUtilService.deleteImData("delete from chatfirst where id = '"+mggrpid+"'");
        });
      } else {
        var params = {
          mod: 'IM',
          func : 'delChatLog',
          userid: UserService.user.id,
          data: {"imgroupid": $scope.sysMesssageList[index].imgroupid}
        }
        UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function (data) {
          IMSqliteUtilService.deleteImData("delete from chat where imgroupid = '"+mggrpid+"' ");
          IMSqliteUtilService.deleteImData("delete from chatfirst where id = '"+mggrpid+"'");
        });
      }
      $scope.sysMesssageList = $scope.sysMesssageList.slice(0, index).concat($scope.sysMesssageList.slice(index+1, $scope.sysMesssageList.length));
      StorageService.setItem("chatfirst", $scope.sysMesssageList);
      //event.target.parentNode.parentNode.remove();
    }

    //通讯录字母导航
    /*$scope.az = function(e){
      var items = parseInt((e.pageY - 300) / 24);
      var lista = $scope.azlist;
      var topi = document.getElementById(lista[items]).offsetTop;
      $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTo(0, topi, false);
    }*/
    $scope.az2 = function(e){
      var items = parseInt((e.gesture.touches[0].pageY - 300) / 24);
      var lista = $scope.azlist;
      var topi = document.getElementById(lista[items]).offsetTop;
      $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTo(0, topi, false);

    }

    //$scope.showhint = function(){
    //  $scope.className = true;
    //  $timeout(function() {
    //    $scope.className = false;
    //  },3000)
    //}

    //删除好友
    $scope.friendDelete = function(suser){
      var confirmPopup = $ionicPopup.confirm({
        title:
          '是否删除通讯录中的这位好友？',
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '确认', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default' // String (默认: 'button-positive')。OK按钮的类型。
      });
      confirmPopup.then(function(res) {
        if(res) {
          var params = {
            mod: "IM",
            func: "delFriend",
            userid: UserService.user.id,
            data: {
              friendid: suser.userid
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function (data) {
            if(data.status == "000000") {
              //data.data 是 imgroupid
              //MsgService.toDeleteChat[data.data] = 1;
              MsgService.deleteChatfirst(data.data);
              $scope.queryContact();
            } else {

            }
          }).error(function() {
            UtilService.showMess("网络不给力，请稍后刷新");
          });
          //event.target.parentNode.parentNode.remove();
        } else {
          StorageService.getItem("contacts").then(function(obj){
            $scope.contacts = obj;
          }, function(){});
        }
      });
    }

    //通讯录-商家、个人切换

    //$scope.bPhone = function(){
    //
    //  $scope.concatTab = 0;
    //  UserService.concattab = 0;
    //  $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTop();
    //  $('.personnalbox').hide();
    //  setTimeout(function(){
    //    $scope.queryContact();
    //    $('.bPhone').addClass('active');
    //    $('.perPhone').removeClass('active');
    //    $('.businessbox').show();
    //  }, 50);
    //
    //  /*$scope.azlist = [];
    //  angular.forEach($scope.contacts.busers,function(value) {
    //    $scope.azlist.push(value.name_pinyin);
    //  });*/
    //  //$ionicScrollDelegate.scrollTop();
    //  UtilService.tongji("contacts", {type: 0});
    //}
   /* //通讯录-商家
    $scope.BusinessDetail =function(id){
      $scope.cleargo('merchantid', {buserid:id});
    }*/

    //$scope.perPhone = function(){
    //
    //  $scope.concatTab = 1;
    //  UserService.concattab = 1;
    //  $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTop();
    //  $('.businessbox').hide();
    //  setTimeout(function(){
    //    $scope.queryContact();
    //    $('.perPhone').addClass('active');
    //    $('.bPhone').removeClass('active');
    //    $('.personnalbox').show();
    //  }, 50);
    //
    //  $scope.azlist = [];
    //  angular.forEach($scope.contacts.susers,function(value) {
    //    $scope.azlist.push(value.name_pinyin);
    //  });
    //  //$ionicScrollDelegate.scrollTop();
    //  UtilService.tongji("contacts", {type: 1});
    //}

    $scope.queryContact = function() {
      StorageService.getItem("contacts").then(function(obj){
        $scope.contacts = obj;

        var tmpCount = 0;
        if($scope.contacts && $scope.contacts.susers) {
          $scope.azlist = [];
          angular.forEach($scope.contacts.susers,function(value) {
            $scope.azlist.push(value.name_pinyin);
          });

          if($scope.contacts.susers.length > 0) {
            //sfriendCount
            for(var i=0;i<$scope.contacts.susers.length;i++) {
              tmpCount += $scope.contacts.susers[i].array.length;
            }
          }
          $scope.sfriendCount = tmpCount;
        }

        MsgService.queryContacts({contactType:0}).then(function () {
          $scope.contacts = MsgService.getContacts();

          tmpCount = 0;
          if($scope.contacts && $scope.contacts.susers) {
            $scope.azlist = [];
            angular.forEach($scope.contacts.susers,function(value) {
              $scope.azlist.push(value.name_pinyin);
            });

            if($scope.contacts.susers.length > 0) {
              //sfriendCount
              for(var i=0;i<$scope.contacts.susers.length;i++) {
                tmpCount += $scope.contacts.susers[i].array.length;
              }
            }
            $scope.sfriendCount = tmpCount;
          }

          StorageService.setItem("contacts", $scope.contacts);
        }, function () {

        }).finally(function () {
        });
      }, null);

      /*
      MsgService.queryApply().then(function () {
        $scope.applys = MsgService.getApplys();
      }, function () {

      });
      */
      MsgService.queryUnreadIMApplyLogCount().then(function(data){
        $scope.applys = {length: data.data};
      }, function () {

      });
    };

    var template = '<ion-popover-view class="msg_popview"><ion-content><ul class="msg_popover"><li ng-click="goaddgroup()"><i class="icon ion-chatbubbles"></i>发起群聊</li><li ng-click="goAddFriend()"><i class="icon ion-android-person-add"></i>添加朋友</li></ul></ion-content></ion-popover-view>';

    $scope.goaddgroup=function(){
      $scope.popover.hide();
      $state.go('addgroup');
    }
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });


    $scope.msgPlus = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });

    $scope.goAddFriend = function(){
      $state.go('addnewfriend');
      $scope.popover.hide();
    };

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }

    $scope.goBusiness=function(id){
      var params = {
        mod: 'nUser',
        func: 'getBuserByuserid',
        userid: UserService.user.id,
        data: {"merchantid": id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if(data.status == "103006"){
          UtilService.showMess("该商家已下架");
        }else{
          $scope.go('business',{merchantid:id});
        }
      });
    }

  })
