// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('xtui', ['ionic', 'ionic.service.core', 'ionic-datepicker', 'ngCordova', 'ionic.service.deploy','monospaced.elastic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
        StatusBar.styleLightContent();
      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.swipeBackEnabled(false);

    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');

    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('standard');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');

    $stateProvider
    //首页tab
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'modules/common/temp/tabs.html'
      })
      //首页发现
      .state('tab.home', {
        cache: true,
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'modules/home/temp/taskindex.html',
            controller: 'IndexController'
          }
        },
        params: {city: null, firstLogin: null, needJump: null, showTaskPointer: null}
      })

      //3.2-秒赚列表页
      .state('fastget', {
        cache: true,
        url: '/fastget',
        templateUrl: 'modules/home/fastget/view/fastget.html',
        controller: 'fastgetcontroller',
        controllerAs: 'vm',
        params: {option: null, 'sort': null}
      })

      //全部分类
      .state('choseclass', {
        cache: false,
        url: '/choseclass',
        templateUrl: 'modules/home/temp/chose_class.html',
        controller: 'ChoseclassController'
      })
      /*商家首页*/
      //.state('tab.cloudsale', {
      //  cache: true,
      //  url: '/cloudsale',
      //  views: {
      //    'tab-cloudsale': {
      //      templateUrl: 'modules/business/temp/tab-cloudsale.html',
      //      controller: 'BusinessIndexController'
      //    }
      //  }
      //})
      /*cpv推荐*/
      .state('tab.cpvlist', {
        cache: true,
        url: '/cpvlist',
        views: {
          'tab-cpvlist': {
            templateUrl: 'modules/cpv/views/cpvlist.html',
            controller: 'cpvListController'
          }
        }
      })
      //会话
      .state('tab.msg', {
        cache: true,
        url: '/msg',
        params: {'checkflag': ""},
        views: {
          'tab-msg': {
            templateUrl: 'modules/msg/temp/message.html',
            controller: 'MessageController'
          }
        }
      })
      //个人中心
      .state('tab.pcenter', {
        cache: false,
        url: '/pcenter',
        views: {
          'tab-pcenter': {
            templateUrl: 'modules/pcenter/temp/center.html',
            controller: 'PCenterIndexController'
          }
        },
        params: {money: null}
      })
      // 个人中心外链打开页
      .state('iframe', {
        cache: false,
        url: '/iframe',
        templateUrl: 'modules/pcenter/temp/iframe.html',
        controller: 'IframeController',
        params: {'iframeurl': "", 'name': ""}
      })
      // 滑动页面
      .state('shan', {
        cache: false,
        url: '/shan',
        templateUrl: 'modules/regiest/temp/shan.html',
        controller: 'ShanController',
        params: {'imgurl': ""}
      })
      /*登录页面*/
      .state('login', {
        cache: false,
        url: '/login',
        templateUrl: 'modules/regiest/temp/login.html',
        controller: 'LoginController'
      })
      /*注册页面1*/
      .state('regist1', {
        cache: false,
        url: '/regist1',
        templateUrl: 'modules/regiest/temp/regist1.html',
        controller: 'RegistController1',
        params: {'tiaokuan': null}
      })
      /*注册页面2*/
      .state('regist2', {
        cache: false,
        url: '/regist2',
        templateUrl: 'modules/regiest/temp/regist2.html',
        controller: 'RegistController2',
        params: {'checkFlag': "", 'tel': ""}
      })
      /*注册页面3*/
      .state('regist3', {
        cache: false,
        url: '/regist3',
        templateUrl: 'modules/regiest/temp/regist3.html',
        controller: 'RegistController3',
        params: {'token': "", 'tel': ""}
      })
      /*找回密码页面*/
      .state('findpwd', {
        cache: false,
        url: '/findpwd',
        templateUrl: 'modules/regiest/temp/find-password1.html',
        controller: 'FindPwdController1'
      })
      /*找回密码页面*/
      .state('findpwd2', {
        cache: false,
        url: '/findpwd2',
        templateUrl: 'modules/regiest/temp/find-password2.html',
        controller: 'FindPwdController2',
        params: {'checkFlag': "", 'tel': ""}
      })
      /*找回密码页面*/
      .state('findpwd3', {
        cache: false,
        url: '/findpwd3',
        templateUrl: 'modules/regiest/temp/find-password3.html',
        controller: 'FindPwdController3',
        params: {'token': "", 'tel': "", 'codema': ""}
      })

      /*关联手机号*/
      .state('relatednumber', {
        cache: false,
        url: '/relatednumber',
        templateUrl: 'modules/regiest/temp/relatednumber.html',
        controller: 'relatedNumberController',
        params: {'loginflag': "", 'nick': "", 'avate': "",'loginuserid':""}
      })
      .state('relatednumber2', {
        cache: false,
        url: '/relatednumber2',
        templateUrl: 'modules/regiest/temp/relatednumber2.html',
        controller: 'relatedNumberController2',
        params: {'loginflag': "", 'nick': "", 'avate': "",'loginuserid':"",'tel': ""}
      })
      .state('relatednumber3', {
        cache: false,
        url: '/relatednumber3',
        templateUrl: 'modules/regiest/temp/relatednumber3.html',
        controller: 'relatedNumberController3',
        params: { 'loginflag': "", 'nick': "", 'avate': "",'loginuserid':"",'tel': ""}
      })
      .state('relatednumber4', {
        cache: false,
        url: '/relatednumber4',
        templateUrl: 'modules/regiest/temp/relatednumber4.html',
        controller: 'relatedNumberController4',
        params: {'loginflag': "", 'nick': "", 'avate': "",'loginuserid':"",'checkFlag': "", 'tel': ""}
      })
      .state('relatednumber5', {
        cache: false,
        url: '/relatednumber5',
        templateUrl: 'modules/regiest/temp/relatednumber5.html',
        controller: 'relatedNumberController5',
        params: {'loginflag': "", 'nick': "", 'avate': "",'loginuserid':"",'token': "", 'tel': ""}
      })

      /*我的账户*/
      .state('account', {
        cache: false,
        url: '/account',
        templateUrl: 'modules/pcenter/account/temp/account.html',
        controller: 'AccountController'
      })

      /*手机充值页面*/
      .state('recharge', {
        cache: true,
        url: '/recharge',
        templateUrl: 'modules/pcenter/recharge/views/recharge.html',
        controller: 'RechargeController',
        controllerAs: 're'
      })

      /*设置页面*/
      .state('setting', {
        cache: false,
        url: '/setting',
        templateUrl: 'modules/pcenter/settings/temp/setting.html',
        controller: 'SettingController'
      })
      /*基础信息*/
      .state('info', {
        cache: false,
        url: '/info',
        templateUrl: 'modules/pcenter/info/temp/info.html',
        controller: 'InfoController'
      })
      /*职位*/
      .state('jobs', {
        url: '/jobs',
        templateUrl: 'modules/pcenter/info/temp/jobs.html',
        controller: 'jobsController',
        params: {'job': ""}
      })
      /*公司名称*/
      .state('company', {
        url: '/company',
        templateUrl: 'modules/pcenter/info/temp/company.html',
        controller: 'CompanyController',
        params: {'companyname': ""}
      })
      /*重置登陆密码*/
      .state('resetpassword', {
        cache: false,
        url: '/resetpassword',
        templateUrl: 'modules/pcenter/settings/temp/reset-password.html',
        controller: 'ResetpwdController'
      })
      /*设置密码*/
      .state('pswreset', {
        cache: false,
        url: '/pswreset',
        templateUrl: 'modules/pcenter/settings/temp/pswreset.html',
        controller: 'SetpwdController',
        params: {'paypwdflag': ""}
      })
      /*重置支付密码*/
      .state('resetpaypsw', {
        cache: false,
        url: '/resetpaypsw',
        templateUrl: 'modules/pcenter/settings/temp/resetpaypsw.html',
        controller: 'ResetpaypwdController'
      })
      /*设置支付密码*/
      .state('setpaypsw', {
        cache: false,
        url: '/setpaypsw',
        templateUrl: 'modules/pcenter/settings/temp/setpaypsw.html',
        controller: 'SetpaypwdController'
      })
      /*设置页跳换绑手机-验证原账号手机号*/
      .state('changetel1', {
        cache: false,
        url: '/changetel1',
        templateUrl: 'modules/pcenter/settings/temp/test-phone1.html',
        controller: 'Changetel1Controller'
      })
      /*设置页跳换绑手机-验证新手机号*/
      .state('changetel2', {
        cache: false,
        url: '/changetel2',
        templateUrl: 'modules/pcenter/settings/temp/test-phone2.html',
        controller: 'Changetel2Controller'
      })
      /*绑定支付宝*/
      .state('setzhifubao', {
        cache: false,
        url: '/setzhifubao',
        templateUrl: 'modules/pcenter/account/temp/set-zhifubao.html',
        controller: 'SetzhifubaoController'
      })
      //安全认证
      .state('safeRZ', {
        cache: false,
        url: '/saferz',
        templateUrl: 'modules/pcenter/account/temp/safe-idendity.html',
        controller: 'saferzController',
        params: {"alipay": null, "name": null}
      })
      //填写验证码
      .state('testcode', {
        cache: false,
        url: '/testcode',
        templateUrl: 'modules/pcenter/account/temp/testcode.html',
        controller: 'testcodeController',
        params: {"alipay": null, "name": null}
      })
      /*微信提现*/
      .state('wxwithdraw', {
        cache: false,
        url: '/wxwithdraw',
        templateUrl: 'modules/pcenter/account/temp/weixin-withdraw.html',
        controller: 'WXwithdrawController',
        params: {'token': null}
      })
      /*支付宝提现*/
      .state('alipaywithdraw', {
        cache: false,
        url: '/alipaywithdraw',
        templateUrl: 'modules/pcenter/account/temp/zhifubao-withdraw.html',
        controller: 'AlipaywithdrawController',
        params: {'token': null}
      })
      /*绑定微信*/
      .state('bindwx', {
        url: '/bindwx',
        templateUrl: 'modules/pcenter/account/temp/bindwx01.html',
        controller: 'AlipaywithdrawController'
      })
      /*任务详情页*/
      .state('taskdetail', {
        cache: false,
        url: '/taskdetail',
        templateUrl: 'modules/home/temp/taskdetail.html',
        controller: 'TaskDetailController',
        params: {'taskid': null, 'distance': null, 'city': null, 'sort': null, 'autoShare': null}
      })
      //关于我们
      .state('about', {
        cache: false,
        url: '/about',
        templateUrl: 'modules/pcenter/about/temp/about.html',
        controller: 'AboutController'
      })
      //意见反馈
      .state('advice', {
        cache: false,
        url: '/advice',
        templateUrl: 'modules/pcenter/advice/temp/advice.html',
        controller: 'AdviceController'
      })
      /*帮助页面*/
      .state('help', {
        url: '/help',
        templateUrl: 'modules/pcenter/help/temp/help.html',
        controller: 'HelpController',
        params: {'typeh': null}
      })
      /*我的客户管理*/
      .state('customer', {
        url: '/customer',
        cache: true,
        templateUrl: 'modules/pcenter/customer/temp/customer.html',
        controller: 'customerManageController'
      })
      /*添加客戶信息*/
      .state('addcustomer', {
        url: '/addcustomer',
        cache: false,
        templateUrl: 'modules/pcenter/customer/temp/addcustomer.html',
        controller: 'addcustomerController',
        params: {'task': null, "merchantid": null}
      })
      /*客户提交至*/
      .state('customersubmit', {
        url: '/customersubmit',
        cache: false,
        templateUrl: 'modules/pcenter/customer/temp/customersubmit.html',
        controller: 'customerSubmitController'
      })
      /*常用推广*/
      .state('extension', {
        url: '/extension',
        cache: true,
        templateUrl: 'modules/pcenter/extension/temp/extension.html',
        controller: 'extensionController'
      })
      /*专属活动*/
      .state('exclusiveactive', {
        url: '/exclusiveactive',
        templateUrl: 'modules/pcenter/extension/temp/exclusiveactive.html',
        controller: 'extensionController'
      })
      /*客户管理详情*/
      .state('customerdetail', {
        url: '/customerdetail',
        cache: false,
        templateUrl: 'modules/pcenter/customer/temp/customerdetail.html',
        controller: 'customerDetailController',
        params: {"leads": null}
      })
      /*客户管理详情2*/
      .state('customerdetail2', {
        cache: false,
        url: '/customerdetail2',
        templateUrl: 'modules/pcenter/customer/temp/customerdetail2.html',
        controller: 'customerDetail2Controller',
        params: {"leads": null}
      })
      /*客户管理详情3*/
      .state('customerdetail3', {
        cache: false,
        url: '/customerdetail3',
        templateUrl: 'modules/pcenter/customer/temp/customerdetail3.html',
        controller: 'customerDetail3Controller',
        params: {"leads": null}
      })
      /*客户管理详情4*/
      .state('customerdetail4', {
        cache: false,
        url: '/customerdetail4',
        templateUrl: 'modules/pcenter/customer/temp/customerdetail4.html',
        controller: 'customerDetail4Controller',
        params: {"leads": null}
      })
      /*申请佣金*/
      .state('applymoney', {
        url: '/applymoney',
        templateUrl: 'modules/pcenter/customer/temp/applymoney.html',
        controller: 'customerManageController'
      })
      /*帮助列表页面*/
      .state('helplist', {
        url: '/helplist',
        templateUrl: 'modules/pcenter/help/temp/help-list.html',
        controller: 'HelpListController',
        params: {'typeid': null, 'typename': null, 'typeh': null}
      })
      /*帮助详情页面*/
      .state('helpdetail', {
        cache: false,
        url: '/helpdetail',
        templateUrl: 'modules/pcenter/help/temp/help-detail.html',
        controller: 'HelpdetailController',
        params: {'helpid': null}
      })
      /*主题列表*/
      .state('themelist', {
        cache: true,
        url: '/themelist',
        templateUrl: 'modules/home/topic/temp/theme-list.html',
        controller: 'ThemeController',
        params: {'topicid': "", 'topictitle': "", 'topicimg': "", 'topicdesc': "", 'ttype': ""}
      })
      //搜索页
      .state('search', {
        cache: false,
        url: '/search',
        templateUrl: 'modules/home/search/temp/search.html',
        controller: 'SearchController',
        params: {'type': null}
      })
      //搜索任务列表页面
      .state('searchlist', {
        cache: true,
        url: '/searchlist',
        templateUrl: 'modules/home/search/temp/search-list.html',
        controller: 'SearchListController',
        params: {'type': null, 'key': null}
      })
      //重置昵称
      .state('resetnick', {
        url: '/resetnick',
        templateUrl: 'modules/pcenter/info/temp/reset-name.html',
        controller: 'ResetNickController',
        params: {'nick': ""}
      })
      /*关注领域*/
      .state('industrydirection', {
        url: '/industrydirection',
        templateUrl: 'modules/pcenter/info/temp/industrydirection.html',
        controller: 'IndustryController',
        params: {'industrytagids': ""}
      })
      /*个人标签*/
      .state('personaltag', {
        url: '/personaltag',
        templateUrl: 'modules/pcenter/info/temp/personaltag.html',
        controller: 'PLableController',
        params: {'personallabelids': ""}
      })
      /*销售方法*/
      .state('salesmethod', {
        url: '/salesmethod',
        templateUrl: 'modules/pcenter/info/temp/salesmethod.html',
        controller: 'SaleMethodController',
        params: {'salemethodids': ""}
      })
      /*我的收藏页面*/
      .state('mycollection', {
        cache: true,
        url: '/mycollection',
        templateUrl: 'modules/pcenter/collection/temp/mycollection.html',
        controller: 'CollectionController'
      })
      //分享好友
      .state('share', {
        cache: false,
        url: '/share',
        templateUrl: 'modules/pcenter/invite/temp/share.html',
        controller: 'InviteController'
      })

      /*我的身份页面*/
      .state('myidentity', {
        cache: false,
        url: '/myidentity',
        templateUrl: 'modules/pcenter/myidentity/temp/myIdentity.html',
        controller: 'MyIdentityController'
      })
      /*商家详情页面*/
      /*.state('business', {
        cache: true,
        url: '/business',
        templateUrl: 'modules/business/temp/business.html',
        controller: 'BusinessController',
        params: {merchantid: null}
      })*/
      /*商家介绍页面*/
      .state('businessdetail', {
        cache: true,
        url: '/businessdetail',
        templateUrl: 'modules/business/temp/business-detail.html',
        controller: 'BusinessDetailController',
        params: {buserinfo: null}
      })
      /*商家评价页面*/
      .state('bevaluate', {
        cache: false,
        url: '/bevaluate',
        templateUrl: 'modules/business/evaluate/temp/bevaluate.html',
        controller: 'EvaluateController',
        params: {"merchantid": null}
      })
      /*商品库*/
      .state('product', {
        cache: false,
        url: '/product',
        templateUrl: 'modules/business/goods/temp/product.html',
        controller: 'goodsController',
        params: {"merchantid": null, "companyalias": null}
      })
      /*CPS详情页面*/
      .state('helpselldetail', {
        cache: true,
        url: '/helpselldetail',
        templateUrl: 'modules/home/helpsell/temp/help-sell-detail.html',
        controller: 'HelpSellDetailController',
        params: {'taskid': null, 'sort': null}
      })
      /*CPS推广活动*/
      .state('extensionactive', {
        cache: false,
        url: '/extensionactive',
        templateUrl: 'modules/home/helpsell/temp/extensionactive.html',
        controller: 'ExtensionActiveController',
        params: {'taskid': null}
      })
      /*CPS美文分享*/
      .state('goodarticle', {
        cache: false,
        url: '/goodarticle',
        templateUrl: 'modules/home/helpsell/temp/goodarticle.html',
        controller: 'GoodArticleController',
        params: {'taskid': null, 'articleid': null}
      })
      /*CPS优惠券*/
      .state('coupon', {
        cache: false,
        url: '/coupon',
        templateUrl: 'modules/home/helpsell/temp/coupon.html',
        controller: 'ArticleActController',
        params: {'taskid': null, 'articleid': null}
      })
      /*申请团长页面*/
      .state('teamheadmodel', {
        cache: false,
        url: '/teamheadmodel',
        templateUrl: 'modules/home/helpsell/teamhead/temp/team-head-model.html',
        controller: 'teamHeadController',
        params: {'taskid': null, 'articleid': null}
      })
      /*申请团长页面提交审核*/
      .state('teamheadexamine', {
        cache: false,
        url: '/teamheadexamine',
        templateUrl: 'modules/home/helpsell/teamhead/temp/team-head-examine.html',
        controller: 'teamHeadController',
        params: {'taskid': null, 'articleid': null}
      })
      /*商品详情页面*/
      .state('gooddetailc', {
        cache: false,
        url: '/gooddetailc',
        templateUrl: 'modules/business/goods/temp/productdetail.html',
        controller: 'GoodsDetailController',
        params: {'goods': null, 'companyalias': null}
      })
      /*添加客户信息详情页面*/
      .state('adduser', {
        cache: false,
        url: '/adduser',
        templateUrl: 'modules/home/helpsell/seller/temp/adduser.html',
        controller: 'AddUserController',
        params: {taskid: null}
      })
      /*提交客户信息页面*/
      .state('adduserinfo', {
        cache: false,
        url: '/adduserinfo',
        templateUrl: 'modules/home/helpsell/seller/temp/adduserinfo.html',
        controller: 'AddUserInfoController',
        params: {taskid: null}
      })
      /*申请云销售页面*/
      .state('apply', {
        cache: false,
        url: '/apply',
        templateUrl: 'modules/home/helpsell/seller/temp/apply.html',
        controller: 'ApplyController',
        params: {merchantid: "", merchantname: ""}
      })
      /*申诉页面*/
      .state('complaint', {
        cache: false,
        url: '/complaint',
        templateUrl: 'modules/pcenter/customer/temp/complaint.html',
        controller: 'ComplaintController',
        params: {leads: null}
      })
      //聊天详情页（商家聊天页）
      .state('msgdetail', {
        cache: false,
        url: '/msgdetail',
        templateUrl: 'modules/msg/chat/temp/msgDetail.html',
        controller: 'msgdetailController',
        params: {otheruserid: null, otherusername: null, istmp: null, avate: null, imgroupid: null}
      })
      //聊天详情页（享推小秘书）
      .state('msgfaq', {
        cache: false,
        url: '/msgfaq',
        templateUrl: 'modules/msg/chat/temp/msgFaq.html',
        controller: 'faqController'
      })
      //聊天详情页（系统消息）
      .state('msgsystem', {
        cache: true,
        url: '/msgsystem',
        templateUrl: 'modules/msg/chat/temp/msgSystem.html',
        controller: 'systemController',
        params: {msgType: null}
      })
      //聊天详情页（系统消息）没有链接默认页
      .state('systeminfor', {
        cache: true,
        url: '/systeminfor',
        templateUrl: 'modules/msg/chat/temp/systeminfor.html',
        controller: 'systeminforController',
        params: {systeminfor: null}
      })
      //聊天详情页（S与S聊天页）
      .state('permsgdetail', {
        cache: false,
        url: '/permsgdetail',
        templateUrl: 'modules/msg/perchat/temp/perMsgDetail.html',
        controller: 'permsgdetailController',
        params: {otheruserid: null, otherusername: null, avate: null, imgroupid: null}
      })
      //收付款详情页（S与S聊天页）
      .state('ssaccountdetail', {
        cache: false,
        url: '/ssaccountdetail',
        templateUrl: 'modules/msg/perchat/temp/accountDetail_ss.html',
        controller: 'SSPayController',
        params: {paylogid: null, otheruserid: null, usertype: null, otherusername: null}
      })
      //系统消息页面
      .state('msgdetailss', {
        cache: false,
        url: '/msgdetailss',
        templateUrl: 'modules/msg/chat/temp/msgDetail-ss.html',
        controller: 'msgSysdetailController',
        params: {sysmsgtype: null, sysmsgtypename: null}
      })
      //新的朋友
      .state('newfriend', {
        cache: true,
        url: '/newfriend',
        templateUrl: 'modules/msg/newFriend/temp/newfriend.html',
        controller: 'newfriendController',
        params: {taskid: null, merchantid: null}
      })
      //s看s的主页
      .state('shome', {
        cache: false,
        url: '/shome',
        templateUrl: 'modules/msg/newFriend/temp/sHome.html',
        controller: 'shomeController',
        params: {suserid: null, applyid: null, isFriend: null}
      })
      //修改备注
      .state('setremark1', {
        cache: false,
        url: '/setremark1',
        templateUrl: 'modules/msg/newFriend/temp/setremark1.html',
        controller: 'setRemarkController',
        params: {suserid: null, applyid: null, 'otherusername': null, imgroupid: null}
      })
      //选择城市
      .state('selectcity', {
        cache: false,
        url: '/selectcity',
        templateUrl: 'modules/home/selectcity/temp/selectCity.html',
        controller: 'cityController',
        params: {city: null}
      })
      //收到的评价
      .state('myevaluate', {
        cache: false,
        url: '/myevaluate',
        templateUrl: 'modules/pcenter/evaluate/temp/evaluate.html',
        controller: 'myevaluateController',
        params: {taskid: null, merchantid: null}
      })
      //会话-账单详情
      .state('accountdetail', {
        cache: false,
        url: '/accountdetail',
        templateUrl: 'modules/msg/chat/temp/accountDetail.html',
        controller: 'accountdController',
        params: {avate: null, nleadsid: null}
      })
      //会话聊天：申请佣金
      .state('applycommission', {
        cache: false,
        url: '/applycommission',
        templateUrl: 'modules/msg/applycommission/temp/applycommission.html',
        controller: 'ApplyCommController',
        params: {merchantid: null, company: null, avate: null, imgroupid: null}
      })
      //会话聊天：发送客户step1
      .state('sendclient1', {
        cache: false,
        url: '/sendclient1',
        templateUrl: 'modules/msg/sendclient/temp/sendclient1.html',
        controller: 'SendClinet1Controller',
        params: {merchantid: null, company: null}
      })
      //会话聊天：发送客户step2
      .state('sendclient2', {
        cache: false,
        url: '/sendclient2',
        templateUrl: 'modules/msg/sendclient/temp/sendclient2.html',
        controller: 'SendClinet2Controller',
        params: {merchantid: null, company: null, avate: null, imgroupid: null}
      })
      //会话聊天：发送客户step3
      .state('sendclient3', {
        url: '/sendclient3',
        cache: false,
        templateUrl: 'modules/msg/sendclient/temp/sendclient3.html',
        controller: 'SendClinet3Controller',
        params: {'task': null, "merchantid": null}
      })
      //3.1-通讯录-添加手机联系人
      .state('addfriend', {
        cache: false,
        url: '/addfriend',
        templateUrl: 'modules/msg/phonebook/temp/addfriend.html',
        controller: 'PhonebookController',
        params: {nleadsid: null}
      })

      //3.1-通讯录-群聊
      .state('groupchat', {
        cache: true,
        url: '/groupchat',
        templateUrl: 'modules/msg/phonebook/temp/groupchat.html',
        controller: 'groupchatController',
        params: {nleadsid: null}
      })

      //3.1-分享-选择最近联系人
      .state('selectcontact', {
        cache: true,
        url: '/selectcontact',
        templateUrl: 'modules/msg/share/temp/selectContact.html',
        controller: 'shareController',
        params: {shareid: null, name: null, type: null, isbuser: null}
      })

      //3.1-分享-选择通讯录联系人
      .state('selectPhonebook', {
        cache: false,
        url: '/selectPhonebook',
        templateUrl: 'modules/msg/share/temp/selectPhonebook.html',
        controller: 'selectPhoneController',
        params: {isbuser: null}
      })

      //附近的商家的任务
      .state('nearlysale', {
        cache: true,
        url: '/nearlysale',
        templateUrl: 'modules/home/topic/views/nearlySale.html',
        controller: 'NearlySaleController',
        controllerAs: 'vm',
        params: {option: null, topicid: null}
      })
      //个人中心我的二维码
      .state('mycode', {
        cache: false,
        url: '/mycode',
        templateUrl: 'modules/pcenter/temp/mycode.html',
        controller: 'centerMycodeController'
      })

      /*扫一扫无法进行*/
      .state('cantscan', {
        cache: false,
        url: '/cantscan',
        templateUrl: 'modules/home/temp/cantscan.html',
        controller: 'CantScanController'
      })

      /*扫一扫失败*/
      .state('scanfail', {
        cache: false,
        url: '/scanfail',
        templateUrl: 'modules/home/temp/scanfail.html',
        controller: 'ScanFailController'
      })


      /*个人账户页面*/
      .state('peraccount', {
        cache: false,
        url: '/peraccount',
        templateUrl: 'modules/pcenter/account/temp/perAccount.html',
        controller: 'perAccountController'
      })
      /*享推学院-详情页*/
      .state('xtschooldetail', {
        cache: false,
        url: '/xtschooldetail',
        templateUrl: 'modules/pcenter/xtschool/temp/xtschooldetail.html',
        controller: 'xtschoolDetailController',
        params: {qid: null}
      })
      /*享推学院-提问*/
      .state('question', {
        cache: false,
        url: '/question',
        templateUrl: 'modules/pcenter/xtschool/temp/question.html',
        controller: 'xtschoolQuestionController',
        params: {type: null}
      })
      /*享推学院首页*/
      .state('xtschoolindex', {
        cache: true,
        url: '/xtschoolindex',
        templateUrl: 'modules/pcenter/xtschool/temp/xtschoolindex.html',
        controller: 'xtschoolindexController'
      })
       /*享推学院与我相关*/
      .state('xtsrelateme', {
        cache: false,
        url: '/xtsrelateme',
        templateUrl: 'modules/pcenter/xtschool/temp/xtsRelateMe.html',
        controller: 'xtsrelatemeController'
      });

    //$urlRouterProvider.otherwise('tab/home');
  })
  .controller("main", function ($scope, $ionicPlatform, $cordovaKeyboard, $ionicHistory, $location, $interval, $state, $ionicDeploy, BlackService,
                                $rootScope, $window, $ionicPopup, $ionicScrollDelegate, UserService, UtilService, ConfigService, CustomerService, $timeout, NewHandService, SysMsgService, MsgService) {
    //配置参数初始化
    UtilService.post(ConfigService.serverctx + "/version", {v: ConfigService.versionno}).success(function (data) {
      ConfigService.init(data);
      $scope.picserver = ConfigService.picserver;
      $scope.pcodeserver = ConfigService.pcodeserver;
      $scope.imserver = ConfigService.imserver;
    });
    //设置缩放比例 TODO
    var viewport = document.querySelector("meta[name=viewport]");
    var winWidths = window.screen.width;
    var densityDpi = winWidths / 640;
    if (densityDpi <= 1) {
      viewport.setAttribute('content', 'width=device-width, user-scalable=no,target-densitydpi=device-dpi,initial-scale=' + densityDpi + ',maximum-scale=' + densityDpi + ',minimum-scale=' + densityDpi);
    } else {
      viewport.setAttribute('content', 'width=device-width, user-scalable=no,target-densitydpi=device-dpi,initial-scale=' + 1 + ',maximum-scale=' + 1 + ',minimum-scale=' + 1);
    }

    $scope.closekeyboardcopy = function () {
      if (device.platform == "Android") {
        $("input").blur();
      } else {
        cordova.plugins.Keyboard.close();
      }
    };

    //参数名字不要变
    var saveBehavior = function (data1, data2, data3) {
      try {
        var data = angular.copy(data3);
        if (data2.url == "/gooddetailc") {
          data = {"id": data.goods.id};
        }
        data.apptype = 's';
        var query = {
          mod: "nUser",
          func: "nSaveUserBehavior",
          data: {'fromurl': data1.url, 'tourl': data2.url, 'param': data},
          userid: UserService.user.id
        };

        $rootScope.xtfromurl = data1.url;
        $rootScope.xttourl = data2.url;
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
        });
        UtilService.countpagecount(data2.templateUrl + "." + XT_PATHMAP.data[data2.templateUrl + ""].title);
      } catch (e) {
      }
    };

    //监听路由变化
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      $timeout(function () {
        saveBehavior(fromState, toState, toParams);
      }, 100)
    });

    var senduuid = function () {
      if (device.platform == "Android") {
        //安卓调用百度定位插件
        BlackService.baiduaddress().then(function (response) {
          BlackService.senduuid(0, response);
        }, function () {
          BlackService.senduuid(0);
        });
      } else {
        BlackService.gpsaddress().then(function (response) {
          BlackService.senduuid(1, response);
        }, function () {
          BlackService.senduuid(1);
        });
      }
    };

    var checkApkUpdate = function (userid) {
      var devicetype;
      if (device.platform == "Android") {
        devicetype = "0";
      } else {
        devicetype = "1";
      }
      var query = {
        mod: "nComm",
        func: "checkApkUpdate",
        userid: userid,
        data: {
          no: ConfigService.versionno,
          apptype: "s",
          type: devicetype
        }
      };
      UtilService.post(ConfigService.upserver, {'jsonstr': angular.toJson(query)}).success(function (data) {
        if (data.status == '000000') {
          if (data.data.isapkupdate == '1') {
            $rootScope.no = data.data.no;
            $ionicDeploy.initialize();
            $scope.checkUUU(data.data.size);
            $scope.sizeze = data.data.size;
            $interval(function () {
              $scope.checkUUU($scope.sizeze)
            }, 600000);
          }
        }
      })
    };

    var getLoginData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          $scope.logindata = resultData;
          if ($scope.logindata == null || $scope.logindata == "" || $scope.logindata == undefined) {
            checkApkUpdate("");
          } else {
            var uslist = $scope.logindata.split(",");
            checkApkUpdate(uslist[0]);
          }
        }, function () {
          $scope.logindata = "";
          checkApkUpdate("");
        }, "loadpage");
      }
      catch (e) {
        $scope.logindata = "";
        checkApkUpdate("");
      }
    };

    var autoLogin = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var autodata = resultData;
          if (autodata == null || autodata == "" || autodata == undefined) {
            $scope.go('login');
          } else {
            var us = autodata.split(",");
            UserService.user.id = us[0];
            UserService.user.tel = us[1];
            UserService.user.pwd = us[2];
            UserService.user.avate = us[3];
            UserService.user.nick = us[4];
            $scope.go('tab.home');
          }
        }, function () {
          $scope.go('login');
        }, "loadpage");
      }
      catch (e) {
        $scope.go('login');
      }
    };

    //检查是否去滑动页
    var checkShan = function () {
      var query = {
        mod: "nComm",
        func: "getAdviertisement"
      };
      UtilService.post2(ConfigService.server,{'jsonstr': angular.toJson(query)}).success(function (data) {
        if(data.data.adviertisement==1){
          $scope.go('shan',{'imgurl':data.data.adviertisementurl});
        }else {
          autoLogin();
        }
      }).error(function () {
        autoLogin();
      });
    };

    var onDeviceReady = function () {
      initiateUI();
      document.addEventListener("resume", onResume, false);
      document.addEventListener("pause", onPause, false);
      document.addEventListener("backbutton", registerBack, false);
      UtilService.getLogtoken();
      getLoginData();
      checkShan();
      $timeout(function () {
        senduuid();
      }, 100);
    };
    //建立监听事件
    document.addEventListener("deviceready", onDeviceReady, false);
    window.addEventListener('native.keyboardhide',function (e){
      cordova.plugins.Keyboard.isVisible = true;
      $timeout(function() {
        cordova.plugins.Keyboard.isVisible = false;
      }, 200);
    });
    //双击退出
    var registerBack = function () {
      $ionicPlatform.registerBackButtonAction(function (e) {
        if (cordova.plugins.Keyboard.isVisible) {
          cordova.plugins.Keyboard.close();
          return;
        }
        if($rootScope.concern == 0){
          $scope.go("tab.msg");
          $rootScope.concern = 1;
          return;
        }
        if($location.path() == "/cpvdetail") {
          return;
        }
        if ($location.path() == "/publishpost") {
          $rootScope.exitPublish();
          return;
        }
        if ($location.path() == "/pswreset") {
          $scope.go("setting");
          return;
        }
        if ($location.path() == "/customerdetail3") {
          var display = $(".applyMoneyDialog").css("display");
          if (display == "block") {
            $(".applyMoneyDialog").hide();
            return;
          }
        }
        if ($location.path() == "/complaint") {
          $('.popup-mask').show();
          $('.shensupopup').show();
          return;
        }
        //判断处于哪个页面时双击退出
        if ($location.path() == "/login" || $location.path() == "/tab/home" || $location.path() == "/tab/pcenter" || $location.path() == "/tab/msg" || $location.path() == "/tab/cpvlist" || $location.path() == "/shan") {
          if ($rootScope.backButtonPressedOnceToExit) {
            ionic.Platform.exitApp();
          } else {
            $rootScope.backButtonPressedOnceToExit = true;
            UtilService.showMess('再按一次退出系统');
            setTimeout(function () {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }
          return;
        } else if (($state.current.name == "shome" || $state.current.name == "business") && ($rootScope.circleLargeImgShow == true || $rootScope.headLargeImgShow == true)) {
          $rootScope.circleLargeImgShow = false;
          $rootScope.headLargeImgShow = false;
          $rootScope.$apply();
        } else if ($state.current.name == "permsgdetail" || $state.current.name == "msggroup") {
          if ($rootScope.chatLargeImgShow == true) {
            $rootScope.chatLargeImgShow = false;
            $rootScope.$apply();
          } else {
            $scope.go("tab.msg");
          }
        }else if ($ionicHistory.backView()) {

            var bv = $ionicHistory.backView().stateName;
            if (bv == "addcustomer" || bv == "customerdetail") {
              var cfrom = CustomerService.getCustomerfrom();
              if (cfrom == "home") {
                $scope.go("tab.home");
              } else if (cfrom == "pcenter") {
                $scope.go("tab.pcenter");
              }
            } else if (bv == "addgroup" || ($location.path() == "/groupchat" && bv == "groupmessage")) {
              $scope.go("tab.msg");
            }
            else
              $ionicHistory.goBack();

        } else {
          $state.go('tab.home');
        }
        e.preventDefault();
        return false;
      }, 101);
    };

    var noticefalg = true;
    var xg_data = {};
    $scope.shownoticeBox = function () {
      $rootScope.merryChirsBox = false;
      //新手引导
      $rootScope.step1=-1;
      $rootScope.step1InviteName="";
      $rootScope.step1InviteAvatar="";
      $rootScope.step2 = false;
      $rootScope.step3 = false;
      $rootScope.step4 = false;
      $rootScope.step5 = false;
      $rootScope.step6 = false;
      $rootScope.step7 = false;
      $rootScope.showActive = false;
      $rootScope.isChangzhou=false;

      $('.messagePopup').hide();
      $('.msg_mask').hide();
      $('.index-mask').hide();
      noticefalg = true;
      var datajson;// = JSON.parse(xg_data["redirect"]);
      if (typeof xg_data["redirect"] == 'object') {
        datajson = xg_data["redirect"];
      } else {
        datajson = JSON.parse(xg_data["redirect"]);
      }
      var params = datajson.params;
      // params.xgtype = 1;
      var query = {
        mod: "nuser",
        func: "nSaveUserBehavior",
        data: {'fromurl': "/xgopen", 'tourl': datajson.url, 'param': params},
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
      });

      if(datajson.url == "msgsystem") {
        UserService.msgsystemflg = 1;
      }
      if (datajson.params) {
        $scope.go(datajson.url, datajson.params);
      } else {
        $scope.go(datajson.url);
      }
    };

    $scope.closenoticeBox = function () {
      $('.messagePopup').hide();
      $('.msg_mask').hide();
      $('.index-mask').hide();
      noticefalg = true;
      var datajson;
      if (typeof xg_data["redirect"] == 'object') {
        datajson = xg_data["redirect"];
      } else {
        datajson = JSON.parse(xg_data["redirect"]);
      }
      var params = datajson.params;
      // params.xgtype = 0;
      var query = {
        mod: "nuser",
        func: "nSaveUserBehavior",
        data: {'fromurl': "/xgopen", 'tourl': datajson.url, 'param': params},
        userid: UserService.user.id
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {
      });
    };

    //统一payload处理方法
    function dealPayload(payload, offLine) {
      if(UserService.user == null || UserService.user.id == null || UserService.user.id.length == 0) {
        return;
      }

      if (typeof payload != 'object') {
        payload = eval("(" + payload + ")");
      }
      if (payload.type == 0) {
        //后台推送
        if ((device.platform == "Android" && ConfigService.pause == false) || (device.platform == "iOS" && offLine === false)) {
          //android在前台或者ios在线，弹内部框
          xg_data = payload;
          //后台的通知
          // datajson_gt =payload.redirect;
          var notice = document.getElementById('noticeCon');
          // notice.innerHTML=xg_data["aps"].alert;
          notice.innerHTML = payload.ndesc || "收到新的消息，是否立即前往？";
          $('.messagePopup').show();
          $('.msg_mask').show();
        } else {
          if (device.platform == "Android") {
            //用本地通知
            $window.xgpush.addLocalNotification(1, payload.ntitle, payload.ndesc, function (obj) {
              $("#notice_audio")[0].play();
              MsgService.msgNotice[obj] = payload;
            }, function () {
            });
          }
        }
      } else if (payload.type == 1) {
        //im聊天消息推送. 有MsgService处理。因为要在拉取到数据后才出通知，所以不在这里处理。
      } else if (payload.type == 2) {
        //im系统通知
      } else if (payload.type == 3) {
        //s专有系统通知
      } else {

      }
    }

    //初始化函数
    var initiateUI = function () {
      var datajson_gt;
      try {
        if (device.platform == "Android") {
          // Join BBM Meeting when user has clicked on the notification
          /*
           cordova.plugins.notification.local.on("click", function (notification) {
           var customContent = MsgService.msgNotice[notification.id];
           if(customContent.redirect != undefined) {
           htNoticeClick(customContent);
           } else if(customContent.type == 1) {
           imNoticeClick(customContent);
           }

           delete MsgService.msgNotice[notification.id];
           });
           */

          function callback(type, data) {
            if (type == 'cid') {
              //TODO data = clientid
            } else if (type == 'pid') {
              //TODO data = 进程pid
            } else if (type == 'payload') {
              dealPayload(data);
              /*
               var getuires = eval("("+data+")");
               if(getuires.type === 0 && getuires.redirect != undefined) {
               xg_data = getuires;
               //后台的通知
               datajson_gt =getuires.redirect;
               if(ConfigService.pause == false) {
               //如果在前台，弹内部框
               // alert(angular.toJson(getuires));
               var notice = document.getElementById('noticeCon');
               // notice.innerHTML=xg_data["aps"].alert;
               notice.innerHTML = getuires.ntitle || "收到新的消息，是否立即前往？";
               $('.messagePopup').show();
               $('.msg_mask').show();
               } else {
               //如果在后台，出通知
               // cordova.plugins.notification.local.schedule({
               //   id: MsgService.noticeid,
               //   title: getuires.ntitle,
               //   text: getuires.ndesc,
               //   sound: "/android_asset/www/audio/notice.mp3",
               //   icon: "/android_asset/img/about_logo.png",
               //   data: { meetingId:"#123FG8" }
               // });
               $window.xgpush.addLocalNotification(1, getuires.ntitle, getuires.ndesc, function(obj){
               $("#notice_audio")[0].play();
               MsgService.msgNotice[obj] = getuires;
               }, function(){
               });
               // MsgService.msgNotice[MsgService.noticeid] = getuires;
               // MsgService.noticeid++;
               }
               } else if(getuires.type === 1) {
               //im的透传
               // imNoticeClick(getuires);
               }
               */

              /*
               //TODO data=透传数据
               cordova.plugins.notification.local.clear(getuires.gt_id);
               cordova.plugins.notification.local.schedule({
               id: MsgService.noticeid,
               title: getuires.ntitle,
               text: getuires.ndesc,
               sound: "/android_asset/www/audio/notice.mp3",
               icon: "/android_asset/img/about_logo.png",
               data: { meetingId:"#123FG8" }
               });
               MsgService.msgNotice[MsgService.noticeid] = getuires;
               MsgService.noticeid++;
               */
            } else if (type == 'online') {
              if (data == 'true') {
                //TODO 已上线
                //$('#clientid').text(clientid);
              } else {
                //TODO 已离线
              }
            }
          }
          //初始化插件
          GeTuiSdkPlugin.callback_init(callback);
          GeTuiSdkPlugin.initialize();
        } else {
          //clinetid返回
          function onRegisterClient(clientId) {
            //TODO clientId = clinetid
          }

          //透传数据返回
          function onReceivePayload(payloadId, taskId, msgId, offLine, appId) {
            //TODO playload = 透传数据
            //TODO taskId = 推送消息的任务id
            //TODO msgId = 推送消息的messageid
            //TODO offLine = 是否是离线消息，YES.是离线消息
            //TODO appId = 应用的appId

            dealPayload(payloadId, offLine);
            /*
             var getuires = eval("("+payloadId+")");
             if(getuires.type === 0 && getuires.redirect != undefined) {
             xg_data = getuires;
             //后台的通知
             datajson_gt =getuires.redirect;
             if(offLine == false) {
             //如果在前台，弹内部框
             // alert(angular.toJson(getuires));
             var notice = document.getElementById('noticeCon');
             // notice.innerHTML=xg_data["aps"].alert;
             notice.innerHTML = getuires.ntitle || "收到新的消息，是否立即前往？";
             $('.messagePopup').show();
             $('.msg_mask').show();
             } else {
             //离线，会有APNS的通知
             }
             } else if(getuires.type === 1) {
             //im的透传
             // imNoticeClick(getuires);
             }
             */
          }

          //发送上行消息返回
          function onSendMessage(messageId, result) {
            //TODO messageid = 发送上行消息id
            //TODO result = 发送结果
          }

          //SDK内部发生错误返回
          function onOccurError(err) {
            //TODO err = 错误信息
          }

          //sdk状态返回
          function onNotifySdkState(status) {
            var callback = function (status) {
              switch (status) {
                case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStarting:
                  //TODO 正在启动
                  break;
                case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStarted:
                  //TODO 已经启动
                  break;
                case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStoped:
                  //TODO 已经停止
                  break;
                default:
                  break;
              }
            };
            GeTuiSdk.status(callback);
          }

          //SDK设置关闭推送模式回调
          function onSetPushMode(isModeOff, err) {
            if (err != null) {
              //TODO 设置关闭模式失败
            } else {
              //TODO 设置关闭模式成功
            }
          }

          //初始化插件
          GeTuiSdk.setGeTuiSdkDidRegisterClientCallback(onRegisterClient);
          GeTuiSdk.setGeTuiSdkDidReceivePayloadCallback(onReceivePayload);
          GeTuiSdk.setGeTuiSdkDidSendMessageCallback(onSendMessage);
          GeTuiSdk.setGeTuiSdkDidOccurErrorCallback(onOccurError);
          GeTuiSdk.setGeTuiSDkDidNotifySdkStateCallback(onNotifySdkState);
          GeTuiSdk.setGeTuiSdkDidSetPushModeCallback(onSetPushMode);
          //个推平台申请的参数KAppId, KAppKey, KAppSecret
          //测试
          // GeTuiSdk.startSdkWithAppId("mpxQ0iRD216xPRgtlERnZ9", "2ASjoer7bK6sLC2LDNErW7", "wbS4IoS1IH9piTM8jctDz3");
          //正式
          GeTuiSdk.startSdkWithAppId("7TleAdZZD5A9e4KOez8Dm9", "Zl203hTrde70yyyqyVt074", "2L9mxOcwJd5017HhMek8rA");

        }

      }
      catch (e) {
      }
    };

    function fetchData() {
      for (k in xg_data) {
        if (k == "redirect") {
          var datajson = JSON.parse(xg_data[k]);
          if (datajson.params) {
            $state.go(datajson.url, datajson.params);
          } else {
            $state.go(datajson.url);
          }
        }
      }
    }

    function onResume() {
      ConfigService.pause = false;
      if (noticefalg) {
        $('.messagePopup').hide();
        $('.msg_mask').hide();
        $('.index-mask').hide();
        fetchData();
      }
      if (device.platform == "Android") {
      } else {
        if (UtilService.checkNetwork()) {
          $window.xgpush.setJiaoBiaoZero(function (event) {
          }, function (event) {
          });
          GeTuiSdk.resetBadge(); //个推重置角标
          GeTuiSdk.setBadge(0);//设置角标为0
        }
        //ios如果长时间处于pause状态，有可能会停止长连接。在resume时重启。
        if(MsgService.pauseTime && new Date().getTime() - MsgService.pauseTime >= 2*60*1000) {
          MsgService.stopQueryAllNew();
          MsgService.startQuery = Math.random();
          MsgService.queryAllNew(MsgService.startQuery);
        }
      }
    }

    function onPause() {
      noticefalg = false;
      ConfigService.pause = true;
      if(device.platform != "Android") {
        MsgService.pauseTime = new Date().getTime();
      }
    }

    //返回
    var gobackflg = 0;
    $scope.goback = function () {
      cordova.plugins.Keyboard.close();
      if (gobackflg == 0) {
        gobackflg = 1;
        if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
          //$rootScope.$ionicGoBack();
        } else {
          $state.go('tab.home');
        }
        $timeout(function () {
          gobackflg = 0
        }, 500);
      }
    };

    //跳转路由      (不需要判断是否登录)
    $scope.go = function (state) {
      UtilService.goStatus[state] = {};
      $state.go(state);
    };

    //跳转路由-带参数   (不需要判断是否登录)
    $scope.go = function (page, params) {
      UtilService.goStatus[page] = params || {};
      $state.go(page, params);
    };

    var fuckgoflg = 0;
    //清楚缓存跳转   (不需要判断是否登录)
    $scope.cleargo = function (page, params) {
      var stateIds = [];
      stateIds.push(page);
      if (fuckgoflg == 0) {
        fuckgoflg = 1;
        $ionicHistory.clearCache(stateIds).then(function () {
            $timeout(function () {
              fuckgoflg = 0;
            }, 1000);
            if (params != null && angular.isDefined(params)) {
              $state.go(page, params);
            }
            else{
              $state.go(page);
            }
          }
        )
      }
    };

    $scope.checkUUU = function (size) {
      var networkState = navigator.connection.type;
      var states = {};
      states[Connection.UNKNOWN] = 'Unknown';
      states[Connection.ETHERNET] = 'Ethernet';
      states[Connection.WIFI] = 'WiFi';
      states[Connection.CELL_2G] = '2G';
      states[Connection.CELL_3G] = '3G';
      states[Connection.CELL_4G] = '4G';
      states[Connection.CELL] = 'Cellgeneric';
      states[Connection.NONE] = 'Nonetwork';
      $scope.wwwsize = size;
      if (states[networkState] == 'WiFi' && ConfigService.updatecheck) {
        //TODO 此处需要注意时间控制，cancel应该不在此处，应该在判断不需要更新之后cancel掉
        //TODO 定时器时间需要设置大一点，大于更新所需要的时间
        $scope.checkForUpdates();
      } else if (states[networkState] != 'Nonetwork' && ConfigService.updatecheck) {
        $scope.testWifi();
      }
    };

    $scope.updataWww = function () {
      $scope.checkForUpdates();
      $(".updatepop").hide();
    };

    $scope.cancelUpdate = function () {
      $(".updatepop").hide();
      ConfigService.updatecheck = false;
    };

    //无wifi状况下的弹
    $scope.update_nums = 0;
    $scope.doUpdate = function () {
      $ionicDeploy.update().then(function (res) {
      }, function () {
        $(".updateper").hide();
      }, function (prog) {
        $("#per").html(parseInt(prog));
        $('.update_line').css({'width': parseInt(prog) + "%"});
      });
    };

    $scope.checkForUpdates = function () {
      $ionicDeploy.check($rootScope.no).then(function (hasUpdate) {
        $rootScope.lastChecked = new Date();
        $scope.hasUpdate = hasUpdate;
        if ($scope.hasUpdate) {
          $(".updateper").show();
          $scope.doUpdate();
        }
      }, function (err) {
      })
    };

    //$rootScope.chatBadge = 0;


    /*聊天按钮语音输入框判断标识符*/
    $scope.voicePer = 'none';
    $scope.voiceGroup = 'none';
    $scope.voiceBus = 'none';
    $scope.stateH01 = 0;
    $scope.startfun = function () {
      if (window.StatusBar) {
        StatusBar.styleLightContent();
      }
      $('input').attr('autocomplete', 'off');
      /*修改IOS状态栏高度*/
      if(device.platform != "Android") {
        var screenW0 = window.screen.width;
        var stateH0 =  640*20 / screenW0;
        $scope.stateH01 = stateH0;
        $('.bar-header.bar').css("height",80+stateH0+'px');
        $('.taskDetail_not640.bar-header.bar').css("height",65+'px');
        //$('.bar-header.bar .header_back').css("margin-top",stateH0+'px');
        $('.has-header').css({'top':80+stateH0+'px'});
        $('.has-header.not640').css({'top':65+'px'});
        $('.index-nav-bar').css({'padding-top':(stateH0-2)+'px','height':(70+stateH0)+'px'});
        $('.fix-nav').css({"top":70+stateH0+'px'});
        $('.has-subheader').css({'top':150+stateH0+'px'});
        $('.subnav_list').css({'top':80+stateH0+'px'});
        $('.subnav_mask').css({'top':150+stateH0+'px'});
        $('.allbusinessTaskBox').css({'top':80+stateH0+'px'});
        $('.account-sub-mask').css({'top':80+stateH0+'px'});
        $('.account-list-mask').css({'top':80+stateH0+'px'});
        $('.account_sub').css({'top':80+stateH0+'px'});
        /*cpc汉堡包*/
        $('.hamburgerBtn').css({'top':170+stateH0+'px'});
        $('.hamburgerBtn.not640').css({'top':'115.6px'});
        $('.taskDetailRulesBox').css({'top':80+stateH0+'px'});
        // 搜索界面
        $('.header_search').css({'margin-top':-8+'px'});
        $('.header_searchbtn').css("margin-top",stateH0+'px');
        // 主题页面
        $('.rule-information').css({'top':80+stateH0+'px'});
        // 我的收藏
        $('.mycollectionSub').css({'top':80+stateH0+'px'});
        //个人中心
        $('.center_header').css({'height':290+stateH0+'px'});
        $('.center_head').css({"margin-top":stateH0+'px'});
        //会话
        $('.msg_head').css({'padding-top':stateH0+'px','height':80+stateH0+'px'});
        //全部任务
        $('.alltaskContent').css({'top':148+stateH0+'px'});
        //会话个人详细资料
        $('.personalInforContent').css({'top':80+stateH0+'px'});
        //商家首页
        $('.bindex_content').css({'top':80+stateH0+'px'});
        //申请云销售
        $('.top-head').css({"height":80+stateH0+'px',"padding-top":stateH0+'px'});
        $('.top-head .right-button ').css("margin-top",stateH0+'px');
        $('.fuwu ').css({'top':80+stateH0+'px'});
        // 注册用户服务协议
        $('.fuwutiaokuan').css({'top':80+stateH0+'px'});
        //传播力 销售力
        $('.trans_head').css({"padding-top":stateH0+'px','height':'auto'});
        //分享-选择群
        $scope.groupHead ={'height':stateH0+80+'px'};
        $scope.groupContent = {'top':stateH0+80+'px'};
        //会话加号弹框
        $('.platform-ios .popover.msg_popview').css({'top':80+stateH0+'px !important'});
        //发起群聊、删除成员、添加成员页面
        $('.grouphastop').css({'top':stateH0+174+'px'});
        $('.customerhead').css({'top':80+stateH0+'px'});
        $('.iframeContent').css({'top':80+stateH0+'px'});
        //登录
        $('.loginCnt').css({'top':150+stateH0+'px'});
        $('.loginTab').css({'top':80+stateH0+'px'});
        $('.contentTop').css({'top':80+stateH0+'px'});
        $('.headTop').css({'height':80+stateH0+'px'});
        //秒赚
        $('.fastgetNavBox').css({'top':80+stateH0+'px'});
        $('.fastgetlist').css({'top':80+75+stateH0+'px'});
        $('.iosHeader').css({'height':80+stateH0+'px','padding-top':stateH0+'px'});
        $('.fixfastgetposition').css({'top':80+stateH0+'px'});
        //账单页面
        $('.account-header').css({'top':368+stateH0+'px'});
        //新手引导
        $scope.newguidemask6top = 190 + stateH0+'px;';
        $scope.newguidemask62H = 68 + stateH0+'px;';
        //cps详情页头部修改
        $('.helpSellHeader').css({'padding-top':stateH0+'px','height':80+stateH0+'px'});
        //销售头部
        $('.cloudsale_header').css({'padding-top':stateH0+'px','height':80+stateH0+'px'});
        //cps首页头部修改
        $('.industryTitle').css({'height':72+stateH0+'px','padding-top':stateH0+'px'});
        $('.selectIndusConetent').css({'top':72+stateH0+'px'});

      }
    };

    /**
     * 新手引导
     */
    //控制每一步页面块显示的字段
    $rootScope.step1=-1;
    $rootScope.step1InviteName="";
    $rootScope.step1InviteAvatar="";
    $rootScope.step2 = false;
    $rootScope.step3 = false;
    $rootScope.step4 = false;
    $rootScope.step5 = false;
    $rootScope.step6 = false;
    $rootScope.step7 = false;
    $scope.newguidemask6top = '190px;';
    $scope.newguidemask62H = '68px;';
    /*$rootScope.closeNewHandStepFive = function (data) {
      if(data){
        var params = {
          mod:"Naccount",
          func:"newHandFirstCpcClickAdd",
          userid: UserService.user.id,
          data:data
        };
        UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).then(function(res){
          NewHandService.syncNewHandStep(5);
          //var dataList = [{id: 1, step: 5}];
          //SqliteUtilService.insertDataOfList(dataList, "newhandlog", null, null);
        },function(){});
      }
      $rootScope.step5 = false;
      $scope.go("mypurse");
    };*/
    /**
     * 首页排名
     */
    $rootScope.congratulation = false;
    $rootScope.yestodayMoney = "0.00";
    $rootScope.yestodayPer = "";
    /**
     * 单点登录和后台自动登录
     */
    $rootScope.isFrozenOutLogin = false;
    $rootScope.isOutLogin = false;
    $rootScope.forceoutlogin = false;
    $rootScope.forceoutloginmsg = "您的帐号已在别处登录！如非本人操作，请及时修改密码。";
    $rootScope.closeIKnowWin = function (type) {
      if("undefined"!=UserService.user.id&&UserService.user.id!=""&&UserService.user.id!=null){
        if (device.platform == "Android") {
          GeTuiSdkPlugin.unSelfBindAlias(function () {
          }, UserService.user.id);
        } else {
          GeTuiSdk.unbindAlias(UserService.user.id,UserService.user.id+new Date().getTime());
        }
      }
      $rootScope.forceoutlogin = false;
      $rootScope.forceoutloginmsg = "";
      $location.path("/login");
      $rootScope.isOutLogin = false;
      if(type){
        switch (type) {
          case 0:
            $rootScope.isFrozenOutLogin = false;
            break;
          case 1:
            $rootScope.isOutLogin = false;
            break;
        }
      }else{
        if( $rootScope.isFrozenOutLogin)  $rootScope.isFrozenOutLogin = false;
        if( $rootScope.isOutLogin)  $rootScope.isOutLogin = false;
      }

    };
    $rootScope.isBackLogin = false;
    $rootScope.resetLogtoken = function () {
      UtilService.getLogtoken();
    };

    $rootScope.merryChirsBox = false;
    $scope.closeMerryChristmas = function(){
      $rootScope.merryChirsBox = false;
      $scope.go("newyear");
    };

    /*检测WiFi弹窗*/
    $scope.testWifi = function() {
      var testWifiPopup = $ionicPopup.confirm({
        title: '系统检测到您未使用WIFI网络，本次更新需要下载大约'+$scope.wwwsize+'MB数据，是否继续？', // String. 弹窗标题。
        cancelText: '继续更新', // String (默认: 'Cancel')。一个取消按钮的文字。
        cancelType: 'button-default', // String (默认: 'button-default')。取消按钮的类型。
        okText: '暂不更新', // String (默认: 'OK')。OK按钮的文字。
        okType: 'button-default'// String (默认: 'button-positive')。OK按钮的类型。

      });
      testWifiPopup.then(function(res) {
        if(!res) {
         $scope.updataWww();
        }else {
          ConfigService.updateversion = false;
        }
      });
    };




    /*强制下线弹窗*/
    $rootScope.offLinePop = function() {
      $ionicPopup.show({
        title: $rootScope.forceoutloginmsg,
        scope: $scope,
        buttons: [
          { text: '<span style="color: #007aff">我知道了</span>',
            type: 'button-positive',
            onTap:function(){
              $scope.closeIKnowWin();
            }
          }
        ]
      })
    };



  });
