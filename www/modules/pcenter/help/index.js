angular.module('xtui')
  //帮助类型
  .controller("HelpController",function($scope,UtilService,ConfigService,$ionicScrollDelegate,$timeout){

    $scope.picserver = ConfigService.picserver;
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })


    $(".helpBoxList").on("click",".getProblemListShow",function(){
      var findI = $(this).find(".icon");
      var Topinfo = $(this).offset().top-98;
      if(findI.hasClass("icon-xt2-down")){
        $(".getProblemListShow .icon").removeClass("icon-xt-up").addClass("icon-xt2-down");
        $(".getProblemListShow").siblings(".problemListBox").slideUp(200);
        findI.removeClass("icon-xt2-down").addClass("icon-xt-up");
        $(this).siblings(".problemListBox").slideDown(200);
        $timeout(function(){
          $ionicScrollDelegate.$getByHandle('helpScroll').scrollTo(0,Topinfo, true);
        },150)
      }else{
        findI.removeClass("icon-xt-up").addClass("icon-xt2-down");
        findI.parent().siblings(".problemListBox").slideUp(200);
      }
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('helpScroll').resize();

      },0)
    })


    // 获取帮助

    $scope.gethelptype = function(){
     var data = {};
     data.mod = 'nComm';
     data.func = 'getShelptype';
     UtilService.post(ConfigService.server, {'jsonstr':angular.toJson(data)}).success(function (data) {
       if(data.status == '000000'){
         $scope.helptypes =  data.data;
         var num = 3 - (data.data.length%3);
         $scope.mars = [];
         var arr = [];
         if(num == 3){
           num = 0;
         }
         for(var i=0;i<num;i++){
           arr.push(i);
         }
         $scope.mars = arr;
       }else if(data.status != '500004'){
         UtilService.showMess(data.msg);
       }
       $scope.$broadcast('scroll.refreshComplete');
     }).error(function () {
       UtilService.showMess("网络不给力，请稍后刷新");
       $scope.$broadcast('scroll.refreshComplete');
     })
    }
    $scope.gethelptype();
    $scope.goHelpList = function (type) {
     $scope.go('helplist',{'typeid':type.id,'typename':type.name,'typeh':'helplist'});
     UtilService.customevent("help",type.name);
    }

  })
  //帮助详情
  .controller("HelpdetailController",function($scope,$stateParams,ConfigService,$sce){

    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    })
    $("#help_iframe").load(function(){
      $(".loadanimation").hide();
    })
    $scope.pcodeserver =ConfigService.pcodeserver;
    $scope.helpid = $stateParams.helpid;
    $scope.targetUrl = $sce.trustAsResourceUrl($scope.pcodeserver+"shelpDetail?id="+$scope.helpid);


  })
