/**
* Accenture v1.0
* @module Accenture 2013 Vision (1104001486)
*/

var accenture = window.accenture || {};
accenture.configuration = {
  activeSlide: 1,
  activeTrend: 'introdution',
  debugLogging: false,
  easingEquation: 'easeInOutExpo',
  grabberBounces: 10,
  hideFrontScreenFirstEasing: 'easeOutQuad',
  hideFrontScreenSecondEasing: 'easeInCubic', // 'easeInOutQuart' is a symmetrical start and end equation if required
  homepageRevealed: false, 
  isIE7: false,
  limelightVideo: {
    height: 600,
    playerForm: 'LVPPlayer', // PlayerHorizontalPlaylist || LVPPlayer
    trends: {
      'introduction': { // LIVE CHANNEL DATA
        channelId: 'f460441b09b04a99bca91665b7a0eb96',
        uid: '770163'
      },
      'relationships-at-scale': { // LIVE CHANNEL DATA
        channelId: '80574bedd9c34436b975e88f19788d22',
        uid: '844383'
      },
      'design-for-analytics': { // LIVE CHANNEL DATA
        channelId: '9be1af8417fc4382a97ea5606b4837a1',
        uid: '601565'
      },
      'data-velocity': { // LIVE CHANNEL DATA
        channelId: '3102790151934bfc8be0769f24961371',
        uid: '332531'
      },
      'seamless-collaboration': { // LIVE CHANNEL DATA
        channelId: '4592bc4cc7714f34a95c8b986f399e8f',
        uid: '958505'
      },
      'software-defined-networking': { // LIVE CHANNEL DATA
        channelId: '275beae04caf4807be2cbc8fcd3ddd14',
        uid: '10315'
      },
      'active-defense': { // LIVE CHANNEL DATA
        channelId: '0ccc3dc43d584e968eb6273cc9e844b4',
        uid: '752755'
      },
      'beyond-the-cloud': { // LIVE CHANNEL DATA
        channelId: '6d4c65019ddc4989a727df2bee85cd7c',
        uid: '239897'
      }     
    },
    width: 960,
    wrapperHeight: 680
  },
  locked: false,
  pdfs: {
    videoTranscriptSizes: {
      'introduction': '122kb',
      'relationships-at-scale': '129kb',
      'design-for-analytics': '128kb',
      'data-velocity': '128kb',
      'seamless-collaboration': '126kb',
      'software-defined-networking': '128kb',
      'active-defense': '126kb',
      'beyond-the-cloud': '129kb'
    }
  },
  pinNavigationBarToTop: 440,
  screenWidth: null,
  scrollEventFiredOnce: false,
  slideHeight: 640,
  slideWidth: 980,
  snapToTrend: true, 
  trendOffsets: [0],
  touchOrDesktop: 'desktop',
  timings: {
    automatedFrontScreenReveal: 500,
    backToTop: 1000,
    desktop: {
      animateToTrend: 1000,
      topNavigationAnimate: 1000
    },
    dragSnapToReset: 250,
    drawString: {
      delayBeforeRunning: 500,
      duration: 1500
    },
    grabberBounceDuration: 5000,
    scrollDebounceTolerance: 350, // How long before the snap to nearest takes effect after page stops being manually scrolled
    scrollToTrendSlide: 1000,
    singleFireEventTimeout: 1000,
    snapToTrend: 500,
    touch: {
      animateToTrend: 1,
      topNavigationAnimate: 1
    },
    videoOverlayShowHide: 1000
  },  
  topNavigationBar: {
    'relationships-at-scale': {hex: '#03d771',offset: 54},
    'design-for-analytics': {hex: '#fbeb4b',offset: 198},
    'data-velocity': {hex: '#6180ff',offset: 344},
    'seamless-collaboration': {hex: '#f84828',offset: 488},
    'software-defined-networking': {hex: '#df1e3d',offset: 629},
    'active-defense': {hex: '#08acd2',offset: 772},
    'beyond-the-cloud': {hex: '#c09bd1',offset: 915}
  },
  trends: [
    'introduction',
    'relationships-at-scale',
    'design-for-analytics',
    'data-velocity',
    'seamless-collaboration',
    'software-defined-networking',
    'active-defense',
    'beyond-the-cloud'
  ]
};

