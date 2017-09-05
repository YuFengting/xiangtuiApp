angular.module('xtui')
.controller("addcustomerController", function ($scope, $state, $stateParams, UtilService, ConfigService, UserService,CustomerSubmitService, $timeout,$ionicHistory,$ionicModal,$cordovaImagePicker,$ionicActionSheet ) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.user = UserService.user;

  //假数据
  $scope.addpiclist=[];

  var itempic = 3;
  $scope.maxpic = true;
  $scope.deletepic=function(info){
    var index = $scope.addpiclist.indexOf(info);
    $scope.addpiclist.splice(index,1);
    $scope.picsChange();
    $scope.maxpic=$scope.addpiclist.length<itempic;
  };

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
          var maxCount =  itempic - $scope.addpiclist.length;
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
    $scope.addpiclist =$scope.addpiclist.concat(newUrls);
    $scope.picsChange();
    $scope.maxpic=($scope.addpiclist.length != itempic);
  }, function(){
    $scope.showloading = false;
    UtilService.showMess("上传图片失败");
  });

};

  //表单变化时，更新表单缓存
  $scope.formChange = function(){
    $scope.formdata.fieldvalue = $scope.getFields();
    CustomerSubmitService.setAddCustomerFormData($scope.task.id,$scope.formdata);
  };
  //图片变化时，更新表单缓存
  $scope.picsChange = function(){
    $scope.formdata.fieldvalue = $scope.getFields();
    $scope.formdata.picpaths = $scope.addpiclist.join(",");
    CustomerSubmitService.setAddCustomerFormData($scope.task.id,$scope.formdata);
  };

  $scope.getFields = function(){
    var value = [];
    $(".field").each(function () {
      value.push($.trim($(this).val()));
    });
    return value.join("|");
  };

  $scope.setFields = function(fieldvalue){
    if(fieldvalue){
      var field = fieldvalue.split("|");
      var i =0;
      if(field.length>0){
        $(".field").each(function ( ) {
          $(this).val(field[i]);
          i++;
        });
      }
    }
  };

  $scope.task = $stateParams.task;
  $scope.formdata = {};
  $scope.formdata.tel = "";
  $scope.iosfont = false;
  //加载js缓存数据
  $timeout(function(){
    $scope.formdata = CustomerSubmitService.getAddCustomerFormData($scope.task.id);
    if($scope.formdata.tel){
      $scope.formdata.tel=parseInt($scope.formdata.tel);
    }
    if( $scope.formdata.picpaths){
      $scope.addpiclist = $scope.formdata.picpaths.split(",");
    }
    $scope.setFields($scope.formdata.fieldvalue);
  },100);
  var token = "";
  if (device.platform != "Android") {
    $scope.iosfont = true;
  }
  //生成页面的token
  var params = {
    mod: "NComm",
    func: "makeToken",
    userid: UserService.user.id,
    page: {"pageNumber": 1, "pageSize": 10},
    data: {}
  };
  UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (res) {
    token = res.token;
  });
  /**
   * 提交客户
   */
  $ionicModal.fromTemplateUrl('addCutomerSuccess.html', {
    scope: $scope,
    animation: 'fade-in'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    $ionicHistory.goBack();
  };

  $scope.showloading = false;
  $scope.subcustomer = function () {
    if (token == "") {
      return;
    }
    $scope.formdata.fieldvalue = $scope.getFields();
    $scope.formdata.taskid = $scope.task.id;
    $scope.formdata.merchantid = $stateParams.merchantid;
    $scope.formdata.tel = $.trim($scope.formdata.tel);
    if (CustomerSubmitService.check($scope.formdata, $scope.task.field)) {
      $scope.showloading = true;
      CustomerSubmitService.add($scope.formdata, token).then(function (res) {
        if (res.status == "000000") {
          CustomerSubmitService.sendMsgWhileAddingCustomer(res.data.leadidapp, $scope.formdata.merchantid, $stateParams.task.name);
          CustomerSubmitService.rmAddCustomerFormData($scope.task.id);
          var bv = $ionicHistory.backView().stateName;
          if(bv=="helpselldetail"){
            $scope.openModal();
            $timeout(function(){
              $scope.closeModal();
            },3000);
          }else{
            $state.go("customer");
          }
        } else if (res.status == "120001") {
          UtilService.showMess("该手机号已经被提交");
        } else if (res.status == "500004") {
          UtilService.showMess("请不要重复点击提交按钮");
        } else if (res.status == "130006") {
          UtilService.showMess("您与商家的雇佣关系已经解除");
        } else if (res.status == "103003") {
          UtilService.showMess("任务已经暂停");
        } else if (res.status == "103001") {
          UtilService.showMess("任务已经结束");
        } else if (res.status == "130106") {
          UtilService.showMess("该客户信息已被大量提交，稍后再试");
        }
        $scope.showloading = false;
        token = res.token;
      }, function () {
        $scope.showloading = false;
      });
    }
  };
  $scope.resetInp = function (e) {
    var inp = $(e.target).siblings().eq(0);
    inp.val("");
    setTimeout(function () {
      inp.focus();
    }, 1);
  };
  $scope.myfocus = function (e) {
    $(e.target).siblings().eq(0).show();
  };
  $scope.myblur = function (e) {
    $(e.target).siblings().eq(0).hide();
  }
});
