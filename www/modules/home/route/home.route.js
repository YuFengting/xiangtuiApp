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
    /*cpc页面*/
      .state('cpccoudetail', {
        cache: false,
        url: '/cpccoudetail',
        templateUrl:  'modules/home/view/couponDetial.html',
        controller: 'cpcCouponDetailController',
        params:{taskid:null}
      })

  }
}());
