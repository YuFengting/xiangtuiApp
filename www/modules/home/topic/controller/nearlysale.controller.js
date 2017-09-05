$(function () {
  'use strict';
  angular.module('xtui').controller("NearlySaleController", NearlySaleController);

  NearlySaleController.$inject = ['$scope', 'UserService', 'UtilService', 'NearlySaleService', '$ionicScrollDelegate', '$ionicHistory', 'TopicTaskService', '$stateParams', 'BlackService'];
  function NearlySaleController($scope, UserService, UtilService, NearlySaleService, $ionicScrollDelegate, $ionicHistory, TopicTaskService, $stateParams, BlackService) {
    var vm = this;

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    vm.tasklist = [];
    vm.distancestr = [];
    vm.domore = false;
    vm.userid = UserService.user.id;
    vm.picserver = UtilService.picserver;
    vm.showloading = false;
    vm.hasNextPage = false;
    vm.refreshPage = refreshPage;
    vm.loadMore = loadMore;
    vm.goDetail = goDetail;
    vm.mygoback = mygoback;
    vm.locationdescribe = UserService.location.locationdescribe;

    function refreshPage() {
      TopicTaskService.getTopicById($stateParams.topicid).then(function (topic) {
        $scope.topicimg = topic.data.img;
      }, function () {
      });

      vm.tasklist = [];
      vm.distancestr = [];
      vm.showloading = true;
      vm.domore = true;
      NearlySaleService.getNearlySaleTask(vm.userid).then(function (data) {
       // vm.tasklist=data.data;
        vm.tasks = data.data;
        vm.showloading = false;
        vm.domore = false;
        $ionicScrollDelegate.$getByHandle('nearlysalecontent').scrollTop();
      }, function () {
        vm.domore = true;
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        vm.showloading = false;
      });
    }
    refreshPage();

    function loadMore() {
      vm.showloading = true;
      NearlySaleService.getMoreNearlySaleTask(vm.userid).then(function () {
        vm.tasks = NearlySaleService.getReturnTask();
        vm.domore = NearlySaleService.getHasMore();
        vm.showloading = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function () {
        vm.domore = true;
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        vm.showloading = false;
      });
    }

    vm.refreshLocation = function () {
      BlackService.baiduaddress().then(function (response) {
        vm.locationdescribe = response[4];
        vm.refreshPage();
      }, function () {
        UtilService.showMess("网络异常，请稍候重试");
      });
    };

    function goDetail(task, distance) {
      if(task.incometype==1){
        $scope.go('cpccoudetail',{'taskid': task.id});
      }else {
        $scope.go('taskdetail', {taskid: task.id, distance: distance, city: UserService.location.city});
      }
    }

    function mygoback() {
      $scope.goback();
    }
  }

}());
