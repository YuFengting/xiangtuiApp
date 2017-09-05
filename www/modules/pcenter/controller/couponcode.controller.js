$(function () {
  'use strict';
  angular.module('xtui').controller("couponcodeController", couponcodeController);

  //依赖注入
  couponcodeController.$inject = ['$scope', 'ConfigService', '$stateParams'];
  function couponcodeController($scope, ConfigService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.coupon = {
      title: $stateParams.title,
      logo: $stateParams.logo,
      companyalias: $stateParams.companyalias,
      code: $stateParams.code,
      tel:$stateParams.tel,
      address:$stateParams.address
    };

    $scope.code = $scope.coupon.code.slice(0, 4) + " " + $scope.coupon.code.slice(4, 8) + " " + $scope.coupon.code.slice(8, 12) + " " + $scope.coupon.code.slice(12, $scope.coupon.code.length);
    var content = '{text:"' + $scope.coupon.code + '",type:0}';
    $scope.qcodeurl = ConfigService.serverctx + "/ncomm/generateQCode?content=" + content;
    console.log(ConfigService);
  }
}());
