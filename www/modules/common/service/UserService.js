angular.module('xtui')
  .factory('UserService', function() {
    var userService = {};
    userService.user ={};
    userService.account = {};
    userService.imtab = 0;//会话tab页
    userService.concattab = 0;
    userService.xgreg = false;//信鸽成功注册  默认为false
    userService.txyflag=true;//腾讯云统计（按钮统计），网页调试开关，发布时，开关为true，网页调试时为false
    userService.txylyflag=true;//腾讯云统计(路由跳转)，网页调试开关，发布时，开关为true，网页调试时为false
    userService.autologin=false;//用户判断自动登录是否成功 默认为false
    userService.collection="";//"1":cps/cpc "0":商家
    userService.location={};//x经度 y纬度 city 城市 province 省份
    userService.msgsystemflg=0;//默认为0 1：从会话列表页进入系统详情
    userService.fastget=false;//默认为false 从首页进入秒赚列表 刷新(置为true)，返回秒赚列表不刷新
    userService.xtschoolflg=false;//默认为false,进入享推学院是否刷新
    return userService;
  });
