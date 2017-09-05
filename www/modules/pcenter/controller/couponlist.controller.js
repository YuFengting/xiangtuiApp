$(function () {
  'use strict';
  angular.module('xtui').controller("couponlistController", couponlistController);

  //依赖注入
  couponlistController.$inject = ['$scope', 'UtilService', '$ionicModal', 'MyCouponService', '$state', '$ionicScrollDelegate','$stateParams'];
  function couponlistController($scope, UtilService, $ionicModal, MyCouponService, $state, $ionicScrollDelegate,$stateParams) {
    $scope.$on("$ionicView.beforeEnter", function(){
      if ($stateParams.coupontype == 1) {
        $scope.changeCouponTab("1");
      }
    });

    $scope.couponTab = 0;
    $scope.changeCouponTab = function (index) {
      $scope.couponTab = index;
    };

    $ionicModal.fromTemplateUrl('coupon-code.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openCouponCode = function () {
      $scope.modal.show();
    };

    $scope.closeCouponCode = function () {
      $scope.modal.hide();
    };

//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓优惠券部分↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    var pagesize1 = 5;
    var pagenumber1;
    $scope.couponList1=[];
    $scope.init1 = function(){
    $ionicScrollDelegate.$getByHandle('cpccouponlistcontent').scrollTo(0, 0);
    $scope.hasNextPage1 = false;
      pagesize1 = 5;
      pagenumber1 = 1;
      MyCouponService.getMyWorkCouponList(pagenumber1, pagesize1).then(function (data) {
        if (data.status == "000000") {
          pagenumber1 = 2;
          $scope.couponList1 = data.data;
          UtilService.log($scope.couponList1);
          $scope.hasNextPage1 = data.data.length >= pagesize1;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      });
    };


    // 请求cpc优惠券列表的接口。暂无数据
    // MyCouponService.getMyWorkCouponList(1,5);

    $scope.doRefresh1 = function () {
      $scope.hasNextPage1 = false;
      pagenumber1 = 1;
      MyCouponService.getMyWorkCouponList(pagenumber1, pagesize1).then(function (data) {
        if (data.status == "000000") {
          pagenumber1 = 2;
          $scope.couponList1 = data.data;
          UtilService.log($scope.couponList1);
          $scope.hasNextPage1 = data.data.length >= pagesize1;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.loadmore1 = function () {
      MyCouponService.getMyWorkCouponList(pagenumber1, pagesize1).then(function (data) {
        if (data.status == "000000") {
          pagenumber1++;
          $scope.couponList1 = $scope.couponList1.concat(data.data);
          UtilService.log($scope.couponList1);
          $scope.hasNextPage1 = data.data.length >= pagesize1;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    // $scope.doRefresh1();
    //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑优惠券部分↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑


    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓限量券部分↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    var pagenumber2;
    var pagesize2 = 5;
    $scope.couponList2=[];
    $scope.init2 = function() {
      $ionicScrollDelegate.$getByHandle('cpvcouponlistcontent').scrollTo(0, 0);
      $scope.hasNextPage2 = false;
      pagenumber2 = 1;
      MyCouponService.getMyCpvCouponList(pagenumber2, pagesize2).then(function (data) {
        if (data.status == "000000") {
          pagenumber2 = 2;
          $scope.couponList2 = data.data;
          UtilService.log($scope.couponList2);
          $scope.hasNextPage2 = data.data.length >= pagesize2;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      });
    };

    $scope.doRefresh2 = function () {
      $scope.hasNextPage2 = false;
      pagenumber2 = 1;
      MyCouponService.getMyCpvCouponList(pagenumber2, pagesize2).then(function (data) {
        if (data.status == "000000") {
          pagenumber2 = 2;
          $scope.couponList2 = data.data;
          UtilService.log($scope.couponList2);
          $scope.hasNextPage2 = data.data.length >= pagesize2;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.loadmore2 = function () {
      MyCouponService.getMyCpvCouponList(pagenumber2, pagesize2).then(function (data) {
        if (data.status == "000000") {
          pagenumber2++;
          $scope.couponList2 = $scope.couponList2.concat(data.data);
          UtilService.log($scope.couponList2);
          $scope.hasNextPage2 = data.data.length >= pagesize2;
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍候刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };
    $scope.goCouponcode=function (coupon) {
      if(coupon.status==0&&coupon.expire==0){
        $scope.go('couponcode', {
          title: coupon.name,
          logo: coupon.buserinfo.logo,
          companyalias: coupon.buserinfo.bname,
          code: coupon.code,
          tel: coupon.buserinfo.tel,
          address: coupon.buserinfo.addr
        });
      }

    }


    //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑限量券部分↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      if (UtilService.goStatus[$state.current.name] != undefined) {
        $scope.init1();
        $scope.init2();
        delete UtilService.goStatus[$state.current.name];
      }
    });
  }
}());
