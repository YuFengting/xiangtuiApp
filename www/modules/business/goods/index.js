angular.module('xtui')
  .controller('goodsController', function ($scope, GoodsService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    var getGoodsList = function () {
      $scope.companyalias = $stateParams.companyalias;
      GoodsService.getGoodsList($stateParams.merchantid).then(function (response) {
        $scope.goodslist = response.data;
      }, function () {
      })
    };
    getGoodsList();

    $scope.goGoodsDetail = function (goods, companyalias) {
      $scope.go("gooddetailc", {"goods": goods, "companyalias": companyalias});
    }

  })
  //商品详情页面
  .controller("GoodsDetailController", function (UtilService, UserService, $scope, $ionicSlideBoxDelegate, $stateParams, $sce, $window, ConfigService, $timeout, $ionicPopup) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.picserver = ConfigService.picserver;
    $scope.business_showpager = true;
    //xtui3.0滚动时候的图标显示隐藏
    var getGoodDetail = function () {
      var params = {
        mod: 'NStask',
        func: 'getGoodDetailById',
        userid: UserService.user.id,
        data: {"id": $stateParams.goods.id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          $scope.goods = data.data;
          if (UtilService.idDefine($scope.goods.pfprice) && UtilService.idDefine($scope.goods.mprice)) {
            $scope.showmoney = true;
          } else {
            $scope.showmoney = false;
          }
          if ($scope.goods.pfprice == "") {
            $scope.pfshow = "none";
          } else {
            $scope.pfshow = "block";
          }
          if ($scope.goods.mprice == "") {
            $scope.mshow = "none";
          } else {
            $scope.mshow = "block";
          }
          $scope.desc = $sce.trustAsHtml($stateParams.goods.description);
        }
        $timeout(function () {
          $ionicSlideBoxDelegate.$getByHandle('productdetail').update();
          if ($scope.goods.pics.length == 1) {
            $ionicSlideBoxDelegate.$getByHandle('productdetail').slide(0);
          }
          $ionicSlideBoxDelegate.$getByHandle('productdetail').loop(true);
        }, 50);
      });
    };

    getGoodDetail();
    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      var params = {
        mod: "nStask",
        func: "getGoodsShareurl",
        userid: UserService.user.id,
        data: {'goodsid': $stateParams.goods.id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          var url = data.data;
          if (iosshareflg != 0) {
            return;
          }
          iosshareflg = 1;
          var sharetitle = $scope.goods.sharetitle;
          var sharedisc = $scope.goods.sharecontent;
          $scope.imageUrl = $scope.picserver + $scope.goods.sharepic;
          $scope.ifopensharepopup = false;
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

    $scope.companyalias = $stateParams.companyalias;
    $scope.scrollHide = function () {
      $('.startbtn').fadeOut();
    };
    $scope.scrollShow = function () {
      $('.startbtn').fadeIn();
    };

    $scope.closesharepopup = function () {
      $scope.ifopensharepopup = false;
    };

    $scope.ifopensharepopup = false;
    $scope.shareSDK = function () {
      if ($scope.goods.goodstatus == -1 || $scope.goods.isdel == 1) {
        UtilService.showMess("该商品已下架");
        return;
      }
      if (device.platform == "Android") {
        $scope.ifopensharepopup = true;
      } else {
        $scope.iosNewShare();
      }
      UtilService.tongji("sshare", {'goodsid': $stateParams.goods.id});
    };


    //分享
    var newshareflg = 0;
    $scope.newShare = function (sharetype) {
      if (newshareflg != 0) {
        return;
      }
      newshareflg = 1;
      var params = {
        mod: "nStask",
        func: "getGoodsShareurl",
        userid: UserService.user.id,
        data: {'goodsid': $stateParams.goods.id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          var url = data.data;
          var sharetitle = $scope.goods.sharetitle;
          var sharedisc = $scope.goods.sharecontent;
          $scope.imageUrl = $scope.picserver + $scope.goods.sharepic;
          $scope.ifopensharepopup = false;
          if (sharetype == "weixin") {
            $window.weixinplugin.wxshare(function (resultData) {
              if (resultData == 0) {
                var confirmPopup = $ionicPopup.show({
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
            }, sharetitle, sharedisc, $scope.imageUrl, url, "s", ConfigService.wxserver, ConfigService.logtoken);
          } else if (sharetype == "wxZone") {
            $window.weixinplugin.wxzoneshare(function (resultData) {
              if (resultData == 0) {
                var confirmPopup = $ionicPopup.show({
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
            }, sharetitle, sharedisc, $scope.imageUrl, url, "s", ConfigService.wxserver, ConfigService.logtoken);
          } else if (sharetype == "qq") {
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
          } else if (sharetype == "qqZone") {
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
          } else if (sharetype == "sinaweibo") {
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
          } else if (sharetype == "copylink") {
            var text = url;
            cordova.plugins.clipboard.copy(text);
            UtilService.showMess1('已复制');
          }
          $timeout(function () {
            newshareflg = 0;
          }, 1500);
        }
      }).error(function () {
        $timeout(function () {
          newshareflg = 0;
        }, 1500);
      });
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'goodid': $stateParams.goods.id});
    };

    $scope.goAndBuy = function (url) {
      cordova.InAppBrowser.open(url, '_blank', 'location=no,clearcache=yes,toolbarposition=top,closebuttoncaption=返回');
    }

  });
