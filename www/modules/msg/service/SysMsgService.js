/**
 * Created by zhoulei on 2016/4/20.
 */
'use strict';
angular.module('xtui').factory('SysMsgService', function(ConfigService,$q,UtilService,UserService) {
    var sysMsgServiceList=[];
    var chatMsgList=[];
    return {
        getMessage: function(){
            //控制ajax请求异步变同步
            var deferred = $q.defer();
            var params = {
                mod:"IM",
                func:"queryChatList",
                userid: UserService.user.id,
                data: {msgtype: 4}
            };
            UtilService.post(ConfigService.imserver,{jsonstr:angular.toJson(params)}).success(function(data){
                //判断数据返回结果   nextPage hasNextPage 在service处理
                if (data.status == '000000') {
                    if(angular.isUndefined(data.data.chatList) || data.data.chatList.length == 0){
                        sysMsgServiceList = [];
                    }else{
                        sysMsgServiceList =  data.data.chatList;
                    };
                };
                deferred.resolve(data);
            }).error(function(data){
                deferred.reject(data);
            });
            return deferred.promise;
        },getSysMsgDetails: function (sysmsgtype_) {
            //控制ajax请求异步变同步
            var deferred = $q.defer();
            var params = {
                mod: 'IM',
                func: 'findMessageByType',
                userid: UserService.user.id,
                data: {
                    "sysmsgtype": sysmsgtype_
                },
                page:{pageSize:10}
            }
            UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(params)}).success(function (data) {
                //判断数据返回结果
              if(data.data && sysmsgtype_ == 2) {//云销售通知
                var getSalersSysMsgDetail = function(i) {
                  if(i < data.data.length) {
                    if(data.data[i].subtype == 1) {
                      var inviteid = data.data[i].content;
                      data.data[i].content = "查询中...";
                      var param = {
                        mod: 'IM',
                        func: 'queryInviteInfo',
                        userid: UserService.user.id,
                        data: {"inviteid":inviteid}
                      };
                      UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(param)}).success(function(result){
                        data.data[i].inviteInfo = result.data;
                        data.data[i].content = null;
                        i++;
                        getSalersSysMsgDetail(i);
                      });
                    } else {
                      i++;
                      getSalersSysMsgDetail(i);
                    }
                  } else {
                    deferred.resolve(data);
                  }
                };
                getSalersSysMsgDetail(0);

                /*
                for(var i=0;i<data.data.length;i++) {
                  if(data.data[i].subtype == 1) {//invitesalers id
                    var inviteid = data.data[i].content;
                    data.data[i].content = "查询中...";
                    var param = {
                      mod: 'IM',
                      func: 'queryInviteInfo',
                      userid: UserService.user.id,
                      data: {"inviteid":inviteid}
                    };
                    UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(param)}).success(function(result){
                      data.data[i].inviteInfo = result.data;
                      data.data[i].content = null;

                      i++;
                      getSalersSysMsgDetail(i);
                    });
                  }
                }
                */
              } else {
                deferred.resolve(data);
              }
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getSalersSysMsgDetail: function(param) {
          var deferred = $q.defer();
          UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(param)}).success(function(result){
            deferred.resolve(result);
          }).error(function (result) {
            deferred.reject(result);
          });
        },
        getMsgServiceList:function (){
            return sysMsgServiceList;
        },
        sysmsgDefinition:{
          1:"活动推送",
          2:"云销售通知",
          3:'佣金通知',
          4:'提现通知',
          5:'意见反馈',
          6:'客户通知',
          7:'活动审核通知',
          8:'活动通知'
        }
    }
});
