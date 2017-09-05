angular.module('xtui')
.factory('httpInterceptor', function ($window,$q, $injector,$rootScope,$location,$timeout,ConfigService,UserService) {
    return {
        request: function (req) {
            if(!angular.isUndefined($rootScope.xtui_s_token)&&$rootScope.xtui_s_token!="") {
                if (req.method == "GET") {
                    if(angular.isUndefined(req.params)){
                        return req;
                    }
                    var jsonStr = req.params.jsonstr;
                   /* if (jsonStr.indexOf("token") == -1) {
                        var jdata = (JSON.parse(jsonStr));
                        jdata.push=function(o){
                            if(typeof(o)=='object'){
                                for(var p in o){
                                    this[p]=o[p];
                                }
                            }
                        };
                        jdata.push({'token':$rootScope.xtui_s_token});
                        req.params.jsonstr = JSON.stringify(jdata);
                    }*/
                }else{
                    if(angular.isUndefined(req.data)){
                        return req;
                    }
                    var jsonStr = req.data.jsonstr;
                    /*if (jsonStr.indexOf("token") == -1) {
                        var jdata = (JSON.parse(jsonStr));
                        jdata.push=function(o){
                            if(typeof(o)=='object'){
                                for(var p in o){
                                    this[p]=o[p];
                                }
                            }
                        };
                        jdata.push({'token':$rootScope.xtui_s_token});
                        req.data.jsonstr = JSON.stringify(jdata);
                    }*/
                }
            }
            return req;
        },
        response:function(resp) {
          //请求超时，自动reload
           /* if(!angular.isUndefined(resp.data.status)&& resp.data.status =="500004"){
               $injector.get("$state").reload();
                //关闭提示信息
                $rootScope.s = false;
            }*/
           /* if(!angular.isUndefined(resp.data.token)&&resp.data.token!=""){
                $rootScope.xtui_s_token = resp.data.token;
            }*/
            if("100305"== resp.data.status){
              if($rootScope.isFrozenOutLogin){

                return resp;
              }
              $rootScope.isFrozenOutLogin = true ;
              $rootScope.forceoutlogin=true;
              $rootScope.forceoutloginmsg="您的账号存在异常操作，已经被冻结";
              $rootScope.offLinePop();
              if(device.platform!="Android"){
                $window.simpleshare.hideShare(function(){},function(){});
              }
              $timeout(function(){
                if($rootScope.forceoutlogin){
                  $rootScope.closeIKnowWin(0);
                }
              },5000);
            }else if("500008"== resp.data.status){
              if($rootScope.isOutLogin){
                return resp;
              }
              $rootScope.isOutLogin = true ;
              $rootScope.forceoutlogin=true;
              $rootScope.forceoutloginmsg="您的帐号已在别处登录！如非本人操作，请及时修改密码。";
              $rootScope.offLinePop();
              if(device.platform!="Android"){
                $window.simpleshare.hideShare(function(){},function(){});
              }
              $timeout(function(){
                if($rootScope.forceoutlogin){
                  $rootScope.closeIKnowWin(1);
                }
              },5000);
            }else if("500007"== resp.data.status){
              if($rootScope.isBackLogin){
                return resp;
              }
              $rootScope.isBackLogin = true ;
              var tel = UserService.user.tel;
              var pwd = UserService.user.pwd?(UserService.user.pwd):(UserService.user.psw);
              var params = {
                mod: "nUser",
                func: "login",
                data: {
                  tel: tel,
                  passwd: pwd,
                  type: 's',
                  from: ConfigService.from,
                  appversion: ConfigService.versionno,//app版本号
                  province: UserService.location.province,
                  area: UserService.location.city,//地区
                  no: device.uuid
                }
              };
              var resultData =null ;
              $.ajax({
                type: "POST",
                url: ConfigService.server,
                data: {jsonstr:angular.toJson(params)},
                dataType: "json",
                async:false,
                success: function(data){
                  resultData = data;
                }
              });
              if (resultData.status == "000000") {
                UserService.user = resultData.data;
                UserService.autologin = true;
                plugins.appPreferences.store (function (resultData) {
                  $rootScope.resetLogtoken();
                }, function (resultData) {
                }, 'logtoken', resultData.data.logtoken);

              }
              $rootScope.isBackLogin =false;
              /*$rootScope.forceoutlogin=true;
              $rootScope.forceoutloginmsg="您的帐号已在别处登录！如非本人操作，请及时修改密码。";
              $timeout(function(){
                $rootScope.forceoutlogin=false;
                $rootScope.forceoutloginmsg="";
                $location.path("/login");
              },5000);*/
            }
            return resp;
        }
    };
})
.config(function($httpProvider){
        //给http请求添加拦截器，为每个请求添加token,防止重复提交。
        $httpProvider.interceptors.push('httpInterceptor');
});
