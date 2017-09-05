(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('GroupmemberController', GroupmemberController);

  GroupmemberController.$inject=["UserService","$scope","$state","$stateParams","MsgService"];

  function GroupmemberController(UserService,$scope,$state,$stateParams,MsgService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
      init();
    })

    var init = function() {
      var imgroupid = $stateParams.imgroupid;
      if(imgroupid){
        MsgService.queryGroupInfo(imgroupid).then(function(data){
          $scope.groupinfo = data.data;
          $scope.isCreator = data.data.creator == UserService.user.id;
        }, function(){});
      }
    };
    $scope.goAddmoremember = function(){
      var groupmemberids =[];

      angular.forEach($scope.groupinfo.members,function(value){
        groupmemberids.push(value.userid);
      });
      $state.go('addmoremember',{imgroupid:$stateParams.imgroupid,groupmemberids:groupmemberids});
    }
    $scope.gotoDetail = function(groupmember){
      if(groupmember.usertype==0){
        $scope.go("shome",{suserid:groupmember.userid});
      }else if(groupmember.usertype==1){
        var params = {
          mod: 'nUser',
          func: 'getBuserByuserid',
          userid: UserService.user.id,
          data: {"merchantid": groupmember.userid}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
          if(data.status == "103006"){
            UtilService.showMess("该商家已下架");
          }else{
            $scope.go("business",{merchantid:groupmember.userid});
          }
        });


      }
    }
  }

})()
