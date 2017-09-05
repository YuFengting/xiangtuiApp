angular.module('xtui')
//登录
  .controller("LoginController", function ($interval, $timeout, $scope, UtilService, ConfigService, UserService, $ionicPopup, $ionicDeploy, $rootScope, OutLoginService,AccountService) {
    $timeout(function () {
      navigator.splashscreen.hide();
    }, 2000);
    $scope.$on("$ionicView.beforeEnter", function () {
      OutLoginService.run();
      $scope.startfun();
      if (device.platform == "Android") {
        $scope.devicetype = "0";
      } else {
        $scope.devicetype = "1";
      }
      var getWinH = 640 / window.screen.width*window.screen.height - 320;
      $scope.selectLoginSty = {
        'top': getWinH+'px'
      }
    });

    /*验证码登陆提示弹窗*/
    $scope.noRegistPop = function() {
      var noRegistPopup = $ionicPopup.confirm({
        title: '该手机号未注册，请先注册', // String. 弹窗标题。
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '手机注册', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      noRegistPopup.then(function(res) {
        if(res) {
        /*点击手机注册方法*/

        }
      });
    };


    /*页面离开之前触发*/
    $scope.$on("$ionicView.beforeLeave", function () {
      $(".chose-user").hide();
      $(".selectIcon").removeClass("icon-xt-up").addClass("icon-xt2-down");
    });
    $scope.selectPhoneNum = function () {
      var findI = $(".selectIcon");
      if (findI.hasClass("icon-xt2-down")) {
        findI.removeClass("icon-xt2-down").addClass("icon-xt-up");
        $(".chose-user").show();
      } else {
        findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
        $(".chose-user").hide();
      }
    };
    $(".loginInput").focus(function () {
      $(".chose-user").hide();
    });

    $scope.openWeixin = function(){
      var popup = $ionicPopup.confirm({
        title:'“享推”想要打开“微信”',
        cancelText: "取消",
        cancelType: "button-cancel",
        okText: "打开",
        okType: 'button-go'
      });
      popup.then(function (res) {
        if (res) {
          return;
        }
      });
    }

      //公用方法
      $scope.qqweibologin =function(userid){
        var params = {
          mod: 'nUser',
          func: 'getSUserInfo',
          userid:userid
        }
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if (data.status == '000000') {
            $scope.user = data.data;
            UserService.user.nick =$scope.user.nick;
            UserService.user.avate = $scope.user.avate;
            UserService.user.id =  $scope.user.id;
            UserService.user.tel = $scope.user.tel;
            UserService.user.pwd =  $scope.user.pwd;
            //清空本地 自动登录数据
            $scope.remove();
            var savedata = $scope.user.id + "," +  $scope.user.tel + "," + $scope.user.pwd + "," + $scope.user.avate  + "," + $scope.user.nick;
            //存储本地自动登录数据
            $scope.putData('loadpage', savedata);
            $scope.go("tab.home");
          } else if (data.status != '500004') {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络不给力，请稍后刷新");
        })
      }

     //QQ登录
    $scope.qqlogin = function(){
      //QQ登出
      YCQQ.logout(function(args){},function(failReason){});
      $scope.showloading = true;
      plugins.appPreferences.fetch(function (resultData) {
        $timeout(function () {
          $scope.showloading = false;
        }, 4000);
        //ios
        if (device.platform != "Android") {
          var checkClientIsInstalled = 0;//default is 0,only for iOS
          YCQQ.ssoLogin(function(args){
            var autodata = resultData;
            if (autodata == null || autodata == "" || autodata == undefined) {
              var nick=args.nickname;
              var avate=args.qqimage;
              $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":args.u_id});
            } else {
              var us = autodata.split(",");
              if(us[5]==args.u_id){
                $scope.qqweibologin(us[2]);
              }else{
                var nick=args.nickname;
                var avate=args.qqimage;
                $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":args.u_id});
              }
            }
          },function(){
          },checkClientIsInstalled);
        }else{
          //android
          var checkClientIsInstalled = 1;//default is 0,only for iOS
          YCQQ.ssoLogin(function(args){
            YCQQ.getqqinfo(function(argsinfo){
              var autodata = resultData;
              if (autodata == null || autodata == "" || autodata == undefined) {
                var nick=argsinfo.nickname;
                var avate=argsinfo.figureurl_qq_2;
                $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":args.userid});
              } else {
                var us = autodata.split(",");
                if(us[5]==args.userid){
                  $scope.qqweibologin(us[2]);
                }else{
                  var nick=argsinfo.nickname;
                  var avate=argsinfo.figureurl_qq_2;
                  $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":args.userid});
                }
              }
            },function(failReason){
            });
          },function(failReason){
          },checkClientIsInstalled);
        }
      }, function () {
        $scope.go('login');
    }, "qqlogin");
    }

      //微博登录
      $scope.weibologin = function(){
        $scope.showloading = true;
        plugins.appPreferences.fetch(function (resultData) {
          $timeout(function () {
            $scope.showloading = false;
          }, 4000);
          //ios
          if (device.platform != "Android") {
            //微博登出
            YCWeibo.logout(function (res) {},function(failreason){});
            YCWeibo.ssoLogin(function(args){
              var autodata = resultData;
              if (autodata == null || autodata == "" || autodata == undefined) {
                var nick=args.nick_name;
                var avate=args.sina_image;
                $scope.go("relatednumber",{"loginflag": "weibo", "nick":nick,"avate":avate,"loginuserid":args.u_id});
              } else {
                var us = autodata.split(",");
                if(us[5]==args.u_id){
                  $scope.qqweibologin(us[2]);
                }else{
                  var nick=args.nick_name;
                  var avate=args.sina_image;
                  $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":args.u_id});
                }
              }
            },function(){
              UtilService.showMess1('网络异常，请稍后重试');
            });
          }else{
            //android
            //微博登出
            window.weibo.logout(function (res) {},function(failreason){});
            window.weibo.init("1556155109", "http://www.91weiku.com", function(){
              window.weibo.login(function (res) {
                var autodata = resultData;
                if (autodata == null || autodata == "" || autodata == undefined) {
                  var nick=res.nickname;
                  var avate=res.usericon;
                  $scope.go("relatednumber",{"loginflag": "weibo", "nick":nick,"avate":avate,"loginuserid":res.uid});
                } else {
                  var us = autodata.split(",");
                  if(us[5]==res.uid){
                    $scope.qqweibologin(us[2]);
                  }else{
                    var nick=res.nickname;
                    var avate=res.usericon;
                    $scope.go("relatednumber",{"loginflag": "qq", "nick":nick,"avate":avate,"loginuserid":res.uid});
                  }
                }
              });
            }, function(){
              UtilService.showMess1('网络异常，请稍后重试');
            });
          }
        }, function () {
          $scope.go('login');
        }, "weibologin");
      }

    //用户信息
    $scope.user = {};
    //历史用户信息
    $scope.hisusers = [];
    //是否显示密码标志
    $scope.showPwdMask = false;
    //清除手机号按钮
    $scope.showtelclear = false;
    //清除密码按钮
    $scope.showpwdclear = false;
    //历史用户信息是否显示标志
    $scope.showHisMask = false;
    //loading加载样式
    $scope.showloading = false;
    //1:图片验证码方式,0:滑块验证码
    $scope.checkFlag = 1;
    $scope.isTellogin=false;

    //获取历史用户信息
    var getHisUserData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var users = resultData;
          if (users == null || users == "" || users == undefined) {
            $scope.hisusers = [];
          } else {
            $scope.hisusers = users;
            $scope.showHistory = users.length >= 2;
          }
        }, function () {
          $scope.hisusers = [];
        }, "hisusers");
      }
      catch (e) {
        $scope.hisusers = [];
      }
    };
    getHisUserData();
    //选择历史用户
    $scope.selectPhoneNum = function () {
      if ($scope.hisusers.length == 0 || $scope.hisusers.length == 1) {
        $scope.showHisMask = false;
      } else {
        $scope.showHisMask = !$scope.showHisMask;
      }
    };
    //手机号变化事件
    $scope.telChange = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel) && $scope.user.tel != null) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };
    //密码变化事件
    $scope.pswChange = function () {
      if ($scope.user.pwd != "" && angular.isDefined($scope.user.pwd) && $scope.user.pwd != null) {
        $scope.showpwdclear = true;
      } else {
        $scope.showpwdclear = false;
      }
    };
    //是否显示密码
    $scope.showpsw = function () {
      $scope.showPwdMask = !$scope.showPwdMask;
    };
    //清除已输入的用户名
    $scope.clearUser = function () {
      $scope.user.tel = "";
      $scope.showtelclear = false;
    };
    //清除已输入的密码
    $scope.clearPas = function () {
      $scope.user.pwd = "";
      $scope.showpwdclear = false;
    };
    //填充历史手机号、密码
    $scope.setTel = function (olduser) {
      $scope.user.tel = parseInt(olduser.tel);
      $scope.user.pwd = olduser.pwd;
      $scope.showHisMask = false;
    };
    //删除历史手机号、密码
    $scope.deleteTel = function (olduser) {
      $scope.hisusers.forEach(function (tuser, key) {
        if (tuser.tel == olduser.tel) {
          $scope.hisusers.splice(key, 1);
          if ($scope.hisusers.length < 2) {
            $scope.showHistory = false;
            $scope.showHisMask = false;
          }
        }
      });
      $scope.putData('hisusers', $scope.hisusers);
    };
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
    //失去焦点
    $scope.showtelClear = function () {
      var findI = $(".selectIcon");
      findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
      $(".chose-user").hide();
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel) && $scope.user.tel != null) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };
    $scope.hidetelClear = function () {
      $scope.showtelclear = false;
    };
    $scope.showpswClear = function () {
      if ($scope.user.pwd != "" && angular.isDefined($scope.user.pwd) && $scope.user.pwd != null) {
        $scope.showpwdclear = true;
      } else {
        $scope.showpwdclear = false;
      }
    };
    $scope.hidepswClear = function () {
      $scope.showpwdclear = false;
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

    $scope.changelog1 = function () {
      $scope.isTellogin = false;
      var findI = $(".selectIcon");
      findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
      $(".chose-user").hide();
      $scope.user.code = "";
      $scope.user.tel = "";
      $scope.user.pwd = "";
      $scope.showtelclear = false;
      $scope.showpwdclear = false;
      $scope.showcodeclear = false;
      cordova.plugins.Keyboard.close();
      $scope.loginIconContentSty = {'height': 'auto'};
      UtilService.tongji('logintype', {'type': 0});
    };
    $scope.changelog2 = function () {
      $scope.isTellogin = true;
      var findI = $(".selectIcon");
      findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
      $(".chose-user").hide();
      $scope.user.code = "";
      $scope.user.tel = "";
      $scope.user.pwd = "";
      $scope.showtelclear = false;
      $scope.showpwdclear = false;
      $scope.showcodeclear = false;
      cordova.plugins.Keyboard.close();
      $scope.loginIconContentSty = {'height': 'auto'};
      UtilService.tongji('logintype', {'type': 1});
    };
    //ios白色闪现问题
    if (device.platform != "Android") {
      //键盘监听事件
      var kbOpen = false;

      function onKbClose() {
        kbOpen = false;
        $scope.loginIconContentSty = {'height': 'auto', 'font-size': '10px'};
      }

      $scope.$on('$ionicView.unloaded', function () {
        window.removeEventListener('native.keyboardhide', onKbClose);
      });
      window.addEventListener('native.keyboardhide', onKbClose);
    }
    var checkApkUpdate = function (userid) {
      var query = {
        mod: "nComm",
        func: "checkApkUpdate",
        userid: userid,
        data: {
          no: ConfigService.versionno,
          apptype: "s",
          type: $scope.devicetype
        }
      };
      UtilService.post(ConfigService.upserver, {'jsonstr': angular.toJson(query)}).success(function (data) {
        if (data.status == '000000') {
          if (data.data.isapkupdate == '1') {
            $rootScope.no = data.data.no;
            $ionicDeploy.initialize();
            $scope.checkUUU(data.data.size);
          }
        }
      })
    };
    //获取验证方式
    var getCheckFlag = function () {
      var params = {
        mod: 'nComm',
        func: 'getCaptchaType'
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          //1:图片验证码方式,0:滑块验证码
          $scope.checkFlag = data.data;
        } else {
          $scope.checkFlag = 1;
        }
      });
    };
    getCheckFlag();
    //登陆
    $scope.login = function () {
      if (UtilService.isMobile($scope.user.tel) && UtilService.isPwd($scope.user.pwd)) {
        $scope.showloading = true;
        var pwd = hex_md5($scope.user.pwd);
        var params = {
          mod: "nUser",
          func: "login",
          data: {
            tel: $scope.user.tel,
            passwd: pwd,
            type: 's',
            from: ConfigService.from,
            appversion: ConfigService.versionno,//app版本号
            province: UserService.location.province,
            area: UserService.location.city,//地区
            no: device.uuid,
            x: UserService.location.x,//经度
            y: UserService.location.y//纬度
          }
        };
        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
          if (data.status == "000000") {
            //遍历历史用户信息
            for (var i = 0; i < $scope.hisusers.length; i++) {
              if ($scope.hisusers[i].tel == $scope.user.tel) {
                $scope.hisusers.splice(i, 1);
              }
            }
            //保存当前用户信息
            var suser = {tel: $scope.user.tel, pwd: $scope.user.pwd};
            $scope.hisusers.unshift(suser);
            if ($scope.hisusers.length > 3) {
              $scope.hisusers.pop();
            }
            //当前历史登录记录大于2时，显示下拉菜单
            $scope.showHistory = $scope.hisusers.length >= 2;
            UserService.user = data.data;
            UserService.autologin = true;
            //清空本地 自动登录数据
            $scope.remove();
            var savedata = UserService.user.id + "," + $scope.user.tel + "," + hex_md5($scope.user.pwd) + "," + UserService.user.avate + "," + UserService.user.nick;
            //存储本地自动登录数据
            $scope.putData('loadpage', savedata);
            //存储历史登录数据
            $scope.putData('hisusers', $scope.hisusers);
            $scope.putData('logtoken', data.data.logtoken);
            UtilService.getLogtoken();
            if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
              if (device.platform == "Android") {
                GeTuiSdkPlugin.bindAlias(function () {
                }, UserService.user.id);
              } else {
                GeTuiSdk.bindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
              }
            }
            if (data.data.firstLogin) {
              $scope.cleargo("tab.home", {firstLogin: data.data.firstLogin});
            } else {
              if (data.data.needJump)
                $scope.cleargo("tab.home", {needJump: data.data.needJump});
              $scope.cleargo("tab.home");
            }
            //自动更新检测与APK更新检测均为true时，检测
            if (ConfigService.updateversion && ConfigService.updatecheck) {
              checkApkUpdate(UserService.user.id);
            }

            AccountService.reastBackupMoney();

            $timeout(function () {
              $scope.showloading = false;
            }, 1500);
          } else if (data.status == '100303') {
            $scope.showloading = false;
            UtilService.showMess(data.msg);
          } else {
            $scope.showloading = false;
            UtilService.showMess("手机号或密码错误，请重新输入");
          }
        }).error(function () {
          $scope.showloading = false;
          UtilService.showMess("网络不给力，请稍后刷新");
        })
      } else {
        UtilService.showMess("手机号或密码错误，请重新输入");
      }
    };

    var flag = 0;
    var token = "";
    $scope.codeinfo = {};
    //滑块验证-发送手机验证码
    $scope.sendcode = function (isuser, mtype) {
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
      if ($scope.checkFlag == 0) {
        if (flag == 0) {
          flag = 1;
          $timeout(function () {
            flag = 0;
          }, 2000);
          $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
            $scope.showloading = true;
            $scope.codeinfo.geetest_challenge = result.geetest_challenge;
            $scope.codeinfo.geetest_validate = result.geetest_validate;
            $scope.codeinfo.geetest_seccode = result.geetest_seccode;
            $scope.codeinfo.id = $scope.user.tel;
            //滑动正确后，会获得以上三个值。
            UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
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
            }).error(function () {
              $scope.showloading = false;
              UtilService.showMess("请重试！")
            });
          }, function (error) {
          });
        } else {
          UtilService.showMess("请不要重复点击！");
        }
      } else {
        $scope.showloading = false;
        $scope.user.fscode = "";
        setpiccode();
        $scope.checkpicshow = true;
      }
    };

    $scope.sendcode2 = function (isuser, mtype) {
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, isuser: 3}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        token = data.token;
        if (data.status == '0') {
          //注册
          /*验证码登陆提示弹窗*/
          var noRegistPopup = $ionicPopup.confirm({
            title: '该手机号未注册，请先注册', // String. 弹窗标题。
            cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
            cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
            okText: '手机注册', // String (默认: 'OK')。OK按钮的文字。
            okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

          });
          noRegistPopup.then(function(res) {
            if(res) {
              $scope.go('regist1');
            }
          });
        }else {
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
      });
    };
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };
    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    };
    //图片验证-发送手机验证码
    $scope.checkpicma = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 101).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          if (mtype == "sms") {
            $scope.timeInterval();
          }
          //发送短信验证码
          if (mtype != "sms") {
            UtilService.showMess("验证码已发送，请注意接听来电！");
          } else {
            UtilService.showMess("短信验证码已发送，请注意查收！");
          }
        } else if (data.status == "500005") {
          UtilService.showMess("图片验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          $scope.showBut1 = true;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
          $scope.checkpicshow = false;
          // UtilService.showMess("请不要重复验证！");
          UtilService.showMess(data.msg);
          $scope.fscodeRefresh();
        }
      });
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
        $scope.showloading=true;
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
                console.log("lllll="+data.data.logtoken);
                $scope.putData('logtoken', data.data.logtoken);
                UtilService.getLogtoken();
                //清空本地 自动登录数据
                $scope.remove();
                var savedata = $scope.user.userid + "," + $scope.user.tel + "," + data.data.pwd + "," + $scope.user.avate + "," + $scope.user.nick;
                //存储本地自动登录数据
                $scope.putData('loadpage', savedata);
                if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
                  if (device.platform == "Android") {
                    GeTuiSdkPlugin.bindAlias(function () {
                    }, UserService.user.id);
                  } else {
                    GeTuiSdk.bindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
                  }
                }
                $scope.showloading=false;
                if (data.data.needJump) {
                  $scope.cleargo("tab.home", {needJump: data.data.needJump, firstLogin: data.data.firstLogin})
                } else {
                  $scope.cleargo("tab.home", {firstLogin: data.data.firstLogin});
                }
              } else {
                $scope.showloading=false;
                UtilService.showMess(data.msg);
              }
            });
          } else {
            $scope.showloading=false;
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          $scope.showloading=false;
          UtilService.showMess("网络连接异常！");
        })
      }
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

    $scope.openThird = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: '“享推”想要打开“微信”', // String. 弹窗标题。
        cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '打开', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      confirmPopup.then(function (res) {
      });
    };
  })

  //注册1
  .controller("RegistController1", function ($scope, ConfigService, UtilService, $window, $timeout, $ionicModal) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $(".fuwu").hide();
    $("#imgpicurl").attr("src", "");
    /*点击关闭条款*/
    $scope.hideTK = function () {
      $(".loginHead").show();
      $scope.closefuwuModal();
    };
    /*点击打开服务条款*/
    $scope.showTK = function () {
      $(".loginHead").hide();
      $scope.openfuwuModal();
    };

    $ionicModal.fromTemplateUrl('fuwuModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openfuwuModal = function () {
      $scope.modal.show();
    };
    $scope.closefuwuModal = function () {
      $scope.modal.hide();
    };

    $scope.textinputfocus = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '22%', 'bottom': 'auto'});
      }
    };
    $scope.textinputblur = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '0', 'bottom': 0});
      }
    };

    //用户信息
    $scope.user = {};
    //手机号删除按钮是否显示
    $scope.showtelclear = false;
    $scope.pcodeserver = ConfigService.pcodeserver;
    $scope.checkFlag = 1;
    $scope.checkpicshow = false;
    $scope.codeinfo = {};
    $scope.showloading = false;
    var token = "";
    var getCheckFlag = function () {
      var params = {
        mod: 'nComm',
        func: 'getCaptchaType'
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          //1:图片验证码方式,0:滑块验证码
          $scope.checkFlag = data.data;
          //$scope.checkFlag = 1;
        } else {
          $scope.checkFlag = 1;
        }
      });
    };
    getCheckFlag();
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };
    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
      UtilService.tongji('coderefresh');
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
    //发送手机验证码
    var flag = 0;
    $scope.sendcode = function (isuser, mtype) {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      if ($scope.showagree == false) {
        UtilService.showMess("请先阅读享推用户服务协议！");
        return;
      }
      UtilService.tongji('codeget');
      $scope.showloading = true;
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, type: 's', isuser: isuser}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.showloading = false;
          if ($scope.checkFlag == 0) {
            if (flag == 0) {
              flag = 1;
              $timeout(function () {
                flag = 0;
              }, 2000);
              $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
                $scope.showloading = true;
                $scope.codeinfo.geetest_challenge = result.geetest_challenge;
                $scope.codeinfo.geetest_validate = result.geetest_validate;
                $scope.codeinfo.geetest_seccode = result.geetest_seccode;
                $scope.codeinfo.id = $scope.user.tel;
                //滑动正确后，会获得以上三个值。
                UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 101).success(function (data) {
                  if (data.status == "000000") {
                    //发送短信验证码
                    $scope.showloading = false;
                    $scope.go("regist2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
                  } else if (data.status == "100101") {
                    $scope.showloading = false;
                    UtilService.showMess("请60s之后再试！");
                  } else {
                    $scope.showloading = false;
                    // UtilService.showMess("请不要重复验证！");
                      UtilService.showMess(data.msg);
                  }
                }).error(function () {
                  $scope.showloading = false;
                  UtilService.showMess("请重试！")
                });
              }, function () {
                $scope.showloading = false;
              });
            } else {
              UtilService.showMess("请不要重复点击！");
            }
          } else {
            $scope.user.fscode = "";
            setpiccode();
            $scope.checkpicshow = true;
          }
        } else if (data.status == '100202') {
          $scope.showloading = false;
          UtilService.showMess("该手机号已注册，请重新输入！");
        }
      }).error(function () {
        $scope.showloading = false;
        UtilService.showMess("网络存在异常！");
      });
    };

    $scope.sendcode2 = function (isuser, mtype) {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      if ($scope.showagree == false) {
        UtilService.showMess("请先阅读享推用户服务协议！");
        return;
      }
      $scope.showloading = true;
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, type: 's', isuser: isuser}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 101).then(function (data) {
            if (data.status == "000000") {
              //发送短信验证码
              $scope.showloading = false;
              $scope.go("regist2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
            } else if (data.status == "100101") {
              $scope.showloading = false;
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
        } else if (data.status == '100202') {
          $scope.showloading = false;
          UtilService.showMess("该手机号已注册，请重新输入！");
        }
      }).error(function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };

    //验证图片验证码
    $scope.checkpicma = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 101).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          $scope.go("regist2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
        } else if (data.status == "500005") {
          UtilService.showMess("图片验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
          $scope.checkpicshow = false;
          // UtilService.showMess("请不要重复验证！");
            UtilService.showMess(data.msg);
          $scope.fscodeRefresh();
        }
      });
    };

    //默认同意协议
    $scope.showagree = true;
    $scope.changeAggree = function () {
      $scope.showagree = !$scope.showagree;
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }

    $scope.ismobile = function(tel) {
      return UtilService.isMobile(tel);
    };
  })
  //注册2
  .controller("RegistController2", function ($scope, ConfigService, UtilService, $window, $stateParams, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //用户信息
    $scope.user = {};
    //图片验证码token
    var token = "";
    //图片验证码服务器
    $scope.pcodeserver = ConfigService.pcodeserver;
    $scope.checkFlag = $stateParams.checkFlag;
    $scope.user.tel = $stateParams.tel;
    $scope.codeinfo = {};

    $scope.textinputfocus = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '22%', 'bottom': 'auto'});
      }
    };
    $scope.textinputblur = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '0', 'bottom': 0});
      }
    };

    //手机号变化事件
    $scope.showcodeclear = false;
    $scope.codeChange = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code) && $scope.user.code != null) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    //清除手机号
    $scope.cleancode = function () {
      $scope.user.code = "";
      $scope.showcodeclear = false;
    };
    //失去焦点
    $scope.showcodeClear = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code)) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    $scope.hidecodeClear = function () {
      $scope.showcodeclear = false;
    };

    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };

    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };

    //发送语音验证码
    var flag = 0;
    $scope.sendcode = function (isuser, mtype) {
      $scope.user.code = "";
      if ($scope.checkFlag == 0) {
        if (flag == 0) {
          flag = 1;
          $timeout(function () {
            flag = 0;
          }, 2000);
          $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
            $scope.codeinfo.geetest_challenge = result.geetest_challenge;
            $scope.codeinfo.geetest_validate = result.geetest_validate;
            $scope.codeinfo.geetest_seccode = result.geetest_seccode;
            $scope.codeinfo.id = $scope.user.tel;
            //滑动正确后，会获得以上三个值。
            UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 101).success(function (data) {
              if (data.status == "000000") {
                if(mtype == "voice") {
                    UtilService.showMess("请注意接听语音验证码！");
                } else {
                    UtilService.showMess("请注意接收短信验证码！");
                }
              } else if (data.status == "500005") {
                UtilService.showMess("验证码验证失败，请重试！");
              } else if (data.status == "100101") {
                UtilService.showMess("请60s之后再试！");
              } else {
                // UtilService.showMess("请不要重复验证！");
                  UtilService.showMess(data.msg);
              }
            });
          });
        } else {
          UtilService.showMess("请不要重复点击！");
        }
      } else {
        setpiccode();
        $scope.checkpicshow = true;
      }
    };

    $scope.sendcode2 = function (isuser, mtype) {
      $scope.user.code = "";

      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 101).then(function (data) {
        if (data.status == "000000") {
            if(mtype == "voice") {
                UtilService.showMess("请注意接听语音验证码！");
            } else {
                UtilService.showMess("请注意接收短信验证码！");
            }
        } else if (data.status == "500005") {
          UtilService.showMess("验证码验证失败，请重试！");
        } else if (data.status == "100101") {
          UtilService.showMess("请60s之后再试！");
        } else {
          // UtilService.showMess("请不要重复验证！");
            UtilService.showMess(data.msg);
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };
    //验证图片验证码
    $scope.checkpicma = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 101).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          UtilService.showMess("请注意接听语音验证码！");
        } else if (data.status == "500005") {
          UtilService.showMess("验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
            UtilService.showMess(data.msg);
        }
      });
    };
    //验证短信验证码
    $scope.checkmesg = function () {
      if (!UtilService.isSmsCode($scope.user.code)) {
        UtilService.showMess("请输入正确的短信验证码！");
      } else {
        //验证手机号、短信是否正确
        UtilService.checkCode($scope.user.tel, $scope.user.code).success(function (data) {
          token = data.token;
          if (data.status == '000000') {
            $scope.go("regist3", {"token": token, "tel": $scope.user.tel});
          } else {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络连接异常！");
        })
      }
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }
  })
  //注册3
  .controller("RegistController3", function ($scope, ConfigService, UtilService, $window, $stateParams, UserService, $timeout,AccountService) {
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

    //获取历史用户信息
    var getHisUserData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var users = resultData;
          if (users == null || users == "" || users == undefined) {
            $scope.hisusers = [];
          } else {
            $scope.hisusers = users;
            $scope.showHistory = users.length >= 2;
          }
        }, function () {
          $scope.hisusers = [];
        }, "hisusers");
      }
      catch (e) {
        $scope.hisusers = [];
      }
    };
    getHisUserData();
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

    //修改密码后登陆
    $scope.regist = function () {
      if ($scope.user.pwd == "" || angular.isUndefined($scope.user.pwd)) {
        UtilService.showMess("密码不能为空！");
        return;
      }
      if (!UtilService.isPwd($scope.user.pwd)) {
        UtilService.showMess("请输入6-22位的数字或字母组合的密码!");
        return;
      }
      $scope.registFunction();
    };
    $scope.registFunction = function () {
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
          UserService.user.nick = $scope.user.nick = data.nick;
          UserService.user.avate = $scope.user.avate = data.avate;
          UserService.user.tel = $scope.user.tel;
          UserService.user.pwd = hex_md5($scope.user.pwd);
          //遍历历史用户信息
          for (var i = 0; i < $scope.hisusers.length; i++) {
            if ($scope.hisusers[i].tel == $scope.user.tel) {
              $scope.hisusers.splice(i, 1);
            }
          }
          //保存当前用户信息
          var suser = {tel: $scope.user.tel, pwd: $scope.user.pwd};
          $scope.hisusers.unshift(suser);
          if ($scope.hisusers.length > 3) {
            $scope.hisusers.pop();
          }
          //清空本地 自动登录数据
          $scope.remove();
          var savedata = $scope.user.userid + "," + $scope.user.tel + "," + hex_md5($scope.user.pwd) + "," + $scope.user.avate + "," + $scope.user.nick;
          //存储本地自动登录数据
          $scope.putData('loadpage', savedata);
          //存储历史登录数据
          $scope.putData('hisusers', $scope.hisusers);
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
      UtilService.tongji('codesubmit');
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
    //邀请码化事件
    $scope.showinvateclear = false;
    $scope.inviteChange = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code) && $scope.user.code != null) {
        $scope.showinvateclear = true;
      } else {
        $scope.showinvateclear = false;
      }
    };
    //清除已输入的邀请码
    $scope.cleaninvite = function () {
      $scope.user.code = "";
      $scope.showinvateclear = false;
    }

  })

  //找回密码1
  .controller("FindPwdController1", function ($scope, ConfigService, UtilService, $window, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //用户信息
    $scope.user = {};
    //手机号删除按钮是否显示
    $scope.showtelclear = false;
    $scope.pcodeserver = ConfigService.pcodeserver;
    $scope.checkFlag = 1;
    $scope.checkpicshow = false;
    $scope.codeinfo = {};
    $scope.showloading = false;
    var token = "";

    $scope.textinputfocus = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '22%', 'bottom': 'auto'});
      }
    };
    $scope.textinputblur = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '0', 'bottom': 0});
      }
    };

    var getCheckFlag = function () {
      var params = {
        mod: 'nComm',
        func: 'getCaptchaType'
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          //1:图片验证码方式,0:滑块验证码
          $scope.checkFlag = data.data;
          //$scope.checkFlag = 1;
        } else {
          $scope.checkFlag = 1;
        }
      });
    };
    getCheckFlag();

    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };

    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };

    //手机号变化事件
    $scope.telChange = function () {
      if ($scope.user.tel != "" && angular.isDefined($scope.user.tel) && $scope.user.tel != null) {
        $scope.showtelclear = true;
      } else {
        $scope.showtelclear = false;
      }
    };
    //清除手机号
    $scope.cleantel = function () {
      $scope.user.tel = "";
      $scope.showtelclear = false;
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
    //发送手机验证码
    var flag = 0;
    $scope.sendcode = function (isuser, mtype) {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      $scope.showloading = true;
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, type: 's', isuser: isuser}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "000000") {
          $scope.showloading = false;
          if ($scope.checkFlag == 0) {
            if (flag == 0) {
              flag = 1;
              $timeout(function () {
                flag = 0;
              }, 2000);
              $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
                $scope.showloading = true;
                $scope.codeinfo.geetest_challenge = result.geetest_challenge;
                $scope.codeinfo.geetest_validate = result.geetest_validate;
                $scope.codeinfo.geetest_seccode = result.geetest_seccode;
                $scope.codeinfo.id = $scope.user.tel;
                //滑动正确后，会获得以上三个值。
                UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
                  if (data.status == "000000") {
                    $scope.showloading = false;
                    //发送短信验证码
                    $scope.go("findpwd2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
                  } else if (data.status == "100101") {
                    $scope.showloading = false;
                    UtilService.showMess("请60s之后再试！");
                  } else {
                    $scope.showloading = false;
                    // UtilService.showMess("请不要重复验证！");
                      UtilService.showMess(data.msg);
                  }
                }).error(function () {
                  $scope.showloading = false;
                  UtilService.showMess("请重试！")
                });
              }, function () {
                $scope.showloading = false;
              });
            } else {
              UtilService.showMess("请不要重复点击！");
            }
          } else {
            setpiccode();
            $scope.checkpicshow = true;
          }
        } else if (data.status == '100203') {
          $scope.showloading = false;
          UtilService.showMess("该手机号还未注册，请重新输入手机号！");
        }
      });
    };

    $scope.sendcode2 = function (isuser, mtype) {
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      $scope.showloading = true;
      UtilService.tongji('codeget', {no: device.uuid, tel: $scope.user.tel});
      var params = {
        mod: 'nUser',
        func: 'checkTel',
        data: {tel: $scope.user.tel, type: 's', isuser: isuser}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 102).then(function (data) {
            if (data.status == "000000") {
              //发送短信验证码
              $scope.showloading = false;
              $scope.go("findpwd2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
            } else if (data.status == "100101") {
              $scope.showloading = false;
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
        } else if (data.status == '100203') {
          $scope.showloading = false;
          UtilService.showMess("该手机号还未注册，请重新输入手机号！");
        }
      });
    };

    $scope.checkpicma = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          $scope.go("findpwd2", {"checkFlag": $scope.checkFlag, "tel": $scope.user.tel});
        } else if (data.status == "500005") {
          UtilService.showMess("图片验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
            UtilService.showMess(data.msg);
        }
      });
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }
  })

  //找回密码2-输入短信验证码
  .controller("FindPwdController2", function ($scope, ConfigService, UtilService, $window, $stateParams, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //用户信息
    $scope.user = {};
    //图片验证码token
    var token = "";
    //图片验证码服务器
    $scope.pcodeserver = ConfigService.pcodeserver;
    $scope.checkFlag = $stateParams.checkFlag;
    $scope.user.tel = $stateParams.tel;
    $scope.codeinfo = {};

    $scope.textinputfocus = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '22%', 'bottom': 'auto'});
      }
    };
    $scope.textinputblur = function () {
      if (device.platform != "Android") {
        $('.vertifyCodeDailog').css({'top': '0', 'bottom': 0});
      }
    };

    //密码变化事件
    $scope.showcodeclear = false;
    $scope.codeChange = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code)) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    //失去焦点
    $scope.showcodeClear = function () {
      if ($scope.user.code != "" && angular.isDefined($scope.user.code)) {
        $scope.showcodeclear = true;
      } else {
        $scope.showcodeclear = false;
      }
    };
    $scope.hidecodeClear = function () {
      $scope.showcodeclear = false;
    };
    //清除已输入的密码
    $scope.cleancode = function () {
      $scope.user.code = "";
      $scope.showcodeclear = false;
    };
    //首次加载图片验证码
    var setpiccode = function () {
      var data = {};
      data.mod = 'nComm';
      data.func = 'makenTokenForRegister';
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        token = data.data;
        $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      })
    };

    //刷新图片验证码，清空输入的图片验证码
    $scope.fscodeRefresh = function () {
      $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
      $scope.user.fscode = "";
    };

    //发送语音验证码
    var flag = 0;
    $scope.sendcode = function (isuser, mtype) {
      $scope.user.code = "";
      if ($scope.checkFlag == 0) {
        if (flag == 0) {
          flag = 1;
          $timeout(function () {
            flag = 0;
          }, 2000);
          $window.GeetestPlugin.showGtCaptcha(ConfigService.server + "?mod=nComm&func=startGtCaptcha&id=" + $scope.user.tel, function (result) {
            $scope.codeinfo.geetest_challenge = result.geetest_challenge;
            $scope.codeinfo.geetest_validate = result.geetest_validate;
            $scope.codeinfo.geetest_seccode = result.geetest_seccode;
            $scope.codeinfo.id = $scope.user.tel;
            //滑动正确后，会获得以上三个值。
            UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
              if (data.status == "000000") {
                //发送短信验证码
                UtilService.showMess("请注意接听语音验证码！");
              } else if (data.status == "500005") {
                UtilService.showMess("验证码验证失败，请重新填写！");
              } else if (data.status == "100101") {
                UtilService.showMess("请60s之后再试！");
              } else {
                // UtilService.showMess("请不要重复验证！");
                  UtilService.showMess(data.msg);
              }
            });
          });
        } else {
          UtilService.showMess("请不要重复点击！");
        }
      } else {
        setpiccode();
        $scope.checkpicshow = true;
      }
    };

    $scope.sendcode2 = function (isuser, mtype) {
      $scope.user.code = "";

      UtilService.sendSMcodeByMcode($scope.user.tel, isuser, mtype, 102).then(function (data) {
        if (data.status == "000000") {
            if(mtype == "voice") {
                UtilService.showMess("请注意接听语音验证码！");
            } else {
                UtilService.showMess("请注意接收短信验证码！");
            }
        } else if (data.status == "500005") {
          UtilService.showMess("验证码验证失败，请重试！");
        } else if (data.status == "100101") {
          UtilService.showMess("请60s之后再试！");
        } else {
          // UtilService.showMess("请不要重复验证！");
            UtilService.showMess(data.msg);
        }
      }, function () {
        $scope.showloading = false;
        UtilService.showMess("请重试！")
      });
    };

    //验证图片验证码
    $scope.checkpicma = function (isuser, mtype) {
      if ($scope.user.fscode == "" || angular.isUndefined($scope.user.fscode) || $scope.user.fscode == null) {
        UtilService.showMess("请输入图片验证码！");
        return;
      }
      $scope.codeinfo.token = token;
      $scope.codeinfo.pvalue = $scope.user.fscode;
      UtilService.sendCode($scope.user.tel, isuser, mtype, $scope.codeinfo, 102).success(function (data) {
        if (data.status == "000000") {
          $scope.checkpicshow = false;
          UtilService.showMess("请注意接听语音验证码！");
        } else if (data.status == "500005") {
          UtilService.showMess("图片验证码验证失败，请重新填写！");
          $scope.fscodeRefresh();
        } else if (data.status == "100101") {
          $scope.checkpicshow = false;
          UtilService.showMess("请60s之后再试！");
          $scope.fscodeRefresh();
        } else {
            UtilService.showMess(data.msg);
        }
      });
    };
    //验证短信、语音验证码
    $scope.checkmesg = function () {
      if (!UtilService.isSmsCode($scope.user.code)) {
        UtilService.showMess("请输入正确的短信验证码！");
      } else {
        //验证手机号、短信是否正确
        UtilService.checkCode($scope.user.tel, $scope.user.code).success(function (data) {
          token = data.token;
          $scope.codema = data.data;
          if (data.status == '000000') {
            $scope.go("findpwd3", {"token": token, "tel": $scope.user.tel, "codema": $scope.codema});
          } else {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络连接异常！");
        })
      }
    };
    //隐藏弹窗
    $scope.hideTC = function () {
      $timeout(function () {
        $scope.checkpicshow = false;
        $scope.user.fscode = "";
      }, 400);
    }
  })

  //找回密码3-重置密码
  .controller("FindPwdController3", function ($scope, ConfigService, UtilService, $window, $stateParams, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user = {};
    //是否显示密码
    $scope.showPwdMask = false;
    $scope.token = $stateParams.token;
    $scope.user.tel = $stateParams.tel;
    $scope.codema = $stateParams.codema;

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
    //修改密码后登陆
    $scope.gotologin = function () {
      if ($scope.user.pwd == "" || angular.isUndefined($scope.user.pwd) || $scope.user.pwd == null) {
        UtilService.showMess("密码不能为空！");
        return;
      }
      if (!UtilService.isPwd($scope.user.pwd)) {
        UtilService.showMess("请输入6-22位的数字或字母组合的密码!");
        return;
      }
      //重置密码
      var data = {};
      data.mod = 'nUser';
      data.func = 'setBUserbyTelAndPcode';
      data.token = $scope.token;
      data.data = {
        tel: $scope.user.tel,
        passwd: hex_md5($scope.user.pwd),
        no: device.uuid,
        scode: $scope.codema,
        type: "s"
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.showMess("密码修改成功，请重新登录!");
          $timeout(function () {
            $scope.go("login");
          }, 1500)
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      }).error(function () {
        UtilService.showMess("网络连接异常！");
      })
    };
    //是否显示密码
    $scope.showpsw = function () {
      $scope.showpwdclear = false;
      $scope.showPwdMask = !$scope.showPwdMask;
    }

  });
