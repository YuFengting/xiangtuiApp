/**
 * Created by jiaoym on 2016/7/20.
 */
angular.module('xtui').factory("IMSqliteUtilService", function ($q, UserService, StorageService, UtilService) {

  var db;

  var onDeviceReady = function () {
    db = window.sqlitePlugin.openDatabase({
      name: 'im.db',
      location: 'default',
      androidDatabaseImplementation: 2,
      androidLockWorkaround: 1
    });

    service.checkVersion();
  };
  document.addEventListener("deviceready", onDeviceReady, false);

  var service = {
    //im本地数据库表定义. 数据入库时，根据本地定义的字段来入库，而不是接口返回的字段。防止版本更新，返回字段不同，导致旧版本入库失败。
    tableDefinition: {
      //聊天消息表
      chat: {
        id: {type: 'text', pk: true},
        senderid: {type: 'text'},
        avate: {type: 'text'},
        inittime: {type: 'text'},
        exactlytime: {type: 'integer'},
        name: {type: 'text'},
        usertype: {type: 'text'},
        imgroupid: {type: 'text'},
        position: {type: 'text'},
        content: {type: 'text'},
        contenttype: {type: 'integer'},
        typename: {type: 'text'},
        notify: {type: 'integer'},
        audiolength: {type: 'integer'},
        isread: {type: 'integer'},
        imgrouptype: {type: 'integer'},
        istmp: {type: 'integer'},
        imgroupname: {type: 'text'},
        nleads: {type: 'text'},
        task: {type: 'text'},
        paylog: {type: 'text'},
        nleadspay: {type: 'text'},
        product: {type: 'text'},
        narticle: {type: 'text'},
        ngbuyrl: {type: 'text'},
        merchant: {type: 'text'},
        systip: {type: 'text'}
      },
      //会话首页
      chatfirst: {
        id: {type: 'text', pk: true},
        imgroupid: {type: 'text'},//
        chatmsgid: {type: 'text'},
        inittime: {type: 'text'},
        exactlytime: {type: 'integer'},//
        imgrouptype: {type: 'integer'},//
        type: {type: 'text'},//
        subtype: {type: 'text'},
        imuserid: {type: 'text'},
        usertype: {type: 'text'},
        avate: {type: 'text'},//
        count: {type: 'integer'},//
        notify: {type: 'integer'},//
        name: {type: 'text'},//
        lastmsg: {type: 'text'},//
        lastmsgtype: {type: 'text'},
        newreceiveid: {type: 'text'},
        sec_id: {type: 'text'},//
        istmp: {type: 'integer'},//
        msgtype: {type: 'text'}//
      },
      sysmsg: {
        id: {type: 'text', pk: true},
        inittime: {type: 'text'},
        exactlytime: {type: 'integer'},
        subtype: {type: 'integer'},
        readstatus: {type: 'integer'},
        type: {type: 'integer'},
        userid: {type: 'text'},
        content: {type: 'text'},
        typename: {type: 'text'},
        status: {type: 'integer'}
      },
      systemmsg: {
        id: {type: 'text', pk: true},
        title: {type: 'text'},
        content: {type: 'text'},
        pic: {type: 'text'},
        appurl: {type: 'text'},
        inittime: {type: 'text'},
        appparams: {type: 'text'},
        sendType: {type: 'integer'},
        type: {type: 'Integer'},
        msgType: {type: 'integer'}
      }
    },
    //初始化数据库
    initIMdataBase : function(){
      var tables = [];
      //通过tableDefinition，拼接生成建表语句。
      for(var tableName in service.tableDefinition) {
        var table = service.tableDefinition[tableName];
        var sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(";
        for(var fieldName in table) {
          sql += fieldName + " " + table[fieldName].type;
          if(table[fieldName].pk == true) {
            sql += " primary key";
          }
          sql += ",";
        }
        sql = sql.slice(0, sql.length - 1);//去掉最后一个逗号
        sql += ")";
        tables.push(sql);
      }

      db.sqlBatch(tables,function(res){
          //同时设置版本号
          StorageService.setItem("_curVer", service.imDataBaseVersion);
      },function(err){
          UtilService.log(err);
      });
    },
    //插入数据
    insertImObject: function (tablename,datalist) {
      var len = datalist.length;
      var insertArray = [];
      for (var i = 0; i < len; i++) {
        var obj = datalist[i];
        var keys = "";
        var vals = new Array();
        var q_str = "";
        for (var attr in obj) {
          if(service.tableDefinition[tablename][attr]) {
            keys += attr + ',';
            if(typeof(obj[attr]) == 'object'){
              vals.push(angular.toJson(obj[attr]));
            }else{
              vals.push(obj[attr]);
            }
            q_str += "?" + ",";
          }
        }
        keys = keys.substring(0, keys.length - 1);
        q_str = q_str.substring(0, q_str.length - 1);
        var query = "insert into " + tablename + "(" + keys + ") values(" + q_str + ")";
        var newarray = [query,vals];
        insertArray.push(newarray);
      }
      db.sqlBatch(insertArray,function(){
      },function(err){
          UtilService.log(err);
      });
    },
    //查询数据
    selectImData : function(sql){
      var dataList = [];
      var deferred = $q.defer();
      db.executeSql(sql,[],function(resultSet){
        var len = resultSet.rows.length;
        if (len > 0) {
          for (var i = 0; i < len; i++) {
            dataList.push(resultSet.rows.item(i));
          }
        }
        deferred.resolve(dataList);
      },function(error){
        deferred.reject(error)
      });
      return deferred.promise;
    },
    //新增或更新
    saveOrUpdateImData: function (tablename,datalist) {
      var deferred = $q.defer();
      var len = datalist.length;
      var insertArray = [];
      for (var i = 0; i < len; i++) {
        var obj = datalist[i];
        if(obj.existed === true) {
          //更新
          var keys = "";
          var vals = new Array();
          for (var attr in obj) {
            if(service.tableDefinition[tablename][attr]) {
              keys += attr + '=?,';
              if(typeof(obj[attr]) == 'object'){
                vals.push(angular.toJson(obj[attr]));
              }else{
                vals.push(obj[attr]);
              }
            }
          }
          keys = keys.substring(0, keys.length - 1);
          var query = "update " + tablename + " set " + keys;
          query += " where id = ?";
          vals.push(obj.id);
          insertArray.push([query,vals]);
        } else {
          //新增
          var keys = "";
          var vals = new Array();
          var q_str = "";
          for (var attr in obj) {
            if(service.tableDefinition[tablename][attr]) {
              keys += attr + ',';
              if(typeof(obj[attr]) == 'object'){
                vals.push(angular.toJson(obj[attr]));
              }else{
                vals.push(obj[attr]);
              }
              q_str += "?" + ",";
            }
          }
          keys = keys.substring(0, keys.length - 1);
          q_str = q_str.substring(0, q_str.length - 1);
          var query = "insert into " + tablename + "(" + keys + ") values(" + q_str + ")";
          var newarray = [query,vals];
          insertArray.push(newarray);
        }
      }
      db.sqlBatch(insertArray,function(){
        UtilService.log("saveOrUpdateImData success");
        deferred.resolve();
      },function(err){
        UtilService.log(err);
        deferred.reject();
      });
      return deferred.promise;
    },
    //更新数据
    updateImData : function(tablename,list){
      var len = list.length;
      var dataArray = new Array();

      for(var i = 0;i < len;i++){
        var sql = "update " + tablename + " set ";
        var obj = list[i];
        var vals = new Array();
        var id = "";
        for (attr in obj) {
          var key = "";
          if(typeof(obj[attr]) == 'object' && (attr == "task" || attr == "nleads" || attr == "paylog" || attr == "nleadspay" || attr == "product"
          || attr == "narticle" || attr == "ngbuyrl" || attr == "merchant" || attr == "systip")){
            key = attr;
            vals.push(angular.toJson(obj[attr]));
            sql += key + " = ? ," ;
          } else if(attr != "id") {
            key = attr;
            vals.push(obj[attr]);
            sql += key + " = ? ," ;
          }
          if(attr == "id"){
            id = obj[attr];
          }
        }
        sql = sql.substring(0,sql.length - 1);
        sql += " where id = ?";
        vals.push(id);
        var newarray = [sql,vals];
        dataArray.push(newarray);
      }
      db.sqlBatch(dataArray,function(res){
      },function(error){
          UtilService.log(error);
      });
    },
    //删除数据
    deleteImData :function(sql){
      db.executeSql(sql,[],function(res){
      },function(err){
          UtilService.log(err);
      })
    },
    //清除表
    dropImDataTable : function(){
        StorageService.remove("systemmsg");
        StorageService.remove("xtxx");
        StorageService.remove("hdts");
      StorageService.setItem("chatIdmap", {});
      var dropTab = [];
      var tablenames = [];

      for(var table in service.tableDefinition) {
          tablenames.push(table);
      }

      for(var i = 0 ;i < tablenames.length;i++){
        var sql = "drop table "+ tablenames[i];
        dropTab.push(sql);
      }
      db.sqlBatch(dropTab,function(res){
          //清表后重新创建
          service.initIMdataBase();
      },function(err){
          UtilService.log(err);
          service.initIMdataBase();
      })
    },
    imDataBaseVersion: 3,
    //检查版本
    checkVersion: function () {
        UtilService.log("checkversion");
        StorageService.getItem("_curVer").then(function (obj) {
            if(obj == undefined || obj != service.imDataBaseVersion ) {
                //低版本需要更新本地im库表结构
                service.dropImDataTable();
                UtilService.log("set version "+service.imDataBaseVersion);
            }
        }, function () {

        });
    }
  };

  return service;
});
