(function () {
  "use strict";

  angular
    .module("xtui")
    .factory("GroupChatService", GroupChatService);

  GroupChatService.$inject = ["ConfigService","$q","UtilService","UserService"];

  function GroupChatService(ConfigService,$q,UtilService,UserService) {
    var msgGroupFrom ="";
    var contacts = [];
    return {
      setMsgGroupFrom:function(f){
        msgGroupFrom=f;
      },
      getMsgGroupFrom:function(){
        return msgGroupFrom;
      },
      searchContacts: function(searchkeyword){
        //控制ajax请求异步变同步
        var deferred = $q.defer();
        var params = {
          mod: "IM",
          func: "searchContacts",
          userid: UserService.user.id,
          data:{"searchkeyword":searchkeyword, version:1}
        };

        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          if(data.status == "000000") {
            contacts = data.data;
            //存入sqlite
          } else {
            UtilService.showMess(data.msg);
          }
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getsearchContacts:function (){
        return contacts;
      },
      resetData: function() {
        contacts = [];
      },
      createChatGroup:function(name,members){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"createChatGroup",
          userid:UserService.user.id,
          //token:"",
          data:{
            name:name,//群名字
            members:members //成员，一组用户id，用逗号隔开
          }
      };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      queryNotGroupMembers:function(imgroupid){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"queryNotGroupMembers",
          userid:UserService.user.id,
          //token:"",
          data:{
            imgroupid:imgroupid
          }
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      deleteChatGroup:function(imgroupid){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"quitGroup",
          userid:UserService.user.id,
          //token:"",
          data:{
            imgroupid:imgroupid
          }
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      addGroupMember:function(imgroupid,memberids){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"addGroupMember",
          userid:UserService.user.id,
          //token:"",
          data:{
            imgroupid:imgroupid,
            memberids:memberids
          }
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      updateChatGroup:function(imgroupid,maps){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"updateChatGroup",
          userid:UserService.user.id,
          //token:"",
          data:{
            imgroupid:imgroupid

          }
        };
        params.data = angular.extend(params.data,maps);
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      kickGroupMember:function(imgroupid,memberid){
        var deferred = $q.defer();
        var params = {
          mod:"IM",
          func:"kickGroupMember",
          userid:UserService.user.id,
          //token:"",
          data:{
            imgroupid:imgroupid,
            memberid:memberid
          }
        };
        UtilService.post(ConfigService.imserver, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      }




    };

  }
}());
