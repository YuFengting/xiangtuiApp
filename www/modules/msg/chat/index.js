angular.module('xtui')
  //聊天详情页
  .directive('resizeFootBar', ['$ionicScrollDelegate', function ($ionicScrollDelegate) {
    // Runs during compile
    return {
      replace: false,
      link: function (scope, iElm, iAttrs, controller) {
        scope.$on("taResize", function (e, ta) {
          if (!ta) return;
          var contentName = iAttrs.ioncontentname;
          var scroll = document.body.querySelector("#"+contentName);
          var scrollBar = $ionicScrollDelegate.$getByHandle(contentName);
          // console.log(scroll);
          var taHeight = ta[0].offsetHeight;
          var newFooterHeight = taHeight + 24;
          newFooterHeight = (newFooterHeight > 78) ? newFooterHeight : 78;
          iElm[0].style.height = newFooterHeight + 'px';
          scroll.style.bottom = newFooterHeight + 'px';

          //scope.hasmsgfootersty = {
          //  'bottom':newFooterHeight + 'px'
          //}
          scrollBar.scrollBottom();
        });
      }
    };
  }])
  .controller('msgdetailController', function ($ionicModal, StorageService, MsgService, $timeout, $interval, IMSqliteUtilService, $scope, $rootScope, $ionicSlideBoxDelegate, $ionicActionSheet, ConfigService, UserService, $timeout, $ionicScrollDelegate, StorageService, $ionicPopup, $cordovaImagePicker, UtilService, $stateParams, CustomerService, $state, BlackService, CustomerSubmitService, $window) {
      $scope.attr_id = "_"+$stateParams.imgroupid;

      $scope.$on('$ionicView.beforeEnter', function() {
          //清除该imgroup在会话首页的未读角标
          MsgService.clearUnread($stateParams.imgroupid);
          if(UtilService.goStatus[$state.current.name] != undefined) {
              $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(false);
              delete UtilService.goStatus[$state.current.name];
          }
          queryNew();
          intervalTask = $interval(function(){
              queryNew();
          }, ConfigService.queryGap);

          $scope.message = "";
          $scope.morebtn = true;
          $scope.sendbtn = false;
          $scope.businessistmp=$stateParams.istmp;
          $scope.contentBoxName = "businesschat";
      });

      $scope.$on("$ionicView.beforeLeave", function () {
          $scope.getmoney2.hide();
          $scope.paymoney2.hide();
          if(intervalTask != null) {
              $interval.cancel(intervalTask);
              intervalTask = null;
          }
      });

      var chatlogids = {};
    //付款新开页

    //任务modal】
    //收款
    // $ionicModal.fromTemplateUrl('getmoney2.html', {
    $ionicModal.fromTemplateUrl('modules/msg/chat/modal/getmoney2.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getmoney2) {
      $scope.getmoney2 = getmoney2;
    });
    $scope.opengetmoneytaskModal = function() {
        //先检查会话状态
        MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (data) {
            if(data.status == "000000") {
                $scope.getmoney2.show();
                $timeout(function () {
                    $scope.startfun();
                    $scope.allHide();
                },0);
            } else if(data.status == "150001") {
                UtilService.showMess("不是该商家的云销售，无法进行收款");
            } else {
                UtilService.showMess(data.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });
    };
    $scope.closegetmoneytaskModal = function() {
      $scope.getmoney2.hide();
    };

    //任务modal
    //付款款
    // $ionicModal.fromTemplateUrl('paymoney2.html', {
    $ionicModal.fromTemplateUrl('modules/msg/chat/modal/paymoney2.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(paymoney2) {
      $scope.paymoney2 = paymoney2;
    });
    $scope.opentaskModal = function() {
    };
    $scope.closetaskModal = function() {
      $scope.paymoney2.hide();
    };

    //任务modal
    //申请佣金
    $ionicModal.fromTemplateUrl('getbusmoney2.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getbusmoney2) {
      $scope.getbusmoney2 = getbusmoney2;
    });
    $scope.opengetbusmoneytaskModal = function() {
      $scope.getbusmoney2.show();
    };
    $scope.closegetbusmoneytaskModal = function() {
      $scope.closekeyboardcopy();
      $scope.getbusmoney2.hide();
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
        $timeout(function () {
          $scope.pay.passward=$scope.pswinfo;
          $scope.checkPayMoney();
          $scope.pswinfo="";
        },200)
        //$scope.paypopup.hide();
      }
    };

    $scope.applyCloudSaler = function () {
        //跳转到申请云销售页面
        $scope.go('apply',{merchantid:$stateParams.otheruserid});
    };

    $scope.gobusiness = function () {
        $scope.openHome("b", $stateParams.otheruserid);
    };

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
                UtilService.showMess("不是该商家的云销售，无法进行付款");
                $scope.showpayload = false;
            } else {
                UtilService.showMess(checkData.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });

    }

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
    $scope.hidefgtPwd=function(){
    }

    $scope.linkservice=function(){
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
            onTap:function(e){
              window.open("tel:400-0505-811");
            }
          }
        ]
      });
    };

    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.message = "";
    $scope.contenttype = "";
    $scope.content = "";
    $scope.taskid = "";
    $scope.taskname = "";
    $scope.showimg = false;
    $scope.showbase64 = false;
    $rootScope.chatLargeImgShow = false;
    $scope.formdata = {};
    $scope.chatleadshoukuan = {};
    $scope.pay = {};
    $scope.showpaypwd = false;
    $scope.showsurelead = false;
    $scope.taskbean = {};
    var paylist_bf = [{"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}];
    // $scope.paylist = [{"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}, {"title": ""}];
    var token = "";
    var otheruserid = $stateParams.otheruserid;
    var imgroupid = $stateParams.imgroupid;
    $scope.businessistmp=$stateParams.istmp;
    //var otheruserid = "5645a5c6e4b0bccfb4f7efaa";
    $scope.otherusername = $stateParams.otherusername;
    $scope.avate = $stateParams.avate;
    if($scope.businessistmp==1){
      var newDate = new Date();
      var FomatorString = "YYYY/MM/DD HH:MI:SS";
      $scope.businessistmptime=UtilService.DatetoString(newDate, FomatorString);
    }
    var intervalTask = null;
    var onMessage = function (data) {
      var customContent = angular.fromJson(data.customContent);
      if ($state.current.name == "msgdetail" && imgroupid == customContent.imgroupid) {
        if (ConfigService.imtimeout > 0) {
          //使用了定时刷新，则刷新
          if ($scope.userchatlist && $scope.userchatlist.length > 0) {
            var gtid = null;
            if ($scope.userchatlist && $scope.userchatlist.length > 0) {
              gtid = $scope.userchatlist[$scope.userchatlist.length - 1].id;
            }
            var params = {
              mod: 'IM',
              func: 'queryChatLog',
              userid: $scope.user.id,
              data: {
                imgroupid: imgroupid,
                gtid: gtid
              }
            };
            UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
              token = data.token;
              if (data.status == "000000") {
                if (data.data && data.data.length > 0) {
                  $scope.userchatlist = $scope.userchatlist.concat(data.data);
                  //开启页面滚动条到底部

                  $ionicScrollDelegate.$getByHandle('businesschat').resize();
                  $timeout(function () {
                    $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
                  },200)
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
            data: {
              imgroupid: imgroupid,
              logid: customContent.chatlogid
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
            token = data.token;
            if (data.status == "000000") {
              $scope.userchatlist[$scope.userchatlist.length] = data.data[0];
            } else {
              UtilService.showMess(data.msg);
            }
            //开启页面滚动条到底部
            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('businesschat').resize();
              $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
            }, 0)
          }).error(function () {
            UtilService.showMess("网络不给力，请稍后刷新");
          });
        }

      }
    };

    //$scope.unReadMsg = true;
    $scope.voiceImgRight=true;
    $scope.voiceImgLeft=true;
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

    $scope.voiceBox = function() {
      $scope.isFuncShow = false;
      $scope.isEmojiShow = false;
      $scope.voiceBus = 'block';
      $scope.contentStyle = {'margin-bottom': '0px'};
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height','78px');
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('businesschat').resize();
        $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom()
      }, 100);
      if ($scope.isInputShow) {
        $scope.isInputShow = false;
        $scope.sendbtn = false;
        $scope.morebtn = true;
      } else if ($scope.message == "") {
        $scope.isInputShow = true;
        $(".footInforBox").css('height',getInputH+'px');
        $scope.contentStyle = {'bottom': getInputH + 'px'};
        $timeout(function () {
          $('#inputBox'+$scope.attr_id).focus();
        },0);
      } else {
        $scope.isInputShow = true;
        $(".footInforBox").css('height',getInputH+'px');
        $scope.contentStyle = {'bottom': getInputH + 'px'};
        $timeout(function () {
          $('#inputBox'+$scope.attr_id).focus();
        },0);
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

    $scope.stopFun = function (e) {
      e.preventDefault();
    }

    $scope.copycontent = function (copyurl) {
      cordova.plugins.clipboard.copy(copyurl);
      UtilService.showMess("已复制");
    }

    //跳转内部连接
    $scope.showcontentinapp = function (event) {
      UtilService.showcontentinapputil(event);
    }

    var kbOpen = false;
    function onKbOpen(e) {
      kbOpen = true;
      getInput.selectionStart = getInput.textLength;
      $scope.isEmojiShow = false;
      $scope.isFuncShow = false;
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform == "Android") {
        $scope.contentStyle = {'margin-bottom': '0px','bottom':getH+'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom()
        }, 100);
      } else {
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.footStyle = {'bottom': numpercent + 'px'};
        $scope.contentStyle = {'margin-bottom': numpercent + 'px','bottom':getH + 'px'};
        $scope.msgpopupsty = {"top": '40%', 'margin-top': '-350px'};
        /*$('.msg_s_popup').css({'top': '40%'});
         $('.msg_m_popup').css({'top': '40%'});
         $('.fillinfo').css({'top': '30%'});*/
        $timeout(function () {

          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom()
        }, 100);
      }
    }

    function onKbClose(e) {
      kbOpen = false;
      startPos = getInput.selectionStart;
      endPos = getInput.selectionEnd;
      if (device.platform == "Android") {
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom()
        }, 100);
      } else {

        var getH = parseInt($(".footInforBox").css('height'))-2;
        $scope.msgpopupsty = {"top": '50%', 'margin-top': '-350px'};
        $scope.footStyle = {'bottom': '0px'};
        $scope.contentStyle = {'bottom':getH+'px'};
        /*$('.message-foot').css({'bottom': 0});
         $('.has-msgfooter').css({'bottom': 76 + 'px'});*/
        /*$('.msg_s_popup').css({'top': '50%'});
         $('.msg_m_popup').css({'top': '50%'});
         $('.fillinfo').css({'top': '50%'});*/
        $timeout(function () {

          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom()
        }, 100);
      }
    }

    $scope.$on('$ionicView.unloaded', function () {
      $interval.cancel(intervalTask);
      //取消监听推送消息
      if (window.location.href.substring(0, 4) == "file") {
        //$window.xgpush.un("message",onMessage);
        ConfigService.currentIMgrpid = "";

        window.removeEventListener('native.keyboardshow', onKbOpen);
        window.removeEventListener('native.keyboardhide', onKbClose);
      }

      if (timeoutTask != null) {
        $timeout.cancel(timeoutTask);
      }
    });

    $scope.textareafocus = function () {
      if (device.platform != "Android") {
        $timeout(function () {
          $('.fillinfo').css({'top': '22%'});
        }, 400);
      }
    }

    //定时刷新相关
    var timeoutTask = null;
    var queryNewChat = function () {
      var gtid = null;
      if ($scope.userchatlist && $scope.userchatlist.length > 0) {
        gtid = $scope.userchatlist[$scope.userchatlist.length - 1].id;
      }
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data: {
          imgroupid: imgroupid,
          gtid: gtid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          if (data.data && data.data.length > 0) {
            $scope.userchatlist = $scope.userchatlist.concat(data.data);
            //开启页面滚动条到底部

            $timeout(function () {

              $ionicScrollDelegate.$getByHandle('businesschat').resize();
              $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
            }, 100)
          }
        }
      }).error(function () {

      }).finally(function () {
        resetTimeoutTask();
      });
    };
    var resetTimeoutTask = function () {
      if (timeoutTask != null) {
        $timeout.cancel(timeoutTask);
      }

      if (ConfigService.imtimeout > 0) {
        timeoutTask = $timeout(function () {
          queryNewChat();
        }, ConfigService.imtimeout);
      }
    };

    if (ConfigService.imtimeout > 0) {
      timeoutTask = $timeout(function () {
        queryNewChat();
      }, ConfigService.imtimeout);
    }


    $scope.openHome = function (usertype, senderid) {
      if (usertype == "b") {
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
            $scope.go('business', {merchantid: senderid});
          }
        });
      } else {
        $scope.go('shome', {suserid: senderid});
      }
    };

    //对推送消息的处理
    /*
     if(window.location.href.substring(0,4) == "file") {
     $window.xgpush.on("message",function(data){
     var customContent = angular.fromJson(data.customContent);
     if($state.current.name == "permsgdetail" && $state.params.imgroupid == customContent.imgroupid) {
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
     $scope.userchatlist = $scope.userchatlist.concat(data.data);
     }
     //开启页面滚动条到底部
     $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom();
     }).error(function(){

     });
     }
     });
     }
     */

    var ltid = null;
    var gtid = null;
    //该方法返回若干条最新的消息，有可能包括已读的消息
    var queryChatLog = function () {
      var option = {
        imgroupid: imgroupid,
        limit: 10
      };
      MsgService.queryChatlogFromSqlite(option).then(function (res) {
        if (res && res.length > 0) {
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

          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
        }, 1000)
      }, function () {
        //alert("error");
      });
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
       $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
       },0)
       }).error(function(){

       }).finally(function(){
       resetTimeoutTask();
       });
       */
    }
    //queryChatLog();


    //下拉调用
    $scope.queryOld = function () {
      if (ltid) {
        var option = {
          imgroupid: imgroupid,
          ltid: ltid,
          limit: 10
        };
        MsgService.queryChatlogFromSqlite(option).then(function (res) {
          if (res && res.length > 0) {
            ltid = res[0].id;
            $scope.userchatlist = res.concat($scope.userchatlist);

            if (gtid == null) {
              gtid = res[res.length - 1].id;
            }

            for(var i=res.length-1;i>=0;i--) {
              if(!$scope.avateAnaName[res[i].senderid]) {
                $scope.avateAnaName[res[i].senderid] = {name:res[i].name, avate:res[i].avate};
              }
            }
          }
        }, function () {
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
    var queryNew = function () {
      if (ConfigService.pause == true) {
        return;
      }

      if (gtid) {
        var option = {
          imgroupid: imgroupid,
          gtid: gtid
        };
        MsgService.queryChatlogFromSqlite(option).then(function (res) {
          if (res && res.length > 0) {
            //遍历列表，隐藏发送成功的
            /*
             if ($scope.userchatlist && $scope.userchatlist.length > 0) {
             for (var i = 0; i < $scope.userchatlist.length; i++) {
             if ($scope.userchatlist[i].sendstatus == 3) {
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

              $ionicScrollDelegate.$getByHandle('businesschat').resize();
              $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
            }, 200)

            if (ltid == null) {
              ltid = res[0].id;
            }
          }
        }, function () {
        });
      } else {
        //当没有gtid时，调用queryChatLog
        queryChatLog();
      }
    };

    if (imgroupid == null) {
      var params = {
        mod: 'IM',
        func: 'queryIMGrpInfo',
        userid: $scope.user.id,
        data: {friendid: $stateParams.otheruserid}
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          imgroupid = data.data;
          ConfigService.currentIMgrpid = imgroupid;//推送通知需要这一行
          queryChatLog();
        } else if(data.status=="500001"){
          UtilService.showMess("该商家已解除和您的云销售关系，您可再次申请");
        }else{
          UtilService.showMess(data.msg);
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    } else {
      ConfigService.currentIMgrpid = imgroupid;//推送通知需要这一行
      //queryChatLog();
    }

    // queryNew();
    // intervalTask = $interval(function () {
    //   queryNew();
    // }, ConfigService.queryGap);


    //监听推送消息
    if (window.location.href.substring(0, 4) == "file") {
      //$window.xgpush.on("message",onMessage);
      window.addEventListener('native.keyboardshow', onKbOpen);
      window.addEventListener('native.keyboardhide', onKbClose);
    }
    $scope.startfun();
    $('.message-foot').show();


    //该方法返回若干条未读消息
    var queryUnreadChatLog = function () {
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data: {
          imgroupid: imgroupid,
          //otheruserid:otheruserid,//好友userid
          gtid: $scope.userchatlist[$scope.userchatlist.length - 1].id //greater than id
        },
        page: {
          pageSize: 4
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          $scope.userchatlist = $scope.userchatlist.concat(data.data);
        }
        //开启页面滚动条到底部
        $timeout(function () {

          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
        }, 100)
      }).error(function () {

      });
    };

    $scope.back = function () {
      if (kbOpen == true) {
        cordova.plugins.Keyboard.close();
        var tmp = function () {
          window.removeEventListener('native.keyboardhide', tmp);
          $scope.goback();
        };
        window.addEventListener('native.keyboardhide', tmp);
      } else {
        $scope.goback();
      }
    }

    $scope.goTop = function () {
      $ionicScrollDelegate.$getByHandle('businesschat').scrollTop();
    };

    var isLoadingChatLog = false;
    $scope.loadChatLog = function () {
      if (isLoadingChatLog == true) {
        return;
      }
      isLoadingChatLog = true;
      //var len = $scope.userchatlist.length -1;
      var receiveid = $scope.userchatlist[0].id;
      var params = {
        mod: 'IM',
        func: 'queryChatLog',
        userid: $scope.user.id,
        data: {
          imgroupid: imgroupid,//
          //otheruserid:otheruserid,//好友userid
          ltid: receiveid
        },
        page: {
          pageSize: 10
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          var templist = data.data.concat($scope.userchatlist);
          $scope.userchatlist = templist;

        }
        //开启页面滚动条到底部
        //$ionicScrollDelegate.$getByHandle('businesschat').scrollTop();
      }).error(function () {
      }).finally(function () {
        isLoadingChatLog = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.resend = function (index) {
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
      var chatlen;
      //判断发送消息的类型
      if (contenttype == '0') {
        if ($scope.message == "") {
          UtilService.showMess("您未输入任何消息(含全空格)，请输入");
          return;
        }
        $scope.content = $scope.message;
      } else if (contenttype == '1') {
        $scope.content = $scope.image;
      } else if (contenttype == '5') {
        $scope.content = $scope.locationImgUrl;
      } else if (contenttype == '4') {
        $scope.content = $scope.voicePath;
      }

      if (!$scope.userchatlist) {
        $scope.userchatlist = [];
      }
      var myDate = new Date();
      var sec = myDate.getSeconds();
      if (sec < 10) {
        sec = "0" + sec;
      }
      var min = myDate.getMinutes();
      if (min < 10) {
        min = "0" + min;
      }
      var hour = myDate.getHours();
      if (hour < 10) {
        hour = "0" + hour;
      }
      var inittime = hour + ":" + min + ":" + sec;
      var mychat = {
        name: $scope.user.nick,
        avate: $scope.user.avate,
        imgroupid: imgroupid,
        position: "1",
        contenttype: contenttype,
        senderid: $scope.user.id,
        content: $scope.content,
        status: 0,
        sendstatus: "1", //发送状态：0 成功 1 发送中 2 发送失败
        imgtype: "1",
        inittime: inittime,
        audiolength: $scope.audiolength
      }

      //if(contenttype == 1) {
      //  mychat.content = $scope.localimage;
      //}

      $scope.userchatlist.push(mychat);
      if (angular.isUndefined($scope.userchatlist.length)) {
        chatlen = 0;
      } else {
        chatlen = $scope.userchatlist.length - 1;
      }
      //回滚到消息底部
      $timeout(function () {

        $ionicScrollDelegate.$getByHandle('businesschat').resize();
        $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
      }, 100)


      if (contenttype == 1) {
        //先上传图片
        var uploadPic = function (urls) {
          UtilService.uploadPictures(urls).then(function (res) {
            if (res && res.length > 0) {
              var params = {
                mod: 'IM',
                func: 'sendMsg',
                userid: $scope.user.id,
                data: {
                  imgroupid: imgroupid,
                  receiverid: otheruserid,//好友userid
                  senderid: $scope.user.id,
                  content: res[0],
                  contenttype: contenttype,
                  audiolength: $scope.audiolength
                }
              };
              UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
                token = data.token;
                if (data.status == '000000') {
                  $scope.userchatlist[chatlen].sendstatus = 0;
                  $scope.userchatlist[chatlen].id = data.data;
                  chatlogids[data.data] = 1;
                  //queryChatLog();
                } else if (data.status == '150001') {
                  //已不是好友
                  $scope.userchatlist[chatlen].sendstatus = 2;
                  // UtilService.showMess("你们不是好友，无法聊天。");
                  // MsgService.deleteChatfirst(imgroupid);
                  // $scope.go("tab.msg");
                  var id = gtid ? gtid + new Date().getTime() : "0" + new Date().getTime();
                  chatlogids[id] = 1;
                  var tipMsg = {
                    id: id,
                    name: $scope.user.nick,
                    avate: $scope.user.avate,
                    imgroupid: imgroupid,
                    position: "1",
                    contenttype: -999,
                    senderid: $scope.user.id,
                    content: "",
                    status: 0,
                    sendstatus: "0",
                    imgtype: "1"
                  };
                  $scope.userchatlist.push(tipMsg);
                  IMSqliteUtilService.insertImObject("chat", [tipMsg]);
                } else {
                  if (contenttype == '4') {
                    $scope.userchatlist[chatlen].sendstatus = 4;
                    UtilService.showMess("网络不给力，请稍后再试");
                  } else {
                    $scope.userchatlist[chatlen].sendstatus = 2;
                  }
                }

              }).error(function () {
                if (contenttype == '4') {
                  $scope.userchatlist[chatlen].sendstatus = 4;
                  UtilService.showMess("网络不给力，请稍后再试");
                } else {
                  $scope.userchatlist[chatlen].sendstatus = 2;
                }
              })
            } else {
              $scope.userchatlist[chatlen].sendstatus = 2;
              UtilService.showMess("上传图片失败");
            }
          }, function () {
            $scope.userchatlist[chatlen].sendstatus = 2;
            UtilService.showMess("上传图片失败");
          });
        };

        if (device.platform == "Android") {
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
          data: {
            imgroupid: imgroupid,
            receiverid: otheruserid,//好友userid
            senderid: $scope.user.id,
            content: $scope.content,
            contenttype: contenttype,
            audiolength: $scope.audiolength
          }
        };
        UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
          token = data.token;
          if (data.status == '000000') {
            $scope.userchatlist[chatlen].sendstatus = 0;
            $scope.userchatlist[chatlen].id = data.data;
            chatlogids[data.data] = 1;
            //queryChatLog();
          } else if (data.status == '150001') {
            //已不是好友
            $scope.userchatlist[chatlen].sendstatus = 2;
            // UtilService.showMess("你们不是好友，无法聊天。");
            // MsgService.deleteChatfirst(imgroupid);
            // $scope.go("tab.msg");
            var id = gtid ? gtid + new Date().getTime() : "0" + new Date().getTime();
            chatlogids[id] = 1;
            var tipMsg = {
              id: id,
              name: $scope.user.nick,
              avate: $scope.user.avate,
              imgroupid: imgroupid,
              position: "1",
              contenttype: -999,
              senderid: $scope.user.id,
              content: "",
              status: 0,
              sendstatus: "0",
              imgtype: "1"
            };
            $scope.userchatlist.push(tipMsg);
            IMSqliteUtilService.insertImObject("chat", [tipMsg]);
          } else {
            if (contenttype == '4') {
              $scope.userchatlist[chatlen].sendstatus = 4;
              UtilService.showMess("网络不给力，请稍后再试");
            } else {
              $scope.userchatlist[chatlen].sendstatus = 2;
            }
          }

        }).error(function () {
          if (contenttype == '4') {
            $scope.userchatlist[chatlen].sendstatus = 4;
            UtilService.showMess("网络不给力，请稍后再试");
          } else {
            $scope.userchatlist[chatlen].sendstatus = 2;
          }
        })
      }

      /*
       var params = {
       mod: 'IM',
       func: 'sendMsg',
       userid: $scope.user.id,
       data: {
       imgroupid: imgroupid,
       receiverid: otheruserid,//好友userid
       senderid: $scope.user.id,
       content: $scope.content,
       contenttype: contenttype,
       audiolength:$scope.audiolength
       }
       };
       UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
       token = data.token;
       if (data.status == '000000') {
       $scope.userchatlist[chatlen].sendstatus = 0;
       $scope.userchatlist[chatlen].id = data.data;
       chatlogids[data.data] = 1;
       } else if(data.status == '150001'){
       //已不是好友
       UtilService.showMess("你不是该商家的云销售，无法聊天。");
       MsgService.deleteChatfirst(imgroupid);
       $scope.go("tab.msg");
       }  else {
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
       */
      $scope.message = "";

    }


    $scope.repeatSendMsg = function (index, contenttype) {
      var confirmPopup = $ionicPopup.confirm({
        title: '重发该消息？', // String. 弹窗标题。
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '重发', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      confirmPopup.then(function (res) {
        if (res) {
          //$scope.sendMessage($scope.contenttype,"repeat",index);
          if (contenttype == 9 || contenttype == 10) {
            if ($scope.userchatlist[index].content == null || $scope.userchatlist[index].content == "" || angular.isUndefined($scope.userchatlist[index].content)) {
              insertIMPaylog(contenttype, 'repeat', index);
            } else {
              sendPayMessage(contenttype, index, $scope.userchatlist[index].content);
            }
          } else {
            $scope.resend(index);
          }
        } else {
        }
      });
    };

    var sendPayMessage = function (contenttype, pay_len, paylogid) {
      var params = {
        mod: 'IM',
        func: 'sendMsg',
        userid: $scope.user.id,
        data: {
          imgroupid: imgroupid,
          receiverid: otheruserid,//好友userid
          senderid: $scope.user.id,
          content: paylogid,
          contenttype: contenttype
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          $scope.payload = false;
          $scope.paysucc = true;
          $timeout(function () {
            $scope.showpayload = false;
            $scope.paysucc = false;
            $scope.getmoney2.hide();
            $scope.paymoney2.hide();
            getmoneyflg = 0;
          },500);
          $scope.userchatlist[pay_len].sendstatus = 0;
          $scope.userchatlist[pay_len].id = data.data;
          chatlogids[data.data] = 1;
        } else {
          $scope.userchatlist[pay_len].sendstatus = 2;
        }
      }).error(function () {
        $scope.showpayload = false;
        $scope.payload = false;
        $scope.paysucc = true;
        $scope.userchatlist[pay_len].sendstatus = 2;
      })
    }

    var insertIMPaylog = function (contenttype, repeat, index) {
      var type;
      var pay_len
      if (repeat != "repeat") {
        var myDate = new Date();
        var sec = myDate.getSeconds();
        if (sec < 10) {
          sec = "0" + sec;
        }
        var min = myDate.getMinutes();
        if (min < 10) {
          min = "0" + min;
        }
        var hour = myDate.getHours();
        if (hour < 10) {
          hour = "0" + hour;
        }
        var inittime = hour + ":" + min + ":" + sec;
        $scope.remark = "";
        $scope.money = 0;
        //判断发送消息的类型
        if (contenttype == '9') {
          $scope.content = "";
          $scope.money = $scope.pay.accmoney;
          $scope.remark = $scope.pay.remark;
          type = 0;
        } else if (contenttype == '10') {
          $scope.content = "";
          $scope.money = $scope.pay.paymoney;
          $scope.remark = $scope.pay.payremark;
          type = 1;
        }
      } else {
        $scope.money = $scope.userchatlist[index].paylog.money;
        $scope.remark = $scope.userchatlist[index].paylog.remark;
        type = $scope.userchatlist[index].paylog.type;
        pay_len = index;
      }
      var params = {
        mod: 'IM',
        func: 'insertIMPaylog',
        userid: $scope.user.id,
        data: {
          receiverid: otheruserid,//好友userid
          senderid: $scope.user.id,
          type: type,
          money: $scope.money,
          remark: $scope.remark
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          $scope.pay.id = data.data;
          $scope.paylog = {
            id: $scope.pay.id,
            money: $scope.money,
            remark: $scope.remark,
            type: type,
            status: 0
          }
          if (!$scope.userchatlist) {
            $scope.userchatlist = [];
          }
          var mychat = {
            name: $scope.user.nick,
            avate: $scope.user.avate,
            imgroupid: imgroupid,
            position: "1",
            type: type,
            contenttype: contenttype,
            senderid: $scope.user.id,
            content: $scope.content,
            paylog: $scope.paylog,
            sendstatus: "1", //发送状态：0 成功 1 发送中 2 发送失败
            inittime: inittime
          }
          $scope.userchatlist.push(mychat);
          pay_len = $scope.userchatlist.length - 1;
          $timeout(function () {
            $ionicScrollDelegate.$getByHandle('businesschat').resize();
            $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
          }, 100)
          sendPayMessage(contenttype, pay_len, $scope.pay.id);
          $scope.pay.payremark = "";
          $scope.payremark = "";
          $timeout(function () {
            getmoneyflg = 0;
          },800);
        } else {
            if(data.status == "150001" && contenttype == "9") {
                UtilService.showMess("不是该商家的云销售，无法进行收款");
            } else if(data.status == "150001" && contenttype == "10") {
                UtilService.showMess("不是该商家的云销售，无法进行付款");
                $scope.showpayload = false;
            } else {
                UtilService.showMess(data.msg);
            }
          getmoneyflg = 0;
        }
        $scope.pay = {};
        // $scope.paylist = angular.copy(paylist_bf);
      }).error(function () {
        $scope.showpayload = false;
        $scope.payload = false;
        $scope.paysucc = false;
        getmoneyflg = 0;
        $scope.pay = {};
        // $scope.paylist = angular.copy(paylist_bf);
        UtilService.showMess("网络不给力，请稍后重试");
      })
    }

    $scope.getPicture = function () {
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
       navigator.camera.getPicture(function (imageData) {
       $scope.$apply(function () {
       $scope.image = imageData;
       $scope.sendMessage('1');
       });
       }, function (message) {

       }, cameraOptions);
       */

      // $timeout(function () {
      //   $scope.allHide();
      // },0)
      UtilService.tongji("chat", {type: 0});
      UtilService.customevent("bchat", "zhaopian");
    };

    $scope.getLocationchat = function () {
      if (!UtilService.checkNetwork()) {
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      BlackService.getLocationImg().then(function (url) {
        $scope.locationImgUrl = url;
        $scope.sendMessage('5');
      }, null);
      // $timeout(function () {
      //   $scope.allHide();
      // },0)
      UtilService.tongji("chat", {type: 1});
      UtilService.customevent("bchat", "dingwei");
    };


    //点击放大效果
    $('.chat_pic').click(function () {
      var url = $(this).attr('src');
      $('.chatpage').append(' <div class="showPic" ><img src=' + url + ' class="big-pic" ></div>');
      var a = $('.big-pic').height() / $('.big-pic').width();
      var sW = window.screen.width;
      var sh = 640 * window.screen.height / window.screen.width;
      if (a < 1) {
        $('.big-pic').css('margin-top', sh / 2 - $('.big-pic').height() / 2 + 'px');
      } else {
        $('.big-pic').css('margin-left', 640 / 2 - $('.big-pic').width() / 2 + 'px')
      }

      $('.showPic').click(function () {

        $('.showPic').remove();

      })
    });


    $('.message-foot').css({'display': 'block !important'});
    //发送按钮
    $scope.sendbtn = false;
    //加号按钮
    $scope.morebtn = true;
    //发送客户弹窗
    $scope.sendcPop = false;
    //收款弹窗
    $scope.shoukuanPop = false;
    //填写客户资料弹窗
    $scope.fillPop = false;
    //任务弹窗
    $scope.taskPop = false;
    //忘记密码
    $scope.forgetPop = false;
    //申请佣金
    $scope.applyPop = false;

    //跳转申请佣金
    $scope.goApplyCommission = function () {
        MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (checkData) {
            if(checkData.status == "000000") {
                $scope.go('applycommission',{'merchantid':otheruserid,'company':$scope.otherusername,'avate':$scope.avate,'imgroupid':imgroupid});
            } else if(checkData.status == "150001") {
                UtilService.showMess("不是该商家的云销售，无法申请佣金");
            } else {
                UtilService.showMess(checkData.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });
    }

    //跳转发送客户
    $scope.goSendClient2 = function () {
        MsgService.checkImgrpStatus($stateParams.imgroupid).then(function (checkData) {
            if(checkData.status == "000000") {
                $scope.go('sendclient2',{'merchantid':otheruserid,'company':$scope.otherusername,'avate':$scope.avate,'imgroupid':imgroupid});
            } else if(checkData.status == "150001") {
                UtilService.showMess("不是该商家的云销售，无法发送客户");
            } else {
                UtilService.showMess(checkData.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });
    }


    $scope.merchantlistandtasknone = false;
    //新增客户
    $scope.toTask1 = function () {
      $scope.fillPop = false;
      $scope.sendcPop = false;
      $scope.taskPop = true;
      $scope.addNew = true;
      var params = {
        mod: 'NStask',
        func: 'getMyMerchantListAndTask',
        userid: $scope.user.id,
        data: {"merchantid": otheruserid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          if (angular.isUndefined(data.data[0]) || data.data[0].length == 0) {
            $scope.merchantlistandtasknone = true;
          } else {
            $scope.merchantlistandtasknone = false;//为空的时候显示
          }
          $timeout(function () {
            $scope.$apply(function () {
              $scope.merchantlistandtask = data.data[0];
            })
          }, 100);
        }
      }).error(function () {
        $scope.merchantlistandtasknone = true;
      });
    }

    //隐藏弹窗
    $scope.cancelPophide = function () {
      $timeout(function () {
        $scope.sendcPop = false;
        $scope.shoukuanPop = false;
        $scope.fillPop = false;
        $scope.taskPop = false;
        $scope.forgetPop = false;
        $scope.applyPop = false;
        $scope.shoukuanyongjingPop = false;
      }, 400);
      $scope.pay = {};
      // $scope.paylist = angular.copy(paylist_bf);
    }

    //隐藏弹窗
    $scope.cancelMaskhide = function (e) {
      $scope.fillPop = false;
      e.preventDefault();
    }



    //提交客户信息
    $scope.subchatlead = function () {
      if (token == "") {
        return;
      }
      var value = [];
      $(".field").each(function () {
        value.push($.trim($(this).val()));
      });

      $scope.formdata.fieldvalue = value.join("|");
      $scope.formdata.taskid = $scope.taskid;
      $scope.formdata.merchantid = otheruserid;
      $scope.formdata.tel = $.trim($scope.formdata.tel);
      if (angular.isUndefined($scope.fieldnames)) {
        $scope.fieldnames = [];
      }
      if (CustomerSubmitService.check($scope.formdata, $scope.fieldnames)) {
        CustomerSubmitService.add($scope.formdata, token).then(function (data) {
          token = data.token;
          if (data.status == "000000") {
            var chatlead = {};
            if (angular.isDefined(data.data.leadidapp) && data.data.leadidapp != "") {
              //$scope.cancelPophide();
              chatlead.id = data.data.leadidapp;
              chatlead.name = $scope.formdata.name;
              chatlead.tel = $scope.formdata.tel;
              chatlead.memo = $scope.formdata.memo;
              chatlead.status = 1;

              var newDate = new Date();
              var FomatorString = "YYYY-MM-DD HH:MI:SS";
              //发给B
              var params = {
                mod: "IM",
                func: "insertIMMessage",
                data: {
                  type: 6,
                  content: chatlead.id,
                  receiverid: otheruserid,
                  subtype: 1
                }
              };
              UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
                token = data.token;
              });

              //发给S
              var params = {
                mod: "IM",
                func: "insertIMMessage",
                data: {
                  type: 6,
                  content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "针对" + $scope.taskname + "的任务提交了一条客户信息，请耐心等待商家审核",
                  receiverid: UserService.user.id
                }
              };
              UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
                token = data.token;
              });


              $scope.shownleadPop(chatlead, '6');
            } else {
              UtilService.showMess("客户信息提交失败");
            }
          } else if (data.status == "120001") {
            UtilService.showMess("该手机号已经被提交");
          } else if (data.status == "500004") {
            UtilService.showMess("请不要重复点击提交按钮");
          } else if (data.status == "130006") {
            UtilService.showMess("您与商家的雇佣关系已经解除");
          } else if (data.status == "103003") {
            UtilService.showMess("任务已经暂停");
          } else if (data.status == "103001") {
            UtilService.showMess("任务已经结束");
          }

        }, function () {
        });
      }
    }

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
        }else if(data.status == '103004'){
          UtilService.showMess("该任务已删除");
        }else if(data.status == '103003'){
          UtilService.showMess("该任务已暂停");
        }else if(data.status == '103001'){
          UtilService.showMess("该任务已结束");
        }else{
          if(data.data.tasktype==0){
            if(data.data.ctask_status==1){
              $scope.go('cpccoudetail', {'taskid': data.data.taskid});
            }else {
              $scope.go('taskdetail', {'taskid': data.data.taskid});
            }
          }else if(data.data.tasktype==1){
            $scope.go('helpselldetail', {'taskid': data.data.taskid});
          }else {
            $scope.go('cpvdetail', {'taskid': data.data.taskid});
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
    //跳转到团长活动
    $scope.gotoTeamheadexamineDetail=function(ngbuyrl){
      $scope.go("teamheadmodel",{taskid:ngbuyrl.taskid,articleid:ngbuyrl.articleid});
    };

    //商品详情
    $scope.gogooddetail=function(product){
      $scope.go('gooddetailc',{goods:product,companyalias:product.alias})
    };


    $scope.resetInp = function (e) {
      var inp = $(e.target).siblings().eq(0);
      inp.val("");
      setTimeout(function () {
        inp.focus();
      }, 1);
    }

    $scope.myfocus = function (e) {
      $(e.target).siblings().eq(0).show();
    }
    $scope.myblur = function (e) {
      $(e.target).siblings().eq(0).hide();
    }

    var checkMobile = function (s) {
      var regu = /^[1][0-9][0-9]{9}$/;
      var re = new RegExp(regu);
      if (re.test(s)) {
        return true;
      } else {
        return false;
      }
    }

    //收款
    $scope.shoukuan = function () {
      if (!UtilService.checkNetwork()) {
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      $scope.shoukuanPop = true;
      $timeout(function () {
        document.getElementById('shoukuanInput_sb').focus();
      }, 200)
      UtilService.tongji("chat", {type: 3});
      UtilService.customevent("bchat", "shoukuan");
    };

    var getmoneyflg = 0;
    $scope.commitMoney = function () {
      if(getmoneyflg != 0){
        return;
      }
      if (angular.isUndefined($scope.pay.accmoney) || $scope.pay.accmoney == null || $scope.pay.accmoney == "") {
        UtilService.showMess("收款金额不能为空");
        return;
      }
      if (!UtilService.isNumber($scope.pay.accmoney)) {
        UtilService.showMess("请输入正确的金额");
        return;
      }
      if (angular.isDefined($scope.pay.remark)) {
        if ($scope.pay.remark.length > 50) {
          UtilService.showMess("收款理由最多50个字");
          return;
        }
      }
      getmoneyflg = 1;
      insertIMPaylog('9');
    }

    //付款
    $scope.payMoney = function () {
      UtilService.customevent("bchat", "fukuan");
      if (!UtilService.checkNetwork()) {
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
                UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                    token = data.token;
                    if (data.status == '000000') {
                        if (data.data == 0) {
                            $scope.paymoney2.show();
                            $timeout(function () {
                                $scope.startfun();
                                $scope.allHide();
                            },0)
                            $timeout(function () {
                                try{
                                    document.getElementById('moneyinput').focus();
                                }catch (e){

                                }
                            }, 200);
                        } else if (data.data == 1) {
                            UtilService.showMess("账号已被冻结，暂不能付款");
                            $scope.payshoukuanPop = false;
                            $scope.paymaskshow = false;
                        }
                    } else {
                        UtilService.showMess(data.msg);
                    }
                })
            } else if(checkData.status == "150001") {
                UtilService.showMess("不是该商家的云销售，无法进行付款");
                $scope.showpayload = false;
            } else {
                UtilService.showMess(checkData.msg);
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍候重试！");
        });

      UtilService.tongji("chat", {type: 4});
    }

    $scope.showpayload = false;
    $scope.payload = false;
    $scope.paysucc = false;
    //检查支付密码 剩余金额
    var checkPayPwd = function (paymoney) {
      if (!UtilService.isPayPwd($scope.pay.passward)) {
        UtilService.showMess("请输入6位数字支付密码");
        $scope.pay.passward = "";
        // $scope.paylist = angular.copy(paylist_bf);
        return;
      }
      var paypwd = hex_md5($scope.pay.passward.toString());
      var params = {
        mod: 'nUser',
        func: 'checkPayPwd',
        userid: $scope.user.id,
        data: {paypwd: paypwd, paymoney: paymoney}
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          if (data.data.pm_status == '0') {
            UtilService.showMess("账户余额不足");
          } else {
            if (data.data.pm_status == '1') {
              UtilService.showMess("支付密码保存成功");
            }
            $scope.showpayload = true;
            $scope.payload = true;
            insertIMPaylog('10', token);
          }
          $scope.pay = {};
          // $scope.paylist = angular.copy(paylist_bf);
          $scope.payshoukuanPop = false;
          $scope.paymaskshow = false;
          cordova.plugins.Keyboard.close();
          $(".footInforBox .icon").removeClass("current");
        } else if (data.status == '100304') {
          UtilService.showMess("支付密码错误");
          $scope.pay.passward = "";
          // $scope.paylist = angular.copy(paylist_bf);
        }
      }).error(function () {
        $scope.pay.passward = "";
        // $scope.paylist = angular.copy(paylist_bf);
        UtilService.showMess("网络不给力，请稍后重试");
      })
    }

    $scope.checkPayMoney = function () {
      if (UtilService.idDefine($scope.pay.passward)) {
        var passward = $scope.pay.passward + '';
        var paypwdlen = passward.length;
        for (var i = 0; i < paypwdlen; i++) {
          // $scope.paylist[i].title = ".";
        }
        //var lenn = 6-paypwdlen;
        for (var i = 5; i >= paypwdlen; i--) {
          // $scope.paylist[i].title = "";
        }
        if (passward.length >= 6) {
          checkPayPwd($scope.pay.paymoney);
        }
      } else {
        // $scope.paylist[0].title = "";
      }
    }

    //支付密码输入
    /*var inputBox = $(".paypassword .password input[type='number']");
     var pwdBox = $(".paypassword .password");
     inputBox.focus(function(){
     if(angular.isUndefined($scope.pay.paymoney) || $scope.pay.paymoney == null || $scope.pay.paymoney == ""){
     UtilService.showMess("付款金额不能为空");
     //$timeout(function(){document.getElementById('moneyinput').focus();},200)
     return;
     }
     if(!UtilService.isNumber($scope.pay.paymoney)){
     UtilService.showMess("请输入正确的金额,且小数点最多为2位");
     //$timeout(function(){document.getElementById('moneyinput').focus();},200)
     return;
     }
     $scope.stop = $interval(pwdEnter,200);
     })
     function pwdEnter(){
     var inputLen = inputBox.val().length;
     $(".paypassword .password input[type='password']").val('');
     for(var i= 1;i<=inputLen;i++){
     pwdBox.children().eq(i).val('0');
     }
     if(inputLen >= 6){
     $interval.cancel($scope.stop);
     checkPayPwd($scope.pay.paymoney);
     }
     }*/
    $scope.showTel = function () {
      window.open("tel:400-0505-811");
    }

    $scope.goPayLog = function (paylogid) {
      $scope.go('ssaccountdetail', {'paylogid': paylogid, 'otheruserid': otheruserid, usertype: 'b'})
    }

    //客户关联的任务
    $scope.sendEnd = function (task) {
      var params = {
        mod: 'NStask',
        func: 'subCustomByTask',
        userid: UserService.user.id,
        data: {"taskid": task.id, "merchantid": otheruserid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          StorageService.getItem("noshowtip").then(function (obj) {
            if (obj == "1") {
              $scope.shownleads(angular.toJson(task));
            } else {
              $scope.showsurelead = true;
              $scope.taskbeanjson = angular.toJson(task);
            }
          });
        } else if (data.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (data.status == "130006") {
          UtilService.showMess("商家与您已解除雇佣关系");
        } else if (data.status == "103002") {
          UtilService.showMess("任务还未开始");
        } else if (data.status == "103003") {
          UtilService.showMess("任务已暂停");
        } else if (data.status == "103004") {
          UtilService.showMess("任务已删除");
        }
      });
    }

    $scope.shownleads = function (e) {
      var task = null;
      if (typeof(e) == "string") {
        task = angular.fromJson(e);
      } else {
        var taskbeanjson = $(e.target).siblings("div").text();
        if (taskbeanjson == "") {
          return;
        }
        task = angular.fromJson(taskbeanjson);
      }

      $scope.showsurelead = false;
      $scope.fieldnames = task.field;
      $(".field").each(function () {
        $.trim($(this).val(""));
      });

      $scope.taskid = task.id;
      $scope.taskname = task.name;

      if ($scope.addNew) {
        $scope.sendcPop = false;
        $scope.fillPop = true;
        $scope.taskPop = false;
        $timeout(function () {
          document.getElementById('filltext').focus();
        }, 200)
      } else {
        $scope.cancelPophide();
      }
    }

    //不再提醒
    $scope.noshow = function (e) {
      StorageService.setItem("noshowtip", "1").then(function (obj) {
      }, null);
      $scope.shownleads(e);
    }


    //支付密码
    $scope.payPwd = function () {
      /*      $scope.payPop = false;
       $scope.pwdHint = true;*/
    }

    //忘记支付密码
    $scope.forgetPwd = function () {
      $scope.showpaypwd = true;

    }

    $scope.hidePayPwd = function () {
      $timeout(function () {
        $scope.showpaypwd = false;
      }, 400)
    };


    //发送任务
    $scope.sendtask = function () {
      $scope.taskPop = true;
    }

    //发送按钮
    $scope.sendFunc = function () {
      if (angular.isDefined($scope.message) && $scope.message != null && $scope.message != "") {
        $scope.morebtn = false;
        $scope.sendbtn = true;
      } else {
        $scope.morebtn = true;
        $scope.sendbtn = false;
      }
    }

    //发送表情

    $scope.footClass = false;
    $scope.emojiHide = function () {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if ($scope.isEmojiShow || $scope.isFuncShow) {
        $scope.contentStyle = {'bottom': getH+'px'};
      }
      $scope.isFuncShow = false;
      $scope.isEmojiShow = false;
      $scope.footClass = false;
      /* $('.has-msgfooter').css({'margin-bottom': '0px'})
       $('.emojiBox').hide();
       $('.addFunctionBox ').hide();
       //$(".message-foot").removeClass("setBottom");
       $(".footInforBox .icon").removeClass("current");*/
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('businesschat').resize();
        $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
      }, 300)
    }

    $scope.inputFocus = false;
    $scope.isInputShow = true;
    var openEmoji = function () {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      //$('.has-msgfooter').css({'margin-bottom':'300px'})
      // $scope.hasmsgfootersty={'margin-bottom':'300px'};
      $scope.contentStyle = {'margin-bottom': '300px','bottom':getH+'px'};
      $('#inputBox'+$scope.attr_id).blur();
      var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
      $(".footInforBox").css('height',getInputH+'px');
      $ionicScrollDelegate.$getByHandle('businesschat').resize();
      $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
      $scope.isEmojiShow = true;
      $scope.isFuncShow = false;
      $scope.isInputShow = true;
      /*      $(".footInforBox .icon").removeClass("current");
       $(".footInforBox .icon:first").addClass("current");*/
      //$(".addFunctionBox").hide();

      //$scope.isEmojiShow=true;
      //$(".message-foot").addClass("setBottom");
      var myInput = document.getElementById('inputBox'+$scope.attr_id);
      if (myInput == document.activeElement) {
        $timeout(function(){
          //$(".emojiBox").slideDown();
          $scope.isEmojiShow=true;
          $ionicSlideBoxDelegate.update();
        },200)
      } else {
        //$(".emojiBox").show();
        $scope.isEmojiShow=true;
        $ionicSlideBoxDelegate.update();
      }
    };


    /*$scope.emojiBox = function () {
     $('#inputBox').blur();
     $scope.isEmojiShow = true;
     $scope.isFuncShow = false;
     $scope.isInputShow = true;
     $timeout(function(){
     $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
     },0);
     $timeout(function(){
     $scope.contentStyle = {'margin-bottom': '300px'};
     },0);
     /!*$('.has-msgfooter').css({'margin-bottom': '300px'})
     $('#inputBox').blur();
     $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
     $(".footInforBox .icon").removeClass("current");
     $(".footInforBox .icon-smile").addClass("current");
     $(".addFunctionBox").hide();

     $("#inputBox").show();
     $(".voiceTipStart").hide();
     $("#voicePlayIcon").removeClass("icon-voice-keyboard").addClass("icon-voice-play");*!/
     var myInput = document.getElementById('inputBox');
     if (myInput == document.activeElement) {
     $timeout(function () {
     $(".emojiBox").slideDown();
     //$scope.isEmojiShow = true;
     $ionicSlideBoxDelegate.update();
     }, 200)
     } else {
     //$(".emojiBox").show();
     $scope.isEmojiShow = true;
     $ionicSlideBoxDelegate.update();
     }
     }*/

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

    $scope.backspace = function () {
      var getVal = document.getElementById("inputBox"+$scope.attr_id).value;
      var newVal = getVal.replace(/(.|\[[^\]]*?\])$/, '');
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

    $scope.functionBox = function () {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      var openfun = function () {
        if($scope.businessistmp==0){
          $timeout(function(){
            $scope.contentStyle = {'margin-bottom': '300px','bottom':getH+'px'};
          },0);
        }else if($scope.businessistmp==1){
          $timeout(function(){
            $scope.contentStyle = {'margin-bottom': '300px','bottom':getH+'px'};
          },0);
        }
        $('#inputBox'+$scope.attr_id).blur();
        var getInputH =  parseInt($('#inputBox'+$scope.attr_id).css('height'))+24;
        $(".footInforBox").css('height',getInputH+'px');
        $scope.isInputShow = true;
        $scope.isEmojiShow = false;
        $scope.isFuncShow = true;
        $scope.isFuncShow = true;
        $scope.isEmojiShow = false;
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('businesschat').resize();
          $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
        }, 100);
        //$(".voiceTipStart").hide();
        $("#voicePlayIcon"+$scope.attr_id).removeClass("icon-voice-keyboard").addClass("icon-voice-play");
        /*$('.has-msgfooter').css({'margin-bottom': '344px'})
         $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
         $('#inputBox').blur();
         $("#inputBox").show();
         $(".voiceTipStart").hide();
         $("#voicePlayIcon").removeClass("icon-voice-keyboard").addClass("icon-voice-play");
         $(".footInforBox .icon").removeClass("current");
         $(".footInforBox .icon:last").addClass("current");
         $(".emojiBox").hide();*/

        //$(".message-foot").addClass("setBottom");
        var myInput = document.getElementById('inputBox'+$scope.attr_id);
        if (myInput == document.activeElement) {
          $timeout(function () {
            $(".addFunctionBox").slideDown();
          }, 200)
        } else {
          $(".addFunctionBox").show();
        }
      };

      if(kbOpen) {
        var handler = function () {
          window.removeEventListener('native.keyboardhide', handler);
          openfun();
        };
        window.addEventListener('native.keyboardhide', handler);
      } else {
        openfun();
      }
    };

