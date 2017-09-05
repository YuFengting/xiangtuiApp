angular.module('xtui')
  //.directive('dir', function($compile, $parse,$sce,MsgService) {
  //  return {
  //    restrict : 'EA',
  //    scope:{
  //      content:"@conTent"
  //    },
  //    link: function(scope, element, attr) {
  //        var htmlcontent = scope.content;
  //        htmlcontent = htmlcontent.replace(/</g, "&lt;");
  //        htmlcontent = htmlcontent.replace(/>/g, "&gt;");
  //        htmlcontent = htmlcontent.replace(/http[s]?:\/\/[0-9a-z\.\_\-\:\/\?\=\&A-Z]+/g,'<a on-tap="showcontentinapp($event)" href="javascript:void(0)" style="text-decoration:none;">$&</a>');
  //        htmlcontent = $sce.trustAsHtml(MsgService.transform(htmlcontent));
  //        element.html(htmlcontent);
  //        $compile(element.contents())(scope);
  //    }
  //  }
  //})
//聊天详情页
  .controller('permsgdetailController', function ($ionicModal,$timeout,$interval,IMSqliteUtilService,StorageService, MsgService, $state,$location, $cordovaImagePicker,$scope, $rootScope, $ionicSlideBoxDelegate,$ionicActionSheet,ConfigService,UserService, $timeout,$ionicScrollDelegate, $ionicPopup,UtilService,$stateParams,BlackService,$window) {
      $scope.$on('$ionicView.beforeEnter', function() {
          //清除该imgroup在会话首页的未读角标
          MsgService.clearUnread($stateParams.imgroupid);
          if(UtilService.goStatus[$state.current.name] != undefined) {
              $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(false);
              delete UtilService.goStatus[$state.current.name];
          }
          queryNew();
          intervalTask = $interval(function(){
              queryNew();
          }, ConfigService.queryGap);

          $scope.message = "";
          $scope.morebtn = true;
          $scope.sendbtn = false;

        $scope.contentBoxName = "perchat";

      });

      $scope.attr_id = "_"+$stateParams.imgroupid;

      $scope.$on("$ionicView.beforeLeave", function () {
      $scope.polist.hide();
      $scope.getmoney.hide();
      $scope.paymoney.hide();

      if(intervalTask != null) {
          $interval.cancel(intervalTask);
          intervalTask = null;
      }
    });

    var chatlogids = {};

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
    //getLocationperchat()

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
    }
    $scope.sendposition=function(){
      $scope.closepositionlist()
      $scope.getLocationperchat()
    }
    //位置列表
    $ionicModal.fromTemplateUrl('positionlist'+$scope.attr_id+'.html', {
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

    var hidepop = false;
    //申请好友
    $scope.apply = function () {
      hidepop = true;
      $scope.remark = {content:""};
        var myPopup = $ionicPopup.show({
            template: '<div style="padding: 18px 5px;">验证信息</div><textarea placeholder="最多20字" ng-model="remark.content"></textarea><style>.popup-head{border:none;padding:0px;}.popup-container .popup-title{padding:0px}</style>',
            scope: $scope,
            buttons: [
                {
                    text: '取消',
                    type: '',
                    onTap: function(e) {
                      hidepop = false;
                    }
                },
                {
                    text: '确定',
                    onTap: function(e) {
                        if(angular.isDefined($scope.remark.content)){
                            if($scope.remark.content.length>20){
                                UtilService.showMess("验证信息最多20个字");
                                e.preventDefault();
                                return;
                            }
                        }
                      hidepop = false;
                        MsgService.insertIMApply($stateParams.otheruserid, $scope.remark.content).then(function (data) {
                            if(data.status == "000000") {
                                UtilService.showMess("申请成功");
                            } else {
                                UtilService.showMess(data.msg);
                            }
                        }, function () {
                            UtilService.showMess("网络不给力，请稍后重试！");
                        });
                    }
                }
            ]
        });
    };


    //付款新开页

    //任务modal】
    //付款
    // $ionicModal.fromTemplateUrl('getmoney'+$scope.attr_id+'.html', {
    $ionicModal.fromTemplateUrl("modules/msg/perchat/modal/getmoney.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getmoney) {
      $scope.getmoney = getmoney;
    });
    $scope.opengetmoneytaskModal = function() {
        //先检查会话状态
        MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (data) {
            if(data.status == "000000") {
                $scope.getmoney.show();
                $timeout(function () {
                    $scope.startfun();
                },0);
            } else if(data.status == "150001") {
                UtilService.showMess("不是好友关系，无法进行收款");
            } else {
                UtilService.showMess(data.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });
    };
    $scope.closegetmoneytaskModal = function() {
      $scope.getmoney.hide();
    };


    //任务modal
    //收款
    // $ionicModal.fromTemplateUrl('paymoney'+$scope.attr_id+'.html', {
    $ionicModal.fromTemplateUrl("modules/msg/perchat/modal/paymoney.html", {
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



    //付款密码弹窗
    $scope.pswinfo = '';
    $scope.enterpsw = function(num){
      if(num!=11){
        if($scope.pswinfo.length<6){
          $scope.pswinfo=$scope.pswinfo+num;
        }
      }else{
        $scope.pswinfo = $scope.pswinfo.substring(0,$scope.pswinfo.length-1);
      }
      if ($scope.pswinfo.length >= 6) {
        //$scope.paypopup.hide();
        $timeout(function () {
          $scope.pay.passward=$scope.pswinfo;
          $scope.checkPayMoney();
          $scope.pswinfo="";
        },200)
      }
    }

    $scope.showpaymask=function(){
      if (angular.isUndefined($scope.pay.paymoney) || $scope.pay.paymoney == null || $scope.pay.paymoney == "") {
        UtilService.showMess("付款金额不能为空");
        return;
      }
      if (!UtilService.isNumber($scope.pay.paymoney)) {
        UtilService.showMess("请输入正确的金额");
        return;
      }
      if(angular.isDefined($scope.pay.payremark)){
        if($scope.pay.payremark.length>50){
          UtilService.showMess("付款理由最多50个字");
          return;
        }
      }

        //先检查会话状态
        MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (checkData) {
            if(checkData.status == "000000") {
                var params = {
                    mod: 'nUser',
                    func: 'checkRestMoney',
                    userid: $scope.user.id,
                    data:{paymoney:$scope.pay.paymoney}
                };
                UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
                    token = data.token;
                    if(data.status == '000000'){
                        if(data.data.pm_status == '0'){
                            UtilService.showMess("账户余额不足");
                            $scope.pay = {};
                        }else {
                            $scope.pay.showpaymoney = angular.copy($scope.pay.paymoney).toFixed(2);
                            $scope.paymaskshow = true;
                            $scope.payshoukuanPop = true;
                        }
                    }
                }).error(function () {
                    UtilService.showMess("网络不给力，请稍后重试");
                });
            } else if(checkData.status == "150001") {
                UtilService.showMess("不是好友关系，无法进行付款");
                $scope.showpayload = false;
            } else {
                UtilService.showMess(checkData.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });
    };

    var lxkfflg=0;
    $scope.hidepaymask=function(){
      if(lxkfflg==1){
        fgtpsw.close();
        lxkfflg=0;
        return;
      }
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
      $scope.pay.passward = "";
      $scope.pswinfo="";
      // $scope.paylist = angular.copy(paylist_bf);
      $scope.paymaskshow = false;
      $scope.payshoukuanPop = false;
    }
    $scope.fgtpwd=false;
    $scope.forgetpswd=function(){
      $scope.fgtpswalert();
    }

    var fgtpsw;
    $scope.fgtpswalert = function() {
      lxkfflg=1;
      fgtpsw = $ionicPopup.show({
        title: '如您忘记密码，请直接联系<br />客服<span class="coler007a">400-0505-811</span>',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){
              lxkfflg=0;
            }
          },
          {
            text: '<span style="color: #007aff">联系客服</span>',
            onTap:function(){
              window.open("tel:400-0505-811");
            }
          }
        ]
      });
    };



    $scope.user = UserService.user;
    $scope.message = "";
    $scope.contenttype = "";
    $scope.content = "";
    $scope.showimg = false;
    $rootScope.chatLargeImgShow = false;
    $scope.showbase64 = false;
    $scope.pay = {};
    $scope.showpaypwd = false;
    var otheruserid = $stateParams.otheruserid;
    var imgroupid = $stateParams.imgroupid;
    //var otheruserid = "5645a5c6e4b0bccfb4f7efaa";
    $scope.otherusername = $stateParams.otherusername;
    $scope.avate = $stateParams.avate;
    var token;
    var paylist_bf=[{"title":""},{"title":""},{"title":""},{"title":""},{"title":""},{"title":""}];

    $scope.openHome = function(usertype, senderid) {
      if(usertype == "b") {
        //商家
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
    var onMessage = function(data){
      var customContent = angular.fromJson(data.customContent);
      if($state.current.name == "permsgdetail" && $state.params.imgroupid == customContent.imgroupid) {
        if(ConfigService.imtimeout > 0) {
          //使用了定时刷新，则刷新
          if($scope.userchatlist && $scope.userchatlist.length > 0) {
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
                    $ionicScrollDelegate.$getByHandle('perchat').resize();
                    $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
                  },400)
                }
              }
            });
          } else {
            queryChatLog();
          }

        } else {
          var params = {
            mod: 'IM',
            func: 'queryChatLog',
            userid: $scope.user.id,
            data:{
              imgroupid: customContent.imgroupid,
              logid: customContent.chatlogid
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
            token = data.token;
            if(data.status == "000000") {
              $scope.userchatlist[ $scope.userchatlist.length] = data.data[0];
            } else {
              UtilService.showMess(data.msg);
            }
            //开启页面滚动条到底部
            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('perchat').resize();
              $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
            },100)
          }).error(function(){
            UtilService.showMess("网络不给力，请稍后刷新");
          });
        }
      }
    };

    /* //全部重新查询
     var onMessage = function(data){
     var customContent = angular.fromJson(data.customContent);
     if($state.current.name == "permsgdetail" && $state.params.imgroupid == customContent.imgroupid) {
     var params = {
     mod: 'IM',
     func: 'queryChatLog',
     userid: $scope.user.id,
     page:{
     pageNumber: 1,
     pageSize: 20
     },
     data:{
     imgroupid: customContent.imgroupid
     }
     };
     UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
     token = data.token;
     if(data.status == "000000") {
     $scope.userchatlist = data.data;
     } else {
     UtilService.showMess(data.msg);
     }
     //开启页面滚动条到底部
     $ionicScrollDelegate.$getByHandle('perchat').scrollBottom();
     }).error(function(){
     UtilService.showMess("网络不给力，请稍后刷新");
     });
     }
     };
     */

    $scope.stopFun = function (e) {
      e.preventDefault();
    }

    var kbOpen = false;
    $scope.showAddfunc=false;
    $scope.showEmoji=false;
    function onKbOpen(e) {
      kbOpen = true;
      if(!hidepop){
        getInput.selectionStart = getInput.textLength;
      }
      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform == "Android") {
        $scope.hasmsgfootersty = {'margin-bottom': '0px','bottom':getH+'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom()
        }, 100);
      }else{
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.msgfootersty = {'bottom': numpercent + 'px'};
        $scope.hasmsgfootersty = {'margin-bottom': numpercent +'px','bottom':getH + 'px'};
        $scope.msgpopupsty={ "top":'40%','margin-top':'-350px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom();

          $timeout(function(){  $('.popup-container').css({'bottom':eH+'px'});},340)
        }, 100);
      }
    }
    function onKbClose(e) {
      kbOpen = false;
      startPos = getInput.selectionStart;
      endPos = getInput.selectionEnd;
      if (device.platform == "Android") {
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom()
        }, 100);
      }else{
        var getH = parseInt($(".footInforBox").css('height'))-2;
        $scope.msgpopupsty={ "top":'50%','margin-top':'-350px'};
        $scope.msgfootersty = {'bottom': '0px'}
        $scope.hasmsgfootersty = {'bottom': getH+'px'};

        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom()

          $timeout(function(){  $('.popup-container').css({'bottom':0+'px'});},340)
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
              $ionicScrollDelegate.$getByHandle('perchat').resize();
              $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
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
        imgroupid: imgroupid,
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
            // $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
              $scope.avateAnaName[res[i].senderid].avate = res[i].avate;
          }

        }
        if($scope.userchatlist && $scope.userchatlist.length > 0) {
          $scope.userchatlist = $scope.userchatlist.concat(res);
        } else {
          $scope.userchatlist = res;
        }

        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
        },100)
      }, function(){
        //alert("error");
      });
      /*
       StorageService.getItem("chat_"+imgroupid).then(function(obj){
       $scope.userchatlist = obj;
       //开启页面滚动条到底部
       $timeout(function () {
       $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
       },0)
       }, function(){});
       */
      /*
       var params = {
       mod: 'IM',
       func: 'queryChatLog',
       userid: $scope.user.id,
       data:{
       imgroupid: imgroupid
       //otheruserid:otheruserid  //好友userid
       },
       page:{pageSize:10}
       };
       UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
       token = data.token;
       if(data.status == "000000") {
       $scope.userchatlist = data.data;
       }else{
       UtilService.showMess(data.msg);
       }
       //开启页面滚动条到底部
       $timeout(function () {
       $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
       },0)

       }).error(function(){

       }).finally(function(){
       resetTimeoutTask();
       });
       */
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
                // $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
                  $scope.avateAnaName[res[i].senderid].avate = res[i].avate;
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
    $scope.avateAnaName[$stateParams.otheruserid] = {name:$stateParams.otherusername};
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
              // $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
                $scope.avateAnaName[res[i].senderid].avate = res[i].avate;
            }

            gtid = res[res.length - 1].id;
            $scope.userchatlist = $scope.userchatlist.concat(res);

            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('perchat').resize();
              $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
            },200)

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


    if (imgroupid==null) {
      var params = {
        mod: 'IM',
        func: 'queryIMGrpInfo',
        userid: $scope.user.id,
        data:{friendid: $stateParams.otheruserid}
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == "000000") {
          imgroupid = data.data;
          ConfigService.currentIMgrpid = imgroupid;//推送通知需要这一行
          queryChatLog(imgroupid);
        } else if(data.status=="500001"){
          UtilService.showMess("该用户已解除和您的好友关系，您可再次申请");
        } else {
          UtilService.showMess(data.msg);
        }
      }).error(function(){
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    } else {
      ConfigService.currentIMgrpid = imgroupid;//推送通知需要这一行
      //queryChatLog(imgroupid);
    }

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
          $ionicScrollDelegate.$getByHandle('perchat').resize();
          $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
        },1000)
      }).error(function(){

      });
    };

    $scope.back = function() {
      if(kbOpen == true) {
        cordova.plugins.Keyboard.close();
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
      $ionicScrollDelegate.$getByHandle('perchat').scrollTop();
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
        //$ionicScrollDelegate.$getByHandle('perchat').scrollTop();
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
                    if(data.status == '150001') {
                        var id = gtid ? gtid+new Date().getTime() : "0"+new Date().getTime();
                        chatlogids[id] = 1;
                        var tipMsg = {
                            id: id,
                            name:$scope.user.nick,
                            avate:$scope.user.avate,
                            imgroupid:imgroupid,
                            position:"1",
                            contenttype:-999,
                            senderid:$scope.user.id,
                            content:"",
                            status:0,
                            sendstatus:"0",
                            imgtype : "1"
                        };
                        $scope.userchatlist.push(tipMsg);
                        IMSqliteUtilService.insertImObject("chat", [tipMsg]);
                    }
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
            //queryChatLog();
          }else {
              if(data.status == '150001') {
                  var id = gtid ? gtid+new Date().getTime() : "0"+new Date().getTime();
                  chatlogids[id] = 1;
                  var tipMsg = {
                      id: id,
                      name:$scope.user.nick,
                      avate:$scope.user.avate,
                      imgroupid:imgroupid,
                      position:"1",
                      contenttype:-999,
                      senderid:$scope.user.id,
                      content:"",
                      status:0,
                      sendstatus:"0",
                      imgtype : "1"
                  };
                  $scope.userchatlist.push(tipMsg);
                  IMSqliteUtilService.insertImObject("chat", [tipMsg]);
              }
            $scope.userchatlist[index].sendstatus = 2;
          }

        }).error(function(){
          $scope.userchatlist[index].sendstatus = 2;
        }).finally(function () {
          //$ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
        })
      }



    }

    $scope.sendMessage = function (contenttype) {
      $scope.morebtn = true;
      $scope.sendbtn = false;
      //$('.has-msgfooter').css({'overflow-y':'scroll !importent'});
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
        $scope.content = $scope.localimage;
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
      if(angular.isUndefined($scope.userchatlist.length) || $scope.userchatlist.length==0){
        chatlen = 0;
      }else{
        chatlen = $scope.userchatlist.length - 1;
      }

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
                    $scope.userchatlist[chatlen].sendstatus = 2;
                  // UtilService.showMess("你们不是好友，无法聊天。");
                  // MsgService.deleteChatfirst(imgroupid);
                  // $scope.go("tab.msg");
                    var id = gtid ? gtid+new Date().getTime() : "0"+new Date().getTime();
                    chatlogids[id] = 1;
                    var tipMsg = {
                        id: id,
                        name:$scope.user.nick,
                        avate:$scope.user.avate,
                        imgroupid:imgroupid,
                        position:"1",
                        contenttype:-999,
                        senderid:$scope.user.id,
                        content:"",
                        status:0,
                        sendstatus:"0",
                        imgtype : "1"
                    };
                    $scope.userchatlist.push(tipMsg);
                    IMSqliteUtilService.insertImObject("chat", [tipMsg]);
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
            //queryChatLog();
          }else if(data.status == '150001'){
            //已不是好友
              $scope.userchatlist[chatlen].sendstatus = 2;
            // UtilService.showMess("你们不是好友，无法聊天。");
            // MsgService.deleteChatfirst(imgroupid);
            // $scope.go("tab.msg");
              var id = gtid ? gtid+new Date().getTime() : "0"+new Date().getTime();
              chatlogids[id] = 1;
              var tipMsg = {
                  id: id,
                  name:$scope.user.nick,
                  avate:$scope.user.avate,
                  imgroupid:imgroupid,
                  position:"1",
                  contenttype:-999,
                  senderid:$scope.user.id,
                  content:"",
                  status:0,
                  sendstatus:"0",
                  imgtype : "1"
              };
              $scope.userchatlist.push(tipMsg);
              IMSqliteUtilService.insertImObject("chat", [tipMsg]);
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
      }


      $scope.message = "";
      //回滚到消息底部
      //$ionicScrollDelegate.$getByHandle('perchat').update();
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('perchat').resize();
        $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
      },100)

      /*if(contenttype == 0 || contenttype == "0"){
        $timeout(function(){
          if($scope.showEmoji){
            $scope.inputFocus = false;
          }else{
            $scope.inputFocus = true;
            cordova.plugins.Keyboard.show();
            cordova.plugins.Keyboard.isVisible = true;
            $('.footInforBox textarea').focus();
          }
        },0)
      }*/

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
            $scope.localimage = results[0];
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
       targetWidth: 600,//像素
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
      UtilService.tongji("perchat", {type: 0});
      UtilService.customevent("perchat","zhaopian");
    };

    $scope.getLocationperchat = function() {
      if(!UtilService.checkNetwork()){
        UtilService.showMess("网络不给力，请稍后刷新");
        return;
      }
      BlackService.getLocationImg().then(function(url){
        $scope.locationImgUrl = url;
        $scope.sendMessage('5');
      }, null);
      UtilService.tongji("perchat", {type: 1});
      UtilService.customevent("perchat","dingwei");
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
          if(contenttype==9||contenttype==10){
            if($scope.userchatlist[index].content==null||$scope.userchatlist[index].content==""||angular.isUndefined($scope.userchatlist[index].content)){
              insertIMPaylog(contenttype,'repeat',index);
            }else{
              sendPayMessage(contenttype,index,$scope.userchatlist[index].content);
            }
          }else{
            $scope.resend(index);
          }
        } else {
        }
      });
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


    $scope.copycontent = function (copytext) {
      cordova.plugins.clipboard.copy(copytext);
      UtilService.showMess("已复制");
    }


    //跳转内部连接
    $scope.showcontentinapp = function (event) {
      UtilService.showcontentinapputil(event);
    }

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
        $scope.imageurl = userchat.content;//userchat.content;
        $scope.imagesendstatus =userchat.sendstatus;
        $scope.imageid = userchat.id;
        //$('.chatpage').append(' <div class="showPic" ><img src='+'data:image/png;base64,'+userchat.content+' ng-click="shrinkPic()"  class="big-pic" ></div>');
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
        //$scope.imageurl = ConfigService.picserver+userchat.content;
        //$('.chatpage').append(' <div class="showPic" ><img src='+$scope.picserver+userchat.content+' ng-click="alert(111)" class="big-pic" ></div>');
      }
      $timeout(function(){
        var a = $('.big-pic').height()/$('.big-pic').width();
        var sW = window.screen.width;
        var sh =640*window.screen.height/window.screen.width;
        if(a<window.screen.height/window.screen.width){
          $('.big-pic').css('margin-top',sh/2-$('.big-pic').height()/2+'px');
        }else{
          $('.big-pic').css('margin-left',640/2-$('.big-pic').width()/2+'px')
        }
        $('.big-pic').css("opacity",1);
      },50)
    };

    $scope.shrinkPic = function () {
      $scope.showimg = false;
      $scope.showbase64 = false;
      $scope.showLocImg = false;
      $rootScope.chatLargeImgShow = false;
    };
    //保存、转发图片
    $rootScope.checkedList = [];
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
      if(url.indexOf("file://")==0 && device.platform == "Android"){
        $timeout(function () {
          saveImageToPhone(url, function(msg){
            UtilService.showMess("图片下载成功！");
          }, function(err){
            UtilService.showMess("图片下载失败！");
          });
        },100);
      }else{
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
                console.info(msg);
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
          $scope.payload = false;
          $scope.paysucc = true;
          $timeout(function () {
            $scope.showpayload = false;
            $scope.paysucc = false;
            $scope.getmoney.hide();
            $scope.paymoney.hide();
          },1000);
          $scope.userchatlist[pay_len].sendstatus = 0;
          $scope.userchatlist[pay_len].id = data.data;
          chatlogids[data.data] = 1;
          //queryChatLog();
        }else {
          $scope.userchatlist[pay_len].sendstatus = 2;
        }

      }).error(function(){
        $scope.showpayload = false;
        $scope.payload = false;
        $scope.paysucc = true;
        $scope.userchatlist[pay_len].sendstatus = 2;
      })
    }


    var insertIMPaylog = function (contenttype,repeat,index) {
      var type;
      var pay_len
      if(repeat != "repeat"){
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
        $scope.remark = "";
        $scope.money = 0;
        //判断发送消息的类型
        if(contenttype == '9') {
          $scope.content = "";
          $scope.money = $scope.pay.accmoney;
          $scope.remark =  $scope.pay.remark;
          type = 0;
        } else if(contenttype == '10') {
          $scope.remark = $scope.pay.payremark;
          $scope.content = "";
          $scope.money = $scope.pay.paymoney;
          type = 1;
        }
      }else{
        $scope.money = $scope.userchatlist[index].paylog.money;
        $scope.remark = $scope.userchatlist[index].paylog.remark;
        type = $scope.userchatlist[index].paylog.type;
        pay_len = index;
      }
      var params = {
        mod: 'IM',
        func: 'insertIMPaylog',
        userid: $scope.user.id,
        data:{
          receiverid:otheruserid,//好友userid
          senderid:$scope.user.id,
          type:type,
          money:$scope.money,
          remark:$scope.remark
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          $scope.pay.id = data.data;
          $scope.paylog = {
            id:$scope.pay.id,
            money:$scope.money,
            remark:$scope.remark,
            type:type,
            status:0
          }
          if(!$scope.userchatlist) {
            $scope.userchatlist = [];
          }
          var mychat = {
            name:$scope.user.nick,
            avate:$scope.user.avate,
            imgroupid:imgroupid,
            position:"1",
            type:type,
            contenttype:contenttype,
            senderid:$scope.user.id,
            content:$scope.content,
            paylog:$scope.paylog,
            sendstatus:"1", //发送状态：0 成功 1 发送中 2 发送失败
            inittime:inittime
          }
          $scope.userchatlist.push(mychat);
          pay_len = $scope.userchatlist.length-1;
          $timeout(function () {

            $ionicScrollDelegate.$getByHandle('perchat').resize();
            $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
          },100)
          sendPayMessage(contenttype,pay_len,$scope.pay.id);
          $scope.pay.payremark = "";
          $scope.payremark = "";
          $timeout(function () {
            getmoneyflg = 0
          },800)
          $(".footInforBox .icon").removeClass("current");
        }else{
            if(data.status == "150001" && contenttype == "9") {
                UtilService.showMess("不是好友关系，无法进行收款");
            } else if(data.status == "150001" && contenttype == "10") {
                UtilService.showMess("不是好友关系，无法进行付款");
                $scope.showpayload = false;
            } else {
                UtilService.showMess(data.msg);
            }

          getmoneyflg = 0;
        }
        $scope.pay = {};
        // $scope.paylist = angular.copy(paylist_bf);
      }).error(function(){
        $scope.showpayload = false;
        $scope.payload = false;
        $scope.paysucc = false;
        getmoneyflg = 0;
        $scope.pay = {};
        // $scope.paylist = angular.copy(paylist_bf);
        UtilService.showMess("网络不给力，请稍后重试");
      })
    }

    //收款
    $scope.shoukuan = function(){
      if(!UtilService.checkNetwork()){
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      $scope.shoukuanPop = true;
      $timeout(function(){document.getElementById('shoukuanInput'+$scope.attr_id).focus();},200);
      UtilService.tongji("perchat", {type: 2});
      UtilService.customevent("perchat","shoukuan");
    };

    var getmoneyflg = 0;
    $scope.commitMoney = function () {
      if(getmoneyflg != 0){
        return;
      }
      if(angular.isUndefined($scope.pay.accmoney) || $scope.pay.accmoney == null || $scope.pay.accmoney == ""){
        UtilService.showMess("收款金额不能为空");
        return;
      }
      if (parseFloat($scope.pay.accmoney) == 0) {
        UtilService.showMess("金额不能为0");
        return;
      }
      if(!UtilService.isNumber($scope.pay.accmoney)){
        UtilService.showMess("请输入正确的金额");
        return;
      }
      if(angular.isDefined($scope.pay.remark)){
        if($scope.pay.remark.length>50){
          UtilService.showMess("收款理由最多50个字");
          return;
        }
      }
      getmoneyflg = 1;
      insertIMPaylog('9');
    }

    //付款
    $scope.payMoney = function(){
      if(!UtilService.checkNetwork()){
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }

      MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (checkData) {
          if(checkData.status == "000000") {
              var params = {
                  mod: 'nUser',
                  func: 'checkUserStatus',
                  userid: $scope.user.id
              }
              UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
                  token = data.token;
                  if(data.status == '000000'){
                      if(data.data==0){
                          $scope.paymoney.show();
                          $timeout(function () {
                              $scope.startfun();
                          },0)
                          $timeout(function () {
                              document.getElementById('per_moneyinput').focus();
                          }, 200);
                      }else if(data.data==1){
                          UtilService.showMess("账号已被冻结，暂不能付款");
                          $scope.payshoukuanPop = false;
                          $scope.paymaskshow = false;
                      }
                  }else{
                      UtilService.showMess(data.msg);
                  }
              });
          } else if(checkData.status == "150001") {
              UtilService.showMess("不是好友关系，无法进行付款");
              $scope.showpayload = false;
          } else {
              UtilService.showMess(checkData.msg);
          }
      }, function () {
          UtilService.showMess("网络不给力，请稍候重试！");
      });
      UtilService.tongji("perchat", {type: 3});
      UtilService.customevent("perchat","fukuan");
    }

    $scope.showpayload = false;
    $scope.payload = false;
    $scope.paysucc = false;
    //检查支付密码 剩余金额
    var checkPayPwd = function (paymoney) {
      if(!UtilService.isPayPwd($scope.pay.passward)){
        UtilService.showMess("请输入6位数字支付密码");
        $scope.pay.passward = "";
        // $scope.paylist = angular.copy(paylist_bf);
        return;
      }
      var paypwd =  hex_md5($scope.pay.passward.toString());
      var params = {
        mod: 'nUser',
        func: 'checkPayPwd',
        userid: $scope.user.id,
        data:{paypwd:paypwd,paymoney:paymoney}
      }
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          if(data.data.pm_status == '0'){
            UtilService.showMess("账户余额不足");
          }else {
            if(data.data.pm_status == '1'){
              UtilService.showMess("支付密码保存成功");
            }
            $scope.showpayload = true;
            $scope.payload = true;
            insertIMPaylog('10');
          }
          $scope.pay = {};
          // $scope.paylist = angular.copy(paylist_bf);
          $scope.payshoukuanPop = false;
          $scope.paymaskshow = false;
          cordova.plugins.Keyboard.close();
          $(".footInforBox .icon").removeClass("current");
        }else if(data.status == '100304'){
          UtilService.showMess("支付密码错误");
          $scope.pay.passward = "";
          // $scope.paylist = angular.copy(paylist_bf);
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后重试");
      })
    }

    $scope.checkPayMoney = function () {
      if(UtilService.idDefine($scope.pay.passward)){
        var passward = $scope.pay.passward+'';
        var paypwdlen = passward.length;
        for(var i=0;i<paypwdlen;i++){
          // $scope.paylist[i].title = ".";
        }
        for(var i=5;i>=paypwdlen;i--){
          // $scope.paylist[i].title = "";
        }
        if(passward.length>=6){
          checkPayPwd($scope.pay.paymoney);
        }
      }else{
        // $scope.paylist[0].title = "";
      }
    }

    $scope.showTel = function () {
      window.open("tel:400-0505-811");
    }

    //隐藏弹窗
    $scope.cancelPop = function(){
      $timeout(function(){


        $scope.shoukuanPop = false;
      },400)
      $scope.pay = {};
      // $scope.paylist = angular.copy(paylist_bf);
    }

    //忘记支付密码
    $scope.forgetPwd = function(){
      $scope.showpaypwd = true;

    }

    $scope.hidePayPwd = function () {
      $timeout(function(){
        $scope.showpaypwd = false;
      },400)
    };

    //发送按钮
    $scope.sendbtn = false;
    //加号按钮
    $scope.morebtn = true;

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
      //$('.has-msgfooter').css({'margin-bottom':'0px'})
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if( $scope.showAddfunc ||  $scope.showEmoji){
        $scope.hasmsgfootersty={'bottom':getH+'px'}
      }
      /*      $('.emojiBox').hide();
       $('.addFunctionBox ').hide();*/
      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      //$(".footInforBox .icon").removeClass("current");
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('perchat').resize();
        $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
      },400)
    }
    //$scope.inputFocus = false;
    $scope.isInputShow = true;
    var openEmoji = function() {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      //$('.has-msgfooter').css({'margin-bottom':'300px'})
      $scope.hasmsgfootersty = {'margin-bottom': '300px','bottom':getH+'px'};
      $('#inputBox'+$scope.attr_id).blur();
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height',getInputH+'px');
      $ionicScrollDelegate.$getByHandle('perchat').resize();
      $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
      $scope.showEmoji = true;
      $scope.showAddfunc=false;
      $scope.isInputShow = true;
      /*      $(".footInforBox .icon").removeClass("current");
       $(".footInforBox .icon:first").addClass("current");*/
      //$(".addFunctionBox").hide();

      //$scope.showEmoji=true;
      //$(".message-foot").addClass("setBottom");
      var myInput = document.getElementById('inputBox'+$scope.attr_id);
      if (myInput == document.activeElement) {
        $timeout(function(){
          //$(".emojiBox").slideDown();
          $scope.showEmoji=true;
          $ionicSlideBoxDelegate.update();
        },200)
      } else {
        //$(".emojiBox").show();
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
      //$('.has-msgfooter').css({'margin-bottom':'280px'})
      var getH = parseInt($(".footInforBox").css('height'))-2;
      $scope.hasmsgfootersty = {'margin-bottom': '300px','bottom':getH+'px'};
      $ionicScrollDelegate.$getByHandle('perchat').resize();
      $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
      $('#inputBox'+$scope.attr_id).blur();
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height',getInputH+'px');
      //$(".footInforBox .icon").removeClass("current");
      //$(".footInforBox .icon:last").addClass("current");
      //$(".emojiBox").hide();
      $scope.showEmoji=false;
      $scope.isInputShow = true;
      //$(".message-foot").addClass("setBottom");
      var myInput = document.getElementById('inputBox'+$scope.attr_id);
      if (myInput == document.activeElement) {
        $timeout(function(){
          //$(".addFunctionBox").slideDown();
          $scope.showAddfunc=true;
        },200)
      } else {
        //$(".addFunctionBox").show();
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
    /*    $(".has-chatheader").click(function(){
     $scope.showAddfunc=false;
     $scope.showEmoji=false;
     $scope.hasmsgfootersty.bottom='76px';
     })*/
    $scope.closefoot=function(){
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
      if($scope.showAddfunc ||  $scope.showEmoji){

        $ionicScrollDelegate.$getByHandle('perchat').resize();
        $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);              }

      $scope.showAddfunc=false;
      $scope.showEmoji=false;
      $scope.hasmsgfootersty={'bottom': getH+"px"};
//      $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
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
      $scope.go('ssaccountdetail',{'paylogid':paylogid,'otheruserid':otheruserid,usertype:'s','otherusername':$scope.otherusername})
    }

    /***语音***/
    $scope.voiceText = "按住说话";
    var video;
      $timeout(function() {
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

    $scope.voiceBox = function(){
      $scope.showAddfunc = false;
      $scope.showEmoji = false;
      $scope.voicePer = 'block';
      $scope.hasmsgfootersty = {'margin-bottom': '0px'};
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height','78px');
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('perchat').resize();
        $ionicScrollDelegate.$getByHandle('perchat').scrollBottom()
      }, 100);
      if($scope.isInputShow){
        $scope.isInputShow = false;
        $scope.sendbtn = false;
        $scope.morebtn = true;
      }else if ($scope.message == "") {
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

  })
  //S与S收付款账单详情
  .controller('SSPayController', function ($scope,$stateParams,UserService,UtilService,ConfigService,$ionicPopup,$timeout){
    $scope.$on("$ionicView.beforeEnter",function(){
      window.addEventListener('native.keyboardshow', onKbOpen);
      window.addEventListener('native.keyboardhide', onKbClose);
      $scope.startfun();
    });

    $scope.user = UserService.user;
    var paylogid = $stateParams.paylogid;
    var otheruserid = $stateParams.otheruserid;
    var usertype=  $stateParams.usertype;
    $scope.otherusername = $stateParams.otherusername;
    $scope.paylogstatus = 0;
    $scope.showbtn = false;
    //蒙层
    $scope.maskshow = false;
    $scope.setpwdPop = false;
    $scope.showpaypwd=false;
    $scope.pay = {};
    var token="";
    var paylist_bf=[{"title":""},{"title":""},{"title":""},{"title":""},{"title":""},{"title":""}];
    // $scope.paylist=[{"title":""},{"title":""},{"title":""},{"title":""},{"title":""},{"title":""}];

    var kbOpen = false;
    //$scope.msgfootersty={ "bottom":'0px' };
    //$scope.hasmsgfootersty={ "bottom":'76px'};
    //$scope.msgpopupsty={ "top":'50%'};
    $scope.showAddfunc=false;
    $scope.showEmoji=false;
    function onKbOpen(e) {
      kbOpen = true;
      if (device.platform != "Android") {
        $scope.msgpopupsty={ "top":'40%','margin-top':'-350px'};
      }
    }
    function onKbClose(e) {
      kbOpen = false;
      if (device.platform == "Android") {
        //$scope.msgpopupsty={ "margin-top":'-350px'};

      }else{
        $scope.msgfootersty = {'bottom':  '0px'};
        $scope.hasmsgfootersty = {'bottom': '76px'};
        $scope.msgpopupsty={ "top":'50%','margin-top':'-350px'};

      }
    }
    $scope.$on('$ionicView.unloaded', function() {
      window.removeEventListener('native.keyboardshow', onKbOpen);
      window.removeEventListener('native.keyboardhide', onKbClose);
    });

    //该方法返回若干条最新的消息，有可能包括已读的消息
    var queryIMPayLog = function () {
      var params = {
        mod: 'IM',
        func: 'queryIMPayLog',
        userid: $scope.user.id,
        data:{paylogid: paylogid,otheruserid:otheruserid,usertype:usertype}
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == "000000") {
          $scope.impaylog = data.data;
          var position = $scope.impaylog.suserInfo.position;
          var paytype = $scope.paytype = $scope.impaylog.impaylog.type;
          var paystatus = $scope.impaylog.impaylog.status;
          if(position == '1'){//自己
            if(paytype == 1){//付款
              if(paystatus == 0){
                $scope.paylogstatus = 1;
              }else if(paystatus == 1){
                $scope.paylogstatus = 4;
              }else if(paystatus == 2){
                $scope.paylogstatus = 6;
              }else if(paystatus == 4){
                $scope.paylogstatus = 7;
              }
            }else{//收款
              if(paystatus == 0){
                $scope.paylogstatus = 2;
              }else if(paystatus == 1){
                $scope.paylogstatus = 5;
              }else if(paystatus == 2){
                $scope.paylogstatus = 6;
              }else if(paystatus == 4){
                $scope.paylogstatus = 8;
              }
            }
          }else {//对方
            if(paytype == 1){//收款
              if(paystatus == 0){
                $scope.paylogstatus =9;
                $scope.updateIMPayLog('1');
              }else if(paystatus == 1){
                $scope.paylogstatus = 5;
              }else if(paystatus == 2){
                $scope.paylogstatus = 6;
              }else if(paystatus == 4){
                $scope.paylogstatus = 8;
              }
            }else{//付款 同意拒绝
              $scope.showbtn = false;
              if(paystatus == 0){
                $scope.showbtn = true;
                $scope.paylogstatus = 3;
              }else if(paystatus == 1){
                $scope.paylogstatus = 4;
              }else if(paystatus == 2){
                $scope.paylogstatus = 6;
              }else if(paystatus == 4){
                $scope.paylogstatus = 7;
              }
            }
          }
        }
      }).error(function(){

      });
    };
    queryIMPayLog();

    $scope.showagreepay =function(){
      var params = {
        mod: 'nUser',
        func: 'checkUserStatus',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          if(data.data==0){
            sCheckRestMoney();
          }else if(data.data==1){
            UtilService.showMess("账号已被冻结，暂不能付款");
          }
        }else{
          UtilService.showMess(data.msg);
        }
      })
    };

    var sCheckRestMoney = function () {
      var params = {
        mod: 'nUser',
        func: 'checkRestMoney',
        userid: $scope.user.id,
        data:{paymoney:$scope.impaylog.impaylog.money}
      };
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          if(data.data.pm_status == '0'){
            UtilService.showMess("账户余额不足");
          }else {
            $scope.showqian = $scope.impaylog.impaylog.money.toFixed(2);
            $scope.maskshow = true;
            $scope.setpwdPop = true;
          }
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后重试");
      })
    };

    $scope.updateIMPayLog = function (status) {
      var params = {
        mod: 'IM',
        func: 'updateIMPayLogStatus',
        userid: $scope.user.id,
        data:{paylogid: paylogid,
          status:status,
          type:$scope.impaylog.impaylog.type,
          paymoney:$scope.impaylog.impaylog.money
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          if(status == '1'){
            if($scope.impaylog.suserInfo.position == '1'&&$scope.impaylog.impaylog.type==0){
              $scope.paylogstatus = 5;
            }else if($scope.impaylog.suserInfo.position == '0'&&$scope.impaylog.impaylog.type==0){
              $scope.paylogstatus = 4;
            }else if($scope.impaylog.suserInfo.position == '1'&&$scope.impaylog.impaylog.type==1){
              $scope.paylogstatus = 4;
            }else if($scope.impaylog.suserInfo.position == '0'&&$scope.impaylog.impaylog.type==1){
              $scope.paylogstatus = 5;
            }
          }else if(status == '2'){
            $scope.paylogstatus = 6;
          }
          $scope.payload = false;
          $scope.paysucc = true;
          $timeout(function () {
            $scope.showpayload = false;
            $scope.paysucc = false;
          },500);
          $scope.showbtn = false;
        } else {
            if(data.status == '150001' && $scope.impaylog.suserInfo.position == '0'&&$scope.impaylog.impaylog.type==0) {
                UtilService.showMess("不是好友关系，无法进行付款");
                $scope.showpayload = false;
            } else if(data.status == '150001' && $scope.impaylog.suserInfo.position == '0'&&$scope.impaylog.impaylog.type==1) {
                UtilService.showMess("不是好友关系，无法进行收款");
            }
        }
      }).error(function () {
        $scope.showpayload = false;
        $scope.payload = false;
        $scope.paysucc = false;
        UtilService.showMess("网络不给力，请稍后重试");
      })
    };

    $scope.checkPayMoneyAccount = function () {
      if(UtilService.idDefine($scope.pay.passward)){
        var passward = $scope.pay.passward+'';
        var paypwdlen = passward.length;
        for(var i=0;i<paypwdlen;i++){
          // $scope.paylist[i].title = ".";
        }
        for(var i=5;i>=paypwdlen;i--){
          // $scope.paylist[i].title = "";
        }
        if(passward.length>=6){
          checkPayPwd($scope.impaylog.impaylog.money);
        }
      }else{
        // $scope.paylist[0].title = "";
      }
    };

    /* //支付密码输入
     var inputBox = $(".detailpaypwd .password input[type='number']");
     var pwdBox = $(".detailpaypwd .password");
     inputBox.focus(function(){
     $scope.stopd = $interval(pwdEnter,200);
     })
     function pwdEnter(){
     var inputLen = inputBox.val().length;
     $(".detailpaypwd .password input[type='password']").val('');
     for(var i= 1;i<=inputLen;i++){
     pwdBox.children().eq(i).val('0');
     }
     if(inputLen >= 6){
     $interval.cancel($scope.stopd);
     checkPayPwd($scope.impaylog.impaylog.money);
     }
     }*/


    $scope.showpayload = false;
    $scope.payload = false;
    $scope.paysucc = false;
    //检查支付密码 剩余金额
    var checkPayPwd = function (paymoney) {
      if(!UtilService.isPayPwd($scope.pay.passward)){
        UtilService.showMess("请输入6位数字支付密码");
        $scope.pay.passward = "";
        // $scope.paylist = angular.copy(paylist_bf);
        return;
      }

      var paypwd =  hex_md5($scope.pay.passward.toString());
      var params = {
        mod: 'nUser',
        func: 'checkPayPwd',
        userid: $scope.user.id,
        data:{paypwd:paypwd,paymoney:paymoney}
      };
      UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function(data){
        token = data.token;
        if(data.status == '000000'){
          var pm_status = data.data.pm_status;
          if(angular.isDefined(pm_status) && pm_status == '0'){
            UtilService.showMess("账户余额不足");
          }else {
            if(pm_status == '1'){
              UtilService.showMess("支付密码保存成功");
            }
            $scope.showpayload = true;
            $scope.payload = true;
            $scope.updateIMPayLog('1');
            $scope.showbtn = false;
          }
          $scope.pay = {};
          // $scope.paylist = angular.copy(paylist_bf);
          $scope.maskshow = false;
          $scope.setpwdPop = false;
          cordova.plugins.Keyboard.close();
          $(".footInforBox .icon").removeClass("current");
        }else if(data.status == '100304'){
          UtilService.showMess("支付密码错误");
          $scope.pay.passward = "";
          // $scope.paylist = angular.copy(paylist_bf);
        }
      }).error(function () {
        $scope.pay.passward = "";
        // $scope.paylist = angular.copy(paylist_bf);
        UtilService.showMess("网络不给力，请稍后重试");
      })
    };

    var fgtpsw;
    $scope.fgtpswalert = function() {
      fgtpsw = $ionicPopup.show({
        title: '如您忘记密码，请直接联系<br />客服<span class="coler007a">400-0505-811</span>',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive'
          } ,
          {
            text: '<span style="color: #007aff">联系客服</span>',
            onTap:function(){
              window.open("tel:400-0505-811");
            }
          }
        ]
      });
    };


    $scope.pswinfo = '';
    $scope.enterpsw = function(num){
      if(num!=11){
        if($scope.pswinfo.length<6){
          $scope.pswinfo=$scope.pswinfo+num;
        }
      }else{
        $scope.pswinfo = $scope.pswinfo.substring(0,$scope.pswinfo.length-1);
      }
      if ($scope.pswinfo.length >= 6) {
        $timeout(function () {
          $scope.pay.passward=$scope.pswinfo;
          $scope.checkPayMoneyAccount();
          $scope.pswinfo="";
        },200);
      }
    };
    //隐藏弹窗
    $scope.cancelPopAccount = function(){
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
      $scope.setpwdPop = false;
      $scope.maskshow = false;
      $scope.shoukuanPop = false;
      $scope.pay = {};
      $scope.pswinfo="";
      // $scope.paylist = angular.copy(paylist_bf);
    };

    //忘记支付密码
    $scope.forgetPwdAccount = function(){
      $scope.fgtpswalert();
    };

    $scope.hidePayPwdAccount = function () {
      fgtpsw.close();
    };

    $scope.showTelAccount = function () {
      window.open("tel:400-0505-811");
    }

  });
