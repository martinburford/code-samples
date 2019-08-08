/**
* Heatmap v1.0
* @module heatmap
*/

var heatmap = window.heatmap || {};
heatmap.configuration = {
  automation: {
    counter: 0,
    interval: null
  },
  basePath: '/assets/shared/scripts/',
  blur: {
    enabled: false,
    radius: 1
  },
  canvasAspectRatio: {
    horizontal: 0.667,
    vertical: 1.5
  },
  debugLogging: false,
  gradient: {
    /*
    // Original
    0.45: '#0000e1', // pure blue
    0.55: '#00ffff', // aqua blue
    0.65: '#00ff00', // bright green
    0.92: '#fffc00', // yellow
    1.0: '#ff0000' // red
    */
    
    // heatmapJS defaults
    0.35: '#0000e1',
    0.55: 'rgb(0,255,0)',
    0.92: '#fffc00',
    1: '#ff0000'
  },  
  heatmapLayers: {},
  heatmapScrollers: {},
  intensityMaximum: 5,
  opacities: {
    'default': 255,
    'fade': 50
  },  
  playerNames: {
    38411: 'Wojciech Szczęsny',
    17127: 'Bacary Sagna',
    54102: 'Per Mertesacker',
    18155: 'Thomas Vermaelen',
    37748: 'Laurent Koscielny',
    44346: 'Tomáš Rosický',
    133798: 'Mikel Arteta',
    51507: 'Jack Wilshere',
    19524: 'Mesut Özil',
    37605: 'Lukas Podolski',
    59936: 'Olivier Giroud',
    42427: 'Łukasz Fabiański',
    8597: 'Nacho Monreal',
    81880: 'Aaron Ramsey',
    60551: 'Brad Guzan',
    41823: 'Nathan Baker',
    39242: 'Joe Bennett',
    21095: 'Ron Vlaar',
    54861: 'Jores Okore',
    68983: 'Leandro Bacuna',
    52477: 'Karim El Ahmadi',
    58845: 'Chris Herd',
    83564: 'Kieran Richardson',
    41705: 'Andreas Weimann',
    27450: 'Gabriel Agbonlahor',
    74297: 'Shay Given',
    80979: 'Ciaran Clark',
    69505: 'Gary Gardner'
  },
  radius: {
    regular: 45,
    small: 22
  },
  tooltips: {
    backgroundColor: {
      'GOAL': '#56791f',
      'Miss': '#c00000'
    },
    backgroundOpacity: 1,
    borderColor: {
      'GOAL': '#293f08',
      'Miss': '#700000'
    },
    borderSize: 2,
    radiusSize: 10
  }
};

