angular.module('xtui')
.controller("customerSubmitController", function ($scope, $state, $stateParams, UtilService, ConfigService, CustomerSubmitService) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.notask = false;
  $scope.addcustomer = function (task, merchantid) {
    $state.go('addcustomer', {"task": task, "merchantid": merchantid});
  };

  CustomerSubmitService.list().then(function () {
    $scope.mapdata = CustomerSubmitService.getList();
    if ($scope.mapdata.length == 0) {
      $scope.notask = true;
    }
  }, function () {
  });
});
