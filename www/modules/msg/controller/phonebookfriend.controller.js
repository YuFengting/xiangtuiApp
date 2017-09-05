(function () {
  'use strict';

  angular
    .module('xtui')
    .controller('PhonebookfriendController', PhonebookfriendController);

  PhonebookfriendController.$inject = ['$scope','PinyinConvertService','PhonebookService',"UtilService","$ionicScrollDelegate","$timeout","UserService","ConfigService"];

  function PhonebookfriendController($scope,PinyinConvertService,PhonebookService,UtilService,$ionicScrollDelegate,$timeout,UserService,ConfigService) {
    $scope.$on("$ionicView.beforeEnter",function(){
      $scope.startfun();

    })
    $scope.contactlist = [];
    $scope.lista=[];
    $scope.nocontact=false;
    //  拖拽
    var a = 38;
    var b = 109;
    $scope.toNumber=function(e) {
      var index = parseInt((e.gesture.touches[0].pageY - 300) / 21);
      var topi=0;
      if(index>$scope.contactlist.length){
        index=$scope.contactlist.length;
      }else if(index<0){
        index=0;
      }
     for(var i =0;i<index;i++){
       topi+=$scope.contactlist[i].value.length*b+a+1;
     }
      $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTo(0, topi, false);
    };

    //  点击
    $scope.ctoNumber=function(e) {
      var index =  $scope.lista.indexOf(e.target.innerText);
      var topi=0;
      for(var i =0;i<index;i++){
        topi+=$scope.contactlist[i].value.length*b+a+1;
      }
      $ionicScrollDelegate.$getByHandle('phonebSroll').scrollTo(0, topi, false);
    }


    function isChinaOrNumbOrLett(s) {//判断是否是汉字、字母、数字组成
      var regu = "^[0-9a-zA-Z\u4e00-\u9fa5]+$";
      var re = new RegExp(regu);
      if (re.test(s)) {
        return true;
      } else {
        return false;
      }
    }


    function onSuccess(contacts) {
      var mobileArr =[];
      var map =[];
      for(var i=1;i<=27;i++){
        map.push([]);
      }
      angular.forEach(contacts,function(contact){
        if(contact.phoneNumbers!=null&&contact.phoneNumbers.length>0){

          var mobile =0;
          var index = 0;
          var pingyin ="";
          var name ="";
          $.each(contact.phoneNumbers,function(n,val){
              var pno = val.value.replace(/\-/g,"");
              pno = pno.replace("+86","");
              pno = pno.replace(/\s*/g,"");
              if(/^1[0-9]{10}$/.test(pno)){
                mobile = parseInt(pno);
                mobileArr.push(pno);
                return false;
              }

          });
          if(contact.name==null){
            pingyin = "#";
            index = 26;
            name=null;
          }else if($.trim(contact.name.formatted)!=null&&$.trim(contact.name.formatted)!=""){
            var displayName = device.platform=="Android"?$.trim(contact.displayName):$.trim(contact.name.formatted);
            name=displayName;
            pingyin = PinyinConvertService.convert(displayName)[0].substring(0,1);
            if(isNaN(pingyin)){
              if(!isChinaOrNumbOrLett(pingyin)){
                pingyin = "#";
                index=26;
              }else{
                pingyin =pingyin.toLowerCase();
                index = parseInt(pingyin.charCodeAt(0))-97;
              }
            }else{
              pingyin = "#";
              index=26;
            }
          }else{
            pingyin = "#";
            index = 26;
          }
          if(mobile>0)
            map[index].push({name:name,mobile:mobile,pingyin:pingyin});
        }
      })
      PhonebookService.checkmobiles(mobileArr.join(",")).then(function(res){
        var checkResult ;
        if(res.status=="000000"){
          checkResult = res.data;
        }
        $scope.contactlist =[];
        $.each(map,function (n,v) {
          var code ="";
          if(n==26){
            code ="#";
          }else{
            code =String.fromCharCode(n+65);

          }
          var unity ={key:code,value:v};

          $.each(v,function (n,c) {
            $.each(checkResult,function (n1,v1) {
              if(parseInt(v1.mobile) == c.mobile){
                c.isExist=v1.isExist;
                c.isFriend=v1.isfriend;

                if(c.isExist==1){
                  c.userid=v1.userid;
                  c.avate=v1.avate;
                }else{
                  c.isinvited = v1.isinvited;
                }
                return false;
              }
            });
          });
          if(v.length>0){
            $scope.lista.push(code);
            $scope.contactlist.push(unity);
          }
        })

        $scope.nocontact=$scope.contactlist.length==0;
      },function(){});
    };
    function onError(contactError) {
    };

    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var filter = ["displayName", "addresses","phoneNumbers"];
    navigator.contacts.find(filter, onSuccess, onError, options);
    $scope.inviteSuccess = "none";
    $scope.inviteFail = "none";
    $scope.sendInviteMsg = function(contact ,e ){
      /*
      if(e.target.innerText=="已邀请"){
        return;
      }
      UtilService.tongji("addresslist",0);
      PhonebookService.sendInviteMsg(contact.mobile).then(function(res){
        if(res.status=="000000"){
          $scope.inviteSuccess="block";
          $timeout(function(){
            $scope.inviteSuccess="none";
            //contact.isinvited=1;
            $(e.target).removeClass("invite").addClass("added").html("已邀请");
          },1000);
        }else if(res.status=="106002"){
          $scope.inviteFail="block";
          $timeout(function(){ $scope.inviteFail="none";},1000);
        }

      },function(){});
      */

        UtilService.tongji("addresslist",0);

        //获取邀请链接
        $scope.querydata = {
            mod: 'nUser',
            func: 'getInviteUrl',
            userid: UserService.user.id
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson($scope.querydata)}).success(function (data) {
          if(data.status == "000000") {
              var message = UserService.user.nick + "邀请你一起玩赚享推，下载地址是" + data.data.url;
              //CONFIGURATION
              var options = {
                  replaceLineBreaks: true // true to replace \n by a new line, false by default
              };
              if(device.platform == "Android") {
                  options.android = {
                      intent: 'INTENT'  // send SMS with the native android SMS messaging
                      //intent: '' // send SMS without open any other app
                  };
              }
              sms.send(
                  contact.mobile + "",
                  message,
                  options,
                  function () {
                  }, function(e) {

                  });
          } else {
            UtilService.showMess(data.msg);
          }
        }, function (err) {
            UtilService.showMess("网络不给力，请稍候！");
        });

    };

    $scope.gotoShome= function(userid){
      UtilService.tongji("addresslist",1);
      $scope.go('shome',{'suserid':userid});
    }

  }
}());
