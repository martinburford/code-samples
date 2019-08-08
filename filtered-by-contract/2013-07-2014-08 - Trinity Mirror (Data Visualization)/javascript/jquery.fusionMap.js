(function(jQuery){
  var fusionMapConfiguration = {
    apiKey: 'AIzaSyDDkkbIaR3I9ITbt3HJgYeQwj2jlKeRNSo',
    buckets: [],
    fusionApiUrlPrefix: 'https://www.googleapis.com/fusiontables/v1/query',
    googleMap: null,
    locationColumn: 'geometry',
    polyfilSettings: {
      fillOpacity: 0.4,
      strokeColor: '#333333',
      strokeOpacity: 0.4,
      strokeWeight: 1
    },
    // tableId: '1I0PJmbAMloMpbpY42UPVBjLEldNeS0cv8bdjUck',
    tableId: '1oyR6rs2hRtXJ9qTZ0wcNWtt-M5PBRsURK4ROG2c',
    timings: {
      hideMapOverlay: 1500
    }
  }
  
  var methods = {
    /**
    * Initialize all polyfil maps
    * @method init
    */
    init: function(){
      $.logEvent('[$.fn.fusionMap (init)]');
      
      var selfObj;
      
      return this.each(function(){
        selfObj = $(this);
        
        // Load the data via the Fusion API
        selfObj.fusionMap('loadDataFromAPI');
      });
    },

    /**
    * Load the data via the Fusion API
    * @method loadDataFromAPI
    */  
    loadDataFromAPI: function(){
      $.logEvent('[$.fn.fusionMap (loadDataFromAPI)]');
      
      var selfObj = $(this);
      var query = "SELECT Postcode, 'Happiness (out of 10)' FROM " + fusionMapConfiguration.tableId;
      var encodedQuery = encodeURIComponent(query);
      
      // Construct the URL    
      var url = fusionMapConfiguration.fusionApiUrlPrefix + '?sql=' + encodedQuery + '&key=' + fusionMapConfiguration.apiKey + '&callback=fusionMap.core.fusionJsonPCallback';

      // Persist the current map object
      fusionMap.configuration.callbackMapObj = selfObj;
      
      $.ajax({
        url: url,
        dataType: 'jsonp'
      });         
    },
    
    /**
    * Based on the data-attributes specified in the HTML of the map, generate the bucket styles for the map render
    * @method generatePolyfilDataConfiguration
    */
    generatePolyfilDataConfiguration: function(){
      $.logEvent('[$.fn.fusionMap (generatePolyfilDataConfiguration)]');
      
      var selfObj = $(this);
      var bucketsColourObj = selfObj.attr('data-bucket-colours').split(',');
      var bucketsRange = selfObj.attr('data-bucket-ranges').split(',');
      var individualBucket;
      var rangeLower;
      var rangeUpper;
      
      // Reset the contents of the temporary holder for the configuration data, to ensure previous map configuration data isn't concatenated together
      fusionMapConfiguration.buckets = [];

      $.each(bucketsColourObj,function(index){        
        individualBucket = {
          polygonOptions: {}
        };  
        
        rangeLower = bucketsRange[index].split('|')[0].replace('[','');
        rangeUpper = bucketsRange[index].split('|')[1].replace(']','');
        
        individualBucket.where = "'Happiness (out of 10)' > " + rangeLower + " AND 'Happiness (out of 10)' <= " + rangeUpper;
        
        // Add the polygon settings
        individualBucket.polygonOptions.fillColor = bucketsColourObj[index];
        individualBucket.polygonOptions.fillOpacity = fusionMapConfiguration.polyfilSettings.fillOpacity;
        individualBucket.polygonOptions.strokeColor = fusionMapConfiguration.polyfilSettings.strokeColor;
        individualBucket.polygonOptions.strokeOpacity = fusionMapConfiguration.polyfilSettings.strokeOpacity;
        individualBucket.polygonOptions.strokeWeight = fusionMapConfiguration.polyfilSettings.strokeWeight; 
        
        $.logEvent('[$.fn.fusionMap (generatePolyfilDataConfiguration)]: ' + individualBucket.where); 
        
        // Push all individual colour settings to a single storage device
        fusionMapConfiguration.buckets.push(individualBucket);
      });

      selfObj.data('polyfilConfiguration',fusionMapConfiguration.buckets);
    },
      
    /**
    * Build map (via API)
    * @method buildMapFromAPI
    */
    buildMapFromAPI: function(){
      $.logEvent('[$.fn.fusionMap (buildMapFromAPI)]');
      
      var selfObj = $(this);
      
      // Create inner element, this is the one which will act as the wrapper for the map object
      selfObj.append(
        $('<div />')
          .attr({
            'class': 'map-container',
            id: selfObj.attr('id') + '-map-container'
          })
      )

      // Remove map labels
      var mapStyles = [{
        featureType: 'all',
        elementType: 'labels',
        stylers: [{
          visibility: 'off'
        }]
      }]
          
      window[selfObj.attr('id')] = new google.maps.Map(document.getElementById(selfObj.attr('id') + '-map-container'), {
        center: new google.maps.LatLng(selfObj.attr('data-latitude-origin'), selfObj.attr('data-longitude-origin')),
        zoom: parseInt(selfObj.attr('data-zoom-level')),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: mapStyles
      });
    },
    
    /**
    * Build layer to support Fusion table data
    * @method buildFusionTableLayer
    */  
    buildFusionTableLayer: function(){
      $.logEvent('[$.fn.fusionMap (buildFusionTableLayer)]');
      
      var selfObj = $(this);
      var styles = selfObj.data('polyfilConfiguration');
      
      window[selfObj.attr('id') + '-fusion-layer'] = new google.maps.FusionTablesLayer({
        query: {
          select: fusionMapConfiguration.locationColumn,
          from: fusionMapConfiguration.tableId
        },
        map: window[selfObj.attr('id')],
        styles: styles
      });
      
      // Build the supporting key to the map
      selfObj.fusionMap('buildMapKey');
    },
    
    /**
    * Build the supporting key to the map
    * @method buildMapKey
    */
    buildMapKey: function(){
      $.logEvent('[$.fn.fusionMap (buildMapKey)]');
      
      var selfObj = $(this);
      
      var mapKeyObj = $('<ul />')
        .append(function(){
          var keyItems = '';
          var bucketsColours = selfObj.attr('data-bucket-colours').split(',');
          var bucketsRanges = selfObj.attr('data-bucket-ranges').split(',');
          var rangeLower;
          var rangeUpper;
              
          $.each(bucketsColours,function(index){
            rangeLower = bucketsRanges[index].split('|')[0].replace('[','');
            rangeUpper = bucketsRanges[index].split('|')[1].replace(']','');
              
            keyItems += '<li style="color:' + this + '"><span style="background:' + this + '">' + this + '</span>' + rangeLower + ' - ' + rangeUpper + '</li>';
          });

          return keyItems;
        })
      .attr('class','key')
      .appendTo(selfObj.parents('.module'))
      
      // Once the Fusion layer has been added to the map, remove the overlay to reveal the map
      selfObj
        .parents('.module')
          .find('.overlay')
            .fadeOut(fusionMapConfiguration.timings.hideMapOverlay,function(){
              if(!selfObj.attr('data-initialized')){
                // Notify dispatcher that a component has finished initializing
                dataVisualization.dispatcher.initializeComplete({
                  finishedId: selfObj.attr('id')
                });
              }
              
              // Set flag so that this complete callback will not ever be called again
              selfObj.attr('data-initialized',true);
            });
    }
  };
  
  // Initialize plugin
  $.fn.fusionMap = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));