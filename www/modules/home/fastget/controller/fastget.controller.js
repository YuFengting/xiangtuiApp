$(function () {
  'use strict';
  angular.module('xtui').controller('fastgetcontroller', fastgetcontroller);
  fastgetcontroller.$inject = ["$scope", "UtilService", "FastGetService", "$rootScope", "UserService", "$ionicScrollDelegate"];
  function fastgetcontroller($scope, UtilService, FastGetService, $rootScope, UserService, $ionicScrollDelegate) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      if (UserService.fastget) {
        $scope.allsharelist = [];//存放所有排序列表[[0],[1],[2],[3]...]
        $scope.allsharepageno = [];//记录各排序列表pageno[[0],[1],[2],[3]...]
        $scope.querytype = 1;
        vm.hasNextPage = false;
        $scope.allShareHasNextPage = [];//记录各排序列表是否有下一页[[true],[true],[false],[false]...]
        $scope.choosesort = {"sort": 0};
        vm.getIndexType();
        UserService.fastget = false;
      }
    });
    //参数初始化
    var vm = this;
    vm.sort = "recommand";
    vm.showloading = false;//加载动画
    vm.hasNextPage = false;
    vm.notaskflg = "none";//无任务显示
    var indexnav_w = 0;

    //排序切换
    $scope.clicknavBox = function (sort) {
      if (vm.sort == sort.indexvalue) {
        return;
      }
      //标红
      $scope.borderBotStyle = {
        'transform': 'translateX(' + (sort.sort) * indexnav_w + 'px)',
        '-webkit-transform': 'translateX(' + (sort.sort) * indexnav_w + 'px)'
      };
      vm.sort = sort.indexvalue;
      $scope.choosesort = sort;
      vm.hasNextPage = angular.copy($scope.allShareHasNextPage[$scope.choosesort.sort]);
      FastGetService.setSahrePageNo($scope.allsharepageno[$scope.choosesort.sort]);
      $ionicScrollDelegate.$getByHandle('fastgetcontent').scrollTop();
      if ($scope.allsharelist[$scope.choosesort.sort].length == 0) {
        //切换排序---刷新
        vm.doRefresh();
      }
      if (vm.sortlist.length > 5) {
        var index = sort.sort;
        var centerlen = indexnav_w * (index + 1 / 2) - 320;
        var getX = indexnav_w * vm.sortlist.length;
        var movelength = getX - 640;
        if (index == 0 || index == 1) {
          $ionicScrollDelegate.$getByHandle('fastGetnavScroll').scrollTo(0, 0);
        } else if (index == vm.sortlist.length - 2 || index == vm.sortlist.length - 1) {
          $ionicScrollDelegate.$getByHandle('fastGetnavScroll').scrollTo(movelength, 0);
        } else {
          $ionicScrollDelegate.$getByHandle('fastGetnavScroll').scrollTo(centerlen, 0);
        }
      }
    };

    //动态获取排序
    vm.getIndexType = function () {
      FastGetService.getIndexType().then(function (response) {
        vm.sortlist = [];
        var totallist = [];
        angular.forEach(response.data, function (val, n) {
          vm.sortlist.push({"id": n + 1, "name": val.name, "indexvalue": val.indexvalue, "sort": n});
          $scope.allsharelist.push([]);
          $scope.allShareHasNextPage.push([]);
          $scope.allsharepageno.push([1]);
          totallist.push([]);
        });
        $scope.choosesort = vm.sortlist[0];
        vm.sort = $scope.choosesort.indexvalue;
        //标红
        $scope.borderBotStyle = {
          'transform': 'translateX(' + ($scope.choosesort.sort) * 180 + 'px)',
          '-webkit-transform': 'translateX(' + ($scope.choosesort.sort) * 180 + 'px)'
        };
        FastGetService.setAllSahreList(totallist);
        //根据缩放比获取排序列表宽度
        if (vm.sortlist.length > 4) {
          indexnav_w = 180;
          var navwidth = indexnav_w * vm.sortlist.length;
          $scope.fastgetMenuStyle = {'width': navwidth + 'px'};
        } else {
          indexnav_w = 640 / vm.sortlist.length;
          $(".borderBot").css("left", "24px");
          $scope.fastgetMenuStyle = {'width': "100%", "display": "flex", "display": "-webkit-flex"};
          $(".indexlist-nav li").css({"flex": 1, "-webkit-flex": 1});
        }
        vm.doRefresh();
      }, function () {
        vm.doRefresh();
      });
    };
    // vm.getIndexType();

    //下拉刷新
    vm.doRefresh = function () {
      $ionicScrollDelegate.$getByHandle('fastgetcontent').scrollTop();
      if (!vm.sortlist) {
        vm.sortlist = [];
      }
      if (vm.sortlist.length == 0) {
        vm.getIndexType();
      }
      vm.showloading = true;
      var arr = vm.sort.split(",");
      var tasktype = $scope.choosesort.sort==0?"cpcall":arr[0];
      var sort = arr.length>1?vm.sort.split(",")[1]:"";
      var param = {
        sort:sort,
        tasktype: tasktype,
        industry: "",
        querytype: 1,
        city: $rootScope.city
      };
      $scope.startfun();
      FastGetService.refresh(param, $scope.choosesort.sort).then(function (response) {
          if (response.status == '000000') {
            $scope.allsharelist[$scope.choosesort.sort] = FastGetService.getAllShareList($scope.choosesort.sort);
            vm.hasNextPage = FastGetService.getNextPage();
            $scope.allShareHasNextPage[$scope.choosesort.sort] = angular.copy(vm.hasNextPage);
            $scope.allsharepageno[$scope.choosesort.sort] = angular.copy(FastGetService.getSharePageNo());
            if ($scope.allsharelist[$scope.choosesort.sort].length == 0) {
              vm.notaskflg = "block";
              vm.hasNextPage = false;
            } else if ($scope.allsharelist[$scope.choosesort.sort].length < 10) {
              vm.notaskflg = "none";
              vm.hasNextPage = false;
            } else {
              vm.hasNextPage = FastGetService.getNextPage();
            }
          } else {
            vm.notaskflg = "block";
            vm.hasNextPage = false;
          }
          vm.showloading = false;
        }, function () {
          UtilService.showMess("网络不给力，请稍后刷新");
          vm.notaskflg = "block";
          vm.hasNextPage = false;
          vm.showloading = false;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    vm.loadMore = function () {
      vm.showloading = true;
      var arr = vm.sort.split(",");
      var tasktype = $scope.choosesort.sort==0?"cpcall":arr[0];
      var sort = arr.length>1?vm.sort.split(",")[1]:"";
      var param = {
        sort: sort,
        tasktype: tasktype,
        industry: "",
        querytype: 1,
        city: $rootScope.city
      };
      FastGetService.pagination(param, $scope.choosesort.sort).then(function (response) {
          if (response.status == '000000') {
            $scope.allsharelist[$scope.choosesort.sort] = FastGetService.getAllShareList($scope.choosesort.sort);
            vm.hasNextPage = FastGetService.getNextPage();
            $scope.allShareHasNextPage[$scope.choosesort.sort] = angular.copy(vm.hasNextPage);
            $scope.allsharepageno[$scope.choosesort.sort] = angular.copy(FastGetService.getSharePageNo());
            if ($scope.allsharelist[$scope.choosesort.sort].length == 10) {
              vm.hasNextPage = false;
            } else {
              vm.hasNextPage = FastGetService.getNextPage();
            }
          }
          vm.showloading = false;
        }, function () {
          UtilService.showMess("网络不给力，请稍后刷新");
          vm.showloading = false;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    vm.goCpcDetail = function (cpctask) {
      if (FastGetService.readedarr.indexOf(cpctask.id) < 0)
        FastGetService.readedarr.push(cpctask.id);
      if(cpctask.incometype==1){
        $scope.go('cpccoudetail',{'taskid': cpctask.id});
      }else {
        $scope.go("taskdetail", {'taskid': cpctask.id, 'sort': vm.sort});
      }
    };

    $scope.checkShare = function (id) {
      var list = FastGetService.sharetask;
      return list.indexOf(id) >= 0;
    };

    vm.checkReaded = function (id) {
      var list = FastGetService.readedarr;
      return list.indexOf(id) >= 0;
    }

  }

}());
