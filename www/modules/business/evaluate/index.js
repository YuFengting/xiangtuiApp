angular.module('xtui')
  .controller('EvaluateController', function ($scope, EvaluateService, $stateParams) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $(".removeItem").click(function () {
      $(this).parent().parent().remove();
    });
    $scope.businessBox = function () {
      $(".collTaskContent").hide();
      $(".mycollectionSub li").removeClass("active");
      $(".mycollectionSub li:first").addClass("active");
    };
    $scope.taskBox = function () {
      $(".collTaskContent").show();
      $(".mycollectionSub li").removeClass("active");
      $(".mycollectionSub li:last").addClass("active");
    };

    //重置数据
    var ResetData = function () {
      $scope.busercommentlist = [];
      EvaluateService.resetData();
    };
    ResetData();

    var buserid = $stateParams.buserid;
    $scope.PageNo = 1;
    $scope.nonenet = false;
    $scope.hasNextPage = false;
    //上拉加载
    $scope.loadMore = function () {
      $scope.hasNextPage = false;
      EvaluateService.pagination(buserid).then(function (response) {
          if (response.status == '000000') {
            $scope.busercommentlist = EvaluateService.getBuserComments();
            $scope.hasNextPage = EvaluateService.hasNextPage();
            $scope.PageNo = EvaluateService.getpageno();
            $scope.nonenet = false;
            if ($scope.busercommentlist.length == 0 && ($scope.PageNo == 1 || $scope.PageNo == 2)) {
              $scope.nobusercommentflg = "block";
            } else {
              $scope.nobusercommentflg = "none";
            }
          } else {
            $scope.PageNo = EvaluateService.getpageno();
            $scope.nonenet = true;
            $scope.hasNextPage = false;
          }
        }, function () {
          $scope.PageNo = EvaluateService.getpageno();
          $scope.hasNextPage = false;
          $scope.nonenet = true;
        }
      ).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.hasNextPage = false;
      EvaluateService.refresh(buserid).then(function (response) {
          if (response.status == '000000') {
            $scope.busercommentlist = [];
            $scope.busercommentlist = EvaluateService.getBuserComments();
            $scope.hasNextPage = EvaluateService.hasNextPage();
            $scope.nonenet = false;
            $scope.PageNo = EvaluateService.getpageno();

            if ($scope.busercommentlist.length == 0 && ($scope.PageNo == 1 || $scope.PageNo == 2)) {
              $scope.nobusercommentflg = "block";
            } else {
              $scope.nobusercommentflg = "none";
            }
          } else {
            $scope.PageNo = EvaluateService.getpageno();
            $scope.nonenet = true;
            $scope.hasNextPage = false;
            $scope.nobusercommentflg = "block";
          }
        }, function () {
          $scope.hasNextPage = false;
          $scope.nonenet = true;
          $scope.PageNo = EvaluateService.getpageno();
          $scope.nobusercommentflg = "block";
        }
      ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.busercommentlist = EvaluateService.getBuserComments;
    if ($scope.busercommentlist.length == 0) {
      $scope.loadMore();
    }

    $scope.getCommentdetail = function () {
      $scope.nonetaskflg = "none";
      if (angular.isUndefined(buserid)) {
        buserid = "";
      }
      EvaluateService.getCommentdetail(buserid).then(function (response) {
          $scope.buser = response.data;
        }, function (data) {
        }
      )
    };
    $scope.getCommentdetail();

  });
