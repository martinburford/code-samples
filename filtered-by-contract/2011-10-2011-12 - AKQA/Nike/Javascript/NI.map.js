var NI = NI || {};
var globalObj = {
  debug:true
}

NI.map = (function(){
  var config = {
    boundsCoOrdinatesObj:{},
    columnsWide:0,
    currentZoomLevel:4,
    debug:true,
    initialGeoCoordinates:{
      latitude:51.500152,
      longitude:-0.126236
    },
    loaded:false,
    mapObj:null,
    markerClusterObj:null,
    markersObj:[],
    nwPixelCoordinate:null,
    rowsHigh:0,
    settings:{          
      clusterImage:'/googlemaps_frontend/images/marker-points/cluster.png',           
      markerImage:'/googlemaps_frontend/images/marker-points/marker.png',
      styledMapType:''
    },
    styledMapType:null,
    tileOverlays:{
      style:'red'
    },
    tilesPreviouslyLoaded:[],           
    tileSize:256,
    webservices:{
      teamsData:'http://10.2.120.90:8080/mockchance/teamData',
      teamsCombined:'http://10.2.120.90:8080/mockchance/teamsCombined',
      teams:'http://10.2.120.90:8080/mockchance/teams'
      
      
      
    },
    zoomLevelStyles:{
      4:'noLabels',
      5:'noLabels',
      6:'noLabels',
      7:'style2',
      8:'style2',
      9:'style2',
      10:'style2',
      11:'style2',
      12:'style3',
      13:'style3',
      14:'style3',
      15:'style3',
      16:'style3',
      17:'style3',
      18:'style3',
      19:'style3',
      20:'style3'
    },
    zoomLimits:{
      maximum:16,
      minimum:4
    }   
  }

  //core functions
  //----
  //@param = NONE
  //@output = NONE  
  function mapInit(){
    $.logEvent('[$.mapInit]');
    
    var mapOptions = {
      zoom:0,
      center:new google.maps.LatLng(config.initialGeoCoordinates.latitude,config.initialGeoCoordinates.longitude),
      disableDefaultUI:true,
      panControl:false,
      zoomControl:false,
      mapTypeControl:false,
      scaleControl:false,
      streetViewControl:false,
      overviewMapControl:true,
      mapTypeControlOptions:{
        mapTypeIds:[google.maps.MapTypeId.ROADMAP,'noLabels']
      },
      mapTypeId:'noLabels'
    };
    
    config.mapObj = new google.maps.Map(document.getElementById('inner'),mapOptions);
    config.styledMapType = new google.maps.StyledMapType(NI.map.themeDefinitions['noLabels'],{map:config.mapObj,name:'noLabels'});
    config.mapObj.mapTypes.set('noLabels',config.styledMapType);          
    config.mapObj.minZoom = config.zoomLimits.minimum;
    config.mapObj.maxZoom = config.zoomLimits.maximum;

    //add style for tiling/overlays
    $('#map').addClass(config.tileOverlays.style);
    
    generateMapControls();
    
    //attach listening to re-define contained tiles when changing the bounds of the map
    google.maps.event.addListener(config.mapObj,'idle',boundsChanged);  
  }
  
  //these controls overwrite the default pan and zoom controls provided by Google, and have also been layered to appear over the top of any tile/grid overlays
  //@param = NONE
  //@output = NONE
  function generateMapControls(){
    $('#map #inner')
      .append(
        $('<ul />').attr('id','zoom-locate')
          .append(
            $('<li />').attr('id','zoom-in')
              .append(
                $('<a />').attr('href','#').html('Zoom in').bind('click',function(e){e.preventDefault();config.mapObj.setZoom(config.currentZoomLevel+1)})
              )
          )
          .append(
            $('<li />').attr('id','zoom-out')
              .append(
                $('<a />').attr('href','#').html('Zoom out').bind('click',function(e){e.preventDefault();config.mapObj.setZoom(config.currentZoomLevel-1)})
              )
          )
          .append(
            $('<li />').attr('id','locate-me')
              .append(
                $('<a />').attr('href','#').html('Locate me').bind('click',function(e){e.preventDefault();alert('TBC...')})
              )
          )
      )
  }
  
  //convert latitudinal and longitudinal co-ordinate sets to global pixels
  //----
  //@param = [obj.map]: map object
  //@param = [obj.latLng]: new google.maps.LatLng(latitude,longitude)
  //@param = [obj.zoomLevel]: integer
  //@output = new google.maps.Point(latitude,longitude)
  function latLngToPixel(obj){
    var normalizedPoint = config.mapObj.getProjection().fromLatLngToPoint(obj.latLng);
    var scale = Math.pow(2,obj.zoomLevel);
    var pixelCoordinate = new google.maps.Point(normalizedPoint.x * scale,normalizedPoint.y * scale);
    
    $.logEvent('[$.latLngToPixel]: ' + $.logJSONObj(obj) + ', pixelCoordinate: ' + pixelCoordinate);
    
    return pixelCoordinate; 
  }
  
  //taking the tile x and y co-ordinates for the top right and bottom left tile, work out all tiles inbetween
  //----
  //@param = [obj.bottomLeftTile]: new google.maps.Point(x,y)
  //@param = [obj.topRightTile]: new google.maps.Point(x,y)
  //@output = array
  function getTilesBetween(obj){
    $.logEvent('[$.getTilesBetween]: ' + $.logJSONObj(obj));
    
    config.columnsWide = (obj.topRightTile.x - obj.bottomLeftTile.x);
    config.rowsHigh = (obj.bottomLeftTile.y - obj.topRightTile.y);
              
    var tiles = [];
    
    for(var y1 = obj.topRightTile.y; y1 <= (obj.topRightTile.y + config.rowsHigh); y1++){
      for(x1 = obj.bottomLeftTile.x; x1 <= (obj.bottomLeftTile.x + config.columnsWide); x1++){
        tiles.push(new google.maps.Point(x1,y1));
      }
    }       
    return tiles;
  }
  
  //listener, which will re-request webservice(s) to get the appropriate data back, and subsequently plotted onto the map
  //@param = NONE
  //@output = NONE
  function boundsChanged(){
    config.currentZoomLevel = config.mapObj.getZoom();

    //hide any visible marker overlays
    $('#marker-overlay').remove();
    
    var styleType = config.zoomLevelStyles[config.currentZoomLevel];
    
    $.logEvent('[$.boundsChanged]: style required for zoom level (' + config.currentZoomLevel + ') = ' + NI.map.themeDefinitions[config.currentZoomLevel]);

    //update the style
    config.styledMapType = new google.maps.StyledMapType(NI.map.themeDefinitions[styleType],{map:config.mapObj,name:styleType});
    config.mapObj.mapTypes.set(styleType,config.styledMapType);
    config.mapObj.setMapTypeId(styleType);

    updateInformation({
      styleType:styleType,
      zoomLevel:config.currentZoomLevel
    });
    
    var boundsObj = config.mapObj.getBounds();
    config.boundsCoOrdinatesObj = {
      neLatitude:boundsObj.getNorthEast().lat(),
      neLongitude:boundsObj.getNorthEast().lng(),
      nwLatitude:boundsObj.getSouthWest().lat(),
      nwLongitude:boundsObj.getNorthEast().lng(),
      swLongitude:boundsObj.getSouthWest().lng(),
      swLatitude:boundsObj.getSouthWest().lat()
    }
    nwPixelCoordinate = latLngToPixel({
      map:config.mapObj,
      latLng:new google.maps.LatLng(config.boundsCoOrdinatesObj.nwLatitude,config.boundsCoOrdinatesObj.nwLongitude),
      zoomLevel:config.currentZoomLevel
    });
    var nePixelCoordinate = latLngToPixel({
      map:config.mapObj,
      latLng:new google.maps.LatLng(config.boundsCoOrdinatesObj.neLatitude,config.boundsCoOrdinatesObj.neLongitude),
      zoomLevel:config.currentZoomLevel
    });
    var neTileCoordinate = new google.maps.Point(
      Math.floor(nePixelCoordinate.x/config.tileSize),
      Math.floor(nePixelCoordinate.y/config.tileSize)
    );
    var swPixelCoordinate = latLngToPixel({
      map:config.mapObj,
      latLng:new google.maps.LatLng(config.boundsCoOrdinatesObj.swLatitude,config.boundsCoOrdinatesObj.swLongitude),
      zoomLevel:config.currentZoomLevel
    });
    var swTileCoordinate = new google.maps.Point(
      Math.floor(swPixelCoordinate.x/config.tileSize),
      Math.floor(swPixelCoordinate.y/config.tileSize)
    );          
    var tilesBetween = getTilesBetween({
      bottomLeftTile:swTileCoordinate,
      topRightTile:neTileCoordinate
    });
    
    $.logEvent('[$.boundsChanged]: neTileCoordinate=' + neTileCoordinate + ', swTileCoordinate=' + swTileCoordinate);
    $.logEvent('[$.boundsChanged]: total tiles between (' + tilesBetween.length + '), tiles between=' + tilesBetween);          
    $.logEvent('[$.boundsChanged]: current zoom level: ' + config.currentZoomLevel + ', topRight: (' + neTileCoordinate.x + ',' + neTileCoordinate.y + '), bottomLeft: (' + swTileCoordinate.x + ',' + swTileCoordinate.y + ')');

    //loop through the visible tiles to get the location data
    tileCoordinateToTileId(tilesBetween);
  }
  
  //retrieve new data, and also plot onto map
  //----
  //@param = [tilesBetween]: array
  //@output = NONE
  function tileCoordinateToTileId(tilesBetween){
    var activeRow = 0;
    var bottomTile = 0;
    var columnOffset = 1;
    var topTile = 0;
      
    //remove tile overlays, before re-generating them
    $('.map .tile-overlay').remove();
    
    $.each(tilesBetween,function(index,value){
      //apply tile overlay functionality
      columnOffset++;
      
      if(index%(config.columnsWide+1)==0){
        activeRow++;
        columnOffset = 1;
      };

      var tileLeftPixel = (0 - (nwPixelCoordinate.x%config.tileSize) + ((columnOffset-1)*config.tileSize));
      var tileTopPixel = (0 - (nwPixelCoordinate.y%config.tileSize) + ((activeRow-1)*config.tileSize));
      var tileId = (parseInt(tilesBetween[index].y) * (Math.pow(2,config.currentZoomLevel)) + parseInt(tilesBetween[index].x));
      
      addTileOverlay({
        coordinateX:tilesBetween[index].x,
        coordinateY:tilesBetween[index].y,
        left:tileLeftPixel,
        tileId:tileId,
        tilePosition:index+1,
        top:tileTopPixel,
        zoomLevel:config.currentZoomLevel
      });
      
      if(index == 0){topTile = tileId;}
      if(index == tilesBetween.length-1){bottomTile = tileId;}

      $.logEvent('[$.tileCoordinateToTileId]: Map columns: ' + (config.columnsWide+1) + ', tile y coordinate: ' + parseInt(tilesBetween[index].y) + ' tiles in map: ' + (Math.pow(2,config.currentZoomLevel)) + ', tile x coordinate: ' + parseInt(tilesBetween[index].x) + ', tile id(' + tilesBetween[index].x + ',' + tilesBetween[index].y + ') = ' + tileId);

      //if the map is rendering for the first time, load the tiles based on the tile bounds
      if(config.loaded){
        //only request tile data if has not previously been requested
        if($.inArray(config.currentZoomLevel + '/' + tileId,config.tilesPreviouslyLoaded) == -1){
          $.logEvent('[$.tileCoordinateToTile]: subsequent map load');
          
          $.ajax({
            dataType:'jsonp',
            success:function(data){
              $.each(data.serviceResponse.body.teams,function(index,value){
                //build markers for each location
                renderMarker({
                  latitude:this.lat,
                  longitude:this.lon,
                  teamId:this.id
                });
              });                   
              //config.markerClusterObj = new MarkerClusterer(config.map,config.markersObj);
            },
            url:config.webservices.teams + '?tile=' + tileId + '&zoom=' + config.currentZoomLevel + '&number=100&reduced=true'
          });
          
          //stored new tileId into array, so that this tile is never re-requested
          config.tilesPreviouslyLoaded.push(config.currentZoomLevel + '/' + tileId);
        }
      }
      else{             
        //stored new tileId into array, so that this tile is never re-requested
        config.tilesPreviouslyLoaded.push(config.currentZoomLevel + '/' + tileId);
      }
    });
    
    //set boolean to indicate that the map has had its bounds changed at least once, so that a different type of data request can be made
    if(!config.loaded){
      $.logEvent('[$.tileCoordinateToTile]: initial map load');
      
      //load map for the first time, using the bounds of the map
      $.ajax({
        dataType:'jsonp',
        success:function(data){
          $.each(data.serviceResponse.body.teams,function(index,value){
            //build markers for each location
            renderMarker({
              latitude:this.lat,
              longitude:this.lon,
              teamId:this.id
            });
          });               
          //config.markerClusterObj = new MarkerClusterer(config.map,config.markersObj);
        },
        url:config.webservices.teamsCombined + '?zoom=' + config.currentZoomLevel + '&number=250&topTile=' + topTile + '&bottomTile=' + bottomTile
      });
      
      config.loaded = true;
    }
  }
  
  //global function to add a marker to a map, along with associated click listener to show overlay data (per team)
  //----
  //@param = [obj.latitude]: integer
  //@param = [obj.longitude]: integer
  //@param = [obj.teamId]: integer
  //@output = NONE
  function renderMarker(obj){
    var marker = new google.maps.Marker({
      draggable:false,
      icon:config.settings.markerImage,
      id:obj.teamId,
      latitude:obj.latitude,
      longitude:obj.longitude,
      map:config.mapObj,
      position:new google.maps.LatLng(obj.latitude,obj.longitude)
    });
    
    config.markersObj.push(marker);
    
    //attach listening to produce an overlay for each clicked marker
    google.maps.event.addListener(marker,'click',function(){
      showOverlayInfo({
        id:obj.teamId
      })
    });
  }

  //update status information towards the top of the screen, indicating which zoom and style type are being used
  //----
  //@param = [obj.styleType]: string
  //@param = [obj.zoomLevel]: integer
  //@output = NONE
  function updateInformation(obj){
    $('#summary-information .inner')
      .empty()
      .append($('<p>').html('Current zoom: ' + obj.zoomLevel + ', style type: ' + obj.styleType))
  }

  //event handlers for links towards the top of the screen
  //----
  //@param = [obj.mode]: string
  //@output = NONE
  function controlsInit(obj){
    switch(obj.mode){
      case 'hide-tile-overlays':
        $('#map').removeClass('show-tile-overlays');              
        break;
      case 'show-tile-overlays':
        $('#map').addClass('show-tile-overlays');
        $('#marker-overlay').hide();
        break;
      case 'show-cropped-tiles':
        $('#map').removeClass('crop');
        break;
      case 'show-entire-tiles':
        $('#map').addClass('crop');
        break;
    }
  }

  //having found tile pixel coordinates, plot them as semi-transparent overlays onto the map canvas
  //----
  //@param = [obj.coordinateX]: integer
  //@param = [obj.coordinateY]: integer
  //@param = [obj.left]: integer
  //@param = [obj.tileId]: integer
  //@param = [obj.tilePosition]: integer
  //@param = [obj.top]: integer
  //@param = [obj.zoomLevel]: integer
  //@output = NONE
  function addTileOverlay(obj){
    $('#map')
      .append(
        $('<div />')
          .attr('class','tile-overlay ' + ((obj.tilePosition%2 == 0) ? 'even' : 'odd'))
          .css({
            left:obj.left,
            top:obj.top
          })
          .html(renderObjectAsUL(obj))
      )
  }
  
  //event handler called when a marker is clicked, which makes a webservice request, and renders the response data into an overlay
  //----
  //@param = [obj.id]: integer
  function showOverlayInfo(obj){
    var markerOverlayObj = $('#marker-overlay');
    
    $.ajax({
      dataType:'jsonp',
      success:function(data){
        var teamObj = data.serviceResponse.body.teams;
        var localLogoURL = teamObj.logoURL;
        
        var teamData = {
          buzz:teamObj.buzz,
          id:obj.id,
          isScouted:teamObj.isScouted,
          teamName:teamObj.name
        };

        if(markerOverlayObj.size() == 0){
          $('#map').append(
            $('<div />')
              .attr('id','marker-overlay')
              .append(
                $('<div />')
                  .attr('class','inner')
                  .append(
                    $('<h4 />').html(teamData.teamName)
                  )
                  .append(
                    $('<img />').attr({src:localLogoURL,alt:teamData.teamName})
                  )
                  .append(renderObjectAsUL(teamData))
              )
          )
        }
        else{
          $('H4',markerOverlayObj).html(teamData.teamName);
          $('IMG',markerOverlayObj).attr({src:localLogoURL,alt:teamData.teamName});
          $('UL',markerOverlayObj).remove();
          $('.inner',markerOverlayObj).append(renderObjectAsUL(teamData));
        }
      },
      url:config.webservices.teamsData + '/' + obj.id
    });
  }
  
  //process an object, returning it as an unordered list
  //@param = [obj]: object
  function renderObjectAsUL(obj){
    var output = '<ul>';          
    for(x in obj){
      output += '<li><strong>' + x + ' </strong>: ' + obj[x] + '</li>';
    };          
    output+= '</ul>';
    return output;
  }
  
  return{
    init:mapInit,
    controlsInit:controlsInit
  }
}());

$(document).ready(function(){
  $('#controls A').bind('click',function(e){
    e.preventDefault();
    NI.map.controlsInit({
      mode:$(this).attr('class')
    });
  }); 

  //initialize the map
  NI.map.init();
});

$.extend({
  //logging, based on whether it has been configured to log or not
  //----
  //@param = [event]: string
  //@output = NONE
  logEvent:function(event){
    if(globalObj.debug){
      console.log(event);
    }
  },
  
  //loop through an object
  //----
  //@param = [obj]: object
  //@output = NONE
  logJSONObj:function(obj){
    var debugJSON = '';
    for(x in obj){
      debugJSON += x + '=' + obj[x] + ', ';
    }
    return debugJSON.substr(0,debugJSON.length-2);
  }
});