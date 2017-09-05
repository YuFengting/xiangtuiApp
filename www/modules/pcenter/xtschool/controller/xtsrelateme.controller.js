/**
 * Created by Administrator on 2016/9/5.
 */
$(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('xtsrelatemeController', xtsrelatemeController);

  xtsrelatemeController.$inject=["$scope","$sce","XtSchoolRelateService","UtilService"];
  function xtsrelatemeController($scope,$sce,XtSchoolRelateService,UtilService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    });

    $scope.relatemelist=[];
    $scope.hasNextPage=false;
    $scope.hasnorelate=false;

    $scope.getList = function(){
      XtSchoolRelateService.getRelateMe().then(function(response){
        $scope.relatemelist=XtSchoolRelateService.getrelatemelist();
        $scope.hasNextPage=XtSchoolRelateService.hasNextPage();
        if(angular.isUndefined($scope.relatemelist)||$scope.relatemelist.length==0){
          $scope.hasnorelate=true;
        }else{
          var relatemeidlist= [];
          for(var i=0;i<$scope.relatemelist.length;i++){
            if($scope.relatemelist[i].ifread==0){
              relatemeidlist.push($scope.relatemelist[i].id);
            }
          }
          if(relatemeidlist.length>0){
            XtSchoolRelateService.updateRelateMe(relatemeidlist);
          }
        }
        $scope.$broadcast('scroll.refreshComplete');
      },function () {
        $scope.$broadcast('scroll.refreshComplete');
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.getList();

    $scope.getmorerelate=function(){
      XtSchoolRelateService.getMoreRelateMe().then(function(response){
        $scope.relatemelist=XtSchoolRelateService.getrelatemelist();
        $scope.hasNextPage=XtSchoolRelateService.hasNextPage();
        if(angular.isDefined($scope.relatemelist)&&$scope.relatemelist.length!=0){
          var relatemeidlist= [];
          for(var i=0;i<$scope.relatemelist.length;i++){
            if($scope.relatemelist[i].ifread==0){
              relatemeidlist.push($scope.relatemelist[i].id);
            }
          }
          if(relatemeidlist.length>0){
            XtSchoolRelateService.updateRelateMe(relatemeidlist);
          }
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });;
    }

    $scope.goXtSchoolQuestionDetail = function (queid,qstatus) {
      if(qstatus==2){
        UtilService.showMess("该提问已删除！")
      }else{
        $scope.go('xtschooldetail', {qid: queid});
      }
    };

    $scope.convertHtml=function(con){
      return $sce.trustAsHtml(con);
    };

  }
}())
