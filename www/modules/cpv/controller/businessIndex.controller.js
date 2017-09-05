$(function () {
  'use strict';
  angular.module('xtui').controller("businessIndexController", businessIndexController);
  //依赖注入
  businessIndexController.$inject = ['$scope', '$timeout', '$ionicScrollDelegate', '$stateParams', "UtilService", "SqliteUtilService", "BusinessIndexService", "ConfigService", "MsgService", "$ionicSlideBoxDelegate", "$state", "$ionicHistory", "$rootScope"];
  function businessIndexController($scope, $timeout, $ionicScrollDelegate, $stateParams, UtilService, SqliteUtilService, BusinessIndexService, ConfigService, MsgService, $ionicSlideBoxDelegate, $state, $ionicHistory, $rootScope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      if (UtilService.goStatus[$state.current.name] != undefined) {
        $scope.getMaterialList();
        $scope.getBusiness();
        delete UtilService.goStatus[$state.current.name];
      }
    });
    $scope.businessscroll = $ionicScrollDelegate.$getByHandle('Scroll1');
    var merchantid = $stateParams.merchantid;
    var conditions = "merchantid = '" + merchantid + "'";
    $scope.showcpc_tasklist = false;//默认隐藏其他cpc任务
    $scope.showcpv_tasklist = false;//默认隐藏其他cpc任务
    $scope.show_materiallist = false;//默认隐藏其他素材
    $scope.cpc_tasklistshowlength = 2;//默认显示2条cpc任务
    $scope.cpv_tasklistshowlength = 2;//默认显示2条cpv任务
    $scope.materiallistshowlength = 2;//默认显示2条素材
    $scope.showpic = false;

    //取本地已下载素材
    $scope.getMaterialList = function () {
      SqliteUtilService.selectData("material", null, conditions).then(function (response) {
        $scope.localmateriallist = response;
      }, function () {
      });
    };

    //获取商户信息、任务信息、素材信息
    $scope.getBusiness = function () {
      BusinessIndexService.getBusinessDetailAndList(merchantid).then(function (response) {
        $scope.buserinfo = response.data;
        $scope.cpc_tasklist = response.data.cpc_tasklist;//cpc红包任务
        $scope.cpv_tasklist = response.data.cpv_tasklist;//cpv任务
        $scope.materiallist = response.data.materiallist;//推广素材
        $ionicSlideBoxDelegate.$getByHandle('publicityphoto').update();
        $ionicSlideBoxDelegate.$getByHandle('publicityphoto').loop(true);
        if (angular.isDefined($scope.cpc_tasklist) && $scope.cpc_tasklist.length > 2) {
          $scope.cpc_tasklistshowlength = 2;//默认显示2条cpc任务
          $scope.showcpc_tasklist = true;
        } else {
          $scope.showcpc_tasklist = false;
        }
        if (angular.isDefined($scope.cpv_tasklist) && $scope.cpv_tasklist.length > 2) {
          $scope.cpv_tasklistshowlength = 2;//默认显示2条cpv任务
          $scope.showcpv_tasklist = true;
        } else {
          $scope.showcpv_tasklist = false;
        }
        if (angular.isDefined($scope.materiallist) && $scope.materiallist.length > 2) {
          $scope.materiallistshowlength = 2;//默认显示2条条素材
          $scope.show_materiallist = true;
        } else {
          $scope.show_materiallist = false;
        }
        //商户有素材，且本地有已下载的素材，进行匹配，获取对应本地下载素材
        if ((angular.isDefined($scope.materiallist) && $scope.materiallist.length > 0) && (angular.isDefined($scope.localmateriallist) && $scope.localmateriallist.length > 0)) {
          angular.forEach($scope.materiallist, function (material, index) {
            angular.forEach($scope.localmateriallist, function (localmaterial, locindex) {
              if (angular.equals(material.id, localmaterial.id)) {
                $scope.materiallist[index].isdowload = $scope.localmateriallist[locindex].isdowload;//是否下载
                $scope.materiallist[index].fileurl = $scope.localmateriallist[locindex].fileurl;//本地文件地址
              }
            });
          });
        }
        //本地与线上素材库匹配完成后，同步更新本地至最新
        $scope.localmateriallist = angular.copy($scope.materiallist);
      }, function () {
        UtilService.showMess("网络不给力，请稍后重试");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    //关注、取消关注商户
    var concernflg = 0;
    $scope.concernBusiness = function (flg) {
      if(concernflg != 0){
        return;
      }
      concernflg = 1;
      BusinessIndexService.concernBusiness(merchantid).then(function (response) {
        if (response.status == '000000') {
          if (response.data.msg == "0") {
            createTemporaryChat(flg);
            if (flg == 'con') {
              $timeout(function () {
                UtilService.showMess("关注成功！");
              }, 100);
            }
          } else {
            UtilService.showMess("取消关注成功！");
            BusinessIndexService.delFriend(merchantid).then(function (response) {
              if (response.status == '000000') {
                MsgService.deleteChatfirst(response.data);
              }
            }, function () {
            });
            $scope.buserinfo.isconcern = 0;
            if ($ionicHistory.backView().stateName == "msgdetail") {
              $rootScope.concern = 0;
            }
          }
        } else {
          UtilService.showMess(response.msg);
        }
        $timeout(function () {
          concernflg = 0;
        },2000)
      }, function () {
        UtilService.showMess("网络不给力，请稍后重试");
        concernflg = 0;
      });
    };

    //关注商家，建立会话
    var createTemporaryChat = function (flg) {
      MsgService.createTemporaryChat(merchantid).then(function (data) {
        if (data.status == "000000") {
          if (flg != 'con') {
            $scope.go('msgdetail', {
              'imgroupid': data.data.imgroupid,
              'otheruserid': merchantid,
              'otherusername': $scope.buserinfo.companyalias,
              'istmp': data.data.istmp,
              'avate': $scope.buserinfo.clogopath
            });
          }
        } else {
          UtilService.showMess(data.msg);
        }
      }, function () {
        UtilService.showMess("网络不给力，请稍后重试");
      });
      $timeout(function () {
        $scope.buserinfo.isconcern = 1;
      }, 500);
    };

    $scope.goBackView = function () {
      if ($rootScope.concern == 0) {
        $scope.go("tab.msg");
        $rootScope.concern = 1;
      } else {
        $scope.goback();
      }
    };

    //进入商家简介页
    $scope.goBusinessIntroduction = function () {
      $scope.go("busdetail", {
        introduction: $scope.buserinfo.introduction,
        companyalias: $scope.buserinfo.companyalias
      });
    };

    //打开第三方网址
    $scope.openWapUrl = function (url) {
      if(angular.isDefined(url)){
        window.open(url, '_system', 'location=yes');
      }
    };

    //拨打电话
    $scope.openTel = function () {
      window.open("tel:" + $scope.buserinfo.btel);
    };

    //cpc任务详情
    $scope.goCpcDetail = function (task) {
      if (BusinessIndexService.readedarr.indexOf(task.id) < 0)
        BusinessIndexService.readedarr.push(task.id);
      if(task.incometype==1){
        $scope.go('cpccoudetail',{'taskid': task.id});
      }else {
        $scope.go('taskdetail', {taskid: task.id});
      }
    };

    //cpv任务详情
    $scope.goCpvDetail = function (task) {
      $scope.go('cpvdetail', {taskid: task.id})
    };

    $scope.checkReaded = function (id) {
      var list = BusinessIndexService.readedarr;
      return list.indexOf(id) >= 0;
    };

    //显示剩余cpc任务
    $scope.getMoreCpcTaskList = function () {
      $scope.cpc_tasklistshowlength = 20;
      $scope.showcpc_tasklist = false;
    };

    //显示剩余cpv任务
    $scope.getMoreCpvTaskList = function () {
      $scope.cpv_tasklistshowlength = 20;
      $scope.showcpv_tasklist = false;
    };

    //显示剩余素材
    $scope.getMoreMaterialList = function () {
      $scope.materiallistshowlength = 20;//默认显示2条条素材
      $scope.show_materiallist = false;
    };

    //咨询商户
    $scope.consultBusiness = function () {
      if ($scope.buserinfo.isconcern == 0) {
        $scope.concernBusiness();
      } else {
        createTemporaryChat();
      }
    };

    //隐藏图片
    $scope.hidePic = function () {
      $scope.showpic = false;
    };

    //打开素材（未下载则先下载，已下载则打开本地文件）
    $scope.openMaterial = function (material, index) {
      if (material.isdowload == 1) {
        if ((material.type == 4 || material.type === 5) && device.platform != "Android") {
          $scope.imageurl = material.url;
          $scope.showpic = true;
          /*ios图片放大位置变大*/
          $timeout(function(){
            var bpic = $('.big-pic');
            var a = bpic.height()/bpic.width();
            var sh =640*window.screen.height/window.screen.width;
            if(a<window.screen.height/window.screen.width){
              bpic.css('margin-top',sh/2-bpic.height()/2+'px');
            }else{
              bpic.css('margin-left',640/2-bpic.width()/2+'px')
            }
            bpic.css("opacity",1);
          },50);
          return;
        }
        readFile(material.fileurl, material.type, index);
      } else {
        $scope.materiallist[index].dowloading = 1;//下载中
        downloadFile(material, index);
      }
    };

    //初始化fileMIMEType类型
    var fileMIMEType = [
      "text/plain",//txt
      "application/vnd.ms-powerpoint",//ppt
      "application/msword",//doc
      "application/vnd.ms-excel",//xls
      "image/png",//png
      "image/jpeg",//jpg
      "application/pdf"//pdf
    ];

    //打开素材
    var readFile = function (fileEntry, filetype, index) {
      cordova.plugins.fileOpener2.open(
        fileEntry,
        fileMIMEType[filetype],
        {
          error: function (e) {
            UtilService.log('Error status: ' + e.status + ' - Error message: ' + e.message);
            if (e.status == 9) {
              //取本地素材信息，发现文件不存在，清除已下载素材信息
              $scope.materiallist[index].isdowload = 0;
              SqliteUtilService.insertDataOfList($scope.materiallist, "material", null, conditions);
              $scope.localmateriallist[index].isdowload = 0;
              UtilService.showMess('文件已被删除，请重新下载！');
            }
          },
          success: function (e) {
            if (e.message == "noapp") {
              UtilService.showMess('未安装相关应用！');
            }
          }
        }
      );
    };

    //下载素材
    var downloadFile = function (material, index) {
      var fileTransfer = new FileTransfer();
      var formaturl;
      //不同平台不同路径
      var fileURL;
      if (device.platform != "Android") {
        formaturl = cordova.file.documentsDirectory;
        //获取文件夹后缀名（ios中文，特殊字符有问题，使用id做文件名）
        var fileExtension = material.name.substring(material.name.lastIndexOf('.') + 1);
        fileURL = formaturl + material.id + "." +fileExtension;
      } else {
        formaturl = cordova.file.externalRootDirectory + "xtui/files/";
        fileURL = formaturl + material.name;
      }
      var uri = encodeURI(ConfigService.picserver + material.url);
      fileTransfer.download(
        uri,
        fileURL,
        function (entry) {
          //页面素材库同步更新最新下载信息
          $scope.materiallist[index].isdowload = 1;//是否下载
          $scope.materiallist[index].dowloading = 0;
          $scope.materiallist[index].fileurl = decodeURI(entry.nativeURL);//本地文件地址
          SqliteUtilService.insertDataOfList($scope.materiallist, "material", null, conditions);
          if (material.type == 4 || material.type === 5) {
            //图片保存（IOS）
            if (device.platform != "Android") {
              fileTransfer.saveimageios(entry.toURL(), function (entry) {
              }, function (error) {
              });
            }
            $timeout(function () {
              UtilService.showMess("图片下载成功！");
            }, 50);
          } else {
            $timeout(function () {
              UtilService.showMess("文件下载成功！");
            }, 50);
          }
          //本地素材库同样设置最新下载数据
          $scope.localmateriallist[index].isdowload = 1;//是否下载
          $scope.localmateriallist[index].dowloading = 0;
          $scope.localmateriallist[index].fileurl = decodeURI(entry.nativeURL);//本地文件地址
        },
        function () {
          $scope.materiallist[index].dowloading = 0;
        }, null, {}
      );
    };

  }
}());
