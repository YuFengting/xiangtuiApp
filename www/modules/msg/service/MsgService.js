/**
 * Created by dinglei on 2016/6/22.
 */
'use strict';
angular.module('xtui').factory('MsgService', function($stateParams,$rootScope,$window,$state,FileCacheService,IMSqliteUtilService,ConfigService,$q,UtilService,UserService,StorageService,$timeout) {
  var contacts = [];
  var applys = [];
  var pageno = 1;
  var hasNextPage = true;
  var totalpage = 0;

  var perMsgOnMsg = false;

  var queryAllNewTask = null;

  //消息类型-名称对应。
  /*
  var type_name = {
    1:[图片],
    3:[文件],
    4:[语音],
    5:[位置],
    6:[客户],
    7:[任务],
    8:[销售支持],
    9:[收款],
    10:[付款],
    11:[申请佣金],
    12:[商品],
    13:[销售支持],
    14:[商家]
  };
  */

  var biaoqing = {
    "[鄙视]": "<img class='smile' src='img/emoji/bishi.png'/>",
    "[不开心]": "<img class='smile' src='img/emoji/bukaixin.png'/>",
    "[飞吻]": "<img class='smile' src='img/emoji/feiwen.png'/>",
    "[愤怒]": "<img class='smile' src='img/emoji/fennu.png'/>",
    "[害羞]": "<img class='smile' src='img/emoji/haixiu.png'/>",
    "[惊恐]": "<img class='smile' src='img/emoji/jingkong.png'/>",
    "[哭泣]": "<img class='smile' src='img/emoji/kuqi.png'/>",
    "[冷汗]": "<img class='smile' src='img/emoji/lenghan.png'/>",
    "[生病]": "<img class='smile' src='img/emoji/shengbing.png'/>",
    "[释然]": "<img class='smile' src='img/emoji/shiran.png'/>",
    "[调皮]": "<img class='smile' src='img/emoji/tiaopi.png'/>",
    "[痛苦]": "<img class='smile' src='img/emoji/tongku.png'/>",
    "[偷笑]": "<img class='smile' src='img/emoji/touxiao.png'/>",
    "[微笑]": "<img class='smile' src='img/emoji/weixiao.png'/>",
    "[包包]": "<img class='smile' src='img/emoji/baobao.png'/>",
    "[保佑]": "<img class='smile' src='img/emoji/baoyou.png'/>",
    "[错误]": "<img class='smile' src='img/emoji/cuowu.png'/>",
    "[大便]": "<img class='smile' src='img/emoji/dabian.png'/>",
    "[电话]": "<img class='smile' src='img/emoji/dianhua.png'/>",
    "[房子]": "<img class='smile' src='img/emoji/fangzi.png'/>",


    "[给力]": "<img class='smile' src='img/emoji/geili.png'/>",
    "[公交车]": "<img class='smile' src='img/emoji/gongjiaoche.png'/>",
    "[狗]": "<img class='smile' src='img/emoji/gou.png'/>",
    "[鬼]": "<img class='smile' src='img/emoji/gui.png'/>",
    "[鼓掌]": "<img class='smile' src='img/emoji/guzhang.png'/>",
    "[猴子]": "<img class='smile' src='img/emoji/houzi.png'/>",
    "[奖杯]": "<img class='smile' src='img/emoji/jiangbei.png'/>",
    "[咖啡]": "<img class='smile' src='img/emoji/kafei.png'/>",
    "[口红]": "<img class='smile' src='img/emoji/kouhong.png'/>",
    "[铃铛]": "<img class='smile' src='img/emoji/lingdang.png'/>",
    "[玫瑰]": "<img class='smile' src='img/emoji/meigui.png'/>",
    "[母鸡]": "<img class='smile' src='img/emoji/muji.png'/>",
    "[男生]": "<img class='smile' src='img/emoji/nansheng.png'/>",
    "[女生]": "<img class='smile' src='img/emoji/nvsheng.png'/>",
    "[OK]": "<img class='smile' src='img/emoji/ok.png'/>",
    "[啤酒]": "<img class='smile' src='img/emoji/pijiu.png'/>",
    "[钱]": "<img class='smile' src='img/emoji/qian.png'/>",
    "[汽车]": "<img class='smile' src='img/emoji/qiche.png'/>",
    "[拳头]": "<img class='smile' src='img/emoji/quantou.png'/>",
    "[弱]": "<img class='smile' src='img/emoji/ruo.png'/>",

    "[圣诞树]": "<img class='smile' src='img/emoji/shengdanshu.png'/>",
    "[胜利]": "<img class='smile' src='img/emoji/shengli.png'/>",
    "[手机]": "<img class='smile' src='img/emoji/shouji.png'/>",
    "[手枪]": "<img class='smile' src='img/emoji/shouqiang.png'/>",
    "[睡觉]": "<img class='smile' src='img/emoji/shuijiao.png'/>",
    "[向上]": "<img class='smile' src='img/emoji/xiangshang.png'/>",
    "[向下]": "<img class='smile' src='img/emoji/xiangxia.png'/>",
    "[向左]": "<img class='smile' src='img/emoji/xiangzuo.png'/>",
    "[向右]": "<img class='smile' src='img/emoji/xiangyou.png'/>",
    "[下雨]": "<img class='smile' src='img/emoji/xiayu.png'/>",
    "[眼睛]": "<img class='smile' src='img/emoji/yanjing.png'/>",
    "[药]": "<img class='smile' src='img/emoji/yao.png'/>",
    "[医院]": "<img class='smile' src='img/emoji/yiyuan.png'/>",
    "[鱼]": "<img class='smile' src='img/emoji/yu.png'/>",
    "[赞]": "<img class='smile' src='img/emoji/zan.png'/>",
    "[正确]": "<img class='smile' src='img/emoji/zhengque.png'/>",
    "[猪]": "<img class='smile' src='img/emoji/zhu.png'/>",
    "[寿司]": "<img class='smile' src='img/emoji/shousi.png'/>",
    "[高跟鞋]": "<img class='smile' src='img/emoji/gaogenxie.png'/>",
    "[耳朵]": "<img class='smile' src='img/emoji/erduo.png'/>"
  };
  var idmap = {};

  //转换对应表
  var transferMap = {
    "-3": "systip",
    "-2": "systip",
    "-1": "systip",
    6: "nleads",
    7: "task",
    8: "narticle",
    9: "paylog",
    10: "paylog",
    11: "nleadspay",
    12: "product",
    13: "ngbuyrl",
    14: "merchant"
  };

  var getfilename = function(str) {
    //将:替换为_, 将/替换为_.
    if(str && str.length > 0) {
      return str.replace(/\/|\:/g, "_");
    } else {
      return "noname";
    }
  };

  var msgService = {
    /**
     * 创建临时会话，并返回会话id。若已创建，直接返回会话id。
     */
    createTemporaryChat: function(buserid) {
      var deferred = $q.defer();
      var param = {
          mod:"IM",
          func:"createTemporaryChat",
          userid:UserService.user.id,
          data:{
            type: 0,
            buserid: buserid,
            suserid: UserService.user.id,
            susername: UserService.user.nick
          }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
          deferred.resolve(data);
      }).error(function(err){
          deferred.reject(err);
      });
      return deferred.promise;
    },
    //检查会话状态
    checkImgrpStatus: function(imgroupid){
      var deferred = $q.defer();
      var param = {
          mod:"IM",
          func:"checkImgrpStatus",
          userid:UserService.user.id,
          data:{
              imgroupid: imgroupid
          }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
          deferred.resolve(data);
      }).error(function(err){
          deferred.reject(err);
      });
      return deferred.promise;
    },
    //清除该imgroup在会话首页的未读角标
    clearUnread: function (imgroupid) {
      if(imgroupid != undefined) {
        IMSqliteUtilService.selectImData("select * from chatfirst where id = '"+imgroupid+"'").then(function (res) {
          if(res && res.length > 0) {
            res[0].count = 0;
            res[0].existed = true;
            IMSqliteUtilService.saveOrUpdateImData("chatfirst", res);
          }
        }, function(){});
      }
    },
    //会话首页刷新角标任务
    refreshTask: null,
    noticeid: 10000,//通知id, 从10000开始
    checkIsfriend: function(otherid) {
      var deferred = $q.defer();
      var param = {
        mod:"IM",
        func:"checkIsfriend",
        userid:UserService.user.id,
        data:{
          otheruserid: otherid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        deferred.resolve(data);
      }).error(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    //会话首页是否强制刷新
    forceFreshChatfirst: false,
    changeRemark: function(imgroupid, remark) {
      var deferred = $q.defer();
      // StorageService.getItem("chatfirst").then(function(obj){
      //   if(obj && obj.length > 0) {
      //     for(var i=0;i<obj.length;i++) {
      //       if(obj[i].imgroupid == imgroupid) {
      //         obj[i].name = remark;
      //         StorageService.setItem("chatfirst", obj).then(function(){
      //           msgService.forceFreshChatfirst = true;
      //           deferred.resolve();
      //         }, function(){
      //           deferred.reject();
      //         });
      //         break;
      //       }
      //     }
      //   }
      //   deferred.resolve();
      // }, function(){
      //   deferred.reject();
      // });
      IMSqliteUtilService.selectImData("select * from chatfirst where id = '"+imgroupid+"'").then(function (res) {
        if(res && res.length > 0) {
          res[0].name = remark;
          res[0].existed = true;
          IMSqliteUtilService.saveOrUpdateImData("chatfirst", res).then(function(){
            msgService.forceFreshChatfirst = true;
            deferred.reject();
          }, function () {
            deferred.reject();
          });
        }
      }, function(){
        deferred.reject();
      });
      return deferred.promise;
    },
    setIsread: function(id) {
      IMSqliteUtilService.selectImData("select * from chat where id = '"+id+"' and isread <> 0 ").then(function(res){
        if(res && res.length > 0) {
          var chatlog = res[0];
          chatlog.isread = 0;
          IMSqliteUtilService.updateImData("chat", [chatlog]);

          if(chatlog.contenttype == -1) {
            //入群提示
            var param = {
              mod:"IM",
              func:"setChatlogIsread",
              userid:UserService.user.id,
              data:{
                chatlogid: id
              }
            };
            UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)});
          } else if(chatlog.contenttype == 4) {
            //语音
            var param = {
              mod:"IM",
              func:"addAudioReader",
              userid:UserService.user.id,
              data:{
                chatlogid: id
              }
            };
            UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)});
          }
        }
      }, function(){});
    },
    queryGroupMember: function(imgroupid) {
      var deferred = $q.defer();
      var param = {
        mod:"IM",
        func:"queryGroupMember",
        userid:UserService.user.id,
        data:{
          imgroupid: imgroupid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      }).error(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    setGroupNotify: function(imgroupid, notify) {
      var deferred = $q.defer();
      var param = {
        mod:"IM",
        func:"setGroupNotify",
        userid:UserService.user.id,
        data:{
          imgroupid: imgroupid,
          notify: notify
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      }).error(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    queryGroupInfo: function(imgroupid) {
      var deferred = $q.defer();
      var param = {
        mod:"IM",
        func:"queryChatGroup",
        userid:UserService.user.id,
        data:{
          imgroupid: imgroupid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      }).error(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    setBMStatus: function(bmid) {
      var deferred = $q.defer();
      var param = {
        mod:"IM",
        func:"setBMStatus",
        userid:UserService.user.id,
        data:{
          bmid:bmid,
          isdel:1,
          topflg:0,
          visibility:0
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      }).error(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    /**
     * 根据imgroupid删除本地相关会话信息。包括首页和聊天记录。
     */
    deleteChatfirst: function(imgroupid) {
      IMSqliteUtilService.deleteImData("delete from chatfirst where id='"+imgroupid+"'");
      IMSqliteUtilService.deleteImData("delete from chat where imgroupid='"+imgroupid+"'");
      /*
      StorageService.getItem("chatfirst").then(function(obj){
        if(obj && obj.length > 0) {
          var tmp = [];
          for(var i=0;i<obj.length;i++) {
            if(obj[i].imgroupid != imgroupid) {
              tmp.push(obj[i]);
            } else {

            }
          }
          StorageService.setItem("chatfirst", tmp);
        }
      }, function(){});
      */
    },
    //需要从会话列表删除的会话.删除好友或商家成功后插入值
    toDeleteChat: {},
    //将聊天消息updatetime设置为较早。不使用了
    reoldChatlog: function(ids) {
      var param = {
        mod:"IM",
        func:"reoldChatlog",
        userid:UserService.user.id,
        data:{
          ids: ids
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
        } else {
        }
      }).error(function(){});
    },
    //将聊天消息updatetime设置为较早
    updateUgtime: function(imgroupids) {
      var param = {
        mod:"IM",
        func:"updateUgtime",
        userid:UserService.user.id,
        data:{
          imgroupids: imgroupids
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
        if(data.status == "000000") {
        } else {
        }
      }).error(function(){});
    },
    startQuery: null,
    //http请求获取新数据
    queryAllNew : function(currentSQ) {
      //var currentSQ = this.startQuery;
      //如果当前没有用户信息,说明未登录.10秒后再试
      if(UserService.user == undefined || UserService.user == {} || UserService.user.id == undefined) {
        //queryAllNewTask = $timeout(function(){
        //  msgService.queryAllNew();
        //}, 2000);
        return;
      } else {
        //收集本地各会话最新的id
        var currentUserid = UserService.user.id;

        StorageService.getItem("chatIdmap").then(function(obj){
          idmap = obj;
          var param = {
            mod:"IM",
            func:"queryAllNew",
            page:{pageNumber:1, pageSize:10},
            userid: UserService.user.id,
            data:{
              idmap: idmap,
              client: "sapp",
              clientv: IMSqliteUtilService.imDataBaseVersion
            }
          };
          UtilService.postForIM(ConfigService.imserver, {'jsonstr':angular.toJson(param)}).success(function (data) {
            if(currentSQ != msgService.startQuery) {
              //alert("无用的sq，舍弃结果");
              return;
            }

            if(UserService.user == undefined || UserService.user == {} || currentUserid != UserService.user.id) {
              //queryAllNewTask = $timeout(function(){
              //  msgService.queryAllNew();
              //}, 2000);
              return;
            } else {
              if(data.status == "000000") {
                /*
                if($state.current.name == "tab.msg" && UserService.imtab == 0) {
                  //在会话页，则不显示红点
                } else if(data.data != null) {
                  if((data.data.sysmsg && data.data.sysmsg.length>0) || (data.data.newchat && data.data.newchat.length>0) || (data.data.systemmsg && data.data.systemmsg.length>0)) {
                    setTimeout(function(){
                      //$rootScope.chatBadge = 1;
                    }, 0);
                  }
                }
                */
                if(data.data != null) {
                  //跳钱相关
                  if (UserService.jumpmoney != undefined) {
                    if (UserService.jumpmoney < data.data.money) {
                      var diff = data.data.money - UserService.jumpmoney;
                      $rootScope.deltamoney = diff.toFixed(2);
                      //播放跳钱动画
                      $rootScope.showGetmoney = true;
                      $timeout(function () {
                        $rootScope.showGetmoney = false;
                      }, 2500);
                      UserService.jumpmoney = data.data.money;
                    }
                  }
                  UserService.jumpmoney = data.data.money;
                }

                if(data.data && data.data.newim == true) {
                  //保存到本地
                  //保存idmap
                  var chatList = data.data.hhsy.chatList;
                  idmap = {};
                  var tmpCount = 0;

                  var needAlert = false;
                  for(var i=0;i<chatList.length;i++) {
                    idmap[chatList[i].imgroupid] = chatList[i].newreceiveid;
                    tmpCount += parseInt(chatList[i].count);
                    if(parseInt(chatList[i].count) > 0) {
                      needAlert = true;
                    }
                  }
                  //如果不再会话页面，则通过此处刷新角标
                  if($state.current.name != "tab.msg") {
                    $rootScope.chatBadge += tmpCount;
                    StorageService.setItem("chatBadge", $rootScope.chatBadge);
                  }

                  /*
                  for(var i=0;i<newMsg.length;i++) {
                    if($stateParams.imgroupid != newMsg[i].imgroupid && newMsg[i].imuserid != UserService.user.id) {
                      //页面不对应，并且不是自己发的。推送消息
                    }
                  }
                  //判断是否要有提示音
                  if(newMsg.length > 1) {
                    //多个会话有新消息，此时使用本地推送。但是要判断是否每个会话都要使用本地推送。

                  } else if(newMsg.length == 1) {
                    //如果不再该会话聊天页，则使用本地推送。否则，只播放提示音
                  }
                  */
                  //$("#notice_audio")[0].play();

                  if(data.data.latestSystemmsgid) {
                    idmap["-1"] = data.data.latestSystemmsgid;//系统通知胡最新id
                  }
                  StorageService.setItem("chatIdmap", idmap);

                  /*
                  //保存会话首页
                  StorageService.getItem("chatfirst").then(function(obj){
                    var newList = data.data.hhsy.chatList;
                    var oldList = obj;
                    var oldMap = {};
                    if(oldList == null || oldList.length == 0) {

                    } else {
                      for(var i=0;i<oldList.length;i++) {
                        if(oldList[i].count > 0) {
                          oldMap[oldList[i].imgroupid] = oldList[i].count;
                        }
                      }
                      for(var i=0;i<newList.length;i++) {
                        if(oldMap[newList[i].imgroupid] >= 0) {
                          newList[i].count = parseInt(newList[i].count) + parseInt(oldMap[newList[i].imgroupid]);
                        }
                        //如果在对应的imgroup里，则角标数字设置为0
                        if(($state.current.name == "msgdetail" || $state.current.name == "permsgdetail" || $state.current.name == "msggroup") && ConfigService.currentIMgrpid == newList[i].imgroupid) {
                          newList[i].count = 0;
                        }
                      }
                    }
                    StorageService.setItem("chatfirst", newList);

                  }, function(){});
                  */

                  //sapp3.5以上 启用chatfirst表
                  IMSqliteUtilService.selectImData("select * from chatfirst").then(function (res) {
                    var newList = data.data.hhsy.chatList;
                    for(var i=0;i<newList.length;i++) {
                      newList[i].id = newList[i].imgroupid;
                    }

                    var oldList = res;
                    var oldMap = {};
                    if(oldList == null || oldList.length == 0) {

                    } else {
                      for(var i=0;i<oldList.length;i++) {
                        if(oldList[i].count >= 0) {
                          oldMap[oldList[i].imgroupid] = oldList[i].count;
                        }
                      }
                      for(var i=0;i<newList.length;i++) {
                        if(oldMap[newList[i].imgroupid] >= 0) {
                          newList[i].existed = true;
                          newList[i].count = parseInt(newList[i].count) + parseInt(oldMap[newList[i].imgroupid]);
                        }
                        //如果在对应的imgroup里，则角标数字设置为0
                        if(($state.current.name == "msgdetail" || $state.current.name == "permsgdetail" || $state.current.name == "msggroup") && ConfigService.currentIMgrpid == newList[i].imgroupid) {
                          newList[i].count = 0;
                        }
                      }
                    }
                    IMSqliteUtilService.saveOrUpdateImData("chatfirst", newList);
                  }, function () {
                    
                  });

                  //保存系统通知
                  if(data.data.systemmsg) {
                    IMSqliteUtilService.insertImObject("systemmsg", data.data.systemmsg);
                    /*
                    StorageService.getItem("systemmsg").then(function(obj){
                      if(obj) {
                        obj.count += data.data.systemmsg.length;
                        obj.title = data.data.systemmsg[0].title;
                      } else {
                        obj = {
                          //count: data.data.systemmsg.length,
                          count: 0, //obj为undefined，此时数量设置为0
                          title: data.data.systemmsg[0].title
                        };
                      }
                      StorageService.setItem("systemmsg", obj);
                    }, function(){});
                    */
                  }

                  //保存各会话的最新logid
                  //保存聊天页新消息
                  if(data.data.newchat && data.data.newchat.length > 0) {
                    //下载图片和音频
                    for(var k=0;k<data.data.newchat.length;k++) {
                      var chatlog = data.data.newchat[k];
                      if(chatlog.contenttype == 1) {
                        //图片
                        var options = {
                          filename: getfilename(chatlog.content),//chatlog.id,
                          uri: ConfigService.picserver+chatlog.content,
                          mod: "IM"
                        };
                        FileCacheService.saveFile(options);
                      } else if(chatlog.contenttype == 4) {
                        //语音
                        var options = {
                          filename: getfilename(chatlog.content),//chatlog.id,
                          uri: chatlog.content,
                          mod: "IM"
                        };
                        FileCacheService.saveFile(options);
                      }
                    }

                    IMSqliteUtilService.insertImObject("chat", data.data.newchat);
                    var noticeFun = function(i) {
                      if(i<data.data.newchat.length && i<10) {
                        //对新消息进行判断，要不要出现推送通知
                        if(data.data.newchat[i].senderid != UserService.user.id && data.data.newchat[i].notify == 0) {
                          //要提示
                          if(ConfigService.pause ==false &&
                            (($state.current.name == "permsgdetail" || $state.current.name == "msgdetail") && $stateParams.imgroupid == data.data.newchat[i].imgroupid) ||
                            ($state.current.name == "msggroup" && $stateParams.imgroupid == data.data.newchat[i].imgroupid)) {
                            $("#notice_audio")[0].play();
                            noticeFun(i+1);
                          } else {
                            /*
                            cordova.plugins.notification.local.schedule({
                              id: msgService.noticeid,
                              title: data.data.newchat[i].imgroupname || data.data.newchat[i].name,
                              text: data.data.newchat[i].typename || data.data.newchat[i].content,
                              // sound: "http://image.tupian114.com/20140417/14291650.png",//"/android_asset/www/audio/notice.mp3",
                              // icon: "android.resource://com.datawin.xtui/drawable/icon.png",//"/android_asset/img/about_logo.png",
                              data: { meetingId:"#123FG8" }
                            }, function (result) {
                              data.data.newchat[i].type = 1;
                              msgService.msgNotice[msgService.noticeid] = data.data.newchat[i];
                              msgService.noticeid++;
                              $("#notice_audio")[0].play();
                              noticeFun(i+1);
                            });
                            */


                            $window.xgpush.addLocalNotification(1, data.data.newchat[i].imgroupname || data.data.newchat[i].name, data.data.newchat[i].typename || data.data.newchat[i].content, function(obj){
                              $("#notice_audio")[0].play();
                              data.data.newchat[i].type = 1;
                              msgService.msgNotice[obj] = data.data.newchat[i];
                              noticeFun(i+1);
                            }, function(){
                              noticeFun(i+1);
                            });

                          }
                        } else {
                          noticeFun(i+1);
                        }
                      }
                    };
                    if(needAlert) {
                      noticeFun(0);
                    }

                  }

                  //更新聊天页消息
                  if(data.data.updatechat && data.data.updatechat.length > 0) {
                    var confirmIds = [];
                    var temp = {};
                    for(var i=0;i<data.data.updatechat.length;i++) {
                      temp[data.data.updatechat[i].imgroupid] = 1;
                    }
                    for(var id in temp) {
                      confirmIds.push(id);
                    }

                    //请求服务器将confirmIds里的聊天记录改变状态
                    //msgService.reoldChatlog(confirmIds);
                    msgService.updateUgtime(confirmIds);

                    IMSqliteUtilService.updateImData("chat", data.data.updatechat);
                  }

                  //保存系统通知页
                  if(data.data.sysmsg) {
                    IMSqliteUtilService.insertImObject("sysmsg", data.data.sysmsg);
                  }

                  //再次调用queryAllNew
                  queryAllNewTask = $timeout(function(){
                    msgService.queryAllNew(currentSQ);
                  }, 2000);
                } else {
                  //再次调用queryAllNew
                  queryAllNewTask = $timeout(function(){
                    msgService.queryAllNew(currentSQ);
                  }, 2000);
                }
              } else {
                //一般情况下不会出现
                queryAllNewTask = $timeout(function(){
                  msgService.queryAllNew(currentSQ);
                }, 10000);
              }
            }
          }).error(function(){
            if(currentSQ != msgService.startQuery) {
              //alert("无用的sq，舍弃结果");
              return;
            }
            queryAllNewTask = $timeout(function(){
              msgService.queryAllNew(currentSQ);
            }, 10000);
          });
        }, function(){
          if(currentSQ != msgService.startQuery) {
            //alert("无用的sq，舍弃结果");
            return;
          }
          queryAllNewTask = $timeout(function(){
            msgService.queryAllNew(currentSQ);
          }, 10000);
        });
      }


    },
    stopQueryAllNew: function() {
      if(queryAllNewTask) {
        $timeout.cancel(queryAllNewTask);
      }
    },
    //查询本地系统通知
    querySystemmsg: function(option) {
      var limit = option.limit;
      var ltid = option.ltid;
      var gtid = option.gtid;

      var sql = "select * from systemmsg where 1=1 ";
      if(gtid) {
        sql += " and id > '"+gtid+"' ";
      }
      if(ltid) {
        sql += " and id < '"+ltid+"' ";
      }
      sql += " order by id desc ";
      if(limit != null) {
        sql += " limit "+limit+" ";
      }
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      IMSqliteUtilService.selectImData(sql).then(function(res){
        //倒转
        if(res && res.length > 0) {
          var newArray = [];
          for(var i=0;i<res.length;i++) {
            newArray[i] = res[res.length - 1 - i];
            //如果是复杂类型，要转换
            if(transferMap[newArray[i].contenttype]) {
              var prop = transferMap[newArray[i].contenttype];
              newArray[i][prop] = angular.fromJson(newArray[i][prop]);
            }
          }
          deferred.resolve(newArray);
        } else {
          deferred.resolve(res);
        }
      },function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    //从sqlite获得聊天记录
    queryChatlogFromSqlite: function(option){
      var imgroupid = option.imgroupid;
      var gtid = option.gtid;
      var ltid = option.ltid;
      var limit = option.limit;

      var sql = "select * from chat where 1=1 and imgroupid = '"+imgroupid+"' ";
      if(gtid) {
        sql += " and id > '"+gtid+"' ";
        //sql += " and (senderid <> '"+UserService.user.id+"' or contenttype < 0) ";
      }
      if(ltid) {
        sql += " and id < '"+ltid+"' ";
      }

      sql += " order by id desc ";
      if(limit != null) {
        sql += " limit "+limit+" ";
      }

      var transferContent = function(obj) {
        //如果是图片或语音，要用本地的
        if(obj.contenttype == 1) {
          var options = {
            filename: getfilename(obj.content),//obj.id,
            mod: "IM"
          };
          FileCacheService.getCacheFile(options).then(function(entry){
            obj.content = entry.toURL();
          }, function(){
            obj.content = ConfigService.picserver + obj.content;
            //本地没有文件，下载文件。
            var options = {
              filename: getfilename(obj.content),//obj.id,
              uri: obj.content,
              mod: "IM"
            };
            FileCacheService.saveFile(options);
          });
        } else if(obj.contenttype == 4) {
          var options = {
            filename: getfilename(obj.content),//obj.id,
            mod: "IM"
          };
          FileCacheService.getCacheFile(options).then(function(entry){
            obj.content = entry.toURL();
          }, function(){
            //本地没有文件，下载文件。
            var options = {
              filename: getfilename(obj.content),//obj.id,
              uri: obj.content,
              mod: "IM"
            };
            FileCacheService.saveFile(options);
          });
        }
      };

      //控制ajax请求异步变同步
      var deferred = $q.defer();
      IMSqliteUtilService.selectImData(sql).then(function(res){
        //倒转
        if(res && res.length > 0) {
          var newArray = [];
          for(var i=0;i<res.length;i++) {
            newArray[i] = res[res.length - 1 - i];
            //如果是复杂类型，要转换
            if(transferMap[newArray[i].contenttype]) {
              var prop = transferMap[newArray[i].contenttype];
              newArray[i][prop] = angular.fromJson(newArray[i][prop]);
            }

            if(newArray[i].contenttype == 1 || newArray[i].contenttype == 4) {
              new transferContent(newArray[i]);
            }

          }
          deferred.resolve(newArray);

          if(ltid && res.length < limit) {
            //如果查本地历史的时候，查到的数量小于limit，则去服务器查一次。
            msgService.queryChatlog(imgroupid, ltid).then(function(resData){
              if(resData.status == "000000") {
                IMSqliteUtilService.insertImObject("chat", resData.data);
              }
            }, function () {

            });
          }
        } else {
          if(ltid) {
            msgService.queryChatlog(imgroupid, ltid).then(function(resData){
              if(resData.status == "000000" && resData.data && resData.data.length > 0) {
                IMSqliteUtilService.insertImObject("chat", resData.data);
                if(resData.data.length > limit) {
                  deferred.resolve(resData.data.slice(resData.data.length-limit, resData.data.length));
                } else {
                  deferred.resolve(resData.data);
                }
              } else {
                deferred.resolve(res);
              }
            }, function () {
              deferred.resolve(res);
            });
          } else {
            deferred.resolve(res);
          }
        }
      },function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    //从服务器获取历史消息
    queryChatlog: function (imgroupid, ltid) {
      var deferred = $q.defer();
      var params = {
        mod:"IM",
        func:"queryChatLog",
        userid:UserService.user.id,
        page:{pageNumber:1,pageSize:50},
        data:{
          client: "sapp",
          clientv: IMSqliteUtilService.imDataBaseVersion,
          imgroupid: imgroupid,
          ltid: ltid
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //从sqlite获得系统通知
    querySysmsgFromSqlite: function(option){
      var type = option.type;
      var gtid = option.gtid;
      var ltid = option.ltid;
      var limit = option.limit;

      var sql = "select * from sysmsg where 1=1 and type = "+type+" ";
      if(gtid) {
        sql += " and id > '"+gtid+"' ";
      }
      if(ltid) {
        sql += " and id < '"+ltid+"' ";
      }

      sql += " order by id desc ";
      if(limit != null) {
        sql += " limit "+limit+" ";
      }

      //控制ajax请求异步变同步
      var deferred = $q.defer();
      IMSqliteUtilService.selectImData(sql).then(function(res){
        //倒转
        if(res && res.length > 0) {
          var newArray = [];
          for(var i=0;i<res.length;i++) {
            newArray[i] = res[res.length - 1 - i];
            //如果是复杂类型，要转换
            if(transferMap[newArray[i].contenttype]) {
              var prop = transferMap[newArray[i].contenttype];
              newArray[i][prop] = angular.fromJson(newArray[i][prop]);
            }
          }

          if(ltid && res.length < limit) {
              //如果查本地历史的时候，查到的数量小于limit，则去服务器查一次。
              msgService.querySysmsgFromServer(type, ltid).then(function(resData){
                  if(resData.status == "000000") {
                      IMSqliteUtilService.insertImObject("sysmsg", resData.data);
                  }
              }, function () {

              });
          }

          if(type == 2) {//云销售
            var getSalersSysMsgDetail = function(i) {
              if(i < newArray.length) {
                if(newArray[i].subtype == 1) {
                  var inviteid = newArray[i].content;
                  newArray[i].content = "查询中...";
                  var param = {
                    mod: 'IM',
                    func: 'queryInviteInfo',
                    userid: UserService.user.id,
                    data: {"inviteid":inviteid}
                  };
                  UtilService.post(ConfigService.imserver, {jsonstr: angular.toJson(param)}).success(function(result){
                    if(result.status == "000000") {
                      newArray[i].inviteInfo = result.data;
                      newArray[i].content = null;
                    } else {
                      newArray[i].content = "网络不给力，查询失败...";
                    }
                  }).error(function(){
                    newArray[i].content = "网络不给力，查询失败...";
                  }).finally(function(){
                    i++;
                    getSalersSysMsgDetail(i);
                  });
                } else {
                  i++;
                  getSalersSysMsgDetail(i);
                }
              } else {
                deferred.resolve(newArray);
              }
            };
            getSalersSysMsgDetail(0);
          } else {
            deferred.resolve(newArray);
          }
        } else {
            if(ltid) {
                msgService.querySysmsgFromServer(type, ltid).then(function(resData){
                    if(resData.status == "000000" && resData.data && resData.data.length > 0) {
                        IMSqliteUtilService.insertImObject("sysmsg", resData.data);
                        // if(resData.data.length > limit) {
                        //     deferred.resolve(resData.data.slice(resData.data.length-limit, resData.data.length));
                        // } else {
                        //     deferred.resolve(resData.data);
                        // }
                        deferred.resolve(res);
                    } else {
                        deferred.resolve(res);
                    }
                }, function () {
                    deferred.resolve(res);
                });
            } else {
                deferred.resolve(res);
            }
        }
      },function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    //从服务器查询历史系统消息
    querySysmsgFromServer: function (type, ltid) {
        var deferred = $q.defer();
        var params = {
            mod:"IM",
            func:"findMessageByType",
            userid:UserService.user.id,
            page:{pageNumber:1,pageSize:50},
            data:{
                client: "sapp",
                clientv: IMSqliteUtilService.imDataBaseVersion,
                sysmsgtype: type,
                ltid: ltid
            }
        };
        UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
            deferred.resolve(data);
        }).error(function(data){
            deferred.reject(data);
        });
        return deferred.promise;
    },
    queryApply: function() {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'IM',
        func: 'queryIMApply',
        userid: UserService.user.id
      };

      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
        if(data.status == "000000") {
          applys = data.data;
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

    //3.5修改
    queryApplyLog: function(option) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'IM',
        func: 'queryIMApplyLog',
        userid: UserService.user.id,
        data: {ltid:option.ltid, pageSize:option.pagesize}
      };

      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
        if(data.status == "000000") {
          applys = data.data;
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
    //3.5 查询未读的好友申请
    queryUnreadIMApplyLogCount: function () {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'IM',
        func: 'queryUnreadIMApplyLogCount',
        userid: UserService.user.id
      };

      UtilService.post(ConfigService.imserver, {'jsonstr': angular.toJson(params)}).success(function(data){
        if(data.status == "000000") {
          applys = data.data;
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
    //申请好友
    insertIMApply: function (otheruserid, remark) {
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'IM',
        func: 'insertIMApply',
        userid: UserService.user.id,
        data:{
          userid: UserService.user.id,
          receiverid: otheruserid,
          remark: remark
        }
      };
      UtilService.post(ConfigService.imserver, {'jsonstr':angular.toJson(params)}).success(function(data){
        deferred.resolve(data);
      }).error(function(){
        deferred.reject(data);
      });
      return deferred.promise;
    },

    transform: function(str) {

      var words = str;
      //var pattern = "\\[.{1,2}\\]";
      var pattern = "\\[[^\\[&^\\]]{1,}\\]";

      var reg = new RegExp(pattern, "g");


      var match = {};
      var result;
      do{
        result = reg.exec(words);
        if(result != null && biaoqing[result] && match[result] == null) {
          match[result] = result;
        }
      } while(result != null)
      for(var key in match) {
        var ptn = "\\"+key.substring(0, key.length-1)+"\\"+key.substring(key.length-1, key.length);
        words = words.replace(new RegExp(ptn, "g"), biaoqing[key]);
      }
      return words;
    },


    queryContacts: function(option){
      //控制ajax请求异步变同步
      var deferred = $q.defer();
      var params = {
        mod: 'IM',
        func: 'queryContacts',
        userid: UserService.user.id,
        data: option
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

    getContacts:function (){
      return contacts;
    },
    getApplys:function() {
      return applys;
    },
    getPerMsgOnMsg: function() {
      return perMsgOnMsg;
    },
    setPerMsgOnMsg: function(state) {
      perMsgOnMsg = state;
    },
    hasNextPage:function (){
      return hasNextPage;
    },
    resetData: function() {
      contacts = [];
      pageno = 1;
      hasNextPage = true;
    },
    getPageNo:function (){
      return pageno;
    },
    msgNotice:{}
  };

  return msgService;
});
