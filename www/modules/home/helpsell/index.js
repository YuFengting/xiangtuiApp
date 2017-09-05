angular.module('xtui')
//帮忙卖活动-美文
  .controller("GoodArticleController", function ($scope, $ionicPopup, ConfigService, $rootScope, UserService, UtilService, $stateParams, $window, $sce, $timeout, BusinessIndexService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $rootScope.checkedList = [];
    });
    var taskid = $stateParams.taskid;
    var articleid = $stateParams.articleid;
    $scope.shownum = false;
    $scope.hidemsg = false;//等级不够或今日接任务达上限
    $scope.hidesaler = false;//是否是云销售
    var articeltype;
    $scope.backShare = function () {
      var params = {
        mod: "nStask",
        func: "acceptNTask",
        userid: UserService.user.id,
        data: {'taskid': taskid, 'tasktype': '1', 'articleid': articleid, 'showstatus': 0}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          $scope.shareurl = data.data.url;
          $scope.sharecode = data.data.code;
        } else if (data.status == '140001' || data.status == '140002') {
          $scope.hidemsg = true;
          $scope.showmsg = data.msg;
        }
      }, function () {
      })
    };
    $scope.backShare();
    $("#art_iframe").load(function () {
      $(".loadanimation").hide();
    });
    var getArticleUrl = function () {
      var params = {
        mod: "nStask",
        func: "getArticleUrl",
        userid: UserService.user.id,
        data: {articleid: articleid, taskid: taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.article = data.data;
        articeltype = data.data.type;
        $scope.articleurl = $sce.trustAsResourceUrl($scope.article.url);
        $scope.imageUrl = $scope.picserver + $scope.article.shareview;
      })
    };
    getArticleUrl();

    /*申请云销售失败弹窗hidemsgshow*/
    $scope.cantApplyPop = function() {
      $ionicPopup.show({
        title: $scope.showmsg,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){}
          },
          { text: '<span style="color: #ff3b30">查看原因</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.go('help');
            }
          }
        ]
      })
    };

    /*提示申请云销售弹窗 hidesaler*/
    $scope.toApplyPop = function() {
      $ionicPopup.show({
        title:'申请成为云销售之后，<br/>才能分享活动并赚取佣金',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){}
          },
          { text: '<span style="color: #ff3b30">申请云销售</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.finishInfo();
            }
          }
        ]
      })
    };

    //完善资料弹窗
    $scope.finishInfo = function () {
     $scope.hidemsg = false;
     $scope.hidesaler = false;
      if ($scope.article.userInfoComplete == 0) {
        $scope.go('apply', {'merchantid': $scope.article.merchantid});
      } else {
        var qxtext = "取消";
        if ($scope.article.mustCompleteInfo != 1) {
          qxtext = "跳过";
        }
        $ionicPopup.confirm({
          title: '您需要完善资料，才可申请云销售',
          buttons: [{
            text: '完善资料',
            type: 'button-default',
            onTap: function () {
              $scope.go("info");
            }
          }, {
            text: qxtext,
            type: 'button-positive',
            onTap: function () {
              if ($scope.article.mustCompleteInfo != 1) {
                $scope.go("apply", {'merchantid': $scope.article.merchantid});
              }
            }
          }]
        });
      }
    };
    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      if (iosshareflg != 0) {
        return;
      }
      iosshareflg = 1;
      var sharetitle = $scope.article.sharetitle;
      $scope.ifopensharepopup = false;
      $window.simpleshare.simpleshowShare(function (resData) {
        iosshareflg = 0;
        if (resData == "success") {
          shareSuccess("分享成功！");
        }
      }, function () {
      }, sharetitle, $scope.imageUrl, $scope.shareurl);
    };

    /*分享弹窗*/
    $scope.ifopensharepopup = false;
    $scope.closesharepopup = function () {
      $scope.ifopensharepopup = false;
    };
    $scope.shareSDK = function () {
      if (angular.isUndefined($scope.article)) {
        UtilService.showMess("页面加载中，请稍候");
        return;
      }
      if ($scope.article.stop == 1 || $scope.article.isaudit != 1) {
        UtilService.showMess("该活动已停止");
        return;
      }
      if ($scope.article.isdel == 1) {
        UtilService.showMess("该活动已结束");
        return;
      }
      UtilService.tongji('cpsshare', {'taskid': taskid, 'articleid': articleid});
      if ($scope.article.salerstatus == 9 || $scope.article.salerstatus == 2) {
       $scope.hidesaler = true;
        $scope.toApplyPop();
        return;
      } else if ($scope.article.salerstatus == 0) {
        UtilService.showMess("云销售申请中");
        return;
      }
      if ($scope.hidemsg) {
        $scope.cantApplyPop();
        return;
      }
      if (device.platform == "Android") {
        $scope.ifopensharepopup = true;
      } else {
        $scope.iosNewShare();
      }
    };

    var share = 0;
    //分享
    $scope.newShare = function (sharetype) {
      if (share != 0) {
        return;
      }
      share = 1;
      var url = $scope.shareurl;
      var sharetitle = $scope.article.sharetitle;
      var sharedisc = $scope.article.sharedisc;
      $scope.ifopensharepopup = false;
      if (sharetype == "weixin") {
        $window.weixinplugin.wxshare(function (resultData) {
          if (resultData == 0) {
            $ionicPopup.show({
              title: "分享文章建议安装QQ浏览器，是否安装？",
              buttons: [{
                text: "否",
                type: "button-cancel",
                onTap: function () {
                  $window.weixinplugin.wxlocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                }
              }, {
                text: "是",
                type: "button-cancel",
                onTap: function () {
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
            $ionicPopup.show({
              title: "分享文章建议安装QQ浏览器，是否安装？",
              buttons: [{
                text: "否",
                type: "button-cancel",
                onTap: function () {
                  $window.weixinplugin.wxzonelocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                }
              }, {
                text: "是",
                type: "button-cancel",
                onTap: function () {
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
            shareSuccess('QQ分享成功');
          }, function () {
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
          args.imageUrl = [$scope.imageUrl];
          YCQQ.shareToQzone(function () {
            shareSuccess('QQ空间分享成功');
          }, function () {
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
              shareSuccess('新浪微博分享成功');
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
        cordova.plugins.clipboard.copy(url);
        UtilService.showMess1('已复制');
      }
      $timeout(function () {
        share = 0;
      }, 1500);
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'taskid': taskid, 'articleid': articleid});
    };

    $scope.gotoshare = function () {
      if (angular.isUndefined($scope.article)) {
        UtilService.showMess("页面加载中，请稍候");
        return;
      }
      $scope.go('selectcontact', {shareid: taskid + "," + articleid, name: $scope.article.name, type: '8'});
      UtilService.customevent("xszctoshare", "销售支持美文/H5分享");
      UtilService.tongji('xszctoshare', {shareid: taskid + "," + articleid, name: $scope.article.name, type: '8'});
    };
    var shareSuccess = function (mstr) {
      //返回全部分享任务刷新
      if (BusinessIndexService.sharetask.indexOf(taskid) < 0)
        BusinessIndexService.sharetask.push(taskid);
      UtilService.showMess1(mstr);
      var params = {
        mod: "nStask",
        func: "acceptNCode",
        userid: UserService.user.id,
        data: {'code': ($scope.sharecode + "")}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
      }, function () {
      })
    };

    $scope.showPouple = function () {
      if (articeltype == 1) {
        $('.article_h5').slideDown();
      } else {
        $('.article_ar').slideDown();
      }
      UtilService.tongji('rule2', {'taskid': taskid, 'articleid': articleid});
      UtilService.customevent("rule2", "销售支持美文/H5分享");
    };

    $scope.hideArPouple = function () {
      $('.article_ar').slideUp();
    };
    $scope.hideH5Pouple = function () {
      $('.article_h5').slideUp();
    }

  })
  //帮忙卖详情页面
  .directive("helpSellScroll", function () {
    return {
      restrict: 'EA',
      link: function ($scope, ele) {
        $(ele[0]).scroll(function () {
          var getindexTop = (device.platform == "Android") ? $(ele[0]).scrollTop() : $scope.honscroll.getScrollPosition().top;
          var opty = 0.3 - getindexTop / 312;
          //滚动条向下拉动时的事件方法
          if (getindexTop <= 0) {
          } else {
            $(".helpSellHeader").css("background", "rgba(255,59,48," + getindexTop / 312 + ")");
            $(".iconRoundBox").css('background', "rgba(0,0,0," + opty + ")");
          }
          if (getindexTop < 10) {
            $(".helpSellHeader").css("background", "rgba(255,59,48,0)");
            $(".iconRoundBox").css('background', "rgba(0,0,0,.3)");
          }
          if (getindexTop > 320) {
            $(".helpSellHeader").css("background", "rgba(255,59,48,1)");
            $(".iconRoundBox").css('background', "rgba(0,0,0,0)");
          }
        });
      }
    }
  })
  .controller("HelpSellDetailController", function ($sce, $window, $scope, $rootScope, $timeout, $ionicSlideBoxDelegate, $stateParams, $ionicActionSheet, UtilService, HelpSaleDetailService, $ionicPopup, $ionicScrollDelegate) {

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $rootScope.checkedList = [];
      var fromarr = ["business", "helpselldetail", "coupon", "goodarticle", "teamheadmodel", "iframe"];
      if (fromarr.indexOf($rootScope.xtfromurl) < 0) {
        $scope.getCpsTaskData();
      }
    });

    $scope.honscroll = $ionicScrollDelegate.$getByHandle('helpScrollHandle');
    $scope.helpAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: '可用于推广的活动及素材、分享后收集到的客户信息可在我的客户管理中查看。',
        buttons: [
          {text: '确定'}
        ]
      });
      alertPopup.then(function () {
        $scope.selectmore = false;
      });
    };

    //完善资料弹窗
    $scope.finishInfo = function () {
      var qxtext = "取消";
      if ($scope.cpstask.mustCompleteInfo != 1) {
        qxtext = "跳过";
      }
      $ionicPopup.confirm({
        title: '您需要完善资料，才可申请云销售',
        buttons: [{
          text: '完善资料',
          type: 'button-default',
          onTap: function () {
            $scope.go("info");
          }
        }, {
          text: qxtext,
          type: 'button-positive',
          onTap: function () {
            if ($scope.cpstask.mustCompleteInfo != 1) {
              $scope.go("apply", {"merchantid": $scope.cpstask.merchantid});
            }
          }
        }]
      });
    };

    //申请云销售
    $scope.applySaler = function () {
      if ($scope.cpstask.pstatus == 1) {
        UtilService.showMess("该任务已暂停");
        return;
      }
      if ($scope.cpstask.status == 0) {
        UtilService.showMess("该任务未开始");
        return;
      }
      if ($scope.cpstask.status == 2 || $scope.cpstask.isdel == 1) {
        UtilService.showMess("该任务已结束");
        return;
      }
      if ($scope.cpstask.userInfoComplete == 1) {
        //该用户未完善资料，出完善资料弹窗
        $scope.finishInfo();
      } else {
        //判断是B是否已经在会话内邀请
        if ($scope.cpstask.binvite == 0) {
          UtilService.showMess("该商家已邀请您成为他的云销售，您可以去通讯录或云销售通知里接收！");
        } else {
          $scope.go("apply", {"merchantid": $scope.cpstask.merchantid});
        }
      }
    };

    $(".nextToggle").click(function () {
      if ($(this).find('i').hasClass('ion-ios-arrow-down')) {
        $(this).find('i').removeClass('ion-ios-arrow-down').addClass('ion-ios-arrow-up');
        $(this).next().show()
      } else {
        $(this).find('i').removeClass('ion-ios-arrow-up').addClass('ion-ios-arrow-down');
        $(this).next().hide()
      }
    });

    //返回按钮出现消失
    $scope.hidebtns = function () {
      $('.business_back').animate({'top': '-50px'}, 500);
      $('.business_love').animate({'top': '-50px'}, 500);
      $('.business_share').animate({'top': '-50px'}, 500);
    };
    $scope.showbtns = function () {
      $('.business_back').animate({'top': '48px'}, 300);
      $('.business_love').animate({'top': '48px'}, 300);
      $('.business_share').animate({'top': '48px'}, 300);
    };
    $scope.showpnum = "none";
    $scope.calltel = "none";

    var piclen = 1;
    //获取帮忙卖数据
    $scope.isstore = 0;
    $scope.getCpsTaskData = function () {
      HelpSaleDetailService.getcpsdetail($stateParams.taskid).then(function (response) {
        $scope.cpstask = response.data;
        $scope.isstore = response.data.isstore;
        $scope.cpstask.commissiondesc = $sce.trustAsHtml(response.data.commissiondesc);
        for (var i = 0; i < response.data.title.length; i++) {
          $scope.cpstask.title[i] = $sce.trustAsHtml(response.data.title[i]);

          var link = "";
          if ($scope.cpstask.url && $scope.cpstask.url[i].length > 0) {
            link = "<span href='" + $scope.cpstask.url[i] + "' style='text-decoration:none;color: #1c8df6'>" + $scope.cpstask.urlname[i] + "</span>";
          }
          $scope.cpstask.describ[i] = $sce.trustAsHtml(response.data.describ[i] + " " + link);
        }
        $timeout(function () {
          $ionicSlideBoxDelegate.$getByHandle('cpspics').update();
          $ionicSlideBoxDelegate.$getByHandle('cpspics').loop(true);
          $ionicSlideBoxDelegate.$getByHandle('salehelppic').update();
          $ionicSlideBoxDelegate.$getByHandle('salehelppic').slide(1);
          $ionicSlideBoxDelegate.$getByHandle('salehelppic').slide(0);
        }, 200);
        if ($scope.cpstask.pnum > 0) {
          $scope.showpnum = "block";
        } else {
          $scope.showpnum = "none";
        }
        if ($scope.cpstask.salehelppic != undefined && $scope.cpstask.salehelppic != "") {
          piclen = $scope.cpstask.salehelppic.length;
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
      });

      //帮忙卖推荐任务
      HelpSaleDetailService.getcpsRecommTask($stateParams.taskid, $rootScope.city).then(function (response) {
        $scope.recommandtask = response.data;
      }, function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
      });
    };
    $scope.getCpsTaskData();

    //教你卖
    $scope.getImgSrc = function (index) {
      $scope.bigpic = $scope.cpstask.salehelppic[index];
      $scope.salehelpdesc = $scope.cpstask.salehelpdesc[index];
      $(".teachYouSellDialog").show();
    };

    $(".teachYouSellDialog").click(function () {
      $(".teachYouSellDialog").hide();
    });

    $scope.showsupportflg = false;
    $scope.changeshowsupport = function () {
      $scope.showsupportflg = !$scope.showsupportflg;
    };

    //收藏任务
    $scope.storetask = function (isstore) {
      HelpSaleDetailService.storetask($scope.cpstask.taskid).then(function (response) {
        $scope.isstore = response.data.isstore;
        if (isstore == 0) {
          UtilService.showMess("收藏成功！");
          UtilService.tongji('taskstore', {'taskid': $scope.cpstask.taskid});
          UtilService.customevent("mycollection", "已收藏任务");
        } else {
          UtilService.showMess("取消成功！");
          UtilService.tongji('canceltaskstore', {'taskid': $scope.cpstask.taskid});
        }
        UtilService.collection = "1";
      })
    };

    $scope.goToShare = function () {
      $scope.go('selectcontact', {shareid: $scope.cpstask.taskid, name: $scope.cpstask.name, type: '7'});
      UtilService.customevent("cpstoshare", "APP内任务分享");
    };


    //跳转产品库
    $scope.goproduct = function () {
      if ($scope.cpstask.ngoods.length == 1) {
        $scope.go("gooddetailc", {"goods": $scope.cpstask.ngoods[0], "companyalias": $scope.cpstask.companyalias});
      } else {
        $scope.go("product", {"merchantid": $scope.cpstask.merchantid, "companyalias": $scope.cpstask.companyalias});
      }
      UtilService.customevent("cpstaskdetailpro", "跳转产品库");
    };

    //跳转cps销售支持列表
    $scope.goextensionactive = function () {
      if ($scope.cpstask.anum > 0) {
        $scope.go('extensionactive', {'taskid': $scope.cpstask.taskid});
        UtilService.customevent("cpstaskdetailhelpsale", "跳转销售支持");
      }
    };

    //打电话
    $scope.telShow = function () {
      var tel = $scope.cpstask.tel;
      var tt = [];
      for (var i = tel.length - 1; i >= 0; i--) {
        tt.unshift({'text': tel[i]})
      }
      $ionicActionSheet.show({
        buttons: tt,
        titleText: '<i class="icon icon-xt2-store-tel fl"></i><span class="fl">您想呼叫哪个号码</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          $window.location.href = "tel:" + tel[index];
          return true;
        }
      });
    };

    //提交leads
    $scope.addleads = function () {
      if ($scope.cpstask.pstatus == 1) {
        UtilService.showMess("该任务已暂停");
        return;
      }
      if ($scope.cpstask.status == 0) {
        UtilService.showMess("该任务未开始");
        return;
      }
      if ($scope.cpstask.status == 2 || $scope.cpstask.isdel == 1) {
        UtilService.showMess("该任务已结束");
        return;
      }
      var task = {'id': $scope.cpstask.taskid, 'field': $scope.cpstask.fieldname, 'name': $scope.cpstask.name};
      $scope.go("addcustomer", {"task": task, 'merchantid': $scope.cpstask.merchantid});
    };

    //教你卖图片点击（下一个）
    $scope.gonext = function (num) {
      if (num == 'NaN' || num == 'undefined') {
        $ionicSlideBoxDelegate.slide(1);
        return;
      }
      if (num < piclen) {
        $ionicSlideBoxDelegate.slide(num + 1);
      } else {
        $ionicSlideBoxDelegate.slide(0);
      }
    };

    //教你卖图片下一个点击
    $scope.goprev = function (num) {
      if (num == 'NaN' || num == 'undefined') {
        $ionicSlideBoxDelegate.slide(0);
        return;
      }
      if (num == 0) {
        $ionicSlideBoxDelegate.slide(piclen - 1);
      } else {
        $ionicSlideBoxDelegate.slide(num - 1);
      }
    };

    //跳转销售支持详情
    $scope.goNextPage = function (exac) {
      if (exac.type == 2) {
        $scope.go('coupon', {'taskid': $scope.cpstask.taskid, 'articleid': exac.articleid});
      } else if (exac.type == 3) {
        $scope.go('teamheadmodel', {'taskid': $scope.cpstask.taskid, 'articleid': exac.articleid});
      } else {
        $scope.go('goodarticle', {'taskid': $scope.cpstask.taskid, 'articleid': exac.articleid});
      }
    };

    //跳转任务详情
    $scope.gotaskdetail = function (task) {
      if (task.type == 1) {
        $scope.go('helpselldetail', {taskid: task.id})
      } else {
        $scope.go('taskdetail', {taskid: task.id})
      }
    };

    //自定义字段点击事件
    $scope.describClick = function (event) {
      UtilService.showcontentinapputil(event, 1);
    };
  })

  //cps推广活动
  .controller("ExtensionActiveController", function ($scope, ConfigService, UserService, UtilService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    var taskid = $stateParams.taskid;
    $scope.exaclist = [];
    $scope.noexten = "none";
    var totalpage;
    var pageno = 1;

    $scope.doRefersh = function () {
      pageno = 1;
      var params = {
        mod: "nStask",
        func: "getSaleSupportList",
        userid: UserService.user.id,
        data: {taskid: taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.exaclist = data.data;
          if (angular.isUndefined($scope.exaclist) || $scope.exaclist == "" || $scope.exaclist == null) {
            $scope.noexten = "block";
          } else {
            $scope.noexten = "none";
          }
        }
      }).error(function () {
        $scope.hasNextPage = false;
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.doRefersh();

    $scope.loadMore = function () {
      pageno++;
      var params = {
        mod: "nStask",
        func: "getSaleSupportList",
        userid: UserService.user.id,
        data: {taskid: taskid},
        page: {pageNumber: pageno, pageSize: 10}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          if (angular.isDefined(data.data) && data.data.length > 0) {
            $scope.exaclist = $scope.exaclist.concat(data.data);
          }
          $scope.hasNextPage = pageno < totalpage;
        }
      }).error(function () {
        $scope.hasNextPage = false;
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.goNextPage = function (exac) {
      if (exac.type == 0 || exac.type == 1) {
        $scope.go('goodarticle', {'taskid': taskid, 'articleid': exac.articleid});
      } else if (exac.type == 2) {
        $scope.go('coupon', {'taskid': taskid, 'articleid': exac.articleid});
      } else if (exac.type == 3) {
        $scope.go('teamheadmodel', {'taskid': taskid, 'articleid': exac.articleid});
      }
    }

  })

  .controller("ArticleActController", function ($scope, $rootScope, ConfigService, UserService, UtilService, $stateParams, $sce, $window, $timeout, $ionicPopup, BusinessIndexService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $rootScope.checkedList = [];
    });

    /*申请云销售失败弹窗hidemsgshow*/
    $scope.cantApplyPop = function() {
      $ionicPopup.show({
        title: $scope.showmsg,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){}
          },
          { text: '<span style="color: #ff3b30">查看原因</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.go('help');
            }
          }
        ]
      })
    };

    /*提示申请云销售弹窗 hidesaler*/
    $scope.toApplyPop = function() {
      var toApplyPopup = $ionicPopup.show({
        title:'申请成为云销售之后，<br/>才能分享活动并赚取佣金',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){}
          },
          { text: '<span style="color: #ff3b30">申请云销售</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.go('apply', {'merchantid': $scope.article.merchantid});
            }
          }
        ]
      })
    };

    var taskid = $stateParams.taskid;
    var articleid = $stateParams.articleid;
    $scope.shownum = false;
    $scope.hidemsg = false;
    $scope.backShare = function () {
      var params = {
        mod: "nStask",
        func: "acceptNTask",
        userid: UserService.user.id,
        data: {'taskid': taskid, 'tasktype': '1', 'articleid': articleid, 'showstatus': 0}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          $scope.shareurl = data.data.url;
          $scope.sharecode = data.data.code;
        } else if (data.status == '140001' || data.status == '140002') {
          $scope.hidemsg = true;
          $scope.showmsg = data.msg;
        }
      }, function () {
      })
    };
    $scope.backShare();
    $scope.ruleShow = function () {
      $('.article_rule').slideDown();
      UtilService.tongji('rule2', {'taskid': taskid, 'articleid': articleid});
      UtilService.customevent("rule2", "销售支持优惠券分享");
    };
    $('.article_rule').click(function () {
      $('.article_rule').slideUp();
    });

    $('.rule_closebtn').click(function () {
      $(this).parent().slideUp();
    });

    $("#cou_iframe").load(function () {
      $(".loadanimation").hide();
    });

    var getArticleUrl = function () {
      var params = {
        mod: "nStask",
        func: "getArticleUrl",
        userid: UserService.user.id,
        data: {articleid: articleid, taskid: taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.article = data.data;
        $scope.articleurl = $sce.trustAsResourceUrl($scope.article.url);
        $scope.shownum = data.data.type == 2;
        $scope.imageUrl = $scope.picserver + $scope.article.shareview;
      })
    };
    getArticleUrl();

    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      if (iosshareflg != 0) {
        return;
      }
      iosshareflg = 1;
      var url = $scope.shareurl;
      var sharetitle = $scope.article.sharetitle;
      $scope.ifopensharepopup = false;
      $window.simpleshare.simpleshowShare(function () {
        iosshareflg = 0;
      }, function () {
      }, sharetitle, $scope.imageUrl, url);
    };

    /*分享弹窗*/
    $scope.ifopensharepopup = false;
    $scope.closesharepopup = function () {
      $scope.ifopensharepopup = false;
    };
    var shareSuccess = function (mstr) {
      //返回全部分享任务刷新
      if (BusinessIndexService.sharetask.indexOf(taskid) < 0)
        BusinessIndexService.sharetask.push(taskid);
      UtilService.showMess1(mstr);
      var params = {
        mod: "nStask",
        func: "acceptNCode",
        userid: UserService.user.id,
        data: {'code': ($scope.sharecode + "")}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
      }, function () {
      })
    };
    $scope.shareSDK = function () {
      if (angular.isUndefined($scope.article)) {
        UtilService.showMess("页面加载中，请稍候");
        return;
      }
      if ($scope.article.stop == 1 || $scope.article.isaudit != 1) {
        UtilService.showMess("该活动已停止");
        return;
      }
      if ($scope.article.isdel == 1) {
        UtilService.showMess("该活动已结束");
        return;
      }
      UtilService.tongji('cpsshare', {'taskid': taskid, 'articleid': articleid});
      if ($scope.article.salerstatus == 9 || $scope.article.salerstatus == 2) {
       $scope.hidesaler = true;
        $scope.toApplyPop();
        return;
      } else if ($scope.article.salerstatus == 0) {
        UtilService.showMess("云销售申请中");
        return;
      }
      if ($scope.hidemsg) {
        $scope.cantApplyPop();
        return;
      }
      if (device.platform == "Android") {
        $scope.ifopensharepopup = true;
      } else {
        $scope.iosNewShare();
      }
    };

    var share = 0;
    //分享
    $scope.newShare = function (sharetype) {
      if (share != 0) {
        return;
      }
      share = 1;
      var url = $scope.shareurl;
      var sharetitle = $scope.article.sharetitle;
      var sharedisc = $scope.article.sharedisc;
      $scope.ifopensharepopup = false;
      if (sharetype == "weixin") {
        $window.weixinplugin.wxshare(function (resultData) {
          if (resultData == 0) {
            $ionicPopup.show({
              title: "分享文章建议安装QQ浏览器，是否安装？",
              buttons: [{
                text: "否",
                type: "button-cancel",
                onTap: function () {
                  $window.weixinplugin.wxlocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                }
              }, {
                text: "是",
                type: "button-cancel",
                onTap: function () {
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
            $ionicPopup.show({
              title: "分享文章建议安装QQ浏览器，是否安装？",
              buttons: [{
                text: "否",
                type: "button-cancel",
                onTap: function () {
                  $window.weixinplugin.wxzonelocalshare(sharetitle, sharedisc, $scope.imageUrl, url);
                }
              }, {
                text: "是",
                type: "button-cancel",
                onTap: function () {
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
            shareSuccess('QQ分享成功');
          }, function () {
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
          args.imageUrl = [$scope.imageUrl];
          YCQQ.shareToQzone(function () {
            shareSuccess('QQ空间分享成功');
          }, function () {
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
              shareSuccess("分享成功")
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
        cordova.plugins.clipboard.copy(url);
        UtilService.showMess1('已复制');
      }
      $timeout(function () {
        share = 0;
      }, 1500);
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'taskid': taskid, 'articleid': articleid});
    };

    var getViewReason = function () {
      var params = {
        mod: "nStask",
        func: "getViewReason",
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.shelp = data.data;
      })
    };

    $scope.goHelp = function () {
      $scope.go('helpdetail', {'helpid': $scope.shelp.id});
    };

    $scope.gotoshare = function () {
      if (angular.isUndefined($scope.article)) {
        UtilService.showMess("页面加载中，请稍候");
        return;
      }
      $scope.go('selectcontact', {shareid: taskid + "," + articleid, name: $scope.article.name, type: '8'});
      UtilService.customevent("xszctoshare", "销售支持优惠券分享");
      UtilService.tongji('xszctoshare', {shareid: taskid + "," + articleid, name: $scope.article.name, type: '8'});
    };

  });


