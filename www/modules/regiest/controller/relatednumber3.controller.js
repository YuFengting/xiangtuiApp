$(function () {
  'use strict';
  angular.module('xtui').controller("relatedNumberController3", relatedNumberController3);

  //依赖注入
  relatedNumberController3.$inject = ['$scope', '$interval','UtilService','ConfigService','$stateParams','$timeout','UserService','InfoService'];
  function relatedNumberController3($scope, $interval,UtilService,ConfigService,$stateParams,$timeout,UserService,InfoService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //用户信息
    $scope.user = {};
    $scope.user.tel = $stateParams.tel;
    var loginnick = $stateParams.nick;
    var loginavate = $stateParams.avate;
    var loginflag = $stateParams.loginflag;
    var loginuserid = $stateParams.loginuserid;
    $scope.showloading = false;
    var token="";

  //删本地数据
  $scope.remove = function () {
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'loadpage');
  };
  //存本地数据
  $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
  };



      //验证短信验证码-验证成功登陆
    var checkmesgflag = true;
    $scope.checkmesg = function () {
      if (!checkmesgflag) {
        UtilService.showMess("请不要重复点击！");
        return;
      }
      checkmesgflag = false;
      $timeout(function () {
        checkmesgflag = true;
      }, 2000);
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      if (!UtilService.isSmsCode($scope.user.code)) {
        UtilService.showMess("请输入正确的短信验证码！");
      } else {
          var Num = "";
          for (var i = 0; i < 6; i++) {
              Num += Math.floor(Math.random() * 10);
          }
          $scope.user.pwd = Num;
          //验证手机号、短信是否正确
          $scope.showloading = true;
          UtilService.checkCode($scope.user.tel, $scope.user.code).success(function (data) {
              token = data.token;
              if (data.status == '000000') {
                  var data = {};
                  data.mod = 'nUser';
                  data.func = 'getSUserbyTel';
                  data.data = {
                      tel: $scope.user.tel,
                      from: ConfigService.from,
                      province: UserService.location.province,
                      area: UserService.location.city,
                      appversion: ConfigService.versionno,
                      no: device.uuid,
                      x: UserService.location.x,
                      y: UserService.location.y
                  };
                  UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
                      token = data.token;
                      if (data.status == '000000') {
                          UserService.autologin = true;
                          UserService.user = data.data;
                          UserService.user.id = $scope.user.userid = data.data.userid;
                          UserService.user.nick = $scope.user.nick = data.data.nick;
                          UserService.user.avate = $scope.user.avate = data.data.avate;
                          UserService.user.tel = $scope.user.tel;
                          UserService.user.pwd = $scope.user.pwd=data.data.pwd;

                          var logindata="";
                          if(UserService.user.nick.lastIndexOf("****")!=-1){
                              UserService.user.nick = $scope.user.nick = loginnick;
                              //更新表中用户昵称
                              InfoService.setSUserNickAndAvate("{nick:'" + UserService.user.nick + "'}");
                              logindata=loginnick;
                              $scope.putData('loginselfnick', "1");
                          }else{
                              plugins.appPreferences.fetch(function (loginselfdata) {
                                  var selfdata = loginselfdata;
                                  if (selfdata == null || selfdata == "" || selfdata == undefined ||selfdata=="2") {
                                      logindata=UserService.user.nick;
                                  } else {
                                      if(selfdata=="1"){
                                          UserService.user.nick = $scope.user.nick = loginnick;
                                          //更新表中用户昵称
                                          InfoService.setSUserNickAndAvate("{nick:'" + UserService.user.nick + "'}");
                                          logindata=loginnick;
                                      }
                                  }
                              }, function () {
                                  logindata=UserService.user.nick;
                              }, "loginselfnick");
                          }

                          if(UserService.user.avate==null||UserService.user.avate ==""||UserService.user.avate ==undefined||UserService.user.avate=="/static/default-avatar-red.png"){
                              UserService.user.avate = $scope.user.avate  = loginavate;
                              //更新表中用户头像
                              InfoService.setSUserNickAndAvate("{avger:'" + UserService.user.avate + "'}");
                              logindata=logindata+","+loginavate+","+UserService.user.id+","+UserService.user.tel+","+ UserService.user.pwd+","+loginuserid;
                              $scope.putData('loginselfavate', "1");
                              $scope.putlogindata(logindata);
                          }else{
                              plugins.appPreferences.fetch(function (loginselfdata) {
                                  var selfdata = loginselfdata;
                                  if (selfdata == null || selfdata == "" || selfdata == undefined || selfdata=="2") {
                                      logindata= logindata+","+UserService.user.avate+","+UserService.user.id+","+UserService.user.tel+","+ UserService.user.pwd+","+loginuserid;
                                      $scope.putlogindata(logindata);
                                  } else {
                                      if(selfdata=="1"){
                                          UserService.user.avate = $scope.user.avate  = loginavate;
                                          //更新表中用户头像
                                          InfoService.setSUserNickAndAvate("{avger:'" + UserService.user.avate + "'}");
                                          logindata=logindata+","+loginavate+","+UserService.user.id+","+UserService.user.tel+","+ UserService.user.pwd+","+loginuserid;
                                          $scope.putlogindata(logindata);
                                      }
                                  }
                              }, function () {
                                  logindata= logindata+","+UserService.user.avate+","+UserService.user.id+","+UserService.user.tel+","+ UserService.user.pwd+","+loginuserid;
                                  $scope.putlogindata(logindata);
                              }, "loginselfavate");
                          }

                          $scope.putData('logtoken', data.data.logtoken);
                          UtilService.getLogtoken();
                          //清空本地 自动登录数据
                          $scope.remove();
                          var savedata = UserService.user.id + "," + $scope.user.tel + "," + UserService.user.pwd + "," + UserService.user.avate + "," + UserService.user.nick;
                          //存储本地自动登录数据
                          $scope.putData('loadpage', savedata);

                          if ("undefined" != UserService.user.id && UserService.user.id != "" && UserService.user.id != null) {
                              if (device.platform == "Android") {
                                  GeTuiSdkPlugin.bindAlias(function () {
                                  }, UserService.user.id);
                              } else {
                                  GeTuiSdk.bindAlias(UserService.user.id, UserService.user.id + new Date().getTime());
                              }
                          }
                          $scope.showloading=false;
                          if (data.data.needJump) {
                              $scope.cleargo("tab.home", {needJump: data.data.needJump, firstLogin: data.data.firstLogin})
                          } else {
                              $scope.cleargo("tab.home", {firstLogin: data.data.firstLogin});
                          }
                      } else {
                          $scope.showloading = false;
                          UtilService.showMess(data.msg);
                      }
                  })
              }else {
                  UtilService.showMess(data.msg);
              }
          });
      }
    }

      $scope.putlogindata = function (logindata) {
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
      }


    $scope.sendcode2 = function (isuser, mtype) {
      $scope.checkway = mtype;
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      $scope.showloading = true;
      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 102).then(function (data) {
        if (data.status == "000000") {
          $scope.showloading = false;
          if (mtype == "sms") {
            $scope.timeInterval();
          }
          //发送短信验证码
          if (mtype != "sms") {
            UtilService.showMess("验证码已发送，请注意接听来电！");
          } else {
            UtilService.showMess("短信验证码已发送，请注意查收！");
          }
        } else if (data.status == "100101") {
          $scope.showloading = false;
          $scope.showBut1 = true;
          UtilService.showMess("请60s之后再试！");
        } else {
          $scope.showloading = false;
          // UtilService.showMess("请不要重复验证！");
          UtilService.showMess(data.msg);
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };


    //手机号变化事件
    $scope.telChange = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel)) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };


    //失去焦点
    $scope.showtelClear = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel)) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };
    $scope.hidetelClear = function () {
      $scope.showtelclear = false;
    };
    //清除手机号
    $scope.cleantel = function () {
      $scope.user.tel = "";
      $scope.showtelclear = false;
    };

    //验证码变化事件
    $scope.showcodeclear = false;
    $scope.codeChange = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code) && $scope.user.code != null) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    //清除验证码
    $scope.cleancode = function () {
      $scope.user.code = "";
      $scope.showcodeclear = false;
    };
    //失去焦点
    $scope.showcodeClear = function () {
      if ($scope.user.code != "" && $scope.user.code != null && angular.isDefined($scope.user.code)) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    $scope.hidecodeClear = function () {
      $scope.showcodeclear = false;
    };

    $scope.showBut = true;
    $scope.showBut1 = false;
    $scope.timetxt = "获取验证码";
    //发送验证码按钮60秒倒计时
    var ttime;
    $scope.timeInterval = function () {
      $scope.showBut = false;
      $scope.showBut1 = false;
      var ot = 60;
      $interval.cancel(ttime);
      $scope.timetxt = "60秒后重新获取";
      ttime = $interval(function () {
        ot--;
        $scope.timetxt = ot + "秒后重新获取";
        if (ot <= 0) {
          $interval.cancel(ttime);
          $scope.showBut = true;
          $scope.showBut1 = true;
          $scope.timetxt = "重新获取验证码";
        }
      }, 1000);
    };

  }
}());
