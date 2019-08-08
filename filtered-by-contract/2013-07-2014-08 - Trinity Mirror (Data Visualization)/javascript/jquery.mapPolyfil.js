(function(jQuery){
  var mapPolyfilConfiguration = {
    apiKey: 'AIzaSyDDkkbIaR3I9ITbt3HJgYeQwj2jlKeRNSo',
    buckets: [],    
    fillOpacity: '1.0',
    fusionApiUrlPrefix: 'https://www.googleapis.com/fusiontables/v1/query',
    googleMap: null, 
    strokeColor: '#000000',
    strokeOpacity: '0.2',
    strokeWeight: '1',
    tableId: '1WyIVHGN1eBwtq-zJJVwidKx5nISiXDdchJk2Uds',
    timings: {
      delayBeforeHideOverlay: 500,
      hideMapOverlay: 1500
    }
  }
  
  var methods = {
    /**
    * Initialize all polyfil maps
    * @method init
    * @param {xx} xx Description
    */
    init: function(obj){
      $.logEvent('[$.fn.mapPolyfil (init)]: ' + $.logJSONObj(obj));
      
      var selfObj = $(this);
      
      return this.each(function(){
        selfObj = $(this);
        
        // Load the data through the API, in order to dynamically build the dropdown list of Wards
         selfObj.mapPolyfil('loadWardsFromAPI');
      });
    },

    /**
    * Build map (via API)
    * @method buildMapFromAPI
    */
    buildMapFromAPI: function(){
      $.logEvent('[$.fn.mapPolyfil (buildMapFromAPI)]');
      
      var selfObj = $(this);
      
      // Create inner element, this is the one which will act as the wrapper for the map object
      selfObj.append(
        $('<div />')
          .attr({
            'class': 'map-container',
            id: selfObj.attr('id') + '-map-container'
          })
      )
      
      window[selfObj.attr('id')] = new google.maps.Map(document.getElementById(selfObj.attr('id') + '-map-container'), {
        center: new google.maps.LatLng(selfObj.attr('data-latitude-origin'), selfObj.attr('data-longitude-origin')),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
    },
    
    /**
    * Build layer to support Fusion table data
    * @method buildFusionTableLayer
    */  
    buildFusionTableLayer: function(){
      $.logEvent('[$.fn.mapPolyfil (buildFusionTableLayer)]');    
      
      var selfObj = $(this);
      var styles = selfObj.data('polyfilConfiguration');
      
      window[selfObj.attr('id') + '-fusion-layer'] = new google.maps.FusionTablesLayer({
        query: {
          select: mapPolyfilConfiguration.locationColumn,
          from: mapPolyfilConfiguration.tableId
        },
        map: window[selfObj.attr('id')],
        styles: styles
      });
    },
  
    /**
    * Load the data through the API, in order to dynamically build the dropdown list of Wards
    * @method loadWardsFromAPI
    */  
    loadWardsFromAPI: function(){
      $.logEvent('[$.fn.mapPolyfil (loadWardsFromAPI)]');

      var selfObj = $(this);
      var query = 'SELECT WardName, RandomFilter FROM ' + mapPolyfilConfiguration.tableId;        
      var encodedQuery = encodeURIComponent(query);
      
      // Construct the URL    
      var url = mapPolyfilConfiguration.fusionApiUrlPrefix + '?sql=' + encodedQuery + '&key=' + mapPolyfilConfiguration.apiKey + '&callback=polyfil.core.fusionJsonPCallback';
            
      // Persist the current map object
      polyfil.configuration.callbackMapObj = selfObj;
      
      $.ajax({
        url: url,
        dataType: 'jsonp'
      });         
    },
    
    /**
    * Based on the amount of rows which have come back from the JSONP, dynamically configure the buckets data
    * @method generatePolyfilDataConfiguration
    * @param {Integer} dataRows The number of rows of data returned from Google Fusion table (via JSONP)
    */
    generatePolyfilDataConfiguration: function(obj){
      $.logEvent('[$.fn.mapPolyfil (generatePolyfilDataConfiguration)]: ' + $.logJSONObj(obj));

      var selfObj = $(this);
      var bucketsColorObj = selfObj.attr('data-colour-ranges').split(',');
      var bucketsCount = bucketsColorObj.length;
      var dataRecords = obj.dataRows;
      var bucketSize = Math.ceil(dataRecords/bucketsCount);
      var bucketOffset;
      var individualBucket;
      var bucketRanges = [];
      
      // Reset the contents of the temporary holder for the configuration data, to ensure previous map configuration data isn't concatenated together
      mapPolyfilConfiguration.buckets = [];
      
      $.each(bucketsColorObj,function(index){
        individualBucket = {polygonOptions: {}};
        
        if(index == 0){
          individualBucket.where = "'RandomFilter' > 0 AND 'RandomFilter' <= " + bucketSize;
          
          // Store the bucket range, as this will be added as a data attribute to the container map DOM element
          bucketRanges.push(0 + '|' + bucketSize);
          
          $.logEvent('[$.fn.mapPolyfil (generatePolyfilDataConfiguration)]: \'RandomFilter\' > 0 AND \'RandomFilter\' <= ' + bucketSize);
        }
        else{
          bucketOffset = (index*bucketSize);          
          individualBucket.where = "'RandomFilter' > " + bucketOffset + " AND 'RandomFilter' <= " + (bucketOffset+bucketSize);

          // Store the bucket range, as this will be added as a data attribute to the container map DOM element
          bucketRanges.push((bucketOffset+1) + '|' + (bucketOffset+bucketSize));
          
          $.logEvent('[$.fn.mapPolyfil (generatePolyfilDataConfiguration)]: \'RandomFilter\' > ' + bucketOffset + ' AND \'RandomFilter\' <= ' + (bucketOffset+bucketSize));
        }
        
        // Add the bucket ranges as a data attribute to the container map DOM element
        selfObj.attr('data-bucket-ranges',bucketRanges);
        
        // Add the polygon fill colour
        individualBucket.polygonOptions.fillColor = bucketsColorObj[index];
        individualBucket.polygonOptions.fillOpacity = mapPolyfilConfiguration.fillOpacity;
        individualBucket.polygonOptions.strokeColor = mapPolyfilConfiguration.strokeColor;
        individualBucket.polygonOptions.strokeOpacity = mapPolyfilConfiguration.strokeOpacity;
        individualBucket.polygonOptions.strokeWeight = mapPolyfilConfiguration.strokeWeight;

        // Push all individual colour settings to a single storage device
        mapPolyfilConfiguration.buckets.push(individualBucket);
      });
            
      selfObj.data('polyfilConfiguration',mapPolyfilConfiguration.buckets);
    },
    
    /**
    * Create the custom filters for the map
    * @method generateMapFilters
    */
    generateMapFilters: function(){
      $.logEvent('[$.fn.mapPolyfil (generateMapFilters)]');
      
      var selfObj = $(this);
      var checkboxFilters = '';
      var bucketRanges = selfObj.attr('data-bucket-ranges').split(',');
      var colourRanges = selfObj.attr('data-colour-ranges').split(',');
      
      // Create dropdown list for filtering Wards, one at a time
      $('<div />')
        .append(
          $('<select />')
            .append(
              $('<option />')
                .attr('value','')
                .html('Loading Wards...')
            )
            .attr('class','update')
        )
        .append(
          $('<ul />')
            .append(function(){
              $.each(bucketRanges,function(index){
                checkboxFilters += '<li>';
                checkboxFilters += '<input type="checkbox" name="RandomFilter" data-bucket-range="' + bucketRanges[index] + '" />';
                checkboxFilters += '<label>' + bucketRanges[index].replace('|','-') + '</label>';
                checkboxFilters += '</li>';
              });

              return checkboxFilters;
            })
            .attr('class','checkboxes')
        )
        .append(
          $('<ul />')
            .append(function(){
              checkboxFilters = '';
              
              $.each(colourRanges,function(index){
                checkboxFilters += '<li>';
                checkboxFilters += '<span style="background:#' + colourRanges[index] + '">Hex colour of #' + colourRanges[index] + '</span>';
                checkboxFilters += '<p>' + bucketRanges[index].replace('|','-') + '</p>';
                checkboxFilters += '</li>';
              });

              return checkboxFilters;
            })
            .attr('class','colour-key')
        )
        .attr('class','map-controls')
        .prependTo(selfObj)
        
      // Now that the unique maps controls have been built, assign event handlers to them
      // Initialize map event handlers
      selfObj.mapPolyfil('mapEventHandlersInit');
    },
    
    /**
    * Initialize map event handlers
    * @method mapEventHandlersInit
    */
    mapEventHandlersInit: function(){
      $.logEvent('[$.fn.mapPolyfil (mapEventHandlersInit)]');
      
      var selfObj = $(this);
      
      // Dropdown filter
      $('.map-controls .update',selfObj).on('change',function(e){       
        polyfil.core.updateMap({
          mapId: selfObj.attr('id'),
          tableId: mapPolyfilConfiguration.tableId
        });
      });
      
      // Checkbox filter(s)     
      $('.map-controls INPUT',selfObj).on('click',function(e){
        polyfil.core.filterMap({
          mapId: selfObj.attr('id'),
          tableId: mapPolyfilConfiguration.tableId
        });
      });
      
      // Auto-execute the checkbox filter (on page load)
      polyfil.core.filterMap({
        mapId: selfObj.attr('id'),
        tableId: mapPolyfilConfiguration.tableId
      });
      
      // Once all markers have been added to the map, remove the overlay to reveal the fully initialized map
      setTimeout(function(){
        selfObj.prev().fadeOut(mapPolyfilConfiguration.timings.hideMapOverlay,function(){
          // Notify dispatcher that a component has finished initializing
          dataVisualization.dispatcher.initializeComplete({
            finishedId: selfObj.attr('id')
          });
          
          // Set flag so that this complete callback will not ever be called again
          selfObj.attr('data-initialized',true);
        });
      },mapPolyfilConfiguration.timings.delayBeforeHideOverlay);
    }   
  };
  
  // Initialize plugin
  $.fn.mapPolyfil = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));