angular.module('xtui')
  .directive('dir', function ($compile, $parse) {
    return {
      restrict: 'E',
      link: function (scope, element, attr) {
        scope.$watch(attr.content, function () {
          element.html($parse(attr.content)(scope));
          $compile(element.contents())(scope);
        }, true);
      }
    }
  })
  //系统详情页
  .controller('msgSysdetailController', function ($timeout, MsgService, $scope, ConfigService, UserService, $ionicScrollDelegate, UtilService, $stateParams, SysMsgService) {
    var token;
    var sysmsgtype_ = $stateParams.sysmsgtype;
    $scope.sysmsgtypename = $stateParams.sysmsgtypename;

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.startfun();
    });

    //下拉调用
    $scope.queryOld = function () {
      if (ltid) {
        var option = {
          type: sysmsgtype_,
          limit: 10,
          ltid: ltid
        };
        MsgService.querySysmsgFromSqlite(option).then(function (res) {
          if (res && res.length > 0) {
            ltid = res[0].id;
            $scope.sysmsgdetaillist = res.concat($scope.sysmsgdetaillist);
          }
        }, function () {

        });
      } else {
        //当没有ltid时，调用queryChatLog
        getSysMsgDetail();
      }
      $scope.$broadcast('scroll.refreshComplete');
    };

    var ltid = null, gtid = null;
    //系统消息详情
    var getSysMsgDetail = function () {
      //sysmsgtype_
      var option = {
        type: sysmsgtype_,
        limit: 10
      };
      MsgService.querySysmsgFromSqlite(option).then(function (res) {
        if (res && res.length > 0) {
          ltid = res[0].id;
          $scope.sysmsgdetaillist = res;
        }
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('sysmessagechat').scrollBottom(true);
        }, 0)
      }, function () {

      });

      /*
       // $scope.loaddingArea();
       if (angular.isUndefined(sysmsgtype_)) {
       sysmsgtype_ = "";
       }
       SysMsgService.getSysMsgDetails(sysmsgtype_).then(function (data) {
       token = data.token;
       $scope.sysmsgdetaillist = data.data;
       $ionicScrollDelegate.$getByHandle('sysmessagechat').scrollBottom(true);
       }, function () {
       UtilService.showMess("网络不给力，请稍后刷新");
       // $scope.deleteloaddingArea();
       })
       */
    };

    if (angular.isDefined(sysmsgtype_)) {
      getSysMsgDetail();
    }

    var isLoadingSysMsgLog = false;
    $scope.loadSysMsgLog = function () {
      if (isLoadingSysMsgLog) {
        return;
      }
      isLoadingSysMsgLog = true;
      //var len = $scope.userchatlist.length -1;
      var receiveid = $scope.sysmsgdetaillist[0].id;
      var params = {
        mod: 'IM',
        func: 'findMessageByType',
        userid: UserService.user.id,
        data: {
          "sysmsgtype": sysmsgtype_,
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
          var templist = data.data.concat($scope.sysmsgdetaillist);
          $scope.sysmsgdetaillist = templist;
        }
        //开启页面滚动条到底部
        //$ionicScrollDelegate.$getByHandle('sysmessagechat').scrollTop();
      }).error(function () {
      }).finally(function () {
        isLoadingSysMsgLog = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    //处理B的云销售邀请
    $scope.dealBInvite = function (index, result) {
      var inviteInfo = $scope.sysmsgdetaillist[index].inviteInfo;
      var params = {
        mod: "IM",
        func: "dealBinvite",
        userid: UserService.user.id,
        data: {
          inviteid: inviteInfo.id,
          result: result,
          sname: UserService.user.nick
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          if (result == 1) {
            $scope.sysmsgdetaillist[index].inviteInfo.status = 1;
            UtilService.showMess("已接受");
          } else if (result == 2) {
            $scope.sysmsgdetaillist[index].inviteInfo.status = 2;
            UtilService.showMess("已拒绝");
            if(data.data) {
                MsgService.deleteChatfirst(data.data);
            }
          }
          getSysMsgDetail();
        } else if (data.status == "130003") {
          UtilService.showMess("您的云销售身份数量已达上限，请删除其他身份后再同意该商家的邀请！");
        } else if (data.status == "130001") {
          UtilService.showMess("抱歉，您申请的商家云销售数量已达上限，无法同意，请选择其它商家！");
        } else if (data.status == "130004") {
          UtilService.showMess("抱歉，您今日申请云销售数量已达上限，无法同意，请明日再来！");
        } else {
          UtilService.showMess(data.msg);
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      });


    }
  })

  //系统消息
  .controller('systemController', function ($stateParams,$timeout, MsgService, $scope, ConfigService, UserService, $ionicScrollDelegate, StorageService, UtilService, $ionicHistory, IMSqliteUtilService) {
    $scope.picserver = ConfigService.picserver;
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.startfun();
      if($stateParams.msgType == 1) {
        $scope.title = "活动推送";
      } else {
        $scope.title = "系统消息";
      }

      if (UserService.msgsystemflg == 1) {
          if($stateParams.msgType == 1) {
              //活动推送
              IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 1 order by id desc limit 1").then(function (res) {
                  if(res && res[0]) {
                      var obj = {
                          lastreadid: res[0].id,
                          count: 0,
                          title: res[0].title
                      };
                      StorageService.setItem("hdts", obj);
                  }
              }, function () {

              });
          } else {
              //系统消息
              IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 0 or msgType is null order by id desc limit 1").then(function (res) {
                  if(res && res[0]) {
                      var obj = {
                          lastreadid: res[0].id,
                          count: 0,
                          title: res[0].title
                      };
                      StorageService.setItem("xtxx", obj);
                  }
              }, function () {

              });
          }

        sysMsgInit($stateParams.msgType);
        UserService.msgsystemflg = 0;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function () {
        if($stateParams.msgType == 1) {
            //活动推送
            IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 1 order by id desc limit 1").then(function (res) {
                if(res && res[0]) {
                    var obj = {
                        lastreadid: res[0].id,
                        count: 0,
                        title: res[0].title
                    };
                    StorageService.setItem("hdts", obj);
                }
            }, function () {

            });
        } else {
            //系统消息
            IMSqliteUtilService.selectImData("select * from systemmsg where msgType = 0 or msgType is null order by id desc limit 1").then(function (res) {
                if(res && res[0]) {
                    var obj = {
                        lastreadid: res[0].id,
                        count: 0,
                        title: res[0].title
                    };
                    StorageService.setItem("xtxx", obj);
                }
            }, function () {

            });
        }
    });

    var getSystemMsgDetail = function (msgType) {
      var params = {
        mod: 'nComm',
        func: 'getSysMsgGroup',
        userid: UserService.user.id,
        data: {ltid: "", msgType:msgType},
        page: {pageSize: 10}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == "000000") {
          $scope.msgSystemList = data.data;
          StorageService.setItem("msgSystemlist"+msgType, $scope.msgSystemList).then(function (obj) {
          }, null);
        }

      }).error(function () {
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    ////下拉调用
    //$scope.queryOld = function() {
    //  if(ltid) {
    //    var option = {
    //      limit: 10,
    //      ltid: ltid
    //    };
    //    MsgService.querySystemmsg(option).then(function(res){
    //      if(res && res.length > 0) {
    //        ltid = res[0].id;
    //        $scope.msgSystemList = res.concat($scope.msgSystemList);
    //      }
    //    }, function(){
    //    });
    //  } else {
    //    //当没有ltid时，调用queryChatLog
    //    getSystemMsgDetail();
    //  }
    //  $scope.$broadcast('scroll.refreshComplete');
    //};

    //var ltid = null, gtid = null;
    ////系统消息详情
    //var getSystemMsgDetail = function () {
    //  //sysmsgtype_
    //  var option = {
    //    limit: 10
    //  };
    //  MsgService.querySystemmsg(option).then(function(res){
    //    if(res && res.length > 0) {
    //      ltid = res[0].id;
    //      $scope.msgSystemList = res;
    //    }
    //    $timeout(function () {
    //      $ionicScrollDelegate.$getByHandle('msgSystem').scrollBottom(true);
    //    },400)
    //  }, function(){
    //
    //  });
    //};
    var sysMsgInit = function (type) {
      StorageService.getItem("msgSystemlist"+type).then(function (obj) {
        if (obj) {
          $scope.msgSystemList = obj;
        }
        //开启页面滚动条到底部
        $timeout(function () {
          $ionicScrollDelegate.$getByHandle('msgSystem').scrollBottom(true);
        },400)
        getSystemMsgDetail($stateParams.msgType);
      }, function (err) {
      });
    }
    //sysMsgInit();


    $scope.queryOld = function () {
      var receiveid = $scope.msgSystemList[0].id;
      var params = {
        mod: 'nComm',
        func: 'getSysMsgGroup',
        userid: UserService.user.id,
        data: {ltid: receiveid, msgType:$stateParams.msgType || 0},
        page: {pageSize: 10}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          var templist = data.data.concat($scope.msgSystemList);
          $scope.msgSystemList = templist;
        }

      }).error(function () {
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.gohttp = function (msgsystem) {
        if(msgsystem.appurl!=null&&msgsystem.appurl!=''){
          //判断APP内跳转与浏览器跳转
          if (msgsystem.appurl.indexOf('http') != -1) {
            var url = msgsystem.appurl;
            /*if(url.indexOf("?")==-1){
              url = url + "?xtupid="+UserService.user.id;
            }else{
              url = url + "&xtupid="+UserService.user.id;
            }*/
            if(url.indexOf('xtbrowser') != -1){
              window.open(url, '_system', 'location=yes' );
            }else{
              //cordova.InAppBrowser.open(banner.appurl, '_blank', 'location=no,clearcache=yes,toolbarposition=top,closebuttoncaption=返回');
              $scope.go('iframe',{iframeurl:url,name:""});
            }
          } else {
            if (msgsystem.appparams != undefined && msgsystem.appparams != "") {
              var json = JSON.parse(msgsystem.appparams.replace(/'/g, "\""))
              $scope.go(msgsystem.appurl, json);
            } else {
              $scope.go(msgsystem.appurl);
            }
          }
        }else{
          $scope.go('systeminfor',{'systeminfor':msgsystem}); //跳转没有链接缺省页
        }
    };


    //   图片放大

    $scope.enlargePic = function (picurl) {

      $scope.showimg = true;
      $scope.imageurl = picurl;
      //$('.chatpage').append(' <div class="showPic" ><img src='+$scope.picserver+userchat.content+' ng-click="alert(111)" class="big-pic" ></div>');

      $timeout(function () {
        var a = $('.big-pic').height() / $('.big-pic').width();
        var sW = window.screen.width;
        var sh = 640 * window.screen.height / window.screen.width;
        if (a < window.screen.height / window.screen.width) {
          $scope.bigpicStyle = {'margin-top': sh / 2 - $('.big-pic').height() / 2 + 'px'}
        } else {
          $scope.bigpicStyle = {'margin-left': 640 / 2 - $('.big-pic').width() / 2 + 'px'}
        }
        $('.big-pic').css("opacity",1);
      }, 50)
    };

    $scope.shrinkPic = function () {
      $scope.showimg = false;
      $scope.showbase64 = false;
      $scope.showLocImg = false;
    };
    $scope.ionhide4line = true;
    $scope.hidemorebtn = function () {
      $scope.ionhide4line = !$scope.ionhide4line;
    }

  })

  //系统消息
  .controller('systeminforController', function ($scope, ConfigService,$stateParams) {
    $scope.picserver = ConfigService.picserver;
    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.startfun();
    });
    $scope.systeminfor = $stateParams.systeminfor;
  })
