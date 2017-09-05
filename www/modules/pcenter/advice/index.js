angular.module('xtui')
  .controller("AdviceController", function ($scope, UserService, ConfigService, UtilService, $window, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.sug = {sugval: ""};
    var flag = 0;
    $scope.subsuggest = function () {
      if (flag == 0) {
        flag = 1;
        $timeout(function () {
          flag = 0;
        }, 2000);
      } else {
        UtilService.showMess("请不要重复点击！");
        return;
      }
      var dd = $scope.sug.sugval.trim();
      if (dd.length < 200 && dd.length > 0) {
        var params = {
          mod: 'nUser',
          func: 'addSuggest',
          userid: UserService.user.id,
          data: {desc: $scope.sug.sugval, version: ConfigService.versionno}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            //IM提交建议与反馈通知
            var newDate = new Date();
            var FomatorString = "YYYY-MM-DD HH:MI:SS";
            var params = {
              mod: "IM",
              func: "insertIMMessage",
              data: {
                type: 5,
                content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "提交的建议与反馈我们已经收到并处理，感谢您对我们工作的长期支持!",
                receiverid: $scope.user.id
              }
            };
            UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});
            UtilService.showMess("提交成功，我们将会尽快处理，通过系统消息给你反馈。");
            $timeout(function () {
              $scope.goback();
            }, 1000);

            $scope.sug.sugval = "";
          } else if (data.status != '500004') {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络不给力，请稍后刷新！");
        });
      } else {
        UtilService.showMess("请输入1-200字符以内的内容!");
      }
    }

    $scope.isTelShow = true;
    /*$('.advice_textarea textarea').focus(function(){
      cordova.plugins.Keyboard.disableScroll(true)
      $scope.isTelShow = false;
    })
    $('.advice_textarea textarea').blur(function(){
      $scope.isTelShow = true;
    })*/

    window.addEventListener('native.keyboardhide', telShow);
    function telShow(){
      $scope.isTelShow = true;
    }
    window.addEventListener('native.keyboardshow', telHide);
    function telHide(){
      $scope.isTelShow = false;
    }

  });
