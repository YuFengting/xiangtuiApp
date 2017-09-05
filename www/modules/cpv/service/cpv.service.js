(function(){
  'use strict';
  angular
    .module("xtui")
    .factory("CpvService", CpvService);

  CpvService.$inject = ["ConfigService","$q","UtilService","UserService","$window","$ionicPopup"];

  function CpvService(ConfigService,$q,UtilService,UserService,$window,$ionicPopup) {
    var allsharelist = [];
    var pageno = 1;
    var hasNextPage = true;
    var readedarr = [];
    var sharetask = [];
    return {
        readedarr: readedarr,
        sharetask: sharetask,
        pagination: function (param, sortindex) {
            var deferred = $q.defer();
            var params = {
                mod: "nstask",
                func: "getVTaskList",
                userid: UserService.user.id,
                page: {"pageNumber": pageno, "pageSize": 10},
                data: param
            };
            UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                hasNextPage = false;
                if (data.status == '000000') {
                    if (angular.isUndefined(data.data) || data.data.length == 0) {
                        hasNextPage = false;
                    } else {
                        allsharelist[sortindex] = allsharelist[sortindex].concat(data.data);
                        var respage = angular.fromJson(data.page);
                        if (respage.totalPage > pageno) {
                            hasNextPage = true;
                            pageno++
                        } else {
                            hasNextPage = false;
                        }
                    }
                }
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },refresh: function (param, sortindex) {
            pageno = 2;
            var deferred = $q.defer();
            var params = {
                mod: "nstask",
                func: "getVTaskList",
                userid: UserService.user.id,
                page: {"pageNumber": 1, "pageSize": 10},
                data: param
            };
            UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                if (data.status == '000000') {
                    if (angular.isUndefined(data.data) || data.data.length == 0) {
                        allsharelist[sortindex] = [];
                        hasNextPage = false;
                    } else {
                        allsharelist[sortindex] = data.data;
                        var respage = angular.fromJson(data.page);
                        hasNextPage = respage.totalPage > 1;
                    }
                }
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getAllShareList: function (sortindex) {
            return allsharelist[sortindex];
        },
        getNextPage: function () {
            return hasNextPage;
        },
        resetData: function () {
            allsharelist = [];
            pageno = 1;
            hasNextPage = true;
        },
        getSharePageNo: function () {
            return pageno;
        },
        setSahrePageNo: function (no) {
            pageno = no
        },
        setAllSahreList: function (sharelist) {
            allsharelist = sharelist;
        },
        getCpvIndexType: function () {
            var deferred = $q.defer();
            var params = {
                mod: "ncomm",
                func: "getCpvIndustries",
                userid: UserService.user.id,
                data: {}
            };
            UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getCpvIndexType2: function () {
            var deferred = $q.defer();
            var params = {
                mod: "nStask",
                func: "getIndustryList",
                userid: UserService.user.id
            };
            UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
      /**根据taskid查询cpv详情
       * 返回data:{vtaskinfo:xxx,article:xxx}
       */
      getCPVDetail: function (taskid) {
        var deferred = $q.defer();
        var params = {
            mod: "nstask",
            func: "getVTaskDetail",
            userid: UserService.user.id,
            data:{"taskid":taskid}
        };
        UtilService.post(ConfigService.server, {"jsonstr": angular.toJson(params)}).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          UtilService.showMess("网络不给力，请稍后刷新");
          deferred.reject(data);
        });
        return deferred.promise;
      },
      /**
       * 预分享。进入详情页就调用。
       */
      backShare: function (articleid, taskid, tasktype, showstatus) {
        var deferred = $q.defer();
        var params = {
            mod: "nStask",
            func: "acceptNTask",
            userid: UserService.user.id,
            data: {'articleid': articleid, 'taskid': taskid, 'tasktype': tasktype, 'showstatus': showstatus}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
            deferred.resolve(data);
        }).error(function(data){
            UtilService.showMess("网络不给力，请稍后刷新");
            deferred.reject(data);
        });
        return deferred.promise;
      },
      /**
       * 分享成功后调用
       */
      acceptNCode: function (sharecode) {
        var deferred = $q.defer();
        var params = {
            mod: "nStask",
            func: "acceptNCode",
            userid: UserService.user.id,
            data: {'code': (sharecode + "")}
        };
        UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
            deferred.resolve(data);
        }, function () {
            deferred.reject();
        }).error(function(data){
            UtilService.showMess("网络不给力，请稍后刷新");
            deferred.reject(data);
        });
        return deferred.promise;
      },
      /**
       * 收藏/取消收藏 cpv任务
       */
      toggleCollect: function(taskid) {
          var deferred = $q.defer();
          var params = {
              mod: "nStask",
              func: "storeTask",
              userid: UserService.user.id,
              data: {"taskid": taskid, tasktype: 2}
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
              deferred.resolve(data);
          }, function () {
              deferred.reject();
          }).error(function(data){
              UtilService.showMess("网络不给力，请稍后刷新");
              deferred.reject(data);
          });
          return deferred.promise;
      },
      /**
       * ios分享
       */
      iosNewShare: function (shareurl, imageUrl, sharetitle, sharedisc) {
          var deferred = $q.defer();
          $window.simpleshare.simpleshowShare(function (resData) {
              deferred.resolve(resData);
          }, function () {
              deferred.reject();
          }, sharetitle, imageUrl, shareurl);
          return deferred.promise;
      },
      /**
       * android分享
       */
      androidShare: function (sharetype, url, imageUrl, sharetitle, sharedisc) {
          var deferred = $q.defer();
          if (sharetype == "weixin") {
              $window.weixinplugin.wxshare(function (resultData) {
                  if (resultData == 0) {
                      $ionicPopup.show({
                          title: "分享文章建议安装QQ浏览器，是否安装？",
                          buttons: [{
                              text: "否",
                              type: "button-cancel",
                              onTap: function () {
                                  $window.weixinplugin.wxlocalshare(sharetitle, sharedisc, imageUrl, url);
                              }
                          }, {
                              text: "是",
                              type: "button-cancel",
                              onTap: function () {
                                  $window.weixinplugin.qqbrowser(ConfigService.wxserver);
                              }
                          }
                          ]
                      });
                  }
              }, function () {
              }, sharetitle, sharedisc, imageUrl, url, "s", ConfigService.wxserver, UtilService.logtoken);
          } else if (sharetype == "wxZone") {
              $window.weixinplugin.wxzoneshare(function (resultData) {
                  if (resultData == 0) {
                      $ionicPopup.show({
                          title: "分享文章建议安装QQ浏览器，是否安装？",
                          buttons: [{
                              text: "否",
                              type: "button-cancel",
                              onTap: function () {
                                  $window.weixinplugin.wxzonelocalshare(sharetitle, sharedisc, imageUrl, url);
                              }
                          }, {
                              text: "是",
                              type: "button-cancel",
                              onTap: function () {
                                  $window.weixinplugin.qqbrowser(ConfigService.wxserver);
                              }
                          }
                          ]
                      });
                  }
              }, function () {
              }, sharetitle, sharedisc, imageUrl, url, "s", ConfigService.wxserver, UtilService.logtoken);
          } else if (sharetype == "qq") {
              YCQQ.checkClientInstalled(function () {
                  var args = {};
                  args.url = url;
                  args.title = sharetitle;
                  args.description = sharedisc;
                  args.imageUrl = imageUrl;
                  args.appName = "享推";
                  YCQQ.shareToQQ(function () {
                      deferred.resolve('QQ分享成功');
                  }, function () {
                      deferred.reject('QQ分享取消');
                  }, args);
              }, function () {
                  deferred.reject('未安装QQ');
              });
          } else if (sharetype == "qqZone") {
              YCQQ.checkClientInstalled(function () {
                  var args = {};
                  args.url = url;
                  args.title = sharetitle;
                  args.description = sharedisc;
                  var imgs = [imageUrl];
                  args.imageUrl = imgs;
                  YCQQ.shareToQzone(function () {
                      deferred.resolve('QQ空间分享成功');
                  }, function () {
                      deferred.reject('QQ空间分享取消');
                  }, args);
              }, function () {
                  deferred.reject('未安装QQ');
              });
          } else if (sharetype == "sinaweibo") {
              window.weibo.isInstalled("1556155109", "http://www.91weiku.com", function () {
                  window.weibo.init("1556155109", "http://www.91weiku.com", function () {
                      var args = {};
                      args.type = "image";
                      args.data = imageUrl;
                      args.text = sharetitle + url;
                      window.weibo.share(args, function () {
                          deferred.resolve('新浪微博分享成功');
                      }, function () {
                          deferred.reject('新浪微博分享取消');
                      });
                  }, function () {
                      deferred.reject('网络异常，请稍后重试');
                  })
              }, function () {
                  deferred.reject('未安装微博');
              });
          } else if (sharetype == "copylink") {
              cordova.plugins.clipboard.copy(url);
              deferred.resolve('已复制');
          } else {
              deferred.reject();
          }

          return deferred.promise;
      },
      /**
       * 自己抢.cpv领券
       */
      getCPVCoupon: function (taskid, articleid, code, tel) {
          var deferred = $q.defer();
          var params = {
              mod: "nStask",
              func: "getCpvCouponImmediately",
              userid: UserService.user.id,
              data: {"taskid": taskid, "articleid": articleid, code: code, tel: tel}
          };
          UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
              deferred.resolve(data);
          }, function () {
              deferred.reject();
          }).error(function(data){
              UtilService.showMess("网络不给力，请稍后刷新");
              deferred.reject(data);
          });
          return deferred.promise;
      }

    };

  }



})()
