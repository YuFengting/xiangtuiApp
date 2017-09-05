angular.module('xtui')
/*我的收藏*/
  .controller('CollectionController', function ($scope, $timeout, UtilService, ConfigService, UserService, $location,CollectionService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
      //"0":cpc, "2":cpv 切换
      if (UtilService.collection == "0") {
        $scope.ctaskflag = 0;
        $scope.type = "0";
        $scope.getStorelist();
        $(".collTaskContent").hide();
        $scope.showctasklist = true;
      } else if (UtilService.collection == "2") {
        $scope.vtaskflag = 0;
        $scope.type = "2";
        $scope.getStorelist();
        $(".collTaskContent").show();
        $scope.showctasklist = false;
      }
      UtilService.collection = "";
    });
    $scope.$on("$ionicView.beforeLeave", function () {
      $('.item-left-editable .item-content').css('transform', 'translate3d(0px, 0px, 0px)');
      $('.item-right-editable .item-content').css('transform', 'translate3d(0px, 0px, 0px)');
    });

    $scope.user = UserService.user;
    $scope.picserver = ConfigService.picserver;
    $scope.noctaskflag = "none";
    $scope.novtaskflg = "none";
    $scope.hasNextPage = false;
    $scope.type = "0";
    $scope.showctasklist = true;

    //获取收藏列表
    $scope.getStorelist = function () {
      $scope.PageNo = 1;
      $scope.ctasklist = [];
      $scope.vtasklist = [];
      //type 0:cpc ,2:cpv
      CollectionService.getStore($scope.type,$scope.PageNo).then(function(data){
        if (data.status == '000000') {
          var page = angular.fromJson(data.page).totalPage;
          //判断cpc,cpv
          if ($scope.type == '0') {
            $scope.ctasklist = data.data;
            //cpc任务是否有值
            if ($scope.ctasklist.length == '0') {
              $scope.noctaskflag = "block";
            } else {
              $scope.noctaskflag = "none";
            }
          } else {
            $scope.vtasklist = data.data;
            //cpv任务是否有值
            if ($scope.vtasklist.length == '0') {
              $scope.novtaskflg = "block";
            } else {
              $scope.novtaskflg = "none";
            }
          }
          $scope.hasNextPage = page > 1;
        }
        $scope.listloadding = false;
      },function () {
        $scope.listloadding = false;
        UtilService.showMess("网络不给力，请稍后刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.getStorelist();

    //加载更多收藏任务
    $scope.loadMore = function () {
      $scope.hasNextPage = false;
      $scope.PageNo++;
      //type 0:cpc ,2:cpv
      CollectionService.getStore($scope.type,$scope.PageNo).then(function(data){
        if (data.status == '000000') {
          var page = angular.fromJson(data.page).totalPage;
          //判断cpc,cpv任务
          if ($scope.type == '0') {
            if (data.data.length != 0) {
              $scope.ctasklist = $scope.ctasklist.concat(data.data);
            }
          } else {
            if (data.data.length != 0) {
              $scope.vtasklist = $scope.vtasklist.concat(data.data);
            }
          }
          $scope.hasNextPage = page > $scope.PageNo;
        }
        $scope.listloadding = false;
      },function () {
        $scope.listloadding = false;
        UtilService.showMess("网络不给力，请稍后刷新");
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    //删除任务
    var flg = 0;
    $scope.storeTask = function (taskid,type) {
      if (flg != 0) {
        return;
      }
      flg = 1;
      CollectionService.deleteTask(taskid,type).then(function (response) {
        if (response.status == '000000') {
          UtilService.showMess("删除成功！");
          $scope.getStorelist('0');
        }
        flg = 0
      },function () {
        flg = 0;
        UtilService.showMess("网络不给力，请稍后刷新");
      });

      UtilService.customevent("mycollection", "删除任务");
      UtilService.tongji('deletestore', {taskid: taskid});
    };

    //任务详情页
    $scope.goTaskDetail = function (task) {
      CollectionService.judgeTaskExist(task.id).then(function (data) {
        if (data.status == "000000") {
          if (data.data.tasktype == 0) {//cpc任务
            if(data.data.incometype==1){
              $scope.go('cpccoudetail',{'taskid':data.data.taskid});
            }else {
              $scope.go('taskdetail', {'taskid': data.data.taskid});
            }
          } else if (data.data.tasktype == 2) {//cpv任务
            $scope.cleargo('cpvdetail', {'taskid': data.data.taskid})
          }
        } else {
          UtilService.showMess(data.msg);
        }
      });
    };

    //删除按钮样式
    $(".removeItem").click(function () {
      $(this).parent().parent().remove();
    });

    //切换
    $scope.vtaskflag = 0;
    $scope.ctaskflag = 0;
    $scope.ctackBox = function () {
      if ($scope.vtaskflag == 0) {
        $scope.vtaskflag = 1;
        $scope.ctaskflag = 0;
        $scope.type = '0';
        $scope.listloadding = true;
        $scope.getStorelist();
        $(".collTaskContent").hide();
        $scope.showctasklist = true;
      }
      UtilService.tongji("bandtask",{type: 0});
      UtilService.customevent("mycollection", "cpc任务");

    };
    $scope.vtaskBox = function () {
      if ($scope.ctaskflag == 0) {
        $scope.ctaskflag = 1;
        $scope.vtaskflag = 0;
        $scope.type = '2';
        $scope.listloadding = true;
        $scope.getStorelist();
        $(".collTaskContent").show();
        $scope.showctasklist = false;
      }
      UtilService.tongji("bandtask",{type: 1});
      UtilService.customevent("mycollection","cpv任务");
    }
  });
