(function(jQuery){  
  var methods = {
    /**
    * Set accordion configuration settings, before initialization
    * @method init
    */
    init: function(){     
      // Attach checkbox group configuration to the global AO configuration
      $.extend(ao.configuration,{
        accordion: {
          easing: 'easeInOutQuad',
          timings: {
            toggle: 500
          }
        }
      });
                  
      $.logEvent('[$.fn.accordion (init)]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.accordion));
      
      // Initialize delegated events for all accordions
      $('.accordion').on(ao.configuration.tapOrClickEvent,'.group H4',function(e){
        e.preventDefault();
        
        var selfObj = $(this);
        var accordionWrapperObj = selfObj.parents('.accordion');
        
        // Don't process the event if an animation is currently being executed
        if(accordionWrapperObj.hasClass('locked')){
          return;
        }
        
        $.logEvent('[$.fn.accordion (init)(click|tap)]: accordion heading ' + $('A',selfObj).text() + ' expanded');
        
        accordionWrapperObj.addClass('locked');

        var accordionContentObj = selfObj.parent();
        var isExpanded = accordionContentObj.hasClass('active');
        var contentHeight = $('.inner',accordionContentObj).actual('outerHeight')+1;

        selfObj
          .parent()
            .toggleClass('active')
              .find('.outer')
                .IF(!isExpanded)
                  .show()
                  .css({
                    height: 0,
                    opacity: 0
                  })
                .ELSE()
                  .css('height',contentHeight)
                .ENDIF()
                .animate({
                  height: isExpanded ? 0 : contentHeight,
                  opacity: isExpanded ? 0 : 1
                },{
                  complete: function(){
                    accordionWrapperObj.removeClass('locked');
                    
                    // If the element toggled has been closed, hide it in the DOM, to ensure tabbing won't go through the links contained inside it
                    if(selfObj.next().height() === 0){
                      selfObj.next().hide();
                    }
                  },
                  duration: ao.configuration.accordion.timings.toggle,
                  esaing: ao.configuration.accordion.easing
                })
                .parent()
                  /* Process currently expanded sibling groups (if the accordion is a single selection accordion group */
                  .IF(accordionWrapperObj.attr('data-single-selection') === 'true')
                    .siblings().each(function(){
                      var siblingGroupObj = $(this);
                      siblingGroupObj
                        .IF($(this).hasClass('active'))
                          .removeClass('active')
                            .find('.outer')
                              .css('height',$('.inner',this).actual('outerHeight'))
                              .animate({
                                height: 0,
                                opacity: 0
                              },{
                                complete: function(){
                                  // If the element toggled has been closed, hide it in the DOM, to ensure tabbing won't go through the links contained inside it
                                  var siblingContentObj = siblingGroupObj.find('.outer');
                                  
                                  if(siblingContentObj.height() === 0){
                                    siblingContentObj.hide();
                                  }
                                },
                                duration: ao.configuration.accordion.timings.toggle,
                                esaing: ao.configuration.accordion.easing
                              })
                        .ENDIF()
                    })
                  .ENDIF()
      });
      
      return this.each(function(){
        // Perform initial toggle closed
        $(this).accordion('initialToggle');
      });
    },
    
    /**
    * Perform initial toggle closed
    * @method initialToggle
    */
    initialToggle: function(){
      $.logEvent('[$.fn.accordion (initialToggle)]');
      
      var selfObj = $(this);
      
      return selfObj.each(function(){
        $('.group:not(.active)',selfObj)
          .find('.outer')
            .hide();
      });
    }
  };
  
  // Initialize plugin
  $.fn.accordion = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));