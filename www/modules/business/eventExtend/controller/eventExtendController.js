$(function () {
  'use strict';
  angular.module('xtui').controller('eventExtendController', eventExtendController);

  eventExtendController.$inject = ["$scope"];
  function eventExtendController($scope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

  }

}());
