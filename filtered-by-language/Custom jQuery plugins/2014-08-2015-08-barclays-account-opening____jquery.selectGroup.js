(function(jQuery){
  var methods = {
    /**
    * Set select group configuration settings, before initialization
    * @method init
    */
    init: function(){     
      // Attach select group configuration to the global AO configuration
      $.extend(ao.configuration,{
        selectGroup: {
          expanded: false
        }
      });
            
      $.logEvent('[$.fn.selectGroup (init)]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.selectGroup));
      
      // Initialize delegated events for all select groups
      $('.type-select-group').on('focus','.converted SELECT',function(){
        $(this).parents('.select').addClass('focus');
      }).on('focusout','.converted SELECT',function(){
        $(this).parents('.select').removeClass('focus active');
        ao.configuration.selectGroup.expanded = false;
      }).on('keyup','.converted SELECT',function(e){
        var containerObj = $(this).parents('.select');
        var selectObj = $('SELECT',containerObj);
        var keycode = e.keyCode ? e.keyCode : e.which;
        
        // Up or down arrows pressed
        if(keycode === 38 || keycode === 40){         
          if(!ao.configuration.selectGroup.expanded){
            // Create a new jQuery.Event object with specified event properties.
            var eventObj = $.Event('keyup',{keyCode:13});
            selectObj.trigger(eventObj);
          
            // Re-define the selectedIndex of the dropdown, so that when auto-expanded, the correct element is shown as selected, and (more importantly), it is in view
            var selectedIndex = $('OPTION',selectObj).index($('OPTION:selected',selectObj));
            selectObj.prop('selectedIndex',selectedIndex);
          }
          
          // Update the trigger text
          $('P SPAN',containerObj).text($('OPTION:selected',selectObj).text());
        }
        // Return key pressed
        else if(keycode === 13){
          if(!ao.configuration.selectGroup.expanded){
            // Toggle the visibility of the dropdown (show)
            containerObj.selectGroup('toggle',{mode: 'show'});
          }
          else{
            // Toggle the visibility of the dropdown (hide)
            containerObj.selectGroup('toggle',{mode: 'hide'});
          }
        }
      }).on(ao.configuration.tapOrClickEvent,'.converted P',function(e){
        e.preventDefault();
              
        var containerObj = $(this).parents('.select');
        var selectObj = $('SELECT',containerObj);
        
        if(!ao.configuration.selectGroup.expanded){
          // Toggle the visibility of the dropdown (show)
          containerObj.selectGroup('toggle',{mode: 'show'});
        }
        else{
          // Toggle the visibility of the dropdown (hide)
          containerObj.selectGroup('toggle',{mode: 'hide'});
        }
      }).on(ao.configuration.tapOrClickEvent,'SELECT',function(e){
        var containerObj = $(this).parents('.select');
        var selectObj = $('SELECT',containerObj);
        
        // Update the trigger text
        $('P SPAN',containerObj).text($('OPTION:selected',selectObj).text());
        
        containerObj.removeClass('focus active');
      });
      
      return this.each(function(index){
        // Convert initial (select group) markup into that which is required by the more interactive/custom select group
        $(this).selectGroup('build');
      });
    },
    
    /**
    * Convert initial (radio button) markup into that which is required by the more interactive/custom form radio buttons
    * @method build
    */
    build: function(){
      $.logEvent('[$.fn.selectGroup (build)]');
      
      var selfObj = $(this);
      var selectContainerObj;
      
      return $('>.inner LI',selfObj).each(function(){ 
        $(this).addClass('converted');
        selectContainerObj = $(this).find('.select');
        
        // Inject the trigger element, to enable showing/hiding of the custom dropdown
        selectContainerObj
          .prepend(
            $('<p />')
              .append(
                $('<em />')
                  .html('Your selection:&nbsp;&gt;')
              )
              .append(
                $('<span />')
                  .text($('SELECT OPTION:selected',selectContainerObj).text())
              )
              .append(
                $('<a />')
                  .attr('class','arrow')
                  .text('(click to see available options)')
              )
          );
      });
    },
    
    /**
    * Toggle the visibility of the dropdown if the return key is pressed (when focused)
    * @method toggle
    * @param {STRING} mode Whether to show or hide the custom dropdown
    */
    toggle: function(obj){
      var containerObj = $(this);
      var selectObj = $('SELECT',containerObj);
      
      switch(obj.mode){
        case 'show':
          containerObj.attr('class','select active');
          ao.configuration.selectGroup.expanded = true;
          
          // Calculate offset positions
          selectObj.css({
            width: selectObj.width() > containerObj.width() ? selectObj.width() : containerObj.width()
          }).attr('size',5).focus();
      
          break;
        case 'hide':
          containerObj.attr('class','select');
          ao.configuration.selectGroup.expanded = false;
          
          // Update the trigger text
          $('P SPAN',containerObj).text($('OPTION:selected',selectObj).text());
          
          selectObj.attr('size',1);
            
          break;
      } 
    }
  };
  
  // Initialize plugin
  $.fn.selectGroup = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));