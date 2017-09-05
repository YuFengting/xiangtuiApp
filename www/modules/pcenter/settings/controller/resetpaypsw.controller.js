/**
 * Created by Administrator on 2016/9/2.
 */
$(function () {
  'use strict';

  angular.module('xtui').controller('resetpaypswcontroller', resetpaypswcontroller);

  resetpaypswcontroller.$inject=["$scope","$timeout","$ionicScrollDelegate","$ionicPopup"];
  function resetpaypswcontroller($scope,$timeout,$ionicScrollDelegate,$ionicPopup){
    var vm = this;
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    //弹窗
    // 忘记密码弹窗
    $scope.fogetpaypopupopen = function() {
      var fogetpaypopup = $ionicPopup.show({
        title: '忘记密码，请联系<br />客服电话：<span class="coler007a">400-0505-811</span>',
        scope: $scope,
        buttons: [
          {
            text: '<span style="color: #ff3b30">取消</span>',
            type:'button-positive'
          },
          { text: '<span style="color: #007aff">联系客服</span>',
            type: 'button-go',
            onTap:function(e){

            }
          }
        ]
      });
    };

  }

}())
