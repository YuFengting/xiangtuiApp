(function () {
  'use strict';
  angular.module('xtui')
    .directive('distance', distance);
  distance.$inject = [];
  function distance() {
    var directive = {
      restrict: "E",
      transclude: true,
      scope: {
        temp: "@taskTemp",
        str: "="
      },
      link: link
    };
    return directive;
    function link(scope, elem, attrs) {
      scope.$watch("str", function () {
        if (scope.str.indexOf(scope.temp) == -1) {
          scope.str.push(scope.temp);
          var temphtml = '<div style="border: none" class=" daily-task-list-title light-bg clearfix" >';
          if (attrs.index == "0") {
            temphtml += '<div class="title fl">主题专享</div>';
          }
          temphtml += '<div class="nearMeter fr"><span>' + scope.temp + '</span>km</div></div>';
          elem.html(temphtml);
        }
      });

    }
  }

}());
