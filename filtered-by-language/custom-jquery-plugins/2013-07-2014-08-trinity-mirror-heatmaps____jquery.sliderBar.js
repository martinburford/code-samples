(function(jQuery){  
  var methods = {
    /**
    * Build the internal scrollbar for the default filters
    * @method filtersSlider
    */
    filtersSlider: function(){
      $.logEvent('[$.fn.sliderBar (filtersSlider)]');
      
      var selfObj = $(this);
      var flyoutObj = $('.flyout',selfObj);
      var tabContentObj;
      var sliderDisabled;
      
      // Add a custom scrollbar to each tab-content DOM element
      $('.tab-content',flyoutObj).each(function(){
        tabContentObj = $(this);
        var tabContentId = tabContentObj.attr('id');
        
        tabContentObj
          .append(
            $('<div />')
              .attr('class','vertical-scrollbar')
              .css('height',parseInt(tabContentObj.attr('data-height'))-60)
          );
          
        var differential = $('.iscroll-wrapper',tabContentObj).actual('outerHeight') - parseInt(tabContentObj.attr('data-height'));

        sliderDisabled = differential < 0 ? true : false;
        
        // Add the custom scrollbar
        $('.vertical-scrollbar',tabContentObj).slider({
          disabled: sliderDisabled,
          max: differential,
          min: 0,
          orientation: 'vertical',
          slide: function(event,ui){
            event.stopPropagation();
            
            var scrolled = differential-ui.value;
            
            // Scroll the iScroll DOM element, synchronized pixel-by-pixel with the custom scrollbar offset
            heatmap.configuration.heatmapScrollers[tabContentId].scrollTo(0,Math.abs(scrolled)*-1);
          },
          start: function(event,ui){
            event.stopPropagation();
          },
          value: differential
        });
      });
    },
  
    /**
    * Build the Goal Mouth slider dynamically
    * @method goalMouthSlider
    */
    goalMouthSlider: function(obj){
      $.logEvent('[$.fn.sliderBar (goalMouthSlider)]');

      return this.each(function(){
        var selfObj = $(this);
        var heatmapId = selfObj.attr('data-heatmap-id');
        
        // Create the DOM container for the sliderbar
        var sliderBarObj = $('<div />')
          .append(
            $('<div />')
              .attr('class','bar')
          )
          .attr('class','slider-bar')
        
        $('>.inner',selfObj).append(sliderBarObj);
          
        // Create the scale of numbers above each slider instance
        selfObj.sliderBar('createScale');
        
        // Build checkbox to toggle visibiity of goal mouth sliderbar
        $('<div />')
          .append(
            $('<label />')
              .attr('for','toggle-sidebar-' + selfObj.attr('data-heatmap-id'))
              .text('Sliderbar')
          )
          .append(
            $('<input />')
              .attr({
                'id': 'toggle-sidebar-' + selfObj.attr('data-heatmap-id'),
                'type': 'checkbox',
                'checked': false
              })
          )
          .attr('class','toggle-sliderbar')
          .prependTo($('.map',selfObj));
          
        // Activate the sliderbar
        $('.bar',selfObj).slider({
          min: 1,
          max: selfObj.data('selectedFilters').length+1,
          start: function(event,ui){},
          slide: function(event,ui){  
            var heatmapId = selfObj.attr('data-heatmap-id');
            var selectedIndex = ui.value;
            var selectedObj = $('#' + heatmapId + '-scale-' + selectedIndex);
            var playerId = selectedObj.attr('data-player-id');
            var eventType = selectedObj.attr('data-event-type');
            var eventTime = selectedObj.attr('data-event-time');

            // Hide all tooltips prior to creating/showing a new one
            Tipped.hideAll();
                        
            if(eventType !== 'all'){
              var relatedPlayerDomElement = $('#' + playerId + '-' + eventType + '-' + eventTime)[0];
              
              // Create/show (if already created) a new tooltip
              Tipped.create('#' + heatmapId + '-scale-' + selectedIndex, relatedPlayerDomElement,{
                hideOn: 'click',
                hook: {
                  target: 'bottommiddle'
                },
                maxWidth: 175,
                offset: {
                  y: 40
                },
                shadow: false,
                showOn: false,
                skin: 'heatmap-' + eventType,
                stem: {
                  height: 6,
                  width: 10
                }
              }).show();  
            }

            // Create a custom dataset for the heatmap, upto and including the selected index of the sliderbar control
            selfObj.sliderBar('createCustomDataset',{
              index: ui.value
            });
          },
          step: 1,
          value: 1
        });
      });
    },
    
    /**
    * Create a custom dataset for the heatmap, upto and including the selected index of the sliderbar control
    * @method createCustomDataset
    * @param {INTEGER} index The index of the selected step within the sliderbar control
    */
    createCustomDataset: function(obj){
      $.logEvent('[$.fn.sliderBar (createCustomDataset)]');
            
      var selfObj = $(this);
      var selectedFilters = selfObj.data('selectedFilters');
      var indexToShowUpto = obj.index === 1 ? selectedFilters.length-1 : obj.index-2;
      var storedDataObj = selfObj.data('jsonData');
      var redefineMaximumValue = false;
        
      // Reset the stored data, since it is being entirely refreshed from scratch
      selfObj.data('dataPoints',{
        data: [],
        max: heatmap.configuration.intensityMaximum
      });
      
      for(var i=0; i<=indexToShowUpto; i++){
        if(i === indexToShowUpto){
          redefineMaximumValue = true;
        }
        
        selfObj.heatmap('addSingleFilterDataset',{
          filterName: selectedFilters[i],
          redefineMaximumValue: redefineMaximumValue
        });
      }
    },
    
    /** 
    * Create the scale of numbers above each slider instance
    * @method createScale
    */
    createScale: function(){
      $.logEvent('[$.fn.sliderBar (createScale)]');
      
      var selfObj = $(this);
      var heatmapId = selfObj.attr('data-heatmap-id');
      var events = selfObj.data('selectedFilters');
      
      var scaleObj = $('<ul />')
        .append(
          $('<li />')
            .css({
              left: 0,
              top: 0
            })
            .append(
              $('<a />')
                .attr({
                  'data-event-type': 'all',
                  id: heatmapId + '-scale-1',
                  'data-theme': 'all'
                })
                .text('All')
            )
        )
        .attr('class','scale');
      
      var listObj;
      var eventType;
      
      for(var i=0; i<=events.length-1; i++){
        eventType = events[i].split('-')[1];
        
        listObj = $('<li />')             
          .css({
            left: ((100/events.length)*(i+1)) + '%',
            top: 0
          })
          .append(
            $('<a />')
              .attr({
                'data-player-id': events[i].split('-')[0],
                'data-event-type': eventType,
                'data-event-time': events[i].split('-')[2],
                id: heatmapId + '-scale-' + (i+2)
              })
              .text(events[i].split('-')[2].substr(0,2) + '"')
          )
        
        scaleObj.append(listObj);
      }
      
      $('.slider-bar',selfObj).prepend(scaleObj);
    }
  };
  
  // Initialize plugin
  $.fn.sliderBar = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));