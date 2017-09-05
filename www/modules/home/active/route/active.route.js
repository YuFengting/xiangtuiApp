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
      //圣诞活动
      .state('merry', {
        cache: true,
        url: '/merry',
        templateUrl: 'modules/home/active/view/merry.html',
        controller: 'merrycontroller'
      })
      //春节活动
      .state('newyear', {
        cache: true,
        url: '/newyear',
        templateUrl: 'modules/home/active/view/newyear.html',
        controller: 'newyearController'
      })
  }
}());
