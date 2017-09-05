(function () {
  'use strict';
  angular.module('xtui')
    .factory('NearlySaleService', NearlySaleService);

  NearlySaleService.$inject = ['$q', 'ConfigService', 'UtilService', 'UserService'];
  function NearlySaleService($q, config, util, userservice) {
    var pageno = 1;
    var taskParams = {
      latitude: userservice.location.y,
      longitude: userservice.location.x,
      city: userservice.location.city
    };
    var taskTotal = [];
    var totalPage = 0;
    var domore = true;
    return {
      getNearlySaleTask: function (userid) {
        var deferred = $q.defer();
        var params = {
          mod: "NStask",
          func: "getNearlySaleTask",
          userid: userid,
          page: {"pageNumber": 1, "pageSize": 20},
          data: taskParams
        };
        util.post(config.server, {'jsonstr': angular.toJson(params)}).success(function (res) {
          pageno = 2;
          taskTotal = res.data;
          totalPage = angular.fromJson(res.page).totalPage;
          if (res.status == '000000') {
            if (angular.isUndefined(res.data) || res.data.length == 0) {
              taskTotal = [];
            } else {
              var tasklen = 0;
              for (var i = 0; i < taskTotal.length; i++) {
                tasklen += taskTotal[i].tasklist.length;
              }
              if (tasklen == 20) {
                domore = false;
              } else {
                domore = true;
              }
            }
          }
          deferred.resolve(res);
        }).error(function () {
          util.showMess("网络不给力，请稍后刷新");
        });
        return deferred.promise;
      },
      getMoreNearlySaleTask: function (userid) {
        var deferred = $q.defer();
        var params = {
          mod: "NStask",
          func: "getNearlySaleTask",
          userid: userid,
          page: {"pageNumber": pageno, "pageSize": 20},
          data: taskParams
        };
        util.post(config.server, {'jsonstr': angular.toJson(params)}).success(function (res) {
          if (res.status == '000000') {
            if (pageno == totalPage) {
              domore = true;
            } else {
              if (res.data.length > 0) {
                taskTotal = taskTotal.concat(res.data);
                pageno++;
                var tasklen = 0;
                for (var i = 0; i < taskTotal.length; i++) {
                  tasklen += taskTotal[i].tasklist.length;
                }
                if ((tasklen % 20) == 0) {
                  domore = false;
                } else {
                  domore = true;
                }
              }
            }
          } else {
            domore = true;
          }
          deferred.resolve(res);
        }).error(function () {
          util.showMess("网络不给力，请稍后刷新");
        });
        return deferred.promise;
      },
      getReturnTask: function () {
        return taskTotal;
      },
      getHasMore: function () {
        return domore;
      }
    }
  }
}());
