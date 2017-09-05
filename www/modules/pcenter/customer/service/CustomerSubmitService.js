/**
 * Created by wangjie on 2016/3/11.
 */
'use strict';
angular.module('xtui').factory('CustomerSubmitService', function(ConfigService,$q,UtilService,UserService) {
  var addCustomerFormData = [];//用于记录增加表单的缓存
  var customerDetailFormData = [];//用于记录增加表单的缓存
  var merchantList = [];
  return {
    list: function(){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"getMyMerchantListAndTask",
        userid: UserService.user.id,
        page:{"pageNumber":1,"pageSize":10},
        data:{}
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(res){

        //判断数据返回结果   nextPage hasNextPage 在service处理;
        if (res.status == '000000') {
            merchantList = res.data;
        };
        deferred.resolve(res);
      }).error(function(res){
        deferred.reject(res);
      });
      return deferred.promise;
    },
    getList:function (){
      return merchantList;
    },
    add:function(formdata,token){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod:"NStask",
        func:"referNLeads",
        userid: UserService.user.id,
        token:token,
        data:formdata
      };
      UtilService.post(ConfigService.server,{jsonstr:angular.toJson(params)}).success(function(res){
        //判断数据返回结果   nextPage hasNextPage 在service处理;
        if (res.status == '000000') {
        };
        deferred.resolve(res);
      }).error(function(res){
        deferred.reject(res);
      });
      return deferred.promise;


    },
    checkMobile: function (s) {
      var regu = /^[1][0-9][0-9]{9}$/;
      var re = new RegExp(regu);
      if (re.test(s)) {
        return true;
      } else {
        return false;
      }
    },
    check: function(formdata,fields){
      if(angular.isUndefined(formdata.name)|| ($.trim(formdata.name))==""){
        UtilService.showMess("请输入客户姓名");
        return false;
      }
      if(!UtilService.isIllegalStr($.trim(formdata.name))){
        UtilService.showMess("客户姓名包含特殊字符");
        return false;
      }

      if(angular.isUndefined(formdata.tel)|| ($.trim(formdata.tel))==""){
        UtilService.showMess("请输入正确的联系方式");
        return false;
      }

      if(!this.checkMobile($.trim(formdata.tel))){
        UtilService.showMess("请输入正确的联系方式");
        return false
      }

      if( fields.length>0){
        var fieldvalueCheck=true;
        var i = 0;
        var arr =formdata.fieldvalue.split("|");
        $.each(arr,function (n,v) {
          if(($.trim(v)=="")){
            i = n;
            fieldvalueCheck=false;
            return false;
          }
        })
        if(!fieldvalueCheck){
          if(angular.isUndefined(fields[i].name)){
            UtilService.showMess(fields[i]+"不能为空");
          }else{
            UtilService.showMess(fields[i].name+"不能为空");
          }
          return false;
        }
        /*fieldvalueCheck =true;
        i = 0;
        $.each(arr,function (n,v) {
          if(!UtilService.isIllegalStr($.trim(v))){
            i = n;
            fieldvalueCheck=false;
            return false;
          }
        })
        if(!fieldvalueCheck){
          if(angular.isUndefined(fields[i].name)){
            UtilService.showMess(fields[i]+"包含特殊字符");
          }else{
            UtilService.showMess(fields[i].name+"包含特殊字符");
          }
          return false;
        }*/
      }

      return true;
    },
    sendMsgWhileAddingCustomer:function(leadsid,merchantid,taskname){
      var newDate = new Date();
      var FomatorString="YYYY-MM-DD HH:MI:SS";
      //发给B
      var params = {
        mod:"IM",
        func:"insertIMMessage",
        data:{
          type:6,
          content:leadsid,
          receiverid:merchantid,
          subtype:1
        }
      };
      UtilService.post(ConfigService.imserver,{'jsonstr':angular.toJson(params)});
      //发给S
      params = {
        mod:"IM",
        func:"insertIMMessage",
        data:{
          type:6,
          content:"您于"+UtilService.DatetoString(newDate,FomatorString)+"针对"+taskname+"的任务提交了一条客户信息，请耐心等待商家审核",
          receiverid: UserService.user.id
        }
      };
      UtilService.post(ConfigService.imserver,{'jsonstr':angular.toJson(params)});
    },
    sendMsgWhileApplyingMoney: function(nleadspayid,pay,buserid,alias){
      var newDate = new Date();
      var FomatorString="YYYY-MM-DD HH:MI:SS";
      //发给B
      var params = {
        mod:"IM",
        func:"insertIMMessage",
        data:{
          type:3,
          content:nleadspayid,
          receiverid: buserid,
          subtype:1
        }
      };
      UtilService.post(ConfigService.imserver,{'jsonstr':angular.toJson(params)});
      //发给S
       params = {
        mod:"IM",
        func:"insertIMMessage",
        data:{
          type:3,
          content:"您于"+UtilService.DatetoString(newDate,FomatorString)+"向 "+alias+" 申请佣金 "+pay+" 元，请耐心等待商家审核",
          receiverid: UserService.user.id
        }
      };
      UtilService.post(ConfigService.imserver,{'jsonstr':angular.toJson(params)});
    },
    setAddCustomerFormData:function(id,data){
      var index =-1;
      for(var i =0;i<addCustomerFormData.length;i++){
        if(addCustomerFormData[i].taskid ==id){
          index =i;
          break;
        }
      }
      if(index>=0){
        addCustomerFormData[index].fdata = data;
      }else{
        addCustomerFormData.push({taskid:id,fdata:data});
      }
    },
    getAddCustomerFormData:function(id){
      var resdata ={};
      for(var i =0;i<addCustomerFormData.length;i++){
        if(addCustomerFormData[i].taskid ==id){
          resdata = addCustomerFormData[i].fdata;
        }
      }
      return resdata;
    },
    rmAddCustomerFormData:function(id){
      var index =-1;
      for(var i =0;i<addCustomerFormData.length;i++){
        if(addCustomerFormData[i].taskid ==id){
          index =i;
          break;
        }
      }
      if(index>=0){
        addCustomerFormData.splice(index,1);
      }
    },
    setCustomerDetailFormData:function(id,data){
      var index =-1;
      for(var i =0;i<customerDetailFormData.length;i++){
        if(customerDetailFormData[i].leadsid ==id){
          index =i;
          break;
        }
      }
      if(index>=0){
        customerDetailFormData[index].fdata = data;
      }else{
        customerDetailFormData.push({leadsid:id,fdata:data});
      }
    },
    getCustomerDetailFormData:function(id){
      var resdata ={};
      for(var i =0;i<customerDetailFormData.length;i++){
        if(customerDetailFormData[i].leadsid ==id){
          resdata = customerDetailFormData[i].fdata;
        }
      }
      return resdata;
    },
    rmCustomerDetailFormData:function(id){
      var index =-1;
      for(var i =0;i<customerDetailFormData.length;i++){
        if(customerDetailFormData[i].leadsid ==id){
          index =i;
          break;
        }
      }
      if(index>=0){
        customerDetailFormData.splice(index,1);
      }
    }

  }
});
