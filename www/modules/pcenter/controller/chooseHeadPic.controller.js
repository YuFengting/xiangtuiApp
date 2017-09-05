/**
 * Created by Administrator on 2016/12/23.
 */
$(function () {
  'use strict';
  angular.module('xtui').controller("chooseHeadPicController", chooseHeadPicController);

  //依赖注入
  chooseHeadPicController.$inject = ['$scope', '$interval','$ionicActionSheet','$stateParams','$timeout','UserService','UtilService','ConfigService'];
  function chooseHeadPicController($scope, $interval,$ionicActionSheet,$stateParams,$timeout,UserService,UtilService,ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user={};
    $scope.user.avate = $stateParams.avate;
    //选择头像
    $scope.headShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '拍照'},
          {text: '从手机相册选择'},
        ],
        cancelText: '取消',
        buttonClicked: function (index) {
          $timeout(function(){
            getPicture(index)
          },400);
          return true;
        }
      });
    };

    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };


    //获取相机
    var getPicture = function (picType) {
      var cameraOptions = {
        quality: 100,//0-100
        destinationType: Camera.DestinationType.DATA_URL,//DATA_URL或FILE_URI
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,//PHOTOLIBRARY或CAMERA
        encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
        targetWidth: 360,//像素
        targetHeight: 360,//像素
        //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
        allowEdit: true,
        cropwindow:0  //0正方形 1长方形 2无限制
      };
      if (picType == 0) {
        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
      }
      navigator.camera.getPicture(function (imageData) {
        $scope.$apply(function () {
          $scope.picture = imageData;
          var avateData = {
            mod: 'nUser',
            func: 'setUserAvate',
            userid: UserService.user.id,
            data: {avate: $scope.picture}
          }
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(avateData)}).success(function (data) {
            if (data.status == '000000') {
              $scope.user.avate = UserService.user.avate = data.data.avate;
              $scope.putData('loginselfavate', "2");//第三方登录用的
            } else if (data.status != '500004') {
              $scope.showMess(data.msg);
            }
          })
        });
      }, function (message) {
      }, cameraOptions);
    };

  }
}());
