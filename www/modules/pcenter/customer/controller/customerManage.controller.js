//我的客户管理3.0
angular.module('xtui')
  .controller("customerManageController", function ($scope, $state, $stateParams, UtilService, ConfigService, UserService,$ionicScrollDelegate, $ionicHistory, CustomerService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      if ($ionicHistory.forwardView() == null ||
        ($ionicHistory.forwardView().stateName.indexOf("customerdetail")==-1&& $ionicHistory.forwardView().stateName != "customersubmit")) {
        $scope.initHeads();
        $scope.doRefresh();
      }
    });

    $scope.initHeads = function(){
      $scope.businessname='全部商家';
      $scope.statename='全部状态';
      $scope.listinfo=[
        {'state':0,'name':'全部商家','value':'','ischose':true},
        {'state':1,'name':'全部状态','value':'','ischose':true},
        {'state':1,'name':'未提交','value':0,'ischose':false},
        {'state':1,'name':'已提交','value':1,'ischose':false},
        {'state':1,'name':'已处理','value':2,'ischose':false},
        {'state':1,'name':'已结束','value':3,'ischose':false}];
      CustomerService.getMyMerchantList().then(function(res){
        angular.forEach(res.data,function(data){
          var newdata ={};
          newdata.state = 0;
          newdata.name = data.alias;
          newdata.value = data.id;
          newdata.ischose = false;
          $scope.listinfo.push(newdata);
        })
      },function(){});
    };

    $scope.currentParams = {merchantid:"",status:""};
    $scope.selectfun=function(info,e){
      $(e.target).parent().find("li").removeClass('active');
      $(e.target).addClass('active');
      for(var i=0;i< $scope.listinfo.length;i++){
        if($scope.listinfo[i].state==info.state){
          $scope.listinfo[i].ischose=false;
        }
      }
      var needRefresh=false;
      if(info.state==0){
        needRefresh = ($scope.currentParams.merchantid !== info.value);
        $scope.currentParams.merchantid = info.value;
        $scope.businessname=info.name;
      }else{
        needRefresh = ($scope.currentParams.status !== info.value);
        $scope.currentParams.status = info.value;
        $scope.statename=info.name;
      }
      info.ischose=true;
      if(needRefresh){
        $ionicScrollDelegate.scrollTop(true);
        $scope.doRefresh();
      }
    };

    //状态选择的方法
    $scope.showchose='none';
    $scope.showinfo=false;
    $scope.selectBusup=false;
    $scope.selectstateup=false;
    $scope.showchoseinfo=function(e){
      $('.customerhead li').removeClass('active');
      var dom = $(e.target);
      var parent ;
      if(dom.attr("class")=="tipa"){
        parent = dom.parent();
      }else if(e.target.tagName=="LI"){
        parent = dom;
      }else{
        parent = dom.parent().parent();
      }
      var info = parent.index();
      parent.addClass('active');
      //检测是否为当前选项卡展开的状态
      UtilService.tongji("customer",info);
      var iscurrent = (info==1&&$scope.showinfo)||(info==0&&(!$scope.showinfo));
      if(info==0){
        $scope.showinfo=false;
        $scope.selectstateup=false;
        $scope.selectBusup=!$scope.selectBusup;
      }else{
        $scope.showinfo=true;
        $scope.selectBusup=false;
        $scope.selectstateup=!$scope.selectstateup;
      }
      if($scope.showchose=='block'&&iscurrent){
        $scope.showchose='none';
      }else{
        $scope.showchose='block';
      }
    };
    $scope.hidechoseinfo=function(){
      $scope.showchose='none';
      $scope.showinfo=false;
      $scope.selectBusup=false;
      $scope.selectstateup=false;
    };
    $scope.leadslist = [];
    //重置数据
    var ResetData = function () {
      CustomerService.resetData();
    };

    /**
     * 更新我的leads
     */
    $scope.hasNextPage = $scope.hasNextPageLoad = false;
    $scope.showloading = false;
    $scope.doRefresh = function () {
      $scope.showloading = true;
      $scope.nonetask = false;
      ResetData();
      CustomerService.refresh($scope.currentParams).then(function (response) {
          if (response.status == '000000') {
            $scope.nonenet = false;
            $scope.leadslist = response.data;
            $scope.hasNextPageLoad = $scope.hasNextPage = CustomerService.hasNextPage();
            $scope.nonetask = $scope.leadslist.length == 0;
          } else {
            $scope.hasNextPage = false;
          }
          $scope.showloading = false;
          $scope.$broadcast('scroll.refreshComplete');
        }, function () {
          if ($scope.leadslist == "" || $scope.leadslist.length == 0 || angular.isUndefined($scope.leadslist)) {
            $scope.nonenet = true;
          }
          $scope.hasNextPage = false;
          $scope.showloading = false;
          UtilService.showMess("网络不给力，请稍后刷新！");
        }
      );
    };
    $scope.loadMore = function () {
      CustomerService.pagination($scope.currentParams).then(function (response) {
          if (response.status == '000000') {
            $scope.nonenet = false;
            var templist = response.data;
            $scope.leadslist = $scope.leadslist.concat(templist);
            $scope.hasNextPage = $scope.hasNextPageLoad = CustomerService.hasNextPage();
          } else {
            $scope.hasNextPage = $scope.hasNextPageLoad = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function () {
          if ($scope.leadslist == "" || $scope.leadslist.length == 0 || angular.isUndefined($scope.leadslist)) {
            $scope.nonenet = true;
          }
          $scope.hasNextPage = $scope.hasNextPageLoad = false;
          UtilService.showMess("网络不给力，请稍后刷新！");
        }
      );
    };

    /**
     * 判断状态跳转不同的详情页面
     * @param leads leads对象
     */
    $scope.gotoDetail = function (leads) {
      if (leads.status == 0) {
        $state.go("customerdetail", {"leads": leads});
      } else if (leads.status == 1) {
        $state.go("customerdetail2", {"leads": leads});
      } else if (leads.status == 2) {
        $state.go("customerdetail3", {"leads": leads});
      } else if (leads.status == 3) {
        $state.go("customerdetail4", {"leads": leads});
      }
    };


    $scope.mygoback = function () {
      if (cordova.plugins.Keyboard.isVisible) {
        cordova.plugins.Keyboard.close();
      } else {
        var bv = $ionicHistory.backView().stateName;
        if (bv == "addcustomer"||bv == "customerdetail"){
          var cfrom = CustomerService.getCustomerfrom();
          if(cfrom == "home"){
            $scope.go("tab.home");
          }else if (cfrom == "pcenter"){
            $scope.go("tab.pcenter");
          }
        }else{
          $ionicHistory.goBack();
        }
      }
    };

    $scope.customersubmit = function () {
      $scope.hidechoseinfo();
      CustomerService.calSalersCount().then(function (data) {
        if (data.data > 0) {
          $scope.go("customersubmit");
        } else {
          UtilService.showMess("您还未成为云销售，请到感兴趣的商家下申请");
        }
      }, function (data) {
      })
    };
    UtilService.customevent("customer", "客户管理");
  });









