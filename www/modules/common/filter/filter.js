/**
 * 通过数据过滤器
 * 1. 用于数据格式化
 * 2. 数据排序
 * 3. 数据自定义显示
 * currency(货币)、date(日期)、filter(子串匹配)、json(格式化json对象)、limitTo(限制个数)、lowercase(小写)、uppercase(大写)、number(数字)、orderBy(排序)
 * 此处应该为自定义
 */
angular.module('xtui')
  .filter('to_trusted', ['$sce', function ($sce) {
      return function (text) {
        return $sce.trustAsHtml(text);
      }
    }]
  )
  //图片过滤器，没http开头的自动加上
  .filter("avatefilter", function (ConfigService) {
    var filterfun = function (value) {
      if (value == null) {
        return value;
      } else if (value.indexOf('http://') == -1) {
        value = ConfigService.picserver + value;
      }
      return value;
    };
    return filterfun;
  })

  //隐藏支付宝账号
  .filter("alipayfilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value != "" && value.length > 4) {
        value = value.substr(0, 2) + "*****" + value.substr(value.length - 2, 2)
      }
      return value;
    };
    return filterfun;
  })

  //根据每天签到金额匹配不同的class
  .filter("signclassfilter", function () {
    var filterfun = function (value) {
      if (value == 0.01) {
        value = "sign_1";
      } else if (value == 0.02) {
        value = "sign_2";
      } else if (value == 0.03) {
        value = "sign_3";
      } else if (value == 0.04) {
        value = "sign_4";
      } else if (value == 0.05) {
        value = "sign_5";
      } else {
        value = "";
      }
      return value;
    };
    return filterfun;
  })
  //过滤性别，0,1变成男女
  .filter("sexfilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value !== "") {
        if (value == '0') {
          value = "女";
        } else {
          value = "男";
        }
        ;
      }
      return value;
    };
    return filterfun;
  })
  //过滤婚恋情况，0:未婚单身|1:未婚有伴|2:已婚未育|3:已婚已育
  .filter("marriagefilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value !== "") {
        if (value == '0') {
          value = "未婚单身";
        } else if (value == '1') {
          value = "未婚有伴";
        } else if (value == '2') {
          value = "已婚未育";
        } else if (value == '3') {
          value = "已婚已育";
        }
        ;
      }
      return value;
    };
    return filterfun;
  })
  //过滤收入状态 - 0:1000-2000|1:2000-3000|2:3000-5000|3:5000-10000|4:10000及以上
  .filter("incomefilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value !== "") {
        if (value == '0') {
          value = "1000-2000";
        } else if (value == '1') {
          value = "2000-3000";
        } else if (value == '2') {
          value = "3000-5000";
        } else if (value == '3') {
          value = "5000-10000";
        } else if (value == '4') {
          value = "10000及以上";
        }
        ;
      }
      return value;
    };
    return filterfun;
  })
  //过滤公告标题，中显示6位，后面隐藏
  .filter("titlefilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value != "") {
        if (value.length > 8) {
          value = value.substr(0, 8) + "...";
        }
      }
      return value;
    };
    return filterfun;
  })
  //过滤手机号，中间隐藏
  .filter("telfilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value != "") {
        value = value.substr(0, 3) + "****" + value.substr(value.length - 4, 4)
      }
      return value;
    };
    return filterfun;
  })
  //热门搜索过滤
  .filter("hotkeyfilter", function () {
    var filterfun = function (value) {
      if (value != undefined && value != "") {
        if (value.length > 4) {
          value = value.substr(0, 4) + "...";
        }
      }
      return value;
    };
    return filterfun;
  })


  //热门搜索过滤
  .filter("businessfilter", function () {
    var filterfun = function (num) {
      if (num == 0) {
        var Range = 120 - 90;
        var Rand = Math.random();
        num = (90 + Math.round(Rand * Range));
      }
      return num;
    };
    return filterfun;
  })

  //显示过滤html
  .filter("delhtml", function () {
    var filterfun = function (html) {
      html = html.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
      html = html.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
      html = html.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
      html = html.replace(/&nbsp;/ig, '');//去掉&nbsp;
      return html;
    };
    return filterfun;
  })

  //聊天表情过滤
  .filter("emojifilter", function (MsgService, $sce) {
    var filterfun = function (html) {
      if(html != undefined) {
        //先转移特殊字符，否则会被注入
        html = html.replace(/</g, "&lt;");
        html = html.replace(/>/g, "&gt;");

        html = $sce.trustAsHtml(MsgService.transform(html));

        return html;
      } else {
        return "";
      }

    };
    return filterfun;
  })


  //聊天表情和超链接过滤
  .filter("emojihtmlfilter", function (MsgService, $sce) {
    var filterfun = function (html) {
      if(html != undefined) {
        //先转移特殊字符，否则会被注入
        html = html.replace(/</g, "&lt;");
        html = html.replace(/>/g, "&gt;");
        html = html.replace(/(((h|H)(t|T)(t|T)(p|P)[(s|S)]?:\/\/)|www)[0-9a-z\.\_\-\:\/\?\=\&A-Z]+/g, '<a href="javascript:void(0)" style="text-decoration:none;color: #1c8df6">$&</a>');
        html = $sce.trustAsHtml(MsgService.transform(html));
        return html;
      } else {
        return "";
      }
    };
    return filterfun;
  })


  //聊天表情
  .filter("emojifilter", function (MsgService, $sce) {
    var filterfun = function (html) {
      if(html != undefined) {
        //先转移特殊字符，否则会被注入
        html = html.replace(/</g, "&lt;");
        html = html.replace(/>/g, "&gt;");
       // html = html.replace(/(((h|H)(t|T)(t|T)(p|P)[(s|S)]?:\/\/)|www)[0-9a-z\.\_\-\:\/\?\=\&A-Z]+/g, '<a href="javascript:void(0)" style="text-decoration:none;color: #1c8df6">$&</a>');
        html = $sce.trustAsHtml(MsgService.transform(html));
        return html;
      } else {
        return "";
      }
    };
    return filterfun;
  })

  //聊天首页时间过滤器
  .filter("chattimefilter", function () {
    var filterfun = function (time) {
      if (time == undefined) {
        return null;
      }

      var exactlytime = new Date(time);
      var now = new Date();
      var todayzeroclock = Date.parse(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate());// - 8 * 60 * 60 * 1000;
      var yestodayzeroclock = new Date(todayzeroclock - 24 * 60 * 60 * 1000).getTime();

      var year = exactlytime.getFullYear();
      var month = 1 + exactlytime.getMonth();
      var date = exactlytime.getDate();
      var hour = exactlytime.getHours();
      var minute = exactlytime.getMinutes();
      var second = exactlytime.getSeconds();

      if (time >= todayzeroclock) {
        //今天的消息
        var rs = "";
        if (hour < 10) {
          rs += "0" + hour;
        } else {
          rs += hour;
        }
        rs += ":";
        if (minute < 10) {
          rs += "0" + minute;
        } else {
          rs += minute;
        }
        rs += ":";
        if (second < 10) {
          rs += "0" + second;
        } else {
          rs += second;
        }
        return rs;
      } else if (exactlytime >= yestodayzeroclock) {
        return "昨天";
      } else {
        var rs = "";
        if (month < 10) {
          rs += "0" + month;
        } else {
          rs += month;
        }
        rs += "/";
        if (date < 10) {
          rs += "0" + date;
        } else {
          rs += date;
        }
        return rs;
      }
    }
    return filterfun;
  })
  //聊天室时间过滤器
    .filter("chatroomtimefilter", function () {
      var filterfun = function (time) {
        if (time == undefined) {
          return null;
        }

        var exactlytime = new Date(time);
        var now = new Date();
        var todayzeroclock = Date.parse(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate());

        var year = exactlytime.getFullYear();
        var month = 1 + exactlytime.getMonth();
        var date = exactlytime.getDate();
        var hour = exactlytime.getHours();
        var minute = exactlytime.getMinutes();
        var second = exactlytime.getSeconds();

        //时分秒
        var rs = "";
        if (hour < 10) {
          rs += "0" + hour;
        } else {
          rs += hour;
        }
        rs += ":";
        if (minute < 10) {
          rs += "0" + minute;
        } else {
          rs += minute;
        }
        rs += ":";
        if (second < 10) {
          rs += "0" + second;
        } else {
          rs += second;
        }
        if (time >= todayzeroclock) {
          //今天的消息
          return rs;
        } else {
          //年月日
          var rs2 = "";
          rs2 += year+"/";

          if (month < 10) {
            rs2 += "0" + month;
          } else {
            rs2 += month;
          }
          rs2 += "/";
          if (date < 10) {
            rs2 += "0" + date;
          } else {
            rs2 += date;
          }
          return rs2 + " " + rs;
        }
      }
      return filterfun;
    })
  .filter("moneyfixed", function () {
    var filterfun = function (value) {
      var money = parseFloat(value);

      return money.toFixed(2);
    };
    return filterfun;
  });
