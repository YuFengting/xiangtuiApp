/**
 * Created by Administrator on 2016/9/5.
 */
$(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('xtschoolQuestionController', xtschoolQuestionController);

  xtschoolQuestionController.$inject=["$scope","$stateParams","$timeout","UtilService","UserService","$ionicPopup","XtSchoolQuestionService"];
  function xtschoolQuestionController($scope,$stateParams,$timeout,UtilService,UserService,$ionicPopup,XtSchoolQuestionService){
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.xtschool = {question: ""};
    $scope.qtype=$stateParams.type;

    $scope.commitask = function(index,contenttype) {
      var dd = $scope.xtschool.question.trim();
      if(dd.length==0){
        UtilService.showMess("输入的问题不能为空！");
        return;
      }
      if(dd.length>80){
        UtilService.showMess("输入的问题不能超过80字！");
        return;
      }
      $scope.commitquestion(dd);
    };

    $scope.gobacktohome = function(){
      var dd = $scope.xtschool.question.trim();
      if(dd.length>0){
        var confirmPopup = $ionicPopup.confirm({
          title: '是否需要提交这个问题？', // String. 弹窗标题。
          cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
          cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
          okText: '确认', // String (默认: 'OK')。OK按钮的文字。
          okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

        });
        confirmPopup.then(function(res) {
          if(res){
            $scope.commitquestion(dd);
          }else{
            $scope.goback();
          }
        });
      }else{
        $scope.goback();
      }
    };

    //提问提交
    var commitflag=0;
    $scope.commitquestion = function(str){
      if(commitflag==1){
        UtilService.showMess("请不要重复提交！");
        return;
      };
      commitflag=1;
      $timeout(function(){
        commitflag=0;
      },3000);
      XtSchoolQuestionService.addXtSchoolQ(str,$scope.qtype).then(function(response){
        if(response.status=="000000"){
          UtilService.showMess("提交成功！");
          UserService.xtschoolflg = true;
          $scope.goback();
        }else{
          UtilService.showMess(response.msg);
        }
      }).finally(function(){
      });
    };


  }
}())
