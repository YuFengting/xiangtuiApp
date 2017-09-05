angular.module('xtui')
  .controller("cityController", function ($scope, $rootScope, $stateParams, BlackService, SqliteUtilService, CityService, $location, $anchorScroll, $timeout, UtilService, $ionicScrollDelegate, UserService, $ionicModal) {
    $scope.$on("$ionicView.beforeEnter", function () {
      CityService.setInCityPage(true);
      $scope.startfun();
    });
    $scope.nocity = false;
    $scope.isSearching = 0;
    $scope.commonCities = [];
    $scope.allCities = [];
    $scope.search = {};
    var clickcount = 0;
    $scope.localcity = UserService.location.city;
    $scope.choosecity = "";
    if ($scope.localcity == null || $scope.localcity == "") {
      SqliteUtilService.selectData("city", "id", "type=2").then(function (data) {
        $scope.localcity = data[0].name;
      }, function () {
      });
    }

    var getCommonCities = function () {
      SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
        $scope.commonCities = data;
      }, function () {
      });
    };
    getCommonCities();
    var insertIntoCommonCity = function (city) {
      if (city != null && city != "") {
        SqliteUtilService.selectData("commoncity", "intime", null, "desc").then(function (data) {
          var flag = false;
          var sqldata = [{name: city, intime: new Date().getTime()}];
          var index = -1;
          $(data).each(function (n, v) {
            if (v.name == city) {
              flag = true;
              index = n;
            }
          });
          var dataForInsert = [];
          if (flag) {
            dataForInsert = [];
            $(data).each(function (n, v) {
              if (n != index)
                dataForInsert.push({name: v.name, intime: v.intime});
              else
                dataForInsert.push(sqldata[0]);
            });
            SqliteUtilService.insertDataOfList(dataForInsert, "commoncity", null, null);
          } else {
            if (data.length >= 6) {
              data.splice(data.length - 1, 1);
              dataForInsert = [];
              dataForInsert.push(sqldata[0]);
              $(data).each(function (n, v) {
                if (n != index)
                  dataForInsert.push({name: v.name, intime: v.intime});
              });
              SqliteUtilService.insertDataOfList(dataForInsert, "commoncity", null, null);
            } else {
              SqliteUtilService.insertDataOfList(sqldata, "commoncity", null, "name=\"" + city + "\"");
            }
          }
        }, function () {
        });
      }
    };
    $timeout(function () {
      var cities = CityService.getCities();
      if (cities != null && cities.length > 0) {
        $scope.allCities = CityService.getCityMap(cities);
      } else {
        CityService.getAllCities().then(function (res) {
          $scope.allCities = res.data;
          var dataList = [];
          var index = 2;
          $.each(res.data, function (n, v) {
            $.each(v.value, function (i, val) {
              val.id = index;
              index++;
              dataList.push(val);
            })
          });
          CityService.setCities(dataList);
          SqliteUtilService.insertDataOfList(dataList, "city", null, "type=0");
        }, function () {
        });
      }
    }, 100);

    $scope.doRefresh = function () {
      CityService.getHotCityList().then(function (res) {
        $scope.hotCities = res.data;
        $.each($scope.hotCities, function (n, v) {
          v.id = n + 10;
        });
        SqliteUtilService.insertDataOfList($scope.hotCities, "hotcity");
      }, function () {
      });
      CityService.getAllCities().then(function (res) {
        $scope.allCities = res.data;
        var dataList = [];
        var index = 2;
        $.each(res.data, function (n, v) {
          $.each(v.value, function (i, val) {
            val.id = index;
            index++;
            dataList.push(val);
          })
        });
        CityService.setCities(data);
        SqliteUtilService.insertDataOfList(dataList, "city", null, "type=0");

      }, function () {
      });
      $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.gotoLetter = function (id) {
      $location.hash(id);
      $anchorScroll();
    };
    $ionicModal.fromTemplateUrl('popupmask1.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
    };
    $scope.closeModal = function (type) {
      $scope.modal.hide();
      if (type == 1) {
        UtilService.tongji("switchcity", {'changecity': type});
      }
      clickcount=0;
    };
    $scope.backToHome = function (city) {
      if(clickcount==1){
        return ;
      }

      clickcount=1;
      if (city == "") {
        $scope.goback();
        return;
      }
      if (typeof(city) == "string") {
        $scope.choosecity = city;
        if (city == $scope.localcity || city == UserService.location.district) {
          var sqldata = [{id: 1, name: city, abbrname: "", type: 2}];
          SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
          $rootScope.city = city;
        } else {
          $scope.openModal();
          return;
        }
      } else {
        $scope.choosecity = city.name;
        if (city.name == $scope.localcity || city.name == UserService.location.district) {
          var sqldata = [{id: 1, name: city.name, abbrname: city.abbrname, type: 2}];
          SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
          $rootScope.city = city.name;
        } else {
          $scope.openModal();
          return;
        }
      }
      insertIntoCommonCity($rootScope.city);
      $scope.goback();
      $timeout(function(){
        clickcount=0;
      },2000);
    };

    var  chooseCityClick = 0;
    $scope.chooseCity = function (type) {
      if(chooseCityClick==1){
        return;
      }
      chooseCityClick=1;
      $scope.closeModal(type);
      var sqldata = [{id: 1, name: $scope.choosecity, abbrname: "", type: 2}];
      SqliteUtilService.insertDataOfList(sqldata, "city", null, "type=2");
      $rootScope.city = $scope.choosecity;
      insertIntoCommonCity($rootScope.city);
      $scope.goback();

      $timeout(function () {
        chooseCityClick = 0;
        UtilService.tongji("switchcity", {'changecity': type});
      }, 2000);
    };


    $scope.goSearchList = function (key) {
      if (angular.isUndefined($scope.search.key) || $scope.search.key == "") {
        $scope.isSearching = 0;
        UtilService.showMess("请输入搜索关键字");
      } else {
        $scope.isSearching = 1;
        CityService.search(key).then(function (res) {
          if (res.data != null && res.data.length > 0) {
            $scope.nocity = false;
          } else {
            $scope.nocity = true;
          }
          var dataList = [];
          var index = 2;
          $.each(res.data, function (n, v) {
            $.each(v.value, function (i, val) {
              val.id = index;
              index++;
              dataList.push(val);
            })
          });
          $scope.searchCities = dataList;

          $("#subinp").blur();
        }, function () {
        });
      }
    };

    $scope.checkInp = function () {
      if ($scope.search.key == "") {
        $scope.isSearching = 0;
        $scope.nocity = false;
      }
    };

    //滚动条滑动方法
    $scope.toNumber = function (e) {
      var items = parseInt((e.gesture.touches[0].pageY - 280) / 22);
      var lista = $scope.allCities;
      var topi = document.getElementById(lista[items].key).offsetTop;
      $ionicScrollDelegate.$getByHandle('cityscroll').scrollTo(0, topi, false)
    };

    //  点击
    $scope.ctoNumber = function (e) {
      var items = parseInt((e.pageY - 280) / 22) - 1;
      var lista = $scope.allCities;
      var topi = document.getElementById(lista[items].key).offsetTop;
      $ionicScrollDelegate.$getByHandle('cityscroll').scrollTo(0, topi, false)
    }


  });
