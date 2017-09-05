/**
 * Created by jiaoyumin on 16/6/17.
 */

angular.module('xtui').factory('ExtensionService', function(ConfigService,$q,UtilService,UserService) {
  var cpclist = [];
  var cpslist = [];
  var cpcpageno = 1;
  var cpspageno = 1;
  var cpcdomore = true;
  var cpsdomore = true;
  var hasCpcNextPage = true;
  var hasCpsNextPage = true;
  return {
    pagination: function(){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"nStask",
        func:"getCpcListOfPcenter",
        userid: UserService.user.id,
        page:{"pageNumber":cpcpageno,"pageSize":10},
        data:{sort:"inittime",tasktype:"0",querytype:2}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果   nextPage hasNextPage 在service处理
        hasCpcNextPage = false;
        if (data.status == '000000') {
          if(angular.isUndefined(data.data.datalist) || data.data.datalist.length == 0){
            if(cpcpageno == 1){
              cpclist = "";
            }
            cpcdomore = true;
          }else{
            if(cpcpageno == 1){
              cpclist = data.data.datalist;
            }else{
              cpclist =  cpclist.concat(data.data.datalist);
            }
            if(data.data.datalist.length ==10){
              hasCpcNextPage = true;
              cpcdomore = false;
            }else {
              hasCpcNextPage = false;
              cpcdomore = true;
            }
          }
          cpcpageno++;
        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refresh:function (service,param){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"nStask",
        func:"getCpcListOfPcenter",
        userid:UserService.user.id,
        page:{"pageNumber":1,"pageSize":10},
        data:{sort:"inittime",tasktype:"0",querytype:2}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        cpclist = data.data.datalist;
        cpcpageno =2;
        hasCpcNextPage = false;
        if (data.status == '000000') {
          if(angular.isUndefined(data.data.datalist) || data.data.datalist.length == 0){
            cpclist = "";
          }else{
            if(data.data.datalist.length ==10){
              hasCpcNextPage = true;
              cpcdomore = false;
            }else {
              hasCpcNextPage = false;
              cpcdomore = true;
            }
          }
        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    refreshCps:function (service,param){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"nStask",
        func:"getUserActList",
        userid:UserService.user.id,
        page:{"pageNumber":1,"pageSize":10},
        data:{}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果
        cpslist = data.data.datalist;
        cpspageno =2;
        hasCpsNextPage = false;
        if (data.status == '000000') {
          if(angular.isUndefined(data.data.datalist) || data.data.datalist.length == 0){
            cpslist = "";
          }else{
            if(data.data.datalist.length ==10){
              hasCpsNextPage = true;
              cpsdomore = false;
            }else {
              hasCpsNextPage = false;
              cpsdomore = true;
            }
          }
        }

        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    loadmoreCps: function(){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"nStask",
        func:"getUserActList",
        userid: UserService.user.id,
        page:{"pageNumber":cpspageno,"pageSize":10},
        data:{}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(data){
        //判断数据返回结果   nextPage hasNextPage 在service处理
        hasCpsNextPage = false;
        if (data.status == '000000') {
          if(angular.isUndefined(data.data.datalist) || data.data.datalist.length == 0){
            if(cpspageno == 1){
              cpslist = "";
            }
            cpsdomore = true;
          }else{
            if(cpcpageno == 1){
              cpslist = data.data.datalist;
            }else{
              cpslist =  cpslist.concat(data.data.datalist);
            }
            if(data.data.datalist.length ==10){
              hasCpsNextPage = true;
              cpsdomore = false;
            }else {
              hasCpsNextPage = false;
              cpsdomore = true;
            }
          }
          cpspageno++;
        }
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    getCpcList:function (){
      return cpclist;
    },
    getCpsList:function (){
      return cpslist;
    },
    hasCpcNextPage:function (){
      return hasCpcNextPage;
    },
    hasCpsNextPage:function (){
      return hasCpsNextPage;
    },
    resetData: function() {
      cpclist = [];
      cpslist = [];
      cpcpageno = 1;
      cpspageno = 1;
      hasCpcNextPage = true;
      hasCpsNextPage = true;
    },
    getCpcpageno:function (){
      return cpcpageno;
    },
    getCpcDoMore:function(){
      return cpcdomore;
    },
    getCpspageno:function (){
      return cpspageno;
    },
    getCpsDoMore:function(){
      return cpsdomore;
    }
  }
});
//
