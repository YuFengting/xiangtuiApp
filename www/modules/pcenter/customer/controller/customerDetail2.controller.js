//已提交（商家确认=>处理中）
angular.module('xtui')
.controller("customerDetail2Controller", function ( $timeout,$scope, $state, $stateParams, UtilService, ConfigService, CustomerService) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.leads = $stateParams.leads;
  $scope.haspic = $scope.leads.pics!=null&&$scope.leads.pics.length>0;
  $scope.leadsLogList = [];
  CustomerService.getLeadsLogList($scope.leads.leadsid).then(function (data) {
    $scope.leadsLogList = data.data;
  }, function (data) {

  }).finally(function () {
    $scope.$broadcast('scroll.refreshComplete');
  });
  $scope.showpic=false;
  $scope.picgetbig=function(pic,index){
    $scope.showpic=true;
    $scope.showimgIndex =index;
    $timeout(function(){
      var picNum = $('.picSlide').find('.big-pic');
      for (var i=0;i<picNum.length;i++) {
        var currnetImg = picNum.eq(i);
        var a = currnetImg.height() / currnetImg.width();
        var sh = 640 * window.screen.height / window.screen.width;
        if (a < window.screen.height / window.screen.width) {
          currnetImg.css('margin-top', sh / 2 - currnetImg.height() / 2 + 'px');
        } else {
          currnetImg.css('margin-left', 640 / 2 - currnetImg.width() / 2 + 'px')
        }
        currnetImg.css("opacity", "1");
        currnetImg.show();
      }
    },50)

  };

  $scope.shrinkPic=function(){
    $('.big-pic').hide();
    $scope.showpic=false;
  }
});
