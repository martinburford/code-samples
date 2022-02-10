/**
* Account Opening v1.0
* @module ao
*/

var ao = window.ao || {};

ao.map = (function(){ 
  /**
  * Initialize all maps
  * @method init
  */
  function init(){
    // Add configuration settings for all maps to the core configuration
    $.extend(ao.configuration,{
      map: {
        // ...
      }
    });

    $.logEvent('[ao.map.init]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.map));
    
    // Initialize all event delegation associated to maps
    eventsInit();

    var mapContainerObj;
    var mapObj;
    var suppliedPostcodeObj;
    var markerPoints;
    var mapContainerId;
    var latLngObj;
    var branchMarker;
    var boundsObj;
    var markerLetter;
    var resultsObj;

    $('.map').each(function(index){     
      mapContainerObj = $(this);
      mapContainerId = $('.interactive',mapContainerObj).attr('id');
      suppliedPostcodeObj =  {
        latitude: $('.interactive',mapContainerObj).attr('data-supplied-latitude'),
        longitude: $('.interactive',mapContainerObj).attr('data-supplied-longitude')
      }
      markerPoints = [];
      resultsObj = $('.results',mapContainerObj);
            
      $('LI',resultsObj).each(function(index){
        markerPoints.push({
          latitude: $(this).attr('data-branch-latitude'),
          longitude: $(this).attr('data-branch-longitude'),
        });
      });
      
      // Create Google Map, to replace static image
      mapObj = new google.maps.Map(document.getElementById(mapContainerId),{
        center: new google.maps.LatLng(suppliedPostcodeObj.latitude,suppliedPostcodeObj.longitude),
        zoom: 8
      });
      
      // Set the map bounds
      boundsObj = new google.maps.LatLngBounds();
      
      // Add the marker points to the interactive map, before setting the bounds for auto-zooming
      $.each(markerPoints,function(index,coordinatesObj){
        latLngObj = new google.maps.LatLng(coordinatesObj.latitude,coordinatesObj.longitude);
        markerLetter = String.fromCharCode('A'.charCodeAt(0) + index);
        
        branchMarker = new google.maps.Marker({
          icon: '/assets/images/map-markers/' + markerLetter + '.png',
          map: mapObj,
          position: latLngObj
        });

        // Update the map bounds
        boundsObj.extend(latLngObj);
        mapObj.fitBounds(boundsObj);
      });
      
      // Load the JSON for all branches for the current map instance
      loadBranchData({
        mapContainerObj: mapContainerObj
      });
    });
  }
  
  /**
  * Initialize delegated events for all tab groups
  * @method eventsInit
  */
  function eventsInit(){
    $.logEvent('[ao.map.eventsInit]');
    
    var branchObj;
    var branchId;
    var mapContainerObj;
    var branchInformation;
    
    // Initialize delegated events for all tab groups
    $('.map .results').on('click','LI A',function(e){
      e.preventDefault();
      
      branchTriggerObj = $(this).parent();
      branchId = parseInt(branchTriggerObj.attr('data-branch-id'));
      mapContainerObj = $(this).parents('.map');
            
      // Toggle data for a specific branch visible
      toggleBranchData({
        branchId: branchId,
        mapContainerObj: mapContainerObj
      });
      
      // Update the dropdown (responsive filter) selectedIndex
      var activeIndex = $('.results LI',mapContainerObj).index(branchTriggerObj);
      $('.results SELECT',mapContainerObj).prop('selectedIndex',activeIndex);
    });
    
    $('.map .results').on('change','SELECT',function(e){
      branchId = parseInt($('OPTION:selected',this).attr('data-branch-id'));
      mapContainerObj = $(this).parents('.map');
      
      // Toggle data for a specific branch visible
      toggleBranchData({
        branchId: branchId,
        mapContainerObj: mapContainerObj
      });
      
      // Update the results <li> active state
      var activeIndex = $('OPTION:selected',this).index();
      $('.results LI:eq(' + activeIndex + ')',mapContainerObj).attr('class','active').siblings().removeClass('active');
    });
  }
  
  /**
  * Toggle data for a specific branch visible
  * @method toggleBranchData
  * @param {OBJECT} branchId The id of the branch to show information for
  * @param {OBJECT} mapContainerObj The container DOM element for the interactive map
  */
  function toggleBranchData(obj){
    $.logEvent('[ao.map.toggleBranchData]: ' + $.logJSONObj(obj));
    
    var branchInformation = obj.mapContainerObj.data('branchData')[obj.branchId];
    var branchTriggerObj = $('.results LI[data-branch-id=' + obj.branchId + ']',obj.mapContainerObj);
        
    // Reflect the event via active CSS override classes
    branchTriggerObj.attr('class','active')
      .siblings()
        .removeClass('active');
            
    // Update 'Branch Information' tab
    $('.branch-meta',obj.mapContainerObj)
      .find('ADDRESS')
        .html(branchInformation.addressLine1 + '<br />' + branchInformation.addressLine2 + '<br />' + branchInformation.county + '<br />' + branchInformation.country)
        .prepend(
          $('<strong />')
            .text(branchInformation.name)
        )
      .end()
      .find('P')
        .text(branchInformation.phoneNumber);
        
    // Update the Opening hours
    $('.opening-hours',obj.mapContainerObj)
      .find('LI:eq(0) SPAN').text(branchInformation.openingHours.monday).end()
      .find('LI:eq(1) SPAN').text(branchInformation.openingHours.tuesday).end()
      .find('LI:eq(2) SPAN').text(branchInformation.openingHours.wednesday).end()
      .find('LI:eq(3) SPAN').text(branchInformation.openingHours.thursday).end()
      .find('LI:eq(4) SPAN').text(branchInformation.openingHours.friday).end()
      .find('LI:eq(5) SPAN').text(branchInformation.openingHours.saturday).end()
      .find('LI:eq(6) SPAN').text(branchInformation.openingHours.sunday);
      
    // Update the 'Branch Facilities' tab
    $.each(branchInformation.facilities,function(index,value){
      $('.branch-facilities LI:eq(' + index + ')',obj.mapContainerObj).html(value);
    });
  
    $.logEvent('[ao.map.toggleBranchData]: branch id=' + obj.branchId + ' selected');
  }
  
  /**
  * Load the JSON for all branches for the current map instance
  * @method loadBranchData
  * @param {OBJECT} mapContainerObj The container DOM element for the interactive map
  */
  function loadBranchData(obj){
    $.logEvent('[ao.map.loadBranchData]: ' + $.logJSONObj(obj));
    
    // Load the JSON for the selected map (including all associated matching branches), to update the tab contents (Branch Information/Branch Facilities)
    $.ajax({
      dataType: 'json',
      success: function(branchDataObj){
        obj.mapContainerObj.data('branchData',branchDataObj.branches);
      },
      type: 'get',
      url: '/assets/json/maps/branches.json'
    });
  }
  
  return {
    init: init
  }
}());