/**
* heatmap root class
* @class heatmap
* @namespace core
*/
heatmap.core = (function(){
  /**
  * Initialize heatmap functionality
  * @method init
  */
  function init(){
    $LAB
      .setOptions({
        AlwaysPreserveOrder: true,
        BasePath: heatmap.configuration.basePath
      }).script(function(){
        if(typeof(window.jQuery) === 'undefined'){
          return 'jquery.1.9.1-min.js';
        }
      }).wait(function(){
        // Attach any additional functionality to the base jQuery framework
        extendjQuery();
        
        $.logEvent('[heatmap.core.init]: jQuery framework loaded');
      }).script('jquery.mobile.custom.min.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery mobile framework loaded');
      }).script('jquery.actual.min.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery.actual plugin loaded');
      })
      .script('jquery-ui.custom.min.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery.ui plugin loaded');
      }).script('jquery.ui.touch-punch.min.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery touchpunch plugin loaded');
      }).script('iscroll-probe.js').wait(function(){
        $.logEvent('[heatmap.core.init]: iScroll (probe) plugin loaded');
      })
      .script('jquery.tipped.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery tooltip plugin loaded');
      }).script('jquery.sliderBar.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery sliderBar plugin loaded');
      })
      .script(function(){
        if(typeof(window.Pusher) === 'undefined'){
          return 'pusher.min.js';
        }
      }).wait(function(){
        $.logEvent('[heatmap.core.init]: Pusher framework loaded');
      })
      .script(function(){
        if(typeof(window.h337) === 'undefined'){
          return 'heatmap.min.js';
        }
      }).wait(function(){
        $.logEvent('[heatmap.core.init]: HeatmapJS framework loaded');
      }).script('jquery.heatmap.js').wait(function(){
        $.logEvent('[heatmap.core.init]: jquery.heatmap plugin loaded');
        
        // Initialize all heatmap associated event handlers
        eventHandlersInit();

        // Enable debug logging if provided as part of initialization
        if(heatmap.configuration.debugLogging || top.location.href.indexOf('debug') !== -1){
          heatmap.configuration.debugLogging = true;
          
          // DOM inject the debug logger
          heatmap.core.createDebugLogger();
        }
        
        // Tooltips only work when defined AFTER dom ready, hence the need for it here
        $(document).ready(function(){
          // Define a custom theme for the tooltip overlays
          extendTooltipSkins();

          // Initialize heatmaps
          $('.heatmap').heatmap('init');
        });
      });
  }

  /**
  * Define a custom theme for the tooltip overlays
  * @method extendTooltipSkins
  */
  function extendTooltipSkins(){
    $.logEvent('[heatmap.core.extendTooltipSkins]');

    $.extend(Tipped.Skins,{
      'heatmap-Miss': {
        background: {
          color: heatmap.configuration.tooltips.backgroundColor['Miss'],
          opacity: heatmap.configuration.tooltips.backgroundOpacity
        },
        border: {
          color: heatmap.configuration.tooltips.borderColor['Miss'],
          size: heatmap.configuration.tooltips.borderSize
        },
        radius: {
          size: heatmap.configuration.tooltips.radiusSize
        }
      }
    });
    
    $.extend(Tipped.Skins,{
      'heatmap-GOAL': {
        background: {
          color: heatmap.configuration.tooltips.backgroundColor['GOAL'],
          opacity: heatmap.configuration.tooltips.backgroundOpacity
        },
        border: {
          color: heatmap.configuration.tooltips.borderColor['GOAL'],
          size: heatmap.configuration.tooltips.borderSize
        },
        radius: {
          size: heatmap.configuration.tooltips.radiusSize
        }
      }
    });
  }
  
  /**
  * Initialize all event handlers associated event handlers
  * @method eventHandlersInit
  */
  function eventHandlersInit(){
    $.logEvent('[heatmap.core.eventHandlersInit]');
    
    $(document.body).on('click','.heatmap .toggle',function(e){
      e.preventDefault();
      
      $(this).toggleClass('expanded');
      
      var selfObj = $(e.target).parents('.heatmap');
      $('.flyout',selfObj).toggleClass('expanded');
      
      $('.direction',selfObj).toggleClass('hidden');
    });
    
    $(document.body).on('change','.heatmap INPUT[type=checkbox]',function(e){
      e.preventDefault();
      
      var checkboxObj = $(this);
      var selfObj = $(e.target).parents('.heatmap');
            
      switch(checkboxObj.parents('.flyout').size() > 0){
        case false:
          // Hide all tooltips
          Tipped.hideAll();
        
          var isSelected = checkboxObj.is(':checked');
          $('.slider-bar',selfObj)
            .IF(isSelected)
              .show()
            .ELSE()
              .hide()
            .ENDIF()
            
          break;
      }
    });

    $(document.body).on('click','.heatmap .tab-triggers LI A',function(e){
      e.preventDefault();

      var heatmapObj = $(this).parents('.heatmap:first');
      var selectedLinkObj = $(this).parent();
      var selectedIndex = $('.tab-triggers:eq(0) LI',heatmapObj).index(selectedLinkObj);
      var activeTabContentId = $('.tab-content:eq(' + selectedIndex + ')',heatmapObj).attr('id');
      
      // Update the tab triggers links to reflect the new selection
      selectedLinkObj
        .attr('class','active')
        .siblings()
          .removeClass('active');
          
      // Show the scroller for the relevant tab content block
      $('.tab-content:eq(' + selectedIndex + ')',heatmapObj)
        .show()
        .siblings()
          .hide();
  
      // Refresh the IScroll and custom scrollbar within the selected tab, every time a new tab is selected
      resetIScrollAndScrollbar({
        activeTabContentId: activeTabContentId
      });
    });
    
    $(document.body).on('tap','.heatmap .flyout .tab-content LI',function(e){
      var listObj = $(this);
      var selfObj = listObj.parents('.heatmap');
      
      // Toggle the action before performing the event attached to that action (add or remove data)
      listObj.toggleClass('active');
      
      var isActive = listObj.hasClass('active');
      var filterName = listObj.attr('data-value');
      
      switch(isActive){
        case true: 
          // Add the dataset for the filter being turned on
          selfObj.heatmap('addSingleFilterDataset',{
            filterName: filterName,
            redefineMaximumValue: true,
            refreshCanvas: true
          });
          
          break;
        case false:
          // Add the dataset for the filter being turned on
          selfObj.heatmap('removeSingleFilterDataset',{
            filterName: filterName,
            refreshCanvas: true
          });
          
          break;
      }
    });
    
    // Control handlers for refreshing previously initialized heatmaps
    $('.column').on('click','.controls INPUT',function(e){
      e.preventDefault();
            
      var eventObj = $(e.target);
      var selfObj = eventObj.parents('.column').find('.heatmap');
      var toggleFlyout = eventObj.hasAttr('data-toggle-flyout') ? true : false;
      var showFlyout = false;
      
      switch(eventObj.hasAttr('data-automate')){
        case true: 
          heatmap.configuration.automation.interval = setInterval(function(){
            // Simulate an auto-updating heatmap
            selfObj.heatmap('automateUpdate');
          },1);
          
          eventObj.attr('disabled','disabled');
          
          break;
        case false:
          // Generate a new random set of data (3 sets of data) for a heatmap refresh
          var filtersToUse = generateRandomDataset({
            filters: eventObj.attr('data-available-filters').split(',')
          }).join(',');
          
          // Work out whether the heatmap should be refreshed with or without the flyout option specified
          if(toggleFlyout){
            if(selfObj.hasAttr('data-flyout')){
              showFlyout = false;
            }
            else{
              showFlyout = true;
            }
          }
          else{
            if(selfObj.hasAttr('data-flyout')){
              showFlyout = true;
            }
          }
          
          // Update the code snippet, indicating what's being passed to the plugin for the refresh plugin call
          selfObj
            .prev('PRE')
              .empty()
              .text('$(\'.heatmap:eq(' + (selfObj.attr('data-heatmap-id').replace('heatmap-','')-1) + ')\').heatmap(\'refresh\',{\n    selectedFilters: \'' + filtersToUse + '\',\n    showFlyout: ' + showFlyout + '\n})')
              .prepend(
                $('<span />')
                  .attr('class','comment')
                  .text('// Reload heatmap')
              );
              
          // Refresh heatmap
          selfObj
            .empty()
            .heatmap('refresh',{
              selectedFilters: filtersToUse,
              showFlyout: showFlyout
            });
          break;
      }
    });
  }
  
  /**
  * Refresh the IScroll and custom scrollbar within the selected tab, every time a new tab is selected
  * @method resetIScrollAndScrollbar
  * @param {STRING} activeTabContentId The id of the tab being shown
  */
  function resetIScrollAndScrollbar(obj){
    $.logEvent('[heatmap.core.resetIScrollAndScrollbar]: ' + $.logJSONObj(obj));
    
    // Refresh the IScroll and custom scrollbar within the selected tab, every time a new tab is selected
    heatmap.configuration.heatmapScrollers[obj.activeTabContentId].refresh();
    heatmap.configuration.heatmapScrollers[obj.activeTabContentId].scrollTo(0,0);

    var max = $('#' + obj.activeTabContentId + ' .vertical-scrollbar').slider('option','max');

    $('#' + obj.activeTabContentId + ' .vertical-scrollbar').slider({
      value: max-Math.abs(this.y>>0)
    });
  }
  
  /**
  * Generate a new random set of data (2 sets of data) for a heatmap refresh
  * @method generateRandomDataset
  * @param {ARRAY} filters The available list of filters to randomize between
  * @param {ARRAY} newFilters The new array list defining the new random filters to use for the refreshed heatmap
  */
  function generateRandomDataset(obj){
    var maximumValue = obj.filters.length-1;    
    var newFilters = [];
    
    while(newFilters.length < 2){
      var randomNumber = Math.ceil(Math.random() * maximumValue);
      var found = false;

      for(var i=0; i<newFilters.length; i++){
        if(newFilters[i] === randomNumber){
          found = true;
          break;
        }
      }
      
      if(!found){
        newFilters[newFilters.length] = obj.filters[randomNumber];
      }
    }   
    
    return newFilters;
  }
    
  /**
  * DOM inject the debug logger
  * @method createDebugLogger
  */
  function createDebugLogger(){
    $('#wrapper')     
      .prepend(
        $('<div />')
          .append(
            $('<h4 />')
              .text('Output log event')
              .append(
                $('<a />')
                  .attr('href','#')
                  .on('click',function(e){
                    e.preventDefault();
                    
                    $('#logger .inner')
                      .empty()
                  })
                  .text('(clear)')
              )
              .append(
                $('<a />')
                  .attr('href','#')
                  .on('click',function(e){
                    e.preventDefault();
                    
                    $('#logger .inner')
                      .css('height','100px')
                  })
                  .text('(regular size)')
              )
              .append(
                $('<a />')
                  .attr('href','#')
                  .on('click',function(e){
                    e.preventDefault();
                    
                    $('#logger .inner')
                      .css('height','400px')
                  })
                  .text('(small expand)')
              )
          )
          .append(
            $('<div />')
              .attr('class','inner')
          )
          .attr('id','logger')
      )
      .addClass('debug');
      
    $.logEvent('[heatmap.core.createDebugLogger]');
  } 
  
  /**
  * Convert an input string to remove any dashes with spaces, and upperCase the leading character
  * @method sentenceCapitalize
  * @param {STRING} input The string to convert
  * @return {STRING} The converted string
  */
  function sentenceCapitalize(obj){
    $.logEvent('[heatmap.core.sentenceCapitalize]: ' + $.logJSONObj(obj));
    
    var output = obj.input.toLowerCase().replace(/-/g,' ');
    output = output.charAt(0).toUpperCase() + output.slice(1);
    
    return output;
  }

  /**
  * Lowercase a string and replace all spaces with dashes
  * @method lowerCaseWithDashes
  * @param {STRING} input The string to convert
  * @return {STRING} The converted string
  */
  function lowerCaseWithDashes(obj){
    return obj.input.toLowerCase().replace(/ /g,'-');
  }
  
  /**
  * Attach any additional functionality to the base jQuery framework
  * @method extendjQuery
  */
  function extendjQuery(){
    $(window).on({
      resize: function(){
        var fluidWidth = $('#fluid').width();
        
        $('#fluid .heatmap').each(function(){
          $('CANVAS',this)
            .css('width',fluidWidth);
            
          $('.map',this)
            .css({
              height: fluidWidth * heatmap.configuration.canvasAspectRatio,
              width: fluidWidth
            });
        });
      }
    });

    // jQuery extensions
    $.extend({
      /**
      * Logging, based on whether it has been configured to log or not
      * @method logEvent
      * @param {STRING} Event The event to log
      */
      logEvent: function(event){
        if(heatmap.configuration.debugLogging){
          $('#logger .inner')
            .prepend(
              $('<p />')
                .html(($('#logger .inner P').size()+1) + '. ' + event)
            )
        }
      },
      
      /**
      * Loop through an object
      * @method logJSONObj
      * @param {OBJECT} obj A variable JSON object to output to the console
      */
      logJSONObj: function(obj){
        var debugJSON = '';
        var i;
        
        for(i in obj){
          if(obj.hasOwnProperty(i)){
            debugJSON += i + '=' + obj[i] + ', '; 
          }
        }
        return debugJSON.length > 0 ? debugJSON.substr(0,debugJSON.length-2) : '[empty parameter object]';
      },

      /**
      * Check to see whether a JSON property exists within an object
      * @param {OBJECT} jsonDataObj The data object to check against
      * @param {STRING} propertyName The propertyName to check for
      * @return {BOOLEAN} Whether the property exists or not
      */
      hasJSONProperty: function(obj){
        var dataObj = obj.jsonDataObj;
        var hasProperty = false;
        
        if(dataObj.hasOwnProperty(obj.propertyName)){
          if(dataObj[obj.propertyName] !== null && dataObj[obj.propertyName] !== ''){
            hasProperty = true;
          }
        }
        
        return hasProperty;
      },
      
      generateGuid: function() {
        var date = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(callback){
          var random = (date + Math.random()*16)%16 | 0;
          date = Math.floor(date/16);
          return (callback=='x' ? random : (random&0x7|0x8)).toString(16);
        });
        return uuid;
      }
    });

    $.fn.extend({
      IF: function(expr){
        return this.pushStack((this._ELSE = !($.isFunction(expr) ? expr.apply(this) : expr))? [] : this, 'IF', expr);
      },
      
      ELSE: function(expr){
        var $set = this.end();
        return $set.pushStack(((!$set._ELSE) || ($set._ELSE = ((typeof(expr) !== 'undefined') && (!($.isFunction(expr) ? expr.apply($set) : expr)))))? [] : $set, 'ELSE', expr);
      },

      ENDIF: function(){
        return this.end();
      },
      
      hasAttr: function(name){  
        return this.attr(name) !== undefined;
      },
      
      within: function(selector){
        return this.filter(function(){
          return $(this).closest(selector).length;
        });
      }
    });
  }
  
  return {
    createDebugLogger: createDebugLogger,
    eventHandlersInit: eventHandlersInit,
    extendjQuery: extendjQuery,
    init: init,
    lowerCaseWithDashes: lowerCaseWithDashes,
    sentenceCapitalize: sentenceCapitalize
  }
}());