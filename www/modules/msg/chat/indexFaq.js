angular.module('xtui')
  //聊天详情页
  .controller('faqController', function ($scope, $sce, $ionicSlideBoxDelegate, ConfigService, UserService, $timeout, $ionicScrollDelegate, $ionicPopup, UtilService, StorageService) {

    $scope.stopFun = function (e) {
      e.preventDefault();
    };

    $scope.closefoot = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    };

    var kbOpen = false;

    function onKbOpen(e) {
      kbOpen = true;
      if (device.platform == "Android") {
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom()
        }, 100);
      } else {
        var getH = parseInt($(".footInforBox").css('height'))-2;
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.footStyle = {'bottom': numpercent + 'px'};
        $scope.contentStyle = {'margin-bottom': numpercent + 'px','bottom':getH + 'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom()
        }, 100);
      }
    }

    function onKbClose(e) {
      kbOpen = false;
      if (device.platform == "Android") {
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom()
        }, 100);
      } else {
        var getH = parseInt($(".footInforBox").css('height'))-2;
        $scope.footStyle = {'bottom': '0px'};
        $scope.contentStyle = {'bottom': getH+'px'};
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom()
        }, 100);
      }
    }

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
    };

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.contentBoxName = "faqchat";

      $scope.startfun();

      if (window.location.href.substring(0, 4) == "file") {
        window.addEventListener('native.keyboardshow', onKbOpen);
        window.addEventListener('native.keyboardhide', onKbClose);
      }
    });

    $scope.$on('$ionicView.unloaded', function () {
      //取消监听推送消息
      if (window.location.href.substring(0, 4) == "file") {
        window.removeEventListener('native.keyboardshow', onKbOpen);
        window.removeEventListener('native.keyboardhide', onKbClose);
      }
    });

    var token;
    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.userchatlist = [];
    $scope.message = "";
    $scope.faqlistcon = [];

    function getTime() {
        var myDate = new Date();
        var sec = myDate.getSeconds();
        if (sec < 10) {
            sec = "0" + sec;
        }
        var min = myDate.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        var inittime = myDate.getHours() + ":" + min + ":" + sec;
        return inittime;
    }

    function getTime2() {
      var myDate = new Date();
      var sec = myDate.getSeconds();
      if (sec < 10) {
        sec = "0" + sec;
      }
      var min = myDate.getMinutes();
      if (min < 10) {
        min = "0" + min;
      }
      var year = myDate.getFullYear();
      var month = myDate.getMonth()+1;
      var day = myDate.getDate();
      var inittime = year+"/"+month+"/"+day+" "+myDate.getHours() + ":" + min + ":" + sec;
      return inittime;
    }

    $scope.sendMessage = function (type, id, msg, keyword) {
      $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom(true);
      var typeid = "";
      var helpid = "";
      var sendkeyword = "";
      if (type == '0') {
        if ($scope.message == "") {
          UtilService.showMess("您未输入任何消息(含全空格)，请输入");
          return;
        }
        $scope.faqlistcon = [];
        $scope.faqlistcon.push({"name": $scope.message});
        sendkeyword = $scope.message;
        var mychat = {
          name: $scope.user.nick,
          avate: $scope.user.avate,
          position: "1",
          content: $scope.faqlistcon,
          inputtype: "1", //区别是否输入html标签
          inittime: getTime(),
          helptypefirst:"0",
          resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
          resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
          sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
        };
        $scope.userchatlist.push(mychat);
      } else if (type == '1') {
        $scope.faqlistcon = [];
        $scope.faqlistcon.push({"name": msg});
        typeid = id;
        sendkeyword = keyword;
        var mychat = {
          name: $scope.user.nick,
          avate: $scope.user.avate,
          position: "1",
          content: $scope.faqlistcon,
          inittime: getTime(),
          helptypefirst:"0",
          inputtype: "1", //区别是否输入html标签
          id: id,
          resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
          resulttype_: type, //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
          sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
        };
        $scope.userchatlist.push(mychat);
      } else if (type == '2') {
        helpid = id;
        sendkeyword = keyword;
        $scope.faqlistcon = [];
        $scope.faqlistcon.push({"name": msg});
        var mychat = {
          name: $scope.user.nick,
          avate: $scope.user.avate,
          position: "1",
          id: id,
          resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
          resulttype_: type, //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
          content: $scope.faqlistcon,
          inputtype: "1", //区别是否输入html标签
          inittime: getTime(),
          helptypefirst:"0",
          sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
        };
        $scope.userchatlist.push(mychat);
      }
      StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
      }, null);
      var params = {
        mod: 'IM',
        func: 'findFaqContentByKeyword',
        userid: $scope.user.id,
        data: {
          "keyword": sendkeyword,
          "typeid": typeid,
          "helpid": helpid,
          "usertype": 0
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          mychat.sendstatus = 0;
          $scope.userchatlist.pop();
          $scope.userchatlist.push(mychat);
          var contentfaq = "";
          if (data.data == "") {
            $scope.faqlistcon = [];
            contentfaq = "亲，您当前的问题小秘书我也不知道呀，还是拨打客服电话<br />（<a href='tel:4000505811'>4000505811</a>）试试吧";
            $scope.faqlistcon.push({"name": contentfaq});
            var mychat1 = {
              name: "享推小秘书",
              position: "0",
              resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
              resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
              content: $scope.faqlistcon,
              inputtype: "0", //区别是否输入html标签
              inittime: getTime(),
              helptypefirst:"0",
              sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
            };
            $scope.userchatlist.push(mychat1);
            StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
            }, null);
          } else {
            $scope.retype = data.data.resulttype;
            var faqanswer = "";
            if (angular.isDefined($scope.retype)) {
              if ($scope.retype == 1 || $scope.retype == 2) {
                var mychat1 = {
                  name: "享推小秘书",
                  position: "0",
                  content: data.data.data,
                  inittime: getTime(),
                  helptypefirst:"0",
                  msg_key: data.data.key,
                  inputtype: "2",
                  resultfaqtype: "1",//0是显示正常文字 1是需要跳转的分类
                  resulttype_: $scope.retype, //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
                  sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
                };
                $scope.userchatlist.push(mychat1);
                StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
                }, null);
              } else if ($scope.retype == 3) {
                faqanswer = data.data.dataanswer;
                $scope.faqlistcon = [];
                $scope.faqlistcon.push({"name": faqanswer});
                var mychat1 = {
                  name: "享推小秘书",
                  position: "0",
                  title: data.data.title,
                  inputtype: "3", //区别是否输入html标签
                  resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
                  resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
                  content: $scope.faqlistcon,
                  inittime: getTime(),
                  helptypefirst:"0",
                  sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
                };
                $scope.userchatlist.push(mychat1);
                StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
                }, null);
              }
            }
          }
        } else {
          mychat.sendstatus = 2;
          $scope.userchatlist.pop();
          $scope.userchatlist.push(mychat);
          StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
          }, null);
        }
      }).error(function () {
        mychat.sendstatus = 2;
        $scope.userchatlist.pop();
        $scope.userchatlist.push(mychat);
        StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
        }, null);
      }).finally(function () {
        $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom(true);
      });
      if ($scope.userchatlist.length > 100) {
        $scope.userchatlist.slice($scope.userchatlist.length - 100, $scope.userchatlist.length);
      }
      $scope.message = "";

       /* $('.sendbtn').blur();
        $scope.inputFocus = true;
        cordova.plugins.Keyboard.show();
        cordova.plugins.Keyboard.isVisible = true;
        $('.footInforBox textarea').focus();

        $timeout(function(){
            $scope.inputFocus = true;
            cordova.plugins.Keyboard.show();
            cordova.plugins.Keyboard.isVisible = true;
            $('.sendbtn').blur();
            $('.footInforBox textarea').focus();

        },0)*/

    };

    StorageService.getItem("chatfaq").then(function (obj) {
      if (angular.isUndefined(obj)) {
        $scope.userchatlist = [];
        $scope.faqlistcon = [];
        $scope.faqlistcon.push({"name": "您好,现在由享推小秘书为您提供服务!"});
        var mychatdefault = {
          name: "享推小秘书",
          avate: "img/msg_mishu.png",
          position: "0",
          inputtype: "1", //区别是否输入html标签
          resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
          resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
          content: $scope.faqlistcon,
          inittime: getTime2(),
          helptypefirst:"0",
          sendstatus: "0" //发送状态：0 成功 1 发送中 2 发送失败
        };
        $scope.userchatlist.push(mychatdefault);

        var data = {};
        data.mod = 'nComm';
        data.func = 'getShelptype';
        UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(data)}).success(function (data) {
          if(data.status == '000000'){
            $scope.helptypes =  data.data;
            var mychatdefault = {
              name: "享推小秘书",
              avate: "img/msg_mishu.png",
              position: "0",
              inputtype: "1", //区别是否输入html标签
              resultfaqtype: "1",//0是显示正常文字 1是需要跳转的分类
              resulttype_: "1", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
              content: $scope.helptypes,
              inittime: getTime(),
              helptypefirst:"1",
              sendstatus: "0" //发送状态：0 成功 1 发送中 2 发送失败
            };
            $scope.userchatlist.push(mychatdefault);
            StorageService.setItem("chatfaq", $scope.userchatlist);
          }else if(data.status != '500004'){
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络不给力，请稍后刷新");
        })
      } else {
        $scope.userchatlist = obj;
         $scope.faqlistcon=[];
         $scope.faqlistcon.push({"name":"您好,现在由享推小秘书为您提供服务!"});
         if($scope.userchatlist[$scope.userchatlist.length-1].helptypefirst!="1"){
           var mychatdefault = {
           name:"享推小秘书",
           avate:"img/msg_mishu.png",
           position:"0",
           inputtype:"1", //区别是否输入html标签
           resultfaqtype:"0",//0是显示正常文字 1是需要跳转的分类
           resulttype_:"0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
           content: $scope.faqlistcon,
           inittime: getTime2(),
           helptypefirst:"0",
           sendstatus:"0" //发送状态：0 成功 1 发送中 2 发送失败
           }
           $scope.userchatlist.push(mychatdefault);

           var data = {};
           data.mod = 'nComm';
           data.func = 'getShelptype';
           UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(data)}).success(function (data) {
             if(data.status == '000000'){
               $scope.helptypes =  data.data;
               var mychatdefault = {
                 name: "享推小秘书",
                 avate: "img/msg_mishu.png",
                 position: "0",
                 inputtype: "1", //区别是否输入html标签
                 resultfaqtype: "1",//0是显示正常文字 1是需要跳转的分类
                 resulttype_: "1", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
                 content:$scope.helptypes,
                 inittime: getTime(),
                 helptypefirst:"1",
                 sendstatus: "0" //发送状态：0 成功 1 发送中 2 发送失败
               };
               $scope.userchatlist.push(mychatdefault);
               StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
               }, null);
             }else if(data.status != '500004'){
               UtilService.showMess(data.msg);
             }
           }).error(function () {
             UtilService.showMess("网络不给力，请稍后刷新");
           })

         }

      }

      $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom(true);
    }, null);


    $scope.footStyle = {'display': 'block !important'};

    //发送按钮
    $scope.sendbtn = false;
    //加号按钮
    $scope.morebtn = true;
    //蒙层
    $scope.maskshow = false;

    $scope.repeatSendMsg = function (index) {
      var confirmPopup = $ionicPopup.confirm({
        title: '重发该消息？', // String. 弹窗标题。
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '重发', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      confirmPopup.then(function (res) {
        if (res) {
          $scope.sendMessageAgain(index);
        } else {
        }
      });
    };

    $scope.sendMessageAgain = function (index) {
      var typeid = "";
      var helpid = "";
      var type = $scope.userchatlist[index].resulttype_;
      if (type == 1) {
        typeid = $scope.userchatlist[index].id;
      } else if (type == 2) {
        helpid = $scope.userchatlist[index].id;
      }
      var params = {
        mod: 'IM',
        func: 'findFaqContentByKeyword',
        userid: $scope.user.id,
        data: {
          "keyword": $scope.userchatlist[index].content[0].name,
          "typeid": typeid,
          "helpid": helpid,
          "usertype": 0
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          $scope.userchatlist[index].sendstatus = 0;
          var contentfaq = "";
          if (data.data == "") {
            $scope.faqlistcon = [];
            contentfaq = "亲，您当前的问题小秘书我也不知道呀，还是拨打客服电话<br />（<a href='tel:4000505811'>4000505811</a>）试试吧";
            $scope.faqlistcon.push({"name": contentfaq});
            var mychat1 = {
              name: "享推小秘书",
              position: "0",
              inputtype: "0", //区别是否输入html标签
              resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
              resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
              content: $scope.faqlistcon,
              inittime: getTime(),
              helptypefirst:"0",
              sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
            };
            $scope.userchatlist.push(mychat1);
            StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
            }, null);
          } else {
            $scope.retype = data.data.resulttype;
            var faqanswer = "";
            if (angular.isDefined($scope.retype)) {
              if ($scope.retype == 1 || $scope.retype == 2) {
                var mychat1 = {
                  name: "享推小秘书",
                  position: "0",
                  content: data.data.data,
                  inittime: getTime(),
                  helptypefirst:"0",
                  msg_key: data.data.key,
                  resultfaqtype: "1",//0是显示正常文字 1是需要跳转的分类
                  inputtype: "2", //区别是否输入html标签
                  resulttype_: $scope.retype, //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
                  sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
                };
                $scope.userchatlist.push(mychat1);
                StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
                }, null);
              } else if ($scope.retype == 3) {
                faqanswer = data.data.dataanswer;
                $scope.faqlistcon = [];
                $scope.faqlistcon.push({"name": faqanswer});
                var mychat1 = {
                  name: "享推小秘书",
                  position: "0",
                  title: data.data.title,
                  inputtype: "3", //区别是否输入html标签
                  resultfaqtype: "0",//0是显示正常文字 1是需要跳转的分类
                  resulttype_: "0", //可以点击跳转的type 0是不用。1type类（需要跳转） 2basetype类（需要跳转）
                  content: $scope.faqlistcon,
                  inittime: getTime(),
                  helptypefirst:"0",
                  sendstatus: "1" //发送状态：0 成功 1 发送中 2 发送失败
                };
                $scope.userchatlist.push(mychat1);
                StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {

                }, null);
              }
            }
          }
        } else {
          $scope.userchatlist[index].sendstatus = 2;
          StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
          }, null);
        }
      }).error(function () {
        $scope.userchatlist[index].sendstatus = 2;
        StorageService.setItem("chatfaq", $scope.userchatlist).then(function (obj) {
        }, null);
      }).finally(function () {
        $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom(true);
      })
    };

    //发送表情
    $scope.emojiHide = function () {
      $scope.footStyle = {'margin-bottom': '0px'};
      $scope.contentStyle = {'bottom': numpercent + 76 + 'px'};
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('faqchat').scrollBottom(true);
      }, 200)
    }
  });
