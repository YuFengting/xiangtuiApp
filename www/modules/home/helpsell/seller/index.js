angular.module('xtui')
//提交客户信息页面
  .controller("AddUserInfoController", function ($scope, $ionicActionSheet) {
    //选择电话
    $scope.userTelShow = function (tel) {
      $ionicActionSheet.show({
        buttons: [
          {text: tel}
        ],
        titleText: '<i class="icon icon-xt2-store-tel fl"></i><span class="fl">您想呼叫哪个号码</span>',
        cancelText: '取消',
        buttonClicked: function () {
          window.open("tel:" + tel);
          return true;
        }
      });
    };
  })

  //添加客户信息详情页面
  .controller("AddUserController", function ($ionicHistory, $scope, $stateParams, $ionicActionSheet, $ionicPopup, $timeout, UtilService, ConfigService, UserService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.showname = false;
    var taskid = $stateParams.taskid;
    $scope.luser = {};

    //姓名 手机号 变化时，是否显示删除按钮
    $scope.changName = function () {
      if (angular.isUndefined($scope.luser.name) || $scope.luser.name == "" || $scope.luser.name == null) {
        $scope.showname = false;
        return;
      }
      $scope.showname = $scope.luser.name.length > 0;
    };

    $scope.changTel = function () {
      if (angular.isUndefined($scope.luser.tel) || $scope.luser.tel == "" || $scope.luser.tel == null) {
        $scope.showtel = false;
        return;
      }
      $scope.showtel = $scope.luser.tel.length > 0;
    };

    //失去焦点时 隐藏删除按钮
    $scope.hideCloseName = function () {
      $scope.showname = false;
    };
    $scope.hideCloseTel = function () {
      $scope.showtel = false;
    };
    $scope.hideCloseDemand1 = function () {
      $scope.demand1 = false;
    };
    $scope.hideCloseDemand2 = function () {
      $scope.demand2 = false;
    };
    $scope.hideCloseDemand3 = function () {
      $scope.demand3 = false;
    };

    //清除内容
    $scope.clearName = function () {
      $scope.luser.name = "";
      $scope.showname = false;
    };
    $scope.clearTel = function () {
      $scope.luser.tel = "";
      $scope.showtel = false;
    };
    $scope.cleardemand1 = function () {
      $scope.businessdemand1 = "";
      $scope.demand1 = false;
    };
    $scope.cleardemand2 = function () {
      $scope.businessdemand2 = "";
      $scope.demand2 = false;
    };
    $scope.cleardemand3 = function () {
      $scope.businessdemand3 = "";
      $scope.demand3 = false;
    };

    var flg = 0;
    $scope.referLeads = function () {
      //判断姓名
      if (angular.isUndefined($scope.luser.name) || $scope.luser.name == '' || $scope.luser.name == null) {
        UtilService.showMess("姓名不能为空！");
        return;
      }
      if ($scope.luser.name.length > 11) {
        UtilService.showMess("请输入11位以内姓名！");
        return;
      }
      if (!UtilService.isNameStr($scope.luser.name)) {
        UtilService.showMess("请输入中文或英文姓名！");
        return;
      }
      if (flg != 0) {
        return;
      }
      flg = 1;
      $timeout(function () {
        flg = 0;
      }, 1000);
      //检测敏感词汇
      var params = {
        mod: 'User',
        func: 'checkWords',
        userid: $scope.user.id,
        data: {name: $scope.luser.name}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          if (angular.isUndefined($scope.luser.tel) || $scope.luser.tel == '' || $scope.luser.tel == null) {
            UtilService.showMess("联系电话不能为空！");
            return;
          }
          var checktel = /^(0\d{9}|0\d{10}|0\d{11})|([1]{1}\d{10})$/;
          if (!checktel.test($scope.luser.tel)) {
            UtilService.showMess("请输入正确的联系电话！");
            return;
          }
          var params = {
            mod: "Stask",
            func: "referLeads",
            userid: $scope.user.id,
            data: {
              "taskid": taskid,
              "name": $scope.luser.name,
              "tel": $scope.luser.tel
            }
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
            if (data.status == '000000') {
              UtilService.showMess("客户信息保存成功！");
              $scope.goback();
            } else if (data.status == '120001') {
              UtilService.showMess("联系电话已存在！");
            }
            saveUserBehavior();
          }).error(function () {
          })
        } else if (data.status == '100802') {
          UtilService.showMess("涉及敏感词汇，请重新填写！");
        }
      }).error(function () {
      })
    };

    $scope.openContacts = function () {
      navigator.contacts.pickContact(function (contact) {
        $scope.luser.name = contact.displayName;
        $scope.luser.tel = contact.phoneNumbers[0].value;
        $('#leads_name_cps').focus();
      }, function (err) {
      });
    }

  })

  //申诉页面
  .controller("ComplaintController", function ($scope, $timeout, $ionicActionSheet, UtilService, ConfigService, UserService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    var leadsid = $stateParams.leadsid;
    $scope.comment = {};
    $scope.piclist = [];

    //申诉
    var compflg = 0;
    $scope.complaint = function () {
      if ($scope.comment.detail == "" || $scope.comment.detail == null || angular.isUndefined($scope.comment.detail)) {
        UtilService.showMess("请输入15-200字符以内的内容!");
        return;
      }
      var dd = $scope.comment.detail.trim();
      if (dd.length < 200 && dd.length > 14) {
        if (compflg != 0) {
          return;
        }
        compflg = 1;
        var avateData = {
          mod: 'Stask',
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
              $scope.goback();
            }, 3500)
          } else if (data.status == '130101') {
            UtilService.showMess("当前信息已申诉！");
          }
          compflg = 0;
        }).error(function () {
          compflg = 0;
        })
      } else {
        compflg = 0;
        UtilService.showMess("请输入15-200字符以内的内容!");
      }
    };

    var itempic = 3;
    //删除上传的图片
    $scope.deletepic = function (pic) {
      for (var i = 0; i < $scope.piclist.length; i++) {
        if ($scope.piclist[i] == pic) {
          $scope.piclist.splice(i, 1);
        }
      }
      itempic = 3 - $scope.piclist.length;
      if ($scope.piclist.length < 3) {
        $('#picadd').show();
      }
    };

    $scope.goadduserinfo = function () {
      $('.popup-mask').hide();
      $('.shensupopup').hide();
      $scope.goback();
    };

    //点击添加图片按钮后出现的选项
    $scope.addpicshow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '<span class="cancel-blue">相册</span>'}
        ],
        titleText: '<div class="text-center">您还可以上传' + itempic + '张图片</div>',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            $scope.getPicture();
          }
          return true;
        }
      });
    };

    //获取相机
    $scope.getPicture = function () {
      var cameraOptions = {
        quality: 100,//0-100
        destinationType: Camera.DestinationType.DATA_URL,//DATA_URL或FILE_URI
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,//PHOTOLIBRARY或CAMERA
        encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
        targetWidth: 120,//像素
        targetHeight: 120,//像素
        //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
        allowEdit: false,
        cropwindow:0  //0正方形 1长方形 2无限制
      };
      navigator.camera.getPicture(function (imageData) {
        $scope.$apply(function () {
          var avateData = {
            mod: 'User',
            func: 'savePic',
            userid: $scope.user.id,
            data: {pic: imageData}
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(avateData)}).success(function (data) {
            if (data.status == '000000') {
              $scope.piclist.push(data.data.pic);
              itempic = 3 - $scope.piclist.length;
              if ($scope.piclist.length == 3) {
                $('#picadd').hide();
              }
            }
          })
        });
      }, function (message) {
      }, cameraOptions);
    };

  })

  //申请云销售
  .controller('ApplyController', function ($scope,$ionicPopup, $timeout, UtilService, ConfigService, UserService, $stateParams, $location, $window,$ionicModal) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      $window.addEventListener('native.keyboardshow', keyboardShowHandler);
      $window.addEventListener('native.keyboardhide', keyboardHideHandler);
    });

    $scope.$on("$ionicView.unloaded", function () {
      /*移除监听软键盘事件*/
      $window.removeEventListener('native.keyboardshow', keyboardShowHandler);
      $window.removeEventListener('native.keyboardhide', keyboardHideHandler);
    });

    /*键盘显示隐藏事件*/
    $scope.applysty = {'padding-bottom': '0px'};
    function keyboardShowHandler(e) {
      if (device.platform != "Android") {
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $scope.applysty = {'padding-bottom': numpercent + 'px'};
      }
    }

    function keyboardHideHandler() {
      if (device.platform != "Android") {
        $scope.applysty = {'padding-bottom': '0px'};
      }
    }

    /*touch方法*/
    $scope.touchcontent = function () {
      $('.userinfoinput').blur();
      $('.textarea').blur();
    };

    $scope.user = UserService.user;
    $scope.auser = {};
    $scope.showname = false;
    $scope.showtel = false;
    $scope.salesfield = [];
    $scope.show = [];
    $scope.salesfieldmess = [];
    var merchantid = $stateParams.merchantid;
    var merchantname = $stateParams.merchantname;
    $('.popup-mask').hide();
    $('.shensupopup').hide();
    $scope.iosfont = false;
    //获取商家必填信息
    var getsalesfield = function () {
      var params = {
        mod: "nUser",
        func: "getBuserinfoByID",
        userid: $scope.user.id,
        data: {"merchantid": merchantid}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        merchantname = data.data.companyalias;
        $scope.salesfield = data.data.salesfield;//商家名称
        $scope.clogopath = data.data.clogopath;//商家logo

        //获取默认常用姓名
        if (UserService.user.applyname == "" || UserService.user.applyname == null || angular.isUndefined(UserService.user.applyname)) {
          $scope.auser.name = data.data.name;
        } else {
          $scope.auser.name = UserService.user.applyname;
        }
        if ($scope.salesfield != null && $scope.salesfield != "" && angular.isDefined($scope.salesfield)) {
          for (var i = 0; i <= $scope.salesfield.length; i++) {
            $scope.show[i] = false;
          }
        }
      })
    };
    getsalesfield();
    //初始化页面
    var initapply = function () {
      if (UserService.user.salesfieldmess == null) {
        UserService.user.salesfieldmess = [];
      }
      $scope.auser.detail = UserService.user.applydetail;
      if (UserService.user.salesfieldmess != null) {
        $timeout(function () {
          for (var i = 0; i < UserService.user.salesfieldmess.length; i++) {
            if (UserService.user.salesfieldmess[i] != "" && UserService.user.salesfieldmess[i] != null) {
              $(".sjzd").eq(i).val(UserService.user.salesfieldmess[i]);
            }
          }
        }, 500);
      }
    };
    initapply();
    //获取当日云销售申请次数
    var getapplytimes = function () {
      var params = {
        mod: "nStask",
        func: "getApplyTimes",
        userid: $scope.user.id,
        data: {
          "merchantid": merchantid
        }
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.data != null) {
          $scope.applytimes = data.data.applytimes;
          if ($scope.applytimes == 0) {
            $scope.applyinfo = '您今日有三次申请云销售的机会，请珍惜使用！'
          } else if ($scope.applytimes == 1) {
            $scope.applyinfo = '您还剩两次申请云销售的机会，珍惜使用！'
          } else if ($scope.applytimes == 2) {
            $scope.applyinfo = '这是您今日最后一次申请云销售的机会，珍惜使用！'
          }
        }
      })
    };
    getapplytimes();
    $scope.closePopup = function () {
      $timeout(function () {
        $('.popup-mask').hide();
        $('.shensupopup').hide();
        $scope.goback();
      }, 400)
    };
    $scope.goapply = function () {
      $timeout(function () {
        $('.popup-mask').hide();
        $('.shensupopup').hide();
        $scope.applying();
      }, 400)
    };
    //提交申请云销售
    var flg = 0;
    $scope.applySaler = function () {
      //将初始化字段置为空
      UserService.user.applydetail = null;
      UserService.user.salesfieldmess = null;
      UserService.user.applyname = null;
      if (angular.isUndefined($scope.auser.name) || $scope.auser.name == '' || $scope.auser.name == null) {
        UtilService.showMess("姓名不能为空！");
        return;
      }
      if ($scope.auser.name.length > 8) {
        UtilService.showMess("请输入8位以内姓名！");
        return;
      }
      if (!UtilService.isNameStr($scope.auser.name)) {
        UtilService.showMess("请输入中文或英文姓名！");
        return;
      }
      if ($scope.user.tel == "" || angular.isUndefined($scope.user.tel) || $scope.user.tel == null) {
        UtilService.showMess("手机号不能为空！");
        return;
      }
      if (!UtilService.isMobile($scope.user.tel)) {
        UtilService.showMess("请输入正确的手机号！");
        return;
      }
      if ($scope.showagree == false) {
        UtilService.showMess("请先阅读并同意《享推云销售服务协议》！");
        return;
      }
      //收集商家需求字段
      if ($scope.salesfield != null && $scope.salesfield != "" && angular.isDefined($scope.salesfield)) {
        for (var i = 0; i < $scope.salesfield.length; i++) {
          if ($(".sj").eq(i).find(".sjzd").val() == "") {
            UtilService.showMess("请输入：" + $scope.salesfield[i] + "字段！");
            return;
          } else {
            $scope.salesfieldmess[i] = $(".sjzd").eq(i).val();
          }
        }
      }
      //避免重复提交
      if (flg != 0) {
        return;
      }
      flg = 1;
      $timeout(function () {
        flg = 0;
      }, 1000);
      //首先检测敏感词汇
      var params = {
        mod: 'nUser',
        func: 'checkWords',
        userid: $scope.user.id,
        data: {name: $scope.auser.name}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          //申请云销售步骤
          if ($scope.applytimes <= 2) {
            $scope.applyTimes();
          } else {
            $scope.applying();
          }
        } else if (data.status == '100802') {
          UtilService.showMess("涉及敏感词汇，请重新填写！");
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
      })
    };

    //申请次数
    $scope.applyTimes = function(){
      var popup = $ionicPopup.confirm({
        title: $scope.applyinfo,
        cancelText: "取消",
        cancelType: "button-cancel",
        okText: "确定",
        okType: 'button-go'
      });
      popup.then(function (res) {
        if (res) {
          $scope.goapply();
        }else{
          $scope.goback();
        }
      });
    }

    //提示完善资料
    $scope.perfectInfo = function(){
      var popup = $ionicPopup.confirm({
        title: "您的云销售申请已经提交成功，<br/>我们将尽快告知您审核结果，请耐心等待。<br/>Tips：完善个人基础信息可以显著提高通过率哦！",
        cancelText: "取消",
        cancelType: "button-cancel",
        okText: "前去完善",
        okType: 'button-go'
      });
      popup.then(function (res) {
        if (res) {
          $scope.gotocomp();
        }else{
          $scope.nogotocomp();
        }
      });
    }

    //申请云销售具体步骤
    $scope.applying = function () {
      var params = {
        mod: "nStask",
        func: "applySaler",
        userid: $scope.user.id,
        data: {
          "merchantid": merchantid,
          "name": $scope.auser.name,
          "tel": $scope.user.tel,
          "detail": $scope.auser.detail,
          "salesfieldmess": $scope.salesfieldmess
        }
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          var salersid = data.data.salersid;
          $('#succmsg').show();
          UtilService.showMess("您的云销售申请已经提交成功，我们将尽快告知您审核结果，请耐心等待！");
          //申请云销售成功创建零时会话
          var params1 = {
            mod: 'IM',
            func: 'createTemporaryChat',
            userid: $scope.user.id,
            data: {
              suserid: $scope.user.id,
              buserid: merchantid,
              susername: $scope.auser.name
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params1)}).success(function () {
            $('#succmsg').hide();
            $scope.go('msgdetail', {
              'otheruserid': merchantid,
              'otherusername': merchantname,
              'istmp': 1,
              'avate': $scope.clogopath
            });
          });
          //IM申请云销售通知到用户
          var newDate = new Date();
          var FomatorString = "YYYY-MM-DD HH:MI:SS";
          var params = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 2,
              content: "您于" + UtilService.DatetoString(newDate, FomatorString) + "申请" + merchantname + "的云销售，请耐心等待商家审核!",
              receiverid: $scope.user.id,
              subtype: 0
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)});
          //IM申请云销售通知到商家
          var paramss = {
            mod: "IM",
            func: "insertIMMessage",
            data: {
              type: 2,
              content: salersid,
              receiverid: merchantid,
              subtype: 2
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(paramss)});
        } else if (data.status == '130001') {
          $('#fialmsg').show();
          $timeout(function () {
            $('#fialmsg').hide();
            $scope.goback();
          }, 3500)
        } else if (data.status == '130002') {
          $scope.applymsg = "云销售申请中！";
          $('#samemsg').show();
          $timeout(function () {
            $('#samemsg').hide();
            $scope.goback();
          }, 3500)
        } else if (data.status == '130008') {
          $scope.applymsg = "您已成为该商家的云销售！";
          $('#samemsg').show();
          $timeout(function () {
            $('#samemsg').hide();
            $scope.goback();
          }, 3500)
        }else if (data.status == '130003') {
          $scope.applymsg = "您的云销售身份数量已达上限，请删除其他身份后重新申请！";
          $('#samemsg').show();
          $timeout(function () {
            $('#samemsg').hide();
            $scope.goback();
          }, 3500)
        } else if (data.status == '130004') {
          $scope.applymsg = "您今日申请的云销售身份数量已达到上限，请明天再来！";
          $('#samemsg').show();
          $timeout(function () {
            $('#samemsg').hide();
            $scope.goback();
          }, 3500)
        } else if (data.status == '130007') {
          $scope.applymsg = "该商家已邀请您成为他的云销售，您可以去通讯录或云销售通知里接收！";
          $('#samemsg').show();
          $timeout(function () {
            $('#samemsg').hide();
            $scope.goback();
          }, 3500)
        }
      }).error(function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
      })
    };
    //跳转到个人基础信息页
    $scope.gotocomp = function () {
      $timeout(function () {
        var query = {
          mod: "nuser",
          func: "nSaveUserBehavior",
          data: {'fromurl': '/apply', 'tourl': $location.path(), 'param': {type: 'ws'}, 'func': 'gofillinfo'},
          userid: UserService.user.id
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
        })
      }, 100);
      $scope.go("info");
    };
    //不完善基础信息点击取消返回
    $scope.nogotocomp = function () {
      $timeout(function () {
        var query = {
          mod: "nuser",
          func: "nSaveUserBehavior",
          data: {'fromurl': '/apply', 'tourl': $location.path(), 'param': {type: 'qx'}, 'func': 'donotgofillinfo'},
          userid: UserService.user.id
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
        })
      }, 100);
      $scope.goback();
    };
    $scope.changedetial = function () {
      UserService.user.applydetail = $scope.auser.detail;
    };
    $scope.cut = function (index) {
      $(".sj").eq(index).find(".sjzd").val("");
      $scope.show[index] = false;
    };
    $scope.changeZd = function (index) {
      var valuezd = $(".sj").eq(index).find(".sjzd").val();
      UserService.user.salesfieldmess[index] = valuezd;
      if (valuezd == "" || valuezd == null || angular.isUndefined(valuezd)) {
        $scope.show[index] = false;
      } else {
        $scope.show[index] = true;
      }
    };
    $scope.showClear = function (index) {
      $scope.show[index] = true;
    };
    $scope.hideClear = function (index) {
      $scope.show[index] = false;
    };
    $scope.shownameClear = function () {
      $scope.showname = true;
    };
    $scope.hidenameClear = function () {
      $scope.showname = false;
    };
    //默认同意协议
    $scope.showagree = true;
    $scope.changeAggree = function () {
      $scope.showagree = !$scope.showagree;
    };
    //姓名 手机号 变化时，是否显示删除按钮
    $scope.changName = function () {
      if (angular.isUndefined($scope.auser.name) || $scope.auser.name == "" || $scope.auser.name == null) {
        UserService.user.applyname = $scope.auser.name;
        $scope.showname = false;
        return;
      }
      $scope.showname = $scope.auser.name.length > 0;
      UserService.user.applyname = $scope.auser.name;
    };
    //失去焦点时 隐藏删除按钮
    $scope.hideCloseName = function () {
      $scope.showname = false;
    };
    //清除内容
    $scope.clearName = function () {
      $scope.showname = false;
      $scope.auser.name = "";
    };
   /* /!*点击关闭条款*!/
    $(".fuwu").hide();
    $(".top-head").hide();
    $scope.hideTK = function () {
      $(".loginHead").show();
      $(".fuwu").hide();
      $(".top-head").hide();
    };*/
    /*点击打开服务条款*/

   /* $scope.showTK = function () {
      $(".loginHead").hide();
      $(".fuwu").show();
      $(".top-head").show();
    };*/

    $ionicModal.fromTemplateUrl('agreement.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openAgreement = function() {
      $scope.modal.show();
    };
    $scope.closeAgreement = function() {
      $scope.modal.hide();
    };


    $scope.up1 = true;
    $scope.up2 = true;
    $scope.up3 = true;
    $scope.up4 = true;
    $scope.up5 = true;
    $scope.up6 = true;
    $scope.up7 = true;
    $scope.up8 = true;

    $scope.clicklist = function (item) {
      if (item == 1) {
        $scope.up1 = !$scope.up1;
      }
      else if (item == 2) {
        $scope.up2 = !$scope.up2;
      }
      else if (item == 3) {
        $scope.up3 = !$scope.up3;
      }
      else if (item == 4) {
        $scope.up4 = !$scope.up4;
      }
      else if (item == 5) {
        $scope.up5 = !$scope.up5;
      }
      else if (item == 6) {
        $scope.up6 = !$scope.up6;
      }
      else if (item == 7) {
        $scope.up7 = !$scope.up7;
      }
      else if (item == 8) {
        $scope.up8 = !$scope.up8;
      }
    };
    $scope.detialflag = device.platform != "Android";

  });

