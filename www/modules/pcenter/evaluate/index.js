angular.module('xtui')
  .controller("myevaluateController", function (ConfigService, $scope, UserService, UtilService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    var pagenum = 1;
    var totalpage;
    $scope.noeval = "none";
    $scope.nothing = false;

    var getCommentdetail = function () {
      var params = {
        mod: "nUser",
        func: "getCommentdetail",
        userid: UserService.user.id,
        data: {type: 1}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.usertip = data.data;
        }
      })
    };

    $scope.doRefresh = function () {
      getCommentdetail();
      pagenum = 1;
      var params = {
        mod: "nUser",
        func: "getCommentlist",
        userid: UserService.user.id,
        data: {type: 1},
        page: {"pageNumber": pagenum, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          $scope.busercomment = data.data;
          if (angular.isUndefined($scope.busercomment) || $scope.busercomment == "" || $scope.busercomment == null) {
            $scope.noeval = "block";
            $scope.nothing = false;
          } else {
            $scope.noeval = "none";
            $scope.nothing = true;
          }
          totalpage = angular.fromJson(data.page).totalPage;
          $scope.hasNextPage = totalpage > 1;
        }
      }).error(function () {
        $scope.hasNextPage = false;
        UtilService.showMess("网络不给力，请稍后重试");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.doRefresh();

    $scope.loadMore = function () {
      pagenum++;
      var params = {
        mod: "nUser",
        func: "getCommentlist",
        userid: UserService.user.id,
        data: {type: 1},
        page: {"pageNumber": pagenum, "pageSize": 10}
      };
      UtilService.post(ConfigService.server, {jsonstr: angular.toJson(params)}).success(function (data) {
        if (data.status == '000000') {
          if (angular.isDefined(data.data) && data.data.length > 0) {
            $scope.busercomment = $scope.busercomment.concat(data.data);
          }
          if (pagenum < totalpage) {
            $scope.hasNextPage = true;
          } else {
            $scope.hasNextPage = false;
          }
        }
      }).error(function () {
        $scope.hasNextPage = false;
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    UtilService.customevent("myevaluate", "收到的评价");

  });
