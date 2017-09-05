angular.module('xtui')
  .directive('onScrollIndexContent', function () {
    return {
      restrict: 'EA',
      link: function ($scope, ele) {
        var navBar = $(".navBar").last()[0];
        var tittle = $(".tittle").last()[0];
        //android高度为70，ios要加上状态栏的高度
        var stateH1 = (device.platform == "Android") ? 70 : (70 + 640 * 20 / window.screen.width);
        $(ele[0]).scroll(function () {
          // $scope.indexNav = $('.static-nav').last().offset().top;
          $scope.indexNav = $('.taskindex-list .list').last().offset().top
          // if ($scope.indexNav == 0) {
          //   $scope.indexNav = $('.static-nav').eq(0).offset().top;
          //   if ($scope.indexNav == 0) {
          //     $scope.indexNav = $('.static-nav').eq(1).offset().top;
          //   }
          // }
          var getindexTop = $scope.conscroll.getScrollPosition().top;
          if (getindexTop >489) {
            if (false) {
            /*  $('.fix-nav.indexNavBox').last().css("visibility", "visible");
              $scope.navScroll_0.scrollTo($scope.navScroll_1.getScrollPosition().left, 0, false);*/
            } else {
              $('.indexGetTop_home').removeClass("hide").addClass("show");
             // $('.fix-nav.indexNavBox').last().css("visibility", "hidden");
            }
          }
          if (getindexTop < 489) {
            $('.indexGetTop_home').removeClass("show").addClass("hide");
            //$('.fix-nav.indexNavBox').last().css("visibility", "hidden");
          }
          //滚动条向下拉动时的事件方法
          if (getindexTop <= 0) {
            $scope.hasScrolled = 0;
          } else {
            navBar.style.background = "rgba(255,59,48," + getindexTop / 312 + ")";
            tittle.style.opacity = getindexTop / 312;
          }
          if (getindexTop < 10) {
            $scope.hasScrolled = 0;
            tittle.style.opacity = 0;
            navBar.style.background = "rgba(255,59,48,0)";
          }
          if (getindexTop > 320) {
            $scope.hasScrolled = 1;
            tittle.style.opacity = 1;
            navBar.style.background = "rgba(255,59,48,1)";
          }
        })
      }
    }
  })
  .controller("IndexController", function (MerryService,CustomerService, StorageService, $sce, IMSqliteUtilService, $stateParams, SysMsgService, MsgService, $scope, $rootScope, $ionicHistory, $state, ConfigService, $ionicScrollDelegate, $timeout, CityService, UtilService, UserService, TaskIndexService, $ionicSlideBoxDelegate, MerchantIndexService, BlackService, BannerService, SqliteUtilService, $window, $location, $ionicTabsDelegate, $ionicModal, NewHandService, $anchorScroll, BarcodeService, $ionicPopup,$ionicPopover,$cordovaDevice) {
    $scope.user = UserService.user;
    $scope.updataversion = "none";
    $scope.hasNextPageload = false;
    $scope.firstLoc = false;
    $scope.iosupdata = "none";
    $scope.fixnavStyle = {'visibility': 'hidden'};
    $scope.sort = "recommand";
    $scope.showList = true;
    $scope.sortlist = [];
    $scope.indexlist = [];
    $scope.listclick = [];
    $scope.type = 0;
    // $scope.showActive = false;
    $scope.active_img = "";
    $scope.choosecity = "";
    $scope.app_version = ConfigService.versionno;
    // $scope.isChangzhou=false;

    /*nav*/
    $scope.navtype = 0;
    $scope.borderNavStyle ={
      'transform': 'translateX(0px)',
      '-webkit-transform': 'translateX(0px)'
    }
    $scope.clicknav2 = function(num,event){
      $scope.navtype = num;
      $scope.borderNavStyle  = {
        'transform': 'translateX(' + 160*num + 'px)',
        '-webkit-transform': 'translateX(' + 160*num + 'px)'
      }
    }


    $scope.popover = $ionicPopover.fromTemplate('indexpopover.html', {
      scope: $scope
    });
    $ionicPopover.fromTemplateUrl('indexpopover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });
    $scope.indexPlus = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };

    $scope.getFirstChristmasApple = function(){
      SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
        var cityarr = [];
        $.each(data,function(n,v){
          cityarr.push(v.name);
        })
        var city = cityarr.join(",");
        MerryService.getFirstRewardLog("鸡祥金蛋",city,$scope.app_version,$cordovaDevice.getUUID()).then(function(resa){
          if(resa.status == "000000"){
            $ionicScrollDelegate.$getByHandle('Scroll').scrollTop();
            var tabindex = $ionicTabsDelegate.selectedIndex();
            if(tabindex == 0){
              $rootScope.merryChirsBox = true;
            }
          }
        },function(){
          UtilService.showMess1("网络不给力，请稍后刷新");
        });
        MerryService.getActBanner(city,$scope.app_version).then(function(resb){
          if(resb.data == null){
            $rootScope.showActive = false;
          }else{
            $rootScope.showActive = true;
            $scope.active_img = resb.data.pic;
          }
        },function(){
          UtilService.showMess1("网络不给力，请稍后刷新");
        });
      }, function () {
      });

    }
    $scope.goMerry = function(){
      $timeout(function(){
        SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
          var cityarr = [];
          $.each(data,function(n,v){
            cityarr.push(v.name);
          })
          var city = cityarr.join(",");
          MerryService.getActBanner(city,$scope.app_version).then(function(resb){
            if(resb.data == null){
              UtilService.showMess1("活动已结束");
              $rootScope.showActive = false;
            }else{
              $scope.go("newyear");
            }
          },function(){
            UtilService.showMess1("网络不给力，请稍后刷新");
          });
        }, function () {
        });
      },500);

    }


    $scope.checkversion = function () {
      $scope.query = {
        mod: "nComm",
        func: "checkApkUpdate",
        data: {
          no: ConfigService.versionno,
          apptype: "s",
          type: $scope.devicetype
        }
      };
      //isapkupdata：0 不需要更新  1 WWW更新  2 APK更新   forceupdate：强制更新
      UtilService.post(ConfigService.upserver, {'jsonstr': angular.toJson($scope.query)}).success(function (data) {
        if (data.status == '000000') {
          $scope.isapkupdate = data.data.isapkupdate;
          $scope.forceupdate = data.data.forceupdate;
          $scope.newv = data.data.newv;
          if ($scope.isapkupdate == '2') {
            $scope.updatedesc = $sce.trustAsHtml($scope.newv.disc);
            if ($scope.devicetype == "1") {
              $scope.iosupdata = "block";
              $("#updata").show();
            } else {
              $scope.updataversion = "block";
              $("#updata").show();
            }
          } else if (($scope.isapkupdate == '0')) {
            //当前最新
            ConfigService.updateversion = false;
          }
        }
      }).error(function () {
        $scope.updataversion = "none";
        $scope.iosupdata = "none";
        $("#updata").hide();
      });
    };

    if (ConfigService.updateversion) {
      if (device.platform == "Android") {
        $scope.devicetype = "0";
      } else {
        $scope.devicetype = "1";
      }
      $scope.checkversion();
    }
    SqliteUtilService.initXtuiDatabase();
    //android更新
    $scope.updateversion = function () {
      ConfigService.updateversion = false;
      cordova.InAppBrowser.open($scope.newv.url, '_system', 'location=yes');
    };
    //ios更新
    $scope.iosupdataverion = function () {
      ConfigService.updateversion = false;
      cordova.InAppBrowser.open("https://itunes.apple.com/us/app/xiang-tui-shou-ji-zhuan-qian/id1049698800", '_system', 'location=yes');
    };

    //取消更新版本
    $scope.cancleupdateversion = function () {
      ConfigService.updateversion = false;
      $scope.updataversion = "none";
      $scope.iosupdata = "none";
      $("#updata").hide();
      //强制更新
      if ($scope.forceupdate == "1") {
        //直接关闭app
        navigator.app.exitApp();
      } else {
        //关闭弹窗
        $scope.updataversion = "none";
        $("#updata").hide();
      }
    };

    /*扫一扫页面*/
    $scope.goscan = function () {
      BarcodeService.scan({scanType: 0}, function (result) {
        try {
          if (result && result.code == 0) {
            //扫描得到了结果
            var array = result.result.split("_p=");
            var qrcode = eval("(" + array[array.length - 1] + ")");
            if (qrcode.type == 2) {
              //扫商家
              $scope.go('business', {merchantid: qrcode.text});
            } else if (qrcode.type == 1) {
              //扫s
              $scope.go('shome', {suserid: qrcode.text});
            } else {
              $scope.go('scanfail');
            }
          }
        } catch (e) {
          $scope.go('scanfail');
        }
      }, function () {
        $scope.go('cantscan');
      });
      UtilService.tongji("Scan");
      $scope.closePopover();
    };

    //优惠券页面
    $scope.goCoupon =function () {
      $scope.closePopover();
      $scope.go("couponlist");
    }

    //返回顶部
    $scope.getTop = function () {
      scrollList();
    };

    var sqldata = {};
    $scope.cityPrompt = false;
    //开始记录切换标签页离顶部的距离
    var mtop = 500;
    //初始化本地数据库
    if (CityService.getCities() == null || CityService.getCities().length == 0) {
      //获取城市到缓存里
      SqliteUtilService.selectData("city", null, "type=0").then(function (data) {
        if (data != null && data.length > 0) {
          CityService.setCities(data);
        } else {
          CityService.getAllCities().then(function (res) {
            var dataList = [];
            var index = 2;
            $.each(res.data, function (n, v) {
              $.each(v.value, function (i, val) {
                val.id = index;
                index++;
                dataList.push(val);
              })
            });
            CityService.setCities(dataList);
            SqliteUtilService.insertDataOfList(dataList, "city", null, "type=0");
          }, function () {
          });
        }
      }, function (data) {
      })
    }
    //插入本地城市
    var insertIntoLocalCity = function (city) {
      if (city != undefined && city != null && city != ""&&city!="全国"&&city.name!="全国") {
        var sqldata1 = [{id: 1, name: city, abbrname: "default", type: 2}];
        SqliteUtilService.insertDataOfList(sqldata1, "city", null, "type=2");
      }
    };
    //插入常用城市
    var insertIntoCommonCity = function (city) {
      if (city != null && city != ""&& city != undefined &&city!="全国"&&city.name!="全国") {
        SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
          var flag = false;
          var sqldata = [{name: city, intime: new Date().getTime()}];
          var index = -1;
          $(data).each(function (n, v) {
            if (v.name == city) {
              flag = true;
              index = n;
            }
          });
          var dataForInsert = [];
          if (flag) {
            dataForInsert = [];
            $(data).each(function (n, v) {
              if (n != index)
                dataForInsert.push({name: v.name, intime: v.intime});
              else
                dataForInsert.push(sqldata[0]);
            });
            SqliteUtilService.insertDataOfList(dataForInsert, "commoncity", null, null);
          } else {
            if (data.length >= 5) {
              data.splice(data.length - 1, 1);
              dataForInsert = [];
              dataForInsert.push(sqldata[0]);
              $(data).each(function (n, v) {
                if (n != index)
                  dataForInsert.push({name: v.name, intime: v.intime});
              });
              SqliteUtilService.insertDataOfList(dataForInsert, "commoncity", null, null);
            } else {
              SqliteUtilService.insertDataOfList(sqldata, "commoncity", null, "name=\"" + city + "\"");
            }
          }
        }, function () {
        });
      }
    };
    //获取常用城市
    var getCommonCities = function () {
      SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
        if(data!=undefined && data!=""&& data!=null){
          var res = [data[0]];
          for(var i = 1; i < data.length; i++){
            var repeat = false;
            for(var j = 0; j < res.length; j++){
              if(data[i].name == res[j].name){
                repeat = true;
                break;
              }
            }
            if(!repeat){
              if(data[i]!=undefined && data[i]!=""&& data[i]!=null) {
                res.push(data[i]);
              }
            }
          }
          $scope.commonCities = res;
        }
      }, function () {

      });
    };
    //getCommonCities();

    var dealCity = function () {
      if ($scope.localcity != undefined && $scope.localcity != null && $scope.localcity != "") {
        //在常用城市中选取，如果都不符合提示切换城市
        var checkCity = false;//检测定位城市在不在常用城市中
        SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
          if (data.length == 0) {//常用城市中还没有数据的时候，初始化一下
            insertIntoLocalCity($rootScope.city);
            insertIntoCommonCity($rootScope.city);
            inittaskdata();
          } else {
            $(data).each(function (n, v) {
              if (v.name == $scope.localcity) {
                checkCity = true;
                return false;
              }
            });
            if (checkCity) {//如果在，直接切换
              $rootScope.city = $scope.localcity;
              insertIntoLocalCity($rootScope.city);
              inittaskdata();
            } else {//如果不在，切换并插入常用城市表
              /*var sindex = $ionicTabsDelegate.selectedIndex();
               if (sindex == 0 && $scope.localcity != null && $scope.localcity != "") {
               $scope.openModal();
               }*/
              $rootScope.city = $scope.localcity;
              insertIntoLocalCity($rootScope.city);
              insertIntoCommonCity($rootScope.city);
              inittaskdata();
            }
          }
        }, function () {
        });
      } else {//未开启定位
        $scope.localcity = "全国";
        inittaskdata();
      }
      CityService.setCheck(true);
    };

    var dealCity1 = function () {
      $rootScope.city = UserService.location.city;
      $scope.localcity = UserService.location.city;
      if ($scope.localcity != undefined && $scope.localcity != null && $scope.localcity != "") {
        insertIntoLocalCity($rootScope.city);
        insertIntoCommonCity($rootScope.city);
      } else {
        $rootScope.city = $scope.localcity = "全国";
      }
      inittaskdata();
    };

    //获取城市定位
    var getHeadLocation = function () {
      if ($rootScope.city) {//城市存在
        if ($rootScope.city != null && $rootScope.city != "") {
          inittaskdata();//初始化首页数据
        }
        if($rootScope.city!=UserService.location.city){
          insertIntoCommonCity(UserService.location.city);
        }
      } else {
        SqliteUtilService.selectData("city", null, "type=2").then(function (data) {
          sqldata = data[0];
          if (sqldata != null) {
            $rootScope.city = sqldata.name;
            if (CityService.getCheck()) return;
            $scope.localcity = UserService.location.city;
            if (angular.isUndefined(UserService.location.city)) {
              $timeout(function () {
                $scope.localcity = UserService.location.city;
                dealCity();
              }, 1000);
            } else {
              dealCity();
            }
          } else {
            if (angular.isUndefined(UserService.location.city)) {
              $timeout(function () {
                dealCity1();
              }, 1000);
            } else {
              dealCity1();
            }
          }
        }, function () {
        });

      }
      //异步延迟查询
      $timeout(function () {
        getCommonCities();
      }, 3000);
      //判断是否定位在常州
      if($rootScope.city=="常州"){
        $rootScope.isChangzhou=true;
      }else{
        $rootScope.isChangzhou=false;
      }
      //alert($rootScope.isChangzhou);
    };

    //选择常用城市
    var clickcount = 0;
    //选择常用城市时滚动复原
    var scrollInitWhenSelectCommCity = function(){

        $scope.type = 0;
        $scope.listclick = [];
        $scope.borderIndexBotStyle = {
          'transform': 'translateX(0px)',
          '-webkit-transform': 'translateX(0px)'
        };
        $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(0, 0, true);
        $ionicScrollDelegate.$getByHandle("navScroll_0").resize();
        $ionicScrollDelegate.$getByHandle('Scroll').scrollTo(0, 0, true);
    }
    $scope.selectCommCity = function (city) {
      CityService.setInCityPage(true);
      if(clickcount==1){
        return ;
      }
      clickcount=1;
      if (city == "") {
        $scope.goback();
        return;
      }
      if (typeof(city) == "string") {
        $scope.choosecity = city;
        if (city == $scope.localcity || city == UserService.location.district||city==$rootScope.city) {
         var sqldata = [{id: 1, name: city, abbrname: "", type: 2}];
         SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
         $rootScope.city = city;
          scrollInitWhenSelectCommCity();
          inittaskdata();

          $scope.closechooseCModal();
        } else {
          $scope.openModal();
          return;
        }
      } else {
        $scope.choosecity = city.name;
        if (city.name == $scope.localcity || city.name == UserService.location.district||city.name==$rootScope.city) {
         var sqldata = [{id: 1, name: city.name, abbrname: city.abbrname, type: 2}];
          SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
          $rootScope.city = city.name;
          scrollInitWhenSelectCommCity();
          inittaskdata();

          $scope.closechooseCModal();
        } else {
          $scope.openModal();
          return;
        }
      }
      insertIntoCommonCity($rootScope.city);
      $timeout(function(){
        clickcount=0;
      },2000);
    };

    var  chooseCityClick = 0;
    $scope.chooseCity = function (type) {
      if(chooseCityClick==1){
        return;
      }
      chooseCityClick=1;
      $scope.closeModal(type);
      var sqldata = [{id: 1, name: $scope.choosecity, abbrname: "", type: 2}];
      SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
      $rootScope.city = $scope.choosecity;
      insertIntoCommonCity($rootScope.city);
      $scope.closechooseCModal();
      inittaskdata();
      scrollInitWhenSelectCommCity();

      $timeout(function () {
        chooseCityClick = 0;
        UtilService.tongji("switchcity", {'changecity': type});
      }, 2000);
    };

    //获取4个主题
    var getTopick = function (city) {
      TaskIndexService.getTopicList(city).then(function (response) {
        $scope.topic1 = response.data[0];
        $scope.topic2 = response.data[1];
        $scope.topic3 = response.data[2];
        $scope.topic4 = response.data[3];

        $scope.topic1.logo = $scope.topic1.logo + "?a=" + Math.random();
        $scope.topic2.logo = $scope.topic2.logo + "?a=" + Math.random();
        $scope.topic3.logo = $scope.topic3.logo + "?a=" + Math.random();
        $scope.topic4.logo = $scope.topic4.logo + "?a=" + Math.random();

        SqliteUtilService.insertDataOfList(response.data, "topic", null, null);
      }, function () {
        SqliteUtilService.selectData("topic").then(function (data) {
          $scope.topic1 = data[0];
          $scope.topic2 = data[1];
          $scope.topic3 = data[2];
          $scope.topic4 = data[3];
        }, function () {
        });
      })
    };
    //获取主页banner
    var getHomeBanner = function (city,rtype) {
      //进入app,获取banners
      BannerService.getbanner(city,rtype).then(function (response) {
        if(rtype == 0){
          $scope.bannerlist = response.data;
          if($scope.bannerlist.length ==0){
            $scope.bannerlist = [{pic:""}];
          }
        }else {
          $scope.taskbannerlist = response.data;
          if(angular.isDefined($scope.taskbannerlist)){
            SqliteUtilService.insertDataOfList($scope.taskbannerlist, "banner", null, null);
          }
        }
      }, function () {
        $scope.bannerlist = [{"pic": "img/default_banner.jpg", "isnone": 1}];
      })
    };
    // 初始化任务数据
    var inittaskdata = function () {
      getTopick($rootScope.city);
      getHomeBanner($rootScope.city,0);//首页头部banner
      getHomeBanner($rootScope.city,1);//任务列表中banner
      if (CityService.getInCityPage() || CityService.getInTaskDetail() || $scope.sortlist.length == 0) {
        getSortList($rootScope.city);
      }
    };

    //根据城市选择任务
    var getSortList = function (city) {
      $scope.indexlist.push([]);//推荐集合排在第一位

      TaskIndexService.getIndexType(city).then(function (data) {
        $scope.sortlist = [];
        $scope.listclick.push(1);
        angular.forEach(data.data, function (val, n) {
          $scope.sortlist.push({"id": n + 1, "name": val.name, "sort": val.indexvalue});
          $scope.indexlist.push([]);
          $scope.listclick.push(0);
        });

        //重新更新
        $scope.sort = $scope.getSortById($scope.type);
        var arr = $scope.sort.split(",");
        var tasktype = $scope.type==0?"cpcall":arr[0];
        var sort = arr.length>1?$scope.sort.split(",")[1]:"";
        //第一次进页面刷一点任务列表
        var city = $rootScope.city;
        if (angular.isUndefined(UserService.user.id)) {
          UserService.user.id = "";
        }
        var params = {
          mod: "NStask",
          func: "getHomeTaskList",
          userid: UserService.user.id,
          data: {
            pageno: 1,
            count: 50,
            sort: sort,
            city: city,
            tasktype: tasktype,
            x: UserService.location.x,
            y: UserService.location.y
          }
        };
        if ($stateParams.firstLogin) {
          params.data = angular.extend(params.data, {first: 1});
        }
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          //判断数据返回结果
          $scope.indexlist[$scope.type] = data.data;
          if ($scope.sort == "recommand") {
            if (angular.isDefined($scope.taskbannerlist)) {
              var initindex = 1;
              angular.forEach($scope.taskbannerlist, function (data, index) {
                var num = parseInt(2 * Math.random() + 1) + initindex;
                var banner = angular.copy(data);
                banner.isbanner = 1;
                $scope.indexlist[$scope.type].splice(num, 0, banner);
                initindex = initindex + 6;
              });
            }
          }
          $(".moreContentBtn").last().show();
          SqliteUtilService.insertDataOfList(data.data, "hometask", null, null);
          CityService.setInCityPage(false);
        }).error(function (data) {
          if(angular.isUndefined($scope.indexlist[$scope.type])||$scope.indexlist[$scope.type].length==0){
            SqliteUtilService.selectData("banner", null, null).then(function (response) {
              $scope.taskbannerlist = response;
              SqliteUtilService.selectData("hometask", $scope.sort, null).then(function (response) {
                $scope.indexlist[$scope.type] = response;
                if(angular.isDefined($scope.taskbannerlist)){
                  var initindex = 1;
                  angular.forEach($scope.taskbannerlist,function (data,index) {
                    var num =parseInt(2*Math.random()+1)+initindex;
                    var banner = angular.copy(data);
                    banner.isbanner = 1;
                    $scope.indexlist[$scope.type].splice(num,0,banner);
                    initindex = initindex+6;
                  });
                }
              })
            })
          }
        });
        /*xtui3.2菜单滑动显示*/
/*
        $scope.indexnav_w = 180;
        if ($scope.sortlist.length <= 3) {
          $(".borderBot").css("left", "24px");
          $scope.homeMenuStyle = {'width': "100%", "display": "flex", "display": "-webkit-flex"};
          $timeout(function(){
            $(".indexlist-nav li").css({"flex": 1, "-webkit-flex": 1});
          },2000)
        } else {
          $(".borderBot").css("left", "35px");
          var navwidth = $scope.indexnav_w * ($scope.sortlist.length + 1);
          $scope.homeMenuStyle = {'width': navwidth + 'px'};
        }
*/

      }, function () {
      })
    };
    //根据id获取sort
    $scope.getSortById = function (id) {
      var res = null;
      angular.forEach($scope.sortlist, function (o) {
        if (o.id == id) res = o.sort;
      });
      return res ? res : "recommand";
    };

    //获取商家列表的条件
    var getExtraParams = function () {
      var sortO = $scope.getSortById($scope.type);
      var arr = $scope.sort.split(",");
      var tasktype = $scope.type==0?"cpcall":arr[0];
      var sort = arr.length>1?$scope.sort.split(",")[1]:"";
      var par = {key: "", type: "1", querytype: "2", sort: sortO.sort, city: $rootScope.city};
      if (sortO.sort == 'distance') {
        par = angular.extend(par, {x: UserService.location.x, y: UserService.location.y});
      }
      return par;
    };

    //进页面前操作
    $scope.$on('$ionicView.beforeEnter', function () {
      $ionicHistory.clearHistory();
      if(UserService.user.id){
        if(!$stateParams.firstLogin)
          $scope.getFirstChristmasApple();
      }
      var dytop = getScrolltop();
      if (dytop > mtop) {
        if (device.platform != "Android") {
          var navBar = $(".navBar").last()[0];
          var tittle = $(".tittle").last()[0];
          $scope.hasScrolled = 1;
          $(tittle).css("opacity", "1");
          $(navBar).css("background", "rgba(255,59,48,1)");
        }
      } else {
        if (device.platform != "Android") {
          var navBar = $(".navBar").last()[0];
          var tittle = $(".tittle").last()[0];
          $scope.hasScrolled = 0;
          $(tittle).css("opacity", "0");
          $(navBar).css("background", "rgba(255,59,48,0)");
        }
        $('.fix-nav.indexNavBox').css("visibility", "hidden");
      }
      $scope.startfun();
      if (CityService.getInCityPage()) {
        $scope.type = 0;
        $scope.listclick = [];
        $scope.borderIndexBotStyle = {
          'transform': 'translateX(0px)',
          '-webkit-transform': 'translateX(0px)'
        };
        $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(0, 0, true);
        $ionicScrollDelegate.$getByHandle("navScroll_0").resize();
        getHeadLocation();
        CityService.setInCityPage(false);
        $ionicScrollDelegate.$getByHandle('Scroll').scrollTo(0, 0, true);
      } else if (CityService.getInTaskDetail()) {
        getHeadLocation();
        CityService.setInTaskDetail(false);
      } else if ($scope.indexlist.length == 0 || $scope.indexlist[0].length == 0) {
        var navBar = $(".navBar").last()[0];
        var tittle = $(".tittle").last()[0];
        $scope.hasScrolled = 0;
        $(tittle).css("opacity", "0");
        $(navBar).css("background", "rgba(255,59,48,0)");
        getHeadLocation();
      } else {
        if ($scope.sortlist.length <= 3) {
          //$(".borderBot").css("left", "24px");
          $scope.homeMenuStyle = {'width': "100%", "display": "flex", "display": "-webkit-flex"};
          $(".indexlist-nav li").css({"flex": 1, "-webkit-flex": 1});
        } else {
          //$(".borderBot").css("left", "35px");
          var navwidth = $scope.indexnav_w * ($scope.sortlist.length + 1);
          $scope.homeMenuStyle = {'width': navwidth + 'px'};
        }
      }
      showRank();
      checkWhetherHasIncome();
      $timeout(function () {
        $ionicSlideBoxDelegate.$getByHandle('bannerlisthandle').start();
      }, 100);
    });
    $scope.$on("$ionicView.beforeLeave", function () {
      $(".mask-tab").hide();
    });

    //重置数据
    var ResetData = function () {
      if ($scope.type == 0) {
        MerchantIndexService.resetData();
      }
      else {
        TaskIndexService.resetData();
      }
    };
    $scope.clicknav = function (index, e) {
      var oldindex = $scope.type;
      //性能优化，通过jquery直接对DOM操作，减少angularjs数据绑定的延迟.
      var getX = 0;
      if ($scope.sortlist.length <= 3) {
        getX = 640 / ($scope.sortlist.length + 1) * index;
      } else {
        getX = $scope.indexnav_w * index;
      }
      if ($scope.type == index) {
        return;
      }
      setTimeout(function () {
        $scope.type = index;
        $scope.borderIndexBotStyle = {
          'transform': 'translateX(' + getX + 'px)',
          '-webkit-transform': 'translateX(' + getX + 'px)'
        };
      }, 2);
      if ($scope.sortlist.length > 3) {
        setTimeout(function () {
          var centerlen = $scope.indexnav_w * (index + 1 / 2) - 320;
          var movelength = $scope.indexnav_w * ($scope.sortlist.length + 1) - 640;
          if (index == 0 || index == 1) {
            $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(0, 0, true);
            $ionicScrollDelegate.$getByHandle("navScroll_0").resize();
            $scope.$apply();
            return;
          }
          if (index == $scope.sortlist.length - 1 || index == ($scope.sortlist.length)) {
            $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(movelength, 0, true);
            $ionicScrollDelegate.$getByHandle("navScroll_0").resize();
            $scope.$apply();
            return;
          }
          $ionicScrollDelegate.$getByHandle('navScroll_0').scrollTo(centerlen, 0, true);
          $ionicScrollDelegate.$getByHandle("navScroll_0").resize();
          $scope.$apply();
        }, 2);
      }
      setTimeout(function () {
        if ($scope.indexlist[index].length == 0 && $scope.listclick[index] == 0) {
          $scope.indexlist[index] = $scope.indexlist[oldindex];
        }
        $scope.$apply();
      }, 0);
      setTimeout(function () {
        $scope.sort = $scope.getSortById(index);
        if ($scope.listclick[index] == 0) {
          $scope.listclick[index]++;
          $scope.nonetask = false;
          $scope.hasNextPage = $scope.hasNextPageload = false;
          $scope.doRefreshJustForList();
          $scope.$apply();
        }
      }, 5);
      setTimeout(function () {
        UtilService.customevent("hometab", "cpcsort:" + $scope.sort);
        UtilService.tongji('hometab', {'type': $scope.sort});
      }, 100);
    };
    $scope.gofastget = function () {
      UserService.fastget = true;
      $state.go("fastget");
    };

    $ionicModal.fromTemplateUrl('popupmask.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
    };
    $scope.closeModal = function (type) {
      $scope.modal.hide();

      if (type == 1) {
        UtilService.tongji("switchcity", {'changecity': type});
      }
      clickcount=0;
    };



    $ionicModal.fromTemplateUrl('chooseCity.html', {
      scope: $scope,
      animation: 'slide-in-fade'
    }).then(function (chooseC) {
      $scope.chooseC = chooseC;
    });
    $scope.openchooseCModal = function () {
      $scope.chooseC.show();
    };
    $scope.closechooseCModal = function () {
      $scope.chooseC.hide();
    };



    $scope.switchCity = function () {
      $rootScope.city = $scope.localcity;
      insertIntoLocalCity($rootScope.city);
      insertIntoCommonCity($rootScope.city);
      $scope.closeModal();
      inittaskdata();
    };
    //关闭城市切换弹窗
    $scope.closeCityPopup = function () {
      CityService.setCheck(true);
      $scope.closeModal();
    };

    $scope.gotoCity = function () {
      $state.go("selectcity", {city: $rootScope.city});
      $timeout(function () {
        UtilService.customevent("homehead", "地区");
      }, 50)
    };
    $scope.hasLocation = function () {
      return UserService.location.x != null && UserService.location.x != undefined && UserService.location.x != "" &&
        UserService.location.y != null && UserService.location.y != undefined && UserService.location.y != "";
    };
    $scope.goThemelist = function (index, topic) {
      $scope.step2 = false;
      if (topic.type == 1) {
        if ($scope.hasLocation()) {
          if (device.platform == "Android") {
            //安卓调用百度定位插件
            BlackService.baiduaddress().then(function () {
              if ($scope.hasLocation()) {
                $state.go('nearlysale', {topicid: topic.id});
              }
            }, function () {
            });
          } else {
            BlackService.gpsaddress().then(function () {
              if ($scope.hasLocation()) {
                $state.go('nearlysale', {topicid: topic.id});
              }
            }, function () {
            });
          }
          $state.go('nearlysale', {topicid: topic.id});
        } else {
          UtilService.showMess("定位服务未开启");
        }
      } else {
        if (topic.ttype == 0) {
          if (topic.taskcount == 1) {
            if (topic.simpleTaskType == 1) {
              $scope.go('helpselldetail', {'taskid': topic.simpleTaskId});
            } else if(topic.simpleTaskType == 2) {
              $scope.cleargo('cpvdetail', {taskid: topic.simpleTaskId});
            }else{
              if(topic.incometype==1){
                $scope.go('cpccoudetail',{'taskid': topic.simpleTaskId});
              }else{
                $scope.go('taskdetail', {'taskid': topic.simpleTaskId});
              }
            }
          } else {
            $state.go('themelist', {
              topicid: topic.id,
              'topictitle': topic.title,
              'topicimg': topic.img,
              'topicdesc': topic.desc,
              'type': topic.type,
              'ttype': topic.ttype
            });
          }
        } else if (topic.ttype == 1) {
          if (topic.usercount == 1) {
            var params = {
              mod: 'nUser',
              func: 'getBuserByuserid',
              userid: UserService.user.id,
              data: {"merchantid": topic.simpleUserId}
            };
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
              if (data.status == "103006") {
                UtilService.showMess("该商家已下架");
              } else {
                $scope.go('business', {merchantid: topic.simpleUserId});
              }
            });
          } else {
            $state.go('themelist', {
              topicid: topic.id,
              'topictitle': topic.title,
              'topicimg': topic.img,
              'topicdesc': topic.desc,
              'type': topic.type,
              'ttype': topic.ttype
            });
          }
        } else if (topic.ttype == 2) {
          var regex = /(https?:\/\/)?(\w+\.?)+(\/[a-zA-Z0-9\?%=_\-\+\/]+)?/gi;
          var url = topic.url.replace(regex, function (match, capture) {
            if (capture) {
              return match;
            }
            else {
              return 'http://' + match;
            }
          });
          if (url.indexOf('xtbrowser') != -1) {
            window.open(url, '_system', 'location=yes');
          } else {
            $scope.go('iframe', {iframeurl: url, name: ""});
          }
        } else if (topic.ttype == 3) {
          if (topic.appparams != "" && topic.appparams != null && topic.appparams != undefined) {
            $state.go(topic.appurl, angular.fromJson(topic.appparams));
          } else {
            if (topic.appurl == "msgsystem") {
              UserService.msgsystemflg = 1;
            }
            $state.go(topic.appurl);
          }
        } else {
          $state.go('themelist', {
            topicid: topic.id,
            'topictitle': topic.title,
            'topicimg': topic.img,
            'topicdesc': topic.desc,
            'type': topic.type
          });
        }
      }
      $timeout(function () {
        UtilService.customevent("hometopic", "主题" + index);
      }, 50)
    };

    var taskoneclick = 0;
    $scope.goTaskdetail = function (task) {
      if (taskoneclick == 1) {
        return;
      }
      taskoneclick = 1;
      if (TaskIndexService.readedarr.indexOf(task.id) < 0)
        TaskIndexService.readedarr.push(task.id);
      $rootScope.step2 = false;
      $(".newguidemask2").hide();
      if(task.incometype==1){
        $scope.go('cpccoudetail',{'taskid': task.id});
      }else {
        $scope.go('taskdetail', {'taskid': task.id, 'sort': $scope.sort});
      }
      $timeout(function () {
        taskoneclick = 0;
      }, 1000);
    };

    var bannerflg = 0;
    $scope.goBannerDetail = function (banner) {
      if (bannerflg != 0) {
        return;
      }
      bannerflg = 1;
      $timeout(function () {
        bannerflg = 0;
      }, 1000);
      if(angular.isDefined(banner.appurl)&&banner.appurl!=""){
        if(angular.isUndefined(banner.appparams)||banner.appparams==""){
          $scope.go(banner.appurl);
        }else{
          var par = eval("("+banner.appparams+")");
          $scope.go(banner.appurl,par);
        }
      }else if(angular.isDefined(banner.wapurl)&&banner.wapurl!=""){
        if(banner.wapurl.indexOf('xtbrowser') != -1){
          window.open(banner.wapurl, '_system', 'location=yes' );
        }else{
          $scope.go('iframe',{iframeurl:banner.wapurl,name:banner.name});
        }
      }
    };

    $scope.checkReaded = function (id) {
      var list = TaskIndexService.readedarr;
      return list.indexOf(id) >= 0;
    };

    $scope.doPulling = function () {
      $scope.$apply(function () {
      })
    };
    var flg = 0;
    $scope.updataBannerNum = function (banner) {
      if (angular.isDefined(banner.isnone)) {
        return;
      }
      if (flg != 0) {
        return;
      }
      flg = 1;
      $timeout(function () {
        flg = 0;
      }, 1000);
      //判断APP内跳转与浏览器跳转
      if(angular.isDefined(banner.appurl)&&banner.appurl!=""){
        if(angular.isUndefined(banner.appparams)||banner.appparams==""){
          $scope.go(banner.appurl);
        }else{
          var par = eval("("+banner.appparams+")");
          $scope.go(banner.appurl,par);
        }
      }else if(angular.isDefined(banner.wapurl)&&banner.wapurl!=""){
        if(banner.wapurl.indexOf('xtbrowser') != -1){
          window.open(banner.wapurl, '_system', 'location=yes' );
        }else{
          $scope.go('iframe',{iframeurl:banner.wapurl,name:banner.name});
        }
      }
      $timeout(function () {
        //banner点击次数
        var params = {
          mod: 'nComm',
          func: 'updateBannerNum',
          data: {bannerid: banner.id}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {});
        UtilService.customevent("banner", "banner");
      }, 1);
    };
    var scrollList = function () {
      //当页面超出屏幕时，滚到相应的位置
      var scrollTop = getScrolltop();
      if (scrollTop > mtop)
        if (device.platform == "Android") {
          //android
          $ionicScrollDelegate.$getByHandle('Scroll').scrollTo(0, mtop, true);
        } else {
          //ios
          $ionicScrollDelegate.$getByHandle('Scroll').scrollTo(0, mtop - 40, true);
        }
    };

    $scope.doRefreshJustForList = function () {
      //切换搜索的类型
      scrollList();
      $scope.listloadding = true;
      $scope.nonetask = false;
      $scope.hasNextPage = $scope.hasNextPageload = false;
      var type = $scope.type;
      $scope.sort = $scope.getSortById($scope.type);
      var arr = $scope.sort.split(",");
      var tasktype = $scope.type==0?"cpcall":arr[0];
      var sort = arr.length>1?$scope.sort.split(",")[1]:"";
      $(".moreContentBtn").last().hide();
      ResetData();
      //商家
      if (false) {
        var extraParams = getExtraParams();
        MerchantIndexService.refresh(extraParams).then(function (response) {
            if (response.status == '000000') {
              scrollList();
              $scope.nonenet = false;
              $scope.indexlist.list1 = response.data;
              $scope.showList = false;
              $scope.hasNextPage = $scope.hasNextPageload = MerchantIndexService.hasNextPage();
              $(".moreContentBtn").last().show();
              if ($scope.indexlist.list1.length == 0) {
                $scope.nonetask = true;
              } else {
                //存储本地数据
                SqliteUtilService.insertDataOfList($scope.indexlist.list1, "companymain");
                $scope.nonetask = false;
              }
            } else {
              $scope.hasNextPage = false;
            }
            $scope.$broadcast('scroll.refreshComplete');
            $timeout(function () {
              $scope.listloadding = false;
            }, 500);
          }, function () {
            if ($scope.indexlist.list1 == "" || $scope.indexlist.list1.length == 0 || angular.isUndefined($scope.indexlist.list1)) {
              $scope.nonenet = true;
            }
            $scope.hasNextPage = false;
            SqliteUtilService.selectData("companymain").then(function (data) {
              $scope.indexlist.list1 = data;
              $scope.showList = false;
            });
            $scope.$broadcast('scroll.refreshComplete');
            UtilService.showMess("网络不给力，请稍后刷新！");
            $timeout(function () {
              $scope.listloadding = false;
            }, 500);
          }
        )
      } else {//任务
        var city = "";
        if ($rootScope.city) {
          city = $rootScope.city;
        }
        TaskIndexService.refresh(sort, city,tasktype, $stateParams.firstLogin).then(function (response) {
            if (response.status == '000000') {
              scrollList();
              var templist = (response.data).concat();
              $scope.indexlist[type] = templist.concat();
              $scope.showList = true;
              if ($scope.sort == "recommand") {
                if(angular.isDefined($scope.taskbannerlist)){
                  var initindex = 1;
                  angular.forEach($scope.taskbannerlist,function (data,index) {
                    var num =parseInt(2*Math.random()+1)+initindex;
                    var banner = angular.copy(data);
                    banner.isbanner = 1;
                    $scope.indexlist[$scope.type].splice(num,0,banner);
                    initindex = initindex+6;
                  });
                }
                SqliteUtilService.insertDataOfList(response.data, "hometask", null, null);
              }
            }
            $scope.$broadcast('scroll.refreshComplete');
            $scope.hasNextPageload = $scope.hasNextPage = TaskIndexService.hasNextPage();
            $(".moreContentBtn").last().show();
            $timeout(function () {
              $scope.listloadding = false;
            }, 500);
          }, function () {
            $scope.hasNextPageload = $scope.hasNextPage = false;
            SqliteUtilService.selectData("banner", null, null).then(function (response) {
              $scope.taskbannerlist = response;
              SqliteUtilService.selectData("hometask", $scope.sort, null).then(function (response) {
                $scope.indexlist.list0 = response;
                $scope.showList = true;
                if(angular.isDefined($scope.taskbannerlist)){
                  var initindex = 1;
                  angular.forEach($scope.taskbannerlist,function (data,index) {
                    var num =parseInt(2*Math.random()+1)+initindex;
                    var banner = angular.copy(data);
                    banner.isbanner = 1;
                    $scope.indexlist.list0.splice(num,0,banner);
                    initindex = initindex+6;
                  });
                }
              })
            })
            // SqliteUtilService.selectData("hometask", null, null).then(function (response) {
            //   $scope.indexlist.list0 = response;
            //   $scope.showList = true;
            // }, function () {
            // });
            $scope.$broadcast('scroll.refreshComplete');
            UtilService.showMess("网络不给力，请稍后刷新！");
            $timeout(function () {
              $scope.listloadding = false;
            }, 500);
          }
        )
      }
    };

    //下拉刷新
    $scope.doRefresh = function () {
      if ($scope.firstLoc)
        if (angular.isUndefined($rootScope.city) || $rootScope.city == null || $rootScope.city == "") {
          getHeadLocation();
        }
      $scope.firstLoc = true;
      $scope.doRefreshJustForList();
      inittaskdata();
    };

    $scope.goSearch = function () {
      $scope.go('search', {'type': 'searchkeys'});
      $timeout(function () {
        UtilService.customevent("homehead", "搜索");
      }, 50)
    };
    $scope.goCustomer = function () {
      CustomerService.setCustomerfrom("home");
      $scope.cleargo("customer");
      $timeout(function () {
        UtilService.customevent("homehead", "客户管理");
      }, 50)
    };

    var indexBG = false;
    //首页下拉变大效果
    $scope.ispulling = "block";
    $scope.hasScrolled = 0;
    $scope.dragdown = function () {
      if ($scope.hasScrolled == 0) {
        $(".index-nav-bar").last().hide();
      }
    };
    $scope.release = function () {
      $(".index-nav-bar").last().show();
    };
    var getScrolltop = function () {
      return $ionicScrollDelegate.$getByHandle('Scroll').getScrollPosition().top;
    };
    $timeout(function () {
      $scope.conscroll = $ionicScrollDelegate.$getByHandle('Scroll');
      $scope.navScroll_0 = $ionicScrollDelegate.$getByHandle('navScroll_0');
      $scope.navScroll_1 = $ionicScrollDelegate.$getByHandle('navScroll_1');
    }, 0, false);

    $scope.$watch(function () {
    }, function () {
    });
    $scope.indexnavScroll0 = function () {
      $scope.navScroll_1.scrollTo($scope.navScroll_0.getScrollPosition().left, 0, false);
    };

    var dytop = 0;
    $scope.topDynamic = function () {
      var scrollTop = getScrolltop();
      dytop = getScrolltop();
      var navBar = $(".navBar").last()[0];
      var tittle = $(".tittle").last()[0];
      var indexNav = $('.static-nav').last().offset().top;
      if (device.platform == "Android") {
        //ANDROID 首页导航定位
        if (indexNav <= 70) {
          $('.fix-nav.indexNavBox').last().css("visibility", "visible");
        }
        if (indexNav > 70) {
          $('.fix-nav.indexNavBox').last().css("visibility", "hidden");
        }
      } else {
        //修改IOS状态栏高度
        var screenW1 = window.screen.width;
        var stateH1 = 640 * 20 / screenW1;
        //ios 首页导航栏
        if (indexNav <= 70 + stateH1) {
          $('.fix-nav.indexNavBox').last().show();
        }
        if (indexNav > 70 + stateH1) {
          $('.fix-nav.indexNavBox').last().hide();
        }
      }
      //滚动条向下拉动时的事件方法
      if (scrollTop <= 0) {
        $scope.hasScrolled = 0;
      } else {
        navBar.style.background = "rgba(255,59,48," + scrollTop / 312 + ")";
        tittle.style.opacity = scrollTop / 312;
      }
      if (scrollTop < 10) {
        $scope.hasScrolled = 0;
        tittle.style.opacity = 0;
        navBar.style.background = "rgba(255,59,48,0)";
      }
      if (scrollTop > 320) {
        $scope.hasScrolled = 1;
        tittle.style.opacity = 1;
        navBar.style.background = "rgba(255,59,48,1)";
      }
    };

    var outlogin = function () {
      if (device.platform == "Android") {
        navigator.xtuiPlugin.clearNotification(function () {
          MsgService.msgNotice = {};
        }, function () {
        });
      }
      MsgService.stopQueryAllNew();
      StorageService.clear();
      IMSqliteUtilService.dropImDataTable();
      $rootScope.chatBadge = 0;
      UserService.jumpmoney = null;
      SqliteUtilService.deletDataOfUser();
      $ionicHistory.clearCache().then(function () {
      });
      //QQ登出
      YCQQ.logout(function(args){},function(failReason){});

      //微博登出
      window.weibo.logout(function (res) {},function(failreason){});
      //个推解绑
      if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
        if (device.platform == "Android") {
          GeTuiSdkPlugin.unSelfBindAlias(function(){},UserService.user.id);
        }else {
          GeTuiSdk.unbindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
        }
      }
      UserService.user = {};
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'loadpage');
      $scope.go('login');
    };

    var onMessage = function (data) {
      if (data && data["redirect"]) {

      } else {
        var customContent = angular.fromJson(data.customContent);
        //pause、不在对应聊天页，要出现通知
        if (($state.current.name != "msgdetail" && $state.current.name != "permsgdetail") || ConfigService.currentIMgrpid != customContent.imgroupid || ConfigService.pause == true) {
          $window.xgpush.addLocalNotification(1, data.title, data.content, function (obj) {
          }, function () {
          });
        }
      }
    };

    StorageService.getItem("chatBadge").then(function (obj) {
      if (obj) {
        $rootScope.chatBadge = parseInt(obj);
      } else {
        $rootScope.chatBadge = 0;
      }
    }, function () {
    });

    var sysmsgGroupid = {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1};
    var onClick = function (data) {
      $rootScope.merryChirsBox = false;
      if (UserService.user == null || UserService.user.id == null || UserService.user.id.length == 0) {
        //没有用户信息，不做任何操作
        return;
      }
      var customContent = null;
      if (device.platform == "Android") {
        customContent = MsgService.msgNotice[data.msgId];
      } else {
        customContent = angular.fromJson(data.custom);
      }
      if (customContent == undefined) {
      } else if (customContent.type == 0 && customContent.redirect && customContent.redirect != "") {
        //后台通知
        if (customContent.redirect.params) {
          $state.go(customContent.redirect.url, customContent.redirect.params);
        } else {
          $state.go(customContent.redirect.url);
        }
      } else if (customContent.type == 1) {
        if (device.platform == "Android") {
          navigator.xtuiPlugin.clearNotification(function () {
            MsgService.msgNotice = {};
          }, function () {
          });
        }
        var currentStatename = $ionicHistory.currentStateName();
        var currentImgroupid;
        if ($ionicHistory.currentView().stateParams) {
          currentImgroupid = $ionicHistory.currentView().stateParams.imgroupid;
        } else {
          currentImgroupid = "";
        }

        var tourl = "";
        var xgparams = {};

        if (customContent == null) {
          $scope.go("tab.msg");
          tourl = "/tab/msg";
        } else {
          if (sysmsgGroupid[customContent.imgroupid]) {
            if (currentStatename == "msgdetailss") {
              return;
            }
            //是系统通知
            tourl = "/msgdetailss";
            xgparams = {
              'sysmsgtype': customContent.imgroupid,
              'sysmsgtypename': SysMsgService.sysmsgDefinition[customContent.imgroupid]
            };
            $scope.go('msgdetailss', {
              'sysmsgtype': customContent.imgroupid,
              'sysmsgtypename': SysMsgService.sysmsgDefinition[customContent.imgroupid]
            });
          } else if (customContent.imgroupid == -1) {
            if (currentStatename == "msgsystem") {
              return;
            }
            //固定系统消息
            tourl = "/msgsystem";
            $scope.go('msgsystem');
          } else {
            //聊天
            if (customContent.imgrouptype == 0 && (customContent.usertype == "s" || customContent.usertype === 0)) {
              if (currentStatename == "permsgdetail" && currentImgroupid == customContent.imgroupid) {
                return;
              }
              //与s单聊
              tourl = "/permsgdetail";
              xgparams = {
                'otheruserid': customContent.senderid,
                'otherusername': customContent.name,
                avate: customContent.avate,
                "imgroupid": customContent.imgroupid
              };
              $scope.go('permsgdetail', {
                'otheruserid': customContent.senderid,
                'otherusername': customContent.name,
                avate: customContent.avate,
                "imgroupid": customContent.imgroupid
              });
            } else if (customContent.imgrouptype == 0 && (customContent.usertype == "b" || customContent.usertype === 1)) {
              if (currentStatename == "msgdetail" && currentImgroupid == customContent.imgroupid) {
                return;
              }
              //与商家正式聊天页
              tourl = "/msgdetail";
              xgparams = {
                istmp: customContent.istmp,
                'otheruserid': customContent.senderid,
                'otherusername': customContent.name,
                'avate': customContent.avate,
                "imgroupid": customContent.imgroupid
              };
              $scope.go('msgdetail', {
                istmp: customContent.istmp,
                'otheruserid': customContent.senderid,
                'otherusername': customContent.name,
                'avate': customContent.avate,
                "imgroupid": customContent.imgroupid
              });
            } else if (customContent.imgrouptype == 1) {
              if (currentStatename == "msggroup" && currentImgroupid == customContent.imgroupid) {
                return;
              }
              //群
              tourl = "/msggroup";
              $scope.go('msggroup', {imgroupid: customContent.imgroupid});
            } else {
              if (currentStatename == "tab.msg") {
                return;
              }
              tourl = "/tab/msg";
              $scope.go("tab.msg");
            }
          }
          //清除未读状态
          StorageService.getItem("chatfirst").then(function (obj) {
            if (obj) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].imgroupid == customContent.imgroupid) {
                  obj[i].count = 0;
                  break;
                }
              }
              StorageService.setItem("chatfirst", obj).then(function (obj) {
              }, null);
            }
          }, function () {
          });
        }
        var query = {
          mod: "nuser",
          func: "nSaveUserBehavior",
          data: {'fromurl': "/xgopen", 'tourl': tourl, 'param': xgparams},
          userid: UserService.user.id
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
        });
        MsgService.msgNotice = {};
      }
    };

    if (UserService.xgreg == false) {
      //只添加一次
      UserService.xgreg = true;
      if (device.platform == "Android") {
        //Android
        //click单击处理key-value
        $window.xgpush.on("click", onClick);
      } else {
        //  IOS
        //$window.xgpush.on("message",onMessage);
        $window.xgpush.on("message", onClick);
      }
    }

    var getXgPushData = function () {
      //信鸽注册
      if (UtilService.checkNetwork()) {
        $window.xgpush.registerPush(UserService.user.id, function (event) {
          if (UserService.xgreg == false) {
            //只添加一次
            UserService.xgreg = true;
            //Android
            //click单击处理key-value
            $window.xgpush.on("click", onClick);
            //  IOS
            //$window.xgpush.on("message",onMessage);
            $window.xgpush.on("message", onClick);
          }
        }, function (event) {
          //注册失败，隔一段时间再重新注册
        });
      } else {
        $timeout(getXgPushData(), 60000);
      }
    };

    //自动登录
    var autologin = function () {
      if (!UserService.autologin) {
        BlackService.login().then(function (response) {
          if (response.status != "000000") {
            outlogin();
          } else {

            plugins.appPreferences.store(function () {
              UtilService.getLogtoken();
            }, function (resultData) {
            }, 'logtoken', response.data.logtoken);
            $timeout(function () {
              if (response.data.needJump) {
                $rootScope.congratulation = true;
                $timeout(function () {
                  $rootScope.congratulation = false;
                }, 4000);
                $rootScope.yestodayMoney = response.data.needJump.money.toFixed(2);
                $rootScope.yestodayPer = (response.data.needJump.beat * 100).toFixed(2) + "%";
              }
              if (response.data.firstLogin) {
                NewHandService.syncNewHandStep(1).then(function () {
                  var dataList = [{id: 1, step: 1}];
                  SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
                  NewHandService.checkNewHandType().then(function (res) {
                    $rootScope.step1 = res.data.type;
                    if ($rootScope.step1 == 1 || $rootScope.step1 == 2) {
                      $rootScope.step1InviteName = res.data.inviteName;
                      $rootScope.step1InviteAvatar = res.data.inviteAvatar;
                    }
                  }, function () {
                  })
                }, function () {
                });
              }else{
                $scope.getFirstChristmasApple();
              }
            }, 1000);
          }
        }, function () {
          outlogin();
        });
      }
    };

    $timeout(function () {
      autologin();
      navigator.splashscreen.hide();
      UtilService.countpagecount("modules/home/temp/taskindex.html.发现");
    }, 1000);

    //im建表
    IMSqliteUtilService.initIMdataBase();

    MsgService.startQuery = Math.random();
    MsgService.queryAllNew(MsgService.startQuery);

    /**
     * 新手引导
     */
    var firstLogin = $stateParams.firstLogin;
    //第一次登录的时候
    if (firstLogin) {
      NewHandService.syncNewHandStep(1).then(function () {
        var dataList = [{id: 1, step: 1}];
        SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
        NewHandService.checkNewHandType().then(function (res) {
          $rootScope.step1 = res.data.type;
          if ($rootScope.step1 == 1 || $rootScope.step1 == 2) {
            $rootScope.step1InviteName = res.data.inviteName;
            $rootScope.step1InviteAvatar = res.data.inviteAvatar;
          }
        }, function () {
        })
      }, function () {
      });
    } else {//杀进程的时候停留在第一步也能继续
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step == 1) {
            NewHandService.checkNewHandType().then(function (res) {
              $rootScope.step1 = res.data.type;
              if ($rootScope.step1 == 1 || $rootScope.step1 == 2) {
                $rootScope.step1InviteName = res.data.inviteName;
                $rootScope.step1InviteAvatar = res.data.inviteAvatar;
              }
            }, function () {
            })
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step == 1) {
                NewHandService.checkNewHandType().then(function (res) {
                  $rootScope.step1 = res.data.type;
                  if ($rootScope.step1 == 1 || $rootScope.step1 == 2) {
                    $rootScope.step1InviteName = res.data.inviteName;
                    $rootScope.step1InviteAvatar = res.data.inviteAvatar;
                  }
                }, function () {
                })
              }
            }
          }, function () {
          })
        }
      }, function () {
      });
    }

    //新手引导第一步点击方法
    $rootScope.closeNewHandStepOne = function () {
      $rootScope.step1 = -1;
      //给新用户5块钱
      newHandFirstEnd();
    };

    //先生成token
    var data = {};
    data.mod = 'nComm';
    data.func = 'makenTokenForRegister';
    UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
      $scope.newhandtoken = data.data;
    });
    var newhflg = 0;
    var newHandFirstEnd = function () {
      if(newhflg != 0){
        return;
      }
      newhflg = 1;
      NewHandService.newHandFirstEnd($scope.newhandtoken, $stateParams.firstLogin).then(function () {
        $rootScope.step2 = true;
        NewHandService.syncNewHandStep(2);
        var dataList = [{id: 1, step: 2}];
        SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
        var tabindex = $ionicTabsDelegate.selectedIndex();
        //判断是否在个人中心页面
        if (tabindex != 3) {
          $scope.go("tab.pcenter", {money: 5});
        } else {
          checkNewHandWhenNetIsBad();
        }
      }, function () {
      })
    };
    //网速不好的时候检测
    var checkNewHandWhenNetIsBad = function () {};

    var showTaskPointer = $stateParams.showTaskPointer;
    //从个人中心页跳转过来的时候
    if (showTaskPointer) {
      NewHandService.syncNewHandStep(3).then(function () {
        var dataList = [{id: 1, step: 3}];
        SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
        //判断是否在个人中心页面
        var tabindex = $ionicTabsDelegate.selectedIndex();
        if (tabindex == 0) {
          $rootScope.step3 = true;
        }
      }, function () {
      });
    } else {//杀进程的时候停留在第一步也能继续
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step == 2) {
            NewHandService.syncNewHandStep(3).then(function () {
              var dataList = [{id: 1, step: 3}];
              SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
              var tabindex = $ionicTabsDelegate.selectedIndex();
              if (tabindex == 0) {
                $rootScope.step3 = true;
              }
            }, function () {
            });
          } else if (data[0].step == 3) {
            var tabindex = $ionicTabsDelegate.selectedIndex();
            if (tabindex == 0) {
              $rootScope.step3 = true;
            }
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step == 2 || res.data.step == 3) {
                NewHandService.syncNewHandStep(3).then(function () {
                  var dataList = [{id: 1, step: 3}];
                  SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
                  var tabindex = $ionicTabsDelegate.selectedIndex();
                  if (tabindex == 0) {
                    $rootScope.step3 = true;
                  }
                }, function () {
                });
              }
            }
          }, function () {
          })
        }
      }, function () {
      });
    }

    $rootScope.closeNewHandStepThree = function () {
      $rootScope.step3 = false;
    };

    /**
     * 检测是否有收益
     */
    var checkWhetherHasIncome = function () {
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step == 4) {
            $rootScope.step4 = false;
            NewHandService.checkWhetherHasIncome().then(function (res) {
              if (res.data && res.data > 0) {
                $rootScope.step5 = 2;
                /*NewHandService.syncNewHandStep(5);
                var dataList = [{id: 1, step: 5}];
                SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);*/
              }
            }, function () {
            });
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step == 4) {
                $rootScope.step4 = false;
                NewHandService.checkWhetherHasIncome().then(function (res) {
                  if (res.data && res.data > 0) {
                    $rootScope.step5 = 2;
                    /*NewHandService.syncNewHandStep(5);
                    var dataList = [{id: 1, step: 5}];
                    SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);*/
                  }
                }, function () {
                });
              }
            }
          }, function () {
          });
        }
      }, function () {
      });
    };

    $rootScope.closeNewHandStepFive = function (data) {
      if(data){
        var params = {
          mod:"Naccount",
          func:"newHandFirstCpcClickAdd",
          userid: UserService.user.id,
          data:data
        };
        UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).then(function(res){
        },function(){});
      }
      NewHandService.syncNewHandStep(5);
      var dataList = [{id: 1, step: 5}];
      SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
      $rootScope.step5 = false;
      $scope.go("mypurse");
    };

    //弹排名
    var showRankflg = true;
    var showRank = function () {
      var needJump = $stateParams.needJump;
      if (showRankflg && needJump != null && needJump.beat > 0) {
        showRankflg = false;
        $rootScope.congratulation = true;
        $timeout(function () {
          $rootScope.congratulation = false;
        }, 4000);
        $rootScope.yestodayMoney = needJump.money.toFixed(2);
        $rootScope.yestodayPer = (needJump.beat * 100).toFixed(2) + "%";
      }
    }
  })
  //任务详情
  .controller("TaskDetailController", function ($ionicPopover, $scope, $sce, $rootScope, $stateParams, UserService, ConfigService, UtilService, $ionicHistory, $ionicActionSheet, $ionicPopup, $timeout,$interval, $window,$ionicModal, NewHandService, SqliteUtilService, CityService, FastGetService) {
    $scope.$on("$ionicView.beforeLeave", function () {
      $('.popup-mask').hide();
      $(".mask-tab").hide();
    });
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $rootScope.checkedList = [];
      CityService.setInTaskDetail(true);
      checkNewhandStep3();
    });

    $scope.$on("$ionicView.afterEnter", function () {
      if($stateParams.autoShare === true && $ionicHistory.backView() && $ionicHistory.backView().stateName == "tab.home") {
          $scope.showSharePopup();
      }

      if($stateParams.autoShare === true) {
          $scope.shareSDK();
      }
    });


