//未提交（提交=>已提交）
angular.module('xtui')
.controller("customerDetailController", function ($scope, $state, $stateParams, UtilService, UserService,ConfigService, CustomerSubmitService,$ionicHistory, $timeout,$cordovaImagePicker,$ionicActionSheet) {
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
    if($scope.addpiclist.length<itempic){
      $scope.maxpic=true;
    }
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

  var token = "";
  $scope.leads = $stateParams.leads;
  $scope.formdata = {};

//加载js缓存数据
  $timeout(function(){
    var tempdata  = CustomerSubmitService.getCustomerDetailFormData($scope.leads.leadsid);
    if($.isEmptyObject(tempdata)){
      $scope.formdata.name = $scope.leads.name;
      $scope.formdata.tel = parseInt($scope.leads.tel);
      $scope.formdata.memo = $scope.leads.memo;
      var vals = [];
      for(var i=0;i< $scope.leads.fieldmap.length;i++){
        vals.push($scope.leads.fieldmap[i].value);
      }
      $scope.formdata.fieldvalue = vals.join("|");
      $scope.setFields($scope.formdata.fieldvalue);
      CustomerSubmitService.setCustomerDetailFormData($scope.leads.leadsid,$scope.formdata);
    }else{
      $scope.formdata = tempdata;
      if($scope.formdata.tel){
        $scope.formdata.tel=parseInt($scope.formdata.tel);
      }
      if( $scope.formdata.picpaths){
        $scope.addpiclist = $scope.formdata.picpaths.split(",");
      }
      $scope.setFields($scope.formdata.fieldvalue);
    }

  },100);

  //表单变化时，更新表单缓存
  $scope.formChange = function(){
    $scope.formdata.fieldvalue = $scope.getFields();
    CustomerSubmitService.setCustomerDetailFormData($scope.leads.leadsid,$scope.formdata);
  };
  //图片变化时，更新表单缓存
  $scope.picsChange = function(){
    $scope.formdata.fieldvalue = $scope.getFields();
    $scope.formdata.picpaths = $scope.addpiclist.join(",");
    CustomerSubmitService.setCustomerDetailFormData($scope.leads.leadsid,$scope.formdata);
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
  $scope.iosfont = false;
  if (device.platform != "Android") {
    $scope.iosfont = true;
  }

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
  };


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
  $scope.showloading = false;
  $scope.subcustomer = function () {
    if (token == "") return;
    $scope.formdata.fieldvalue = $scope.getFields();
    $scope.formdata.taskid = $scope.leads.taskid;
    $scope.formdata.merchantid = $scope.leads.merchantid;
    $scope.formdata.leadsid = $scope.leads.leadsid;
    $scope.formdata.tel = $.trim($scope.formdata.tel);
    $scope.formdata.origintel = $scope.leads.tel;//是未提交状态提交过来的
    if (CustomerSubmitService.check($scope.formdata, $scope.leads.fieldmap)) {
      $scope.showloading = true;
      CustomerSubmitService.add($scope.formdata, token).then(function (res) {
        if (res.status == "000000") {
          CustomerSubmitService.sendMsgWhileAddingCustomer($scope.formdata.leadsid, $scope.formdata.merchantid, $scope.leads.taskname);
          $ionicHistory.clearHistory();
          CustomerSubmitService.rmCustomerDetailFormData($scope.leads.leadsid);
          $scope.go("customer");
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
  }
});
