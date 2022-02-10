/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.dropdownBar = (function(){
  var configuration = {
    containerObj: null,
    defaultGestureScrollingEnabled: true,
    expanded: false,
    localStorageObj: null,
    subGroupExpanded: false,
    timings: {
      panToDropdownBarTop: 1,
      toggleHorizontal: 250,
      toggleVertical: 250
    },
    toggleSwitches: {
      filterPosts: {
        'match-update': true,
        'goal': true,
        'red-card': true,
        'yellow-card': true,
        'you-say': true,
        'stat-update': true     
      },
      settings: {
        'auto-update': true
      }
    }
  };
    
  /** 
  * Build the dropdown bar
  * @method init
  */
  function build(){
    $.logEvent('[premierLeague.dropdownBar.build]');
    
    configuration.containerObj = $('<div />')
      .append(
        $('<ul />')
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr('href','#')
                  .text('Filter posts')
                  .append(
                    $('<span />')
                      .html('&nbsp;(click here to show)')
                  )
              )
              .attr('id','filter-posts')
          )
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr('href','#')
                  .text('Stats')
                  .append(
                    $('<span />')
                      .html('&nbsp;(click here to show)')
                  )
              )
              .attr('id','stats')
          )
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr('href','#')
                  .text('Settings')
                  .append(
                    $('<span />')
                      .html('&nbsp;(click here to show)')
                  )
              )
              .attr('id','settings')
          )
      )
      .append(
        $('<div />')
          .append(
            $('<ul />')
              .append($('<li />').append($('<strong />').attr('href','#').text('Match updates')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'match-update',type:'checkbox',checked:'checked'})))
              .append($('<li />').append($('<strong />').attr('href','#').text('Goals')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'goal',type:'checkbox',checked:'checked'})))
              .append($('<li />').append($('<strong />').attr('href','#').text('Red cards')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'red-card',type:'checkbox',checked:'checked'})))
              .append($('<li />').append($('<strong />').attr('href','#').text('Yellow cards')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'yellow-card',type:'checkbox',checked:'checked'})))
              //.append($('<li />').append($('<strong />').attr('href','#').text('Play by Play')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'play-by-play',type:'checkbox',checked:'checked'})))
              //.append($('<li />').append($('<strong />').attr('href','#').text('At the Ground')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'at-the-ground',type:'checkbox',checked:'checked'})))
              //.append($('<li />').append($('<strong />').attr('href','#').text('Home Bias')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'home-bias',type:'checkbox',checked:'checked'})))
              //.append($('<li />').append($('<strong />').attr('href','#').text('Away Bias')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'away-bias',type:'checkbox',checked:'checked'})))
              .append($('<li />').append($('<strong />').attr('href','#').text('You Say')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'you-say',type:'checkbox',checked:'checked'})))
              .append($('<li />').append($('<strong />').attr('href','#').text('Stat updates')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-filter-posts':'true','data-label':'stat-update',type:'checkbox',checked:'checked'})))
              .attr('class','triggers')
          )
          .append(
            $('<a />')
              .attr({
                'class': 'button',
                href: '#'
              })
              .text('Close')
          )
          .attr({
            'class': 'flyout-content',
            id: 'container-filter-posts'
          })
      )
      .append(
        $('<div />')
          .append(function(){
            var ulObj = $('<ul />').attr('class','triggers');
            var flyoutDOMObj;
            
            $('[data-flyout="true"]').each(function(index,flyoutObj){
              flyoutDOMObj = $(flyoutObj);
              ulObj
                .append($('<li />').append($('<a />').attr({'data-content-area':flyoutDOMObj.attr('data-content-area'),'data-content':flyoutDOMObj.attr('data-flyout-origin'),href:'#'}).text(flyoutDOMObj.attr('data-flyout-title')).append($('<span />').html('&nbsp;(click here to view ' + flyoutDOMObj.attr('data-flyout-title') + ')'))))
            });
            
            return ulObj;
          })
          .append(
            $('<a />')
              .attr({
                'class': 'button',
                href: '#'
              })
              .text('Close')
          )
          .attr({
            'class': 'flyout-content',
            id: 'container-stats'
          })
      )
      .append(
        $('<div />')
          .append(
            $('<ul />')
              .append($('<li />').append($('<strong />').attr('href','#').text('Auto updates')).append($('<input />').attr({'data-checked-label':'On','data-unchecked-label':'Off','data-settings':'true','data-label':'auto-update',type:'checkbox',checked:'checked'})))
              .attr('class','triggers')
          )
          .append(
            $('<a />')
              .attr({
                'class': 'button',
                href: '#'
              })
              .text('Close')
          )
          .attr({
            'class': 'flyout-content',
            id: 'container-settings'
          })
      )
      .insertBefore($('#live-feed .central-content>.outer'))
      .attr('id','dropdown-bar')
      
    // Initialize toggle switches
    toggleSwitchesInit();
    
    // Store the height of the dropdown groups as a data attribute, for later access when toggling
    setOriginalHeights();
    
    // Initialize event handlers for the show/hide
    eventHandlersInit();
  }
  
  /**
  * Initialize event handlers for the show/hide
  * @method eventHandlersInit
  */
  function eventHandlersInit(){
    $.logEvent('[premierLeague.dropdownBar.eventHandlersInit]');
    
    var activeSiblings;
    var requestedGroupObj;
    
    $('>UL LI',configuration.containerObj).on('click',function(e){
      e.preventDefault();
      
      if(premierLeague.configuration.deviceType === 'fluid'){
        // Scroll the dropdown bar to the top of the window
        $.scrollTo({
          left: 0,
          top: configuration.containerObj.offset().top
        },configuration.timings.panToDropdownBarTop);
      }
      
      // If default gesture scrolling is disabled, re-enable it
      if(!configuration.defaultGestureScrollingEnabled){
        // Enable (gesture-based) page scrolling
        premierLeague.core.enableDefaultGestureScrolling();
      }     
      
      // Don't process the handler if the selected element is already active
      if($(this).hasClass('active')){
        // Hide any previously open flyouts
        resetSiblingsVisibility();
      }
      else{
        // Hide any 'Stats' sub-groups (if visible)
        if(configuration.subGroupExpanded){
          $('.triggers .module',configuration.containerObj).remove();
          configuration.subGroupExpanded = false;
        }
        
        activeSiblings = false;
        requestedGroupObj = $('#container-' + $(this).attr('id'));

        // Before showing the visible group, ensure that any ones currently active are reset to hidden
        requestedGroupObj.siblings('DIV').each(function(){
          if($(this).height() > 0){
            activeSiblings = true;
          }
        });
        
        if(activeSiblings){
          // Hide any previously open flyouts
          resetSiblingsVisibility();
          
          setTimeout(function(){
            // Show the selected group
            toggleGroupVisibility({
              requestedGroupObj: requestedGroupObj
            });
          },configuration.timings.toggleVertical);
        }
        else{
          // Show the selected group
          toggleGroupVisibility({
            requestedGroupObj: requestedGroupObj
          },configuration.timings.toggleVertical);
        }
      }
    });
    
    // Initialize handlers for each of the 'Close' buttons
    $('.flyout-content>.button').on('click',function(e){
      e.preventDefault();

      // Hide any previously open flyouts
      resetSiblingsVisibility();
    });

    // Initialize handlers for the sub-links (Stats only)
    var triggerObj;
    var triggerNodeName;
    var fromFooterBar;
    
    $('UL.triggers>LI>A',configuration.dropdownBarObj).on('click',function(e){
      e.preventDefault();
      
      triggerObj = $(this);
      triggerNodeName = e.target.nodeName.toUpperCase();
      fromFooterBar = triggerObj.attr('data-content-area') == 'footer-bar';
      
      if((triggerNodeName == 'LI' || triggerNodeName == 'A') && triggerObj.hasAttr('data-content')){
        // Scroll the dropdown bar to the top of the window
        $.scrollTo({
          left: 0,
          top: configuration.containerObj.offset().top
        },0);
        
        triggerObj
          .parent()
            .append(
              $('<div />')
                .attr('class',triggerObj.attr('data-content') + ' module')
                .html($('.' + triggerObj.attr('data-content')).html())
                .prepend(
                  $('<a />')
                    .attr('class','close')
                    .text('Close')
                )
            )
            
        // Initialize events for all instances of League Table components (inside and outside of tab blocks)
        premierLeague.leagueTable.eventHandlersInit({
          dropdownBarFlyout: true
        }); 
        
        // With the content now moved to the dropdown bar, animate it into view       
        var subGroupInnerHeight;
        var subGroupObj = $('.module',configuration.containerObj);
        var subGroupOuterObj = $('>.outer',subGroupObj);
        var outerOffsetTop = Math.floor(subGroupOuterObj.offset().top - configuration.containerObj.offset().top);
        var windowHeight = window.innerHeight;
        var thresholdHeight = windowHeight - outerOffsetTop;
        
        subGroupOuterHeight = Math.floor(subGroupOuterObj.height());
        
        $.logEvent('[premierLeague.dropdownBar.eventHandlers]: subGroupOuterHeight=' + subGroupOuterHeight + ', outerOffsetTop=' + outerOffsetTop + ', window height: ' + windowHeight + ', thresholdHeight: ' + thresholdHeight);
        
        // Set the height for all inner DOM elements to the threshold height
        subGroupOuterObj.css('height',thresholdHeight);
        
        // Disable (gesture-based) page scrolling except for internal scrollers (iScroll)
        premierLeague.core.disableDefaultGestureScrolling();
        
        // Work out whether the flyouts inner DOM elements need scrolling attached to them
        if(subGroupOuterHeight > thresholdHeight){
          // Add an internal <div> and attach internal padding values to that, since iScroll does not take into account the presence of paddings or margins when calculating the height of it's scroller
          subGroupOuterObj
            .attr({
              id: 'internal-scroller'
            })
            .wrapInner(
              $('<div />')
                .attr('class','internal-scroller')
                .css({
                  paddingBottom: '20px'
                })
            );
            
          // Activate the internal scroller
          var myScroll = new IScroll('#internal-scroller');
        }
        
        // Perform left to right animation
        subGroupObj.css({
          left: 0,
          WebkitTransition: 'left ' + configuration.timings.toggleHorizontal + 'ms ease-in-out',
          transition: 'left ' + configuration.timings.toggleHorizontal + 'ms ease-in-out'
        });
        
        // Ensure that a flag is set, to identify that a sub-group is currently in an expanded state
        setTimeout(function(){
          configuration.subGroupExpanded = true;
          
          // Send tracking request to Omniture
          premierLeague.omniture.track({
            additionalProperties: {
              dataAction: 'load:statistics-flyout',
              dataType: 'statistics-flyout:link-tools',
              dataContext: 'wc-dropdownbar'
            }, 
            callee: this,
            friendlyTitle: 'Statistics sub-group flyout',
            trackingType: 'event-click'
          });
          
        },configuration.timings.toggleHorizontal);
        
        // Initialize handlers for the sub-group content close button
        // Delegate this event, since the sub groups are injected post initial page load
        $('UL.triggers',configuration.containerObj).delegate('.close','click',function(e){
          e.preventDefault(); 

          // Ensure that iScroll doesn't show CSS3 "tramlines" when hiding the horizontal 'Stats' flyout: perform this BEFORE the flyout starts to move off to the left of the screen
          subGroupOuterObj
            .children(':first')
              .removeAttr('style');
          
          // Perform right to left animation
          $('.module',configuration.containerObj).css({
            left: '-100%',
            WebkitTransition: 'left ' + configuration.timings.toggleHorizontal + 'ms ease-in-out',
            transition: 'left ' + configuration.timings.toggleHorizontal + 'ms ease-in-out'
          });
          
          // Remove the injected flyout content
          setTimeout(function(){
            $('.module',configuration.containerObj).remove();
            configuration.subGroupExpanded = false;
            
            // Enable (gesture-based) page scrolling
            premierLeague.core.enableDefaultGestureScrolling();
          },configuration.timings.toggleHorizontal);
        });
      }
    });
  }
  
  /**
  * Show the selected group
  * @method toggleGroupVisibility
  * @param {OBJECT} requestedGroupObj The DOM element which is to be expanded
  */
  function toggleGroupVisibility(obj){
    $.logEvent('[premierLeague.dropdownBar.toggleGroupVisibility]: ' + $.logJSONObj(obj));
        
    var requestedHeight = obj.requestedGroupObj.attr('data-original-height');
        
    // Check to see whether the fixtures (carousel) is currently expanded. If it is, close it
    if(premierLeague.fixtures.configuration.expanded){
      // Show or hide the (fluid) carousel
      premierLeague.fixtures.showHideCarousel();
    }
    
    var activeTriggerId = obj.requestedGroupObj.attr('id').replace('container-','');

    // Expanded the group for the selected trigger item
    obj.requestedGroupObj.css({
      height: requestedHeight,
      WebkitTransition: 'height ' + configuration.timings.toggleVertical + 'ms ease-in-out',
      transition: 'height ' + configuration.timings.toggleVertical + 'ms ease-in-out'
    });
    
    setTimeout(function(){
      // To allow the component moving in from the side to overflow correctly, add overflow visibility
      obj.requestedGroupObj.css('overflow','visible');
    
      // Add the active state to the selected item, and remove from all siblings
      $('>UL LI#' + activeTriggerId,configuration.containerObj)
        .addClass('active')
        .siblings()
          .removeClass('active');
    
      configuration.expanded = true;
      
      // Send tracking request to Omniture
      premierLeague.omniture.track({
        additionalProperties: {
          dataAction:'dropdownbar:show',
          dataType: 'group:expand-' + activeTriggerId,
          dataContext: 'wc-dropdownbar'
        }, 
        callee: this,
        friendlyTitle: 'Dropdown bar group show',
        trackingType: 'event-click'
      });     
    },configuration.timings.toggleVertical);
  }
  
  /**
  * Hide any previously open flyouts
  * @method resetSiblingsVisibility
  */
  function resetSiblingsVisibility(){
    $.logEvent('[premierLeague.dropdownBar.resetSiblingsVisibility]');
    
    var selfObj = $(this);
    
    $('.flyout-content').filter(function(){
      return $(this).height() > 0;
    }).css({
      height: 0,
      WebkitTransition: 'height ' + configuration.timings.toggleVertical + 'ms ease-in-out',
      overflow: 'hidden',
      transition: 'height ' + configuration.timings.toggleVertical + 'ms ease-in-out'
    });
        
    setTimeout(function(){
      // Remove all active classes
      $('>UL LI',configuration.containerObj).removeClass('active');   
      
      configuration.expanded = false;
    },configuration.timings.toggleVertical);
  } 
  
  /**
  * Store the height of the dropdown groups as a data attribute, for later access when toggling
  * @method setOriginalHeights
  */
  function setOriginalHeights(){
    $.logEvent('[premierLeague.dropdownBar.setOriginalHeights]');
    
    var flyoutContentObj;
    var internalScrollerObj;
    
    $('.flyout-content',configuration.containerObj).each(function(){
      flyoutContentObj = $(this);
      
      // Determine whether the dropdown bar flyout-content wrapper DOM elements require internal scrolling or not
      internalScrollerObj = scrollerDimensions({
        dropdownContentObj: flyoutContentObj,
        originalHeight: flyoutContentObj.height()
      });
      
      if(!flyoutContentObj.hasAttr('data-original-height')){
        flyoutContentObj
          .attr({
            'data-original-height': flyoutContentObj.outerHeight(),
            'data-scroll-height': internalScrollerObj.scrollHeight,
            'data-scrolling-required': internalScrollerObj.scrollingRequired
          })
          .css({
            left: '',
            top: ''
          })
          .height(0)
          .addClass('loaded')
      }
    });
  }
  
  /**
  * Determine whether the dropdown bar flyout-content wrapper DOM elements require internal scrolling or not
  * @method scrollerDimensions
  * @param {OBJECT} dropdownContentObj The container DOM object which contains the content for potential scrolling 
  * @param {INTEGER} originalHeight The natural height of the dropdown bar flyout content DOM object
  * @return {INTEGER} scrollHeight After how many pixels of a flyout contents depth internal scrolling should be activated
  * @return {BOOLEAN} scrollingRequired Whether or not internal scrolling should be activated or not
  */
  function scrollerDimensions(obj){
    $.logEvent('[premierLeague.dropdownBar.scrollerDimensions]: ' + $.logJSONObj(obj));
    
    var dropdownBarHeight = configuration.containerObj.outerHeight(true)-1; // -1 takes account of the bottom border
    var contentOffsetTop = Math.ceil(configuration.containerObj.offset().top) + dropdownBarHeight;
    var viewportHeight = $(window).height();
    var scrollHeight = viewportHeight-contentOffsetTop;

    var dimensions = {
      scrollHeight: scrollHeight,
      scrollingRequired: obj.originalHeight > scrollHeight
    }
    
    return dimensions;
  }
  
  /**
  * Initialize toggle switches
  * @toggleSwitchesInit
  */
  function toggleSwitchesInit(){
    $.logEvent('[premierLeague.dropdownBar.toggleSwitchesInit]');
        
    $('INPUT:checkbox',configuration.containerObj).each(function(){
      toggleObj = $(this);
      var switchObj;
      
      // Identify whether a 'Filter Posts" or 'Settings' toggle switch has been changed
      var isFilterPost = toggleObj.hasAttr('data-filter-posts');
      var isSettingsPost = toggleObj.hasAttr('data-settings');
      
      // Set the checked state of the checkboxes (Filter Posts) based on the configuration within this namespace
      if(isFilterPost){
        if(!configuration.toggleSwitches.filterPosts[toggleObj.attr('data-label')]){
          toggleObj.removeAttr('checked');
        }
      }

      // Set the checked state of the checkboxes (Filter Posts) based on the configuration within this namespace
      if(isSettingsPost){
        if(!configuration.toggleSwitches.settings[toggleObj.attr('data-label')]){
          toggleObj.removeAttr('checked');
        }
      }
      
      // Enable the toggle switch functionality
      toggleObj.iphoneStyle({
        checkedLabel: toggleObj.attr('data-checked-label'),
        onChange: function(element,active){
          switchObj = $(element[0]);
          
          // If a Filter Post toggle switch has been changed, reflect that within the stored configuration, and perform the visual toggle within the news feed
          if(isFilterPost){
            configuration.toggleSwitches.filterPosts[switchObj.attr('data-label')] = active;

            // Toggle the hidden state, switch it to the opposite of whatever it currently is
            $('.update[data-update-type="' + switchObj.attr('data-label') + '"]')
              .IF(active)
                .removeClass('websocket-update hidden')
              .ELSE()
                .addClass('hidden')
              .ENDIF()
              
            if(switchObj.attr('data-label') == 'stat-update' && active){
              // Unload all pie chart instances, as the rendering of them in fluid vs fixed is different
              premierLeague.pieChart.unload();  
            }
            
            // Send tracking request to Omniture
            premierLeague.omniture.track({
              additionalProperties: {
                dataAction:'toggle:filter-posts',
                dataType: 'filter-posts:switch-tools',
                dataContext: 'wc-filter-posts'
              }, 
              callee: this,
              friendlyTitle: 'Dropdown bar toggle switch',
              trackingType: 'event-click'
            });
          }
          else if(isSettingsPost){
            $.each(premierLeague.websockets.configuration.channels,function(index,channelObj){
              $.logEvent('[premierLeague.dropdownBar.toggleSwitchesInit]: channels to unsubscribe from: ' + $.logJSONObj(channelObj));
              
              if(active){               
                // Subscribe to the requested websocket channel, which will broadcast all real-time website updates for that unique component
                premierLeague.websockets.channelSubscribe({
                  componentId: channelObj.componentId,
                  isMatchSpecific: channelObj.isMatchSpecific
                });
              }
              else{
                // Unsubscribe from a requested websocket channel
                premierLeague.websockets.channelUnsubscribe({
                  channelFullName: channelObj.channelFullName
                });             
              }
            });
          }
          
          // Reflect the change also in local storage, for return page visits
          if(premierLeague.configuration.supportsLocalStorage){
            configuration.localStorageObj.set('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches',configuration.toggleSwitches);
          }
        },
        uncheckedLabel: toggleObj.attr('data-unchecked-label')
      });
    }); 
  }
  
  /** 
  * If local storage is supported, ensure that the necessary default storage is saved
  * @method localStorageInit
  */
  function localStorageInit(){
    // Check local storage to see if the necessary data is stored, relating to the current page type
    configuration.localStorageObj = $.localStorage;
        
    if(configuration.localStorageObj.isEmpty('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches')){
      // Set the local storage default values
      configuration.localStorageObj.set('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches',configuration.toggleSwitches);

      $.logEvent('[premierLeague.dropdownBar.localStorageInit]: setting localstorage for dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches, localStorage=' + configuration.localStorageObj.get('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches'));
    }
    else{
      // Override the pre-defined defaults with the current local storage values, to ensure saved user configurations are used
      configuration.toggleSwitches = configuration.localStorageObj.get('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches');

      $.logEvent('[premierLeague.dropdownBar.localStorageInit]: retrieving existing localstorage for dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches, localStorage=' + configuration.localStorageObj.get('dropdownBar.' + premierLeague.configuration.fixtureId + '.toggleSwitches'));
    }
  }
    
  return {
    build: build,
    configuration: configuration,
    localStorageInit: localStorageInit
  }
}());