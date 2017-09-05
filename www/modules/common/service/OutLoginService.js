/**
 * Created by hyygavin on 2016/10/29.
 */
angular.module('xtui')
  .factory('OutLoginService', function($rootScope,$window,CityService,MsgService,SqliteUtilService,StorageService,IMSqliteUtilService,UserService,UtilService,$ionicHistory,BusinessIndexService,TaskIndexService,FastGetService,SearchTaskService) {
    var config = {};
    var hisusers = [];
    var getHisusers = function(){
      try
      {
        plugins.appPreferences.fetch (function (resultData) {
          hisusers  =  resultData;
        }, function (resultData) {
          hisusers = [];
        }, "hisusers");
      }
      catch (e){
        hisusers = [];
      }
    };
   config.run = function(){
       if(device.platform == "Android") {
         navigator.xtuiPlugin.clearNotification(function(){
           MsgService.msgNotice = {};
         }, function(){});
       }
       $rootScope.checkedList=[];
       BusinessIndexService.readedarr=[];
       TaskIndexService.readedarr=[];
       FastGetService.readedarr=[];
       SearchTaskService.readedarr=[];
       CityService.setInCityPage(true);
       CityService.setCheck(false);
       $rootScope.city=null;
       $rootScope.step1=-1;
       $rootScope.step1InviteName="";
       $rootScope.step1InviteAvatar="";
       $rootScope.step2 = false;
       $rootScope.step3 = false;
       $rootScope.step4 = false;
       $rootScope.step5 = false;
       $rootScope.step6 = false;
       $rootScope.step7 = false;
       MsgService.stopQueryAllNew();
       SqliteUtilService.deletDataOfUser();
       StorageService.clear();
       $ionicHistory.clearCache();
       IMSqliteUtilService.dropImDataTable();
       UserService.jumpmoney = null;
       $rootScope.chatBadge = 0;
       UserService.imtab=0;
       UserService.concattab=0;
       UserService.user = {};
       plugins.appPreferences.remove(function (resultData) {
       }, function (resultData) {
       }, 'loadpage');
       if (device.platform != "Android") {
         //IOS 放开
         plugins.appPreferences.store (function (resultData) {
         }, function (resultData) {
         }, "hisusers",hisusers);
       }
   };
    return config;
  });
