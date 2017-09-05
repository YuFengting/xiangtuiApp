angular.module('xtui')
  .controller("ThemeController", function ($scope,CpvService, $stateParams, TopicTaskService, SqliteUtilService, UtilService, UserService, ConfigService) {
    $scope.$on("$ionicView.beforeEnter", function () {
      $scope.startfun();
    });
    $scope.nonenet = false;
    $scope.topictile = $stateParams.topictitle;
    $scope.topicimg = $stateParams.topicimg;
    $scope.topicdesc = $stateParams.topicdesc;
    $scope.ttype = $stateParams.ttype;
    var topicid = $stateParams.topicid;
    $scope.showloading = false;
    //下拉刷新
    $scope.doRefresh = function () {
      TopicTaskService.getTopicById($stateParams.topicid).then(function (topic) {
        $scope.showloading = true;
        $scope.topictile = topic.data.title;
        $scope.topicimg = topic.data.img;
        $scope.topicdesc = topic.data.desc;
        if (angular.isUndefined($scope.ttype) || $scope.ttype == 0) {
          TopicTaskService.refresh(topicid).then(function (response) {
              $scope.tasklist = [];
              if (response.status == '000000') {
                $scope.tasklist = response.data;
                $scope.nonenet = false;
              }
              $scope.showloading = false;
            }, function () {
              $scope.showloading = false;
              UtilService.showMess("网络不给力，请稍后刷新");
            }
          ).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
          });
        } else {
          $scope.buserids = topic.data.buserids;
          TopicTaskService.getTopicMerchantList($scope.buserids).then(function (response) {
              $scope.mlist = [];
              if (response.status == '000000') {
                $scope.mlist = response.data;
                $scope.nonenet = false;
              }
              $scope.showloading = false;
            }, function () {
              $scope.showloading = false;
              UtilService.showMess("网络不给力，请稍后刷新");
            }
          ).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
          });
        }
      },function () {
        $scope.showloading = false;
      })
    };
    $scope.doRefresh();
    //进入详情页 区分帮忙卖
    $scope.goTaskDetail = function (task) {
      if(task.type==2){
        if (CpvService.readedarr.indexOf(task.id) < 0)
          CpvService.readedarr.push(task.id);
        $scope.cleargo('cpvdetail', {'taskid': task.id});
      }else{
        if (task.showtype == '1') {
          $scope.cleargo('helpselldetail', {'taskid': task.id});
        } else {
          if(task.incometype==1){
            $scope.go('cpccoudetail',{'taskid': task.id});
          }else {
            $scope.go('taskdetail', {'taskid': task.id, 'showtype': task.showtype});
          }
        }
      }
    };
    $scope.goBusiness = function (id) {
      var params = {
        mod: 'nUser',
        func: 'getBuserByuserid',
        userid: UserService.user.id,
        data: {"merchantid": id}
      };
      UtilService.post(ConfigService.server, {'jsonstr': angular.toJson(params)}).success(function (data) {
        if (data.status == "103006") {
          UtilService.showMess("该商家已下架");
        } else {
          $scope.go('business', {merchantid: id});
        }
      });
    };

    /*点击过的列表替换背景*/
    $('.taskindex-list .item').click(function () {
      $(this).addClass('hasClick');
    })
  });
