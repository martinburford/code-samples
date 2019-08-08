/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.fixtures = (function(){
  var configuration = {
    centralizeOffsets: {
      enabled: true,
      fixed: {
        1: 2,
        2: 1,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
        7: 0
      }
    },
    easingEquation: 'easeInOutQuad',
    expanded: false,
    fluidHeights: null,
    iScrollObj: null,
    localStorageObj: null,
    matchWidth: null,
    selectedGroup: 'all',
    selectedIndex: 0,
    selectHeight: null,
    timings: {
      animateToCentre: 1000,
      animateToNewMatch: 250,
      centralizeMatches: 1
    },
    updates: {
      blinks: 3,
      blinkPeriod: 250,
      fadeInOut: 350
    }
  };
      
  /**
  * Build the fixtures in response to the initial pulled JSON content
  * @method build
  */
  function build(){
    $.logEvent('[premierLeague.fixtures.build]');

    var carouselContainerObj = $('#carousel');
    
    // Allow pre-renderer to reset initial HTML markup
    if(premierLeague.configuration.resetOnInit){
      premierLeague.core.resetComponent({
        componentObj: carouselContainerObj
      });
    }
    
    // Retrieve markup from JSON, and inject each carousel into the DOM
    carouselContainerObj
      .append(
        $('<a />')
          .attr({
            href: '#',
            id: 'carousel-trigger'
          })
          .text('Select a game')
          .append(
            $('<span />')
              .text(' (click here to select a game)')
          )
      )
      .append(
        $('<div />')
          .attr('class','fluid-outer')
      )
      
    // Attach matches to the carousel
    $('.fluid-outer',carouselContainerObj)
      .append(
        attachMatchesToCarousel({
          matchesObj: premierLeague.configuration.initialSiteContent.fixtures.content
        })
      );
    
    // Initialize all events for the fluid interactions
    fluidInit();
        
    // Initialize fixtures
    $('.fixtures').fixtures('init');
  }
    
  /** 
  * Add a group of fixtures to a carousel group
  * @method attachGroupToCarousel
  * @param {OBJECT} matchesObj The entire set of matches
  * @return {OBJECT} The DOM object to be attached to the current carousel
  */
  function attachMatchesToCarousel(obj){
    $.logEvent('[premierLeague.fixtures.attachMatchesToCarousel]: ' + $.logJSONObj(obj));
    
    var fixturesObj = $('<div />')
      .append(
        $('<p />')
          .append(
            $('<a />')
              .attr('href','#')
              .text('View previous matches')
          )
          .attr('class','previous')
      )
      .append(
        $('<div />')
          .append(
            $('<div />')
              .attr('class','inner')
          )
          .attr('class','outer')
      )
      .append(
        $('<p />')
          .append(
            $('<a />')
              .attr('href','#')
              .text('View next matches')
          )
          .attr('class','next')
      )
      .attr('class','fixtures');
    
    // Loop through the matches and attach them to each group
    $.each(obj.matchesObj,function(index,matchObj){
      var matchStatus;
      
      // Work out which match status label to show in the carousel against each match
      if(this.active){
        if(this.status === 'Pre-Match'){
          matchStatus = this.startTime;
        }
        else{
          matchStatus = this.status;
        }
      }
      else{
        if(this.status === 'Full Time'){
          matchStatus = this.status;
        }
        else{
          matchStatus = this.startTime;
        }
      }
      
      var matchDOMObj = $('<div />')
        .append(
          $('<table />')
            .append(
              $('<thead />')
                .append(
                  $('<tr />')
                    .append(
                      $('<th />')
                        .attr('colspan',2)
                        .text(matchStatus)
                    )
                )
            )
            .append(
              $('<tbody />')
                .append(
                  $('<tr />')
                    .append(
                      $('<th />')
                        .text(this.homeTeam.shortName)
                    )
                    .append(
                      $('<td />')
                        .html(this.homeTeam.score === '-' ? '&nbsp;' : this.homeTeam.score)
                    )
                )
                .append(
                  $('<tr />')
                    .append(
                      $('<th />')
                        .text(this.awayTeam.shortName)
                    )
                    .append(
                      $('<td />')
                        .html(this.awayTeam.score === '-' ? '&nbsp;' : this.awayTeam.score)
                        .append(
                          $('<a />')
                            .attr('href',this.url)
                            .text('(click here to view the match details)')
                        )
                    )
                )
            )
            .attr('border',0)
        )
        .attr({
          'class': 'match' + (this.active ? ' active' : ''),
          'data-fixture-id': this.id
        });
      
      // Attach the match to the group
      $('.inner',fixturesObj)
        .append(matchDOMObj);
      
      // Process penalty shootouts
      if(this.hasOwnProperty('period')){
        var penaltiesInMatch = false;
        if(this.homeTeam.penaltyShots.length > 0 && this.awayTeam.penaltyShots.length > 0){
          penaltiesInMatch = true;
        }
        
        if(this.period === 'ShootOut' || penaltiesInMatch){
          // Add penalty details to the active match
          attachPenaltiesToMatch({
            homeTeamPenalties: this.homeTeam.penaltyShots,
            awayTeamPenalties: this.awayTeam.penaltyShots,
            matchObj: matchObj
          });
          
          // Show penalty shootout winner
          if(this.hasOwnProperty('finished')){
            if(this.finished){
              showPenaltyShootoutWinner({
                homeTeamPenalties: this.homeTeam.penaltyShots,
                awayTeamPenalties: this.awayTeam.penaltyShots,
                matchObj: matchObj
              });
            }
          }
        }
      }
    });
    
    return fixturesObj;
  }
  
  /**
  * Count the home team and away team goalscorers
  * @method countGoalScorers
  * @param {ARRAY} homeTeamPenalties The array of penalty takers for the home team
  * @param {ARRAY} awayTeamPenalties The array of penalty takers for the away team
  * @return {OBJECT} The home and team goalscorer counts
  */
  function countGoalScorers(obj){
    $.logEvent('[premierLeague.fixtures.countGoalScorers]: ' + $.logJSONObj(obj));
    
    var homeTeamScorers = 0;
    var awayTeamScorers = 0;
    
    // Work out how many of the home teams penalties were scored
    $.each(obj.homeTeamPenalties,function(index,penaltyObj){
      if(penaltyObj.scored){
        homeTeamScorers++;
      }
    });
    
    // Work out how many of the away teams penalties were scored
    $.each(obj.awayTeamPenalties,function(index,penaltyObj){
      if(penaltyObj.scored){
        awayTeamScorers++;
      }
    });
    
    return {
      homeTeamScorers: homeTeamScorers,
      awayTeamScorers: awayTeamScorers
    }
  }
  
  /**
  * Add penalty details to the active match
  * @method attachPenaltiesToMatch
  * @param {ARRAY} homeTeamPenalties The array of penalty takers for the home team
  * @param {ARRAY} awayTeamPenalties The array of penalty takers for the away team
  * @param {OBJECT} matchObj The match DOM element
  */
  function attachPenaltiesToMatch(obj){
    $.logEvent('[premierLeague.fixtures.attachPenaltiesToMatch]: ' + $.logJSONObj(obj));
    
    var matchObj = $(obj.matchObj);
    
    $('TBODY TH',matchObj)
      .find('SPAN')
        .remove();
    
    // Count the home team and away team goalscorers
    var scorersObj = countGoalScorers({
      homeTeamPenalties: obj.homeTeamPenalties,
      awayTeamPenalties: obj.awayTeamPenalties
    });
    
    // Update the goalscorers for the home team
    $('TBODY TR:eq(0) TH',matchObj)
      .append(
        $('<span />')
          .text('(' + scorersObj.homeTeamScorers + ')')
      );
      
    // Update the goalscorers for the away team
    $('TBODY TR:eq(1) TH',matchObj)
      .append(
        $('<span />')
          .text('(' + scorersObj.awayTeamScorers + ')')
      );
  }
  
  /**
  * Show penalty shootout winner
  * @method showPenaltyShootoutWinner
  * @param {ARRAY} homeTeamPenalties The array of penalty takers for the home team
  * @param {ARRAY} awayTeamPenalties The array of penalty takers for the away team
  * @param {OBJECT} matchObj The match DOM element
  */
  function showPenaltyShootoutWinner(obj){
    $.logEvent('[premierLeague.fixtures.showPenaltyShootoutWinner]: ' + $.logJSONObj(obj));
    
    var matchObj = $(obj.matchObj);
    
    // Count the home team and away team goalscorers
    var scorersObj = countGoalScorers({
      homeTeamPenalties: obj.homeTeamPenalties,
      awayTeamPenalties: obj.awayTeamPenalties
    });
    
    var winningTeamIndex = 0; // Home
    if(scorersObj.awayTeamScorers > scorersObj.homeTeamScorers){
      winningTeamIndex = 1; // Away
    }
    
    var winningTeamObj = $('TBODY TR:eq(' + winningTeamIndex + ') TH',matchObj);
    
    // Show * alongside the team who won the penalty shootout
    $('<span />')
      .text('*')
      .insertBefore($('SPAN',winningTeamObj));
  }
              
  /**
  * Initialize all events for the fluid interactions
  * @method fluidInit
  */
  function fluidInit(){
    $.logEvent('[premierLeague.fixtures.fluidInit]');
    
    $('#carousel-trigger').on('tap',function(e){
      e.preventDefault();
      
      // Show or hide the (fluid) carousel
      showHideCarousel();
    });
    
    // Fluid layout
    $('#carousel SELECT').on('change',function(){
      var selectedObj = $(this);
            
      if(selectedObj.val() === ''){
        return;
      }
      
      // Remove the internal scroller
      removeInternalScroller();
            
      // Show the requested group
      $('#carousel .fixtures[data-group=' + selectedObj.val() + ']')
        .addClass('active')
        .siblings('.fixtures')
          .removeClass('active');
          
      $('#carousel UL A[data-group=' + selectedObj.val() + ']')
        .parent()
          .addClass('active')
          .siblings()
            .removeAttr('class');

      // Expand the carousel
      setTimeout(function(){
        expandCarousel(); 
      },1);

      // Send tracking request to Omniture
      premierLeague.omniture.track({
        additionalProperties: {
          dataAction:'toggle:carousel-group',
          dataType: 'carousel-group:filter_' + selectedObj.val(),
          dataContext: 'wc-carousel'
        }, 
        callee: this,
        friendlyTitle: 'Carousel group toggle',
        trackingType: 'event-click'
      });
    });
  }
  
  /**
  * Show or hide the (fluid) carousel
  * @method showHideCarousel
  */
  function showHideCarousel(){  
    if(!$('#carousel-trigger').hasClass('expanded')){   
      $.logEvent('[premierLeague.fixtures.showHideCarousel]: expand');
      
      // Expand the (currently contracted) carousel
      $('#carousel-trigger').addClass('expanded');
      
      // Expand the carousel
      expandCarousel(); 

      // Update boolean flag, representing if the fixtures is in an expanded state
      configuration.expanded = true;
    }
    else{
      $.logEvent('[premierLeague.fixtures.showHideCarousel]: contract');
      
      // Contract the (currently expanded) carousel
      $('#carousel-trigger').removeClass('expanded');
      
      // Remove the internal scroller
      removeInternalScroller();
      
      $('.fluid-outer').hide();
      
      // Update boolean flag, representing if the fixtures is in an contracted state
      configuration.expanded = false;
    }
  }
  
  /**
  * For fluid fixtures, centralize the matches in the best way possible
  * @method centralizeMatchesFluid
  */
  function centralizeMatchesFluid(){  
    $.logEvent('[premierLeague.fixtures.centralizeMatchesFluid]');
    
    var fixturesObj = $('#internal-scroller');
    var availableScrollHeight = $('>DIV',fixturesObj).height();
    var fixtureListCentrePoint = fixturesObj.height()/2;
    var activeMatchesObj = [];
    var middleActiveMatch;
    var centralMatchObj;
    var positionFromTopOfFixtures;
    var centralPosition;
    var centralMatchIndex;    
    var centralizeOffsetPosition = 0;
    
    $('.match',fixturesObj).each(function(index){
      if($(this).hasClass('active')){
        activeMatchesObj.push(index);
      }
    });
        
    if(activeMatchesObj.length > 1){
      // Handle even numbers of active matches differently to odd numbers of active matches
      if(activeMatchesObj.length%2 == 0){
        centralMatchIndex = activeMatchesObj[activeMatchesObj.length/2]-1;
        centralMatchObj = $('.match:eq(' + centralMatchIndex + ')',fixturesObj);
        positionFromTopOfFixtures = Math.floor(centralMatchObj.offset().top - fixturesObj.offset().top);
        positionFromTopOfFixtures += centralMatchObj.outerHeight();
      }
      else{
        centralPosition = Math.ceil(activeMatchesObj.length/2);
        centralMatchIndex = activeMatchesObj[centralPosition]-1;
        centralMatchObj = $('.match:eq(' + centralMatchIndex + ')',fixturesObj);    
        positionFromTopOfFixtures = Math.floor(centralMatchObj.offset().top - fixturesObj.offset().top);
        positionFromTopOfFixtures += centralMatchObj.outerHeight()/2;
      }
    }
    else{
      centralMatchObj = $('.match:eq(' + activeMatchesObj[0] + ')',fixturesObj);
      positionFromTopOfFixtures = Math.floor(centralMatchObj.offset().top - fixturesObj.offset().top);
      positionFromTopOfFixtures += centralMatchObj.outerHeight()/2;             
    }
    
    $.logEvent('[premierLeague.fixtures.centralizeMatcheFluid]: positionFromTopOfFixtures: ' + positionFromTopOfFixtures);
    
    // Calculate the centralized offset position to send iScroll to
    if(availableScrollHeight > (positionFromTopOfFixtures + fixtureListCentrePoint)){
      centralizeOffsetPosition = positionFromTopOfFixtures - fixtureListCentrePoint;
    }
    else{
      // Retrieve the offset of the last active match
      var lastMatchObj = $('.match:last',fixturesObj);
      var lastMatchOffset = (lastMatchObj.offset().top + lastMatchObj.outerHeight()) - fixturesObj.offset().top;
      centralizeOffsetPosition = lastMatchOffset - fixturesObj.height();
    }
    
    // Invert the scroll offset, so the scroller animates negatively (upwards out of view), to centralize the scroller correctly
    centralizeOffsetPosition = Math.abs(centralizeOffsetPosition)*-1;
    
    $.logEvent('[premierLeague.fixtures.centralizeMatchesFluid]: centralizeOffsetPosition: ' + centralizeOffsetPosition);
    
    // Scroll the scrollable internal DOM element to the centre of the active matches
    // Only centralize the match if a negative centralize offset is found
    if(centralizeOffsetPosition < 0){
      configuration.iScrollObj.scrollTo(0,centralizeOffsetPosition,configuration.timings.animateToCentre);
      // Possible easing equations: quadratic || circular || back || bounce || elastic
    }
  } 
  
  /**
  * Expand the carousel
  * @method expandCarousel
  */
  function expandCarousel(){
    $.logEvent('[premierLeague.fixtures.expandCarousel]');
  
    // Open the selected group, to the required height
    $('.fluid-outer')
      .css({
        height: configuration.fluidHeights.expandHeight
      })
      .show();
      
    // Attach an internal scroller if required
    if(configuration.fluidHeights.requiresScroller){
      $('#carousel .fixtures.active .outer')
        .attr({
          id: 'internal-scroller'
        })
        .css('height',configuration.fluidHeights.expandHeight - configuration.selectHeight)
        .wrapInner(
          $('<div />')
        );        
      
      configuration.iScrollObj = new IScroll('#internal-scroller',{
        click: true,
        momentum: false
      });
      
      // For mobile fixtures, centralize the matches in the best way possible
      if(configuration.centralizeOffsets.enabled){
        centralizeMatchesFluid();
      }
    }
    
    $(window).scrollTo(0,0);
  }
  
  /**
  * Calculate all necessary heights for an expanding (fluid) carousel
  * @method calculateCarouselDropdownHeights
  * @return {INTEGER} expandHeight The height to expand the overall dropdown wrapper to
  * @return {BOOLEAN} requiresScroller Whether or not an internal scroll <div> is required to contain the carousel data
  */
  function calculateCarouselDropdownHeights(){
    $.logEvent('[premierLeague.fixtures.calculateCarouselDropdownHeights]');
    
    // Calculate the height of the <select> element, since different browsers render them in slightly different ways
    configuration.selectHeight = $('#carousel SELECT').actual('outerHeight') + 10 + 10;
    
    // Calculate the dropdown heights, and assign as data attributes
    var fixturesObj;
    $('#carousel .fixtures').each(function(index){
      fixturesObj = $(this);      
      fixturesObj.attr('data-height',fixturesObj.actual('height') + configuration.selectHeight);
    });
    
    var activeGroupObj = $('#carousel .fixtures.active');
    var activeGroupIndex = $('#carousel .fixtures').index(activeGroupObj);      
    var activeGroupHeight = parseInt($('#carousel .fixtures:eq(' + activeGroupIndex + ')').attr('data-height'));
    
    // Calculate the top of the fluid-outer container <div>
    var carouselTriggerObj = $('#carousel-trigger');
    var carouselContentTop = carouselTriggerObj.offset().top + carouselTriggerObj.outerHeight();
    
    var windowHeight = window.innerHeight - 50; // 50px is the fixed footer advert
    var expandHeight;     
    var requiresScroller = false;

    // Work out whether the group to be shows exceeds the depth of the available space
    if(windowHeight >= (carouselContentTop + activeGroupHeight)){
      // Window is high enough to receive the expanded group, without internal scroller
      expandHeight = activeGroupHeight;
    }
    else{
      // Window is not high enough, and therefore requires an internal scroller
      expandHeight = windowHeight - carouselContentTop;
      requiresScroller = true;
    }
        
    return {
      expandHeight: expandHeight,
      requiresScroller: requiresScroller
    }
  }
  
  /**
  * Remove the internal scroller
  * @method removeInternalScroller
  */
  function removeInternalScroller(){
    $.logEvent('[premierLeague.fixtures.removeInternalScroller]');

    $('#carousel')
      .find('.fluid-outer')
        .removeAttr('style')
      .end()
      .find('#internal-scroller')
        .removeAttr('id')
        .removeAttr('style')
        .find('.inner')
          .unwrap();
  }
  
  /** 
  * If local storage is supported, ensure that the necessary default storage is saved
  * @method localStorageInit
  */
  function localStorageInit(){
    if(premierLeague.configuration.deviceType === 'fixed'){
      // Check local storage to see if the necessary data is stored, relating to the current page type
      configuration.localStorageObj = $.localStorage;
    }
  }
  
  /** 
  * Auto show the previous selection from the user (fixed layout only)
  * @method restoreLastSelection
  */
  function restoreLastSelection(){
    $.logEvent('[premierLeague.fixtures.restoreLastSelection]');
    
    if(premierLeague.configuration.deviceType === 'fixed'){
      $('#carousel>UL LI A[data-group=' + premierLeague.fixtures.configuration.selectedGroup + ']').triggerHandler('click');
    }
  }
  
  /**
  * Unload the fixtures
  * @method unload
  */
  function unload(){
    $.logEvent('[premierLeague.fixtures.unload]');
    
    // Perform fluid-specific reset operations
    if(premierLeague.configuration.deviceType === 'fluid'){
      $('#carousel SELECT').prop('selectedIndex',0);      
    }
    else{
      $('#carousel UL LI:first')
        .attr('class','active')
        .siblings()
          .removeAttr('class');
    }
    
    // Remove any expanded states for the fluid treatment
    $('#carousel-trigger').removeAttr('class');
    
    // Remove the internal scroller
    removeInternalScroller();
      
    // Reset the fixtures back to its initial load state
    $('.fixtures').fixtures('reset');
  }
  
  /**
  * Process the Pusher real-time update
  * @method websocketCallback
  * @param {OBJECT} data A JSON update from Pusher
  */  
  function websocketCallback(obj){
    $.logEvent('[premierLeague.fixtures.websocketCallback]: ' + $.logJSONObj(obj));
    
    var updatedMatchObj;
    var matchIds = [];
    
    // Capture any errors should the content for the Fixtures not be correct
    try {
      // Iterate through the In Summary JSON, and update the corresponding match
      $.each(obj.data.fixtures.content,function(index,dataObj){
        matchIds.push(this.id);
        updatedMatchObj = $('#carousel .match[data-fixture-id=' + matchIds[index] + ']');
        
        // Add the active class if it is supplied in the JSON
        if(this.active && !updatedMatchObj.hasClass('active')){
          updatedMatchObj.addClass('active');
        }
        else if(!this.active && updatedMatchObj.hasClass('active')){
          updatedMatchObj.removeClass('active');
        }
        
        // Update the textual status of the match
        $('THEAD TH',updatedMatchObj).text(this.status);
        
        // There are 3 different types of update which can occur within the fixtures carousel:
        // 1. The textual status of the match can change eg: First half, Half time, Second half, Full time
        // 2. There can be a key incident eg: Goal, Red card, Sub
        // 3. There has been a change to the matches score      
        if(this.hasOwnProperty('eventType')){
          // Add an overlay to the current match to show the key incident
          updatedMatchObj
            .addClass('event-update ' + this.eventType)
            .append(
              $('<div />')
                .append(
                  $('<p />')
                    .text(this.eventType.replace(/-/g,' '))
                  )
                .attr('class','event')
            );            
            
          var eventUpdateObj = $('P',updatedMatchObj);
              
          // Fade the event overlay into view
          eventUpdateObj.fadeIn(configuration.updates.fadeInOut,function(){
            // At the point where the event is fully visible, initiate the blink effect of the inner text
            eventUpdateObj
              .blink({
                maxBlinks: configuration.updates.blinks, 
                blinkPeriod: configuration.updates.blinkPeriod, 
                onMaxBlinks: function(){          
                  // Restore the team names behind the event text
                  updatedMatchObj
                    .removeClass('goal yellow-card red-card')
                    .find('.event')
                      .fadeOut(configuration.updates.fadeInOut,function(){
                        $(this).remove();
                        updatedMatchObj.removeClass('event-update');
                      });
                }
              });
          });
        }
                
        // Match scores can change in addition to event types (key incidents)
        if(this.hasOwnProperty('homeTeam')){
          $('TBODY TR:first TD',updatedMatchObj).text(this.homeTeam.score);
        }
        
        if(this.hasOwnProperty('awayTeam')){
          $('TBODY TR:last TD',updatedMatchObj)
            .text(this.awayTeam.score)
            .append(
              $('<a />')
                .attr('href',this.url)
                .text('(click here to view the match details)')
            )
        }

        // Process penalty shootouts
        if(this.hasOwnProperty('period')){
          var penaltiesInMatch = false;
          if(this.homeTeam.penaltyShots.length > 0 && this.awayTeam.penaltyShots.length > 0){
            penaltiesInMatch = true;
          }
            
          if(this.period === 'ShootOut' || penaltiesInMatch){
            // Remove any previous winning star indicators
            $('SPAN:contains(*)',updatedMatchObj).remove();
          
            // Add penalty details to the active match
            attachPenaltiesToMatch({
              homeTeamPenalties: this.homeTeam.penaltyShots,
              awayTeamPenalties: this.awayTeam.penaltyShots,
              matchObj: updatedMatchObj
            });
            
            // Show penalty shootout winner
            if(this.hasOwnProperty('finished')){
              if(this.finished){
                showPenaltyShootoutWinner({
                  homeTeamPenalties: this.homeTeam.penaltyShots,
                  awayTeamPenalties: this.awayTeam.penaltyShots,
                  matchObj: updatedMatchObj
                });
              }
            }
          }
        }
      });
    }
    catch(err){
      $.logEvent('[premierLeague.fixtures.websocketCallback]: an error occured populating the Fixtures component (via Pusher): ' + $.logJSONObj(err));
    }
  }
    
  return {
    build: build,
    calculateCarouselDropdownHeights: calculateCarouselDropdownHeights,
    configuration: configuration,
    fluidInit: fluidInit,
    localStorageInit: localStorageInit,
    restoreLastSelection: restoreLastSelection,
    showHideCarousel: showHideCarousel,
    unload: unload,
    websocketCallback: websocketCallback
  }
}()); 