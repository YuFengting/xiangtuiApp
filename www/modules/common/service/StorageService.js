/**
 * Created by dinglei on 2016/6/24.
 */
angular.module('xtui')
  .factory('StorageService', function($q,UtilService) {

    var storageObj = {};

    var keySetKey = "NSKeySet";
    var keySet = {};

    function isPhone() {
      return window.location.href.substring(0,4) == "file";
    }

    var onDeviceReady = function () {
      if(isPhone()) {
        //应用启动时，先获得keySet
        NativeStorage.getItem(keySetKey, function(obj){
          keySet = obj;
        }, function(){

        });
      } else {
        keySet = {};
      }
    };
    document.addEventListener("deviceready", onDeviceReady, false);

    var service = {
      setItem: function(key, value) {
        var deferred = $q.defer();
        if(isPhone()) {
          NativeStorage.setItem(key, value, function(obj){
            deferred.resolve(obj);
          }, function(error){
            deferred.reject();
          });
          keySet[key] = 1;
          NativeStorage.setItem(keySetKey, keySet, function(){}, function(){});
        } else {
          storageObj[key] = value;
          deferred.resolve(value);
        }
        return deferred.promise;
      },
      getItem: function(key) {
        var deferred = $q.defer();
        if(isPhone()) {
          NativeStorage.getItem(key, function(obj){
            deferred.resolve(obj);
          }, function(error){
            deferred.resolve();
          });
        } else {
          deferred.resolve(storageObj[key]);
        }
        return deferred.promise;
      },
      remove: function(key) {
        var deferred = $q.defer();
        if(isPhone()) {
          NativeStorage.remove(key, function(){
            deferred.resolve();
          }, function(){
            UtilService.showMess("remove fail");
            deferred.reject();
          });

          delete keySet[key];
          NativeStorage.setItem(keySetKey, keySet, function(){}, function(){});
        } else {
          storageObj[key] = null;
          deferred.resolve();
        }
        return deferred.promise;
      },
      clear: function() {
        var deferred = $q.defer();
        if(isPhone()) {
          for(var key in keySet) {
            this.remove(key);
          }
          this.remove(keySetKey);
          /*
          NativeStorage.clear(function(){
            deferred.resolve();
          }, function(){
            UtilService.showMess("clear fail");
            deferred.reject();
          });
          */
        } else {
          storageObj = {};
          deferred.resolve();
        }
        return deferred.promise;
      }
    };
    return service;
  });
