/**
 * Created by zhm on 2016-3-2.
 */
angular.module('xtui')
  //个人中心
  .controller("PCenterIndexController",function($scope,$rootScope,$stateParams,$ionicActionSheet,$state,UserService,ConfigService,UtilService,$ionicPopup,CustomerService,$ionicHistory,NewHandService,SqliteUtilService,$ionicTabsDelegate,AccountService,XtSchoolService,PcenterIndexService){
      $scope.$on("$ionicView.beforeEnter",function(){
        $scope.startfun();
        try{
          $ionicHistory.clearHistory();
        }catch (e){
        }
      });

      $rootScope.closeNewHandStepTwo = function () {
        $rootScope.step2=false;
        $scope.go("tab.home",{showTaskPointer:1});
      };
      //获取本地数据xgpushflg
      var getData = function () {
        plugins.appPreferences.fetch (function (resultData) {
          var jgflg  =  resultData;
          if(jgflg ==null || jgflg == "" || jgflg == '1'){
            ConfigService.xgpushflg = true;
          }else{
            ConfigService.xgpushflg = false;
          }
        }, function (resultData) {
        }, 'xgpushflg');
      };

      $scope.user = UserService.user;
      $scope.picserver = ConfigService.picserver;
      $scope.hasRedpacket=false;
      $scope.hasCoupon=false;
      $scope.hasRecommend=false;
      var account = [];
      var token ="";
      $scope.infofillflag=false;

      //获取个人中心数据
      var getUser = function(){
        PcenterIndexService.getUser().then(function(response){
          if (response.status == '000000') {
            $scope.user = response.data;
            UserService.user.nick=$scope.user.nick;
            UserService.user.avate=$scope.user.avate;
            //UserService.user.openid=$scope.user.openid;//微信提现账号
            UserService.user.money=$scope.user.money=response.data.money//当前账户金额
            UserService.user.infofillflag=$scope.user.infofillflag=response.data.infocompleteflag;//个人信息完善标志
            UserService.user.redpacketnum=$scope.user.redpacketnum=response.data.redpacketnum;//能拆的红包个数
            UserService.user.couponnum=$scope.user.couponnum=response.data.couponnum;//能使用的优惠券个数
            UserService.user.recommendnum=$scope.user.recommendnum=response.data.recommendnum;//新接收到的客户信息个数
            UserService.withmenum =$scope.withmenum = response.data.withmenum;//与我相关条数

            //是否有红包
            if($scope.user.redpacketnum!=0){
              UserService.hasRedpacket=$scope.hasRedpacket=true;
            }else{
              UserService.hasRedpacket=$scope.hasRedpacket=false;
            }
            //是否有优惠券
            if($scope.user.couponnum!=0){ $scope.hasCoupon=true;}
            //是否有推荐
            if($scope.user.recommendnum!=0){
              UserService.hasRecommend=$scope.hasRecommend=true;
            }else{
              UserService.hasRecommend=$scope.hasRecommend=false;
            }
            //新手引导
            if($stateParams.money){
              $scope.user.money="5.00";
              $(".center_moneynum").text("5.00");
              AccountService.setPcenterMoney($scope.user.money);
            }
            if(AccountService.getPcenterMoney() < 0){
              AccountService.setPcenterMoney($scope.user.money);
            }
          }
        },function () {
          UtilService.showMess("网络不给力，请稍后刷新");
        }).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      //获取系统定义的banner标签
      var getbanner=function(){
       PcenterIndexService.getbanner().then(function(data){
          if(data.status=='000000'){
            $scope.bannerlist= data.data;
            UserService.bannerlist=data.data;
          }
        })
      };

      //提现申请
      $scope.withdraw = function () {
        $rootScope.step7=false;
        if($scope.user.per == 0 ){
          UtilService.showMess("您的账号存在异常，不能执行此项操作，请联系4000505811咨询");
        }else{
            $ionicActionSheet.show({
              buttons: [
                {text: '<span class="withdrawHot">推荐</span>微信提现(无需手续费)'},
                {text: '支付宝提现'},
                {text: '手机充值'}
              ],
              titleText: '<i class="icon icon-xt2-tixian fl"></i><span class="fl">请选择提现方式</span>',
              cancelText: '取消',
              buttonClicked: function (index) {
                PcenterIndexService.getMyAccount().then(function(data){
                  //选择微信提现
                  if (index == 0) {
                    if(data.data.openid == "" || angular.isUndefined(data.data.openid)){
                      $state.go('bindwx');
                    }else{
                      $state.go('wxwithdraw',{'token':data.token});
                    }
                    UtilService.customevent("withdrow","微信提现");
                  }
                  //选择支付宝提现
                  else if (index == 1) {
                    //0：未绑定  1：已绑定
                    if (data.data.isset == 0) {
                      showConfirm();
                    } else {
                      $state.go('alipaywithdraw',{'token':data.token});
                    }
                    UtilService.customevent("withdrow","支付宝提现");
                  }else if(index == 2){
                    $scope.cleargo('recharge');
                    UtilService.customevent("withdrow","手机充值");
                  }
                  return true;
                });
              }
            });
        }
      };

      //未绑定支付宝账号，不可提现
      var showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: '未绑定支付宝账号，不可提现，去个人账户绑定支付宝？',
          //template: "<div class='withdraw-wenzi'> 删除商家将退出您的云销售身份!</div>",
          cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
          cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
          okText: '确定', // String (默认: 'OK')。OK按钮的文字。
          okType: 'button-default' // String (默认: 'button-positive')。OK按钮的类型。
        });
        confirmPopup.then(function(res) {
          if(res) {
            $scope.go('peraccount');
          } else {
          }
        });
      };

      //随机banner跳转
      $scope.skipto= function(banner){
        if(banner.type==1){
          if(banner.appurl.indexOf('xtbrowser') != -1){
            window.open(banner.appurl, '_system', 'location=yes' );
          }else{
            $scope.go('iframe',{iframeurl:banner.appurl,name:banner.name});
          }
        }else{
          UserService.xtschoolflg = true;
          $scope.type = XtSchoolService.setType(0);//0s端  1b端
          if(angular.isUndefined(banner.appparams)||banner.appparams==""){
            if(banner.appurl == "msgsystem"){
              UserService.msgsystemflg = 1;
            }
            $scope.go(banner.appurl);
          }else{
            $scope.go(banner.appurl,angular.fromJson(banner.appparams));
          }
        }
      };

      //下拉刷新
      $scope.loadPage = function(){
        $scope.user = UserService.user;
        $scope.withmenum=UserService.withmenum;
        $scope.bannerlist=UserService.bannerlist;
        $scope.hasRedpacket=UserService.hasRedpacket;
        $scope.hasRecommend=UserService.hasRecommend;
        /*$scope.user.money=UserService.user.money;
        $scope.user.redpacketnum=UserService.user.redpacketnum;
        $scope.user.couponnum=UserService.user.couponnum;
        $scope.user.recommendnum=UserService.user.recommendnum;*/
        //获取本地数据xgpushflg
        getData();
        //获取个人中心数据
        getUser();
        //获取系统定义的banner标签
        getbanner();
      };
      $scope.loadPage();

      //点击头像跳转个人信息页面
      $scope.goinfo = function (){
        $scope.go("info");
        UtilService.customevent("info","info");
      };
      //跳转我的收藏页面
      $scope.goMyCollection = function () {
        $scope.cleargo('mycollection');
        UtilService.customevent("mycollection","mycollection");
      };
      //点击金额跳转至我的账户页面
      $scope.goaccount = function (){
        $scope.go("account");
        UtilService.customevent("account","account");
      };
      $scope.goHelp = function () {
        $scope.go("help");
        UtilService.customevent("help","help");
      };
      //个人中心跳转至设置页面
      $scope.gosetting = function (){
        $rootScope.step7 =false;
        $scope.go("setting");
        UtilService.customevent("setting","setting");
      };
      $scope.shareSDK = function () {
        $scope.go('invite');
        UtilService.customevent("invite","invite");
      };
      //跳转客户管理
      $scope.goCustomer = function(){
        CustomerService.setCustomerfrom("pcenter");
        $scope.cleargo("customer");
      };
      //跳转我的二维码
      $scope.goMycode = function(){
        $scope.go("mycode");
      };
      //跳转我的关注
      $scope.goMyfocus = function(){
        $scope.go("myfocus");
        UserService.focusskipflag="business";
      };
    })
  //外链
  .controller("IframeController",function($scope,$stateParams,$sce,UserService){
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();
    });
    $scope.httpchat=true;
    if($stateParams.name==""){
      $scope.httpchat=false;
    }
    if(!$scope.httpchat){
      $scope.topitem='0px';
    }
    var url = $stateParams.iframeurl;
    if(url.indexOf("?")!=-1){
      $scope.iframeurl = $sce.trustAsResourceUrl(url+"&xtupid="+UserService.user.id);
    }else{
      $scope.iframeurl = $sce.trustAsResourceUrl(url+"?xtupid="+UserService.user.id);
    }

    $scope.name=$stateParams.name;

    var iframe = document.getElementById('iframeBox');
    var iframeLoad = function(){
        var x=document.getElementById("iframeBox");
        var y=(x.contentWindow || x.contentDocument);
        if (y.document)y=y.document;
        y.body.style.width = 640 +"px";
    }
    if(!iframe.addEventListener){
        iframe.attachEvent('onload', iframeLoad)
    }
    iframe.addEventListener('load', iframeLoad, true);

  })
  //扫一扫
  .controller("centerMycodeController",function($scope,$stateParams,$sce, UserService, BarcodeService, UtilService){
    $scope.$on("$ionicView.beforeEnter",function() {
      $scope.startfun();
    });
      $scope.user = UserService.user;
      var content = {
          text : UserService.user.id,
          type : 1
      };
      if(UtilService.idDefine(UserService.user.qrcode)){
          $scope.user.qcodeurl = UserService.user.qrcode;
      }else {
          BarcodeService.generateQcode(content).then(function (data) {
              $scope.user.qcodeurl = data.data;
          }, function () {
              UtilService.showMess("网络不给力，请稍候刷新");
          });
      }

 }).directive("centerUserMoney",function(AccountService, $timeout,UtilService){
    return {
      restrict: 'EA',
      transclude:true,
      scope: {
        userMoney: "="
      },
      link: function ($scope, ele, attr) {
        $scope.$watch("userMoney",function(newValue,oldValue){
          var getAccountVal = AccountService.getPcenterMoney();
          if(newValue != undefined && newValue != getAccountVal){
            var getNum = newValue - getAccountVal;
            var newNum = UtilService.toDecimal2(getNum);
            if(newNum <=0){}else{
              $(".profitNum").text("+"+newNum);
            }
            $(".addProfitBox").addClass("addProgifAnimate2");
            $timeout(function(){
              $(".addProfitBox").removeClass("addProgifAnimate2");
              newValue = UtilService.toDecimal2(newValue);
              $(ele).text(newValue);
              AccountService.setPcenterMoney(newValue);
            },1000);
          }else{
            if(getAccountVal > -1){
              getAccountVal = UtilService.toDecimal2(getAccountVal);
              $(ele).text(getAccountVal);
            }
          }
        });
      }
    }
  })

