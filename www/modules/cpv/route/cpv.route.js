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
    /*cpv推荐页面*/
      .state('cpvlist', {
        cache: true,
        url: '/cpvlist',
        templateUrl:  'modules/cpv/views/cpvlist.html',
        controller: 'cpvListController'
      })
      /*cpv详情页*/
      .state('cpvdetail', {
        cache: false,
        url: '/cpvdetail',
        templateUrl: 'modules/cpv/views/cpvdetail.html',
        controller: 'cpvDetailController',
        controllerAs: 'vm',
        params: {taskid: null}
      })
      /*商家首页*/
      .state('business', {
        cache: true,
        url: '/business',
        templateUrl: 'modules/cpv/views/businessIndex.html',
        controller: 'businessIndexController',
        controllerAs: 'vm',
        params:{merchantid: null}
      })
      /*商家简介*/
      .state('busdetail', {
        cache: false,
        url: '/busdetail',
        templateUrl: 'modules/cpv/views/businessDetail.html',
        controller: 'businessDetailController',
        controllerAs: 'vm',
        params: {introduction: null,companyalias:null}
      })
  }
}());
