//已结算
angular.module('xtui')
.controller("customerDetail4Controller", function ($timeout,$scope, $state, $stateParams, UtilService, ConfigService, CustomerService,UserService) {
  $scope.$on("$ionicView.beforeEnter", function () {
    $scope.startfun();
  });
  $scope.leads = $stateParams.leads;
  $scope.haspic = $scope.leads.pics!=null&&$scope.leads.pics.length>0;
  $scope.showpic=false;
  $scope.picgetbig=function(pic,index){
    $scope.showpic=true;
    $scope.showimgIndex =index;
    $timeout(function(){
      var a = $('.big-pic').height()/$('.big-pic').width();
      var sh =640*window.screen.height/window.screen.width;
      if(a<sh/640){
        $('.big-pic').css('margin-top',sh/2-$('.big-pic').height()/2+'px');
      }else{
        $('.big-pic').css('margin-left',640/2-$('.big-pic').width()/2+'px');
      }
      $('.big-pic').css("opacity", "1");
      $('.big-pic').show();

    },50)

  };
  $scope.shrinkPic=function(){
    $('.big-pic').hide();
    $scope.showpic=false;
  };
  $scope.leadsLogList = [];
  $scope.leadsPayList = [];
  $scope.commentstatus = 0;
  $scope.explainstatus = 1;
  $scope.formdata = {};
  var token = "";
  var params = {
    mod:"NComm",
    func:"makeToken",
    userid: UserService.user.id,
    page:{"pageNumber":1,"pageSize":10},
    data:{}
  };
  UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(res){
    token = res.token;
  });
  $scope.textareafocus = function () {
    if (device.platform != "Android") {
      $('.evaluateInforBox').css({'top': '22%'});
    }
  };
  $scope.textareablur = function () {
    if (device.platform != "Android") {
      $('.evaluateInforBox').css({'top': '50%'});
    }
  };
  /**
   * 结算详情的数据获取
   */
  CustomerService.getDealingLeadsDetail($scope.leads.leadsid).then(function (data) {
    $scope.leadsLogList = data.data.leadslog;
    $scope.leadsPayList = data.data.leadsPays;
    $scope.commentstatus = data.data.commentstatus;
    $scope.explainstatus = data.data.explainstatus;
  }, function (data) {

  }).finally(function () {
    $scope.$broadcast('scroll.refreshComplete');
  });

  $scope.responseCancel = function (id, acc) {
    CustomerService.responseCancel(id, acc).then(function (res) {
      if (res.status == "000000") {
        for (var i = 0; i < $scope.leadsPayList.length; i++) {
          if ($scope.leadsPayList[i].id == id) {
            $scope.leadsPayList[i].status = acc == 0 ? 5 : 4;
            break;
          }
        }
      }
    }, function () {
    });
  };
  /*评价弹窗*/
  $scope.getevaluateBox = function () {
    if ($scope.commentstatus == 0) {
      $(".getEvaluateDailog").show();
    } else {
      UtilService.showMess("你已经评价过这条记录");
    }

  };
  $(".getEvaluateDailog").click(function () {
    cordova.plugins.Keyboard.close();
    $(this).hide();
  });
  $(".evaluateInforBox").click(function (e) {
    e.stopPropagation();
  });
  $(".evaluateInforBox .closebtn").click(function () {
    cordova.plugins.Keyboard.close();
    $(".getEvaluateDailog").hide();
  });

  $(".star_yellow , .star_grey").click(function () {
    var that = this;
    var parent = $(that).parent();
    var select = parent.children("i").index($(that));
    parent.children("i").each(function (n, v) {
      if (n <= select) {
        $(v).removeClass("star_grey ").removeClass("star_yellow ").addClass("star_yellow");
      } else {
        $(v).removeClass("star_grey ").removeClass("star_yellow ").addClass("star_grey");
      }
    })
  });

  var getEvaluteData = function () {
    var data = {"comment1": 0, "comment2": 0, "comment3": 0};
    $(".evaluateList li").each(function (n) {
      var value = $(this).children(".star_yellow").length;
      switch (n) {
        case 0:
          data.comment1 = value;
          break;
        case 1:
          data.comment2 = value;
          break;
        case 2:
          data.comment3 = value;
          break;
      }
    });
    return data;
  };
  /**
   * 提交评价
   */
  $scope.subEvaluate = function () {
    if(token=="") return;
    var evaluteData = getEvaluteData();
    $scope.formdata.merchantid = $scope.leads.merchantid;
    $scope.formdata.taskid = $scope.leads.taskid;
    $scope.formdata.workid = $scope.leads.workid;
    $scope.formdata.leadsid = $scope.leads.leadsid;
    $scope.formdata.comment1 = evaluteData.comment1;
    $scope.formdata.comment2 = evaluteData.comment2;
    $scope.formdata.comment3 = evaluteData.comment3;
    CustomerService.leadsComment(token,$scope.formdata).then(function (res) {
      if (res.status == "000000") {
        UtilService.tongji("comment", {leadsid: $scope.leads.leadsid});
        $scope.commentstatus = 1;
        $scope.formdata.detail = "";
        $(".getEvaluateDailog").hide();
        UtilService.showMess("成功提交本次评价");
      }else if (res.status=="130102"){
        UtilService.showMess("已经评价过该条信息");
      }
      else if (res.status=="500004"){
        UtilService.showMess("请不要重复点击提交按钮");
      }
    }, function () {

    });
  };

  $scope.complaint = function () {
    $state.go("complaint", {"leads": $scope.leads});
  }
});
