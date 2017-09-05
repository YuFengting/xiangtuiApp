angular.module('xtui')
//提交客户信息页面
  .controller("teamHeadController", function ($scope, $rootScope, $filter, UtilService, ConfigService, UserService, TeamHeadService, $ionicActionSheet, $stateParams, $timeout, $window, $ionicPopup) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $rootScope.checkedList = [];
    });

    $scope.userid = UserService.user.id;
    $scope.picserver = ConfigService.picserver;
    $scope.articleid = $stateParams.articleid;
    $scope.taskid = $stateParams.taskid;
    $scope.shareTeamHeadId = $scope.taskid + "," + $scope.articleid;
    $scope.avate = "";
    $scope.domain = "";
    $scope.article = {};
    $scope.statustext = "申请团长";
    var teamHeadDetail = function () {
      TeamHeadService.getTeamHeadDetail($scope.articleid).then(function (response) {
        $scope.article = response.data;
        $scope.domain = $scope.article.domain;
        if ($scope.article.status == 1) {
          $scope.statustext = "分享";
        } else if ($scope.article.status == 0) {
          $scope.statustext = "等待审核";
        }
        if (angular.isDefined($scope.article.head) && $scope.article.head != "" && $scope.article.head != null) {
          $(".headerImg").html("<img src='" + $scope.picserver + $scope.article.head + "' />");
        }
      }, function (err) {
        UtilService.showMess("错误");
      });
    };
    teamHeadDetail();

    $scope.ruleShow = function () {
      $('.article_rule').slideDown();
      UtilService.tongji('rule2', {'taskid': $scope.taskid, 'articleid': $scope.articleid});
      UtilService.customevent("rule2", "销售支持团长活动分享");
    };
    $('.article_rule').click(function () {
      $('.article_rule').slideUp();
    });

    $('.rule_closebtn').click(function () {
      $(this).parent().slideUp();
    });

    $scope.goToShare = function () {
      $scope.go('selectcontact', {shareid: $scope.shareTeamHeadId, name: $scope.article.name, type: '13'});
      UtilService.customevent("xszctoshare", "销售支持团长活动分享");
      UtilService.tongji('xszctoshare', {shareid: $scope.shareTeamHeadId, name: $scope.article.name, type: '13'});
    };

    //获取相机
    $scope.getPicture = function (picType) {
      var cameraOptions = {
        quality: 100,//0-100
        destinationType: Camera.DestinationType.DATA_URL,//DATA_URL或FILE_URI
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,//PHOTOLIBRARY或CAMERA
        encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
        targetWidth: 120,//像素
        targetHeight: 120,//像素
        //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
        allowEdit: false,
        cropwindow:0  //0正方形 1长方形 2无限制
      };
      if (picType == 1) {
        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
      }
      navigator.camera.getPicture(function (imageData) {
        $scope.$apply(function () {
          $scope.picture = imageData;
          var avateData = {
            mod: 'nStask',
            func: 'setTeamHead',
            userid: UserService.user.id,
            data: {avate: $scope.picture, gbuyid: $scope.article.gbuyid}
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(avateData)}).success(function (data) {
            if (data.status == '000000') {
              $scope.article.head = $scope.avate = data.data.avate;
              $(".headerImg").html("<img src='" + $scope.picserver + data.data.avate + "' />");
            } else if (data.status != '500004') {
              $scope.showMess(data.msg);
            }
          })
        });
      }, function (message) {
      }, cameraOptions);
    };

    $scope.checkRlname = function () {
      if ($("#rlname").val().length >= 30) {
        UtilService.showMess("团购商品详情请限制字数在30个汉字以内!");
        return false;
      }
    };

    $scope.checkRldisc = function () {
      if ($("#rldisc").val().length >= 50) {
        UtilService.showMess("团长说请限制字数在50个汉字以内!");
        return false;
      }
    };

    //选择头像
    $scope.headShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '从手机相册选择'},
          {text: '拍照'}
        ],
        titleText: '<i class="icon icon-xt2-xiaolian fl"></i><span class="fl">更换头像</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          $scope.getPicture(index);
          return true;
        }
      });
    };

    $scope.updateGbuy = function (e) {
      if ($scope.article.isstop == 1) {
        UtilService.showMess("该活动已停止!");
        return false;
      }
      var rlname = $("#rlname").val();
      if (rlname == "") {
        UtilService.showMess("请填写团购商品详情!");
        return false;
      }
      if (rlname.length >= 30) {
        UtilService.showMess("团购商品详情请限制字数在30个汉字以内!");
        return false;
      }
      if (rlname == "") {
        UtilService.showMess("请填写团长说!");
        return false;
      }
      if (rlname.length >= 50) {
        UtilService.showMess("团长说请限制字数在50个汉字以内!");
        return false;
      }
      if ($scope.avate == "" && $scope.article.head == "") {
        UtilService.showMess("请上传头像!");
        return false;
      }
      $scope.article.name = rlname;
      $scope.article.mrdisc = $("#rldisc").val();
      var rlid = "";
      if (angular.isDefined($scope.article.rlid) && $scope.article.rlid != "" && $scope.article.rlid != null) {
        rlid = $scope.article.rlid;
      }
      var params = {
        mod: "nStask",
        func: "saveTeamHeadExamine",
        userid: UserService.user.id,
        data: {
          articleid: $scope.articleid,
          taskid: $scope.taskid,
          rlid: rlid,
          gbuyid: $scope.article.gbuyid,
          name: $scope.article.name,
          mrdisc: $scope.article.mrdisc,
          head: $scope.article.head
        }
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.showMess("您的团长活动已经成功提交商家审核，审核通过之后即可作为您的专属活动分享推广.");
          insertIMContent(data.data.gbuyid, $scope.article.name);
          $timeout(function () {
            $scope.goback();
          }, 200);
        }
        e.preventDefault();
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后重试。");
        e.preventDefault();
      });
      UtilService.customevent("teamheadexamine", "提交审核");
    };

    var insertIMContent = function (gbuyid, name) {
      $scope.dt1 = new Date();
      $scope.dt2 = $filter("date")($scope.dt1, "yyyy-MM-dd HH:mm:ss");
      var content_str = "您于" + $scope.dt2 + "针对" + name + "的任务提交了一个活动申请，请耐心等待商家审核";
      var params = {
        mod: "IM",
        func: "insertIMMessage",
        userid: UserService.user.id,
        data: {
          type: 7,
          content: content_str,
          receiverid: UserService.user.id
        }
      };
      UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(params)}).success(function (data) {
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后重试。");
      });
      params.data.content = gbuyid;
      params.data.receiverid = $scope.article.merchantid;
      params.data.subtype = 1;
      UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(params)}).success(function (data) {
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后重试。");
      });
    };

    /*分享弹窗*/
    $scope.ifopensharepopup = false;
    $scope.closesharepopup = function () {
      $scope.ifopensharepopup = false;
    };

    var shareflg = 0;
    $scope.goTeamHeadOrShare = function (article) {
      if ($scope.article.isstop == 1) {
        UtilService.showMess("该活动已停止!");
        return false;
      }
      if ($scope.article.isdel == 1) {
        UtilService.showMess("该活动已结束");
        return;
      }
      UtilService.tongji('cpsshare', {'taskid': $scope.taskid, 'articleid': $scope.articleid});
      if (article.issaler > 0) {
        if (article.status == 1) {
          if (shareflg != 0) {
            return;
          }
          shareflg = 1;
          var params = {
            articleid: $scope.articleid,
            taskid: $scope.taskid,
            merchantid: article.merchantid
          };
          TeamHeadService.saveWork(params).then(function (response) {
            var code = response.data.code;
            $scope.teamimgurl = $scope.picserver + article.shareview;
            $scope.teamsonstr = "jsonstr={'mod':'nStask','func':'updateUserActShowStatus','data':{'articleid':'" + $scope.articleid + "'}}";
            $scope.teamurl = $scope.domain + "/teamhead/teamheadshare?articleid=" + $scope.articleid + "&code=" + code;
            if (device.platform == "Android") {
              $scope.ifopensharepopup = true;
            } else {
              $scope.iosNewShare();
            }
          }, function () {
          });
          $timeout(function () {
            shareflg = 0
          }, 1000);
        } else if (article.status == -1 || article.status == 2) {
          $scope.go('teamheadexamine', {taskid: $scope.taskid, articleid: article.articleid});
        }
      } else {
        if (article.issalersh > 0) {
          UtilService.showMess("云销售申请中！");
        } else {
          $scope.toApplyPop();
        }
      }
      UtilService.tongji("sshare", {taskid: $scope.taskid, articleid: article.articleid});
    };
    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      if (iosshareflg != 0) {
        return;
      }
      iosshareflg = 1;
      var url = $scope.teamurl;
      var sharetitle = $scope.article.sharetitle;
      var sharedisc = $scope.article.sharedisc;
      $scope.imageUrl = $scope.teamimgurl;
      $window.simpleshare.simpleshowShare(function () {
        iosshareflg = 0;
      }, function () {
      }, sharetitle, $scope.imageUrl, url);
    };

    //分享
    var newshareflg = 0;
    $scope.newShare = function (sharetype) {
      if (newshareflg != 0) {
        return;
      }
      newshareflg = 1;
      var url = $scope.teamurl;
      var sharetitle = $scope.article.sharetitle;
      var sharedisc = $scope.article.sharedisc;
      $scope.imageUrl = $scope.teamimgurl;
      $scope.ifopensharepopup = false;
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
        }, sharetitle, sharedisc, $scope.imageUrl, url, "s", ConfigService.wxserver, ConfigService.logtoken);
      } else if (sharetype == "wxZone") {
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
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'taskid': $scope.taskid, 'articleid': $scope.articleid});
    };

    //xtui3.0滚动时候的图标显示隐藏
    $scope.scrollHide = function () {
      $('.startbtn').fadeOut();
    };
    $scope.scrollShow = function () {
      $('.startbtn').fadeIn();
    };

    $scope.goExtensionactive = function () {
      $scope.goback();
    };

    $scope.goTeamHeadExamine = function () {
      $scope.go('apply', {merchantid: $scope.article.merchantid});
      UtilService.customevent("teamheadmodel", "团长申请");
    };

    /*监听软键盘事件，控制浮动按钮，勿删*/
    $window.addEventListener('native.keyboardshow', keyboardShowHandler);
    function keyboardShowHandler(e) {
      $("#startbutton").hide();
    }

    $window.addEventListener('native.keyboardhide', keyboardHideHandler);
    function keyboardHideHandler(e) {
      $("#startbutton").show();
    }


    /*申请云销售失败弹窗*/
    $scope.cantApplyPop = function() {
      var cantApplyPopup = $ionicPopup.show({
        title: $scope.showmsg,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){
            }
          },
          { text: '<span style="color: #ff3b30">查看原因</span>',
            type: 'button-positive',
            onTap:function(){
            }
          }
        ]
      })
    };

    /*提示申请云销售弹窗*/
    $scope.toApplyPop = function() {
      var toApplyPopup = $ionicPopup.show({
        title:'申请成为云销售之后，<br/>才能申请团长并分享活动赚取佣金',
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){
            }
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

  });
