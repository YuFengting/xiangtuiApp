/**
 * Created by zhm on 2016-3-2.
 */
angular.module('xtui')
    /*设置页面*/
    .controller("SettingController", function (IMSqliteUtilService, $scope, $rootScope,$ionicHistory, UserService, ConfigService, $window,MsgService,SqliteUtilService,UtilService,StorageService,CityService) {
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.startfun();
        })
        $scope.user = UserService.user;
        $scope.versionno = 'v' + ConfigService.versionno;
        var isIOS = true;
        if (device.platform == "Android") {
            isIOS = !isIOS;
        }
        $scope.isios = isIOS;
        $scope.goPraise = function () {
            cordova.InAppBrowser.open("https://itunes.apple.com/us/app/xiang-tui-sui-pian-shi-jian/id1049698800", '_blank', 'location=yes,clearcache=yes');
        }
        //获取支付密码标志
        $scope.getPswFlag = function(){
          var params = {
            mod : 'nUser',
            func : 'getUser',
            userid:$scope.user.id
          }
          UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(params)}).success(function (data) {
            if (data.status == '000000') {
              UserService.paypwdflag=data.data.paypwdflag;
            }
          })
        }
        $scope.getPswFlag();

        $scope.hisusers = [];
        $scope.getHisusers = function(){
          try
          {
            plugins.appPreferences.fetch (function (resultData) {
              $scope.hisusers  =  resultData;
            }, function (resultData) {
              $scope.hisusers = [];
            }, "hisusers");
          }
          catch (e){
            $scope.hisusers = [];
          }
        }
        if (device.platform != "Android") {
          //IOS 放开
          $scope.getHisusers();
        }
        $scope.outlogin = function () {
          if(device.platform == "Android") {
            // navigator.xtuiPlugin.clearNotification(function(){
            //   MsgService.msgNotice = {};
            // }, function(){});
          }
          $scope.putData('loginuserid',UserService.user.id);
          $rootScope.checkedList=[];
          CityService.setInCityPage(true);
          CityService.setCheck(false);
          $rootScope.city=null;
          $rootScope.step1=-1;
          $rootScope.step1InviteName="";
          $rootScope.step1InviteAvatar="";
          $rootScope.step2 = false;
          $rootScope.step3 = false;
          $rootScope.step4 = false;
          $rootScope.step5 = false;
          $rootScope.step6 = false;
          $rootScope.step7 = false;
          $rootScope.merryChirsBox = false;
          $rootScope.showActive = false;
          $rootScope.isChangzhou=false;
          MsgService.stopQueryAllNew();
          SqliteUtilService.deletDataOfUser();
          StorageService.clear();
          $ionicHistory.clearCache();
          IMSqliteUtilService.dropImDataTable();
          UserService.jumpmoney = null;
          UserService.hasRedpacket=false;
          UserService.hasCoupon=false;
          UserService.hasRecommend=false;
          $rootScope.chatBadge = 0;
          UserService.imtab=0;
          UserService.concattab=0;
          if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
            if (device.platform == "Android") {
              GeTuiSdkPlugin.unSelfBindAlias(function(){},UserService.user.id);
            }else {
              GeTuiSdk.unbindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
            }
          }
          UserService.user = {};
          plugins.appPreferences.remove(function (resultData) {
          }, function (resultData) {
          }, 'loadpage');
          // if (UtilService.checkNetwork()) {
          //     $window.xgpush.unRegisterPush(function (event) {
          //     }, function (event) {
          //     });
          // }
          if (device.platform != "Android") {
            //IOS 放开
            plugins.appPreferences.store (function (resultData) {
             $scope.go('login');
             }, function (resultData) {
             }, "hisusers",$scope.hisusers);
          }
            //QQ登出
          YCQQ.logout(function(args){},function(failReason){});

        if (device.platform != "Android") {
            //微博登出
            YCWeibo.logout(function (res) {}, function (failreason) {});
        }else{
            //微博登出
            window.weibo.logout(function (res) {},function(failreason){});
        }


          $scope.go('login');
        };

        $scope.xgpushflg = ConfigService.xgpushflg;
        //推送开关
        /*
            $scope.xgpush = function () {
                if (!UtilService.checkNetwork()) {
                    UtilService.showMess("网络不给力，请稍后刷新");
                    return;
                }
                if (!$scope.xgpushflg) {
                    $window.xgpush.registerPush(UserService.user.id, function (event) {}, function (event) {});
                    $scope.xgpushflg = true;
                    $scope.putData('xgpushflg', '1');
                } else {
                    $window.xgpush.unRegisterPush(function (event) {}, function (event) {});
                    $scope.xgpushflg = false;
                    $scope.putData('xgpushflg', '0');
                }
            }
        */

        //存本地数据
        $scope.putData = function (keyData, valueData) {
            plugins.appPreferences.store(function (resultData) {
            }, function (resultData) {
            }, keyData, valueData);
        };
        UtilService.customevent("setting","setting");
    })
    /*设置密码*/
    .controller("SetpwdController", function ($scope,UserService,ConfigService,UtilService,$stateParams) {
      $scope.$on("$ionicView.beforeEnter", function () {
        $scope.startfun();
      })
      $scope.haspaypwd=false;
      $scope.aaa="";
      $scope.paypwdflag = UserService.paypwdflag;
      //alert(UserService.paypwdflag);
      if($scope.paypwdflag==0){
        $scope.aaa="设置支付密码";
        $scope.haspaypwd=false;
      }else{
        $scope.aaa="重置支付密码";
        $scope.haspaypwd=true;
      }
    })
    /*重置登陆密码*/
    .controller("ResetpwdController", function ($scope, UserService, UtilService, ConfigService, $timeout,SqliteUtilService,$ionicHistory) {
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.startfun();
        })
        $scope.user = UserService.user;
        $scope.showPwdone = false;
        $scope.showPwdtwo = false;

        $scope.user.pwd = "";
        $scope.user.rpwd = "";

        //清空原密码
        $scope.clearPwd = function () {
          $scope.user.pwd = "";
        }
        //清空新密码
        $scope.clearRPwd = function () {
          $scope.user.rpwd = "";
        }

        $scope.showreset = true;
        //当原密码、新密码都不为空时，“确定修改”按钮可以点击
        $scope.checkAllPwd = function(){
          if ($scope.user.pwd != "" && angular.isDefined($scope.user.pwd)) {
            $scope.haspwd = true;
          } else {
            $scope.haspwd = false;
          }
          if ($scope.user.pwd != "" && $scope.user.rpwd != "") {
            $scope.showreset = false
          } else {
            $scope.showreset = true;
          }
        }
        $scope.checknewPwd = function(){
          if ($scope.user.rpwd != "" && angular.isDefined($scope.user.rpwd)) {
            $scope.hasrpwd = true;
          } else {
            $scope.hasrpwd = false;
          }
          if ($scope.user.pwd != "" && $scope.user.rpwd != "") {
            $scope.showreset = false
          } else {
            $scope.showreset = true;
          }
        }

        //存本地数据
        $scope.putData = function (keyData, valueData) {
            plugins.appPreferences.store(function (resultData) {
            }, function (resultData) {
            }, keyData, valueData);
        };

        $scope.remove = function () {
            plugins.appPreferences.remove(function (resultData) {
            }, function (resultData) {
            }, 'loadpage');
        };
        //重置密码
        $scope.rsetpwd = function () {
            if (UtilService.isPwd($scope.user.pwd) && UtilService.isPwd($scope.user.rpwd)) {
                var pwd = hex_md5($scope.user.pwd);
                var params = {
                    mod: "nUser",
                    func: "checkpwdRealTime",
                    data: {passwd: pwd,
                        type: 's'},
                    userid: $scope.user.id
                }
                //验证原密码
                UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                    //通信成功则原密码输入正确
                    if (data.status == "000000") {
                        pwd = hex_md5($scope.user.rpwd);
                        var params = {
                            mod: "nUser",
                            func: "setSUser",
                            userid: $scope.user.id,
                            data: {passwd: pwd, type: 's'}
                        };
                        //修改密码
                        UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                            if (data.status == '000000') {
                                $scope.remove();
                                SqliteUtilService.deletDataOfUser();
                                $ionicHistory.clearCache();
                                UserService.user = {};
                                /*var dd = $scope.user.tel + "," + $scope.user.rpwd;
                                //存储本地自动登录数据
                                $scope.putData('loadpage', dd);*/
                                UtilService.showMess("新密码设置成功，请使用新密码重新登录");
                                //退出登录
                                $timeout(function () {
                                    $scope.go("login");
                                }, 1000);

                            }
                        });
                    } else {
                        UtilService.showMess('原密码错误，请重新输入');
                    }
                }).error(function () {
                    UtilService.showMess("网络不给力，请稍后刷新！");
                })
            } else {
                UtilService.showMess("请输入6-22位的数字或字母组合的密码!")
            }
        }

    //失去焦点
    $scope.showpswClear = function () {
      if($scope.user.pwd != "" && angular.isDefined($scope.user.pwd)){
        $scope.haspwd = true;
      }else {
        $scope.haspwd = false;
      }
    }
    $scope.hidepswClear = function () {
      $scope.haspwd = false;
    }
    //失去焦点
    $scope.showrpswClear = function () {
      if($scope.user.rpwd != "" && angular.isDefined($scope.user.rpwd)){
        $scope.hasrpwd = true;
      }else {
        $scope.hasrpwd = false;
      }
    }
    $scope.hiderpswClear = function () {
      $scope.hasrpwd = false;
    }
    //是否显示明文密码
    $scope.showpsw = function(){
      $scope.haspwd = false;
      $scope.showPwdone = !$scope.showPwdone;
    }
    $scope.showpsw2= function(){
      $scope.hasrpwd = false;
      $scope.showPwdtwo = !$scope.showPwdtwo;
    }

    })
    /*重置支付密码*/
    .controller("ResetpaypwdController", function ($scope, UserService, UtilService, ConfigService, $timeout,$ionicPopup) {
      $scope.$on("$ionicView.beforeEnter", function () {
        $scope.startfun();
      })


    //弹窗
    // 忘记密码弹窗
    $scope.fogetpaypopupopen = function() {
      var fogetpaypopup = $ionicPopup.show({
        title: '忘记密码，请联系<br />客服电话：<span class="coler007a">400-0505-811</span>',
        scope: $scope,
        buttons: [
          {
            text: '<span style="color: #ff3b30">取消</span>',
            type:'button-positive'
          },
          { text: '<span style="color: #007aff">联系客服</span>',
            type: 'button-go',
            onTap:function(e){
              window.open("tel:400-0505-811");
            }
          }
        ]
      });
    };

      $scope.user = UserService.user;
      $scope.showPwdone = false;
      $scope.showPwdtwo = false;

      $scope.user.ppwd = "";
      $scope.user.rppwd = "";

      //清空原密码
      $scope.clearPwd = function () {
        $scope.user.ppwd = "";
      }
      //清空新密码
      $scope.clearRPwd = function () {
        $scope.user.rppwd = "";
      }

      $scope.showreset = true;
      //当原密码、新密码都不为空时，“确定修改”按钮可以点击
      $scope.showdelpay = function(){
        if ($scope.user.ppwd != "" && angular.isDefined($scope.user.ppwd)) {
          $scope.haspwd = true;
        } else {
          $scope.haspwd = false;
        }
        if ($scope.user.ppwd != "" && $scope.user.rppwd != "") {
          $scope.showreset = false
        } else {
          $scope.showreset = true;
        }
      }
      $scope.showdelpay1 = function(){
        if ($scope.user.rppwd != "" && angular.isDefined($scope.user.rppwd)) {
          $scope.hasrpwd = true;
        } else {
          $scope.hasrpwd = false;
        }
        if ($scope.user.ppwd != "" && $scope.user.rppwd != "") {
          $scope.showreset = false
        } else {
          $scope.showreset = true;
        }
      }

      //重置密码
      $scope.rsetpaypwd = function () {
        if (UtilService.isPayPwd($scope.user.ppwd) && UtilService.isPayPwd($scope.user.rppwd)) {
          var ppwd = hex_md5($scope.user.ppwd);
          var params = {
            mod: "nUser",
            func: "checkpaypwdRealTime",
            data: {paypwd: ppwd,
              type: 's'},
            userid: $scope.user.id
          }
          //验证原密码
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
            //通信成功则原密码输入正确
            if (data.status == "000000") {
              rppwd = hex_md5($scope.user.rppwd);
              var params = {
                mod: "nUser",
                func: "setSUser",
                userid: $scope.user.id,
                data: {paypwd: rppwd, type: 's'}
              };
              //修改密码
              UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                if (data.status == '000000') {
                  UtilService.showMess("支付密码修改成功");
                  //退出登录
                  $timeout(function () {
                    $scope.goback();
                    UserService.paypwdflag=1;
                    //$scope.go("pswreset",{'paypwdflag':1});
                  }, 1000);
                }
              });
            } else {
              UtilService.showMess('原支付密码错误，请重新输入');
            }
          }).error(function () {
            UtilService.showMess("网络不给力，请稍后刷新！");
          })
        } else {
          UtilService.showMess("请输入6位纯数字的支付密码!")
        }
      }
      //失去焦点
      $scope.showpswClear = function () {
        if($scope.user.ppwd != "" && angular.isDefined($scope.user.ppwd)){
          $scope.haspwd = true;
        }else {
          $scope.haspwd = false;
        }
      }
      $scope.hidepswClear = function () {
        $scope.haspwd = false;
      }
      //失去焦点
      $scope.showrpswClear = function () {
        if($scope.user.rppwd != "" && angular.isDefined($scope.user.rppwd)){
          $scope.hasrpwd = true;
        }else {
          $scope.hasrpwd = false;
        }
      }
      $scope.hiderpswClear = function () {
        $scope.hasrpwd = false;
      }
      //是否显示明文密码
      $scope.showpsw = function(){
        $scope.haspwd=false;
        $scope.showPwdone = !$scope.showPwdone;
      }
      $scope.showpsw2= function(){
        $scope.hasrpwd=false;
        $scope.showPwdtwo = !$scope.showPwdtwo;
      }

    })
    /*设置支付密码*/
    .controller("SetpaypwdController", function ($scope, UserService, UtilService, ConfigService, $timeout) {
      $scope.$on("$ionicView.beforeEnter", function () {
        $scope.startfun();
      })
      $scope.user = UserService.user;
      $scope.showPwdone = false;
      $scope.showPwdtwo = false;

      $scope.user.ppwd1 = "";
      $scope.user.ppwd2 = "";

      //清空密码1
      $scope.clearPwd = function () {
        $scope.user.ppwd1 = "";
      }
      //清空密码2
      $scope.clearRPwd = function () {
        $scope.user.ppwd2 = "";
      }

      $scope.showreset = true;
      //当密码1、密码2都不为空时，“确定”按钮可以点击
      $scope.showpay1 = function(){
        if ($scope.user.ppwd1 != "" && $scope.user.ppwd2 != "") {
          $scope.showreset = false;
        } else {
          $scope.showreset = true;
        };
        if ($scope.user.ppwd1 != "" && angular.isDefined($scope.user.ppwd1)) {
          $scope.haspwd = true;
        } else {
          $scope.haspwd = false;
        }
      }
      $scope.showpay2 = function(){
        if ($scope.user.ppwd1 != "" && $scope.user.ppwd2 != "") {
          $scope.showreset = false;
        } else {
          $scope.showreset = true;
        };
        if ($scope.user.ppwd2 != "" && angular.isDefined($scope.user.ppwd2)) {
          $scope.hasrpwd = true;
        } else {
          $scope.hasrpwd = false;
        }
      }
      //设置密码
      $scope.setpwd = function () {
        if (UtilService.isPayPwd($scope.user.ppwd1) && UtilService.isPayPwd($scope.user.ppwd2)) {
          if($scope.user.ppwd1 != $scope.user.ppwd2 ){
            UtilService.showMess("两次密码输入不一致，请重新输入!");
            return;
          }else{
            var paypwd = hex_md5($scope.user.ppwd2);
            var params = {
              mod: "nUser",
              func: "setSUser",
              userid: $scope.user.id,
              data: {paypwd: paypwd, type: 's'}
            };
            //提交密码
            UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
              if (data.status == '000000') {
                UtilService.showMess("支付密码设置成功!");
                //退出登录
                $timeout(function () {
                  UserService.paypwdflag=1;
                  $scope.goback();
                  // $scope.go("pswreset",{'paypwdflag':1});
                }, 1000);
              }
            }).error(function () {
              UtilService.showMess("网络不给力，请稍后刷新！");
            })
          }
        } else {
          UtilService.showMess("请输入6位纯数字的支付密码!")
        }
      }
      //失去焦点
      $scope.showpswClear = function () {
        if($scope.user.ppwd1 != "" && angular.isDefined($scope.user.ppwd1) && $scope.user.ppwd1 != null){
          $scope.haspwd = true;
        }else {
          $scope.haspwd = false;
        }
      }
      $scope.hidepswClear = function () {
        $scope.haspwd = false;
      }
      //失去焦点
      $scope.showppswClear = function () {
        if($scope.user.ppwd2 != "" && angular.isDefined($scope.user.ppwd2) && $scope.user.ppwd2 != null){
          $scope.hasrpwd = true;
        }else {
          $scope.hasrpwd = false;
        }
      }
      $scope.hideppswClear = function () {
        $scope.hasrpwd = false;
      }
      //是否显示明文密码
      $scope.showpsw = function(){
        $scope.showPwdone = !$scope.showPwdone;
      }
      $scope.showpsw2= function(){
        $scope.showPwdtwo = !$scope.showPwdtwo;
      }

    })
    /*设置页换绑手机 验证旧手机号 changetel1*/
    .controller("Changetel1Controller", function ($scope, UserService, UtilService, $location, ConfigService) {
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.startfun();
        })

        $scope.user = UserService.user;
        $scope.pcodeserver = ConfigService.pcodeserver;
        $scope.reseattime();//重置语音验证码状态
        $scope.user.code = "";
        $scope.user.fscode = "";
        $('#phone1-btn').attr('disabled', true);

        //图片验证码首次加载
        var token = "";
        var setpiccode = function () {
            var data = {};
            data.mod = 'Comm';
            data.func = 'makenTokenForRegister';
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
                token = data.data;
                $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
            })
        }
        setpiccode();

        //刷新图片验证码，清空输入的图片验证码
        $scope.fscodeRefresh = function () {
            $("#imgpicurl").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
            $scope.user.fscode = "";
            $scope.checkNull();
        }

        $scope.showset = true;
        //当图片验证码、短信验证码(手机号)都不为空时，“确定”按钮可以点击
        $scope.checkNull = function () {
            if (angular.isDefined($scope.user.fscode) && angular.isDefined($scope.user.code)) {
                if ($scope.user.fscode != "" && $scope.user.code != "") {
                    $('#phone1-btn').removeAttr('disabled');
                } else {
                    $('#phone1-btn').attr('disabled', true);
                }
                ;
            } else {
                $('#phone1-btn').attr('disabled', true);
            }
        }

        //发送手机验证码
        $scope.sendcode = function (isuser, mtype) {
            //验证图片验证码
            if (UtilService.isFsCode($scope.user.fscode)) {
                var params = {
                    mod: "Comm",
                    func: "checkPicCodeForRegister",
                    data: {token: token, "pvalue": $scope.user.fscode}
                };
                UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                    if (data.status == "000000") {
                        if (data.data == 2) {
                            //验证失败
                            UtilService.showMess("图片验证码校验失败！");
                        } else if (data.data == 1) {
                            //图片验证码验证通过
                            var tel = $scope.user.tel;
                            if (UtilService.isMobile(tel)) {
                                $scope.timeInterval();
                                UtilService.sendCode(tel, isuser, mtype).success(function (data) {
                                    if (data.status == '000000') {

                                    } else {
                                        UtilService.showMess(data.msg);
                                    }
                                }).error(function (err) {
                                    UtilService.showMess("网络不给力，请稍后刷新");
                                });
                            } else {
                                UtilService.showMess("请输入正确的手机号码！");
                            }
                        } else if (data.data == 0) {
                            //图片验证码已过期，需重新刷新验证码
                            UtilService.showMess("图片验证码已失效，刷新重试");
                        }
                    } else if (data.status != '500004') {
                        UtilService.showMess(data.msg);
                    }
                });
            } else {
                UtilService.showMess("请输入正确的图片验证码！");
            }

        }

        //检测验证码
        $scope.checkcode = function () {
            if (UtilService.isMobile($scope.user.tel)) {
                //检验验证码格式
                if (UtilService.isSmsCode($scope.user.code)) {
                    UtilService.checkCode($scope.user.tel, $scope.user.code).success(function (data) {
                        if (data.status == '000000') {
                            $scope.go('changetel2');
                        } else {
                            UtilService.showMess(data.msg);
                        }
                    });
                } else {
                    UtilService.showMess("请输入正确的短信验证码！");
                }
            } else {
                UtilService.showMess("请输入正确的手机号码！");
            }
        }

    })
    /*换绑手机 验证新手机号 changetel2*/
    .controller("Changetel2Controller", function ($scope, UserService, UtilService, $location, ConfigService) {

        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.startfun();
        })

        $scope.user = UserService.user;
        $scope.pcodeserver = ConfigService.pcodeserver;
        $scope.user = {};
        $scope.showclear = false;
        $('#phone2-btn').attr('disabled', true);
        $scope.reseattime();//重置语音验证码状态


        //图片验证码首次加载
        var token = "";
        var setpiccode = function () {
            var data = {};
            data.mod = 'Comm';
            data.func = 'makenTokenForRegister';
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(data)}).success(function (data) {
                token = data.data;
                $("#imgpicur2").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
            })
        }
        setpiccode();

        //清空手机号
        $scope.clearrtel = function () {
            $scope.showclear = false;
            $scope.user.rtel = "";
        }

        //刷新图片验证码，清空输入的图片验证码
        $scope.fscodeRefresh = function () {
            $("#imgpicur2").attr("src", $scope.pcodeserver + "validateServlet?token=" + token + "&time=" + Date.parse(new Date()));
            $scope.user.fscode = "";
            $scope.checkNull();
        }

        $scope.showset = true;
        //当图片验证码、短信验证码(手机号)都不为空时，“确定”按钮可以点击
        $scope.checkNull = function () {
            if (angular.isDefined($scope.user.rtel) && $scope.user.rtel != "") {
                $scope.showclear = true;
            }
            if (angular.isDefined($scope.user.fscode) && angular.isDefined($scope.user.code) && angular.isDefined($scope.user.rtel)) {
                if ($scope.user.fscode != "" && $scope.user.code != "" && $scope.user.rtel != "") {
                    $('#phone2-btn').removeAttr('disabled');
                } else {
                    $('#phone2-btn').attr('disabled', true);
                }
                ;
            } else {
                $('#phone2-btn').attr('disabled', true);
            }
        }

        //发送手机验证码
        $scope.sendcode = function (isuser, mtype) {
            if (UtilService.isMobile($scope.user.rtel)) {
                //验证图片验证码
                if (UtilService.isFsCode($scope.user.fscode)) {

                    //图片验证码验证通过
                    var params = {
                        mod: 'User',
                        func: 'checkTel',
                        data: {tel: $scope.user.rtel, type: 's', isuser: isuser}
                    };
                    UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                        if (data.status == '000000') {
                            var params = {
                                mod: "Comm",
                                func: "checkPicCodeForRegister",
                                data: {token: token, "pvalue": $scope.user.fscode}
                            };
                            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                                if (data.status == "000000") {
                                    if (data.data == 2) {
                                        //验证失败
                                        UtilService.showMess("图片验证码校验失败！");
                                    } else if (data.data == 1) {

                                        $scope.timeInterval();
                                        UtilService.sendCode($scope.user.rtel, isuser, mtype).success(function (data) {
                                            if (data.status == '000000') {

                                            } else {
                                                UtilService.showMess(data.msg);
                                            }
                                        }).error(function (err) {
                                            UtilService.showMess("网络不给力，请稍后刷新");
                                        });

                                    } else if (data.data == 0) {
                                        //图片验证码已过期，需重新刷新验证码
                                        UtilService.showMess("图片验证码已失效，刷新重试");
                                    }
                                }
                                ;
                            })
                        } else if (data.status == '100202') {
                            UtilService.showMess("该手机号已注册，请重新输入！");
                        }
                    })

                } else {
                    UtilService.showMess("请输入正确的图片验证码！");
                }
            } else {
                UtilService.showMess("请输入正确的手机号码！");
            }
        }

        //检测验证码
        $scope.checkcode = function () {
            if (UtilService.isMobile($scope.user.rtel)) {
                var params = {
                    mod: 'User',
                    func: 'checkTel',
                    data: {tel: $scope.user.rtel, type: 's', isuser: '0'}
                };
                UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
                    //检验验证码格式
                    if (data.status == '000000') {
                        if (UtilService.isSmsCode($scope.user.code)) {
                            UtilService.checkCode($scope.user.rtel, $scope.user.code).success(function (data) {
                                if (data.status == '000000') {
                                    token = data.token;
                                    $scope.sethbtel($scope.user.rtel);
                                } else {
                                    UtilService.showMess(data.msg);
                                }
                            });
                        } else {
                            UtilService.showMess("请输入正确的短信验证码！");
                        }
                    } else if (data.status == '100202') {
                        UtilService.showMess("该手机号已注册，请重新输入！");
                    }
                })
            } else {
                UtilService.showMess("请输入正确的手机号码！");
            }
        }

        //更新输入新手机号
        $scope.sethbtel = function (tel) {
            //更新手机号
            var ndata = {};
            ndata.mod = 'User';
            ndata.func = 'setSUser';
            ndata.userid = UserService.user.id;
            var u = {};
            u.tel = tel;
            u.type = 's';
            u.token = token;
            ndata.data = u;
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(ndata)}, {}).success(function (data) {
                if (data.status == '000000') {
                    UtilService.showMess("换绑成功，请使用新手机号登录！");
                    $scope.remove = function () {
                        plugins.appPreferences.remove(function (resultData) {
                        }, function (resultData) {
                        }, 'loadpage');
                    };
                    $scope.go('login');
                } else if (data.status != '500004') {
                    UtilService.showMess(data.msg);
                }
            })
        }
    })


