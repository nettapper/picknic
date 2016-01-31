'use strict';

(function () {

  class MainController {

    constructor($http, $modal, uiGmapGoogleMapApi) {
      this.$http = $http;
      this.$modal = $modal;
      this.awesomeThings = [];
      this.parks = [];
      this.trees = [];
      this.res = [];
      this.$modalInstance = {};
      this.tree_options = {
        icon: '/assets/images/tree16.png'
      };
      this.fill = { color: '#2c8aa7', opacity: '0.3' };
      this.treeslider = 50;
      this.marker = {
        id: 'me',
        coords: {latitude: 53.5, longitude: -113.5},
        options: {icon: '/assets/images/marker32.png'}
      };
      this.options = {};
      this.browserSupportFlag = Boolean();
      this.initialLocation = {};
      this.formData = {children: ""};
      this.weather = {};

      this.events = {click : function() {console.log("CLICK");}};

      // created after tiles loaded
      this.g_map_obj = {};
      this.map = {
        center: {latitude: 53.5333, longitude: -113.5000}, zoom: 14,
        events: {
          tilesloaded: (map) => {
            this.g_map_obj = map;
          }
        }
      };
      this.options = {scrollwheel: false};

      //Range Slider
      this.circles = [
        {
          id: 1,
          center: {
            latitude: 53.5, longitude: -113.5
          },
          radius: 1000, stroke: {color: '#ffcccc', weight: 3, opacity: 1},
          fill: {
            color: '#ffcccc', opacity: 0.25
          }
        }
      ];

      $http.get('/api/things').then(response => {
        this.awesomeThings = response.data;
      });

      $http.get('http://api.openweathermap.org/data/2.5/weather?lat=53.5333&lon=-113.5000&appid=ada399b22b7d2525b330e37f7be56bb5').then(response => {
        this.weather = response.data;
      });

      this.handleEntities();

      uiGmapGoogleMapApi.then(maps => {
        // Initialize the geoencoder
        this.geocoder = new google.maps.Geocoder();
        document.getElementById('submit').addEventListener('click', () => {
          this.geocodeAddress(this.geocoder, this.g_map_obj);
        });
        this.handleGeoLocation();

        //AutoComplete for search
        this.autoComplete();
      });
    }

		geocodeAddress(geocoder, resultsMap) {
			var address = document.getElementById('address').value;
			geocoder.geocode({'address': address}, (results, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					resultsMap.setCenter(results[0].geometry.location);
					if ('id' in this.marker) {
						this.marker.coords = {
							latitude: results[0].geometry.location.G,
							longitude: results[0].geometry.location.K
						};
					}
					this.marker.options = { icon: '/assets/images/marker32.png' };
					this.circles[0].center.latitude = results[0].geometry.location.G;
					this.circles[0].center.longitude = results[0].geometry.location.K;
					this.handleEntities();
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
		}

    handleGeoLocation() {
      /**
       * Do Geolocation logic
       * Try W3C Geolocation (Preferred)
       */
      if (navigator.geolocation) {
        this.browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(position => {
          this.initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          this.g_map_obj.setCenter(this.initialLocation);
          this.marker = {
            id: 'me',
            coords: {latitude: position.coords.latitude, longitude: position.coords.longitude},
            options: {
              icon: '/assets/images/marker32.png'
            }
          };
          //Set Circle
          this.circles[0].center.latitude = position.coords.latitude;
          this.circles[0].center.longitude = position.coords.longitude;
          this.circles[0].radius = 1000;
          this.handleEntities();
        }, () => {
          this.handleNoGeolocation(this.browserSupportFlag);
        });
      }
      // Browser doesn't support Geolocation
      else {
        this.browserSupportFlag = false;
        this.handleNoGeolocation(this.browserSupportFlag);
      }
    }

    handleNoGeolocation(errorFlag) {
      var edmonton = new google.maps.LatLng(53.5333, -113.5000);
      if (errorFlag == true) {
        alert("Geolocation service failed. We've placed you in Edmonton.");
        this.initialLocation = edmonton;
      } else {
        alert("Your browser doesn't support geolocation. We've placed you in Edmonton.");
        this.initialLocation = edmonton;
      }
      this.g_map_obj.setCenter(this.initialLocation);
    }

    handleEntities() {
      // TODO: LINE 1295 of angular-google-maps.js CHANGE TO ARROW NOTATION, read README
      var lat = this.circles[0].center.latitude;
      var lng = this.circles[0].center.longitude;
      var radius = Number(this.circles[0].radius) / 1000;
      this.parks = [];
      this.$http.get('/api/parklands/' + lng.toString() + '/' + lat.toString() + '?radius=' + radius.toString()).then(response => {
        this.res = response.data;
        
        this.parks = this.res;
      }).then( () => {
        for (var i = 0; i < this.res.length; i++) {
          var t_res = this.parks[i];
          this.res[i].events = { click : () => { 
            this.$modalInstance = this.$modal.open({
              animation: true,
              templateUrl: 'myModalContent.html',
              size: "lg",
              resolve: {
                stuff : function() {return "Asdfsadf";}
              }
            })
          }};
        };
      });

    }

    ok() {
      this.$modalInstance.close($scope.selected.item);
    };

    cancel() {
        this.$modalInstance.dismiss('cancel');
    };

    handleTrees() {
      var lat = this.circles[0].center.latitude;
      var lng = this.circles[0].center.longitude;
      var radius = Number(this.circles[0].radius) / 1000;
      this.trees = [];
      this.$http.get('/api/recommendations/' + lng.toString() + '/' + lat.toString() + '?radius=' + radius.toString()).then(response => {
        this.parks = response.data.parklands;
        this.trees = response.data.trees;
      });
    }

    addThing() {
      if (this.newThing) {
        this.$http.post('/api/things', {name: this.newThing});
        this.newThing = '';
      }
    }

    sliderChange() {
      this.circles[0].radius = Number(this.slider);
<<<<<<< HEAD
      this.handleEntities();
=======
//      this.handleEntities();
>>>>>>> 6b255a367b1a290b78b0942f03082b159619cd84
    }

    deleteThing(thing) {
      this.$http.delete('/api/things/' + thing._id);
    }

    autoComplete(){
      var input = document.getElementById("address");
      var autocomplete = new google.maps.places.Autocomplete(input);
      //autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', () => {
        this.geocodeAddress(this.geocoder, this.g_map_obj);
      });
    }
  }

  angular.module('picknicApp')
    .controller('MainController', MainController);

})();
