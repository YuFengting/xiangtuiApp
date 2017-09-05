//已结算
angular.module('xtui')
.controller("ComplaintController", function ($scope, $timeout, $ionicActionSheet,$ionicPopup,$state,UtilService, ConfigService, UserService, $stateParams,$cordovaImagePicker) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.user = UserService.user;
  $scope.picserver = ConfigService.picserver;
  var leadsid = $stateParams.leads.leadsid;
  $scope.comment = {};
  $scope.piclist = [];

  //申诉
  var compflg = 0;
  $scope.complaint = function () {
    if (compflg != 0) {
      return;
    }
    compflg = 1;
    if (angular.isUndefined($scope.comment.detail) || $scope.comment.detail == null || $scope.comment.detail == "") {
      UtilService.showMess("请输入申述内容!");
      compflg = 0;
      return;
    }
    var dd = $scope.comment.detail.trim();
    if (dd.length > 200) {
      UtilService.showMess("申述内容不能超过200个字符!");
      compflg = 0;
      return;
    }

    var avateData = {
      mod: 'NStask',
      func: 'leadsExplain',
      userid: $scope.user.id,
      data: {
        leadsid: leadsid,
        pics: $scope.piclist,
        detail: $scope.comment.detail
      }
    };
    UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(avateData)}).success(function (data) {
      if (data.status == '000000') {
        $('.hit-message').show();
        $timeout(function () {
          $('.hit-message').hide();
          $scope.go("customerdetail4", {"leads": $stateParams.leads});
        }, 3500)
      } else if (data.status == '130101') {
        UtilService.showMess("当前信息已申诉！");
      }
      compflg = 0;
    }).error(function () {
      compflg = 0;
    })
  };

  var itempic = 3;
  //删除上传的图片
  $scope.deletepic = function (pic) {
    for (var i = 0; i < $scope.piclist.length; i++) {
      if ($scope.piclist[i] == pic) {
        $scope.piclist.splice(i, 1);
      }
    }
    if ($scope.piclist.length < 3) {
      $('#picadd').show();
    }
  };

  $scope.goadduserinfo = function () {
    $('.popup-mask').hide();
    $('.shensupopup').hide();
    $scope.go("customerdetail4", {"leads": $stateParams.leads});
  };


  /*$scope.showPopup = function () {
    $('.popup-mask').show();
    $('.shensupopup').show();
  };
  $scope.closePopup = function () {
    $('.popup-mask').hide();
    $('.shensupopup').hide();
  };*/

  $scope.showPopup = function(){
    var popup = $ionicPopup.confirm({
      title: "申诉尚未完成，您确定离开？",
      cancelText: "取消",
      cancelType: "button-cancel",
      okText: "继续",
      okType: 'button-go'
    });
    popup.then(function (res) {
      if (res) {
        $scope.goback();
      }else{

      }
    });
  }


  $scope.addpicfun= function() {
    $ionicActionSheet.show({
      buttons: [
        {text: '拍照'},
        {text: '从手机相册选择'}
      ],
      cancelText: '取消',
      buttonClicked: function (index) {
        if (index == 0) {
          var cameraOptions = {
            quality: 90,//0-100
            destinationType: Camera.DestinationType.FILE_URI,//DATA_URL或FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,//PHOTOLIBRARY或CAMERA
            encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
            targetWidth: 800,//像素
            //targetHeight: 120,//像素
            //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
            allowEdit: true,
            cropwindow:0  //0正方形 1长方形 2无限制
          };
          navigator.camera.getPicture(function (imageData) {
            $scope.uploadPicture([imageData]);
          }, function (message) {
            //     $scope.closeHeadMask();
          }, cameraOptions);
        } else {
          var maxCount =  itempic - $scope.piclist.length;
          if(maxCount>0){
            var options = {
              maximumImagesCount: maxCount, //需要显示的图片的数量
              width: 800,
              //height: 300,
              quality: 90
            };
            $cordovaImagePicker.getPictures(options)
              .then(function (results) {
                $scope.uploadPicture(results);
              }, function (error) {
                // error getting photos
              });
          }
        }
        return true;
      }
    });
  };

  $scope.uploadPicture= function (pictures) {
    UtilService.uploadPictures(pictures).then(function(newUrls){
      $scope.piclist =$scope.piclist.concat(newUrls);
      if ($scope.piclist.length == 3) {
        $('#picadd').hide();
      }
    }, function(){
      $scope.showloading = false;
      UtilService.showMess("上传图片失败");
    });

  }
});
