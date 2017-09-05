angular.module('xtui')
  .controller('ReputationController', function ($scope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $(".removeItem").click(function () {
      $(this).parent().parent().remove();
    });
    $scope.businessBox = function () {
      $(".collTaskContent").hide();
      $(".mycollectionSub li").removeClass("active");
      $(".mycollectionSub li:first").addClass("active");
    };
    $scope.taskBox = function () {
      $(".collTaskContent").show();
      $(".mycollectionSub li").removeClass("active");
      $(".mycollectionSub li:last").addClass("active");
    }
  });
