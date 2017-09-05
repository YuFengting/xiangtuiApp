(function(){
  'use strict';

  angular
    .module("xtui")
    .controller("SearchFriendController", SearchFriendController);

  SearchFriendController.$inject=["$scope","$timeout","UtilService","PhonebookService"];

  function  SearchFriendController($scope,$timeout,UtilService,PhonebookService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })


    $timeout(function(){
      document.getElementById('searchFouse').focus();
    },300);
    $scope.search={key:""};
    $scope.delshow=false;
    $scope.nouser =false;
    $scope.inputChange = function(){
      var key = $scope.search.key;
      if(key.length>0){
        $scope.nouser =false;
        $scope.isSearching=true;
        $scope.delshow=true;
      }else{
        $scope.delshow=false;
        $scope.isSearching=false;
      }
    };
    $scope.userList = [];
    $scope.goSearchList = function(key){
      if(key!=null&&key!=""){
        $scope.nouser =false;
        PhonebookService.getSUserByTelOrNick(key).then(function(res){
          if(res.status=="000000"){
            if(res.data.length>1){
              $scope.userList = res.data;
            }else if(res.data.length==1){
              $scope.go("shome",{suserid:res.data[0].id});
            }else{
              $scope.nouser =true;
            }
          }
        },function(){});
      }else{
        UtilService.showMess("请输入手机号");
      }
    };

    $scope.searchClear = function(e){
      $scope.search.key="";
      $scope.isSearching=false;
      $timeout(function(){
        $(e.target).siblings("form").children("input").focus();
      },500);
    }
    $scope.myfocus = function (e) {
      if($(e.target).val().length>0){
        $scope.delshow=true;
      }
    }
    $scope.myblur = function (e) {
      $scope.delshow=false;
    }

  }
})()
