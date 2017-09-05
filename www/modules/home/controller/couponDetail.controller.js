$(function () {
  'use strict';
  angular.module('xtui').controller("cpcCouponDetailController", cpcCouponDetailController);

  cpcCouponDetailController.$inject = ['$scope', '$stateParams', 'ExclusiveCouponService', 'UtilService', '$sce'];
  function cpcCouponDetailController($scope, $stateParams, ExclusiveCouponService, UtilService, $sce) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    var taskid = $stateParams.taskid;
    $scope.exclist = [];

    //获取cpc优惠券信息
    ExclusiveCouponService.getExclusiveCoupon(taskid).then(function (response) {
      $scope.exc_coupon = response.data;
      var coupon = {rule: "", num: "", content: "", color: ""};
      angular.forEach($scope.exc_coupon.coupon.levelrule, function (data, index) {
        coupon.rule = data;
        if($scope.exc_coupon.coupon.catagory!=2){
          coupon.num = $scope.exc_coupon.coupon.levelnum[index];
        }else {
          coupon.num = $scope.exc_coupon.coupon.levelcontent[index].replace("兑换券 ","");
        }
        coupon.content = $scope.exc_coupon.coupon.levelcontent[index];
        coupon.color = $scope.exc_coupon.colors[index];
        $scope.exclist.push(coupon);
        coupon = {rule: "", content: "", color: ""};
      });
      $scope.couponids = $sce.trustAsHtml($scope.exc_coupon.coupon.coupondis);
      $scope.merchantdis = $sce.trustAsHtml($scope.exc_coupon.coupon.merchantdis);
      UtilService.log($scope.exc_coupon);
    }, function () {
      UtilService.showMess("网络不给力，请稍后重试");
    });

    //跳转个人中心优惠券
    $scope.goMyCoupon = function () {
      if($scope.exc_coupon.isaccept==0){
        return;
      }
      $scope.go('salecoupon', {workid: $scope.exc_coupon.wcouponid});
    };

    //跳转任务详情页
    $scope.goTaskDetail = function () {
      $scope.go('taskdetail', {taskid: taskid})
    };

  }
}());
