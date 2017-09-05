$(function () {
  'use strict';
  angular.module('xtui').controller("relatedNumberController5", relatedNumberController5);

  //依赖注入
  relatedNumberController5.$inject = ['$scope','UtilService','ConfigService','UserService','AccountService','$timeout','$stateParams','InfoService'];
  function relatedNumberController5($scope,UtilService,ConfigService,UserService,AccountService,$timeout,$stateParams,InfoService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user = {};
    //是否显示密码
    $scope.showPwdMask = false;
    //初始化商家邀请码
    $scope.user.code = "";
    var token = $stateParams.token;
    $scope.user.tel = $stateParams.tel;
    var loginnick = $stateParams.nick;
    var loginavate = $stateParams.avate;
    var loginflag = $stateParams.loginflag;
    var loginuserid = $stateParams.loginuserid;

    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };
    //删本地数据
    $scope.remove = function () {
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'loadpage');
    };

    $scope.registlogin = function () {
      if ($scope.user.pwd == "" || angular.isUndefined($scope.user.pwd)) {
        UtilService.showMess("密码不能为空！");
        return;
      }
      if (!UtilService.isPwd($scope.user.pwd)) {
        UtilService.showMess("请输入6-22位的数字或字母组合的密码!");
        return;
      }
      $scope.registFunctionlogin();
    };

    $scope.registFunctionlogin = function () {
      //注册
      var data = {};
      data.mod = 'nUser';
      data.func = 'register';
      data.token = token;
      data.data = {
        tel: $scope.user.tel,
        passwd: hex_md5($scope.user.pwd),
        type: "s",
        province: UserService.location.province,
        area: UserService.location.city,//地区
        no: device.uuid,
        from: ConfigService.from,
        invitecode: $scope.user.code
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.token;
        if (data.status == '000000') {
          UserService.user.id = $scope.user.userid = data.userid;
          UserService.user.tel = $scope.user.tel;
          UserService.user.pwd = hex_md5($scope.user.pwd);

          //获取第三方昵称，头像
          UserService.user.nick = $scope.user.nick = loginnick;
          UserService.user.avate = $scope.user.avate =loginavate;
          //更新表中用户昵称和头像
          InfoService.setSUserNickAndAvate("{nick:'" + loginnick + "',avger:'" +loginavate + "'}");
          var logindata=loginnick+","+ loginavate+","+UserService.user.id+","+UserService.user.tel+","+ UserService.user.pwd+","+loginuserid;

          //判断是QQ登录还是微博登录
          if(loginflag=="qq"){
            plugins.appPreferences.remove(function (resultData) {
            }, function (resultData) {
            }, 'qqlogin');
            plugins.appPreferences.remove(function (resultData) {
            }, function (resultData) {
            }, 'weibologin');
            $scope.putData('qqlogin', logindata);
          }else if(loginflag=="weibo"){
            plugins.appPreferences.remove(function (resultData) {
            }, function (resultData) {
            }, 'qqlogin');
            plugins.appPreferences.remove(function (resultData) {
            }, function (resultData) {
            }, 'weibologin');
            $scope.putData('weibologin', logindata);
          }
          $scope.putData('loginselfnick', "1");
          $scope.putData('loginselfavate', "1");

          //清空本地 自动登录数据
          $scope.remove();
          var savedata = UserService.user.id + "," + $scope.user.tel + "," +  UserService.user.pwd + "," + UserService.user.avate + "," + UserService.user.nick;
          //存储本地自动登录数据
          $scope.putData('loadpage', savedata);
          //存储logtoken
          $scope.putData('logtoken', data.data.logtoken);
          $timeout(function () {
            UtilService.getLogtoken();
          }, 200);

          if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
            if (device.platform == "Android") {
              GeTuiSdkPlugin.bindAlias(function () {
              }, UserService.user.id);
            } else {
              GeTuiSdk.bindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
            }
          }
          AccountService.reastBackupMoney();
          $scope.cleargo("tab.home", {'firstLogin': '1'});
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      });
    };


    //是否显示密码
    $scope.showpsw = function () {
      $scope.showpwdclear = false;
      $scope.showPwdMask = !$scope.showPwdMask;
    };
    //密码变化事件
    $scope.showpwdclear = false;
    $scope.pwdChange = function () {
      if ($scope.user.pwd != "" && angular.isDefined($scope.user.pwd) && $scope.user.pwd != null) {
        $scope.showpwdclear = true;
      } else {
        $scope.showpwdclear = false;
      }
    };
    //清除已输入的密码
    $scope.cleanpwd = function () {
      $scope.user.pwd = "";
      $scope.showpwdclear = false;
    };
    //失去焦点
    $scope.showpwdClear = function () {
      if ($scope.user.pwd != "" && angular.isDefined($scope.user.pwd)) {
        $scope.showpwdclear = true;
      } else {
        $scope.showpwdclear = false;
      }
    };
    $scope.hidepwdClear = function () {
      $scope.showpwdclear = false;
    };
    $scope.showcodeClear = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code)) {
        $scope.showinvateclear = true;
      } else {
        $scope.showinvateclear = false;
      }
    };
    $scope.hidecodeClear = function () {
      $scope.showinvateclear = false;
    };


  }
}());
