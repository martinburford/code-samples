(function(jQuery){
  var methods = {
    /**
    * Set radio button configuration settings, before initialization
    * @method init
    */
    init: function(){     
      // Attach radio button configuration to the global AO configuration
      $.extend(ao.configuration,{
        radioGroup: {
          easingEquation: 'ease',
          selected: {
            height: '60%',
            left: '20%',
            opacity: 0.75,
            top: '20%',
            width: '60%'
          },
          timings: {
            selectionToggle: 200
          },
          unselected: {
            left: '50%',
            top: '50%'
          }
        }
      });
      
      $.logEvent('[$.fn.radioGroup (init)]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.radioGroup));
      
      // Initialize delegated events for all radio groups
      $('.type-radio-group').on(ao.configuration.tapOrClickEvent,'.converted',function(e){
        var radioObj = $(this).children('.radio');    
        var isActive = radioObj.attr('data-active') === 'true';
              
        // Remove all previous active (focus) states before applying focus styling to the currently focused radio element
        $(this).removeClass('focus').siblings().removeClass('focus');
        
        if(!isActive){
          radioObj.attr('data-active',true);
          
          $.logEvent('[$.fn.radioGroup (init)(click|tap)]: new radio button selected');
          
          // Reset all sibling radio buttons, whilst also ensuring the actual radio button elements are also changed, with respect to the current active radio button in the group
          radioObj
            .parent()
              .siblings()
                .find('.radio[data-active="true"]')
                  .siblings('INPUT[type="radio"]')
                    .removeAttr('checked')
                .end()
                .attr('data-active',false)
                .find('.inner').transition({
                  duration: ao.configuration.radioGroup.timings.selectionToggle,
                  easing: ao.configuration.radioGroup.easingEquation,
                  height: 0,
                  left: ao.configuration.radioGroup.unselected.left,
                  opacity: 0,
                  top: ao.configuration.radioGroup.unselected.top,
                  width: 0
                });
          
          // With previous selections reset, set the new active selection
          $('.inner',radioObj).transition({
            duration: ao.configuration.radioGroup.timings.selectionToggle,
            easing: ao.configuration.radioGroup.easingEquation,
            height: ao.configuration.radioGroup.selected.height,
            left: ao.configuration.radioGroup.selected.left,
            opacity: ao.configuration.radioGroup.selected.opacity,
            top: ao.configuration.radioGroup.selected.top,
            width: ao.configuration.radioGroup.selected.width
          });
        }
      });
    
      // Assign focus handlers to the native radio buttons, to bind the native and non-native Re: focus/tabbing through page elements
      $('.type-radio-group').on('focus','.converted INPUT[type="radio"]',function(e){
        var radioGroupObj = $(this).parents('.type-radio-group:first');
        var activeRadioObj = $('.radio[data-active="true"]',radioGroupObj);
        
        // Only continue to work with focus states if one of the radio elements are checked
        if(activeRadioObj.size() === 1){
          $.logEvent('[$.fn.radioGroup (init)(focus)]: radio group focused on, with a single radio button already pre-selected');
          
          // Remove all previous active (focus) states before applying focus styling to the currently focused radio element
          $('.converted',radioGroupObj).removeClass('focus');
          activeRadioObj.parent().addClass('focus');
        }
      }).on('blur','UL',function(){
        var radioGroupObj = $(this).parents('.type-radio-group:first');
        
        $.logEvent('[$.fn.radioGroup (init)(blur)]: radio group focus lost');
        
        // Remove the focus from the selected radio element
        $('.converted .radio[data-active="true"]',radioGroupObj).parent().removeClass('focus');
      });
        
      return this.each(function(){
        // Convert initial (radio button) markup into that which is required by the more interactive/custom form radio buttons
        $(this).radioGroup('build');
      });
    },
    
    /**
    * Convert initial (radio button) markup into that which is required by the more interactive/custom form radio buttons
    * @method build
    */
    build: function(){
      $.logEvent('[$.fn.radioGroup (build)]');
      
      var selfObj = $(this);
      var radioWrapperObj;
      var labelObj;
      var isChecked;
        
      return $('LI',selfObj).each(function(){       
        radioWrapperObj = $(this);        
        radioObj = $('INPUT[type=radio]',radioWrapperObj);        
        labelObj = $('LABEL',radioWrapperObj);
        isChecked = radioObj.is(':checked') ? true : false;
        
        radioWrapperObj
          .prepend(
            $('<div />')
              .append(
                $('<div />')
                  .append(
                    $('<div />')
                      .attr('class','inner')
                  )
                  .attr('class','outer')
              )
              .attr({
                'class': 'radio',
                'data-active': false
              })
          ).attr('class','converted');
        
        // Set the DOM injected markup to show a pre-selected radio button
        if(isChecked){
          radioObj
            .prev()
              .attr('data-active',true)             
              .find('.inner').transition({
                duration: ao.configuration.radioGroup.timings.selectionToggle,
                easing: ao.configuration.radioGroup.easingEquation,
                height: ao.configuration.radioGroup.selected.height,
                left: ao.configuration.radioGroup.selected.left,
                opacity: ao.configuration.radioGroup.selected.opacity,
                top: ao.configuration.radioGroup.selected.top,
                width: ao.configuration.radioGroup.selected.width
              });
        }
      });
    }
  };
  
  // Initialize plugin
  $.fn.radioGroup = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));