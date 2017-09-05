/**
 * Created by jiaoym on 16/5/12.
 */
/**
 * sqlite处理工具类
 */
angular.module('xtui')
  .factory("SqliteUtilService", function ($q, $cordovaSQLite) {
    var db = window.sqlitePlugin.openDatabase({
      name: 'my.db',
      location: 'default',
      androidDatabaseImplementation: 2,
      androidLockWorkaround: 1
    });
    return {
      initXtuiDatabase : function(){
        var createTableArray = [];
        //首页任务表
        var hometask = "CREATE TABLE IF NOT EXISTS hometask (taskid integer primary key,id text, name  text, status integer,worknum integer," +
          "cprice REAL,view text,showtype integer,type integer,hot integer,high integer,rap integer,easy integer,isnew integer,isshare integer," +
          "moneyper integer,product text,commission text,avgincome real,isntime integer,buserstatus integer,bname text,audit integer,istop text)";
        createTableArray.push(hometask);
        //主题表
        var topic = "CREATE TABLE IF NOT EXISTS topic (id text primary key,isdel integer,isdis integer,desc text,img text," +
          "logo text,title text,memo text,intime text,pmid text,inittime text,num integer,taskcount integer,type integer ,ttype integer,url text,"+
          "usercount integer,buserid text,appurl text,appparams text,simpleTaskType integer,simpleTaskId integer)";
        createTableArray.push(topic);
        //行业
        var industry = "CREATE TABLE IF NOT EXISTS industry (id text primary key,icon text,name,text,sort integer,bgpic text)";
        createTableArray.push(industry);
        //主题任务表
        var topictask = "CREATE TABLE IF NOT EXISTS hometask (taskid integer primary key,id text, name  text, status integer,worknum integer," +
          "cprice REAL,view text,showtype integer,type integer,hot integer,high integer,rap integer,easy integer,isnew integer,isshare integer," +
          "moneyper integer,product text,commission text,avgincome real)";
        //createTableArray.push(topictask);
        //banner广告表
        var banner = "CREATE TABLE IF NOT EXISTS banner (id text primary key,name text,pic text,appparams text,rtype integer," +
          "wapurl text, clicktimes integer,appurl text,sort integer,isdel integer,type integer)";
        createTableArray.push(banner);
        //首页商家表
        var companyMain = "CREATE TABLE IF NOT EXISTS companymain(cid integer primary key,id text,hasgf integer,isactive integer,currentsalernum integer,company text,high integer," +
          "clogopath text,commentscore REAL,isnew integer,isauth integer,companyalias text,isqr integer,score real)";
        createTableArray.push(companyMain);
        //商家推荐列表
        var reccompany = "CREATE TABLE IF NOT EXISTS reccompany(cid integer primary key,id text,recommendno integer,company text,recommendpath text)";
        createTableArray.push(reccompany);
        //商家列表
        var companyList = "CREATE TABLE IF NOT EXISTS companylist(cid integer primary key,id text,hasgf integer,isactive integer,currentsalernum integer,company text," +
          "clogopath text,commentscore text,isnew integer,isauth integer,companyalias text,isqr integer,score integer,high integer,ismore integer)";
        createTableArray.push(companyList);
        //常用推广销售支持
        var useract = "CREATE TABLE IF NOT EXISTS myuseract(id integer primary key,sharetitle text,companyalias text,merchantid text,articleid text,type integer,status integer)"
        createTableArray.push(useract);
        //常用推广云广告
        var simpleCpcTask = "CREATE TABLE IF NOT EXISTS cpctask (taskid integer primary key,id text, name  text, status integer,worknum integer," +
          "cprice REAL,view text,showtype integer,type integer,hot integer,high integer,rap integer,easy integer,isnew integer,isshare integer," +
          "moneyper integer,product text,commission text,avgincome real)";
        createTableArray.push(simpleCpcTask);
        //销售身份
        var myidentity = "CREATE TABLE IF NOT EXISTS myidentity(id integer primary key,dealmoney real,dealnums integer,clogopath text,companyalias text,merchantid text)";
        createTableArray.push(myidentity);
        //城市表
        var city = "create table if not exists city (id integer primary key,name text,abbrname text,type integer,intime text)";
        createTableArray.push(city);
        //常用城市表
        var commoncity = "create table if not exists commoncity (id integer primary key,name text,intime text)";
        createTableArray.push(commoncity);
        //新手引导日志表
        var newhandlog = "create table if not exists newhandlog (id integer primary key,step text,intime text)";
        createTableArray.push(newhandlog);
        //城市表序列化
        var index = "CREATE INDEX if not exists index_city_type ON city (type)";
        createTableArray.push(index);
        //商家素材库
        var material = "create table if not exists material (id text primary key,merchantid tex,name text,inittime text,type integer,url text,isdowload integer,fileurl text,dowloading integer)";
        createTableArray.push(material);

        //cpv主列表页
        var cpvindexlist = "CREATE TABLE IF NOT EXISTS cpvindexlist(cpvid integer primary key,id text,pic text,worknum integer,isnew integer,isshare integer,name text,bname text,vprice real," +
            "audit integer,avgincome integer,buserstatus integer,easy integer,hot integer,showtype integer,status integer,type integer,view text)";
        createTableArray.push(cpvindexlist);

        db.sqlBatch(createTableArray,function(res){
        },function(err){
        });
      },

      /**
       * 更新及删除方法
       * @param QUERY  ==> 更新或删除的SQL语句
       * @returns {number} ==> 返回状态标志:1:成功,-1:失败
       */
      deleteData: function (sql) {
       db.executeSql(sql,[],function(res){
       },function(err){
       })
      },

      /**
       * 查询数据方法
       * @param tablename  ===> 表名
       * @param orderkey  ===> 排序字段 (先默认asc)
       * @returns {*}
       */
      selectData: function (tablename, orderkey,conditions,ordercon) {
        var deferred = $q.defer();
        var query = "";
        query = "select * from " + tablename +" where 1 = 1 ";
        if(angular.isDefined(conditions) && conditions != null && conditions != ""){
          query = query + " and " + conditions;
        }
        if (angular.isDefined(orderkey) && orderkey != null && orderkey != "") {
          query =query + " and "+orderkey+" is not null order by " + orderkey +" " + (ordercon?ordercon:" asc");
        }

        if(tablename !="city"&& tablename !="hometask" &&tablename !="companymain"){
          query += " LIMIT 10 ";
        }
        var dataList = [];
        db.executeSql(query,[],function(resultSet){
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
      /**
       * 列表数据插入
       * @param response ===> 对象list
       * @param tablename ===> 表名
       * @param sort ===> 排序字段
       * @returns {*}
       */
      insertDataOfList: function (dataList, tablename,sort,conditions) {
        var len = dataList.length;
        var delSql = "delete from " + tablename + " where 1 = 1 ";
        if(angular.isDefined(conditions) && conditions != null && conditions != ""){
          delSql += " and " + conditions;
        }
        if(angular.isDefined(sort) && sort != null && sort != ""){
          delSql += " and " + sort + " is not null";
        }
        db.executeSql(delSql,[],function(res){
          var dataArray = [];
          for (var i = 0; i < len; i++) {
            var obj = dataList[i];
            if (angular.isDefined(sort) && sort != null && sort != "") {
              obj[sort] = i;
            }
            var keys = "";
            var vals = new Array();
            var q_str = "";
            for (attr in obj) {
              keys += attr + ',';
              vals.push(obj[attr]);
              q_str += "?" + ",";
            }
            keys = keys.substring(0, keys.length - 1);
            q_str = q_str.substring(0, q_str.length - 1);
            var query = "insert into " + tablename + "(" + keys + ") values(" + q_str + ")";
            var newarray = [query,vals];
            dataArray.push(newarray);
          }
          db.sqlBatch(dataArray,function(res){
          },function(err){
          });
        },function(err){
        });
      },
      /**
       * 删除用户数据
       */
      deletDataOfUser : function(){
        var deleteTable = [];
        var tablenames = ["hometask","topic","topictask","banner","companyMain","reccompany","companyList","useract","simpleCpcTask","myidentity","newhandlog","cpvindexlist","material"];
        for(var i = 0;i < tablenames.length;i++){
          var delsql = "delete from " + tablenames[i];
          deleteTable.push(delsql);
        }
        db.sqlBatch(deleteTable,function(res){
        },function(error){
        });
      }
    }
  });
