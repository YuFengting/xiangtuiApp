angular.module('xtui')
//分享-选择联系人
  .controller('shareController', function ($scope, UserService, StorageService, UtilService, ConfigService, $timeout, $ionicPopup, $stateParams, $rootScope, IMSqliteUtilService) {

    var kbOpen = false;

    function onKbOpen(e) {
      kbOpen = true;
      if (device.platform != "Android") {
        $scope.sharepopupStyle = {'top': '14%'};
      } else {
        $scope.sharepopupStyle = {'top': '20%'};
      }
    }

    function onKbClose(e) {
      kbOpen = false;
      if (device.platform != "Android") {
        $scope.sharepopupStyle = {'top': '30%'};
      } else {
        $scope.sharepopupStyle = {'top': '30%'};
      }
    }

    $scope.$on('$ionicView.unloaded', function () {
      window.removeEventListener('native.keyboardshow', onKbOpen);
      window.removeEventListener('native.keyboardhide', onKbClose);
    });

    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      window.addEventListener('native.keyboardshow', onKbOpen);
      window.addEventListener('native.keyboardhide', onKbClose);

      if (!UtilService.idDefine($rootScope.checkedList)) {
        $rootScope.checkedList = [];
      }
      if (UtilService.idDefine($scope.contactlist)) {
        for (var i = 0; i < $scope.contactlist.length; i++) {
          var j = 0;
          for (var k = 0; k < $rootScope.checkedList.length; k++) {
            if ($rootScope.checkedList[k].sec_id == $scope.contactlist[i].sec_id) {
              j++;
            }
          }
          if (j > 0) {
            $scope.contactlist[i].ischecked = true;
          } else {
            $scope.contactlist[i].ischecked = false;
          }
        }
      } else {
        $scope.contactlist = [];
      }
    });

    $scope.user = UserService.user;
    var shareid = $stateParams.shareid;//参数shareid包含任务id、商家id、美文/优惠券/H5/团购id
    $scope.isbuser = $stateParams.isbuser;//当前分享是否是商家
    $scope.name = $stateParams.name;
    var type = $stateParams.type;
    $scope.msg = {'friendmsg': ""};
    $scope.taskshare = false;

    var selectAlert = function () {
      $ionicPopup.alert({
        title: '最多只能选择6个聊天',
        buttons: [
          {text: '我知道了'}
        ]
      });
    };

    var getLatelyCon = function () {
      var params = {
        mod: 'IM',
        func: 'queryChatListS',
        userid: $scope.user.id,
        data: {msgtype: '3'}
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if ($scope.isbuser == '1') {
          angular.forEach(data.data.chatList, function (value) {
            if (value.bgroup === 0 || value.otherusertype === 0) {
              $scope.contactlist.push(value);
            }
          })
        } else {
          $scope.contactlist = data.data.chatList;
        }
      })
    };

    var recerlist = [];
    var getLatelyContacts = function () {
      // StorageService.getItem("chatfirst").then(function (obj) {
      IMSqliteUtilService.selectImData("select * from chatfirst order by exactlytime desc").then(function(obj){
        if (angular.isUndefined(obj)) {
          getLatelyCon();
          return;
        }
        if ($scope.isbuser == '1') {
          angular.forEach(obj, function (value) {
            if(value && value.imgrouptype == 1) {
                value.avate = angular.fromJson(value.avate);
            }
            if (value.msgtype === "0" && (value.bgroup === 0 || value.otherusertype === 0)) {
              $scope.contactlist.push(value);
            }
          })
        } else {
          angular.forEach(obj, function (value) {
            if(value && value.imgrouptype == 1) {
              value.avate = angular.fromJson(value.avate);
            }
            if (value.msgtype === "0") {
              $scope.contactlist.push(value);
            }
          })
        }
      }, function () {
        getLatelyCon();
      });
    };
    getLatelyContacts();
    $scope.searchresult = false;
    $scope.checkresult = function () {
      $timeout(function () {
        var searchNum = $('.selectContact').find('.item').length;
        if (searchNum == 0) {
          $scope.searchresult = true;
        } else {
          $scope.searchresult = false;
        }
      }, 0)
    };

    //选择最近联系人
    $scope.checkmember = function (contact, index) {
      //选择不大于6个
      if (!contact.ischecked) {
        if ($rootScope.checkedList.length >= 6) {
          selectAlert();
          return;
        }
      }
      for (var k = 0; k < $scope.contactlist.length; k++) {
        if ($scope.contactlist[k].sec_id == contact.sec_id) {
          if (!contact.ischecked) {
            $scope.contactlist[k].ischecked = true;
            contact.isqun = contact.imgrouptype;
            $rootScope.checkedList.push(contact);
          } else {
            for (var i = 0; i < $rootScope.checkedList.length; i++) {
              if ($rootScope.checkedList[i].sec_id == contact.sec_id) {
                $rootScope.checkedList.splice(i, 1);
              }
            }
            $scope.contactlist[k].ischecked = false;
          }
        }
      }
    };

    $scope.ShareTaskOrBuser = function () {
      $scope.taskshare = false;
      var params = {
        mod: 'IM',
        func: 'ShareTaskOrBuser',
        userid: $scope.user.id,
        data: {
          'content': shareid,
          'contenttype': type,
          'recerlist': recerlist,
          'othercontenet': $scope.msg.friendmsg
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          UtilService.showMess("分享成功！");
          $rootScope.checkedList = [];
          $timeout(function () {
            $scope.goback();
          }, 1000)
        }
      }).error(function () {})
    };

    var datas = {};
    $scope.defaultShare = function () {
      recerlist = [];
      for (var i = 0; i < $rootScope.checkedList.length; i++) {
        datas = {};
        datas.sec_id = $rootScope.checkedList[i].sec_id;
        if ($rootScope.checkedList[i].isqun) {
          datas.isqun = 1;
        } else {
          datas.isqun = 0;
        }
        recerlist.push(datas);
      }
      $scope.taskshare = true;
    };

    $scope.cancelShare = function () {
      $scope.taskshare = false;
    }

  })

  //分享-选择手机联系人
  .controller('selectPhoneController', function ($ionicPopup, $scope, $timeout, $ionicScrollDelegate, $ionicModal, UserService, UtilService, ConfigService, $stateParams, $rootScope) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });

    $scope.user = UserService.user;
    $scope.isbuser2 = $stateParams.isbuser == '1' ? false : true;//当前分享是否是商家false:是  true:不是
    $scope.nonecontactlist = false;
    var copyCheckedList = [];
    if (UtilService.idDefine($rootScope.checkedList)) {
      copyCheckedList = angular.copy($rootScope.checkedList);
    }
    //获取通讯录列表
    var queryContact = function () {
      var params = {
        mod: 'IM',
        func: 'queryContacts',
        userid: UserService.user.id
      };

      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        $scope.contactlist = data.data;
        if ($scope.isbuser2) {
          if ($scope.contactlist.busers.length == 0 && $scope.contactlist.susers.length == 0) {
            $scope.nonecontactlist = true;
          } else {
            $scope.nonecontactlist = false;
          }
        } else {
          if ($scope.contactlist.susers.length == 0) {
            $scope.nonecontactlist = true;
          } else {
            $scope.nonecontactlist = false;
          }
        }
        for (var k = 0; k < $rootScope.checkedList.length; k++) {
          for (var i = 0; i < $scope.contactlist.busers.length; i++) {
            for (var j = 0; j < $scope.contactlist.busers[i].array.length; j++) {
              if ($scope.contactlist.busers[i].array[j].sec_id == $rootScope.checkedList[k].sec_id) {
                $scope.contactlist.busers[i].array[j].ischecked = !$scope.contactlist.busers[i].array[j].ischecked;
              }
            }
          }
          for (var i = 0; i < $scope.contactlist.susers.length; i++) {
            for (var j = 0; j < $scope.contactlist.susers[i].array.length; j++) {
              if ($scope.contactlist.susers[i].array[j].sec_id == $rootScope.checkedList[k].sec_id) {
                $scope.contactlist.susers[i].array[j].ischecked = !$scope.contactlist.susers[i].array[j].ischecked;
              }
            }
          }
        }
        if ($scope.contactlist && $scope.contactlist.susers) {
          $scope.azlist = [];
          angular.forEach($scope.contactlist.susers, function (value) {
            $scope.azlist.push(value.name_pinyin);
          });
        }
      }).error(function () {
        $scope.nonecontactlist = true;
        UtilService.showMess("网络不给力，请稍后重试");
      })
    };
    queryContact();

    //排序拖拽
    $scope.az2 = function (e) {
      var items = parseInt((e.gesture.touches[0].pageY - 300) / 24);
      var lista = $scope.azlist;
      var topi = document.getElementById(lista[items]).offsetTop;
      $ionicScrollDelegate.$getByHandle('selectfriendscroll').scrollTo(0, topi, false);
    };

    //通讯录列表选择
    $scope.selectFriend = function (user, type) {
      //选择不大于6个
      if (!user.ischecked) {
        if ($rootScope.checkedList.length >= 6) {
          selectAlert();
          return;
        }
      }
      if (type == 'buser') {
        for (var i = 0; i < $scope.contactlist.busers.length; i++) {
          for (var j = 0; j < $scope.contactlist.busers[i].array.length; j++) {
            if ($scope.contactlist.busers[i].array[j].userid == user.userid) {
              $scope.contactlist.busers[i].array[j].ischecked = !$scope.contactlist.busers[i].array[j].ischecked;
              if ($scope.contactlist.busers[i].array[j].ischecked) {
                var l = 0;
                for (var k = 0; k < $rootScope.checkedList.length; k++) {
                  if ($rootScope.checkedList[k].sec_id == user.sec_id) {
                    l++;
                  }
                }
                if (l == 0) {
                  $rootScope.checkedList.push(user);
                }
              } else {
                for (var k = 0; k < $rootScope.checkedList.length; k++) {
                  if ($rootScope.checkedList[k].sec_id == user.sec_id) {
                    $rootScope.checkedList.splice(k, 1);
                  }
                }
              }
            }
          }
        }
      } else {
        for (var i = 0; i < $scope.contactlist.susers.length; i++) {
          for (var j = 0; j < $scope.contactlist.susers[i].array.length; j++) {
            if ($scope.contactlist.susers[i].array[j].userid == user.userid) {
              $scope.contactlist.susers[i].array[j].ischecked = !$scope.contactlist.susers[i].array[j].ischecked;
              if ($scope.contactlist.susers[i].array[j].ischecked) {
                var l = 0;
                for (var k = 0; k < $rootScope.checkedList.length; k++) {
                  if ($rootScope.checkedList[k].sec_id == user.sec_id) {
                    l++;
                  }
                }
                if (l == 0) {
                  $rootScope.checkedList.push(user);
                }
              } else {
                for (var k = 0; k < $rootScope.checkedList.length; k++) {
                  if ($rootScope.checkedList[k].sec_id == user.sec_id) {
                    $rootScope.checkedList.splice(k, 1);
                  }
                }
              }
            }
          }
        }
      }
    };

    $scope.searchresult2 = false;
    $scope.checkresult2 = function () {
      $timeout(function () {
        var searchNum = $('.selectphonebook').find('.item').length;
        if (searchNum == 0) {
          $scope.searchresult2 = true;
        } else {
          $scope.searchresult2 = false;
        }
      }, 0)
    };

    $scope.backSelectContacts = function () {
      $rootScope.checkedList = angular.copy(copyCheckedList);
      $scope.goback();
    };

    //-------------------------群聊-----------------------------//
    //获取通讯录列表
    var queryGroup = function () {
      var params = {
        mod: 'IM',
        func: 'queryContacts',
        userid: $scope.user.id
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (!$scope.isbuser2) {
          $scope.groupList = [];
          var m = 0;
          angular.forEach(data.data.qun, function (value) {
            if (value.bgroup === 0) {
              $scope.groupList.push(value);
            }
            m++;
          });
          $scope.initgrouplist = angular.copy($scope.groupList);
          for (var i = 0; i < $scope.groupList.length; i++) {
            for (var k = 0; k < $rootScope.checkedList.length; k++) {
              if ($scope.groupList[i].sec_id == $rootScope.checkedList[k].sec_id) {
                $scope.groupList[i].ischecked = true;
              }
            }
          }
        } else {
          $scope.initgrouplist = angular.copy(data.data.qun);
          $scope.groupList = data.data.qun;
          for (var i = 0; i < $scope.groupList.length; i++) {
            for (var k = 0; k < $rootScope.checkedList.length; k++) {
              if ($scope.groupList[i].sec_id == $rootScope.checkedList[k].sec_id) {
                $scope.groupList[i].ischecked = true;
              }
            }
          }
        }
      })
    };

    $ionicModal.fromTemplateUrl('selectGroup.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (grouphtml) {
      $scope.selectgroup = grouphtml;
    });
    var copyCheckedList2 = [];
    $scope.showGroup = function () {
      queryGroup();
      $scope.selectgroup.show();
      $timeout(function () {
        $scope.startfun();
      }, 0);
      $scope.selectmore = false;
      if (UtilService.idDefine($rootScope.checkedList)) {
        copyCheckedList2 = angular.copy($rootScope.checkedList);
      } else {
        copyCheckedList2 = [];
      }
    };
    $scope.hideGroup = function () {
      $scope.selectgroup.hide();
      copyCheckedList = angular.copy($rootScope.checkedList);
    };

    $scope.selectGroup = function (index, qun) {
      if ($scope.selectmore) {
        return;
      }
      //选择不大于6个
      if (!$scope.groupList[index].ischecked) {
        if ($rootScope.checkedList.length >= 6) {
          selectAlert();
          $scope.selectmore = true;
          return;
        }
      }
      $scope.groupList[index].ischecked = !$scope.groupList[index].ischecked;
      if ($scope.groupList[index].ischecked) {
        var l = 0;
        for (var k = 0; k < $rootScope.checkedList.length; k++) {
          if ($rootScope.checkedList[k].sec_id == qun.sec_id) {
            l++;
          }
        }
        if (l == 0) {
          qun.isqun = 1;
          $rootScope.checkedList.push(qun);
        }
      } else {
        for (var k = 0; k < $rootScope.checkedList.length; k++) {
          if ($rootScope.checkedList[k].sec_id == qun.sec_id) {
            $rootScope.checkedList.splice(k, 1);
          }
        }
      }
    };

    $scope.hideGroup2 = function () {
      $scope.selectgroup.hide();
      $timeout(function () {
        $rootScope.checkedList = angular.copy(copyCheckedList2);
        $scope.groupList = $scope.initgrouplist;
        for (var i = 0; i < $scope.groupList.length; i++) {
          for (var k = 0; k < $rootScope.checkedList.length; k++) {
            if ($scope.groupList[i].sec_id == $rootScope.checkedList[k].sec_id) {
              $scope.groupList[i].ischecked = true;
            }
          }
        }
      }, 0)
    };
    var selectAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: '最多只能选择6个聊天',
        buttons: [
          {text: '我知道了'}
        ]
      });
      alertPopup.then(function () {
        $scope.selectmore = false;
      });
    }

  });
