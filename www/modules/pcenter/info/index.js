/**
 * Created by zhm on 2016-3-2.
 */
angular.module('xtui')
  .controller("InfoController", function ($scope, $window, $ionicActionSheet, $ionicScrollDelegate, $timeout, UserService, UtilService, ConfigService, InfoService) {

    /*键盘显示隐藏事件*/
    function keyboardShowHandler(e) {
      if (device.platform == "Android") {
        $ionicScrollDelegate.$getByHandle('infoScroll').scrollBottom();
      } else {
        var eH = e.keyboardHeight;
        var numpercent = 640 / window.screen.width * eH;
        $('.infoScrollBox').css({'bottom': numpercent + 'px', 'height': 'auto'});
        $timeout(function () {
          $('.infoScrollBox').css({'height': 'auto'});
        }, 100);
        $ionicScrollDelegate.$getByHandle('infoScroll').scrollBottom();
      }
    }

    function keyboardHideHandler(e) {
      if (device.platform == "Android") {
        $ionicScrollDelegate.$getByHandle('infoScroll').scrollBottom();
      } else {
        $('.infoScrollBox').css({'bottom': 0});
        $ionicScrollDelegate.$getByHandle('infoScroll').scrollBottom();
      }
    }

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })

    $scope.ageSelect = true;

    $scope.user = UserService.user;
    //loading加载样式
    $scope.showloading = false;
    //城市信息
    $scope.citylist = {};
    //获取初始化用户基础信息
    var getUser = function (d) {
      $scope.showloading = true;
      var params = {
        mod: 'nUser',
        func: 'getSUserInfo',
        userid: $scope.user.id
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.user = data.data;
          $scope.user.nick=UserService.user.nick;
          $scope.user.avate=UserService.user.avate;
          getCitys();
          //初始化昵称
          if ($scope.user.nick == "" || angular.isUndefined($scope.user.nick)) {
            $scope.user.nick = "请填写您的昵称";
          } else {
            $('#nick').removeClass('unselect');
          }
          //初始化性别
          if ($scope.user.sex === "" || angular.isUndefined($scope.user.sex)) {
            $scope.user.age = "请选择您的性别";
          } else {
            $('#infoSex').removeClass('unselect');
          }
          //初始化年龄
          if ($scope.user.age == "" || angular.isUndefined($scope.user.age)) {
            $scope.user.age = "请选择您的实际年龄";
          } else {
            //$('#age').removeClass('unselect');
            $scope.ageSelect = false;
          }
          //mobiscroll选择年龄初始化
          var opt = 0;
          if ($scope.user.age != "" || angular.isDefined($scope.user.age)) {
            var opt = $scope.user.age;
          }
          $('#age').mobiscroll().number({
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'bottom',
            headerText: "<i class='icon icon-xt2-age'></i><i>请选择您的实际年龄</i>",
            defaultValue: opt,
            min: 1,
            max: 100,
            step: 1,
            setText: "确定",
            onSet: function (valueText, inst) {
              //$('#age').removeClass('unselect');
              $scope.ageSelect = false;
              $scope.user.age = inst._value;
              InfoService.updateUser("{age:'" + inst._value + "'}");
            }
          });
          //设置默认学历
          if ($scope.user.education == "" || angular.isUndefined($scope.user.education)) {
            $scope.user.education = "请选择您的学历";
          } else {
            $('#education').removeClass('unselect');
          }
          //设置默认婚恋状况，样式
          if ($scope.user.marriagestatus === "" || angular.isUndefined($scope.user.marriagestatus)) {
            $scope.user.marriagestatus = "请选择您的婚恋情况";
          } else {
            $('#infoMarry').removeClass('unselect');
          }
          //设置默认收入状况
          if ($scope.user.income === "" || angular.isUndefined($scope.user.income)) {
            $scope.user.income = "请选择您的收入状况";
          } else {
            $('#income').removeClass('unselect');
          }

          //设置默认行业/方向
          if ($scope.user.industrytagnames != "" && angular.isDefined($scope.user.industrytagnames)) {
            $('#industry').removeClass('unselect').html($scope.user.industrytagnames.join(","));
          } else {
            $('#industry').html("请选择您的关注领域");
          }
          //设置默认营销技能
          if ($scope.user.salemethodnames != "" && angular.isDefined($scope.user.salemethodnames)) {
            $('#salesmethod').removeClass('unselect').html($scope.user.salemethodnames.join(","));
          } else {
            $('#salesmethod').html("请选择相关营销技能");
          }
          //设置默认个人标签
          if ($scope.user.personallabelnames != "" && angular.isDefined($scope.user.personallabelnames)) {
            $('#personaltab').removeClass('unselect').html($scope.user.personallabelnames.join(","));
          } else {
            $('#personaltab').html("请选择您的个人标签");
          }

          /*//设置默认学校
           if($scope.user.school !="" && angular.isDefined($scope.user.school)){
           $('#school').removeClass('unselect').val($scope.user.school);
           }
           //设置默认专业
           if($scope.user.profession !="" && angular.isDefined($scope.user.profession)){
           $('#profession').removeClass('unselect').val($scope.user.profession);
           }*/
          //设置默认公司名称
          if ($scope.user.companyname == "" || angular.isUndefined($scope.user.companyname)) {
            $scope.user.companyname = "请填写您的公司名称";
          } else {
            $('#companyname').removeClass('unselect');
          }

          //设置默认职位
          if ($scope.user.job == "" || angular.isUndefined($scope.user.job)) {
            $scope.user.job = "请填写您的职位";
          } else {
            $('#job').removeClass('unselect');
          }

          //跳转公司名称
          $scope.goCompanyname = function () {
            if ($scope.user.companyname == '请填写您的公司名称') {
              $scope.go("company", {"companyname": ""});
            } else {
              $scope.go("company", {"companyname": $scope.user.companyname});
            }
          }
          //跳转职位
          $scope.goJobs = function () {
            if ($scope.user.job == '请填写您的职位') {
              $scope.go("jobs", {"job": ""});
            } else {
              $scope.go("jobs", {"job": $scope.user.job});
            }
          }

          /*//设置默认公司名称
           if($scope.user.companyname !="" && angular.isDefined($scope.user.companyname)){
           $('#companyname').removeClass('unselect').val($scope.user.companyname);
           }
           //设置默认职位
           if($scope.user.job !="" && angular.isDefined($scope.user.job)){
           $('#job').removeClass('unselect').val($scope.user.job);
           }*/
          $scope.showloading = false;
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
          $scope.showloading = false;
        }
      }).error(function () {
        $scope.showloading = false;
        UtilService.showMess("网络不给力，请稍后刷新");
      })
    }
    getUser();
    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };
    //选择城市
    var setcitys = function () {
      $('#areaList').mobiscroll().treelist({
        theme: 'mobiscroll',
        lang: 'zh',
        display: 'bottom',
        defaultValue: ['北京', '北京东城区'],
        fixedWidth: [90, 160],
        placeholder: '请选择您的常用地址',
        labels: ['省', '市'],
        headerText: "<i class='icon ion-ios-location-outline'></i><i>省市</i>",
        onSet: function (valueText, inst) {
          var list = inst._value.split(" ");
          InfoService.updateUser("{province:'" + list[0] + "',city:'" + list[1] + "'}");
        }
      });
      if ($scope.user.province != '' && $scope.user.city != '' && angular.isDefined($scope.user.city) && angular.isDefined($scope.user.province)) {
        $("#areaList_dummy").removeClass('inforEmailBox').val($scope.user.province + ' ' + $scope.user.city);
      }
    }
    //选择用户常用地址
    var getCitys = function (d) {
      //填充省市html
      var html = '';
      try {
        plugins.appPreferences.fetch(function (resultData) {
          html = resultData;
          //如果本地没有的话就到后台取
          if (html == null || html == "" || angular.isUndefined(html)) {
            var params = {
              mod: 'nComm',
              func: 'getCityList',
              userid:UserService.user.id
            }
            UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
              if (data.status == '000000') {
                $scope.citylist = data.data;
                for (var i = 0; i < data.data.length; i++) {
                  html += '<li data-val="' + data.data[i].province + '" >' + data.data[i].province + '<ul>';
                  for (var j = 0; j < data.data[i].citys.length; j++) {
                    html += '<li data-val="' + data.data[i].citys[j].name + '" >' + data.data[i].citys[j].name + '</li>';
                  }
                  html += '</ul></li>';
                }
                $scope.putData('cityhtml', html);
                $("#areaList").append(html);
                setcitys();
              } else if (data.status != '500004') {
                UtilService.showMess(data.msg);
              }
            })
          } else {
            $("#areaList").append(html);
            setcitys();
          }
        }, function (resultData) {
          html = '';
        }, "cityhtml");
      } catch (e) {
        html = '';
      }
    }

    //选择性别
    $scope.sexShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '男'},
          {text: '女'},
        ],
        titleText: '<i class="icon icon-xt2-sex fl"></i><span class="fl">选择性别</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            $scope.user.sex = "1";
          } else {
            $scope.user.sex = "0";
          }
          //更新性别
          InfoService.updateUser("{sex:" + $scope.user.sex + "}");
          $('#infoSex').removeClass('unselect');
          return true;
        }
      });
    };

    //选择学历
    $scope.eduShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '小学'},
          {text: '初中'},
          {text: '高中'},
          {text: '专科'},
          {text: '本科'},
          {text: '硕士研究生'},
          {text: '博士研究生'},
          {text: '博士后'},
        ],
        titleText: '<i class="icon icon-xt2-xueli fl"></i><span class="fl">选择学历</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          var edu;
          if (index == 0) {
            $scope.user.education = "小学";
          }
          else if (index == 1) {
            $scope.user.education = "初中";
          }
          else if (index == 2) {
            $scope.user.education = "高中";
          }
          else if (index == 3) {
            $scope.user.education = "专科";
          }
          else if (index == 4) {
            $scope.user.education = "本科";
          }
          else if (index == 5) {
            $scope.user.education = "硕士研究生";
          }
          else if (index == 6) {
            $scope.user.education = "博士研究生";
          }
          else if (index == 7) {
            $scope.user.education = "博士后";
          }
          InfoService.updateUser("{education:'" + $scope.user.education + "'}");
          $('#education').removeClass('unselect');
          return true;
        }
      });
    };

    //选择婚恋
    $scope.marryShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '未婚单身'},
          {text: '未婚有伴'},
          {text: '已婚未育'},
          {text: '已婚已育'}
        ],
        titleText: '<i class="icon icon-marriage fl"></i><span class="fl">选择婚恋</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          var marry;
          if (index == 0) {
            $scope.user.marriagestatus = "0";
          }
          else if (index == 1) {
            $scope.user.marriagestatus = "1";
          }
          else if (index == 2) {
            $scope.user.marriagestatus = "2";
          }
          else if (index == 3) {
            $scope.user.marriagestatus = "3";
          }
          InfoService.updateUser("{marriagestatus:'" + $scope.user.marriagestatus + "'}");
          $('#infoMarry').removeClass('unselect');
          return true;
        }
      });
    };

    //选择收入
    $scope.incomeBox = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '1000-2000'},
          {text: '2000-3000'},
          {text: '3000-5000'},
          {text: '5000-10000'},
          {text: '10000及以上'},
        ],
        titleText: '<i class="icon icon-uniE9CD fl"></i><span class="fl">选择收入</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          var income;
          if (index == 0) {
            $scope.user.income = "0";
          }
          else if (index == 1) {
            $scope.user.income = "1";
          }
          else if (index == 2) {
            $scope.user.income = "2";
          }
          else if (index == 3) {
            $scope.user.income = "3";
          }
          else if (index == 4) {
            $scope.user.income = "4";
          }
          InfoService.updateUser("{income:'" + $scope.user.income + "'}");
          $('#infoIncome').removeClass('unselect');
          return true;
        }
      });
    };

    //获取相机
    var getPicture = function (picType) {
      var cameraOptions = {
        quality: 100,//0-100
        destinationType: Camera.DestinationType.DATA_URL,//DATA_URL或FILE_URI
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,//PHOTOLIBRARY或CAMERA
        encodingType: Camera.EncodingType.JPEG,//JPEG或PNG
        targetWidth: 360,//像素
        targetHeight: 360,//像素
        //cameraDirection: Camera.Direction.BACK,//BACK或FRONT
        allowEdit: true,
        cropwindow:0  //0正方形 1长方形 2无限制
      };
      if (picType == 0) {
        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
      }
      navigator.camera.getPicture(function (imageData) {
        $scope.$apply(function () {
          $scope.picture = imageData;
          var avateData = {
            mod: 'nUser',
            func: 'setUserAvate',
            userid: UserService.user.id,
            data: {avate: $scope.picture}
          }
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(avateData)}).success(function (data) {
            if (data.status == '000000') {
              $scope.user.avate = UserService.user.avate = data.data.avate;
            } else if (data.status != '500004') {
              $scope.showMess(data.msg);
            }
          })
        });
      }, function (message) {
   //     $scope.closeHeadMask();
      }, cameraOptions);
    };
    //选择头像
    $scope.headShow = function () {
      $ionicActionSheet.show({
        buttons: [
          {text: '拍照'},
          {text: '从手机相册选择'},
        ],
        titleText: '<i class="icon icon-xt2-xiaolian fl"></i><span class="fl">更换头像</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
          $timeout(function(){
            getPicture(index)
          },400);
          return true;
        }
      });
    };
    //跳转选择个人标签页
    $scope.gotoPersonaltag = function () {
      $scope.go("personaltag", {"personallabelids": $scope.user.personallabelids});
    }
    //跳转选择兴趣标签页
    $scope.gotoIndustrytag = function () {
      $scope.go("industrydirection", {"industrytagids": $scope.user.industrytagids});
    }
    //跳转销售方式页
    $scope.gotoSalesmethod = function () {
      $scope.go("salesmethod", {"salemethodids": $scope.user.salemethodids});
    }
    //跳转上传头像
    $scope.gochooseheadpic = function () {
      $scope.go("chooseheadpic", {"avate": $scope.user.avate});
    }

    /* $scope.$on("$ionicView.beforeLeave", function () {
     //console.log("{school:'"+$("#school").val()+"',profession:'"+$("#profession").val()+"',companyname:'"+$("#companyname").val()+"',job:'"+$("#job").val()+"',age:'"+$scope.user.age+"',province:'"+ citylist[0]+"',city:'"+ citylist[1]+"',sex:'"+ $scope.user.sex+"',education:'"+ $scope.user.education+"',marriagestatus:'"+$scope.user.marriagestatus+"',income:'"+ $scope.user.income+"'}");
     InfoService.updateUser("{school:'"+$("#school").val()+"',profession:'"+$("#profession").val()+"',companyname:'"+$("#companyname").val()+"',job:'"+$("#job").val()+"'}");
     })*/

  })

  //重置昵称页面
  .controller("ResetNickController", function ($scope, UserService, UtilService, ConfigService, $stateParams) {

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })

    $scope.user = UserService.user;
    $scope.user.rnick = $stateParams.nick;
    $scope.showclear = false;
    //检查昵称是否存在  不存在则保存不能点击
    if ($scope.user.rnick != "" && angular.isDefined($scope.user.rnick)) {
      $('#setnick').removeAttr('disabled');
      $scope.showclear = true;
    } else {
      $('#setnick').attr('disabled', true);
    }

    //清空昵称
    $scope.clearNick = function () {
      $scope.user.rnick = "";
      $scope.user.rnick = "";
      $scope.showclear = false;
      $('#setnick').attr('disabled', true);
    }

    //检查昵称
    $scope.checkNick = function () {
      if ($scope.user.rnick != "" && angular.isDefined($scope.user.rnick)) {
        $('#setnick').removeAttr('disabled');
        $scope.showclear = true;
      } else {
        $('#setnick').attr('disabled', true);
        $scope.showclear = false;
      }
    }

    //修改昵称
    $scope.changeName = function () {
      if ($scope.user.rnick.length > 11) {
        UtilService.showMess("请输入11位以内昵称！");
        return;
      }
      //检测昵称是否唯一
      var params = {
        mod: 'nUser',
        func: 'checkNick',
        userid: $scope.user.id,
        data: {nick: $scope.user.rnick, type: 's'}
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          var params = {
            mod: 'nUser',
            func: 'setSUser',
            userid: $scope.user.id,
            data: {nick: $scope.user.rnick}
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
            if (data.status == '000000') {
              UtilService.showMess("昵称修改成功！");
              $scope.putData('loginselfnick', "2");//第三方登录用的
              UserService.user.nick = $scope.user.rnick;
              $scope.go('info');

              var params = {
                mod: 'IM',
                func: 'updateUserimgroup',
                userid: $scope.user.id
              };
              UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {});

            } else if (data.status != '500004') {
              UtilService.showMess(data.msg);
            }
          });
        } else if (data.status == '100801') {
          UtilService.showMess(data.msg);
        }
      });
    }

    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }

  })

  /*关注领域*/
  .controller('IndustryController', function ($scope, UserService, UtilService, ConfigService, $stateParams, InfoService, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    //初始化行业方向列表
    $scope.industrylist = {};
    //行业2级分类列表标题
    $scope.title = "";
    //行业2级分类列表
    $scope.tags = {};
    $scope.user = UserService.user;
    var tags = $stateParams.industrytagids;

    //初始化行业分类列表
    var getIndustry = function () {
      var params = {
        mod: 'nComm',
        func: 'getIndustryList'
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.industrylist = data.data;
        for (var i = 0; i < $scope.industrylist.length; i++) {
          for (var j = 0; j < tags.length; j++) {
            if ($scope.industrylist[i].id == tags[j]) {
              $scope.industrylist[i].class = 1;
            }
          }
        }
      })
    }
    getIndustry();
    //选择标签
    $scope.checkon = function (a) {
      var ii;
      if (a.class == 1) {
        ii = 2;
      } else {
        ii = 1;
      }
      var count = 1;
      for (var i = 0; i < $scope.industrylist.length; i++) {
        if ($scope.industrylist[i].class == 1) {
          count++;
        }
      }
      if (count > 5 && ii == 1) {
        UtilService.showMess("最多选择5个标签");
        return;
      } else {
        for (var i = 0; i < $scope.industrylist.length; i++) {
          if ($scope.industrylist[i].id == a.id) {
            $scope.industrylist[i].class = ii;
          }
        }
      }
    }
    //确认选择标签
    $scope.setindusties = function (a) {
      var j = 0;
      var industrytagids = [];
      for (var i = 0; i < $scope.industrylist.length; i++) {
        if ($scope.industrylist[i].class == 1) {
          j++;
          industrytagids.push($scope.industrylist[i].id);
        }
      }
      if (j > 5) {
        UtilService.showMess("最多选择5个标签");
        return;
      } else if (j <= 0) {
        UtilService.showMess("请至少选择1个标签");
        return;
      } else {
        //修改个人标签
        InfoService.updateUser("{industrytagids:'" + industrytagids + "'}");
        $timeout(function () {
          $scope.go("info");
        }, 50);
      }
    }
  })

  /*个人标签*/
  .controller('PLableController', function ($scope, $stateParams, UtilService, ConfigService, UserService, InfoService, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    $scope.user = UserService.user;
    var tags = $stateParams.personallabelids;//已有的标签，可能为空
    $scope.plable = [];//所有的标签
    $scope.plables = [];//前20个标签(只显示前20个)
    $scope.lables = [];//选择的标签，最多5个
    //初始化顶部集合的数据
    for (var j = 0; j < tags.length; j++) {
        $scope.lables.push({id:tags[j],name:""});
    }
    $scope.getPlable = function () {
      var params = {
        mod: 'nComm',
        func: 'getPersonalLableList'
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.plable = data.data;
        for (var i = 0; i < $scope.plable.length; i++) {
          for (var j = 0; j < tags.length; j++) {
            if ($scope.plable[i].id == tags[j]) {
              $scope.plable[i].class = 1;//选择底部区块是否选在
              //填充顶部集合的文字
              $scope.lables[j].name=$scope.plable[i].name;
            }
          }
        }
        $scope.xipai();
      })
    }
    $scope.getPlable();
    //换一换
    $scope.xipai = function (type) {
      if(type)
        UtilService.shuffle($scope.plable);
      for (var i = 0; i < 20; i++) {
        $scope.plables[i] = $scope.plable[i];
      }
    }
    //处理标签(包括点击上方选中的标签，以及下方的标签区块)
    $scope.dealLables = function (a){

      var index = -1;
      for (var i = 0; i < $scope.lables.length; i++) {
        if (a.id == $scope.lables[i].id) {
          index = i;
          break;
        }
      }
      if(index>=0){//之前是选中的
        $scope.lables.splice(index,1);
      }else{//之前未选中
        if ($scope.lables.length >= 5) {
          UtilService.showMess("最多选择5个标签");
          return;
        }
        $scope.lables.push(a);
      }
      for (var i = 0; i < $scope.plable.length; i++) {
        if ($scope.plable[i].id == a.id) {
          $scope.plable[i].class = index<0?1:2;
          break;
        }
      }
      for (var i = 0; i < $scope.plables.length; i++) {
        if ($scope.plables[i].id == a.id) {
          $scope.plables[i].class = index<0?1:2;
          break;
        }
      }
    }


    //确认选择标签
    $scope.settags = function () {
      var j = 0;
      var personallabelids = [];
      for (var i = 0; i < $scope.lables.length; i++) {
        j++;
        personallabelids.push($scope.lables[i].id);
      }
      if (j > 5) {
        UtilService.showMess("最多选择5个标签");
        return;
      } else if (j <= 0) {
        UtilService.showMess("请至少选择1个标签");
        return;
      } else {
        //修改个人标签
        InfoService.updateUser("{personallabelids:'" + personallabelids + "'}");
        $timeout(function () {
          $scope.go("info");
        }, 50);
      }
    }
  })

  /*销售方式*/
  .controller('SaleMethodController', function ($scope, $stateParams, UtilService, ConfigService, InfoService, $timeout) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    //初始化销售方式
    $scope.salesMethod = {};
    var sales = $stateParams.salemethodids;
    var getSalesMethod = function (d) {
      var params = {
        mod: 'nComm',
        func: 'getSalemethodList'
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.salesMethod = data.data;
        for (var i = 0; i < $scope.salesMethod.length; i++) {
          for (var j = 0; j < sales.length; j++) {
            if ($scope.salesMethod[i].id == sales[j]) {
              $scope.salesMethod[i].class = 1;
            }
          }
        }
      })
    }
    getSalesMethod();
    //选择销售方式
    $scope.checkon = function (a) {
      var ii;
      if (a.class == 1) {
        ii = 0;
      } else {
        ii = 1;
      }
      var count = 1;
      for (var i = 0; i < $scope.salesMethod.length; i++) {
        if ($scope.salesMethod[i].class == 1) {
          count++;
        }
      }
      if (count > 5 && ii == 1) {
        UtilService.showMess("最多选择5个标签");
        return;
      } else {
        for (var i = 0; i < $scope.salesMethod.length; i++) {
          if ($scope.salesMethod[i].id == a.id) {
            $scope.salesMethod[i].class = ii;
          }
        }
      }
    }
    //确认选择销售方式
    $scope.settags = function (a) {
      var j = 0;
      var salemethodids = [];
      for (var i = 0; i < $scope.salesMethod.length; i++) {
        if ($scope.salesMethod[i].class == 1) {
          j++;
          salemethodids.push($scope.salesMethod[i].id);
        }
      }
      if (j > 5) {
        UtilService.showMess("最多选择5个标签");
        return;
      } else if (j <= 0) {
        UtilService.showMess("请至少选择1个标签");
        return;
      } else {
        //修改销售方式
        InfoService.updateUser("{salemethodids:'" + salemethodids + "'}");
        $timeout(function () {
          $scope.go("info");
        }, 50);
      }
    }
  })

  //公司名称
  .controller("CompanyController", function ($scope, UserService, UtilService, ConfigService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    $scope.user = UserService.user;
    $scope.ruser = {};
    $scope.ruser.rcompanyname = $stateParams.companyname;
    $scope.showclear = false;
    if ($scope.ruser.rcompanyname != "" && angular.isDefined($scope.ruser.rcompanyname)) {
      $("#setcompanyname").removeAttr('disabled');
      $scope.showclear = true;
    } else {
      $("#setcompanyname").attr('disabled', true);
      $scope.showclear = false;
    }

    $scope.checkCompanyname = function () {
      if ($scope.ruser.rcompanyname != "" && angular.isDefined($scope.ruser.rcompanyname)) {
        $("#setcompanyname").removeAttr('disabled');
        $scope.showclear = true;
      } else {
        $("#setcompanyname").attr('disabled', true);
        $scope.showclear = false;
      }
    }
    $scope.clearCompanyname = function () {
      $scope.ruser.rcompanyname = "";
      $scope.showclear = false;
      $("#setcompanyname").attr('disabled', true);
    }
    //修改公司名称
    $scope.changeCompanyname = function () {
      var params = {
        mod: 'nUser',
        func: 'setSUser',
        userid: $scope.user.id,
        data: {companyname: $scope.ruser.rcompanyname}
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.showMess("公司名称设置成功！");
          UserService.user.companyname = $scope.user.companyname;
          $scope.go('info');
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      });
    }

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }

  })
  //职位
  .controller("jobsController", function ($scope, UserService, UtilService, ConfigService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    })
    $scope.user = UserService.user;
    $scope.ruser = {};
    $scope.ruser.rjob = $stateParams.job;
    $scope.showclear = false;
    if ($scope.ruser.rjob != "" && angular.isDefined($scope.ruser.rjob)) {
      $("#setjob").removeAttr('disabled');
      $scope.showclear = true;
    } else {
      $("#setjob").attr('disabled', true);
      $scope.showclear = false;
    }

    $scope.checkJob = function () {
      if ($scope.ruser.rjob != "" && angular.isDefined($scope.ruser.rjob)) {
        $("#setjob").removeAttr('disabled');
        $scope.showclear = true;
      } else {
        $("#setjob").attr('disabled', true);
        $scope.showclear = false;
      }
    }
    $scope.clearJob = function () {
      $scope.ruser.rjob = "";
      $scope.showclear = false;
      $("#setjob").attr('disabled', true);
    }

    //修改职位
    $scope.changeJob = function () {
      var params = {
        mod: 'nUser',
        func: 'setSUser',
        userid: $scope.user.id,
        data: {job: $scope.ruser.rjob}
      }
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.showMess("职位设置成功！");
          UserService.user.job = $scope.user.job;
          $scope.go('info');
        } else if (data.status != '500004') {
          UtilService.showMess(data.msg);
        }
      });
    }

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }

  })