// Attach functionality to the native scroll function
$(window).scroll(function(event){
  // Ensure that the video player gets removed from the DOM if scrolling whilst it's in view
  accenture.core.checkIfVideoVisible({
    snapClosed: true
  });

  // Work out whether to pin the navigation bar to the top of the screen or not
  if($(window).scrollTop() > accenture.configuration.pinNavigationBarToTop){
    $('#trends-switcher')
      .attr('class','fixed')
      .css('position','fixed')
      .find('A')
        .attr('class','compact')
        .end()
      .IF(accenture.configuration.isIE7)
        .prependTo($('#wrapper'))
      .ENDIF()
  }
  else{
    $('#trends-switcher')
      .attr('class','') 
      .css('position','absolute')
      .find('A')
        .attr('class','')
        .end()
      .IF(accenture.configuration.isIE7)
        .appendTo($('#reveal'))
      .ENDIF()
  }
}).scroll($.debounce(accenture.configuration.timings.scrollDebounceTolerance,function(event){ // Don't run in the same function as above, as it needs to be attached directly to the scroll, not within a self-enclosing function 
  if(!accenture.configuration.scrollEventFiredOnce && accenture.configuration.snapToTrend){
    var closestTrendIndex = accenture.core.findClosestTrend({
      arrayToSearch: accenture.configuration.trendOffsets,
      scrollPosition: $(window).scrollTop()
    });
            
    // Auto scroll the page to the nearest trend, since scrolling has finished (taking into account the last trend in terms of the ability to scroll there)
    if($(window).scrollTop() == ($(document).height()-$(window).height())){
      accenture.configuration.activeTrend = accenture.configuration.trends[accenture.configuration.trends.length-1];
    }
    else{     
      $(window).scrollTop(accenture.configuration.trendOffsets[closestTrendIndex]);
      accenture.configuration.activeTrend = accenture.configuration.trends[closestTrendIndex]
    }
    
    // Automate the reveal of the homepage, rather than it being user-initiated
    if(!accenture.configuration.homepageRevealed){          
      accenture.core.automateHomepageReveal();
    }
    
    // Update the position of the selected state within the trend switcher
    accenture.core.updateTrendSlider({
      snap: true,
      trend: accenture.configuration.activeTrend
    });

    // Trigger the animations for the currently active trend
    accenture.core.triggerTrendAnimations();
      
    accenture.configuration.scrollEventFiredOnce = true;
    
    // Remove handle to ensure events don't fired more than once
    setTimeout(function(){
      accenture.configuration.scrollEventFiredOnce = false;
    },accenture.configuration.timings.singleFireEventTimeout);
  }
}));

