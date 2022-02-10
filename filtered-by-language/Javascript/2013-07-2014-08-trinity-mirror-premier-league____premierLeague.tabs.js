/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.tabs = (function(){
  var configuration = {
    containerObj: $('#tabs'),
    headings: [],
    inViewMonitorEnabled: false,
    matchReportBeingViewed: false,
    toggleArrowHeight: 14
  };
  
  /** 
  * Build the tabs
  * @method init
  */
  function build(){
    $.logEvent('[premierLeague.tabs.build]');

    // Allow pre-renderer to reset initial HTML markup
    if(premierLeague.configuration.resetOnInit){
      premierLeague.core.resetComponent({
        componentObj: configuration.containerObj
      });
    }
    
    var totalTabs = premierLeague.configuration.initialSiteContent.tabs.content.length;
    var lazyLoadTabContents;
    
    $.each(premierLeague.configuration.initialSiteContent.tabs.content,function(index,tabObj){
      // Store references to the headings (for site switch capabilities)
      var headingsObj = {
        active: index === 0 ? true : false,
        paginate: tabObj.paginate,
        title: tabObj.title
      };
      
      configuration.headings.push(headingsObj);
    
      lazyLoadTabContents = false;
      
      var totalVisibleItems = tabObj.paginate.enabled ? tabObj.paginate.itemsPerPage : tabObj.contentTypes.length;
      if(tabObj.contentTypes.length < tabObj.paginate.itemsPerPage){
        totalVisibleItems = tabObj.contentTypes.length;
      }

      // Execute Match Report content as lazyloaded content
      if(premierLeague.core.lowerCaseWithDashes(tabObj.title) === 'match-report'){
        lazyLoadTabContents = true;
        headingsObj.contentIndexStorage = index;
        headingsObj.lazyLoadTabContents = lazyLoadTabContents;        
      }
            
      configuration.containerObj
        .append(
          $('<h3 />')
            .attr('class','contracted')
            .html(tabObj.title + '&nbsp;')
            .append(
              $('<a />')
                .attr({                 
                  'data-hash-url': premierLeague.core.lowerCaseWithDashes(tabObj.title),
                  href: '#'
                })
                .IF(lazyLoadTabContents)
                  .attr({
                    'data-content-index-storage': index,
                    'data-lazy-load-tab-contents': true
                  })
                .ENDIF()
                .text('Click here to expand group')
            )
        )
        .append(
          $('<div />')
            .IF(lazyLoadTabContents)
              .append(
                $('<div />').attr('class','outer')
              )
            .ELSE()
              .append(function(){
                var outerObj = $('<div />')
                  .attr('class','outer');               
                                
                for(var i=0; i<=totalVisibleItems-1; i++){
                  // Append a content type to an owning DOM element
                  outerObj.appendContentTypeObject({
                    contentTypeObj: tabObj.contentTypes[i]
                  });             
                }
                              
                return outerObj;
              })
            .ENDIF()
            .attr('class','tab-content')
            .IF(tabObj.paginate.enabled)
              .attr({
                'data-items-per-page': totalVisibleItems,
                'data-items-total': tabObj.contentTypes.length,
                'data-items-visible': totalVisibleItems
              })
            .ENDIF()
        )
        
      // Add the Load More button (if pagination is enabled), should the total items in the feed not match the total number of stored items
      if(tabObj.paginate.enabled){
        $('.tab-content:eq(' + index + ')',configuration.containerObj).tabs('attachLoadMoreItems');
      }
    });
    
    // Because the DOM injection creates tags in a linear format, this needs to be re-formatted if the site is running in 'fixed' mode
    if(premierLeague.configuration.deviceType === 'fixed' && premierLeague.configuration.pageType !== 'fixture'){
      // Refresh the layout of the tabs
      refresh();
    }
    
    // Match Centre is forced to have side-by-side tab triggers, even for fluid layout
    if(premierLeague.configuration.pageType === 'fixture'){
      // Convert the tabs from fluid to fixed
      convertToFixedFormat();
    }
    
    // Initialize event handlers (for both fluid and fixed rendering)
    eventHandlersInit();
    
    // Far Match Centre, auto-show either the Live or Match Report tab, depending on the URL
    if(premierLeague.configuration.pageType === 'fixture'){
      var activeTabIndex = top.location.href.indexOf('matchcentre-report') != -1 ? 1 : 0;

      $('#tabs .tab-triggers>LI:eq(' + activeTabIndex + ') A').click(); // Fixed
      $('#tabs>H3:eq(' + activeTabIndex + ')').click(); // Fluid
    }
        
    // Notify the main site dispatcher that the footer bar has finished initializing
    premierLeague.dispatcher.initializeComplete({finishedId: 'tabs'});
  }
  
  /**
  * Initialize event handlers (for both fluid and fixed rendering)
  * @method eventHandlersInit
  */
  function eventHandlersInit(){
    $.logEvent('[premierLeague.tabs.eventHandlersInit]');
    
    var selfObj;
    var linkObj;
    var selectedIndex;
    var activeTabGroupObj;
    
    // Fixed layout
    configuration.containerObj
      .on('click','.tab-triggers LI A',function(e){
        e.preventDefault(); 
        
        selfObj = $(this);
        linkObj = selfObj.parent();     
        selectedIndex = $('.tab-triggers LI',configuration.containerObj).index(linkObj);
        activeTabGroupObj = $('.tab-content:eq(' + selectedIndex + ')',configuration.containerObj);
        
        $('.tab-triggers LI:eq(' + selectedIndex + ')',configuration.containerObj)
          .addClass('active')
          .siblings()
            .removeClass('active');
        
        // Check to see whether content needs to be loaded in, on request, for the selected tab
        selfObj.tabs('lazyLoadTabContents');
        
        $('.tab-content:eq(' + selectedIndex + ')',configuration.containerObj)
          .show()
          .siblings('.tab-content')
            .hide();
        
        // Work out whether the tab being shows includes pie charts. If it does, they need to be re-validated
        if(activeTabGroupObj.find('.statistics').length > 0){
          // Unload all pie chart instances, as the rendering of them in fluid vs fixed is different
          premierLeague.pieChart.unload();
        }
        
        // Work out whether the tab being shows includes escenic charts. If it does, they need to be re-validated
        if(activeTabGroupObj.find('.escenic-chart').length > 0){
          // Unload all escenic chart instances, as the rendering of them in fluid vs fixed is different
          premierLeague.escenicCharts.unload();
        }
        
        // Update the active property within the globally stored reference of headings
        $.each(configuration.headings,function(index){
          this.active = index === selectedIndex ? true : false;
        });
                
        // Append the hash value to the window location (without refreshing)
        updateHash({
          hash: $(this).attr('data-hash-url')
        });
      }).on('click','>H3',function(e,eventData){
        e.preventDefault();
                
        linkObj = $(this);
        selectedIndex = $('>H3',configuration.containerObj).index(linkObj);       
        activeTabGroupObj = $('.tab-content:eq(' + selectedIndex + ')',configuration.containerObj);
        
        $('>H3:eq(' + selectedIndex + ')',configuration.containerObj)
          .attr('class','expanded')
          .siblings('H3')
            .attr('class','contracted');
        
        $('.tab-content:eq(' + selectedIndex + ')',configuration.containerObj)
          .show()
          .siblings('.tab-content')
            .hide();
            
        // Regardless of the device type, refresh the central position of the toggle arrows contained with tab blocks
        $('.hub-teaser .container').appendContentTypeObject('centralizeToggleArrow');
        $('.opinion-teaser .container').appendContentTypeObject('centralizeToggleArrow');
            
        // Work out whether the tab being shows includes pie charts. If it does, they need to be re-validated
        if(activeTabGroupObj.find('.statistics').length > 0){
          // Unload all pie chart instances, as the rendering of them in fluid vs fixed is different
          premierLeague.pieChart.unload();
        }
        
        // Work out whether the tab being shows includes escenic charts. If it does, they need to be re-validated
        if(activeTabGroupObj.find('.escenic-chart').length > 0){
          // Unload all escenic chart instances, as the rendering of them in fluid vs fixed is different
          premierLeague.escenicCharts.unload();
        }

        // Update the active property within the globally stored reference of headings
        $.each(configuration.headings,function(index){
          this.active = index === selectedIndex ? true : false;
        });

        // Run logic only if not the initial page load
        if(eventData === undefined){          
          // Scroll the window to the top of the clicked tab heading
          var offsetTop = Math.round(linkObj.offset().top);
          $.scrollTo(offsetTop);
        
          // Append the hash value to the window location (without refreshing)
          updateHash({
            hash: $('A',this).attr('data-hash-url')
          }); 
        }       
      });
      
    // Initialize functionality to work out whether adverts and articles are in view or not
    inViewInit();
      
    if(window.location.hash === '' && premierLeague.configuration.pageType !== 'fixture'){
      $('.tab-triggers LI A:eq(0)',configuration.containerObj).click();
      $('>H3:eq(0)',configuration.containerObj).trigger('click',{initialLoad: true});
    }
  }
    
  /**
  * Convert the tabs from fluid to fixed
  * @method convertToFixedFormat
  */
  function convertToFixedFormat(){
    $.logEvent('[premierLeague.tabs.convertToFixedFormat]');
    
    // Remove the headings
    $('>H3',configuration.containerObj).remove();
    
    var tabTriggersObj = $('<ul />').attr('class','tab-triggers');
    var activeHeading;
    
    // Create the tab triggers
    for(var i=0; i<=configuration.headings.length-1; i++){
      activeHeading = configuration.headings[i];
      
      tabTriggersObj
        .append(
          $('<li />')
            .IF(activeHeading.active)
              .attr('class','active')
            .ENDIF()
            .append(
              $('<a />')
                .attr({
                  'data-content-index-storage': activeHeading.contentIndexStorage,
                  'data-hash-url': premierLeague.core.lowerCaseWithDashes(activeHeading.title),
                  'data-lazy-load-tab-contents': activeHeading.lazyLoadTabContents,
                  href: '#'
                })
                .text(activeHeading.title)
            )
        )
    }
    
    // Add the tab triggers to the tabs wrapper DOM object
    tabTriggersObj
      .prependTo(configuration.containerObj);
  }
  
  /**
  * Convert the tabs from fixed to fluid
  * @method convertToFluidFormat
  */
  function convertToFluidFormat(){
    $.logEvent('[premierLeague.tabs.convertToFluidFormat]');
    
    // Remove the tab triggers
    $('>.tab-triggers',configuration.containerObj).remove();
    
    var activeHeading;
    
    // Create the <h3> headings
    for(var i=0; i<=configuration.headings.length-1; i++){
      activeHeading = configuration.headings[i];
      
      $('<h3 />')
        .IF(activeHeading.active)
          .attr('class','expanded')
        .ENDIF()
        .html(activeHeading.title + '&nbsp;')
        .append(
          $('<a />')
            .attr({
              'data-content-index-storage': activeHeading.contentIndexStorage,
              'data-hash-url': premierLeague.core.lowerCaseWithDashes(activeHeading.title),
              'data-lazy-load-tab-contents': activeHeading.lazyLoadTabContents,
              href: '#'
            })
            .text('Click here to expand group')
        )
        .insertBefore($('>.tab-content:eq(' + i + ')',configuration.containerObj))
    }
  }
  
  /**
  * Refresh the layout of the tabs
  * @method refresh
  */
  function refresh(){
    $.logEvent('[premierLeague.tabs.refresh]: switch to ' + premierLeague.configuration.deviceType);
    
    // Match Centre is forced to have side-by-side tab triggers, even for fluid layout
    if(premierLeague.configuration.pageType === 'fixture'){
      return;
    }
    
    switch(premierLeague.configuration.deviceType){
      case 'fluid':
        // Convert the tabs from fixed to fluid
        convertToFluidFormat();
        break;
      case 'fixed':
        // Convert the tabs from fluid to fixed
        convertToFixedFormat();
        break;
    }
    
    // Regardless of the device type, refresh the central position of the toggle arrows contained with tab blocks
    $('.hub-teaser .container').appendContentTypeObject('centralizeToggleArrow');
    $('.opinion-teaser .container').appendContentTypeObject('centralizeToggleArrow');
  }

  /**
  * Append the hash value to the window location (without refreshing)
  * @method updateHash
  * @param {OBJECT] hash The hash value of the selected/active tab
  */
  function updateHash(obj){
    // If the Match Report tab has been selected, set the necessary configuration properties
    if(obj.hash === 'match-report'){
      // Calculate offsets for adverts and articles within Match Report
      calculateMatchCentreOffsets();

      configuration.matchReportBeingViewed = true;
      
      // Update the bounds of what's in view
      premierLeague.core.updateScrollYAxisBounds({
        applyUrlChange: false
      });
    }
    else{
      configuration.matchReportBeingViewed = false;
    }
    
    // Do not apply has URLs to tab switching for the Match Centre page, since the active tab is derived from the construct of the pages URL
    if(premierLeague.configuration.pageType === 'fixture'){
      return;
    }
    
    $.logEvent('[premierLeague.tabs.updateHash]: ' + $.logJSONObj(obj));
    
    // Change the URL to reflect a tab change
    window.location.hash = obj.hash;
  }
    
  /**
  * Initialize functionality to work out whether adverts and articles are in view or not
  * @method inViewInit
  */
  function inViewInit(){
    $.logEvent('[premierLeague.tabs.inViewInit]');
    
    // Calculate offsets for adverts and articles within Match Report
    calculateMatchCentreOffsets();
    
    // Build the debug monitor
    if(configuration.inViewMonitorEnabled && premierLeague.configuration.pageType === 'fixture'){
      $('#wrapper')
        .prepend(
          $('<div />')
            .append(
              $('<h4 />')
                .append(
                  $('<span />')
                    .attr('class','top')
                    .text('Top = 0px')
                )
                .append(
                  $('<span />')
                    .attr('class','bottom')
                    .text('Bottom = 0px')
                )
            )
            .append(
              $('<div />')
                .append(function(){
                  var ulObj = $('<ul />').attr('class','inview-articles');
                  var articleObj;
                  
                  $('#match-report').find('.article').each(function(){
                    articleObj = $(this);
                    
                    ulObj
                      .append(
                        $('<li />')
                          .attr('id','monitor-' + articleObj.attr('id'))
                          .text($('>H3',articleObj).text())
                          .prepend(
                            $('<strong />')
                              .text('In view?')
                          )
                      )
                  });
                  
                  return ulObj;
                })
                .append(function(){
                  var ulObj = $('<ul />').attr('class','inview-adverts');
                  var advertObj;
                  
                  $('#match-report').find('.advert').each(function(){
                    advertObj = $(this);
                    
                    ulObj
                      .append(
                        $('<li />')
                          .attr('id','monitor-' + advertObj.attr('id'))
                          .text($('.inner',advertObj).text())
                          .prepend(
                            $('<strong />')
                              .text('Initialized?')
                          )
                      )
                  });
                  
                  return ulObj;
                })
            )
            .append(
              $('<em />')
                .text('( ... ) = article pixels in view')
            )
            .append(
              $('<h4 />')
                .text('Article most in view:')
            )
            .append(
              $('<h5 />')
                .text('N/a')
            )
            .attr('id','inview-monitor')
        );
    }
  }
  
  /**
  * Set the offsets for all Match Report advert slots
  * @method calculateAdvertOffsets
  */
  function calculateAdvertOffsets(){
    $.logEvent('[premierLeague.tabs.calculateAdvertOffsets]');
    
    var advertObj;
    
    $('#match-report .side-bar .advert').each(function(){
      advertObj = $(this);
      advertObj.attr('data-top-offset',Math.round(advertObj.offset().top));
    });
  }
  
  /**
  * Set the offsets for all Match Report articles
  * @method calculateArticleOffsets
  */
  function calculateArticleOffsets(){
    $.logEvent('[premierLeague.tabs.calculateArticleOffsets]');
    
    var articleObj;
    
    $('#match-report .article').each(function(){
      articleObj = $(this);
      articleObj.attr({
        'data-top-offset': Math.round(articleObj.offset().top),
        'data-bottom-offset': Math.round(articleObj.offset().top) + articleObj.height(),
      });
    });
  }
  
  /**
  * Calculate offsets for adverts and articles within Match Report
  * @method calculateMatchCentreOffsets
  */
  function calculateMatchCentreOffsets(){
    $.logEvent('[premierLeague.tabs.calculateMatchCentreOffsets]');
    
    // Set the offsets for all Match Report advert slots
    calculateAdvertOffsets();
    
    // Set the offsets for all Match Report articles
    calculateArticleOffsets();
  }
  
  /**
  * If the URL contains a hash when loading, trigger the event attached to that hash value
  * @method processHash
  */
  function processHash(){
    $.logEvent('[premierLeague.tabs.processHash]');
    
    if(window.location.hash !== ''){
      $('A[data-hash-url=' + window.location.hash.replace(/#/,'') + ']').click();
    }
  }
  
  return {
    build: build,
    calculateMatchCentreOffsets: calculateMatchCentreOffsets,
    configuration: configuration,
    inViewInit: inViewInit,
    processHash: processHash,
    refresh: refresh
  }
}());