angular.module('xtui')
  //群列表页面controller
  .controller('groupchatController',function($scope,$timeout,$ionicPopup,$state,MsgService,$ionicHistory) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.startfun();
      init();
    });
    $scope.mygoback = function () {
      if (cordova.plugins.Keyboard.isVisible) {
        cordova.plugins.Keyboard.close();
      } else {
        var bv = $ionicHistory.backView().stateName;
        if (bv == "groupmessage"){
            $scope.go("tab.msg");
        }else{
          $ionicHistory.goBack();
        }
      }

    };
    var init = function() {
      queryGroup();
    };

    var queryGroup = function() {
      MsgService.queryContacts({contactType:1}).then(function(data){
        if(data.status == "000000") {
          $scope.qunlist = data.data.qun;
          /*
          $scope.qunlist = [
            {
              groupid:"",
              groupname:"一号群",
              avate:["/upload/usr/avate/20151120/1447513868351.jpg","/upload/usr/avate/20151208/1449042559977.jpg","/upload/user/avater/20150819/QT2y.jpg"]
            },
            {
              groupid:"",
              groupname:"二号群",
              avate:["/upload/usr/avate/20151120/1447513868351.jpg","/upload/usr/avate/20151208/1449042559977.jpg","/upload/user/avater/20150819/QT2y.jpg","/upload/usr/avate/20151120/1447513868351.jpg","/upload/usr/avate/20151208/1449042559977.jpg","/upload/user/avater/20150819/QT2y.jpg"]
            },
            {
              groupid:"",
              groupname:"三号群",
              avate:["/upload/usr/avate/20151120/1447513868351.jpg","/upload/usr/avate/20151208/1449042559977.jpg","/upload/user/avater/20150819/QT2y.jpg","/upload/usr/avate/20151120/1447513868351.jpg","/upload/usr/avate/20151208/1449042559977.jpg","/upload/user/avater/20150819/QT2y.jpg","/upload/usr/avate/20151120/1447513868351.jpg"]
            }
          ];
          */
        } else {

        }
      }, function(){});
    };

  })
