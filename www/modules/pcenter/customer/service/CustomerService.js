/**
 * Created by wangjie on 2016/3/11.
 */
'use strict';
angular.module('xtui').factory('CustomerService', function(ConfigService,$q,UtilService,UserService) {
  var customerfrom="";//用于记录进入
  var pageno = 1;
  var hasNextPage = true;
  return {
    pagination: function(params){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getMyLeadsList",
        userid: UserService.user.id,
        page:{"pageNumber":pageno,"pageSize":10},
        data:params
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果   nextPage hasNextPage 在service处理;
        hasNextPage = false;
        if (data.status == '000000') {
          if(angular.isDefined(data.data)&&data.data.length ==10){
            hasNextPage = true;
          };
          pageno ++;
        };
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh:function (params){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getMyLeadsList",
        userid: UserService.user.id,
        page:{"pageNumber":pageno,"pageSize":10},
        data:params
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果   nextPage hasNextPage 在service处理;
        hasNextPage = false;
        if (data.status == '000000') {
          if(angular.isDefined(data.data)&&data.data.length ==10){
            hasNextPage = true;
          };
          pageno ++;
        };
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getSearchIndexs:function (){
      return searchindexs;
    },
    hasNextPage:function (){
      return hasNextPage;
    },
    resetData: function() {
      pageno = 1;
      hasNextPage = true;
    },
    getpageno:function (){
      return pageno;
    },
    getLeadsLogList:function (leadsid){
      //控制ajax请求异步变同步
      var deferred = $q.defer();//延迟
      var params = {
        mod:"NStask",
        func:"getLeadsLogList",
        userid: UserService.user.id,
        page:{"pageNumber":pageno,"pageSize":10},
        data:{"leadsid":leadsid}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    applymoney:function (formdata){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"applyCommission",
        userid: UserService.user.id,
        page:{"pageNumber":pageno,"pageSize":10},
        data:formdata
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        if (data.status == '000000') {

        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getDealingLeadsDetail:function (leadsid){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getDealingLeadsDetail",
        userid: UserService.user.id,
        page:{"pageNumber":1,"pageSize":10},
        data:{"leadsid":leadsid}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        if (data.status == '000000') {

        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    leadsComment:function (token,data){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"leadsComment",
        userid: UserService.user.id,
        token:token,
        page:{"pageNumber":pageno,"pageSize":10},
        data:data
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        if (data.status == '000000') {

        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    responseCancel:function (id,acc){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"responseMerchantCancelCommission",
        userid: UserService.user.id,
        page:{"pageNumber":pageno,"pageSize":10},
        data:{"leadspayid":id,"acc":acc}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        if (data.status == '000000') {

        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    calSalersCount:function (){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NUser",
        func:"calSalersCount",
        userid: UserService.user.id,
        data:{}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getLeadsById:function (leadsid){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getLeadsById",
        userid: UserService.user.id,
        data:{leadsid:leadsid}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    setCustomerfrom:function(f){
      customerfrom = f;
    },
    getCustomerfrom:function(){
      return customerfrom;
    },
    getMyMerchantList:function(){
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getMyMerchantList",
        userid: UserService.user.id,
        data:{}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;

    }

  }


});
