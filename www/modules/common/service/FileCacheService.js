/**
 * Created by dinglei on 2016.09.12.
 */
angular.module('xtui')
  .factory('FileCacheService', function($q) {

      var imCachePath_android;
      var imCachePath_ios;
      var bcircleCachePath_android;
      var bcircleCachePath_ios;
      var defaultCachePath_android;
      var defaultCachePath_ios;
      var mod_path;

      var onDeviceReady = function () {
          imCachePath_android = cordova.file.applicationStorageDirectory + "files/cacheFile/im/";
          imCachePath_ios = cordova.file.applicationStorageDirectory + "Documents/cacheFile/im/";
          bcircleCachePath_android = cordova.file.applicationStorageDirectory + "files/cacheFile/bcircle/";
          bcircleCachePath_ios = cordova.file.applicationStorageDirectory + "Documents/cacheFile/bcircle/";
          defaultCachePath_android = cordova.file.applicationStorageDirectory + "files/cacheFile/default/";
          defaultCachePath_ios = cordova.file.applicationStorageDirectory + "Documents/cacheFile/default/";
          mod_path = {
              IM: {
                  Android: imCachePath_android,
                  iOS: imCachePath_ios
              },
              Bcircle: {
                  Android: imCachePath_android,
                  iOS: imCachePath_ios
              },
              default: {
                  Android: defaultCachePath_android,
                  iOS: defaultCachePath_ios
              }
          };
      };
      document.addEventListener("deviceready", onDeviceReady, false);

    var service = {
      //存储uri指定的文件，保存为filename指定的文件。
      saveFile: function(options) {
        var deferred = $q.defer();
        var filename = options.filename;
        var uri = options.uri;
        var mod = options.mod;
        if(mod_path[mod] == undefined) {
          mod = "default";
        }

        var fileURL = mod_path[mod][device.platform] + filename;

        var replaceIfexsisted = options.replaceIfexisted || false;
        if(replaceIfexsisted === false) {
          //先检查是否存在，然后再下载
          resolveLocalFileSystemURL(fileURL,
            function(entry) {
              //已存在
              var nativePath = entry.toURL();
              deferred.resolve(entry);
            }, function(err) {
              //未下载过
              var fileTransfer = new FileTransfer();
              fileTransfer.download(
                uri,
                fileURL,
                function(entry) {
                  deferred.resolve(entry);
                },
                function(error) {
                  deferred.reject(error);
                },
                true,
                {
                  headers: {
                    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                  }
                }
              );
            });
        } else {
          var fileTransfer = new FileTransfer();
          fileTransfer.download(
            uri,
            fileURL,
            function(entry) {
              deferred.resolve(entry);
            },
            function(error) {
              deferred.reject(error);
            },
            true,
            {
              headers: {
                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
              }
            }
          );
        }
        return deferred.promise;
      },
      //获得文件存储的路径
      getBasepath: function(options) {
        var mod = options.mod;
        if(mod_path[mod] == undefined) {
          mod = "default";
        }
        return mod_path[mod][device.platform];
      },
      //获得缓存的文件。若存在，返回FileEntry对象，否则返回error.
      getCacheFile: function(options) {
        var deferred = $q.defer();
        var filename = options.filename;
        var mod = options.mod;
        if(mod_path[mod] == undefined) {
          mod = "default";
        }

        var abspath = mod_path[mod][device.platform] + filename;
        resolveLocalFileSystemURL(abspath,
          function(entry) {
            var nativePath = entry.toURL();
            deferred.resolve(entry);
          }, function(err) {
            deferred.reject(err);
          });
        return deferred.promise;
      }
    };
    return service;
  });
