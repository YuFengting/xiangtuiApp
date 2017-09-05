(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('PhonebookController', PhonebookController);

  PhonebookController.$inject = ['$state','$scope','$timeout','$ionicPopup','SearchContactsService','UtilService','BarcodeService','UserService','ConfigService'];

  function PhonebookController($state,$scope,$timeout,$ionicPopup,SearchContactsService,UtilService,BarcodeService,UserService,ConfigService) {
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();

    })

    //隐藏所有面板
    $scope.hidepanel = function () {
      $scope.searchnocontact=false;
      $scope.searchcontactsuser=false;
      $scope.searchcontactbuser=false;
      $scope.searchcontactqun=false;
    }

    $scope.hidepanel();

    $scope.search = {};
    //搜索页获取焦点
    $timeout(function () {
      document.getElementById('searchFouse').focus();
    }, 200);

    $scope.goSearchList = function() {
      $timeout(function () {
        document.getElementById('searchFouse').blur();
      }, 200)
      if ($scope.search.key == "" || angular.isUndefined($scope.search.key) || $scope.search.key == null) {
        UtilService.showMess("请输入搜索关键字！");
        return;
      }
      $scope.searchContacts($scope.search.key);
    };

    var lastKey = "";
    $scope.searchContacts = function (key) {
      $scope.hidepanel();
      SearchContactsService.searchContacts(key).then(function () {
        var result = SearchContactsService.getsearchContacts();
        if(result!=null){
          var tempkey=result.keyword;
          if(tempkey==lastKey){
            $scope.searchcontacts = SearchContactsService.getsearchContacts();
            var susers=$scope.searchcontacts.susers.length;
            var busers=$scope.searchcontacts.busers.length;
            var qun=$scope.searchcontacts.qun.length;
            if(susers==0&&busers==0&&qun==0&&$scope.search.key!=""){
              $scope.searchnocontact=true;
            }
            if(susers>0&&$scope.search.key!=""){
              $scope.searchcontactsuser=true;
              $scope.searchcontactqun=false;
            }
            if(busers>0&&$scope.search.key!=""){
              $scope.searchcontactbuser=true;
              $scope.searchnocontact=false;
            }
            if(qun>0&&$scope.search.key!=""){
              $scope.searchcontactqun=true;
              $scope.searchnocontact=false;
            }
          }
        }else{
          $scope.searchnocontact=true;
        }
      }, function () {
      }).finally(function () {
      });
    }

    var timeoutTask = null;
    $scope.showclose = function () {
      if ($scope.search.key != "") {
        $scope.haskey = true;
        if(timeoutTask != null) {
          $timeout.cancel(timeoutTask);
        }
        timeoutTask = $timeout(function(){
          lastKey = $scope.search.key.replace(/\./g,"");
          $scope.searchContacts(lastKey);
          timeoutTask = null;
        }, 1000);

      } else if ($scope.search.key == "") {
        if(timeoutTask != null) {
          $timeout.cancel(timeoutTask);
          timeoutTask = null;
        }
        $scope.haskey = false;
        $timeout(function(){
          $scope.hidepanel();
        },200);
      }
    }

    //当不存在关键词时，不显示清空按钮
    if ($scope.search.key != null) {
      $scope.haskey = true;
    }

    //点击清空关键词
    $scope.searchClear = function () {
      $scope.hidepanel();
      $scope.search.key = "";
      $timeout(function(){
        document.getElementById('searchFouse').focus();
      },200);

      $scope.haskey = false;
    }

    //删除联系人
    $scope.friendDelete = function(event){
      event.target.parentNode.remove();
    }

    $scope.inviteLoad = function(){
      $('.hit-message').show()
      $timeout(function(){
        $('.hit-message').fadeOut()
      },2000)
    }


    // 通讯录被拒绝访问弹窗
    $scope.phonebookSet = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: '请在iPhone的“设置-隐私-通讯录”选项中，允许享推访问您的通讯录。',
        buttons: [
          { text: '好的' },
          {
            text: '设置'}
        ]
      });
      confirmPopup.then(function(res) {
        if(res) {
        } else {
        }
      });
    };

    //  拖拽
    $scope.toNumber=function(e) {
      var items = parseInt((e.gesture.touches[0].pageY - 300) / 21);
      var lista = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
          'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '#'];
      var topi = document.getElementById(lista[items]).offsetTop;
      $ionicScrollDelegate.$getByHandle('addscroll').scrollTo(0, topi, false);
    };

    //  点击
    $scope.ctoNumber=function(e) {
      var items = parseInt((e.pageY - 300) / 21);
      var lista = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
          'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '#'];
      var topi = document.getElementById(lista[items]).offsetTop;
      $ionicScrollDelegate.$getByHandle('addscroll').scrollTo(0, topi, false);
    }

    $scope.visitPhone = function(){
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      var filter = ["displayName", "addresses","phoneNumbers"];
      navigator.contacts.find(filter,
      function(contacts){
        if(contacts.length>0){
          $scope.go("phonebookfriend");
        }else{
          $scope.go("phonebookRefuse");
        }
      },function (contactError) {
        $scope.go("phonebookRefuse");
      }, options);
    }
    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    }
    $scope.goShare = function(){
      $state.go("share");
    }

    $scope.goBusiness = function(id){
      var params = {
        mod: 'nUser',
        func: 'getBuserByuserid',
        userid: UserService.user.id,
        data: {"merchantid": id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if(data.status == "103006"){
          UtilService.showMess("该商家已下架");
        }else{
          $scope.go('business',{merchantid:id})
        }
      });
    };

    /*扫一扫页面*/
    $scope.goscan = function () {
        BarcodeService.scan({scanType: 0}, function (result) {
            try {
                if (result && result.code == 0) {
                    //扫描得到了结果
                    var qrcode = eval("(" + result.result + ")");
                    if (qrcode.type == 2) {
                        //扫商家
                        $scope.go('business', {merchantid: qrcode.text});
                    } else if (qrcode.type == 1) {
                        //扫s
                        $scope.go('shome', {suserid: qrcode.text});
                    } else {
                        $scope.go('scanfail');
                    }
                }
            } catch (e) {
                $scope.go('scanfail');
            }
        }, function () {
            $scope.go('cantscan');
        });
        UtilService.tongji("Scan");
    };
  }
}());
