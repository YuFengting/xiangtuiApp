angular.module('xtui')
//扫一扫
  .controller("CantScanController",function($scope){
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
  });