/*

      //滚动隐藏按钮
    var taskIframe = document.getElementById('cpc_iframe');
    var taskDoc = taskIframe.contentWindow;
    $scope.showbtns = true;
    taskIframe.onload = function(){
      $scope.showbtns = true;
      var topValue1 = 0,
          topValue2 = 0,
          scrollInterval = null;
      taskDoc.addEventListener('scroll', handleScroll);
      function handleScroll(){
        hideShareBtn();
        if(scrollInterval == null) {
          scrollInterval = $interval(
            function scrollTest() {
              topValue1 = taskDoc.document.body.scrollTop;
              $timeout(
                function(){
                  topValue2 = taskDoc.document.body.scrollTop;
                },200)
              if(topValue1 == topValue2) {
                showShareBtn();
                $interval.cancel(scrollInterval);
                scrollInterval = null;
              }
            },200)
        }
      }
      function hideShareBtn(){
        $scope.showbtns = false;
      }
      function showShareBtn(){
        $scope.showbtns = true;
      }
    }


*/

    $scope.hamburgerUp = false;
    var checkNewhandStep3 = function () {
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step == 3) {
            NewHandService.syncNewHandStep(4).then(function () {
              var dataList = [{id: 1, step: 4}];
              SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
              $rootScope.step4 = true;
            }, function () {
            });
          } else if (data[0].step == 4) {
            $rootScope.step4 = true;
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step == 3) {
                NewHandService.syncNewHandStep(4).then(function () {
                  var dataList = [{id: 1, step: 4}];
                  SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
                  $rootScope.step4 = true;
                }, function () {
                });
              } else if (res.data.step == 4) {
                $rootScope.step4 = true;
              }
            }
          }, function () {
          })
        }
      }, function () {
      });
    };
    $rootScope.closeNewHandStepFour = function () {
      $rootScope.step4 = false;
      $scope.showSharePopup();
    };
    /*汉堡包*/
    $scope.hamburgerDragDown = function () {
      if (!UtilService.checkNetwork()) {
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      $(".taskDetailRulesBox").slideDown();
      $(".taskInforScrollWrap").css("overflow", "hidden");
      $scope.hamburgerUp = false;
      UtilService.tongji('rule', {'taskid': taskid});
      UtilService.customevent("cpcrule", "cpc汉堡包");
    };
    $scope.hamburgerDragUp = function () {
      $(".taskDetailRulesBox").slideUp();
      $(".taskInforScrollWrap").css("overflow", "scroll");
      $scope.hamburgerUp = true;
    };




    $scope.purseSale = '9';
    $scope.purseCoupon = '手机';
    $scope.purseMoney = '20';
    $ionicModal.fromTemplateUrl('hamburger-modal.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.bgfade = false;
    $scope.openHambgModal = function() {
      $scope.bgfade = false;
      $scope.modal.show();

      $scope.bgfade = false;
      $scope.purseSale = '9';
      $scope.purseCoupon = '手机';
      $scope.purseMoney = '20';

      $timeout(function(){
        $timeout(function(){
          $scope.purseSale = '8';
          $scope.purseCoupon = '电脑';
          $scope.purseMoney = '50';
          $timeout(function(){
            $scope.purseSale = '7';
            $scope.purseCoupon = '汽车';
            $scope.purseMoney = '100';
          },660)
        },600)
      },500)
    };
    $scope.closeHambgModal = function() {
      $scope.bgfade = true;
      $scope.modal.hide();
    };


    var iframe = document.getElementById('cpc_iframe');
    var windowWidth = window.screen.width;
    var iframeLoad = function () {
      var x = document.getElementById("cpc_iframe");
      var y = (x.contentWindow || x.contentDocument);
      if (y.document)y = y.document;
      y.body.style.width = 640 + "px";
      y.body.style.fontSize = "25px";
      //设置缩放比例 TODO
    };
    if (!iframe.addEventListener) {
      iframe.attachEvent('onload', iframeLoad)
    }
    iframe.addEventListener('load', iframeLoad, true);

    //设置数据
    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };
    //汉堡包默认打开判断
    try {
      plugins.appPreferences.fetch(function (count) {
        if (count == null) {

          $scope.putData("hamburger", 1);
          $scope.openHambgModal();
        } else {
          if (count <= 2) {
            $scope.openHambgModal();
            $scope.putData("hamburger", count + 1);
          } else {
            $scope.bgfade = true;
          }
        }
      }, function (count) {
      }, "hamburger");
    }
    catch (e) {
    }
    var taskid = $stateParams.taskid;
    //分享的相关处理
    $scope.shareurl = "";
    $scope.sharecode = "";
    $scope.hidemsg = false;
  //  $scope.hidemsgshow = false;
    $scope.backShare = function () {
      var params = {
        mod: "nStask",
        func: "acceptNTask",
        userid: UserService.user.id,
        data: {'taskid': taskid, 'tasktype': '0', 'showstatus': 0}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          $scope.shareurl = data.data.url;
          $scope.sharecode = data.data.code;
          //新手引导的参数
          $scope.newhandshare = {};
          $scope.newhandshare.workid = data.data.workid;
          $scope.newhandshare.ip = data.data.ip;
        } else if (data.status == '140001' || data.status == '140002') {
          $scope.hidemsg = true;
          $scope.showmsg = data.msg;
          getViewReason();
        }
      }, function () {
      })
    };

    /*不能分享理由弹窗弹窗*/
    $scope.sharReasonPop = function() {
      var sharReasonPopup = $ionicPopup.show({
        title: $scope.showmsg,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.hideMsg();
            }
          },
          { text: '<span style="color: #ff3b30">查看原因</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.goHelp()
            }
          }
        ]
      })
    };


    $scope.acceptNCode = function () {
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
    var iosshareflg = 0;
    $scope.iosNewShare = function () {
      if (iosshareflg != 0) {
        return;
      }
      iosshareflg = 1;
      var sharetitle = $scope.task.sharetitle;
      var sharedisc = $scope.task.sharedisc;
      $window.simpleshare.simpleshowShare(function (resData) {
        if (resData == "success") {
          shareSuccess("分享成功！");
        }
        iosshareflg = 0;
      }, function () {
      }, sharetitle, $scope.imageUrl, $scope.shareurl);
    };
    $scope.backShare();
    var template = '<ion-popover-view class="taskdpopover" ng-click=" closePopover()"><ion-content><ul class="workc_popover"><li ng-click="goBusi()"><i class="icon icon--2"></i>商家</li><li ng-click="gotoshare()" ><i class="icon icon-cps-share"></i>分享</li><li ng-if="!isstore"  ng-click="storeTask(task.id)"><i class="icon icon-xt3-love"></i>收藏</li><li ng-if="isstore" ng-click="storeTask(task.id)"><i class="icon icon-xt-shixin"></i>收藏</li></ul></ion-content></ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $scope.openPopover = function () {
      $scope.popover.show();
    };
    $scope.closePopover = function () {
      $scope.popover.hide();
    };

    $scope.gotoshare = function () {
      $scope.closePopover();
      $scope.go('selectcontact', {shareid: $scope.task.id, name: $scope.task.name, type: '7'});
      UtilService.customevent("cpctoshare", "APP内任务分享");
    };

    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.buttonname = "分享一下";
    $scope.hidemsg = false;
    $scope.showpause = true;

    $("#cpc_iframe").load(function () {
      $(".loadanimation").hide();
    });

    //获取任务详情
    $scope.gettaskdetial = function () {
      var params = {
        mod: "nStask",
        func: "getCpcTaskDetail",
        userid: $scope.user.id,
        data: {"taskid": taskid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.task = data.data;
          //判断是否已收藏
          $scope.isstore = $scope.task.isstore == "1";
          if ($scope.task.isshare == 1) {
            $scope.buttonname = "继续分享";
          } else {
            $scope.buttonname = "分享一下";
          }
          if ($scope.task.pstatus == 1 || $scope.task.status == 0 || $scope.task.isdel == 1) {
            $scope.showpause = false;
          } else {
            $scope.showpause = true;
          }
          $scope.targetUrl = $sce.trustAsResourceUrl($scope.task.url);
          $scope.imageUrl = $scope.picserver + $scope.task.shareview;
        }
      }).error(function () {
        $scope.buttonname = "分享一下";
        $scope.nonenet = true;
      });
    };
    $scope.gettaskdetial();
    //回商家
    $scope.goBusi = function () {
      $scope.closePopover();
      if ($scope.task.merchantstatus == 4) {
        UtilService.showMess("该商家已下架");
        return;
      }
      $scope.go('business', {merchantid: $scope.task.merchantid});
      UtilService.customevent("cpcgobusiness", "cpc跳转商家");
    };

    var storeflg = 0;
    //收藏/取消 任务
    $scope.storeTask = function () {
      if (!UtilService.checkNetwork()) {
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      if (angular.isDefined($scope.user.id) && $scope.user.id != "" && $scope.user.id != null) {
        if (storeflg != 0) {
          return;
        }
        storeflg = 1;
        var params = {
          mod: "nStask",
          func: "storeTask",
          userid: $scope.user.id,
          data: {"taskid": taskid,tasktype: 0}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            if (data.data.isstore == "1") {
              UtilService.showMess("收藏成功！");
              UtilService.tongji('ctaskstore', {'taskid': taskid});
              UtilService.customevent("mycollection", "已收藏任务");
            } else {
              UtilService.showMess("取消成功！");
              UtilService.tongji('cancelctaskstore', {'taskid': taskid});
            }
            $scope.isstore = !$scope.isstore;
          }
          $timeout(function () {
            storeflg = 0;
          },2000);
          UtilService.collection = "1";
        }).error(function () {
          $timeout(function () {
            storeflg = 0;
          },2000);
          UtilService.showMess("网络不给力，请稍后刷新");
        })
      } else {
        $scope.go('login');
      }
    };

    /*分享弹窗*/
    $scope.ifopensharepopup = false;
    $scope.closesharepopupfun = function () {
      $scope.ifopensharepopup = false;
    };
    $scope.shareSDK = function () {
      if ($scope.hidemsg) {
     //   $scope.hidemsgshow = true;
        $scope.sharReasonPop();
        return;
      }
      if (device.platform == "Android") {
        $scope.ifopensharepopup = true;
      } else {
        $scope.iosNewShare();
      }
    };
    /**
     * 新手引导分享成功
     */
    var shareSuccess = function (mstr) {
      $scope.acceptNCode();
      //返回全部分享任务刷新
      if (FastGetService.sharetask.indexOf(taskid) < 0)
        FastGetService.sharetask.push(taskid);
      SqliteUtilService.selectData("newhandlog", "intime", null, "desc").then(function (data) {
        if (data && data.length > 0) {
          if (data[0].step == 4) {
            $rootScope.step4 = false;
            $rootScope.step5 = 1;
            /*NewHandService.syncNewHandStep(5);
            var dataList = [{id: 1, step: 5}];
            SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);*/
          } else {
            if (device.platform == "Android")
              UtilService.showMess1(mstr);
          }
        } else {
          NewHandService.getNewHandStep().then(function (res) {
            if (res.data) {
              if (res.data.step == 4) {
                $rootScope.step4 = false;
                $rootScope.step5 = 1;
                /*NewHandService.syncNewHandStep(5);
                var dataList = [{id: 1, step: 5}];
                SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);*/
              } else {
                if (device.platform == "Android")
                  UtilService.showMess1(mstr);
              }
            } else {
              if (device.platform == "Android")
                UtilService.showMess1(mstr);
            }
          }, function () {
          });
        }
      }, function () {
      });
    };

    //分享
    var newshareflg = 0;
    $scope.newShare = function (sharetype) {
      if (newshareflg != 0) {
        return;
      }
      newshareflg = 1;
      var url = $scope.shareurl;
      var sharetitle = $scope.task.sharetitle;
      var sharedisc = $scope.task.sharedisc;
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
        }, sharetitle, sharedisc, $scope.imageUrl, url, "s", ConfigService.wxserver, UtilService.logtoken);
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
        }, sharetitle, sharedisc, $scope.imageUrl, url, "s", ConfigService.wxserver, UtilService.logtoken);
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
          var imgs = [$scope.imageUrl];
          args.imageUrl = imgs;
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
              UtilService.showMess1('新浪微博分享取消');
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
        newshareflg = 0;
      }, 1500);
      UtilService.tongji("sharetype", {'sharetype': sharetype, 'taskid': taskid});
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

    $scope.hideMsg = function () {
    //  $scope.hidemsgshow = false;
      shareflg = 0;
      $("#begin").removeAttr("disabled");
    };

    $scope.couponmessageinfo="";
    var couponPoupe = function () {
      $ionicPopup.show({
        title: $scope.couponmessageinfo,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">取消</span>',
            type: 'button-positive',
            onTap:function(){
            }
          },
          { text: '<span style="color: #ff3b30">确认</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.shareSDK();
            }
          }
        ]
      });
    };

    //游客模式
    var shareflg = 0;
    $scope.showSharePopup = function () {
      if (!UtilService.checkNetwork()) {
        UtilService.showMess("网络不给力，请稍后重试");
        return;
      }
      if (shareflg != 0) {
        return;
      }
      shareflg = 1;
      UtilService.tongji('cpcshare', {'taskid': taskid});
      $timeout(function () {
        shareflg = 0;
      }, 1500);
      if ($scope.task.status == 2) {
        var popup2 = $ionicPopup.confirm({
          title: "当前任务已结束，继续分享将没有任何福利，是否继续？",
          cancelText: "取消",
          cancelType: "button-cancel",
          okText: "继续",
          okType: 'button-go'
        });
        popup2.then(function (res) {
          if (res) {
            $scope.shareSDK();
          }
        });
      } else {

        /*优惠券已领完或者已过期*/
        if($scope.task.isexpire==1){
          $scope.couponmessageinfo ='优惠券已过期，分享一下将无法获得福利';
          couponPoupe();
        }else if($scope.task.isover==1){
          if($scope.task.isaccept==0){
            $scope.couponmessageinfo ='优惠券已抢完，分享一下将无法获得优惠券';
            couponPoupe();
          }else {
            $scope.shareSDK();
          }
        }else {
          $scope.shareSDK();
        }
      }
      $timeout(function () {
        shareflg = 0
      }, 1000);
    };

    $scope.closeNewHandStepFive1 = function (data) {
      if(data){
        var params = {
          mod:"Naccount",
          func:"newHandFirstCpcClickAdd",
          userid: UserService.user.id,
          data:data
        };
        UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).then(function(res){
        },function(){});
      }
      NewHandService.syncNewHandStep(5);
      var dataList = [{id: 1, step: 5}];
      SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
      $rootScope.step5 = false;
      $scope.go("mypurse");
    };

    $('.article_rule').click(function () {
      $('.article_rule').slideUp();
    });

    $('.rule_closebtn').click(function () {
      $(this).parent().slideUp();
    })

  })
  //扫一扫
  .controller("centerScanController", function ($scope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
  });
