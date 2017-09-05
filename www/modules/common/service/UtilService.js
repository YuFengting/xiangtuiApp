/**
 * Created by zhm on 2016-3-2.
 * 正则验证
 * 发送短信验证码与校验短信验证码
 */
angular.module('xtui')
  .factory('UtilService', function($rootScope,$timeout, $http,$q,ConfigService,UserService,$location,$window,$state,$interval) {
    var utilService = {};

    //开关，是否显示输出
    utilService.switch = true;
    utilService.log = function (message){
      try{
        if(utilService.switch){
          console.log(message);
        }
      }catch(exception){
        return 'Error:the function  log is not exist.';
      }
    };



    var toastflg = 0;
      //公共弹窗，提示信息用
      utilService.showMess  = function (mess,len,pos){
        if(mess == null || mess == undefined || mess == ""){
          // mess = "code error";
          return;
        }
        if($rootScope.isFrozenOutLogin||$rootScope.isOutLogin){
          return;
        }
          if(window.location.href.substring(0, 4) == "file") {
            if(toastflg == 0) {
              toastflg = 1;
              window.plugins.toast.show(mess, len?len:'short', pos?pos:'center', function (a) {
              }, function (b) {
              });
              $timeout(function(){
                toastflg = 0;
              }, 2000);
            }
          }
      };

      //公共弹窗，提示信息用，没有时间控制，随点随提
      utilService.showMess1  = function (mess){
        if($rootScope.isFrozenOutLogin||$rootScope.isOutLogin){
          return;
        }
        if(window.location.href.substring(0, 4) == "file") {
            window.plugins.toast.show(mess, 'short', 'center', function (a) {
            }, function (b) {
            });
        }
      };


    //批量上传图片
    utilService.uploadPictures = function(urls) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var result = [];

      var upload = function(index) {
        if(index < urls.length) {
          var options =new FileUploadOptions();
          options.fileKey="file";
          //options.mimeType="audio/spx";
          options.chunkedMode = false;
          var ft =new FileTransfer();
          ft.upload(urls[index],ConfigService.pictureserver,function win(r) {
            if(r.response=="null"||r.response==null||angular.isUndefined(r.response)){
              deferred.reject();
            }else{
              result.push(r.response);
              upload(index + 1);
            }
          }, function fail(error) {
            deferred.reject();
          },options);
        } else {
          deferred.resolve(result);
        }
      };

      upload(0);
      return deferred.promise;
    };

    utilService.isPhone = function() {
      return window.location.href.substring(0, 4) == "file";
    };

      //检查是否有网络
      utilService.checkNetwork = function () {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.NONE]     = 'Nonetwork';
        if(states[networkState] == 'Nonetwork'){
          return false;
        }else {
          return true;
        }
      }

      //检测手机号
      utilService.isMobile = function(tel){
        if(angular.isUndefined(tel)){
          return false;
        }else{
          var reg = /^[1]{1}(\d){10}$/;
          return  reg.test(tel);
        }
      };

      //检测年龄
      utilService.isAge = function(age){
        if(angular.isUndefined(age)){
          return false;
        }else{
          var reg = /^\d{1,2}$/;
          return  reg.test(age);
        }
      };

      //检测?
      utilService.isQuestion = function(str){
        if(angular.isUndefined(str)){
          return false;
        }else{
          var reg = /\？$/;
          return  reg.test(str);
        }
      };

      //检查空字符与未定义
      utilService.idDefine = function (str) {
        if(angular.isDefined(str) && str != null && str != ""){
          return true;
        }else{
          return false;
        }
      }

      utilService.MillisecondToDate = function (msd) {
        var hours = 	moment.duration(msd).hours() >9?moment.duration(msd).hours():("0"+moment.duration(msd).hours());
        var minutes = 	moment.duration(msd).minutes() >9?moment.duration(msd).minutes():("0"+moment.duration(msd).minutes());
        var seconds = 	moment.duration(msd).seconds() >9?moment.duration(msd).seconds():("0"+moment.duration(msd).seconds());
        return hours+":"+minutes+":"+seconds;
      }



      //检测密码
      utilService.isPwd = function(pwd){
        if(angular.isUndefined(pwd)){
            return false;
        }else{
          var reg = /^[A-Za-z0-9]{6,22}$/;
          return  reg.test(pwd);
        }
      };

    //检测支付密码
    utilService.isPayPwd = function(pwd){
      if(angular.isUndefined(pwd)){
        return false;
      }else{
        var reg = /^[0-9]{6}$/;
        return  reg.test(pwd);
      }
    };

    //检测商家邀请码
    utilService.isInviteCode = function(code){
      if(angular.isUndefined(code)){
        return false;
      }else{
        var reg = /^[A-Za-z0-9]{6}$/;
        return  reg.test(code);
      }
    };

      //检测邮箱
      utilService.isEmail = function(email){
        if(angular.isUndefined(email)){
          return false;
        }else{
          var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9_-])+/;
          return reg.test(email);
        }
      };

      //检测短信验证码
      utilService.isSmsCode = function(smscode){
        if(angular.isUndefined(smscode)){
          return false;
        }else{
          var  reg =  /^\d{6}$/;
          return reg.test(smscode);
        }
      };

      //检测防刷验证码（4位数字和字母组合）
      utilService.isFsCode = function(code){
        if(angular.isUndefined(code)){
          return false;
        }else{
          var reg = /^[\da-zA-Z]{4}$/;
          return reg.test(code);
        }

      };

      //检测非法字符（金额）
      utilService.isNumber = function(str){
        if(angular.isUndefined(str)){
          return false;
        }else{
          var reg = /^((\d{0,8})|0)(\.\d{1,2})?$/;
          return reg.test(str);
        }
      };

      //检测支付密码（6位数字）
      utilService.isPayPwd = function(str){
        if(angular.isUndefined(str)){
          return false;
        }else{
          var reg = /^\d{6}$/;
          return reg.test(str);
        }
      };

      //检测非法字符（中英文和数字）
      utilService.isIllegalStr = function(str){
        if(angular.isUndefined(str)){
          return false;
        }else{
          var reg = /^[\u4E00-\u9FA5\uF900-\uFA2D\da-zA-Z\]\[\，\。\,\.\、\！\?\？\@\%\；\：\(\)\（\）]+$/;
          return reg.test(str);
        }
      };

      //检测姓名（中英文）
      utilService.isNameStr = function(str){
        if(angular.isUndefined(str)){
          return false;
        }else{
          var reg = /^[\u4E00-\u9FA5a-zA-Z]+$/;
          return reg.test(str);
        }
      };

      //日期转换成字符串
      utilService.DatetoString = function(date,formator){
          var returnText = formator.toUpperCase();
          if (returnText.indexOf("YYYY") > -1)
          {
            returnText = returnText.replace("YYYY", date.getYear()+1900);
          }
          if (returnText.indexOf("MM") > -1)
          {
            var m=date.getMonth()+ 1;
            var mm=(m<10)?"0"+m:m;
            returnText = returnText.replace("MM", mm);
          }
          if (returnText.indexOf("DD") > -1)
          {
            var d=date.getDate();
            var dd=(d<10)?"0"+d:d;
            returnText = returnText.replace("DD", dd);
          }
          if (returnText.indexOf("HH") > -1)
          {
            var h=date.getHours();
            var hh=(h<10)?"0"+h:h;
            returnText = returnText.replace("HH", hh);
          }
          if (returnText.indexOf("MI") > -1)
          {
            var m=date.getMinutes();
            var mm=(m<10)?"0"+m:m;
            returnText = returnText.replace("MI", mm);
          }
          if (returnText.indexOf("SS") > -1)
          {
            var s=date.getSeconds();
            var ss=(s<10)?"0"+s:s;
            returnText = returnText.replace("SS", ss);
          }
          if (returnText.indexOf("SI") > -1)
          {
            var s=date.getMilliseconds();
            var si=(s<10)?"0"+s:s;
            returnText = returnText.replace("SI", si);
          }
          return returnText;
      }

      //发送短信验证码 codeinfo：图片验证码
      utilService.sendCode = function(tel,isuser,mtype,codeinfo,smslogtype){
          var params = {
            mod: "nComm",
            func: "sendSms",
            userid:UserService.user.id,
            data: {tel: tel, isuser: isuser, type: ConfigService.userType,mtype:mtype,
              id: codeinfo.id,
              geetest_challenge: codeinfo.geetest_challenge,
              geetest_validate: codeinfo.geetest_validate,
              geetest_seccode: codeinfo.geetest_seccode,
              token: codeinfo.token,
              pvalue: codeinfo.pvalue,
              smslogtype:smslogtype
            }
          };
          return this.get(ConfigService.server, {jsonstr: angular.toJson(params)});
      };

        //发送短信验证码
        utilService.sendSMSCode = function(tel,isuser,mtype){
            var params = {
                mod: "nComm",
                func: "sendSms",
                data: {tel: tel, isuser: isuser, type: ConfigService.userType,mtype:mtype}
            };
            return this.get(ConfigService.server, {jsonstr: angular.toJson(params)});
        };

      //接口验证短信验证码是否正确
      utilService.checkCode = function(tel,code){
          var params = {
            mod: "nComm",
            func: "checkSms",
            userid:UserService.user.id,
            data: {tel: tel, pcode: code}
          };
          return this.get(ConfigService.server,{jsonstr: angular.toJson(params)});
      };

      //http get请求
      utilService.get = function (url, data) {
        return this._http(url, "get", data);
      };

      //http post请求
      utilService.post = function (url, data) {
        return this._http(url, "post", data);
      };

      utilService.postForIM = function (url, data) {
        return this._httpForIM(url, "post", data);
      };
      //获取历史用户信息
      utilService.logtoken ="";
      utilService.getLogtoken = function (){
      try
      {
        plugins.appPreferences.fetch (function (resultData) {
          if(resultData)
            utilService.logtoken = resultData;
        }, function (resultData) {
          utilService.logtoken = "";
        }, "logtoken");
      }
      catch (e){
        utilService.logtoken = "";
      }
    };
      utilService._http = function (url, method, data) {
        var json = angular.fromJson(data.jsonstr);
        if(utilService.logtoken!=""){
          json == angular.extend(json,{"logtoken":utilService.logtoken});
          data.jsonstr = angular.toJson(json);
        }
        if(ConfigService.no!=""){
          json == angular.extend(json,{"no":ConfigService.no});
          data.jsonstr = angular.toJson(json);
        }
        if(angular.isDefined(json)&&angular.isUndefined(json.userid)){
          json == angular.extend(json,{"userid":UserService.user.id});
          data.jsonstr = angular.toJson(json);
        }

        if (angular.equals(method, "get")) {
          return $http({
            method: "get",
            url: url,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            params: data,
            timeout:30000
          });
        } else if (angular.equals(method, "post")) {
          return $http({
            method: "post",
            url: url,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            timeout:30000,
            transformRequest: function (data) {
              /**         * The workhorse; converts an object to x-www-form-urlencoded serialization.         * @param {Object} obj         * @return {String}         */
              var param = function (obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;
                for (name in obj) {
                  value = obj[name];
                  if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                      subValue = value[i];
                      fullSubName = name + '[' + i + ']';
                      innerObj = {};
                      innerObj[fullSubName] = subValue;
                      query += param(innerObj) + '&';
                    }
                  } else if (value instanceof Object) {
                    for (subName in value) {
                      subValue = value[subName];
                      fullSubName = name + '[' + subName + ']';
                      innerObj = {};
                      innerObj[fullSubName] = subValue;
                      query += param(innerObj) + '&';
                    }
                  } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                  }
                }
                return query.length ? query.substr(0, query.length - 1) : query;
              };
              return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            },
            data: data

          });
        }
      };

    utilService._httpForIM = function (url, method, data) {

        return $http({
          method: "post",
          url: url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          timeout:120000,
          transformRequest: function (data) {
            /**         * The workhorse; converts an object to x-www-form-urlencoded serialization.         * @param {Object} obj         * @return {String}         */
            var param = function (obj) {
              var query = '';
              var name, value, fullSubName, subName, subValue, innerObj, i;
              for (name in obj) {
                value = obj[name];
                if (value instanceof Array) {
                  for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value instanceof Object) {
                  for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value !== undefined && value !== null) {
                  query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
              }
              return query.length ? query.substr(0, query.length - 1) : query;
            };
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
          },
          data: data

        });

    };

    utilService.tongji = function(func, param) {
        $timeout(function(){
          var query = {
            mod: "nUser",
            func: "nSaveUserBehavior",
            data: {'fromurl':$location.path(),'tourl':$location.path(),'param':param,'func':func},
            userid:UserService.user.id
          };
          utilService.post(ConfigService.server, {'jsonstr': angular.toJson(query)}).success(function (data) {})
        },100);
    };

      utilService.customevent = function(customeventid, customeventidname) {
          if(UserService.txyflag==true) {
            $window.mta_customevent.customevent(customeventid, customeventidname);
          }
      };

      utilService.countpagecount = function(counturl) {
        if(UserService.txylyflag==true) {
          $window.mta_tencentcount.countpagecount(counturl);
        }
      };

    //跳转内部连接
    utilService.showcontentinapputil = function (event, type) {
      var appurl = null;
      console.log(event)

      if(type == undefined) {
        //用a标签包含链接信息。href没有url，innerText是url
        if(event.srcElement.nodeName == "A") {
          appurl = event.srcElement.innerText;
        }
      } else if(type && type == 1) {
        //用span包含链接信息。href有url，innerText是其他文字
        if(event.srcElement.attributes.getNamedItem("href") != undefined) {
          appurl = event.srcElement.attributes.getNamedItem("href").nodeValue;
        } else {
          appurl = null;
        }
      }else if(type && type == 2) {
        //用span包含链接信息。href有url，innerText是其他文字
        appurl = $(event.target).closest('a').attr("link");
      }


      if(appurl == undefined || appurl.length == 0) {
        return;
      }

      //判断是否是大写的http，转化为小写
      if(appurl.indexOf('Http')==0||appurl.indexOf('HTTP')==0){
        appurl=appurl.substr(0,4).toLocaleLowerCase()+appurl.substring(4);
      }

      //判断是否为www开头的，自动加入http
      if(appurl.indexOf('www')==0){
        appurl="http://"+appurl;
      }
      if(appurl.indexOf('http')==0){
        var turn_url="";
        if(appurl.indexOf('?') != -1&&appurl.indexOf('/v-') != -1){
          turn_url=appurl+"&isapp=1";
          // $state.go('iframe',{iframeurl:turn_url,name:" "});
        }else if(appurl.indexOf('?') == -1&&appurl.indexOf('/v-') != -1){
          turn_url=appurl+"?isapp=1";
          //$state.go('iframe',{iframeurl:turn_url,name:" "});
        }else {
          turn_url = appurl;
          //  $state.go('iframe',{iframeurl:turn_url});
        }
        if(turn_url.indexOf('xtbrowser') != -1) {
          window.open(turn_url, '_system', 'location=yes');
        }else if(turn_url.indexOf('xtinbrowser') != -1){
          cordova.InAppBrowser.open(turn_url, '_blank', 'location=no,clearcache=yes,closebuttoncaption=返回,toolbarposition=top');
        }else{
          $state.go('iframe',{iframeurl:turn_url});
        }


      }
    };

    //洗牌算法
      utilService.shuffle=function(arr) {
        var i,
          j,
          temp;
        for (i = arr.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
        return arr;
      };

    //制保留2位小数，如：2，会在2后面补上00.即2.00
    utilService.toDecimal2=function(x) {
      var f = parseFloat(x);
      if (isNaN(f)) {
        return false;
      }
      var f = Math.round(x*100)/100;
      var s = f.toString();
      var rs = s.indexOf('.');
      if (rs < 0) {
        rs = s.length;
        s += '.';
      }
      while (s.length <= rs + 2) {
        s += '0';
      }
      return s;
    }

    //用加密后的机器码向服务器端请求发送短信验证码
    utilService.sendSMcodeByMcode = function (tel,isuser,mtype,smslogtype) {
      var deferred = $q.defer();
        var params = {
          mod: "nComm",
          func: "sendSms2",
          data: {tel: tel, isuser: isuser, type: ConfigService.userType,mtype:mtype,smslogtype:smslogtype}
        };
        utilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (res) {
          deferred.resolve(res);
          if(res.status == "000000") {
              //发送成功后，开启60秒倒计时任务。这段时间内不允许再请求发短信
              $rootScope.countdown = 60;
              $rootScope.countdownTask = $interval(function() {
                  if($rootScope.countdown == 0) {
                      $interval.cancel($rootScope.countdownTask);
                      $rootScope.countdownTask = null;
                  } else {
                      $rootScope.countdown = $rootScope.countdown - 1;
                  }
              }, 1000);
          }
        }).error(function () {
          deferred.reject();
        });
      utilService.tongji('codeget', {no:device.uuid, tel:tel});
      return deferred.promise;
    };

    //调用$scope.go(page,params)时，记录一个标志位。有些页面需要知道是go进入还是goback进入，用该标志位进行区分。
      utilService.goStatus = {};

    utilService.post2 = function (url, jsonstr) {
        return $http({
          method: "post",
          url: url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          timeout:3000,
          transformRequest: function (data) {
            var param = function (obj) {
              var query = '';
              var name, value, fullSubName, subName, subValue, innerObj, i;
              for (name in obj) {
                value = obj[name];
                if (value instanceof Array) {
                  for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value instanceof Object) {
                  for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value !== undefined && value !== null) {
                  query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
              }
              return query.length ? query.substr(0, query.length - 1) : query;
            };
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
          },
          data: jsonstr

        });
    };


      return utilService;
  });
