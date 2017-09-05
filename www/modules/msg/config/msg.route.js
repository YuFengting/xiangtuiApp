(function () {
  'use strict';
  // Setting up route
  angular
    .module('xtui')
    .config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];
  function routeConfig($stateProvider) {
    $stateProvider
    //邀请群聊
      .state('invitegroup',{
        cache:false,
        url:'/invitegroup',
        templateUrl: 'modules/msg/view/groupChat/inviteGroup.html',
        controller: 'InvitegroupController',
        params:{taskid:null,merchantid:null}
      })
      //发起群聊页面
      .state('addgroup',{
        cache:false,
        url:'/addgroup',
        templateUrl: 'modules/msg/view/groupChat/addgroup.html',
        controller: 'AddgroupController',
        params:{taskid:null,merchantid:null}
      })
      //群聊详情页面
      .state('msggroup',{
        cache:false,
        url:'/msggroup',
        templateUrl: 'modules/msg/view/groupChat/msgGroup.html',
        controller: 'MsggroupController',
        params:{imgroupid:null}
      })
      //群聊成员
      .state('groupmember',{
        cache:false,
        url:'/groupmember',
        templateUrl: 'modules/msg/view/groupChat/groupmember.html',
        controller: 'GroupmemberController',
        params:{imgroupid:null}
      })
      //群聊信息
      .state('groupmessage',{
        cache:true,
        url:'/groupmessage',
        templateUrl: 'modules/msg/view/groupChat/groupmessage.html',
        controller: 'GroupmessageController',
        params:{imgroupid:null}
      })
      //群聊删除成员
      .state('deletegroupmember',{
        cache:false,
        url:'/deletegroupmember',
        templateUrl: 'modules/msg/view/groupChat/deletegroupmember.html',
        controller: 'DeletegroupmenberController',
        params:{imgroupid:null,groupmemberids:null}
      })
      //修改群聊名称
      .state('changegroupname',{
        cache:false,
        url:'/changegroupname',
        templateUrl: 'modules/msg/view/groupChat/changegroupname.html',
        controller: 'ChangegroupnameController',
        params:{imgroupid:null,groupname:null}
      })
      //添加其他成员
      .state('addmoremember',{
        cache:false,
        url:'/addmoremember',
        templateUrl: 'modules/msg/view/groupChat/addmoremember.html',
        controller: 'AddmoreController',
        params:{imgroupid:null,groupmemberids:null}
      })
      //3.1-通讯录-搜索朋友
      .state('findfriend',{
        cache:false,
        url:'/findfriend',
        templateUrl: 'modules/msg/view/phonebook/findfriend.html',
        controller: 'PhonebookController'
      })
      //3.1-通讯录-添加朋友
      .state('addnewfriend',{
        cache:false,
        url:'/addnewfriend',
        templateUrl: 'modules/msg/view/phonebook/addnewfriend.html',
        controller: 'PhonebookController'
      })
      .state('searchfriend',{
        cache:false,
        url:'/searchfriend',
        templateUrl: 'modules/msg/view/phonebook/searchfriend.html',
        controller: 'SearchFriendController'
      })
      //3.1-添加通讯录好友列表
      .state('phonebookfriend',{
        cache:true,
        url:'/phonebookfriend',
        templateUrl: 'modules/msg/view/phonebook/phonebookfriend.html',
        controller: 'PhonebookfriendController'
      })

      //3.1-通讯录权限被拒绝
      .state('phonebookRefuse',{
        cache:false,
        url:'/phonebookRefuse',
        templateUrl: 'modules/msg/view/phonebook/phonebookRefuse.html',
        controller: 'PhonebookController',
        params:{nleadsid:null}
      })

  }
}());
