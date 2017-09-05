angular.module('xtui')
  .controller('InviteController', function ($scope, UserService, UtilService, ConfigService, $timeout, $window, $ionicPopup) {

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //获取用户
    $scope.user = UserService.user;
    //获取邀请好友的数据
    var querydata = {
      mod: 'nUser',
      func: 'getInviteUsers',
      userid: $scope.user.id
    };
    UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(querydata)}).success(function (data) {
      $scope.inviteUsers = data.data.inviteUsers;//被邀请的用户
      $scope.inviteMoneys = data.data.inviteMoneys;//邀请得到的钱
      $scope.inviteNums = data.data.inviteNums;//成功邀请的数量
    })


    $scope.opendShareRewardPop = false;
    //打开个人邀请详情
    $scope.opendshareeewardpop = function(){
      $scope.opendShareRewardPop = true;
    }
    //关闭个人邀请详情
    $scope.closesharerewardpop = function(){
      $scope.opendShareRewardPop = false;
    }

    //打开分享弹窗
    $scope.ifopensharepopup = false;
    $scope.showshare = function () {
      if (device.platform == "Android") {
        $scope.ifopensharepopup = true;
      } else {
        $scope.iosNewShare();//ios分享
      }
      UtilService.tongji("sshare");
    };

    //关闭分享弹窗
    $scope.closesharepopup = function () {
      $scope.ifopensharepopup = false;
    };

    //ios新分享
    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      //获取邀请链接
      $scope.querydata = {
        mod: 'nUser',
        func: 'getInviteUrl',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson($scope.querydata)}).success(function (data) {
        if (data.status == '000000') {
          if (iosshareflg != 0) {
            return;
          }
          iosshareflg = 1;
          var url = data.data.url;
          var sharetitle = data.data.sharetitle;
          var sharedisc = data.data.sharedisc;
          $scope.imageUrl = data.data.imageurl;
          $window.simpleshare.simpleshowShare(function () {
            iosshareflg = 0;
          }, function () {
          }, sharetitle, $scope.imageUrl, url);
        } else {
          UtilService.showMess("网络异常，请稍后重试");
        }
      }).error(function () {
        UtilService.showMess("网络异常，请稍后重试");
      })
    };



    //分享事件（分享条件）
    var flg = 0;
    $scope.newShare = function (sharetype) {

      if (flg != 0) {
        return;
      }
      flg = 1;
      //获取邀请链接
      $scope.querydata = {
        mod: 'nUser',
        func: 'getInviteUrl',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson($scope.querydata)}).success(function (data) {

        var url = data.data.url;
        var sharetitle = data.data.sharetitle;
        var sharedisc = data.data.sharedisc;
        $scope.imageUrl = data.data.imageurl;
        $scope.ifopensharepopup = false;
        //微信分享
        if (sharetype == "weixin") {

          $window.weixinplugin.wxshare(function (resultData) {
            if (resultData == 0) {
              $ionicPopup.show({
                title: "分享文章建议安装QQ浏览器，是否安装？",
                buttons: [{
                  text: "否",
                  type: "button-cancel",
                  onTap: function (e) {
                    $window.weixinplugin.wxlocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                  }
                }, {
                  text: "是",
                  type: "button-cancel",
                  onTap: function (e) {
                    $window.weixinplugin.qqbrowser(ConfigService.wxserver);
                  }
                }
                ]
              });
            }
          }, function () {
          }, sharetitle, sharedisc, $scope.imageUrl, url, "s",ConfigService.wxserver,ConfigService.logtoken);
        } else if (sharetype == "wxZone") {//朋友圈分享

          $window.weixinplugin.wxzoneshare(function (resultData) {
            if (resultData == 0) {
              $ionicPopup.show({
                title: "分享文章建议安装QQ浏览器，是否安装？",
                buttons: [{
                  text: "否",
                  type: "button-cancel",
                  onTap: function (e) {
                    $window.weixinplugin.wxzonelocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                  }
                }, {
                  text: "是",
                  type: "button-cancel",
                  onTap: function (e) {
                    $window.weixinplugin.qqbrowser(ConfigService.wxserver);
                  }
                }
                ]
              });
            }
          }, function () {
          }, sharetitle, sharedisc, $scope.imageUrl, url, "s",ConfigService.wxserver,ConfigService.logtoken);
        } else if (sharetype == "qq") {//QQ分享
          YCQQ.checkClientInstalled(function () {
            var args = {};
            args.url = url;
            args.title = sharetitle;
            args.description = sharedisc;
            args.imageUrl = $scope.imageUrl;
            args.appName = "享推";
            YCQQ.shareToQQ(function () {
              UtilService.showMess1('QQ分享成功');
            }, function (failReason) {
              UtilService.showMess1('QQ分享取消');
            }, args);
          }, function () {
            UtilService.showMess1('未安装QQ');
          });
        } else if (sharetype == "qqZone") {//QQ空间分享
          YCQQ.checkClientInstalled(function () {
            var args = {};
            args.url = url;
            args.title = sharetitle;
            args.description = sharedisc;
            var imgs = [$scope.imageUrl];
            args.imageUrl = imgs;
            YCQQ.shareToQzone(function () {
              UtilService.showMess1('QQ空间分享成功');
            }, function (failReason) {
              UtilService.showMess1('QQ空间分享取消');
            }, args);
          }, function () {
            UtilService.showMess1('未安装QQ');
          });
        } else if (sharetype == "sinaweibo") {//新浪微博分享
          window.weibo.isInstalled("1556155109", "http://www.91weiku.com", function () {
            window.weibo.init("1556155109", "http://www.91weiku.com", function () {
              var args = {};
              args.type = "image";
              args.data = $scope.imageUrl;
              args.text = sharetitle + url;
              window.weibo.share(args, function () {
              }, function () {
                UtilService.showMess1('分享取消');
              });
            }, function () {
              UtilService.showMess1('网络异常，请稍后重试');
            })
          }, function () {
            UtilService.showMess1('未安装微博');
          });
        } else if (sharetype == "copylink") {//复制链接
          cordova.plugins.clipboard.copy(url);
          UtilService.showMess1('已复制');
        }
        $timeout(function () {
          flg = 0;
        }, 1000);

      }).error(function () {
        UtilService.showMess1('网络异常，请稍后重试！');
        flg = 0;
      });
      UtilService.tongji("sharetype", {'sharetype': sharetype});
    };

  })


  //老版本邀请好友详情
/*  .controller('Invite2Controller', function ($scope, UserService, UtilService, ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    var querydata = {
      mod: 'nUser',
      func: 'getInviteUsers',
      userid: $scope.user.id
    };
    UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(querydata)}).success(function (data) {
      $scope.inviteUsers = data.data.inviteUsers;
      $scope.inviteMoneys = data.data.inviteMoneys;
      $scope.inviteNums = data.data.inviteNums;
    })

  });*/

