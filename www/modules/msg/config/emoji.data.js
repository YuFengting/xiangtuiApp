(function () {
  "use strict";

  angular
    .module("xtui")
    .factory("EmojiData", EmojiData);


  function EmojiData() {
    var data=[[
      {src:"img/emoji/bishi.png" ,title:"鄙视" },
      {src:"img/emoji/bukaixin.png" ,title:"不开心" },
      {src:"img/emoji/feiwen.png" ,title:"飞吻" },
      {src:"img/emoji/fennu.png" ,title:"愤怒" },
      {src:"img/emoji/haixiu.png" ,title:"害羞" },
      {src:"img/emoji/jingkong.png" ,title:"惊恐" },
      {src:"img/emoji/kuqi.png" ,title:"哭泣" },
      {src:"img/emoji/lenghan.png" ,title:"冷汗" },
      {src:"img/emoji/shengbing.png" ,title:"生病" },
      {src:"img/emoji/shiran.png" ,title:"释然" },
      {src:"img/emoji/tiaopi.png" ,title:"调皮" },
      {src:"img/emoji/tongku.png" ,title:"痛苦" },
      {src:"img/emoji/touxiao.png" ,title:"偷笑" },
      {src:"img/emoji/weixiao.png" ,title:"微笑" },
      {src:"img/emoji/baobao.png" ,title:"包包" },
      {src:"img/emoji/baoyou.png" ,title:"保佑" },
      {src:"img/emoji/cuowu.png" ,title:"错误" },
      {src:"img/emoji/dabian.png" ,title:"大便" },
      {src:"img/emoji/dianhua.png" ,title:"电话" },
      {src:"img/emoji/fangzi.png" ,title:"房子" }
    ],[
      {src:"img/emoji/geili.png" ,title:"给力"},
      {src:"img/emoji/gongjiaoche.png" ,title:"公交车"},
      {src:"img/emoji/gou.png" ,title:"狗"},
      {src:"img/emoji/gui.png" ,title:"鬼"},
      {src:"img/emoji/guzhang.png" ,title:"鼓掌"},
      {src:"img/emoji/houzi.png" ,title:"猴子"},
      {src:"img/emoji/jiangbei.png" ,title:"奖杯"},
      {src:"img/emoji/kafei.png" ,title:"咖啡"},
      {src:"img/emoji/kouhong.png" ,title:"口红"},
      {src:"img/emoji/lingdang.png" ,title:"铃铛"},
      {src:"img/emoji/meigui.png" ,title:"玫瑰"},
      {src:"img/emoji/muji.png" ,title:"母鸡"},
      {src:"img/emoji/nansheng.png" ,title:"男生"},
      {src:"img/emoji/nvsheng.png" ,title:"女生"},
      {src:"img/emoji/ok.png" ,title:"OK"},
      {src:"img/emoji/pijiu.png" ,title:"啤酒"},
      {src:"img/emoji/qian.png" ,title:"钱"},
      {src:"img/emoji/qiche.png" ,title:"汽车"},
      {src:"img/emoji/quantou.png" ,title:"拳头"},
      {src:"img/emoji/ruo.png" ,title:"弱"}
    ],[
      {src:"img/emoji/shengdanshu.png" ,title:"圣诞树" },
      {src:"img/emoji/shengli.png" ,title:"胜利" },
      {src:"img/emoji/shouji.png" ,title:"手机" },
      {src:"img/emoji/shouqiang.png" ,title:"手枪" },
      {src:"img/emoji/shuijiao.png" ,title:"睡觉" },
      {src:"img/emoji/xiangshang.png" ,title:"向上" },
      {src:"img/emoji/xiangxia.png" ,title:"向下" },
      {src:"img/emoji/xiangzuo.png" ,title:"向左" },
      {src:"img/emoji/xiangyou.png" ,title:"向右" },
      {src:"img/emoji/xiayu.png" ,title:"下雨" },
      {src:"img/emoji/yanjing.png" ,title:"眼睛" },
      {src:"img/emoji/yao.png" ,title:"药" },
      {src:"img/emoji/yiyuan.png" ,title:"医院" },
      {src:"img/emoji/yu.png" ,title:"鱼" },
      {src:"img/emoji/zan.png" ,title:"赞" },
      {src:"img/emoji/zhengque.png" ,title:"正确" },
      {src:"img/emoji/zhu.png" ,title:"猪" },
      {src:"img/emoji/shousi.png" ,title:"寿司" },
      {src:"img/emoji/gaogenxie.png" ,title:"高跟鞋" },
      {src:"img/emoji/erduo.png" ,title:"耳朵" }
    ]];
    return {"get":function(){return data;}};



  }




})()
