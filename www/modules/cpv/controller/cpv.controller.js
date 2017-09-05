/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("cpvListController", cpvListController);

  //依赖注入
  cpvListController.$inject = ['$scope','$ionicScrollDelegate','UserService','UtilService','CpvService','$rootScope','BannerService','ConfigService','SqliteUtilService'];
  function cpvListController($scope,$ionicScrollDelegate,UserService,UtilService,CpvService,$rootScope,BannerService,ConfigService,SqliteUtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
     $scope.startfun();
    });

    //参数初始化
    $scope.sort = "recommand";
    $scope.showloading = false;//加载动画
    $scope.hasNextPage = false;
    $scope.notaskflg = "none";//无任务显示
    var indexnav_w = 0;
    $scope.sortlist = [];
    $scope.picserver = ConfigService.picserver;
    $scope.allsharelist = [];//存放所有排序列表[[0],[1],[2],[3]...]
    $scope.allsharepageno = [];//记录各排序列表pageno[[0],[1],[2],[3]...]
    $scope.querytype = 1;
    $scope.hasNextPage = false;
    $scope.allShareHasNextPage = [];//记录各排序列表是否有下一页[[true],[true],[false],[false]...]
    $scope.choosesort = {"sort": 0};


    var mtop = 311;
    var getScrolltop = function () {
      return $ionicScrollDelegate.$getByHandle('cpvIndexHandle').getScrollPosition().top;
    };
    $scope.cpvIndexScroll = function(){
      var scrollTop = getScrolltop();
      if(scrollTop > mtop){
        $('.indexGetTop_cpv').removeClass("hide").addClass("show");
      }else{
        $('.indexGetTop_cpv').removeClass("show").addClass("hide");
      }
    };
    var scrollList = function () {
      //当页面超出屏幕时，滚到相应的位置
      var scrollTop = getScrolltop();
      if (scrollTop > mtop)
        if (device.platform == "Android") {
          //android
          $ionicScrollDelegate.$getByHandle('cpvIndexHandle').scrollTo(0, mtop, true);
        } else {
          //ios
          $ionicScrollDelegate.$getByHandle('cpvIndexHandle').scrollTo(0, mtop - 40, true);
        }
    };
    //返回顶部
    $scope.getTop = function () {
      scrollList();
    };

    $scope.updataCpvBannerNum = function (banner) {
      if(angular.isDefined(banner.appurl)&&banner.appurl!=""){
        if(angular.isUndefined(banner.appparams)||banner.appparams==""){
          $scope.go(banner.appurl);
        }else{
          var par = eval("("+banner.appparams+")");
          $scope.go(banner.appurl,par);
        }
      }else {
        if(banner.wapurl.indexOf('xtbrowser') != -1){
          window.open(banner.wapurl, '_system', 'location=yes' );
        }else{
          //$scope.go('iframe',{iframeurl:banner.wapurl,name:banner.name});
        }
      }
    };

    //排序切换
    $scope.clicknavBox = function (sort) {
      if ($scope.sort == sort.indexvalue) {
        return;
      }
      if(sort.indexvalue=="推荐"){
        $scope.sort="";
      }

      $scope.notaskflg = "none";
      var index = sort.sort;
      //性能优化，通过jquery直接对DOM操作，减少angularjs数据绑定的延迟.
      var getX = 0;
      getX =indexnav_w * index;
      if ($scope.type == index) {
        return;
      }

      $scope.type = index;
      //标红
      $scope.borderIndexBotStyle = {
        'transform': 'translateX(' + getX + 'px)',
        '-webkit-transform': 'translateX(' + getX + 'px)'
      };

      $scope.sort = sort.indexvalue;
      $scope.choosesort = sort;
      $scope.hasNextPage = angular.copy($scope.allShareHasNextPage[$scope.choosesort.sort]);
      CpvService.setSahrePageNo($scope.allsharepageno[$scope.choosesort.sort]);
      if ($scope.allsharelist[$scope.choosesort.sort].length == 0) {
        //切换排序---刷新
        $scope.doRefresh();
      }
      if ($scope.sortlist.length > 4) {
        var centerlen = 136 * (index + 1 / 2) - 320;
        var getX2 = 136 * $scope.sortlist.length;
        var movelength = getX2 - 640;
        if (index == 0 || index == 1) {
          $ionicScrollDelegate.$getByHandle('cpvMenuHandle').scrollTo(0, 0);
        } else if (index == $scope.sortlist.length - 2 || index == $scope.sortlist.length - 1) {
          $ionicScrollDelegate.$getByHandle('cpvMenuHandle').scrollTo(movelength, 0);
        } else {
          $ionicScrollDelegate.$getByHandle('cpvMenuHandle').scrollTo(centerlen, 0);
        }
      }
    };
    //$scope.sortlist11 = [{"name":"理财"},{"name":"生活服务"},{"name":"教育"},{"name":"母婴"},{"name":"旅游"},{"name":"生活服务"}];

    //动态获取排序
    $scope.getIndexType = function () {
      CpvService.getCpvIndexType2().then(function (response) {
        $scope.sortlist = [];
        var totallist = [];
        $scope.industrylist = response.data[0];
        for(var i=0;i<$scope.industrylist.industryList.length;i++){
          $scope.sortlist.push({"id": i+ 2, "name": $scope.industrylist.industryList[i].name, "indexvalue":$scope.industrylist.industryList[i].name, "sort": i + 1});
          $scope.allsharelist.push([]);
          $scope.allShareHasNextPage.push([]);
          $scope.allsharepageno.push([1]);
          totallist.push([]);
        }
        $scope.sortlist.unshift({"id": 1, "name": "推荐", "indexvalue": "推荐", "sort":0})
        $scope.allsharelist.push([]);
        $scope.allShareHasNextPage.push([]);
        $scope.allsharepageno.push([1]);
        totallist.push([]);

        $scope.choosesort = $scope.sortlist[0];
        $scope.sort = $scope.choosesort.indexvalue;
        CpvService.setAllSahreList(totallist);
        /*菜单滑动显示*/
        indexnav_w = 136;
        var navwidth = indexnav_w * $scope.sortlist.length;
        $scope.cpvIndexMenuStyle = {'width': navwidth + 'px'};

        $scope.doRefresh();
      }, function () {
        $scope.doRefresh();
      });
    };
    $scope.getIndexType();

    $scope.getcpvbanneron = function(){
      var rtype=2;
      //进入app,获取cpvbanners
      BannerService.getcpvbanner(rtype).then(function (response) {
        $scope.bannerlist = response.data;
      }, function () {
        $scope.bannerlist = [{"pic": "img/default_banner.jpg", "isnone": 1}];
      });
    }
    $scope.getcpvbanneron();

    //下拉刷新
    $scope.doRefresh = function () {
      var sortquery="";
      if($scope.sort=="推荐"){
        sortquery="";
      }else{
        sortquery=$scope.sort;
      }
      if (!$scope.sortlist) {
        $scope.sortlist = [];
      }
      if ($scope.sortlist.length == 0) {
        $scope.getIndexType();
      }
      $scope.getcpvbanneron();

      $scope.showloading = true;
      var param = {
        tasktype: 'cpv',
        industry: sortquery,
        querytype: 1,
        city: $rootScope.city,
        x: UserService.location.x,
        y: UserService.location.y
      };
      CpvService.refresh(param, $scope.choosesort.sort).then(function (response) {
            if (response.status == '000000') {
              $scope.allsharelist[$scope.choosesort.sort] = CpvService.getAllShareList($scope.choosesort.sort);
              $scope.hasNextPage = CpvService.getNextPage();
              $scope.allShareHasNextPage[$scope.choosesort.sort] = angular.copy($scope.hasNextPage);
              $scope.allsharepageno[$scope.choosesort.sort] = angular.copy(CpvService.getSharePageNo());
              if ($scope.allsharelist[$scope.choosesort.sort].length == 0) {
                $scope.notaskflg = "block";
                $scope.hasNextPage = false;
              } else if ($scope.allsharelist[$scope.choosesort.sort].length < 10) {
                $scope.notaskflg = "none";
                $scope.hasNextPage = false;
              } else {
                $scope.hasNextPage = CpvService.getNextPage();
              }
            } else {
              $scope.notaskflg = "block";
              $scope.hasNextPage = false;
            }
            $scope.showloading = false;
            if ($scope.choosesort.sort==0&&$scope.allsharelist[$scope.choosesort.sort].length > 0 && angular.isDefined($scope.allsharelist[$scope.choosesort.sort])) {
              SqliteUtilService.insertDataOfList($scope.allsharelist[$scope.choosesort.sort], "cpvindexlist",null,null);
            }
          }, function () {
            if($scope.choosesort.sort==0){
              SqliteUtilService.selectData("cpvindexlist",'cpvid',null,null).then(function (result) {
                if (angular.isUndefined(result) || result.length == 0) {
                  $scope.notaskflg = "block";
                } else {
                  $scope.allsharelist[$scope.choosesort.sort] = result;
                }
              }, function () {
              });
            }else{
              if($scope.allsharelist[$scope.choosesort.sort].length == 0){
                $scope.notaskflg = "block";
              }
            }
            UtilService.showMess("网络不给力，请稍后重试！");
            $scope.hasNextPage = false;
            $scope.showloading = false;
          }
      ).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
          });
    };

    $scope.loadMore = function () {
      var sortquery="";
      if($scope.sort=="推荐"){
        sortquery="";
      }else{
        sortquery=$scope.sort;
      }
      $scope.showloading = true;
      var param = {
        tasktype: 'cpv',
        industry: sortquery,
        querytype: 1,
        city: $rootScope.city,
        x: UserService.location.x,
        y: UserService.location.y
      };
      CpvService.pagination(param, $scope.choosesort.sort).then(function (response) {
            if (response.status == '000000') {
              $scope.allsharelist[$scope.choosesort.sort] = CpvService.getAllShareList($scope.choosesort.sort);
              $scope.hasNextPage = CpvService.getNextPage();
              $scope.allShareHasNextPage[$scope.choosesort.sort] = angular.copy($scope.hasNextPage);
              $scope.allsharepageno[$scope.choosesort.sort] = angular.copy(CpvService.getSharePageNo());
              if ($scope.allsharelist[$scope.choosesort.sort].length == 10) {
                $scope.hasNextPage = false;
              } else {
                $scope.hasNextPage = CpvService.getNextPage();
              }
            }
            $scope.showloading = false;
            if ($scope.choosesort.sort==0&&$scope.allsharelist[$scope.choosesort.sort].length > 0 && angular.isDefined($scope.allsharelist[$scope.choosesort.sort])) {
              SqliteUtilService.insertDataOfList($scope.allsharelist[$scope.choosesort.sort], "cpvindexlist",null,null);
            }
          }, function () {
            $scope.hasNextPage = false;
            $scope.showloading = false;
            if($scope.choosesort.sort==0){
              SqliteUtilService.selectData("cpvindexlist",'cpvid',null,null).then(function (result) {
                if (angular.isUndefined(result) || result.length == 0) {
                  $scope.notaskflg = "block";
                } else {
                  $scope.allsharelist[$scope.choosesort.sort] = result;
                }
              }, function () {
              });
            }else{
              if($scope.allsharelist[$scope.choosesort.sort].length == 0){
                $scope.notaskflg = "block";
              }
            }
            UtilService.showMess("网络不给力，请稍后重试！");
          }
      ).finally(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
    };


    $scope.goCpvDetail = function (cpvtask) {
      if (CpvService.readedarr.indexOf(cpvtask.id) < 0)
        CpvService.readedarr.push(cpvtask.id);
      $scope.cleargo('cpvdetail', {taskid: cpvtask.id});
    };

    $scope.checkShare = function (id) {
      var list = CpvService.sharetask;
      return list.indexOf(id) >= 0;
    };

    $scope.checkReaded = function (id) {
      var list = CpvService.readedarr;
      return list.indexOf(id) >= 0;
    }

  }
}());
