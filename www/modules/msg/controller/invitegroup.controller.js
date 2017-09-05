(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('InvitegroupController', InvitegroupController);

  InvitegroupController.$inject=["$ionicPopup","$scope","$timeout","$ionicScrollDelegate","$state"];

  function InvitegroupController ($ionicPopup,$scope,$timeout,$ionicScrollDelegate,$state){

    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })
    // 假数据

    $scope.groupmember=[
      {
        'name':'Andy',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'pandy',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true},
      { 'name':'hiufe',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':false},{
        'name':'joew',
        'heqadpic':'img/delete/headtest.jpeg',
        'ifchecked':false,
        'ishost':true}]

    $scope.membernum=$scope.groupmember.length;

  }


})()
