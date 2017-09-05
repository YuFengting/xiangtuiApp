(function () {
  'use strict';

  angular
    .module('xtui')
    .factory('SearchContactsService', SearchContactsService);

  SearchContactsService.$inject = ['ConfigService',"$q","UtilService",'UserService'];

  function SearchContactsService(ConfigService,$q,UtilService,UserService) {

    var contacts = [];
    return {
      searchContacts: function(searchkeyword){
        //控制ajax请求异步变同步
        var deferred = $q.defer();
        var params = {
          mod: 'IM',
          func: 'searchContacts',
          userid: UserService.user.id,
          data:{"searchkeyword":searchkeyword, version:1}
        };

        UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
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
      }
    };

  }
}());
