/**
 * Created by DingLei on 2017/1/11.
 */
angular.module('starter.services', [])

  .factory('BaidumapService', function($q) {
    function getIcon (offsetX, offsetY) {
      var myIcon = new BMap.Icon("img/markers.png", new BMap.Size(22, 24), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(offsetX, offsetY)
      });
      return myIcon;
    }

    var mapAdapter = function (container, long, lat) {
      var mapOptions = {minZoom:13, maxZoom:19};
      var map = new BMap.Map(container, mapOptions);
      var mPoint = new BMap.Point(long, lat);
      map.centerAndZoom(mPoint, 15);
      // map.enableScrollWheelZoom();        //启用滚轮缩放

      //缩放控件
      var opts = {type: BMAP_NAVIGATION_CONTROL_ZOOM };
      map.addControl(new BMap.NavigationControl(opts));


      var poiList = [];


      return {
        getPOIList: function() {
          var deferred = $q.defer();
          var mOption = {
            poiRadius : 1000,           //半径为1000米内的POI,默认100米
            numPois : 20                //列举出50个POI,默认10个
          };
          var myGeo = new BMap.Geocoder();
          myGeo.getLocation(mPoint,
            function mCallback(rs){
              //当前位置也加入到poiList中
              var curPosition = {title:rs.address, point:rs.point};

              var allPois = rs.surroundingPois || [];       //获取全部POI（该点半径为100米内有6个POI点）
              allPois = [curPosition].concat(allPois);

              for(var i=0;i<allPois.length;++i){
                var myIcon = getIcon(0, -300);
                var marker = new BMap.Marker(allPois[i].point,{icon:myIcon});

                if(i == 0) {
                  map.addOverlay(marker);
                }

                var poi = allPois[i];
                poi.marker = marker;
                poi.selected = i == 0;
                poiList.push(poi);
              }
              deferred.resolve(poiList);
            },mOption
          );
          return deferred.promise;
        },
        selectPOI: function (poi) {
          if(typeof poi === "number") {
            poi = poiList[poi];
          }
          if(poi != null) {
            console.log(poi);
            if(poi.selected) {
              return;
            } else {
              for(var i = 0;i<poiList.length;i++) {
                if(poiList[i].selected == true) {
                  poiList[i].selected = false;
                  map.removeOverlay(poiList[i].marker);
                  break;
                }
              }
              if(i == 0) {
                var myIcon = getIcon(0, -250);
                var newmarker = new BMap.Marker(poiList[0].point,{icon:myIcon});
                // newmarker.setOffset(new BMap.Size(1, -12));
                newmarker.setTop(true);

                map.removeOverlay(poiList[0].marker);
                map.addOverlay(newmarker);

                poiList[0].marker = newmarker;
              }

              poi.selected = true;
              var myIcon = getIcon(0, -300);
              var newmarker = new BMap.Marker(poi.point,{icon:myIcon});
              // newmarker.setOffset(new BMap.Size(1, -12));
              newmarker.setTop(true);

              map.removeOverlay(poi.marker);
              map.addOverlay(newmarker);
              poi.marker = newmarker;

              map.panTo(poi.point);
            }
          }
        },
        getResult: function () {
          for(var i = 0;i<poiList.length;i++) {
            if(poiList[i].selected === true) {
              var result = {
                title: poiList[i].title,
                address: poiList[i].address,
                point: poiList[i].point,
              };
              return result;
            }
          }
          return null;
        }
      };


    };

    return {
      getInstance: function (container, lng, lat) {
        return mapAdapter(container, lng, lat);
      }
    };
  });
