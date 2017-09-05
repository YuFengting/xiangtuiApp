angular.module('xtui')
  .directive("cloudsaleContentScroll", function () {
    return {
      restrict: 'EA',
      link: function ($scope, ele) {
        $(ele[0]).scroll(function () {
          var getindexTop = (device.platform == "Android") ? $(ele[0]).scrollTop() : $scope.conscroll.getScrollPosition().top;
          var opty = 0.3 - getindexTop / 312;
          //滚动条向下拉动时的事件方法
          if (getindexTop <= 0) {
          } else {
            $(".cloudsale_header").css("background", "rgba(255,59,48," + getindexTop / 312 + ")");
            $(".cloudsale_header .title").css('opacity', getindexTop / 312);
          }
          if (getindexTop < 10) {
            $(".cloudsale_header").css("background", "rgba(255,59,48,0)");
            $(".cloudsale_header .title").css('opacity', 0);
          }
          if (getindexTop > 320) {
            $(".cloudsale_header").css("background", "rgba(255,59,48,1)");
            $(".cloudsale_header .title").css('opacity', 1);
          }
        });
      }
    }
  })
  .controller('BusinessIndexController', function ($rootScope, $scope, $timeout, UtilService, SqliteUtilService, UserService, ConfigService, $ionicSlideBoxDelegate, BusinessIndexService, $ionicScrollDelegate, $ionicModal) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      var boxH = document.documentElement.clientHeight;
      var _height;
      if (device.platform == "Android") {
        //Android
        _height = boxH - 242;
      } else {
        //IOS
        var screenW0 = window.screen.width;
        var stateH0 = 640 * 20 / screenW0;
        _height = boxH - 242 - stateH0;
      }
      $(".industrySlideBox").css({'height': _height + 'px'});
      if ($scope.sortlist) {
        if ($scope.sortlist.length <= 4) {
          $(".borderBot").css("left", "24px");
          $scope.homeMenuStyle = {'width': "100%", "display": "flex", "display": "-webkit-flex"};
          $(".indexlist-nav li").css({"flex": 1, "-webkit-flex": 1});
        } else {
          $(".borderBot").css("left", "35px");
          var navwidth = indexnav_w * $scope.sortlist.length;
          $scope.homeMenuStyle = {'width': navwidth + 'px'};
        }
      }
    });

    $scope.conscroll = $ionicScrollDelegate.$getByHandle('bindexlist');

    //参数初始化
    $scope.totalbuserlist = [];//存放所有排序列表[[0],[1],[2],[3]...]
    $scope.totalpageno = [];//记录各排序列表pageno[[0],[1],[2],[3]...]
    $scope.querytype = 1;
    $scope.hasNextPage = false;
    $scope.totalHasNextPage = [];//记录各排序列表是否有下一页[[true],[true],[false],[false]...]
    $scope.chooseindustry = "";
    $scope.industryid = "";
    $scope.chooseindustrylist = [];
    $scope.showindustry = "none";
    $scope.localindustry = [];//存入本地行业信息
    $scope.listloadding = false;
    $scope.masktype = 0;
    $scope.nobuser = "none";
    var indexnav_w = 0;

    /*下标滑动*/
    $scope.clicknav = function (sort) {
      $scope.borderIndexBotStyle = {
        'transform': 'translateX(' + (sort.id - 1) * indexnav_w + 'px)',
        '-webkit-transform': 'translateX(' + (sort.id - 1) * indexnav_w + 'px)'
      };
      if ($scope.choosesort.id == sort.id) {
        return;
      }
      $scope.choosesort = sort;
      $scope.hasNextPage = angular.copy($scope.totalHasNextPage[$scope.choosesort.sort]);
      BusinessIndexService.setPageNo($scope.totalpageno[$scope.choosesort.sort]);
      if ($scope.totalbuserlist[$scope.choosesort.sort].length == 0) {
        $scope.getBuserList();
      }
      if ($scope.sortlist.length > 4) {
        var index = sort.sort;
        var centerlen = 180 * (index + 1 / 2) - 320;
        var getX = 180 * $scope.sortlist.length;
        var movelength = getX - 640;
        if (index == 0 || index == 1) {
          $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(0, 0);
        } else if (index == $scope.sortlist.length - 2 || index == $scope.sortlist.length - 1) {
          $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(movelength, 0);
        } else {
          $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(centerlen, 0);
        }
      }
      UtilService.tongji('bindextab', {'type': sort.value});
      UtilService.customevent("bindextab", "cpssort:" + sort.value);
    };

    /*页面离开之前触发*/
    $scope.$on("$ionicView.beforeLeave", function () {
      $scope.showindustry = "none";
      $scope.closeModal()
    });
    $scope.$on("$ionicView.afterEnter", function () {
      $timeout(function () {
        $ionicSlideBoxDelegate.$getByHandle('BindexImgList').start();
      }, 100)
    });

    var getRecommendBuser = function () {
      var params = {
        mod: "nStask",
        func: "getRecommendBuser",
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.recbuser = data.data.busernum;
          $scope.recbuserlist = data.data.recbuser;
          $ionicSlideBoxDelegate.$getByHandle('BindexImgList').update();
          $ionicSlideBoxDelegate.$getByHandle('BindexImgList').loop(true);
          $timeout(function () {
            $ionicSlideBoxDelegate.update();
          }, 50);
          SqliteUtilService.insertDataOfList($scope.recbuserlist, "reccompany");
        }
      }).error(function () {
        SqliteUtilService.selectData("reccompany").then(function (result) {
          if (result.length > 0) {
            $scope.recbuserlist = result;
            $ionicSlideBoxDelegate.$getByHandle('BindexImgList').update();
            $ionicSlideBoxDelegate.$getByHandle('BindexImgList').loop(true);
          }
        }, function () {
        })
      })
    };
    getRecommendBuser();

    //存本地行业分类
    var putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    //获取行业分类
    var initIndustrylist = function () {
      var params = {
        mod: "nStask",
        func: "getIndustryList",
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.industrylist = data.data;
          //行业刷新时，与本地选中分类对应
          if ($scope.chooseindustrylist.length != 0) {
            for (var j = 0; j < $scope.chooseindustrylist.length; j++) {
              for (var l = 0; l < $scope.chooseindustrylist[j].industryList.length; l++) {
                if ($scope.chooseindustrylist[j].industryList[l].secflg == 1) {
                  for (var i = 0; i < $scope.industrylist.length; i++) {
                    for (var k = 0; k < $scope.industrylist[i].industryList.length; k++) {
                      if ($scope.chooseindustrylist[j].industryList[l].id == $scope.industrylist[i].industryList[k].id) {
                        $scope.industrylist[i].industryList[k].secflg = 1;
                      }
                    }
                  }
                }
              }
            }
          }
          remove();
          $scope.localindustry = [];
          $scope.localindustry.push($scope.chooseindustry);
          $scope.localindustry.push($scope.industrylist);
          putData("industrylist", $scope.localindustry);
        }
      })
    };

    //清空本地行业分类
    var remove = function () {
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'industrylist');
    };

    $scope.city = "";
    $scope.doRefresh = function () {
      BusinessIndexService.refresh($scope.chooseindustry, $scope.choosesort.value, $scope.city, $scope.choosesort.sort).then(function () {
        $scope.totalbuserlist[$scope.choosesort.sort] = BusinessIndexService.getBuserList($scope.choosesort.sort);
        $scope.hasNextPage = BusinessIndexService.hasNextPage();
        $scope.totalHasNextPage[$scope.choosesort.sort] = angular.copy($scope.hasNextPage);
        $scope.totalpageno[$scope.choosesort.sort] = angular.copy(BusinessIndexService.getPageNo());
        if (angular.isUndefined($scope.totalbuserlist[$scope.choosesort.sort]) || $scope.totalbuserlist[$scope.choosesort.sort].length == 0) {
          $scope.nobuser = "block";
        } else {
          $scope.nobuser = "none";
        }
        if ($scope.choosesort.value == "" && $scope.totalbuserlist[$scope.choosesort.sort].length > 0 && angular.isDefined($scope.totalbuserlist[$scope.choosesort.sort])) {
          SqliteUtilService.insertDataOfList($scope.totalbuserlist[$scope.choosesort.sort], "companylist");
        }
      }, function () {
        SqliteUtilService.selectData("companylist").then(function (result) {
          if (angular.isUndefined(result) || result.length == 0) {
            $scope.nobuser = "block";
          } else {
            $scope.totalbuserlist[$scope.choosesort.sort] = result;
          }
        }, function () {
        });
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        initIndustrylist();
        getRecommendBuser();
      });
    };

    $scope.getBuserList = function () {
      $scope.listloadding = true;
      BusinessIndexService.refresh($scope.chooseindustry, $scope.choosesort.value, $scope.city, $scope.choosesort.sort).then(function () {
        $scope.totalbuserlist[$scope.choosesort.sort] = BusinessIndexService.getBuserList($scope.choosesort.sort);
        $scope.hasNextPage = BusinessIndexService.hasNextPage();
        $scope.totalHasNextPage[$scope.choosesort.sort] = angular.copy($scope.hasNextPage);
        $scope.totalpageno[$scope.choosesort.sort] = angular.copy(BusinessIndexService.getPageNo());
        if (angular.isUndefined($scope.totalbuserlist[$scope.choosesort.sort]) || $scope.totalbuserlist[$scope.choosesort.sort].length == 0) {
          $scope.nobuser = "block";
        } else {
          $scope.nobuser = "none";
        }
        if ($scope.choosesort.value == "" && $scope.totalbuserlist[$scope.choosesort.sort].length > 0 && angular.isDefined($scope.totalbuserlist[$scope.choosesort.sort])) {
          SqliteUtilService.insertDataOfList($scope.totalbuserlist[$scope.choosesort.sort], "companylist");
        }
      }, function () {
        SqliteUtilService.selectData("companylist").then(function (result) {
          if (angular.isUndefined(result) || result.length == 0) {
            $scope.nobuser = "block";
          } else {
            $scope.totalbuserlist[$scope.choosesort.sort] = result;
          }
        }, function () {
        });
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.listloadding = false;
      });
    };

    $scope.loadMore = function () {
      BusinessIndexService.pagination($scope.chooseindustry, $scope.choosesort.value, $scope.city, $scope.choosesort.sort).then(function () {
        $scope.totalbuserlist[$scope.choosesort.sort] = BusinessIndexService.getBuserList($scope.choosesort.sort);
        $scope.hasNextPage = BusinessIndexService.hasNextPage();
        $scope.totalHasNextPage[$scope.choosesort.sort] = angular.copy($scope.hasNextPage);
        $scope.totalpageno[$scope.choosesort.sort] = angular.copy(BusinessIndexService.getPageNo());
      }, function () {
        UtilService.showMess("网络不给力，请稍后重试！");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    //获取本地行业分类
    var getData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          if (resultData == null || resultData == "" || resultData == undefined) {
            initIndustrylist();
          } else {
            $scope.chooseindustry = resultData[0];
            $scope.industrylist = $scope.chooseindustrylist = resultData[1];
          }
        }, function () {
          initIndustrylist();
        }, 'industrylist');
      }
      catch (e) {
        initIndustrylist();
      }
    };
    getData();

    //排序
    BusinessIndexService.getIndexType().then(function (data) {
      $scope.sortlist = [];
      var totallist = [];
      angular.forEach(data.data, function (val, n) {
        $scope.sortlist.push({"id": n + 1, "name": val.name, "value": val.indexvalue, "sort": n});
        $scope.totalbuserlist.push([]);
        $scope.totalHasNextPage.push([]);
        $scope.totalpageno.push([1]);
        totallist.push([]);
      });
      $scope.choosesort = $scope.sortlist[0];
      BusinessIndexService.setTotalList(totallist);
      if ($scope.sortlist.length > 4) {
        indexnav_w = 180;
        $scope.homeMenuStyle = {'width': ($scope.sortlist.length * indexnav_w) + 'px'};
      } else {
        indexnav_w = 640 / $scope.sortlist.length;
        $(".borderBot").css("left", "24px");
        $scope.homeMenuStyle = {'width': "100%", "display": "flex", "display": "-webkit-flex"};
        $(".indexlist-nav li").css({"flex": 1, "-webkit-flex": 1});
      }
      $scope.getBuserList();
    }, function () {
      $scope.choosesort = {"id": 0, "name": "推荐", "value": "recommand", "sort": 0};
      $scope.getBuserList();
    });
    $scope.goHelpselldetail = function (taskid, sort) {
      if (BusinessIndexService.readedarr.indexOf(taskid) < 0)
        BusinessIndexService.readedarr.push(taskid);
      $scope.cleargo('helpselldetail', {taskid: taskid, sort: sort});
    };

    $scope.checkReaded = function (id) {
      var list = BusinessIndexService.readedarr;
      return list.indexOf(id) >= 0;
    };

    $scope.checkShare = function (id) {
      var list = BusinessIndexService.sharetask;
      return list.indexOf(id) >= 0;
    };

    //选中分类
    $scope.chooseCss = function (industry) {
      if (industry.secflg == 1) {
        //去除分类 （1：分类条件删除  ）
        if ($scope.chooseindustry.indexOf(industry.name) == 0) {
          var tt = $scope.chooseindustry.replace(industry.name + " OR ", "");
          $scope.chooseindustry = tt.replace(industry.name, "");
          var ss = $scope.industryid.replace(industry.id + " OR ", "");
          $scope.industryid = ss.replace(industry.name, "");
        } else {
          $scope.chooseindustry = $scope.chooseindustry.replace(" OR " + industry.name, "");
          $scope.industryid = $scope.industryid.replace(" OR " + industry.id, "");
        }
        //2：选中分类列表删除
        for (var i = 0; i < $scope.industrylist.length; i++) {
          for (var j = 0; j < $scope.industrylist[i].industryList.length; j++) {
            if ($scope.industrylist[i].industryList[j].id == industry.id) {
              $scope.industrylist[i].industryList[j].secflg = 0;
            }
          }
        }
      } else {
        //选中分类 （1：分类条件拼接  ）
        if ($scope.chooseindustry == "") {
          $scope.chooseindustry = industry.name;
          $scope.industryid = industry.id;
        } else {
          $scope.chooseindustry = $scope.chooseindustry + " OR " + industry.name;
          $scope.industryid = $scope.industryid + " OR " + industry.id;
        }
        //2：未选中分类列表添加
        for (var i = 0; i < $scope.industrylist.length; i++) {
          for (var j = 0; j < $scope.industrylist[i].industryList.length; j++) {
            if ($scope.industrylist[i].industryList[j].id == industry.id) {
              $scope.industrylist[i].industryList[j].secflg = 1;
            }
          }
        }
      }
      $scope.chooseindustrylist = $scope.industrylist;
      UtilService.customevent("industry", industry.name);
    };

    //修改行业分类，重置页面数据
    var restPageData = function () {
      var totallist = [];
      $scope.totalbuserlist = [];
      $scope.totalHasNextPage = [];
      $scope.totalpageno = [];
      for (var i = 0; i < $scope.sortlist.length; i++) {
        $scope.totalbuserlist.push([]);
        $scope.totalHasNextPage.push([]);
        $scope.totalpageno.push([1]);
        totallist.push([]);
      }
      BusinessIndexService.setTotalList(totallist);
    };

    //确认分类 刷新列表
    $scope.chooseIndustry_su = function () {
      restPageData();
      $ionicScrollDelegate.$getByHandle('bindexlist').scrollTop();
      $scope.getBuserList();
      $scope.showindustry = "none";//关闭行业分类
      $scope.closeModal();
      //存入本地行业信息
      remove();
      $scope.localindustry = [];
      $scope.localindustry.push($scope.chooseindustry);
      $scope.localindustry.push($scope.industrylist);
      putData("industrylist", $scope.localindustry);
      UtilService.tongji('industry', {'industry': $scope.chooseindustry, 'industryid': $scope.industryid});
    };

    /*打开行业选择*/
    $ionicModal.fromTemplateUrl('industrygroup.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
      $scope.startfun();
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    //选中分类之前做备份；
    var hisind = {};
    var hischoose = {};
    var hischooselist = [];
    $scope.showIndustry = function () {

      $timeout(function () {
        $ionicSlideBoxDelegate.update();
      }, 50);
      hisind = angular.copy($scope.industrylist);
      hischoose = angular.copy($scope.chooseindustry);
      hischooselist = angular.copy($scope.chooseindustrylist);
      $scope.showindustry = "block";
      $scope.openModal();
    };
    UtilService.countpagecount("modules/business/temp/tab-cloudsale.html.商家首页");
  })
  //帮忙卖详情页面
  .directive("helpSellScroll2", function () {
    return {
      restrict: 'EA',
      link: function ($scope, ele, attr) {
        $(ele[0]).scroll(function () {
          var getindexTop = (device.platform == "Android") ? $(ele[0]).scrollTop() : $scope.businessscroll.getScrollPosition().top;
          var opty = 0.3 - getindexTop / 312;
          //滚动条向下拉动时的事件方法
          if (getindexTop <= 0) {
          } else {
            $(".helpSellHeader2").css("background", "rgba(255,59,48," + getindexTop / 312 + ")");
            $(".iconRoundBox2").css('background', "rgba(0,0,0," + opty + ")");
          }
          if (getindexTop < 10) {
            $(".helpSellHeader2").css("background", "rgba(255,59,48,0)");
            $(".iconRoundBox2").css('background', "rgba(0,0,0,.3)");
          }
          if (getindexTop > 320) {
            $(".helpSellHeader2").css("background", "rgba(255,59,48,1)");
            $(".iconRoundBox2").css('background', "rgba(0,0,0,0)");
          }
        });
      }
    }
  })

  .controller('BusinessController', function ($sce, $ionicActionSheet, $rootScope, $state, $scope, $stateParams, $location, $timeout, $ionicHistory, ConfigService, UtilService, UserService, TabbindexService, GoodsService, $ionicScrollDelegate, $ionicSlideBoxDelegate, $cordovaImagePicker, $ionicPopup) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.boxisshow = "none";
      $scope.startfun();
      $rootScope.checkedList = [];
    });

    $scope.businessscroll = $ionicScrollDelegate.$getByHandle('Scroll1');
    $scope.$on("$ionicView.beforeLeave", function () {
      $scope.boxisshow = "none";
    });

    $scope.showsaler = "hidden";
    $scope.business_showpager = true;

    //帮忙卖列表跳转帮忙卖详情页
    $scope.goHelpSellDetail = function (taskid) {
      $scope.cleargo("helpselldetail", {"taskid": taskid})
    };

    //完善资料弹窗
    $scope.finishInfo = function () {
      var qxtext = "取消";
      if ($scope.buser.mustCompleteInfo != 1) {
        qxtext = "跳过";
      }
      $ionicPopup.confirm({
        title: '您需要完善资料，才可申请云销售',
        buttons: [{
          text: qxtext,
          type: 'button-positive',
          onTap: function () {
            if ($scope.buser.mustCompleteInfo != 1) {
              $scope.go("apply", {"merchantid": $scope.buser.merchantid});
            }
          }
        }, {
          text: '完善资料',
          type: 'button-default',
          onTap: function () {
            $scope.go("info");
          }
        }]
      });
    };


    //已认证商家弹窗
    $scope.getPopMask = function (type) {
      $scope.masktype = type;
      $(".noApplyCloudsellPop").show();
    };
    $scope.closeBoxMask = function () {
      $(".noApplyCloudsellPop").hide();
    };
    $ionicSlideBoxDelegate.$getByHandle('publicityphoto').update();
    $ionicSlideBoxDelegate.$getByHandle('publicityphoto').loop(true);

    //变量
    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.buserid = $stateParams.merchantid;
    $scope.goodlist = [];
    $scope.cpslist = [];
    $scope.cpclist = [];
    $scope.goodsmore = 0;
    $scope.busshow = true;
    $scope.busover = true;
    $scope.yxsstr = "申请云销售";

    $scope.busshowbtn = function () {
      $scope.busshow = !$scope.busshow;
      $scope.busover = !$scope.busover;
    };

    //商家介绍，点开更多
    $(".businessInforShowBtn").click(function () {
      var findI = $(this);
      if (findI.hasClass("icon-xt2-down")) {
        findI.removeClass("icon-xt2-down").addClass("icon-xt-up");
        findI.siblings(".businessInforContent").removeClass("over-ellipsis2");
      } else {
        findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
        findI.siblings(".businessInforContent").addClass("over-ellipsis2");
      }
    });

    $scope.changeUpAndDown = function (id) {
      if (id == 'cps') {
        $scope.cpsdown = !$scope.cpsdown;
        $scope.cpsup = !$scope.cpsup;
        $scope.cpshide = !$scope.cpshide;
      } else {
        $scope.cpcdown = !$scope.cpcdown;
        $scope.cpcup = !$scope.cpcup;
        $scope.cpchide = !$scope.cpchide;
      }
      $timeout(function () {
        $ionicScrollDelegate.$getByHandle('Scroll1').scrollBottom();
      }, 200)
    };

    $scope.doRefresh = function () {
      getBusinessDetail();
    };

    $scope.doClearRefresh = function () {
      getBusinessDetail();
    };

    //商家信息
    var getBusinessDetail = function () {
      $scope.nonetaskflg = "none";
      if (angular.isUndefined($scope.buserid)) {
        $scope.userid = "";
      }
      TabbindexService.getBusinessDetail($scope.buserid).then(function (response) {
        $scope.buser = response.data;
        $scope.buser.certification == undefined ? $scope.buser.certification = 1 : $scope.buser.certification = $scope.buser.certification;
        $scope.buser.platformguarantee == undefined ? $scope.buser.platformguarantee = 1 : $scope.buser.platformguarantee = $scope.buser.platformguarantee;
        $scope.showlist($scope.buserid);
        if ($scope.buser.publicityphoto.length == 1) {
          $scope.business_showpager = false;
        }
        if ($scope.buser.issaler == 1) {
          $scope.showsaler = "hidden";
        } else {
          $scope.showsaler = "visible";
        }
        if (angular.isUndefined($scope.buser.introduction) || $scope.buser.introduction.trim().length == 0 || $scope.buser.introduction == null) {
          $scope.cloudhide = true;
        }
        if (angular.isDefined($scope.buser.introduction) && $scope.buser.introduction.length <= 46) {
          $scope.busover = false;
          $scope.busshow = true;
          $scope.hideintro = true;
        }
        if ($scope.buser.issalersh > 0) {
          $scope.yxsstr = "云销售申请中";
        } else {
          $scope.yxsstr = "申请云销售";
        }
        $scope.buser.introduction = $sce.trustAsHtml($scope.buser.introduction);
        $ionicSlideBoxDelegate.$getByHandle('publicityphoto').update();
        $ionicSlideBoxDelegate.$getByHandle('publicityphoto').loop(true);
        //判断商家是否已收藏
        if ($scope.buser.isstore == "1") {
          $(".business_love").children('i').removeClass('icon-xt3-love').addClass("icon-xt-shixin");
          $scope.isstore = true;
        } else {
          $scope.isstore = false;
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
        $scope.nonenet = true;
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      })
    };
    $scope.doRefresh();

    $scope.changeshowsupport = function (type) {
      if (type == 0) {
        $scope.cpchide = false;
        $ionicScrollDelegate.$getByHandle('Scroll1').resize();
      } else {
        $scope.cpshide = false;
        $ionicScrollDelegate.$getByHandle('Scroll1').resize();
      }
    };

    $scope.showlist = function (buserid) {
      TabbindexService.getBusinessList(buserid).then(function (res) {
        var len = res.data.goodlist.length;
        if (len > 3) {
          $scope.goodsmore = len;
          len = 3;
        }
        if (len > 0) {
          $scope.goodlist = res.data.goodlist.slice(0, 3);
        } else {
          $scope.goodlist = [];
        }
        $scope.tempcpc = [];
        $scope.tempcps = [];
        $scope.cpclist = res.data.cpclist;
        $scope.cpslist = res.data.cpslist;
        if ($scope.cpclist.length > 2) {
          $scope.tempcpc.push($scope.cpclist[0]);
          $scope.tempcpc.push($scope.cpclist[1]);
          $scope.cpclist.splice(0, 2);
        } else {
          $scope.tempcpc = $scope.cpclist;
          $scope.cpclist = [];
        }
        if ($scope.cpslist.length > 2) {
          $scope.tempcps.push($scope.cpslist[0]);
          $scope.tempcps.push($scope.cpslist[1]);
          $scope.cpslist.splice(0, 2);
        } else {
          $scope.tempcps = $scope.cpslist;
          $scope.cpslist = [];
        }
        if ($scope.tempcpc.length > 0) {
          $scope.tempcpchide = false;
        }
        if ($scope.tempcps.length > 0) {
          $scope.tempcpshide = false;
        }
        if ($scope.cpclist.length > 0) {
          $scope.cpchide = true;
        }
        if ($scope.cpslist.length > 0) {
          $scope.cpshide = true;
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
      });
    };

    $scope.goGoodsDetail = function (goods, companyalias) {
      $scope.go("gooddetailc", {"goods": goods, "companyalias": companyalias});
    };

    $scope.goGoodsList = function (buser) {
      $scope.go("product", {"merchantId": buser.merchantid, "companyalias": buser.companyalias});
    };
    //收藏商家
    $scope.addBusinessIcon = function (merchantid) {
      var params = {
        mod: "nUser",
        func: "storeMerchant",
        userid: $scope.user.id,
        data: {"merchantid": merchantid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.isstore = !$scope.isstore;
          if ($scope.isstore) {
            $('.business_love').children('i').removeClass('icon-xt3-love').addClass("icon-xt-shixin");
            UtilService.showMess("收藏成功！");
            $timeout(function () {
              var query = {
                mod: "nuser",
                func: "nSaveUserBehavior",
                data: {
                  'fromurl': $location.path(),
                  'tourl': $location.path(),
                  'param': {merchantid: merchantid},
                  'func': 'bstore'
                },
                userid: UserService.user.id
              };
              UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
              })
            }, 100);
          } else {
            $('.business_love').children('i').removeClass('icon-xt-shixin').addClass("icon-xt3-love");
            UtilService.showMess("取消成功！");
            $timeout(function () {
              var query = {
                mod: "nuser",
                func: "nSaveUserBehavior",
                data: {
                  'fromurl': $location.path(),
                  'tourl': $location.path(),
                  'param': {merchantid: merchantid},
                  'func': 'cancelbstore'
                },
                userid: UserService.user.id
              };
              UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
              })
            }, 100);
          }

        }
        UtilService.collection = "0";
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    };

    $scope.goCheckSaler = function () {

      if ($scope.buser.status == 1) {
        if ($scope.buser.issalersh != 1) {
          if ($scope.buser.userInfoComplete == 1) {
            //该用户未完善资料，出完善资料弹窗
            $scope.finishInfo();
          } else {
            if ($scope.buser.issalersh == 1) {
              UtilService.showMess("云销售申请中");
            } else {
              $scope.go('apply', {merchantid: $scope.buser.merchantid})
            }
          }
        } else {
          UtilService.showMess("云销售申请中");
        }
      }
    };

    $scope.goMsgDetail = function () {
      if ($scope.buser.issaler == 0 && $scope.buser.issalersh == 0) {
        UtilService.showMess("申请云销售之后即可与商家对话!");
      } else if ($scope.buser.issaler == 0 && $scope.buser.issalersh == 1) {
        $scope.go('msgdetail', {
          'otheruserid': $scope.buser.merchantid,
          'otherusername': $scope.buser.companyalias,
          'istmp': 1,
          'avate': $scope.buser.clogopath
        });
        UtilService.customevent("businessmsg", "临时会话");
      } else {
        $scope.go('msgdetail', {
          'otheruserid': $scope.buser.merchantid,
          'otherusername': $scope.buser.companyalias,
          'istmp': 0,
          'avate': $scope.buser.clogopath
        });
        UtilService.customevent("businessmsg", "会话聊天");
      }
    };

    $scope.pickPhone = function () {
      var tel = [];
      tel.push($scope.buser.btel);
      var tt = [];
      for (var i = tel.length - 1; i >= 0; i--) {
        tt.unshift({'text': tel[i]})
      }
      $ionicActionSheet.show({
        buttons: tt,
        titleText: '<i class="icon icon-xt2-store-tel fl"></i><span class="fl">您想呼叫哪个号码</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          window.open("tel:" + tel[index]);
          return true;
        }
      });
    };

    $scope.goEvalute = function (merchantid) {
      $scope.go('bevaluate', {merchantid: merchantid});
    };

    var options = {
      width: 800,
      height: 800
    };
    $scope.getImages = function () {
      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for (var i = 0; i < results.length; i++) {
          }
        }, function (error) {
        });
    };

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
    }
  })
  .directive('flashing', function () {
    return {
      restrict: "E",
      scope: {
        fast: "@buserFast"
      },
      replace: true,
      link: function (scope, elem) {
        scope.$watch("fast", function () {
          var redlen = scope.fast;

          var graylen = 3 - redlen;
          var tempFast = '<div>';
          for (var i = 0; i < redlen; i++) {
            tempFast += '<i class="icon icon-xt3-speed red"></i>';
          }
          for (var j = 0; j < graylen; j++) {
            tempFast += '<i class="icon icon-xt3-speed gray"></i>';
          }
          tempFast += '</div><p>处理速度</p>';
          elem.html(tempFast);
        });
      }
    }

  })
  .controller('BusinessDetailController', function ($scope, $timeout, $stateParams) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.buser = $stateParams.buserinfo;

  });

