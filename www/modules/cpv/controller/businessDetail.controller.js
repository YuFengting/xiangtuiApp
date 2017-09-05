$(function () {
  'use strict';
  angular.module('xtui').controller("businessDetailController", businessDetailController);

  businessDetailController.$inject = ['$scope', '$stateParams'];
  function businessDetailController($scope,  $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.companyalias = $stateParams.companyalias;
    if(angular.isUndefined($stateParams.introduction)||$stateParams.introduction==""||$stateParams.introduction==null){
      $scope.introduction = "该商家暂无介绍"
    }else {
      $scope.introduction = $stateParams.introduction;
    }
  }
}());