/**
* Accenture root class
* @class accenture
* @namespace core
*/
accenture.core = (function(){ 
  /**
  * Initialize the site
  * @method init
  */
  function init(){
    $.logEvent('[accenture.core.init]');
    
    // Dynamically switch on debug logging, if specified in the URL
    if(top.location.href.indexOf('debug') != -1) {
      accenture.configuration.debugLogging = true;
    }
    
    $('#accenture-trends').addClass('has-js');
    $('A[rel="external"]').live('click',function(){
      $(this).attr('target','_blank');
    });
    
    // Calcaulate/re-calculate any dimensions which may be altered by an orientation change or browser resize
    resetSite();
    
    // Detect whether desktop or tablet is viewing the site
    if('ontouchstart' in document.documentElement){
      accenture.configuration.touchOrDesktop = 'touch';
      
      $('#accenture-trends').addClass('touch');
      
      // Don't allow snapping to nearest trends functionality for touchscreen devices
      accenture.configuration.snapToTrend = false;
    }
        
    // Initialize drag function within introduction screen
    dragRevealInit();
    
    // Initialize event handlers for the main switcher navigation
    trendsSwitcherInit();
    
    // Iniitalize event handlers for the 'Watch the video' link
    watchTheVideoInit();
    
    // Initialize event handler for 'Back to top' links
    backToTopInit();
    
    // Initialize all horizontal scrollers
    $('.trend').scroller('init');
    
    // Work out whether IE7 is being used to view the site, due to the way absolute vs. fixed positioning works differently in that browser
    accenture.configuration.isIE7 = navigator.userAgent.toLowerCase().indexOf("msie 7.") != -1;
    
    // Events bound to window scrolling on page load (with a hash url provided) are not usually fired when deeplinking (force them here)
    // Enable these by slightly offsetting (and then resetting) the scroll position (page load only)
    if(top.location.href.indexOf('#') != -1){
      setTimeout(function(){
        var currentScrollPosition = $(window).scrollTop();
        $(window)
          .scrollTop(currentScrollPosition+1)
          .scrollTop(currentScrollPosition-1)
      },accenture.configuration.timings.desktop.animateToTrend);
    }
    
    // Create tooltips
    Tipped.create('.links-bar LI:eq(0)>A','pdf-download',{
      inline: true,
      hook: 'bottommiddle',
      skin: 'custom',
      stem: {
        height: 3,
        width: 6
      }
    });
    Tipped.create('.links-bar LI:eq(1)>A','share-list-elements',{
      inline: true,
      hook: 'bottommiddle',
      skin: 'custom',
      stem: {
        height: 3,
        width: 6
      }
    });
    
    var validHashValue = false;
    $.each(accenture.configuration.trends,function(index){
      if($.param.fragment() == 'trend-' + accenture.configuration.trends[index]){
        validHashValue = true;
        
        accenture.configuration.activeTrend = accenture.configuration.trends[index];
        
        // Automate the reveal of the homepage, rather than it being user-initiated
        if(!accenture.configuration.homepageRevealed){          
          accenture.core.automateHomepageReveal();
        }
        
        // Scroll the page to the selected trend
        animateToTrend();
        
        return false;
      }
    });
  }
  
  /**
  * Pass a track event over to the Omniture tracking suite
  * @method trackOmnitureEvent
  * @param {String} eventName the textual name of the event
  * @param {String} eventType the textual type of the event
  */  
  function trackOmnitureEvent(obj){
    $.logEvent('[accenture.core.trackOmnitureEvent]');
    
    try {
      // FlashLinkAnalysis(top.location.href,obj.eventName,obj.eventType);
    }
    catch(err) {}
  }
  
  /**
  * Initialize drag function within introduction screen
  * @method dragRevealInit
  */
  function dragRevealInit(){
    $.logEvent('[accenture.core.dragRevealInit]');
  
    // Animate the grabber (and associated instructional text) into position
    setTimeout(function(){
      $('#pull-to-explore').animate({
        bottom: 30,
        opacity: 1
      },{
        duration: accenture.configuration.timings.drawString.duration
      });
      
      $('#grabber-container').effect('bounce',{
        direction: 'down',
        times: accenture.configuration.grabberBounces
      },accenture.configuration.timings.grabberBounceDuration);
    },accenture.configuration.timings.drawString.delayBeforeRunning);
    
    $('#grabber,#accenture-trends #initial #pull-to-explore A').on('click',function(e){
      e.preventDefault();
      
      // Fade out and remove the grabber from the DOM
      $('#grabber-container').remove();
      
      $('#accenture-trends #initial').animate({
        top: 0
      },{
        complete: function(){
          $('#accenture-trends #initial')
            .animate({
              top: '-' + accenture.configuration.slideHeight + 'px'
            },{
              complete: function(){
                // Unlock the site
                siteLock({
                  method: 'unlock'
                });
              },
              duration: accenture.configuration.timings.automatedFrontScreenReveal*2,
              easing: accenture.configuration.hideFrontScreenSecondEasing
            });
        },
        duration: accenture.configuration.timings.automatedFrontScreenReveal,
        easing: accenture.configuration.hideFrontScreenFirstEasing
      });
    });
  } 
    
  /**
  * Ensure that the video player gets removed from the DOM if scrolling whilst it's in view
  * @method checkIfVideoVisible
  * @param {Object} snapClosed perform an immediate snap rather than a fade if the overlay is open and the user has scrolled
  */
  function checkIfVideoVisible(obj){
    $.logEvent('[accenture.core.checkIfVideoVisible]: ' + $.logJSONObj(obj));
  
    if($('#limelight-overlay').size() == 1){
      // Close and remove from the DOM the video overlay
      closeVideoOverlay({
        snapClosed: obj.snapClosed
      });
    }
  }
  
  /**
  * Close and remove from the DOM the video overlay
  * @method closeVideoOverlay
  * @param {Object} snapClosed perform an immediate snap rather than a fade if the overlay is open and the user has scrolled
  */
  function closeVideoOverlay(obj){
    $.logEvent('[accenture.core.closeVideoOverlay]: ' + $.logJSONObj(obj));

    $('#limelight-overlay').animate({
      opacity: 0
    },{
      complete: function(){
        $('#limelight-overlay').remove();
        
        // Unlock site
        siteLock({
          method: 'unlock'
        });
      },
      duration: obj.snapClosed ? 1 : accenture.configuration.timings.videoOverlayShowOrHide
    });     
  }
  
  /**
  * Iniitalize event handlers for the 'Watch the video' link
  * @method watchTheVideoInit
  */
  function watchTheVideoInit(obj){
    $.logEvent('[accenture.core.watchTheVideoInit]');
    
    var selfObj;
    
    $('.watch A').on('click',function(e){
      e.preventDefault();
      
      selfObj = $(this);
      
      // DOM inject the limelight video player into the page, pre-loading the required video asset
      accenture.limelight.createAndLoadPlayer({
        triggerObj: selfObj
      });
    });   
  } 
  
  /**
  * Find the nearest trend, based on the current scroll position
  * @method findClosestTrend
  * @param {Array} arrayToSearch all offset positions for the complete set of trends
  * @param {Integer} scrollPosition the current window scroll position
  * @return {Integer} the value of the nearest matching trend
  */
  function findClosestTrend(obj){
    $.logEvent('[accenture.core.findClosestTrend]');
    
    var localOffset;
    var offset = 9999;
    var closest = 0;
    
    $.each(obj.arrayToSearch,function(index){
      if(obj.arrayToSearch[index] <= obj.scrollPosition){
        localoffset = obj.scrollPosition - obj.arrayToSearch[index];
      }
      else{
        localoffset = obj.arrayToSearch[index] - obj.scrollPosition;
      }
      
      if(localoffset <= offset){
        offset = localoffset;
        closest = index;
      }
    });
    return closest;
  }

  /**
  * Calcaulate/re-calculate any dimensions which may be altered by an orientation change or browser resize
  * @method resetSite
  */  
  function resetSite(){
    $.logEvent('[accenture.core.resetSite]');
    
    accenture.configuration.screenWidth = $(window).width();
  }
    
  /**
  * Initialize event handler for 'Back to top' links
  * @method backToTopInit
  */
  function backToTopInit(){
    $.logEvent('[accenture.core.backToTopInit]');
    
    $('.back-to-top').localScroll({
      duration: accenture.configuration.timings[accenture.configuration.touchOrDesktop].animateToTrend,
      easing: accenture.configuration.easingEquation,
      hash: false,
      onBefore: function(e,anchor,$target){
        // Automate the reveal of the homepage, rather than it being user-initiated
        if(!accenture.configuration.homepageRevealed){          
          automateHomepageReveal();
        }
        
        if(accenture.configuration.touchOrDesktop == 'desktop'){
          // Lock site whilst animating (desktop only)
          siteLock({
            method: 'lock'
          });
        }
      },
      onAfter: function(anchor,settings){
        if(accenture.configuration.touchOrDesktop == 'desktop'){
          // Reset top navigation elements to all unselected
          $('#trends-switcher LI').removeClass('selected');
          
          // Unlock site whilst animating (desktop only)
          siteLock({
            method: 'unlock'
          });
        }
      }
    });
  }
  
  /**
  * Automate the reveal of the homepage, rather than it being user-initiated
  * @method automateHomepageReveal
  */
  function automateHomepageReveal(){
    $.logEvent('[accenture.core.automateHomepageReveal]');
    
    $('#accenture-trends #initial.drag-wrapper,#accenture-trends #grabber-container').hide();
    
    // Override checking boolean
    if(!accenture.configuration.homepageRevealed){
      accenture.configuration.homepageRevealed = true;
    }
  }
  
  /**
  * Update the position of the selected state within the trend switcher
  * @method updateTrendSlider
  * @param {Object,Boolean} snap Whether or not to snap to the selected trend immediately/1ms
  * @param {Object} trend The name of the newly selected trend
  */
  function updateTrendSlider(obj){
    $.logEvent('[accenture.core.updateTrendSlider]');
    
    if(obj.trend == 'introduction'){
      $('#trend-indicator').css('background','none');
    }
    
    $('#trend-indicator').animate({
      left: accenture.configuration.topNavigationBar[obj.trend].offset
    },{
      complete: function(){
        setTimeout(function(){
          $('#trend-indicator').css('background',accenture.configuration.topNavigationBar[obj.trend].hex);        
          $('#trend-indicator').css('background',accenture.configuration.topNavigationBar[obj.trend].hex);

          // Add selected class to control CSS overrides
          $('#trends-switcher LI[id="switcher-' + obj.trend + '"]')
            .addClass('selected')
            .siblings()
              .removeClass('selected');
    
          $('#trends-switcher A[href="#' + obj.trend + '"]')
            .css('color',accenture.configuration.topNavigationBar[obj.trend].hex)
            .parent()
              .siblings()
              .children('A')
                .css('color','#fff')        
        },1);
      },
      duration: obj.snap ? 1 : accenture.configuration.timings[accenture.configuration.touchOrDesktop].topNavigationAnimate,
      easing: accenture.configuration.easingEquation
    }); 
  }
  
  /**
  * Initialize event handlers for the main switcher navigation
  * @method trendsSwitcherInit
  */
  function trendsSwitcherInit(){
    $.logEvent('[accenture.core.trendsSwitcherInit]');
    
    // Set offset positions for touch devices jump functionality
    var selfObj;
    var additionalHeaderOffset = 155;
    $('.trend').each(function(index){
      selfObj = $(this);
      
      accenture.configuration.trendOffsets.push(selfObj.offset().top - additionalHeaderOffset);
    });
    
    $('#trends-switcher LI A').on('click',function(e){
      e.preventDefault();
                
      accenture.configuration.activeTrend = $(this).attr('href').replace('#','');

      // Pass a track event over to the Omniture tracking suite
      accenture.core.trackOmnitureEvent({
        eventName: $(this).attr('href').replace('#',''),
        eventType: 'top-navigation-bar'
      });
      
      // Scroll the page to the selected trend
      animateToTrend();
    });
  }
  
  /**
  * Scroll the page to the selected trend
  * @method animateToTrend
  */
  function animateToTrend(){
    $.logEvent('[accenture.core.animateToTrend]');
    
    var selectedTrend = accenture.configuration.activeTrend;    
    var selectedTrendIndex = $.inArray(selectedTrend,accenture.configuration.trends);

    updateTrendSlider({trend: selectedTrend});

    // Lock site whilst animating
    siteLock({
      method: 'lock'
    });
    
    $.scrollTo(accenture.configuration.trendOffsets[selectedTrendIndex],{
      duration: accenture.configuration.timings[accenture.configuration.touchOrDesktop].animateToTrend,
      easing: accenture.configuration.easingEquation,
      onAfter: function(){
        // Trigger the animations for the currently active trend
        triggerTrendAnimations();
    
        // Unlock site whilst animating
        siteLock({
          method: 'unlock'
        });
      }
    });
  }
  
  /**
  * Trigger the animations for the currently active trend
  * @method triggerTrendAnimations
  */
  function triggerTrendAnimations(){
    $.logEvent('[accenture.core.triggerTrendAnimations]');
    
    var activeTrendObj = $('#' + accenture.configuration.activeTrend);
    
    // Reset the animations per trend
    activeTrendObj.resetAnimations();
  }
  
  /**
  * Lock/unlock the site
  * @method siteLock
  * @param {Object} method 'lock' or 'unlock'
  */
  function siteLock(obj){
    $.logEvent('[accenture.core.siteLock]: ' + $.logJSONObj(obj));

    switch(obj.method){
      case 'lock':
        accenture.configuration.locked = true;
        $('#accenture-trends').addClass('locked');
        break;
      case 'unlock':
        accenture.configuration.locked = false;
        $('#accenture-trends').removeClass('locked');
        break;
    }
  }
    
  /**
  * Check to see if the site is currently in a locked/disabled state
  * @method isSiteLocked
  * @return {Boolean}
  */
  function isSiteLocked(){
    return $('#accenture-trends').hasClass('locked');
  }
  
  /**
  * Check to see if the site is being run from a desktop or a touch device
  * @method isTouchDevice
  * @return {Boolean}
  */
  function isTouchDevice(){
    return accenture.configuration.touchOrDesktop == 'touch';
  }
  
  /**
  * Functionality to execute upon an orientation change (touch devices only)
  * @method touchOrientationChange
  */
  function touchOrientationChange(){
    $.logEvent('[accenture.core.touchOrientationChange]');
    
    var selfObj;
    accenture.configuration.trendOffsets = [0];
    
    // Set offset positions for touch devices jump functionality
    $('.trend').each(function(){
      selfObj = $(this);
      accenture.configuration.trendOffsets.push(selfObj.offset().top);
    });
  }
  
  return {
    automateHomepageReveal: automateHomepageReveal,
    checkIfVideoVisible: checkIfVideoVisible,
    closeVideoOverlay: closeVideoOverlay,
    findClosestTrend: findClosestTrend,
    init: init,
    isSiteLocked: isSiteLocked,
    siteLock: siteLock,
    touchOrientationChange: touchOrientationChange,
    trackOmnitureEvent: trackOmnitureEvent,
    triggerTrendAnimations: triggerTrendAnimations,
    updateTrendSlider: updateTrendSlider
  }
}());

