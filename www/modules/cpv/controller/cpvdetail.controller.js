/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("cpvDetailController", cpvDetailController);

  //依赖注入
  cpvDetailController.$inject = ['$scope', '$timeout', '$ionicModal','$stateParams', 'CpvService', 'UtilService', 'MsgService', 'UserService', 'BusinessIndexService','$ionicPopup','$ionicLoading'];
  function cpvDetailController($scope, $timeout, $ionicModal,$stateParams, CpvService, UtilService, MsgService, UserService, BusinessIndexService,$ionicPopup,$ionicLoading) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.$on("$ionicView.afterEnter", function () {
      document.addEventListener("backbutton", backbutton, false);

      //自动打开汉堡包. 方法里包含了判断逻辑。
      autoOpenHBG();

      if ($stateParams.taskid) {
        CpvService.getCPVDetail($stateParams.taskid).then(function (data) {
          if (data.status == "000000") {
            $scope.detail = data.data;
            $scope.detail.logo = $scope.detail.logo || "";
            if ($scope.detail.article.hastook == 1 || $scope.detail.article.isend == 1 || $scope.detail.article.restnum == 0) {
              $scope.canGetCoupon = true;
            }
            if ($scope.detail.article.hastook == 1) {
              $scope.couponstr = "已抢过";
            }
            if ($scope.detail.article.restnum == 0) {
              $scope.couponstr = "已抢完";
            }
            if ($scope.detail.article.isend == 1) {
              $scope.couponstr = "已结束";
            }
            $scope.detail.vtaskinfo.productintro = $scope.detail.vtaskinfo.productintro.split("\r\n");
            $scope.detail.vtaskinfo.needtoknow = $scope.detail.vtaskinfo.needtoknow.split("\r\n");
            if([0,1,2].indexOf($scope.detail.article.catagory) != -1){
              $scope.cssClass = $scope.detail.article.color;
            }
            $timeout(function () {
              var getLen = parseInt($(".goodsInforText p").height());
              if (getLen >= 100) {
                $scope.showMoreBtn = true;
              }
            }, 0);

            CpvService.backShare($scope.detail.vtaskinfo.articleid, $stateParams.taskid, '2', 0).then(function (data) {
              if (data.status == "000000") {
                $scope.shareurl = data.data.url;
                $scope.sharecode = data.data.code;
                if ($scope.sharecode) {
                  $scope.hasShareCode = true;
                }
              } else {
                UtilService.showMess(data.msg);
              }
            }, function () {

            }).finally(function () {
            });
          } else {
            UtilService.showMess(data.msg);
          }
        }, function (err) {

        });
      }
    });

    $scope.$on("$ionicView.beforeLeave", function () {
      document.removeEventListener("backbutton", backbutton, false);
    });


    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    $scope.showhideText = "展开";
    $scope.setArrow = true;
    $scope.textshowhide = true;
    $scope.showMoreBtn = false;
    $scope.canGetCoupon = false;
    $scope.couponstr = '自己抢';
    $scope.hasShareCode = false;
    $scope.cssClass = "voidClass";

    $scope.clickMore = function () {
      if ($scope.setArrow) {
        $scope.setArrow = false;
        $scope.textshowhide = false;
        $scope.showhideText = "收起";
      } else {
        $scope.setArrow = true;
        $scope.textshowhide = true;
        $scope.showhideText = "展开";
      }
    }

    var backbutton = function () {
      if (modalIsOpen == true) {
        modalIsOpen = false;
        return;
      }

      if ($scope.showcpvpic == true) {
        $scope.showcpvpic = false;
        $scope.$apply();
        return;
      }

      $scope.goback();

    };

    var modalIsOpen = false;
    $ionicModal.fromTemplateUrl('cpvRulesBox.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openHambgModal = function () {
      $scope.modal.show();
      modalIsOpen = true;
    };
    $scope.closeHambgModal = function () {
      $scope.modal.hide();
      modalIsOpen = false;
    };

    $scope.showcpvhbgBtn = true;
    $scope.hidecpvhbg = function () {
      $scope.showcpvhbgBtn = false;
    }
    $scope.showcpvhbg = function () {
      $scope.showcpvhbgBtn = true;
    }

    var storeflg = 0;
    $scope.toggleCollect = function () {
      if (storeflg != 0) {
        return;
      }
      storeflg = 1;
      CpvService.toggleCollect($stateParams.taskid).then(function (data) {
        if (data.status == '000000') {
          $scope.detail.isstoret = 1 - $scope.detail.isstoret;
          if ($scope.detail.isstoret === 1) {
            UtilService.showMess("收藏成功！");
            UtilService.tongji('ctaskstore', {'taskid': $stateParams.taskid});
            UtilService.customevent("mycollection", "已收藏任务");
          } else {
            UtilService.showMess("取消成功！");
            UtilService.tongji('cancelctaskstore', {'taskid': $stateParams.taskid});
          }
        }
        $timeout(function () {
          storeflg = 0;
        }, 2000);
      }, function () {
        $timeout(function () {
          storeflg = 0;
        }, 2000);
      });
    };

    $scope.gochat = function () {
      if ($scope.detail.isstorem === 0) {
        //未关注商家
        BusinessIndexService.concernBusiness($scope.detail.merchantid).then(function (response) {
          if (response.status == '000000') {
            if (response.data.msg == "0") {
              createTemporaryChat();
            }
          } else {
            UtilService.showMess(response.msg);
          }
        }, function () {
          UtilService.showMess("网络不给力，请稍后重试");
        });
      } else {
        //已关注商家
        createTemporaryChat();
      }

    };

    function createTemporaryChat() {
      MsgService.createTemporaryChat($scope.detail.merchantid).then(function (data) {
        if (data.status == "000000") {
          $scope.go('msgdetail', {
            'imgroupid': data.data.imgroupid,
            'otheruserid': $scope.detail.merchantid,
            'otherusername': $scope.detail.alias,
            'istmp': data.data.istmp,
            'avate': $scope.detail.logo
          });
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      });
    }

    $scope.gobusiness = function () {
      $scope.go('business', {merchantid: $scope.detail.merchantid});
    };

    var flg = false;
    $scope.share = function () {
      if ($scope.detail == null || $scope.detail.status != 1) {
        return;
      }
      if (device.platform == "iOS") {
        var shareurl = $scope.shareurl;
        var imageurl = $scope.picserver + $scope.detail.shareview;
        var sharetitle = $scope.detail.taskname;
        var sharedesc = $scope.detail.sharedetail;
        if (shareurl == null) {
          return;
        }
        CpvService.iosNewShare(shareurl, imageurl, sharetitle, sharedesc).then(function (data) {
          if (data == "success") {
            CpvService.acceptNCode($scope.sharecode).then(function () {
            }, function () {
            });
            UtilService.showMess("分享成功");
          }
          flg = false;
        }, function () {
          flg = false;
        });
      } else {
        //弹出分享选择框
        $scope.ifopensharepopup = true;
        flg = false;
      }
    };

    $scope.androidShare = function (sharetype) {
      var shareurl = $scope.shareurl;
      var imageurl = $scope.picserver + $scope.detail.shareview;
      var sharetitle = $scope.detail.taskname;
      var sharedesc = $scope.detail.sharedetail;
      if (shareurl == null) {
        return;
      }
      $scope.ifopensharepopup = false;
      CpvService.androidShare(sharetype, shareurl, imageurl, sharetitle, sharedesc).then(function (data) {
        UtilService.showMess(data);
        if (sharetype != "copylink") {
          CpvService.acceptNCode($scope.sharecode).then(function () {
          }, function () {
          });
        }
        flg = false;
      }, function (data) {
        UtilService.showMess(data);
        flg = false;
      });
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'taskid': $stateParams.taskid});
    };

    $scope.cancelShare = function () {
      $scope.ifopensharepopup = false;
    };

    var autoOpenHBG = function () {
      //汉堡包默认打开判断
      try {
        plugins.appPreferences.fetch(function (count) {
          if (count == null) {

            $scope.putData("cpvhamburger", 1);
            $scope.openHambgModal();
          } else {
            if (count <= 2) {
              $scope.openHambgModal();
              $scope.putData("cpvhamburger", count + 1);
            } else {
              $scope.bgfade = true;
            }
          }
        }, function (count) {
        }, "cpvhamburger");
      }
      catch (e) {
      }
    };

    $scope.showcpvpic = false;
    $scope.picgetbig = function (index) {
      $scope.showcpvpic = true;
      $scope.showimgIndex = index;
      $timeout(function () {
        var picNum = $('.picSlide').find('.big-pic');
        for (var i = 0; i < picNum.length; i++) {
          var currnetImg = picNum.eq(i);
          var a = currnetImg.height() / currnetImg.width();
          var sW = window.screen.width;
          var sh = 640 * window.screen.height / window.screen.width;
          if (a < window.screen.height / window.screen.width) {
            currnetImg.css('margin-top', sh / 2 - currnetImg.height() / 2 + 'px');
          } else {
            currnetImg.css('margin-left', 640 / 2 - currnetImg.width() / 2 + 'px');
          }
          currnetImg.css("opacity", "1");
          currnetImg.show();
        }
      }, 50);
    };
    $scope.shrinkPic = function () {
      $('.big-pic').hide();
      $scope.showcpvpic = false;
    };
    $scope.setcollection = true;
    $scope.changeCollection = function () {
      if ($scope.setcollection) {
        $scope.setcollection = false;
      } else {
        $scope.setcollection = true;
      }
    };

    var cpvflag = true;
    $scope.getCPVCoupon = function () {
      if (cpvflag) {
        cpvflag = false;
        if (!$scope.canGetCoupon) {
          var code = $scope.sharecode;
          $ionicLoading.show({
            template: '<span style="font-size:25px;">请稍后...</span>'
          });
          CpvService.getCPVCoupon($stateParams.taskid, $scope.detail.vtaskinfo.articleid, code, UserService.user.tel).then(function (data) {
            if (data.status == "000000") {
              $scope.detail.article.restnum = $scope.detail.article.restnum - 1;
              $scope.canGetCoupon = true;
              $scope.couponstr = '已抢过';
              $ionicPopup.show({
                title: '领取成功！可以在个人中心-我的优惠券查看和使用！',
                scope: $scope,
                buttons: [{
                  text: '<span style="color:#007aff">前往查看</span>',
                  type: 'button-positive',
                  onTap: function (e) {
                    $scope.go('couponlist',{coupontype:'1'});
                  }
                },
                  {
                    text: '<span style="color:#ff3b30">留在本页 </span>',
                    type: 'button-go',
                    onTap: function (e) {
                      return;
                    }
                  }

                ]
              });

            } else {
              UtilService.showMess(data.msg);
            }
          }, function () {
            UtilService.showMess("网络不给力，请稍后刷新");
          }).finally(function () {
            cpvflag = true;
            $ionicLoading.hide();
          });
        }
      }

    };
  }
}());
