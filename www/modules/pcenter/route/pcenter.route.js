/**
 * Created by Administrator on 2016/9/30.
 */

(function () {
  'use strict';
  // Setting up route
  angular.module('xtui').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];
  function routeConfig($stateProvider) {
    $stateProvider
    /*头像放大页面*/
      .state('chooseheadpic', {
        cache: false,
        url: '/chooseheadpic',
        templateUrl: 'modules/pcenter/views/chooseHeadPic.html',
        controller: 'chooseHeadPicController',
        controllerAs: 'vm',
        params:{'avate':''}
      })
      /*我的推荐列表*/
      .state('myrecommend', {
        cache: false,
        url: '/myrecommend',
        templateUrl: 'modules/pcenter/views/myrecommend.html',
        controller: 'myrecommendController',
        controllerAs: 'vm'
      })
      /*推荐详情页面*/
      .state('reclist', {
        cache: false,
        url: '/reclist',
        templateUrl: 'modules/pcenter/views/recommendList.html',
        controller: 'recListController',
        controllerAs: 'vm',
          params:{'taskid':'','workid':""}
      })
      /*我的关注*/
      .state('myfocus', {
        cache: false,
        url: '/myfocus',
        templateUrl: 'modules/pcenter/views/myfocus.html',
        controller: 'myfocusController',
        controllerAs: 'vm'
      })
      /*我的红包*/
      .state('mypurse', {
        cache: false,
        url: '/mypurse',
        templateUrl: 'modules/pcenter/views/mypurse.html',
        controller: 'mypurseController',
        controllerAs: 'vm'
      })
      /*我的优惠券*/
      .state('couponlist', {
        cache: true,
        url: '/couponlist',
        templateUrl: 'modules/pcenter/views/couponlist.html',
        controller: 'couponlistController',
        controllerAs: 'vm',
        params:{coupontype:"0"}
      })
      /*优惠券*/
      .state('salecoupon', {
        cache: false,
        url: '/salecoupon',
        templateUrl: 'modules/pcenter/views/salecoupon.html',
        controller: 'salecouponController',
        controllerAs: 're',
        params:{workid: null}
      })
      /*限量券扫码*/
      .state('couponcode', {
        cache: false,
        url: '/couponcode',
        templateUrl: 'modules/pcenter/views/couponcode.html',
        controller: 'couponcodeController',
        params:{title: null, logo: null, companyalias: null, code: null,tel:null,address:null}
      })
  }
}());
