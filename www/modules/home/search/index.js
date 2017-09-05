angular.module('xtui')
  .controller("SearchController", function ($scope, $rootScope, UserService, $interval, $stateParams, ConfigService, UtilService, $timeout, $ionicSlideBoxDelegate, $ionicHistory) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    $scope.user = UserService.user;
    $scope.haskey = false;
    $scope.search = {};
    $scope.showremove = false;
    $scope.hiskey = [];

    //任务与商家选择切换时scope内的全局变量
    $scope.querytyoe = 0;
    //热词列表
    $scope.keylist = [];
    //获取热搜关键词

    $scope.hotwordList = function () {
      $scope.search.key = "";
      var parm = {
        mod: "nStask",
        func: "getHotwords",
        userid: $scope.user.id,
        data: {}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(parm)}).success(function (data) {
          data.data.forEach(function (page) {
            $scope.keylist.push(page);
          });
          $ionicSlideBoxDelegate.$getByHandle('keylist').update();
        }
      )
    };
    $scope.hotwordList();

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    };

    var getData = function (res) {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var keys = resultData;
          if (keys == null || keys == "" || keys == undefined) {
            $scope.hiskey = [];
            $scope.showremove = false;
          } else {
            $scope.hiskey = keys;
            $scope.showremove = true;
          }
        }, function () {
          $scope.hiskey = [];
          $scope.showremove = false;
        }, res);
      }
      catch (e) {
        $scope.hiskey = [];
        $scope.showremove = false;
      }
    };
    getData("hiskey");

    //当不存在关键词时，不显示清空按钮
    if ($scope.search.key != null && $scope.search.key.length > 0) {
      $scope.haskey = true;
    }
    //点击清空关键词
    $scope.searchClear = function () {
      $scope.search.key = "";
      $scope.haskey = false;
    };

    //当关键词存在时，清空按钮显示
    $scope.showclose = function () {
      if ($scope.search.key != "") {
        $scope.haskey = true;
      } else if ($scope.search.key == "") {
        $scope.haskey = false;
      }
    };

    //设置数据
    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    $scope.remove = function () {
      $scope.showremove = false;
      $scope.hiskey = [];
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'hiskey');
    };
    //静态去除缓存效果
    $scope.clearHistory = function () {
      $('.history_search').hide();
      $('.search_history').hide();
      $('.clear_search').hide();
    };
    //静态搜索
    $scope.search = function () {
      $('.searching').show().delay(2000).hide(0);
    };

    //本地存储搜索历史记录
    $scope.goSearchList = function (key) {
      $scope.search.key = key;
      if (key == "" || angular.isUndefined(key) || key == null) {
        UtilService.showMess("请输入搜索关键字！");
        return;
      }
      //循环验证 key是否存储  若存在删除
      for (var i = 0; i < $scope.hiskey.length; i++) {
        if ($scope.hiskey[i] == key) {
          $scope.hiskey.splice(i, 1);
        }
      }
      //搜索关键字不为空时 存入本地
      if (key != "" && angular.isDefined(key) && key != null) {
        $scope.hiskey.unshift(key);
        //大于5个key 删除最后一个
        if ($scope.hiskey.length > 5) {
          $scope.hiskey.pop();
        }
        var dd = $scope.hiskey;
        $scope.putData('hiskey', dd);
        $scope.showremove = true;
      }
      $rootScope.testkey = key;
      $rootScope.testtype = "search";
      $scope.go('searchlist', {'type': 'search', 'key': key});
      UtilService.customevent("search", key);
    };

    $scope.goHome = function () {
      $scope.go('tab.home');
    };
    //搜索页获取焦点
    $timeout(function () {
      document.getElementById('searchFouse').focus();
    }, 200)
  })

  //搜索列表
  .controller("SearchListController", function ($scope, $rootScope, $stateParams, $cordovaKeyboard, UserService, ConfigService, UtilService, $timeout, SearchTaskService, $ionicScrollDelegate, $ionicHistory) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      if ($ionicHistory.forwardView() == null || ($ionicHistory.forwardView().stateName != "business" && $ionicHistory.forwardView().stateName != "helpselldetail" && $ionicHistory.forwardView().stateName != "taskdetail")) {
        $scope.doRefresh();
      }
    });

    $scope.picserver = ConfigService.picserver;
    $scope.user = UserService.user;
    $scope.hasNextPage = false;
    $scope.nonetask = false;
    $scope.stasklist = [];
    $scope.search = {};
    $scope.haskey = false;
    $scope.search.key = $rootScope.testkey;
    $scope.search.result = "";
    $scope.tasklist = [];

    //当不存在关键词时，不显示清空按钮
    if ($scope.search.key != null) {
      $scope.haskey = true;
    }
    $scope.showloading = false;

    $scope.closekeyboard = function () {
      if (device.platform != "Android") {
        cordova.plugins.Keyboard.close();
      }
    };

    //静态搜索页下拉选择项
    $(".search_sort").click(function () {
      $(".search_sort_list").toggle();
    });
    $(".search_list").click(function () {
      $(".search_sort span").text($(this).text());
      $(".search_sort_list").hide();
    });
    $(".header_search input").focus(function () {
      $(".search_sort_list").hide();
    });
    $(".header_back").click(function () {
      $(".search_sort_list").hide();
    });

    var getData = function () {
      try {
        plugins.appPreferences.fetch(function (resultData) {
          var keys = resultData;
          if (keys == null || keys == "" || keys == undefined) {
            $scope.hiskey = [];
            $scope.showremove = false;
          } else {
            $scope.hiskey = keys;
            $scope.showremove = true;
          }
        }, function () {
          $scope.hiskey = [];
          $scope.showremove = false;
        }, "hiskey");
      }
      catch (e) {
        $scope.hiskey = [];
        $scope.showremove = false;
      }
    };
    getData();

    //当不存在关键词时，不显示清空按钮
    if ($scope.search.key != null) {
      $scope.haskey = true;
    }
    //点击清空关键词
    $scope.searchClear = function () {
      $scope.search.key = "";
      $scope.haskey = false;
    };

    //当关键词存在时，清空按钮显示
    $scope.showclose = function () {
      if ($scope.search.key != "") {
        $scope.haskey = true;
      } else if ($scope.search.key == "") {
        $scope.haskey = false;
      }
    };

    //设置数据
    //存本地数据
    $scope.putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    $scope.remove = function () {
      $scope.showremove = false;
      $scope.hiskey = [];
      plugins.appPreferences.remove(function (resultData) {
      }, function (resultData) {
      }, 'hiskey');
    };

    //点击清空关键词
    $scope.searchClear = function () {
      $scope.search.key = "";
      $scope.haskey = false;
    };

    //当关键词存在时，清空按钮显示
    $scope.showclose = function () {

      if ($scope.search.key != "") {
        $scope.haskey = true;
      } else if ($scope.search.key == "") {
        $scope.haskey = false;
      }
    };

    //重置数据
    var ResetData = function () {
      $scope.tasklist = [];
      $scope.merchantlist = [];
    };

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.showloading = true;
      $scope.nonetask = false;
      $scope.hasmer = 1;
      $scope.hastask = 1;
      var param = $scope.search;
      param.searchtype = 1;
      param.city = $rootScope.city;
      ResetData();
      SearchTaskService.searchMerchant(param).then(function (response) {
        $scope.merchantlist = response.data.merchants;
        if($scope.merchantlist.length > 5) {
            $scope.merchantlist = $scope.merchantlist.slice(0, 5);
        }

        $scope.hasmer = response.data.hasmer;

        //查cpc
        var param1 = $scope.search;
        param1.searchtype = 2;
        SearchTaskService.searchTask(param1).then(function (response) {
          $scope.cpctasklist = response.data.tasks;
          $scope.cpchastask = response.data.hastask;
          if ($scope.hasmer == 0 && $scope.hastask == 0) {
            $scope.notaskflg = false;
          }
          $scope.showloading = false;

          $scope.cpctasks = [];
          if($scope.cpctasklist && $scope.cpctasklist.length > 5) {
              $scope.cpctasks = $scope.cpctasklist.slice(0, 5);
          } else {
              $scope.cpctasks = $scope.cpctasklist;
          }

          /*
          //区分一下cpc和cpv任务
          $scope.cpctasks = [];
          $scope.cpvtasks = [];
          if($scope.tasklist.length > 0) {
            for(var i=0;i<$scope.tasklist.length;i++) {
              if($scope.tasklist[i].type === 0 && $scope.cpctasks.length < 5) {
                  $scope.cpctasks.push($scope.tasklist[i]);
              } else if($scope.tasklist[i].type === 2 && $scope.cpvtasks.length < 5) {
                  $scope.cpvtasks.push($scope.tasklist[i]);
              }
            }
          }
          */
        }, function () {
          UtilService.showMess("网络不给力，请稍后刷新！");
        });

        //查cpv
        var param2 = $scope.search;
        param2.searchtype = 3;
        SearchTaskService.searchTask(param2).then(function (response) {
            $scope.cpvtasklist = response.data.tasks;
            $scope.cpvhastask = response.data.hastask;
            if ($scope.hasmer == 0 && $scope.hastask == 0) {
                $scope.notaskflg = false;
            }
            $scope.showloading = false;

            $scope.cpvtasks = [];
            if($scope.cpvtasklist && $scope.cpvtasklist.length > 5) {
                $scope.cpvtasks = $scope.cpvtasklist.slice(0, 5);
            } else {
                $scope.cpvtasks = $scope.cpvtasklist;
            }
        }, function () {
            UtilService.showMess("网络不给力，请稍后刷新！");
        });

      }, function () {
        UtilService.showMess("网络不给力，请稍后刷新！");
        $scope.showloading = false;
      }).finally(function () {
        $ionicScrollDelegate.$getByHandle('searchListHandler').scrollTo(0, 0, false);
        $scope.$broadcast('scroll.refreshComplete');
      });
    };


    $scope.gobusiness = function (buserid) {
      $scope.go("business", {"merchantid": buserid});
    };

    //存本地数据
    var putData = function (keyData, valueData) {
      plugins.appPreferences.store(function (resultData) {
      }, function (resultData) {
      }, keyData, valueData);
    };

    var hiskey = [];

    $scope.selectData = function () {
      if ($scope.search.key == "" || angular.isUndefined($scope.search.key) || $scope.search.key == null) {
        return;
      }
      $scope.notaskflg = true;
      $scope.hasmer = 1;
      $scope.hastask = 1;
      $scope.doRefresh();
      $cordovaKeyboard.close();
      UtilService.customevent("search", $scope.search.key);
    };

    if ($rootScope.testtype == 'search') {
      $scope.search.key = $rootScope.testkey;
      $scope.notaskflg = true;
      $scope.hasmer = 1;
      $scope.hastask = 1;
      $scope.doRefresh();
    }

    //进入详情页 区分帮忙卖
    $scope.goTaskDetail = function (task) {
      if (SearchTaskService.readedarr.indexOf(task.id) < 0)
        SearchTaskService.readedarr.push(task.id);
      if (task.showtype == 1) {
        $scope.cleargo('helpselldetail', {'taskid': task.id});
      } else if (task.showtype == 0) {
        if(task.incometype==1){
          $scope.go('cpccoudetail',{'taskid': task.id});
        }else {
          $scope.go('taskdetail', {'taskid': task.id, 'showtype': task.showtype});
        }
      } else if (task.showtype == 2) {
        $scope.go("cpvdetail", {'taskid': task.id});
      } else {
        $scope.go('taskdetail', {'taskid': task.id, 'showtype': 0});
      }
    };
    $scope.checkReaded = function (id) {
      var list = SearchTaskService.readedarr;
      return list.indexOf(id) >= 0;
    }
  });
