/**
 * Created by Administrator on 2016/12/26.
 */
angular.module('xtui')
  .directive("helpSellScrollFunc", function () {
    return {
      restrict: 'EA',
      scope:true,
      link: function ($scope, ele, attr) {
        $(ele[0]).scroll(function () {
          //var getindexTop = (device.platform == "Android") ? $(ele[0]).scrollTop() : $scope.businessscroll.getScrollPosition().top;
          var getindexTop =$scope.businessscroll.getScrollPosition().top;

          var opty = 0.3 - getindexTop / 312;
          //滚动条向下拉动时的事件方法
          if (getindexTop <= 0) {
            if( $(".chatWithBusBtn").css("top")=='-62px'){
              $(".chatWithBusBtn").css({"top":-62.1+"px"});
            }else{
              $(".chatWithBusBtn").css({"top":-62+"px"});
            }

          } else {
            $(".helpSellHeader2").css("background", "rgba(255,59,48," + getindexTop / 312 + ")");
            $(".iconRoundBox2").css({'background': "rgba(0,0,0," + opty + ")"});
            $(".business_focusBtn").css({"opacity":opty});
            $(".askbusbtn").css({"opacity":1-opty});
          }
          if (getindexTop < 10) {
            $(".helpSellHeader2").css("background", "rgba(255,59,48,0)");
            $(".iconRoundBox2").css({'background': "rgba(0,0,0,.3)"});
            $(".business_focusBtn").css({"opacity":1});
            $(".askbusbtn").css({"opacity":0});
          }
          if(getindexTop>80){
            $('.focusebtn').hide();
            $('.askebtn').show()
          }else{
            $('.focusebtn').show();
            $('.askebtn').hide()
          }

          if (getindexTop > 320) {
            $(".helpSellHeader2").css("background", "rgba(255,59,48,1)");
            $(".iconRoundBox2").css({'background': "rgba(0,0,0,0)"});
            $(".business_focusBtn").css({"opacity":0});
            $(".askbusbtn").css({"opacity":1});

          }
        });
      }
    }
  })
  .directive('flashing', function () {
    return {
      restrict: "E",
      scope: {
        fast: "@buserFast"
      },
      replace: true,
      link: function (scope, elem) {
        scope.$watch("fast", function () {
          var redlen = scope.fast;

          var graylen = 3 - redlen;
          var tempFast = '<div>';
          for (var i = 0; i < redlen; i++) {
            tempFast += '<i class="icon icon-xt3-speed red"></i>';
          }
          for (var j = 0; j < graylen; j++) {
            tempFast += '<i class="icon icon-xt3-speed gray"></i>';
          }
          tempFast += '</div><p>处理速度</p>';
          elem.html(tempFast);
        });
      }
    }

  })
