angular.module('xtui')
/*我的身份*/
  .controller('MyIdentityController', function ($scope, $ionicScrollDelegate, UtilService, ConfigService, UserService,$ionicPopup,MsgService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();

      $scope.getSalerslist();
    });
    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.salerslist = [];
    $scope.noneidentity = true;

    /*xuit3.4.1 删除销售身份*/
    $scope.editText = "编辑";
    $scope.showedit = "none";//是否显示编辑按钮
    $scope.showDelete=false;
    $scope.dataShowDelete = function(){
      $scope.showDelete = !$scope.showDelete;
      if($scope.showDelete){
        $scope.editText = "完成";
      }else{
        $scope.editText = "编辑";
      }
    };

    var isshow = true;
    $scope.onItemDelete = function(item,index){
      //console.log(item);
      // 一个确认对话框
      if(isshow){
        isshow = false;
        var confirmPopup = $ionicPopup.confirm({
          title: '删除商家将解除您的云销售身份！',
          cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
          cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
          okText: '确认', // String (默认: 'OK')。OK按钮的文字。
          okType: 'button-default' // String (默认: 'button-positive')。OK按钮的类型。
        });
        confirmPopup.then(function(res) {
          if(res) {
            var params = {
              mod: "Bcircle",
              func: "quitBcircle",
              userid: UserService.user.id,
              data: {
                buserid: item.merchantid,
                suserid: UserService.user.id
              }
            };
            UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
              if(data.status == "000000") {
                MsgService.deleteChatfirst(data.data);
                $scope.salerslist.splice(index, 1);
                if ($scope.salerslist.length == 0) {
                  $scope.noneidentity = false;
                  $scope.showedit = "none";
                }
              } else {
                UtilService.showMess(data.msg);
              }
            }).error(function(){
              UtilService.showMess("网络不给力，请稍后刷新");
            });
          } else {
            return;
          }
        }).finally(function(){
          isshow = true;
        });
      }

    }

    $scope.getSalerslist = function () {
      var params = {
        mod: "nUser",
        func: "getSalerslist",
        userid: $scope.user.id,
        data: {}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.salerslist = data.data;
          if ($scope.salerslist.length == '0') {
            $scope.noneidentity = false;
            $scope.showedit = "none";
          } else {
            $scope.noneidentity = true;
            $scope.showedit = "block";
          }
        }
        $scope.$broadcast('scroll.refreshComplete');
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新");
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.goMerchantDeatil = function (saler) {
      if (saler.buserstatus == 4) {
        UtilService.showMess("该商家已下架");
        return;
      }
      $scope.go('business', {merchantid: saler.merchantid});
    };
    //$scope.goBusiness = function () {
    //  $scope.go('business',{'merchantid':merchantid});
    //}


    $scope.quitBusiness = function () {
      $(".quitBusinessMask").show();
    };
    $(".quitBusinessMask").click(function () {
      $(this).hide();
    });
    $(".quitpopInfor").click(function (e) {
      e.stopPropagation();
    });
    $(".quitSureCancel .cancelBtn").click(function () {
      $(".quitBusinessMask").hide();
    });
    $(".quitSureCancel .sureBtn").click(function () {
      $(".quitBusinessMask").hide();
    });
    // UtilService.customevent("myindentity","销售身份");
  });
