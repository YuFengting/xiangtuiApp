/**
 * Created by Administrator on 2016/9/5.
 */
$(function () {
  'use strict';

  angular
    .module('xtui')
    .directive('resizeFootBar2', ['$ionicScrollDelegate', function ($ionicScrollDelegate) {
      // Runs during compile
      return {
        replace: false,
        link: function (scope, iElm, iAttrs, controller) {
          scope.$on("taResize", function (e, ta) {
            if (!ta) return;
            var contentName = iAttrs.ioncontentname;
            var scrollBar = $ionicScrollDelegate.$getByHandle(contentName);
            var taHeight = ta[0].offsetHeight;
            var newFooterHeight = taHeight + 24;
            newFooterHeight = (newFooterHeight > 78) ? newFooterHeight : 78;
            var newFooterHeight2 = (newFooterHeight > 78) ? newFooterHeight-78 : 0;
            iElm[0].style.height = newFooterHeight + 'px';
            //scroll.style.bottom = newFooterHeight2 + 'px';
            if(document.body.querySelector("#"+contentName)){
              var scroll =document.body.querySelector("#"+contentName) ;
              scroll.style.marginBottom = newFooterHeight2 + 'px';
            }
            //scope.hasmsgfootersty = {
            //  'bottom':newFooterHeight + 'px'
            //}
            //scrollBar.scrollBottom();
          });
        }
      };
    }])
    .controller('xtschoolDetailController', xtschoolDetailController);

  xtschoolDetailController.$inject=["$scope","$stateParams","XtSchoolQuestionService","XtSchoolAService","UtilService","UserService","$timeout","$ionicSlideBoxDelegate","$ionicScrollDelegate","$ionicPopup","$sce"];
  function xtschoolDetailController($scope,$stateParams,XtSchoolQService,XtSchoolAService,UtilService,UserService,$timeout,$ionicSlideBoxDelegate,$ionicScrollDelegate,$ionicPopup,$sce){
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.startfun();

      $scope.contentBoxName = "xtshoolAQ";
    });

    var qid = $stateParams.qid;
    $scope.userid = UserService.user.id;

    //进入个人资料页
    $scope.goUser = function (e,type,userid){
      if(type==0){
        $scope.go('shome', {suserid: userid});
      }else if(type==1){
        $scope.go('business', {merchantid: userid});
      }
      e.stopPropagation();
    }

    /**
     * 初始化头部信息
     */
    $scope.question = {};
    $scope.initHead = function (){
      XtSchoolQService.getXTSchoolQuestionById(qid).then(function(res){
        if(res.status=="000000")
          $scope.question = res.data;
      },function(res){});
      XtSchoolQService.increaseReadNum(qid).then(function(res){
      },function(res){})
    };
    $scope.initHead();
    /**
     * 刷新列表
     */
    $scope.answerList = [];
    $scope.hasNextPage = false;
    $scope.doRefresh = function (){
      XtSchoolAService.doRefresh({id:qid}).then(function(){
        $scope.hasNextPage = XtSchoolAService.hasNextPage();
        $scope.answerList = XtSchoolAService.getList();
        UtilService.log($scope.answerList);
      },function(res){}).finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.doRefresh();

    /**
     * 加载更多
     */
    $scope.loadMore = function (){
      XtSchoolAService.loadMore( {id:qid}).then(function(){
        $scope.hasNextPage = XtSchoolAService.hasNextPage();
        $scope.answerList = XtSchoolAService.getList();
        UtilService.log($scope.answerList);
      },function(res){}).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    //回复（1级  2级）
    var addAnswerRepeat = 0;
    $scope.answercon={};
    $scope.addAnswer = function (){
      if(addAnswerRepeat==1){
        return;
      }
      var con = $.trim($scope.answercon.text);
      if(con==""){
        UtilService.showMess("请输入您的回答");
        return;
      }
      if(con.length>200){
        UtilService.showMess("最多输入200个字");
        return;
      }
      addAnswerRepeat=1;
      //$scope.replyanswer   replyanswer="":1级回复  replyanswer!="":2级回复
      var answerid ="";
      var receiverid ="";
      var receivertype ="";
      //一级回复：回答问题
      if($scope.replyanswer.name=="我来回答:"){
      }else{
        //2级回复：回复回答
        if($scope.replyanswer.ptype == 0 ||$scope.replyanswer.ptype == 1 ||$scope.replyanswer.ptype == 2){
          answerid=$scope.replyanswer.id;
          receiverid=$scope.replyanswer.userid;
          receivertype=$scope.replyanswer.ptype;
        }else{
          //2级回复:回答回复
          answerid =$scope.replyanswer.answerid;
          receiverid=$scope.replyanswer.senderid;
          receivertype=$scope.replyanswer.sendertype;
        }
      }
      XtSchoolAService.addXTSchoolAnswer({id:qid,con:$scope.answercon.text,sendertype:"0",answerid:answerid,receiverid:receiverid,receivertype:receivertype}).then(function(res){
        if(res.status=="000000"){//添加成功
          if(answerid==""){
            XtSchoolAService.doRefresh({id:qid}).then(function(){
              $scope.answerList = XtSchoolAService.getList();
              $scope.hasNextPage = XtSchoolAService.hasNextPage();
            },function(res){}).finally(function(){
            });
          }else{
            //回答问题
            XtSchoolAService.getXTSchoolRepliesByAnswerid({answerid:answerid}).then(function(res){
              $scope.oldanswer.replies = res.data;
              $timeout(function(){
                $("."+$scope.oldanswer.id+".replyContentBox").each(function(){
                  $(this).removeClass("ng-hide");
                })
                $("."+$scope.oldanswer.id+".showMoreAnswer").eq(0).addClass("ng-hide");
              },100)
            })
          }
        }else{
          UtilService.showMess(res.msg);
        }
      },function(res){}).finally(function(){
        $scope.xtsfaqfoot = false;
        $scope.publishqa = true;
        $scope.isEmojiShow = false;
        $scope.answercon.text="";
        $('#inputBox2').blur();
        $scope.hasmsgfootersty={'margin-bottom':'0px'};
        $timeout(function(){
          addAnswerRepeat=0;
        },1000);
        $timeout(function(){
          if(answerid==""){
            var getScrollTop = $(".xtsFaqDetailList").eq(1)[0].offsetTop - 223;
            $ionicScrollDelegate.$getByHandle('xtshoolAQ').scrollTo(0,getScrollTop);
          }
        },0);

      });
    };

    //替换link为href  不然ios跳转有问题
    $scope.convertHtml=function(con){
        con = con.replace(/href=/g,"link=");
        return $sce.trustAsHtml(con);

    };


    $scope.$on('$ionicView.unloaded', function () {
      window.removeEventListener('native.keyboardshow', onKbOpen);
      window.removeEventListener('native.keyboardhide', onKbClose);
    });

    window.addEventListener('native.keyboardshow', onKbOpen);
    window.addEventListener('native.keyboardhide', onKbClose);

    $scope.xtsfaqfoot = false;
    $scope.publishqa = true;
    $scope.isEmojiShow = false;
    $scope.hasmsgfootersty={'margin-bottom':'0px'};
    $scope.stopFun = function (e) {
      e.preventDefault();
    };
    //回复
    $scope.publishAQ = function(e,answer,oldanswer){
      e.stopPropagation();
      $scope.aqevent = e;
      $scope.oldanswer = oldanswer;
      var ranswer = angular.copy(answer)
      //判断是不是自己回复自己，如果是自己回复自己，点击出删除（仅限二级回复）
      $scope.replyanswer = ranswer;
      if(ranswer){
        //有ptype直接回复回答，没有ptype,回复的是回答下面的二级回复
        var replyname = "";
        if(ranswer.ptype ==0){
          if(ranswer.nick.length>11){
            replyname = ranswer.nick.substring(0,11)+"...";
          }else{
            replyname = ranswer.nick;
          }
        }else if(ranswer.ptype ==1){
          if(ranswer.bname.length>11){
            replyname = ranswer.bname.substring(0,11)+"...";
          }else{
            replyname = ranswer.bname;
          }
        }else if(ranswer.ptype ==2){
          if(ranswer.name.length>11){
            replyname = ranswer.name.substring(0,11)+"...";
          }else{
            replyname = ranswer.name;
          }
        }else{
          if($scope.replyanswer.senderid == UserService.user.id){
            $scope.deleteThisAnswer(e,3,answer.id,oldanswer);
            return;
          }else{
            if(ranswer.sendername.length>11){
              replyname = ranswer.sendername.substring(0,11)+"...";
            }else{
              replyname = ranswer.sendername;
            }
          }
        }
        $scope.replyanswer.name="回复"+replyname+" :";
      }else{
        $scope.replyanswer ={name:"我来回答:"};
      }
      if(!kbOpen){
        //键盘是关闭状态
        $scope.xtsfaqfoot = true;
        $scope.publishqa = false;
        $timeout(function(){
          $('#inputBox2').focus();
        },100);
      }else{
        cordova.plugins.Keyboard.close();
        $scope.xtsfaqfoot = false;
        $scope.publishqa = true;
      }

    };

    $scope.publishqa = true;
    //滑动松开
    $scope.onscroolShow = function(){
      $scope.hasmsgfootersty={'margin-bottom':'0px'};
      $scope.publishqa = true;
    };


    $scope.onscroolHide = function(){
      $scope.hasmsgfootersty={'margin-bottom':'0px'};
      if(kbOpen || $scope.isEmojiShow){
        $scope.closeMsgFoot2();
      }else{
        if($scope.publishqa){
          $scope.publishqa = false;
        }
      }
    };
    //删除回复
    $scope.deleteThisAnswer = function(event,type,id,answer){
      $scope.oldanswer = answer;
      //type 0 1 删除answer  3删除回复
      event.stopPropagation();
      UtilService.showcontentinapputil(event,type);
      cordova.plugins.Keyboard.close();
      $scope.publishqa = true;
      $scope.xtsfaqfoot = false;
      $scope.isEmojiShow = false;
      $scope.isEmojiflag = false;
      $scope.hasmsgfootersty = {'bottom': '0px','margin-bottom':'0px'};
      $scope.replyanswer ={name:"我来回答:"};
      if(type ==2){return };
      if(type!=3){
        if(answer.userid != $scope.userid){
          return ;
        }
      }
      var confirmPopup = $ionicPopup.confirm({
        title: '确定删除该条评论？', // String. 弹窗的标题。
        scope: null, // Scope (可选)。一个链接到弹窗内容的scope（作用域）。
        buttons: [{ //Array[Object] (可选)。放在弹窗footer内的按钮。
          text: '取消',
          type: 'button-default',
          onTap: function(e) {
            // 当点击时，e.preventDefault() 会阻止弹窗关闭。
            return;
          }
        }, {
          text: '确定',
          type: 'button-positive',
          onTap: function(e) {
            XtSchoolAService.delXTSchoolAnswerById({id:id,type:type}).then(function(res){
              //type=3:回复id=replayid;type!=3:回答is=answerid
              if(type==3){
                //刷新回复
                //回答问题
                XtSchoolAService.getXTSchoolRepliesByAnswerid({answerid:answer.id}).then(function(res){
                  $scope.oldanswer.replies = res.data;
                  console.log($scope.oldanswer)
                  $timeout(function(){
                    $("."+$scope.oldanswer.id+".replyContentBox").each(function(){
                      $(this).removeClass("ng-hide");
                    })
                    $("."+$scope.oldanswer.id+".showMoreAnswer").eq(0).addClass("ng-hide");
                  },100)
                })

              }else{
                //刷新列表
                XtSchoolAService.doRefresh({id:qid}).then(function(){
                  $scope.answerList = XtSchoolAService.getList();
                  $scope.hasNextPage = XtSchoolAService.hasNextPage();
                },function(res){}).finally(function(){
                });
              }


            },function(){})
            return;
          }
        }]
      });
    }

    //发送表情
    $scope.emojiHide = function () {
      $scope.isEmojiflag = false;
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if( $scope.isEmojiShow==true){
        $scope.hasmsgfootersty={'margin-bottom':getH+'px'}
      }
      $scope.isEmojiShow = false;
    };


    $scope.closeMsgFoot2 = function(){
      cordova.plugins.Keyboard.close();
      $scope.xtsfaqfoot = false;
      $scope.publishqa = true;
      $scope.isEmojiShow = false;
      $timeout(function(){$scope.publishqa = true;},500);
      $scope.hasmsgfootersty={'margin-bottom':'0px'};
    };

    $scope.closeMsgFoot = function(){
      if($scope.answercon.text=="" || $scope.answercon.text==null || $scope.answercon.text==undefined){
        $scope.replyanswer ={name:"我来回答:"};
      }
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if(!$scope.isEmojiShow){
        return;
      }
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }

      if(kbOpen || $scope.isEmojiShow){
        $scope.xtsfaqfoot = true;
        $scope.publishqa = false;
        $scope.isEmojiShow = false;
        $scope.hasmsgfootersty={'margin-bottom':getH+'px'};
      }

    };

    var kbOpen = false;
    function onKbOpen(e) {
      kbOpen = true;
      getInput = document.getElementById("inputBox2");
      getInput.selectionStart = getInput.textLength;
      $scope.publishqa = false;
      $scope.isEmojiShow = false;
      $scope.isFuncShow = false;
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform == "Android") {
        $scope.hasmsgfootersty = {'bottom': '0px','margin-bottom':getH+'px'};
      } else {
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.footStyle = {'bottom': numpercent + 'px'};
        $scope.hasmsgfootersty = {'bottom': numpercent + 'px','margin-bottom':getH+'px'};
      }
    }

    function onKbClose(e) {
      if(!$scope.isEmojiflag){
        if($scope.answercon.text=="" || $scope.answercon.text==null || $scope.answercon.text==undefined){
          $scope.replyanswer ={name:"我来回答:"};
        }
      }
      kbOpen = false;
      getInput = document.getElementById("inputBox2");
      startPos = getInput.selectionStart;
      endPos = getInput.selectionEnd;
      var getH = parseInt($(".footInforBox").css('height'))-2;
      if (device.platform == "Android") {
        $scope.hasmsgfootersty = {'margin-bottom':getH+'px'};
      } else {
        $scope.footStyle = {'bottom': '0px'};
        $scope.hasmsgfootersty = {'bottom': '0px','margin-bottom':getH+'px'};
      }
    }
    $scope.isEmojiflag = false;
    $scope.emojiBox = function(e){
      if(kbOpen) {
        $scope.isEmojiflag = true;
        var handler = function() {
          window.removeEventListener('native.keyboardhide', handler);
          openEmoji(e);
        };
        window.addEventListener('native.keyboardhide', handler);
      } else {
        openEmoji(e);
      }
    };
    var openEmojiClick=0;
    var openEmoji = function(e) {
      if(openEmojiClick==1){
        return;
      }
      openEmojiClick=1;
      $scope.hasmsgfootersty={'margin-bottom':'300px'};
      $('#inputBox2').blur();
      $scope.isEmojiShow = true;
      $(e.target).parent().siblings(".emojiBox").show();
      var myInput = document.getElementById('inputBox2');
      if (myInput == document.activeElement) {
        $timeout(function(){
          $scope.isEmojiShow=true;
          $ionicSlideBoxDelegate.update();
        },350)
      } else {
        $scope.isEmojiShow=true;
        $ionicSlideBoxDelegate.update();
      }
      $timeout(function(){
        openEmojiClick=0;
      },2000);
    };

    //添加表情
    var startPos = 0;
    var endPos = 0;
    var getInput = document.getElementById("inputBox2");
    $scope.getAttr = function (event) {
      var getTitle = event.target.getAttribute("title");
      var getEmoji = "[" + getTitle + "]";
      getInput = document.getElementById("inputBox2");
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
      $scope.answercon.text = getInput.value;
      //$scope.sendFunc();
    }

    //删除表情
    $scope.backspace = function () {
      var getVal = document.getElementById("inputBox2").value;
      var newVal = getVal.replace(/(.|\[[^\]]*?\])$/, '');
      $scope.answercon.text = newVal;
    };

    var clickZanRepeat = 0;
    $scope.clickGood = function(answer){
      if(clickZanRepeat==1){
        return;
      }
      clickZanRepeat=1;
      XtSchoolAService.xtSchoolPraise({aid:answer.id}).then(function(res){
        if(res.status=="000000"){
          answer.zan = 1;
          answer.zannum ++;
        }else if (res.status=="160001"){
          UtilService.showMess("请坚定立场哦");
        }
      },function(){}).finally(function(){
        $timeout(function(){
          clickZanRepeat=0;
        },1000);

      })
    };


    //查看更多
    $scope.lookMoreAnswer = function(e){
      $(e.target).hide();
      $(e.target).prev().find("div").each(function(){
        $(this).removeClass("ng-hide");
      })
    }
  }
}());
