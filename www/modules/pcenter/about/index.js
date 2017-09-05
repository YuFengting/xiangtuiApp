angular.module('xtui')
  .controller("AboutController", function (ConfigService, $scope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.versionno = ConfigService.versionno;
  });
