angular.module('xtui')
  //新的朋友
  .controller('newfriendController', function ($scope,$timeout,$ionicPopup,UtilService,ConfigService,UserService,MsgService,$state,$ionicScrollDelegate,BusinessIndexService) {
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })
    $scope.friendDelete = function(event){
      event.target.parentNode.parentNode.remove();
    }

    $scope.$on('$ionicView.beforeEnter', function() {
      if(UtilService.goStatus[$state.current.name] != undefined) {
          init();
          delete UtilService.goStatus[$state.current.name];
      }
    });

    var pagesize = 20;
    var init = function() {
      $ionicScrollDelegate.$getByHandle('newfriend').scrollTop(false);
      MsgService.queryApplyLog({pagesize: pagesize}).then(function(data){
        if(data.status == "000000") {
          $scope.newfriendlist = data.data;
          if(data.data && data.data.length == pagesize) {
            $scope.hasNextPage = true;
          } else {
            $scope.hasNextPage = false;
          }
        } else {
          UtilService.showMess(data.msg);
        }
        $scope.$broadcast('scroll.refreshComplete');
      }, function(){
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.doRefresh = function () {
      init();
    };

    $scope.loadMore = function () {
      if($scope.newfriendlist && $scope.newfriendlist.length > 0) {
        var option = {
          ltid: $scope.newfriendlist[$scope.newfriendlist.length - 1].id,
          pagesize: pagesize
        };
        MsgService.queryApplyLog(option).then(function(data){
          if(data.status == "000000") {
            if(data.data && data.data.length > 0) {
                $scope.newfriendlist = $scope.newfriendlist.concat(data.data);
                if(data.data.length == pagesize) {
                    $scope.hasNextPage = true;
                } else {
                    $scope.hasNextPage = false;
                }
            } else {
              $scope.hasNextPage = false;
            }
          } else {
            UtilService.showMess(data.msg);
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(){
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      }
    };

    $scope.openHome = function (usertype, userid, $event) {
      $event.stopPropagation();

      if(usertype == null) {
        var param = {
          mod:"IM",
          func:"getUserInfo",
          userid:UserService.user.id,
          data:{
            uid:userid
          }
        };
        UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(param)}).success(function (data) {
          if (data.status == "000000") {
            usertype = data.data.usertype;
            if (usertype == "b" || usertype == 1) {
              //是商家
              $scope.go('business', {merchantid: userid});
            } else {
              //是s用户
              $scope.go('shome', {suserid: userid});
            }
          } else {
            UtilService.showMess(data.msg);
          }
        }).error(function () {
          UtilService.showMess("网络不给力，请稍后刷新");
        }).finally(function () {

        });
      } else {
        if (usertype == "b" || usertype == 1) {
          //是商家
          $scope.go('business', {merchantid: userid});
        } else {
          //是s用户
          $scope.go('shome', {suserid: userid});
        }
      }
    };

    $scope.dealApply = function(index, result) {
      var newfriend = $scope.newfriendlist[index];
      if(newfriend.usertype == 0) {
        dealSInvite(index, result);
      } else {
        dealBInvite(index, result);
      }
      UtilService.tongji("newfriend", {type:result, friendid:newfriend.applicantid, friendtype:newfriend.usertype});
    }

    //处理s的好友申请
    var dealSInvite = function (index, result) {
      var newfriend = $scope.newfriendlist[index];
      var params = {
        mod: 'IM',
        func: 'updateIMApplyById',
        userid: UserService.user.id,
        data:{
          applyid:newfriend.id,
          applicantid:newfriend.applicantid,
          receiverid:UserService.user.id,
          result:result
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        if(data.status == "000000") {
          if(result == 1) {
            UtilService.showMess("已接受");
            $scope.newfriendlist[index].result = 1;
          } else if(result == 2) {
            UtilService.showMess("已拒绝");
            var length = $scope.newfriendlist.length;
            $scope.newfriendlist = $scope.newfriendlist.slice(0, index).concat($scope.newfriendlist.slice(index+1, length));
          }
        } else {
          UtilService.showMess(data.msg);
        }
      }).error(function(){
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    }

    //处理b的云销售邀请
    var dealBInvite = function(index, result) {
      var newfriend = $scope.newfriendlist[index];
      var params = {
        mod:"IM",
        func:"dealBinvite",
        userid:UserService.user.id,
        data:{
          inviteid:newfriend.inviteSalersid,
          result: result,
          sname:UserService.user.nick
        }
      };

      if(result == 1) {
          //关注商家
          BusinessIndexService.concernBusiness(newfriend.applicantid).then(function (response) {
          }, function () {
          });
      }

      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function (data) {
        if(data.status == "000000") {
          if(result == 1) {
            UtilService.showMess("已接受");
            $scope.newfriendlist[index].result = 1;
          } else if(result == 2) {
            UtilService.showMess("已拒绝");
            if(data.data) {
                MsgService.deleteChatfirst(data.data);
            }
            var length = $scope.newfriendlist.length;
            $scope.newfriendlist = $scope.newfriendlist.slice(0, index).concat($scope.newfriendlist.slice(index+1, length));
          }
        } else if(data.status == "130003") {
          UtilService.showMess("您的云销售身份数量已达上限，请删除其他身份后再同意该商家的邀请！");
        } else if(data.status == "130001") {
          UtilService.showMess("抱歉，您申请的商家云销售数量已达上限，无法同意，请选择其它商家！");
        } else if(data.status == "130004") {
          UtilService.showMess("抱歉，您今日申请云销售数量已达上限，无法同意，请明日再来！");
        } else {
          UtilService.showMess(data.msg);
        }
      }).error(function(){
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    }

  })

  //s的主页
  .controller('shomeController', function ($ionicActionSheet,$rootScope,$scope,$timeout,$state,$stateParams,UtilService,ConfigService,UserService,$ionicScrollDelegate,$ionicPopup,MsgService) {
    var kbOpen=false;
    function onKbOpen(e) {
      kbOpen=true;
      if (device.platform != "Android") {
        $timeout(function(){$('.popup-container').css({'top':'20%','bottom':'auto'});},340)

      }
    }

    $scope.toggleDelete = function(friendid){
      $ionicActionSheet.show({
        destructiveText: '<span class="red">删除</span>',
        cancelText: '取消',
        buttonClicked: function (index) {
         return true;
        },
        destructiveButtonClicked: function () {
          var params = {
            mod: "IM",
            func: "delFriend",
            userid: UserService.user.id,
            data: {
              friendid: friendid
            }
          };
          UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function (data) {
            if(data.status == "000000") {
              //data.data 是 imgroupid
              //MsgService.toDeleteChat[data.data] = 1;
              MsgService.deleteChatfirst(data.data);
              $scope.go("tab.msg");
            }
          }).error(function() {
            UtilService.showMess("网络不给力，请稍后刷新");
          });
        }
      });
    }
    function onKbClose(e) {
      kbOpen = false;
      if (device.platform != "Android") {
        $timeout(function(){ $('.popup-container').css({'top':'0px','bottom':'0px'});},340)
       // $('.popup-container').css({'top':'0px','bottom':'0px'});
      }
    }

    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
      window.addEventListener('native.keyboardshow', onKbOpen);
      window.addEventListener('native.keyboardhide', onKbClose);
    });
    $scope.$on('$ionicView.unloaded', function() {
      window.removeEventListener('native.keyboardshow', onKbOpen);
      window.removeEventListener('native.keyboardhide', onKbClose);
    });

    $scope.goMsg = function() {
      $scope.go("tab.msg", {checkflag:1});
    }

    var querySuserinfo = function() {
      var param = {
        mod: 'IM',
        func: 'getSimpleUser',
        userid: UserService.user.id,
        data: {
          targetUserid: $stateParams.suserid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function(data){
        if(data.status == "000000") {
          $scope.userinfo = data.data;
        } else {
          UtilService.showMess("查询用户信息失败。");
        }
      }).error(function(){
        UtilService.showMess("网络不给力，请稍后刷新");
      });

    };
    querySuserinfo();
    $scope.setremark = function () {
      $scope.go('setremark1',{'suserid':$stateParams.suserid,'otherusername':$scope.userinfo.otherusername,"imgroupid":$scope.userinfo.imgroupid})
    }

    //加为好友
    $scope.addFriend = function(){
      $scope.data = {}

      // 一个精心制作的自定义弹窗
      $scope.remark = {};
      $scope.remark.content = "";
      var myPopup = $ionicPopup.show({
        template: '<div style="padding: 18px 5px;">验证信息</div><textarea placeholder="最多20字" ng-model="remark.content"></textarea><style>.popup-head{border:none;padding:0px;}.popup-container .popup-title{padding:0px}</style>',
        scope: $scope,
        buttons: [
          {
            text: '取消',
            type: '',
            onTap: function(e) {

            }
          },
          {
            text: '确定',
            onTap: function(e) {
              if(angular.isDefined($scope.remark.content)){
                if($scope.remark.content.length>20){
                  UtilService.showMess("验证信息最多20个字");
                  e.preventDefault();
                  return;
                }
              }
              var params = {
                mod: 'IM',
                func: 'insertIMApply',
                userid: UserService.user.id,
                data:{
                  userid: UserService.user.id,
                  receiverid:$stateParams.suserid,
                  remark: $scope.remark.content
                }
              };
              UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
                if(data.status == "000000") {
                  UtilService.showMess("申请成功");
                  $scope.goback();
                }
              }).error(function(){

              });
            }
          }
        ]
      });
    }

    $scope.updateIMApplyById = function (result) {
      var params = {
        mod: 'IM',
        func: 'updateIMApplyById',
        userid: UserService.user.id,
        data:{
          applyid:$stateParams.applyid || $scope.userinfo.applyid,
          applicantid:$stateParams.suserid,
          receiverid:UserService.user.id,
          result:result}
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        if(data.status == "000000") {
          //UtilService.showMess("");
        }
        $scope.goback();
      }).error(function(){
        UtilService.showMess("网络不给力，请稍后刷新");
      });
    }

    $scope.sendMsg = function() {
      if($scope.userinfo.isFriend == 1 && $scope.userinfo.otherusername && $scope.userinfo.otherusername.length > 0) {
        $scope.go("permsgdetail", {otheruserid:$scope.userinfo.id, otherusername:$scope.userinfo.otherusername,avate:$scope.userinfo.avate, imgroupid:$scope.userinfo.imgroupid});
      } else {
        $scope.go("permsgdetail", {otheruserid:$scope.userinfo.id, otherusername:$scope.userinfo.nick,avate:$scope.userinfo.avate, imgroupid:$scope.userinfo.imgroupid});
      }
    };


    $scope.enlargePic = function (img) {
      $scope.imageurl = img;
      $scope.showimg = true;
      $rootScope.circleLargeImgShow = true;
      $timeout(function(){
        var a = $('.big-pic').height()/$('.big-pic').width();
        var sW = window.screen.width;
        var sh =640*window.screen.height/window.screen.width;
        if(a<window.screen.height/window.screen.width){
          $('.big-pic').css('margin-top',sh/2-$('.big-pic').height()/2+'px');
        }else{
          $('.big-pic').css('margin-left',640/2-$('.big-pic').width()/2+'px')
        }
        $('.big-pic').css("opacity",1);
      },150)
    }

    $scope.shrinkPic = function () {
      $scope.showimg = false;
      $rootScope.circleLargeImgShow = false;
    }
    $scope.optionPic = function(){
      $ionicActionSheet.show({
        buttons: [
          { text: '发送给好友' },
          { text: '保存图片' },
        ],
        cancelText: '取消',
        buttonClicked: function(index) {
          var content= $scope.imageurl;
          var formaturl;
          if (device.platform != "Android") {
            formaturl=cordova.file.tempDirectory;
          }else{
            formaturl=cordova.file.externalRootDirectory+"xtui/images/";
          }
          switch (index){
            //转发图片
            case 0:
              $scope.go('selectcontact',{shareid:content,name: "[图片]",type:'1'});
              break;
            //保存图片到本地
            case 1:
              $('.action-sheet-backdrop').remove();
              var fileTransfer = new FileTransfer();
              var uri =encodeURI( ConfigService.picserver+content);
              var fileURL =formaturl+uri.substr(uri.length-17);
              fileTransfer.download(
                uri,
                fileURL,
                function (entry) {

                  if (device.platform != "Android") {
                    fileTransfer.saveimageios(entry.toURL(),function (entry) {},function (error) {} );
                    UtilService.showMess("图片下载成功！");
                  }else{
                    saveImageToPhone(entry.toURL(), function(msg){
                      console.info(msg);
                      UtilService.showMess("图片下载成功！");
                    }, function(err){
                      console.error(err);
                    });
                  }
                },
                function (error) {
                },
                null,{ }
              );
              break;
            default:
              break;
          }
          return true;
        }
      });
    }
    //安卓保存图片到相册
    var saveImageToPhone = function(url, success, error) {
      var canvas, context, imageDataUrl, imageData;
      var img = new Image();
      img.onload = function() {
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        try {
          imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
          imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
          cordova.exec(
            success,
            error,
            'Canvas2ImagePlugin',
            'saveImageDataToLibrary',
            [imageData]
          );
        }
        catch(e) {
          error(e.message);
        }
      };
      try {
        img.src = url;
      }
      catch(e) {
        error(e.message);
      }
    };

    $scope.hideLargeHead = function () {
      $rootScope.headLargeImgShow = false;
    };

    $scope.showLargeHead = function () {
      $rootScope.headLargeImgShow = true;
      $timeout(function () {
        var a = $('.big-pic').height() / $('.big-pic').width();
        var sW = window.screen.width;
        var sh = 640 * window.screen.height / window.screen.width;
        if (a < window.screen.height / window.screen.width) {
          if($('.big-pic').height()<sh){
            $scope.bigpicStyle = {'margin-top': sh / 2 - $('.big-pic').height() / 2 + 'px'}
          }else{
            $scope.bigpicStyle = {'height': 640 * a + 'px'};
          }
        } else {
          if($('.big-pic').width()<640){
            $scope.bigpicStyle = {'margin-left': 640 / 2 - $('.big-pic').width() / 2 + 'px'};
          }else{
            $scope.bigpicStyle = {'width': '640px'};
          }
        }
        $('.big-pic').css("opacity",1);
        //$('.big-pic').show()
      }, 50);
    };
  })

//备注
  .controller('setRemarkController',function($scope,$timeout,$stateParams,MsgService,UtilService,ConfigService,UserService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })
    var imgroupid = $stateParams.imgroupid;
    $scope.user = UserService.user;
    $scope.ruser ={};
    $scope.ruser.remark = $stateParams.otherusername;
    if($scope.ruser.remark) {
      $scope.showclear = true;
    } else {
      $scope.showclear = false;
    }

    $scope.checkOtherNick = function(){
      if($scope.ruser.remark != "" && angular.isDefined($scope.ruser.remark)){
        //angular.element('#setnick').removeAttr('disabled');
        $("#setnick").removeAttr('disabled');
        $scope.showclear = true;
      }else{
        //angular.element('#setnick').attr('disabled',true);
        $("#setnick").attr('disabled',true);
        $scope.showclear = false;
      }
    }
    $scope.clearOtherNick=function(){
      $scope.ruser.remark = "";
      $scope.showclear = false;
      //angular.element('#setnick').attr('disabled',true);
      $("#setnick").attr('disabled', true);
    }
    $scope.changeOtherNick=function(){
      if($scope.ruser.remark.length > 11){
        UtilService.showMess("请输入11位以内的別名！");
        return ;
      }
      var params = {
        mod : 'IM',
        func : 'updateUserIMGroup',
        userid:$scope.user.id ,
        data :{imgroupid:$stateParams.imgroupid, otherusername:$scope.ruser.remark}
      };
        UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
          if(data.status == "000000") {
            UtilService.showMess("备注设置成功！");
            MsgService.changeRemark($stateParams.imgroupid, $scope.ruser.remark);
            //UserService.user.otherusername= $scope.user.otherusername;
            $scope.go("shome", {suserid:$stateParams.suserid});
          }else if(data.status != '500004') {
            UtilService.showMess(data.msg);
          }
        }).error(function(){
          UtilService.showMess("网络不给力，请稍后刷新");
        })
      }
  })
