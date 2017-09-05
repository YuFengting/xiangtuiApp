(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('ChangegroupnameController', ChangegroupnameController);

  ChangegroupnameController.$inject=["$scope","$stateParams","GroupChatService","$ionicHistory","UtilService"];

  function ChangegroupnameController($scope,$stateParams,GroupChatService,$ionicHistory,UtilService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    });
    $scope.form={groupname : $stateParams.groupname};
    $scope.save=function(){
      var name = $scope.form.groupname;
      if(name.length>20){
        UtilService.showMess("群名称长度不能超过20");
      }else{
        GroupChatService.updateChatGroup($stateParams.imgroupid,{name:name}).then(function(data){if(data.status=="000000"){
          $ionicHistory.goBack();
        }},function(){});

      }

    }
  }

})()