/**
* Accenture limelight class
* @class accenture
* @namespace limelight
*/

accenture.limelight = (function(){
  /**
  * DOM inject the limelight video player into the page, pre-loading the required video asset
  * @method createAndLoadPlayer
  * @param {Object} triggerObj the 'Watch this video' DOM element
  */
  function createAndLoadPlayer(obj){
    $.logEvent('[accenture.limelight.createAndLoadPlayer]: ' + $.logJSONObj(obj));
    
    var trendToLoad;
    
    // Work out what trend called the video player
    if(obj.triggerObj.hasParent('#introduction').size() == 1){
      // The introduction video is being played
      trendToLoad = 'introduction';
    }
    else{
      trendToLoad = obj.triggerObj.parents('.trend:first').attr('id');
    }
                
    // Lock site
    accenture.core.siteLock({
      method: 'lock'
    });
    
    // Create video overlay and inject into the DOM
    $('<div />')
      .attr('id','limelight-overlay')
      .css({
        height: $(window).height(),
        left: 0,
        top: $(window).scrollTop(),
        width: $(window).width()
      })
      .prependTo($('BODY'))
      .animate({
        opacity: 1
      },{
        duration: accenture.configuration.timings.videoOverlayShowOrHide
      })
      .append(
        $('<div />')
          .append(
            $('<a />')
              .attr({
                'class': 'close',
                href: '#'
              })
              .html('Close overlay')
              .on('click',function(e){
                e.preventDefault();
                
                // Close and remove from the DOM the video overlay
                accenture.core.closeVideoOverlay({
                  snapClosed: true
                });
              })
          )
          .append(
            $('<div />')              
              .append(
                $('<object />')
                  .append($('<param />').attr({name:'movie',value:'http://assets.delvenetworks.com/player/loader.swf'}))
                  .append($('<param />').attr({name:'wmode',value:'window'}))
                  .append($('<param />').attr({name:'allowScriptAccess',value:'always'}))
                  .append($('<param />').attr({name:'allowFullScreen',value:'true'}))
                  .append($('<param />').attr({name:'flashVars',value:'playerForm=' + accenture.configuration.limelightVideo.playerForm + '&channelId=' + accenture.configuration.limelightVideo.trends[trendToLoad].channelId}))
                  .attr({
                    'class': 'LimelightEmbeddedPlayerFlash',
                    data: 'http://assets.delvenetworks.com/player/loader.swf',
                    height: accenture.configuration.limelightVideo.height,
                    id: 'limelight_player_' + accenture.configuration.limelightVideo.trends[trendToLoad].uid,
                    name: 'limelight_player_' + accenture.configuration.limelightVideo.trends[trendToLoad].uid,
                    type: 'application/x-shockwave-flash',
                    width: accenture.configuration.limelightVideo.width
                  })
              )
              .attr('id','limelight-player')
          )
          .append(
            $('<p />')
              .append(
                $('<a />')
                  .attr({
                    href: 'media/pdfs/video-transcripts/' + trendToLoad + '.pdf',
                    rel: 'external'
                  })
                  .html('Download video transcript (PDF, ' + accenture.configuration.pdfs.videoTranscriptSizes[trendToLoad] + ')')
              )
          )
          .attr('class','inner')
          .css({
            left: 0,
            top: ($(window).height()-accenture.configuration.limelightVideo.wrapperHeight)/2
          })          
      )
    
    // Enable to video playback, having injected it into the DOM
    LimelightPlayerUtil.initEmbed('limelight_player_' + accenture.configuration.limelightVideo.trends[trendToLoad].uid);
  }
  
  return {
    createAndLoadPlayer: createAndLoadPlayer
  }
}());

// Setup keyboard navigation
$(document).on('keydown',function(e){
  // Escape key pressed
  if(e.keyCode == 27 && $('#limelight-overlay').size() == 1){
    $('#limelight-overlay .close').triggerHandler('click');
  }
});

$(window).on('orientationchange',function(){
  // Functionality to execute upon an orientation change (touch devices only)
  accenture.core.touchOrientationChange();
});

// Create 'customm' tooltip theme
$.extend(Tipped.Skins,{
  'custom': {
    background: '#009439',
    border: {
      color: '#009439',
      size: 1     
    },
    radius: {
      size: 0
    },
    shadow: false
  }
});

// jQuery extensions
$.extend({
  /**
  * Logging, based on whether it has been configured to log or not
  * @method logEvent
  * @param {String} event The event to log
  */
  logEvent: function(event){
    if(accenture.configuration.debugLogging){
      console.log(event);
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
  
  hasParent: function(obj){
    return this.filter(function(){
      return $(obj).find(this).length;
    });
  }
});