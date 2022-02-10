/**
* dataVisualization
* @module dataVisualization
*/
var dataVisualization = window.dataVisualization || {};
dataVisualization.configuration = {
  data: null,
  debugLogging: false,
  device: null,
  jsonFileName: 'worst-case-scenario',
  loadStatusEnabled: true,
  siteInitialized: false,
  theme: 'theme-default',
  timings: {
    hideOverlay: {
      desktop: 250, // default = 250
      mobile: 0
    },
    pluginStartDuration: {
      desktop: 0.5, // default = 0.5 (seconds)
      mobile: 0 // (seconds)
    }
  },
  visualizationWrapperId: 'visualization'
};

dataVisualization.core = (function(){   
  /**
  * Initialize dataVisualization
  * @method init
  * @param {STRING} jsonFileName An optional value which will specify the filename of the JSON file to load
  */
  function init(obj){
    dataVisualization.configuration.siteInitialized = true;
    
    // Dynamically switch on debug logging, if specified in the URL
    if(location.href.indexOf('?debug') != -1) {
      dataVisualization.configuration.debugLogging = true;
    }
    
    if(dataVisualization.configuration.debugLogging){
      $('BODY').addClass('debug');
      
      // DOM inject the debug logger
      createDebugLogger();
    }
    
    // Demo mode requires a few CSS styles to be turned off
    if(location.href.indexOf('?demo') != -1) {
      $('BODY').addClass('demo');
    }
    
    // Allow the pathname for the JSON to be loaded to be supplied by a parameter in the URL
    if(obj.jsonFileName != undefined){
      dataVisualization.configuration.jsonFileName = obj.jsonFileName
    }
        
    $.logEvent('[dataVisualization.core.init]: ' + $.logJSONObj(obj));
    
    // Initialize the processes, based on the content of the first module
    dataVisualization.dispatcher.init();
        
    // Create load status, if switched on
    if(dataVisualization.configuration.loadStatusEnabled){
      loadStatusInit();
    }
  }
  
  /**
  * Retrieve the JSON and build the necessary DOM elements
  * @method build
  */
  function buildDOM(){
    $.logEvent('[dataVisualization.core.buildDOM]');
    
    var visualizationWrapperObj = $('<div />')
      .attr({
        'class': 'data-visualization ' + dataVisualization.configuration.device,
        id: dataVisualization.configuration.visualizationWrapperId
      });
      
    var rowClassname;
    var rowObj;
    var columnObj;
    
    // Prepend the wrapper for the visualization functionality to #content for now
    // TODO: this will eventually be document.write to the space in the DOM where the JS resides inline
    $('#content').prepend(visualizationWrapperObj);
        
    // Create all necessary event handlers (now that the wrapper for the visualization functionality has been created, and attached to the DOM)
    eventHandlersInit();
                        
    $.each(dataVisualization.configuration.data,function(nodeName,value){ 
      if(nodeName == 'meta-data'){
        // Add the overriding CSS classname from the JSON
        visualizationWrapperObj.addClass(this.classname);
        
        dataVisualization.configuration.theme = this.classname;
                
        if(this['global-key']){
          var globalKeyObj = this;
          
          visualizationWrapperObj
            .append(
              $('<div />')
                .append(
                  $('<h4 />')
                    .html('Key')
                )
                .append(
                  $('<ul />')                 
                    .html(function(){
                      var listElements = '';
                      
                      $.each(globalKeyObj.labels,function(index){
                        listElements += '<li style="color:' + globalKeyObj.colors[index] + '">' + globalKeyObj.labels[index] + '</li>';
                      })
                      
                      return listElements;
                    })
                )
                .attr('id','global-key')
            )
        }
      }
      else {
        rowClassname = 'data-row';
        rowClassname += ' ' + this['meta-data']['row-style'];
        
        // Add the first exception
        if(nodeName == 'row-1') {
          rowClassname += ' first';
        }
        
        // Add any themes to the row upon DOM creation/injection
        if(this['meta-data'].theme){
          rowClassname += ' theme ' + this['meta-data'].theme;
        }
      
        rowObj = $('<div />')
          .attr({
            'class': rowClassname
          })
        
        // Add the row to the visualization wrapper
        visualizationWrapperObj.append(rowObj);
                
        // Add the row heading to the component (provided it exists in the JSON)
        if(this['meta-data'].heading){  
          var headingClass = 'heading';
          
          if(this['meta-data'].heading['render-inside']){
            headingClass += ' inside';
          }
          
          $('<h2 />')
            .attr('class',headingClass)
            .html(this['meta-data'].heading.text)
            .insertBefore(rowObj)
            .IF(this['meta-data'].heading['render-inside'])
              .prependTo(rowObj)
            .ENDIF()
        }
        else{
          rowObj.addClass('compressed');
        }
      
        $.each(this['columns'],function(indexInner,valueInner){
          // Bar graphs have an override value for small, medium or regular (largest) heights
          var additionalClassname = '';
          if(this.size){
            additionalClassname += (this.size != 'regular' ? ' ' + this.size : '');
          }
          
          // Bar graphs and scatter graphs have an additional property (svg-palette), to send light or dark values to the plugins, retrieve (and append) where necessary
          if(this['meta-data']['svg-palette']){
            additionalClassname += ' svg-palette-' + this['meta-data']['svg-palette'];
          }
                  
          columnObj = $('<div />')
            .append(
              $('<div />')
                .append(
                  $('<h2 />')
                    .html($.capitalize({stringText: this.id}))
                )
                .append(
                  $('<a />')
                    .attr({
                      'class': 'reload disabled',
                      href: '#'
                    })
                    .html('Re-load')
                )
                .append(
                  $('<div />')
                    .append(
                      $('<h4 />')
                        .html('Loading...')
                    )
                    .attr('class','overlay')
                )
                .append(
                  $('<div />')
                    .append(
                      $('<div />')
                        .attr({
                          'class': this['meta-data']['column-type'] + ' interactive' + additionalClassname,
                          id: this.id
                        })
                        .data('interactive',this) // Add the retrieved JSON data to the interactive DOM element for later use when initializing the interactive functionality
                    )
                    .attr('class','inner')
                )
                .attr('class','module')
            )
            .attr('class',this['meta-data']['grid-column-type'])
                
          // Handle specific data attributes for Fusion maps
          if(this['meta-data']['column-type'] == 'fusion-map'){
            $('.interactive',columnObj)
              .append(
                $('<img />')
                  .attr({
                    'class': 'mobile',
                    src: this['mobile-image']
                  })
              )
              .attr({
                "data-bucket-colours": this['meta-data']['bucket-colours'],
                "data-bucket-ranges": this['meta-data']['bucket-ranges'],
                "data-latitude-origin": this['meta-data']['latitude-origin'],
                "data-longitude-origin": this['meta-data']['longitude-origin'],
                "data-zoom-level": this['meta-data']['zoom-level']
              });
          }
          
          // Handle specific data attributes for Bar charts
          if(this['meta-data']['column-type'] == 'bar-graph'){
            $('.interactive',columnObj)
              .attr({
                "data-orientation": this.orientation
              });
          }
                
          // Add the column to the current row
          rowObj.append(columnObj);
        });
      }
    });
    
    // The data is now attached to each unique DOM element, so the global storage can now be removed
    dataVisualization.configuration.data = null;

    // Dynamically create the load sequence based on the results of the DOM injection
    createLoadSequence();
  }
  
  /** 
  * Dynamically create the load sequence based on the results of the DOM injection
  * @method createLoadSequence
  */
  function createLoadSequence(){    
    // Once all of the DOM injection is complete, create the required load sequence
    var loadSequence = [];
    
    $('.interactive').each(function(index){     
      loadSequence.push({id: $(this).attr('id')});
    });
    
    // Set the global load sequence to match the DOM injected sequence
    dataVisualization.configuration.loadSequence = loadSequence;
    
    $.logEvent('[dataVisualization.core.createLoadSequence]: loadSequence=' + dataVisualization.configuration.loadSequence);

    // Starting with the first interactive element, initialize the load sequence
    initializeLoadSequence();
  }
  
  /**
  * Starting with the first interactive element, initialize the load sequence
  * @method initializeLoadSequence
  */
  function initializeLoadSequence(){
    $.logEvent('[dataVisualization.core.initializeLoadSequence]');
    
    // Initialize the first component within the configuration
    var toInitializeObj = dataVisualization.configuration.loadSequence[0];
    
    // Initialize the required functionality for the desired module
    dataVisualization.dispatcher.moduleInitialize(toInitializeObj);
  }
  
  /**
  * Create load status
  * @method loadStatusInit
  */
  function loadStatusInit(){
    $.logEvent('[dataVisualization.core.loadStatusInit]');
    
    var loadStatusObj = $('<ul />').attr('id','load-status');
    $('BODY').prepend(loadStatusObj);
  }
  
  /**
  * Update the load status
  * @method updateLoadStatus
  * @param {OBJECT} The DOM object which has just completed being injected
  */
  function updateLoadStatus(obj){
    $.logEvent('[dataVisualization.core.updateLoadStatus]: ' + obj);
        
    // Update the load status
    if(dataVisualization.configuration.loadStatusEnabled){
      $('#load-status')
        .append(
          $('<li />')
            .attr({
              'class': 'complete',
              'data-id': obj.attr('id')
            })
            .html('#' + obj.attr('id'))
            .append(
              $('<strong />')
                .html('.' + obj.attr('class').split(' ')[0])
            )
        )
    } 
  }
  
  /**
  * Refresh all interactive elements, to ensure they render ok after a resize has occurred
  @method refreshInteractiveElements
  */  
  function refreshInteractiveElements(){
    $.logEvent('[dataVisualization.core.refreshInteractiveElements]');
    
    var interactiveTypeObj;
    
    $.each(dataVisualization.configuration.loadSequence,function(){
      interactiveTypeObj = this.id.split('-');
            
      if(typeof(window[this.id]) == 'object'){      
        // window[this.id].validateNow();
                
        // Re-draw the centre percentage value for all instances of donut charts
        //if(interactiveTypeObj[0] == 'donut'){
        //  $('#' + this.id).donutChart('createCentreValue');
        //}
      }
    });
  }
  
  /**
  * Create all necessary event handlers
  @method eventHandlersInit
  */
  function eventHandlersInit(){
    $.logEvent('[dataVisualization.core.eventHandlersInit]');
    
    var activeModuleObj;
    var interactivePluginId;
    var inputObj;
    
    $('#' + dataVisualization.configuration.visualizationWrapperId).on('click', '.module A.reload',function(e){
      e.preventDefault();
        
      activeModuleObj = $(this).parents('.module');
      interactivePluginObj = activeModuleObj.find('[data-initialized="true"]');
        
      // Show the overlay
      activeModuleObj
        .find('.overlay')
          .show();
        
      // Unload the active component
      interactivePluginObj
        .removeAttr('style')
        .empty();
          
      // Remove any '.centre-value' DOM elements
      $('.centre-value',activeModuleObj).remove();
        
      // Remove any standalone keys
      $('.key',activeModuleObj).remove();
        
      // Initialize the required functionality for the desired module
      dataVisualization.dispatcher.moduleInitialize({
        id: interactivePluginObj.attr('id')
      })
    });
  }
    
  /**
  * DOM inject the debug logger
  * @method createDebugLogger
  */
  function createDebugLogger(){   
    $('BODY')
      .prepend(
        $('<div />')
          .append(
            $('<h4 />')
              .html('Output log event')
          )
          .append(
            $('<div />')
              .attr('class','inner')
          )
          .attr('id','logger')
      )
      
    $.logEvent('[dataVisualization.core.createDebugLogger]');
  }
    
  return {
    buildDOM: buildDOM,
    init: init,
    refreshInteractiveElements: refreshInteractiveElements,
    updateLoadStatus: updateLoadStatus
  }
}());

// jQuery extensions
$.extend({
  /**
  * Logging, based on whether it has been configured to log or not
  * @method logEvent
  * @param {String} Event The event to log
  */
  logEvent: function(event){
    if(dataVisualization.configuration.debugLogging){
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
  * @param {Object} obj A variable JSON object to output to the console
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
  * Capitalize a string so that each word begins with an uppercase character
  * @method capitalize
  * @param {STRING} stringText The string to be formatted
  * @return {STRING} The converted string
  */
  capitalize: function(obj){
    $.logEvent('[$.capitalize: ]: ' + $.logJSONObj(obj));
    
    var output = [];
    var split = obj.stringText.split('-');
        
    for(var i=0; i<split.length; i++){
      output.push(split[i].substring(0,1).toUpperCase());
      output.push(split[i].substring(1));
      output.push(' '); // Put the space back in
    }
    
    return $.trim(output.join(''));
  }
});

$.fn.extend({
  // Conditional switching
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
  }
});