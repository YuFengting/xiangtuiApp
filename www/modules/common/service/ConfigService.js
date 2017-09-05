angular.module('xtui')
  .factory('ConfigService', function() {
    var config = {};
    // config.server = "http://app2.91weiku.com/app/appinfo";
    // config.serverctx = "http://app2.91weiku.com";
    // config.picserver = "http://static.91weiku.com";
    // config.upserver = "http://www.91weiku.com/app/appinfo";

     // config.server = "http://192.168.0.240/app/appinfo";
    config.server = "http://123.59.79.209/app/appinfo";
    config.upserver = "http://123.59.79.209/app/appinfo";
    config.serverctx = "http://123.59.79.209";
    config.picserver = "http://static.91weiku.com";

    config.versionno = "3.5.2";//版本号
    config.currentIMgrpid = "";//表示当前在那个会话里
    config.no="";
    config.userType = 's';
    config.updateversion = true;
    config.updatecheck = true;
    config.from = "XT00000";
    config.init=function(data){
      config = angular.extend(config,data);
    };
    return config;
  });
