/**
* Account Opening v1.0
* @module ao
*/

var ao = window.ao || {};
ao.configuration = {
  debounceTimer: 1000, 
  debugLogging: false,
  hasTouch: false,
  helpIconTextPrefix: 'Click here for help about: ',
  isPrototypePage: false,
  popupOverlay: {
    visible: false
  },
  keycodes: function(){
    this.esc = 27;
    this.rtn = 13;
    this.tab = 9;
    this.shift = 16;
    this.space = 32;
    return this;
  },
  tapOrClickEvent: 'click',
  timings: {
    helpTextToggle: 250,
    jumpToDuration: 1000
  }
};

ao.core = (function(){
  /**
  * Initialize Account Opening
  * @method init
  * @param {BOOLEAN} prototypePage Whether the page is running as a prototype page or not
  */
  function init(obj){     
    $('BODY').removeClass('no-js').addClass('js');
        
    // Check to see whether touch events are supported or not with the device viewing the site
    checkTouchEvents();
    
    // Enable debug logging if provided as part of initialization
    if(ao.configuration.debugLogging || top.location.href.indexOf('debug') !== -1){
      ao.configuration.debugLogging = true;
      
      // DOM inject the debug logger
      createDebugLogger();
    }
    
    $.logEvent('[ao.core.init]: ' + $.logJSONObj(obj));
        
    // Set any page-specific overrides
    if(obj.prototypePage){
      ao.configuration.isPrototypePage = true;
    }
    
    // Extend global configuration to include popup overlay configuration (if not already set)
    $('BODY').popupOverlay('init');

    // Initialize all (global) event handlers
    ao.globalEvents.helpIcons();

    // Perform any DOM injection/translation/initialization (via plugins)
    if(!ao.configuration.isPrototypePage){
      // Initialize checkbox groups
      if($('.type-checkbox-group').existsInDom()){
        $('.type-checkbox-group').checkboxGroup('init');  
      }

      // Initialize radio groups
      if($('.type-radio-group').existsInDom()){
        $('.type-radio-group').radioGroup('init');
      }
      
      // Initialize select groups
      if($('.type-select-group').existsInDom()){
        $('.type-select-group').selectGroup('init');
      }
      
      // Initialize accordions
      if($('.accordion').existsInDom()){
        ao.accordion.init();
      }
      
      // Initialize tables
      if($('.table').existsInDom()){
        ao.table.init();
      }

      // Initialize tabs
      if($('.tabs').existsInDom()){
        ao.tabs.init();
      }

      // Initialize slidercontrols
      if($('.slidercontrol').existsInDom()){
        $('.slidercontrol').slidercontrol();
      }
    }
  }
  
  /**
  * Check to see whether touch events are supported or not with the device viewing the site
  * @method checkTouchEvents
  */
  function checkTouchEvents(){
    ao.configuration.hasTouch = $.support.touch = 'ontouchend' in document;
    
    $.logEvent('[ao.core.checkTouchEvents]: ' + ao.configuration.hasTouch);
    
    if(ao.configuration.hasTouch){
      $('BODY').addClass('has-touch');
      
      // Ensure that touch devices use a 'tap' event and desktop browsers use a 'click' event
      ao.configuration.tapOrClickEvent = 'tap';
    }
  }
    
  /**
  * Reset necessary features, so they don't remain active/visible on screen upon a resize/orientation change
  * @method reset
  */
  function reset(){
    $.logEvent('[ao.core.reset]');
    
    // Reset the visibility of help information
    $('.form-field P.help')
      .css('height',0)
      .removeClass('expanded')
      .removeAttr('style');
      
    // Refresh the widths of table elements, to ensure the internal scrollers are set to scroll the correct amount, in line with their data-attributes/thresholds/deltas
    $('.table').each(function(){      
      // Set the widths of both the overall table and the wrapper container as data attributes
      ao.table.setWidths({
        tableDomObj: $(this)
      });
    });
    
    // Hide the overlay if currently visible    
    if(ao.configuration.popupOverlay.visible){
      $('#popup-overlay').popupOverlay('hide');
    }
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
              .text('Output log event')
              .append(
                $('<a />')
                  .attr('href','#')
                  .on(ao.configuration.tapOrClickEvent,function(e){
                    e.preventDefault();
                    
                    $('#logger .inner')
                      .empty()
                  })
                  .text('(clear)')
              )
              .append(
                $('<a />')
                  .attr('href','#')
                  .on(ao.configuration.tapOrClickEvent,function(e){
                    e.preventDefault();
                    
                    $('#logger .inner')
                      .css('height','100px')
                  })
                  .text('(regular size)')
              )
              .append(
                $('<a />')
                  .attr('href','#')
                  .on(ao.configuration.tapOrClickEvent,function(e){
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
      
    $.logEvent('[ao.core.createDebugLogger]');
  } 
  
  /**
  * Process any hashvalue in the URL
  * @method processHashValueDeeplink
  */
  function processHashValueDeeplink(){
    $.logEvent('[ao.core.processHashValueDeeplink]');
    
    var hashValue = window.location.hash;
    
    if(hashValue !== ''){
      var deeplinkObj = $(window.location.hash);
      
      // Only jump to the requested element provided it is a valid DOM element
      if(deeplinkObj.size() === 1){
        deeplinkObj.focus();
        $.scrollTo(deeplinkObj,0);
      }
    }
  }
  
  return {
    init: init,
    processHashValueDeeplink: processHashValueDeeplink,
    reset: reset
  }
}());

/**
* Account Opening events class
* @class ao
* @namespace globalEvents
*/
ao.globalEvents = (function(){    
  /**
  * Initialize events for all radio buttons
  * @method helpIcons
  */
  function helpIcons(){
    // Loop through help icons, and attach contextual text, in order to detail the form element that the help icon is providinig help for
    var helpIconObj;
    
    $('.help-icon').each(function(index){
      helpIconObj = $(this);
      helpIconObj.text(ao.configuration.helpIconTextPrefix + $('>LABEL',helpIconObj.parents('FIELDSET:first')).text());
    });
    
    $('.form-element').on(ao.configuration.tapOrClickEvent,'.help-icon',function(e){
      e.preventDefault();
      
      var selfObj = $(this);
      var helpObj = selfObj.next();
      
      // Only allow the help text to toggle (open or closed) if it is not currently part way through an animation sequence
      var isAnimating = helpObj.is(':animated');
      
      if(!isAnimating){
        // Switch the display state of the help text for the <fieldset> being interacted with
        helpObj.slideToggle(ao.configuration.timings.helpTextToggle);
        
        var logMessage = 'help text for ' + selfObj.parents('FIELDSET').attr('class').replace('type-','') + ' toggled ';
        logMessage += helpObj.is(':visible') ? 'visible' : 'hidden';
        
        $.logEvent('[ao.globalEvents.helpIcons (click)]: ' + logMessage);
      }
    });
  }
  
  return {
    helpIcons: helpIcons
  }
}());

// jQuery extensions
$.extend({
  /**
  * Logging, based on whether it has been configured to log or not
  * @method logEvent
  * @param {STRING} Event The event to log
  */
  logEvent: function(event){
    if(ao.configuration.debugLogging){
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
  * Perform a debounce for any rapid executions
  * @method debounce
  */
  debounce: function(fn,timeout,invokeAsap,context){
    if(arguments.length == 3 && typeof invokeAsap != 'boolean'){
      context = invokeAsap;
      invokeAsap = false;
    }

    var timer;

    return function(){
      var args = arguments;
      context = context || this;
      invokeAsap && !timer && fn.apply(context, args);
      
      clearTimeout(timer);
      
      timer = setTimeout(function(){
        !invokeAsap && fn.apply(context, args);
        timer = null;
      },timeout);
    }
  },
  
  /**
  * Find the nearest matching integer within a numeric array list, passing a single match value to compare against
  * @method nearestArrayValue
  * @param {ARRAY} arrayObj The (numeric) array to check against
  * @param {INTEGER} obj.targetMatch The number which will be used as the comparison to find the nearest number to it
  * @return {INTEGER} The nearest value to the input targetMatch property
  */
  nearestArrayValue: function(obj){
    var arrayObj = obj.arrayObj;
    var targetMatch = obj.targetMatch;
    var closestValue = null;
    var matchingIndex = 0;
  
    $.each(arrayObj,function(index){
      if(closestValue == null || Math.abs(this-targetMatch) < Math.abs(closestValue-targetMatch)){
        closestValue = this;
        matchingIndex = index;
      }
    }); 
    
    return {
      closestValue: closestValue,
      matchingIndex: matchingIndex
    }
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
  
  hasParent: function(selectorType){
    return this.parents(selectorType).length;
  },
  
  existsInDom: function(){
    return this.size() > 0;
  },
    
  focusNextInputField: function(){
    return this.each(function(){
      var fields = $(this).parents('form:eq(0),body').find('button,input,textarea,select');
      var index = fields.index(this);
      
      fields.eq(index+1).css('border','solid 10px yellow');
      
      if(index > -1 && (index+1) < fields.length){
        fields.eq(index+1).focus();
      }
      
      return false;
    });
  }
});

$(window).on({
  load: function(){
    // Process any hashvalue in the URL
    ao.core.processHashValueDeeplink();
  },
  resize: $.debounce(function(){
    // Reset necessary features, so they don't remain active/visible on screen upon a resize/orientation change
    ao.core.reset();
  },ao.configuration.debounceTimer)
});

/* Since window click handlers aren't interpreted within < Internet Explorer 9 */

$(document).on({
  click: function(e){
    if(ao.configuration.popupOverlay.visible && $(e.target).parents('#popup-overlay').size() === 0){
      // Hide the overlay if currently visible
      $('#popup-overlay').popupOverlay('hide');
    }
  },
  keyup: function(e){
    var keycode = e.keyCode ? e.keyCode : e.which;
    
    // Hide the overlay if currently visible
    if(ao.configuration.popupOverlay.visible && keycode === ao.configuration.keycodes().esc){
      $('#popup-overlay').popupOverlay('hide');
    }
  },
  mousedown: function(e){
    var eventTargetObj = $(e.target);
    
    if($('#overlay').is(':visible') && eventTargetObj.hasParent('#overlay') === 0){
      $('#overlay').remove();
    }
  },
  scroll: function(){
    try{
      // The popup overlay will not have been defined if the page is refreshed when already part scrolled
      // Catch this error, since at this stage, the popup overlay would not have to be hidden, since the page would have only just been refreshed, and ao.core.init performs the necessary $.extend() to ao.configuration
      if(ao.configuration.popupOverlay.visible){
        // Hide the overlay if currently visible
        $('#popup-overlay').popupOverlay('hide');
      }   
    }
    catch(err){}
  }
});