//    $scope.closefoot=function(){
//      if (device.platform != "Android") {
//        cordova.plugins.Keyboard.close();
//      }
//      if($scope.isFuncShow ||  $scope.isEmojiShow){
//        $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);              }
//
//      $scope.isFuncShow=false;
//      $scope.isEmojiShow=false;
//      $scope.contentStyle={'margin-bottom':'0px','bottom':'76px'};
////      $ionicScrollDelegate.$getByHandle('perchat').scrollBottom(true);
//    };

    $scope.allHide = function () {
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
      if ($scope.isEmojiShow || $scope.isFuncShow) {
        $ionicScrollDelegate.$getByHandle('businesschat').resize();
        $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
      }
      $scope.isEmojiShow = false;
      $scope.isFuncShow = false;
      $scope.contentStyle = {'bottom': getH+"px"};

//      $ionicScrollDelegate.$getByHandle('businesschat').scrollBottom(true);
    }

    $scope.changeMeg = function () {
      if (angular.isUndefined($scope.message) || $scope.message == null || $scope.message == "") {
        $scope.morebtn = true;
        $scope.sendbtn = false;
      } else {
        $scope.morebtn = false;
        $scope.sendbtn = true;
      }
    }

    var sheight = window.screen.height;
    /* $('ul.message li').click(function () {
     if (!$(this).hasClass('active')) {
     if ($(this).index() == 0) {
     $('ul.message').children().eq(0).addClass('active');
     $('ul.message').children().eq(0).siblings().removeClass('active');
     $ionicSlideBoxDelegate.$getByHandle('messageSlide').previous()

     $ionicScrollDelegate.$getByHandle('messageScroll').scrollTop(true);
     $('.has-subheader').removeClass('has-footer2');

     } else if ($(this).index() == 1) {

     $('ul.message').children().eq(1).addClass('active');
     $('ul.message').children().eq(1).siblings().removeClass('active');
     $ionicSlideBoxDelegate.$getByHandle('messageSlide').next()

     $timeout(function () {
     $ionicScrollDelegate.$getByHandle('$ionicScrollDelegate').scrollBottom(true);
     $('.has-subheader').addClass('has-footer2');
     $('.talk-foot').show();
     }, 800)
     }
     }
     })*/


    /*$scope.changed = function () {
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

     //$('.talk-foot').hide();

     $('.has-subheader').removeClass('has-footer2');
     }
     }*/

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
      $timeout(function () {
        var a = $('.big-pic').height() / $('.big-pic').width();
        var sW = window.screen.width;
        var sh = 640 * window.screen.height / window.screen.width;
        if (a < window.screen.height / window.screen.width) {
          $scope.bigpicStyle = {'margin-top':sh / 2 - $('.big-pic').height() / 2 + 'px'}
        } else {
          $scope.bigpicStyle = {'margin-left': 640 / 2 - $('.big-pic').width() / 2 + 'px'}
        }
        $('.big-pic').css("opacity",1);
      }, 50)
    }

    $scope.shrinkPic = function () {
      $scope.showimg = false;
      $scope.showbase64 = false;
      $scope.showLocImg = false;
      $rootScope.chatLargeImgShow = false;
    }

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

    var isNumber = function (str) {
      //-3：非数字 -2：非正浮点数 -1：非正整数 0：正整数 1：1-2位小数 2：3位或者以上的小数
      var reg = /^-?[1-9]\d*$/;
      if (reg.test(str)) {
        if (parseInt(str) > 0) {
          return 0;
        } else {
          return -1;
        }

      }
      else {
        var num = 0;
        for (i = 0; i < str.length; i++) {
          if (str.charAt(i) == ".") {
            num++;
          }
        }
        if (num > 2) {
          return -3;
        }


        reg = /^(-?\d+)(\.\d+)?$/;
        if (reg.test(str)) {
          if (parseFloat(str) > 0) {
            str = parseFloat(str) + "";
            reg = /^[0-9]+(.[0-9]{1,2})?$/;
            if (reg.test(str)) {
              return 1;
            } else {
              return 2;
            }
          } else {
            return -2;
          }
        } else {
          return -3;
        }
      }
    }

  })

  //账单详情页
  .controller('accountdController', function ($scope, $state, $stateParams,$ionicSlideBoxDelegate, ConfigService, CustomerService, UtilService, UserService, $timeout,$ionicModal) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    var token;
    $scope.picserver = ConfigService.picserver;
    $scope.nleadsid = $stateParams.nleadsid;
    $scope.formdata1 = {};
    $scope.leadsPayList = [];
    $scope.nleadpay = {};
    $scope.avate = $stateParams.avate;
    $scope.showpic=false;

    //申请佣金
    $ionicModal.fromTemplateUrl('getbusmoney3.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(getbusmoney3) {
      $scope.getbusmoney3 = getbusmoney3;
    });
    $scope.opengetbusmoneytaskModal = function() {
      $scope.getbusmoney3.show();
    };
    $scope.closegetbusmoneytaskModal = function() {
      $scope.getbusmoney3.hide();
    };

    //键盘监听事件
    var kbOpen = false;

    function onKbOpen(e) {
      kbOpen = true;
      if (device.platform == "Android") {
      } else {
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $('.msg_s_popup').css({'top': '40%'});
        $('.msg_m_popup').css({'top': '40%'});
        $('.fillinfo').css({'top': '30%'});
      }
    }

    function onKbClose(e) {
      kbOpen = false;
      if (device.platform == "Android") {
      } else {
        $('.msg_s_popup').css({'top': '50%'});
        $('.msg_m_popup').css({'top': '50%'});
        $('.fillinfo').css({'top': '50%'});
      }
    }

    $scope.$on('$ionicView.unloaded', function () {
      window.removeEventListener('native.keyboardshow', onKbOpen);
      window.removeEventListener('native.keyboardhide', onKbClose);
    });

    window.addEventListener('native.keyboardshow', onKbOpen);
    window.addEventListener('native.keyboardhide', onKbClose);

    var getleadpay = function () {
      var params = {
        mod: 'IM',
        func: 'getHardnLeadsPayByLeadId',
        userid: UserService.user.id,
        data: {"nleadid": $scope.nleadsid}
      }
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        $scope.nleadpay = data.data.nleadpay;
        $scope.haspic =  $scope.nleadpay.pics!=undefined&&$scope.nleadpay.pics!=null&&$scope.nleadpay.pics.length>0;
        CustomerService.getDealingLeadsDetail($scope.nleadpay.leadsid).then(function (data) {
          token = data.token;
          $timeout(function () {
            $scope.$apply(function () {
              $scope.leadsPayList = data.data.leadsPays;
            })
          }, 100);
        }, function (data) {

        }).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      });
    }
    getleadpay();

    /*** 展示申请佣金的窗口*/
    $scope.shoukuanyongjin = function () {
      if ($scope.nleadpay.status == 3) {
        UtilService.showMess("该客户提交信息记录已经结束");
        return;
      }
      if ($scope.nleadpay.status == 1) {
        UtilService.showMess("请联系商家确认接收后再申请佣金");
        return;
      }
      var lead_id = "";
      if (angular.isDefined($scope.nleadpay.leadsid)) {
        lead_id = $scope.nleadpay.leadsid;
      } else {
        lead_id = $scope.nleadsid;
      }
      var params = {
        mod: 'NStask',
        func: 'applyJudgeCommission',
        userid: UserService.user.id,
        data: {"nleadsid": lead_id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          $timeout(function () {
            $scope.getbusmoney3.show();
            //$timeout(function () {
            $scope.startfun();
            //},0)
            document.getElementById('shoukuanInputaccount').focus();
          }, 200);
          $scope.shoukuanPop = true;
        } else if (data.status == "130103") {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else if (data.status == "130104") {
          UtilService.showMess("有等待商家审核的佣金记录");
        } else if (data.status == "130105") {
          UtilService.showMess("该客户提交信息记录已经结束");
          $scope.chatleadshoukuan.status = 3;
        } else if (data.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (data.status == "130006") {
          UtilService.showMess("商家与您已解除雇佣关系");
        }
      });
    }

    $scope.cancelPopaccount = function () {
      $scope.shoukuanPop = false;
      $scope.formdata1 = {};
    }

    /*** 提交佣金*/
    $scope.subchatyongjing = function () {
      if (angular.isUndefined($scope.formdata1.pay) || $scope.formdata1.pay == "" || $scope.formdata1.pay == null) {
        UtilService.showMess("金额不能为空");
        return;
      }
      if (!UtilService.isNumber($scope.formdata1.pay)) {
        UtilService.showMess("请输入正确的金额");
        return;
      }
      if ($scope.nleadpay.rstatus == 1) {
        UtilService.showMess("该客户提交信息记录被冻结");
        return;
      }
      if (angular.isDefined($scope.formdata1.desc) && $scope.formdata1.desc.length > 50) {
        UtilService.showMess("申请理由不能大于50字符");
        return;
      }
      $scope.formdata1.leadsid = $scope.nleadpay.leadsid;
      CustomerService.applymoney($scope.formdata1).then(function (data) {
        token = data.token;
        $scope.cancelPopaccount();
        if (data.status == "000000") {
          var newDate = new Date();
          var FomatorString = "YYYY-MM-DD HH:MI:SS";
          //发给B
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 3,
              content: data.data.nleadspayid,
              receiverid: $scope.nleadpay.buserid,
              subtype: 1
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});

          //发给S
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 3,
              content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "向" + $scope.nleadpay.alias + "申请佣金" + data.data.pay + "元，请耐心等待商家审核",
              receiverid: UserService.user.id
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});

          CustomerService.getDealingLeadsDetail($scope.nleadpay.leadsid).then(function (data) {
            token = data.token;
            $timeout(function () {
              $scope.$apply(function () {
                $scope.leadsPayList = data.data.leadsPays;
              })
            }, 100);
          }, function (data) {
          }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
          });
          var params = {
            mod: 'IM',
            func: 'getHardnLeadsPayByLeadId',
            userid: UserService.user.id,
            data: {"nleadid": $scope.nleadsid}
          }
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
            token = data.token;
            $scope.nleadpay = data.data.nleadpay;
          });
          $scope.getbusmoney3.hide();
          $scope.formdata1 = {};
        } else if (data.status == "130103") {
          UtilService.showMess("该客户提交信息记录被冻结");
        } else if (data.status == "130104") {
          UtilService.showMess("有等待商家审核的佣金记录");
        } else if (data.status == "130105") {
          UtilService.showMess("该客户提交信息记录已经结束");
        } else if (data.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (data.status == "130006") {
          UtilService.showMess("商家与您已解除雇佣关系");
        }
      }, function (data) {

      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.responseCancel = function (id, acc) {
      CustomerService.responseCancel(id, acc).then(function (res) {
        if (res.status == "000000") {
          for (var i = 0; i < $scope.leadsPayList.length; i++) {
            if ($scope.leadsPayList[i].id == id) {
              $scope.leadsPayList[i].status = acc == 0 ? 5 : 4;
              break;
            }
          }

        }
      }, function () {
      });
    }

    $scope.picgetbig=function(index){
      $scope.showpic=true;
      $scope.showimgIndex = index;
      $timeout(function(){
        var picNum = $('.picSlide').find('.big-pic');
        for (var i=0;i<picNum.length;i++) {
          var currnetImg = picNum.eq(i);
          var a = currnetImg.height() / currnetImg.width();
          var sW = window.screen.width;
          var sh = 640 * window.screen.height / window.screen.width;
          if (a < window.screen.height / window.screen.width) {
            currnetImg.css('margin-top', sh / 2 - currnetImg.height() / 2 + 'px');
          } else {
            currnetImg.css('margin-left', 640 / 2 - currnetImg.width() / 2 + 'px')
          }
          currnetImg.css("opacity","1");
          currnetImg.show();
        }
      },50)
    }
    $scope.shrinkPic=function(){
      $('.big-pic').hide();
      $scope.showpic=false;
    }
  })
