/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};
premierLeague.configuration = {
  adverts: {
    pageSlotName: null
  },
  articleId: null,
  baseURL: null,
  chartColors: ['#cd3528','#d56c2c','#d8a53e','#579741','#2a85d9','#fac08f','#92cddc','#b2a1c7','#c3d69b','#d99694','#95b3d7','#548dd4','#938953','#3f3f3f','#bfbfbf'],
  colors: {
    green: '#009c33'
  },
  debugLogging: false,
  deviceType: null,
  domWidgets: {
    enabled: false,
    handleBarsRootPathSuffix: '/../template/handlebars/widgets',
    jsPathSuffix: '/js',
    jsVersion: '1400743983',
    rootPath: 'http://s.mirror.co.uk/resources',
    skinUrl: 'http://s.mirror.co.uk/skins/mirror/',
    sharedUrl: 'http://s.mirror.co.uk/skins/shared/'
  },  
  eventType: null,
  expando: {
    easing: 'easeInOutExpo',
    negativeTopOffset: 5,
    timings: {
      animateToTop: 1
    }
  },
  fixtureId: null,
  fluid: {
    deviceHeight: null
  },
  initialSiteContent: {},
  isTemplatePage: false,
  jsonFeeds: {
    global: ['hub'],
    local: ['matchCentre','article']
  },
  loadSequence: [],
  localJSONUrl: null,
  locked: false,
  pageId: null,
  pageType: null,
  pieCharts: {},
  pushStateEnabled: false,
  resetOnInit: true,
  runLocalDataFeeds: false,
  scrollYAxisBounds: null,
  showSiteSwitcher: false,
  siteInitialized: false,
  supportsLocalStorage: false,
  timings: {
    debounceDelay: 1000,
    expandoLoadDelay: 1500,
    fadeOutSiteLoader: 500,
  },
  urls: { 
    live: {
      initialSiteContent: 'TBC'
    },
    local: {
      pusherSimulation: '/assets/shared/pusher/simulation.php',
      pusher2ndSimulation: '/assets/shared/pusher/simulation-2nd-events.php',
      pusher3rdSimulation: '/assets/shared/pusher/simulation-3rd-events.php'
    }
  }
};

premierLeague.core = (function(){
  /** 
  * Initialize premierLeague
  * @method init
  * @param {STRING} articleId The unique id of the article (article page only)
  * @param {OBJECT} baseUrls The fully qualified base Urls (both local and live)
  * @param {BOOLEAN} debugLogging Whether debug logging is enabled or not
  * @param {STRING} initiallySelectedGroup Which group to auto view within the Live Group Standings component (fixtures page only)
  * @param {BOOLEAN} isTemplatePage All template/prototype pages should have websockets disabled by default
  * @param {STRING} localJSONUrl Component files need local JSON files to work correctly
  * @param {INTEGER} pageId The unique id of the article || fixture || team || player
  * @param {STRING} pageType The template type
  * @param {BOOLEAN} runLocalDataFeeds Whether local JSON files should be used for the feed updates 
  */  
  function init(obj){   
    // Enable debug logging if provided as part of initialization
    if(obj.debugLogging || premierLeague.configuration.debugLogging){
      premierLeague.configuration.debugLogging = true;
            
      // DOM inject the debug logger
      createDebugLogger();
    }
    
    $.logEvent('[premierLeague.core.init]: ' + $.logJSONObj(obj));
    
    premierLeague.configuration.eventType = premierLeague.configuration.deviceType === 'fixed' ? 'click' : 'touchstart';
    
    // Define and disable websockets (for prototype component pages)
    if(obj.isTemplatePage){
      $.extend(premierLeague,{
        websockets: {
          configuration: {
            enabled: false
          }
        }
      });
    }
    
    if(obj.hasOwnProperty('localJSONUrl')){
      premierLeague.configuration.localJSONUrl = obj.localJSONUrl;
    }
    
    // Run any fluid-specific tasks every time the site is unloaded
    fluidSiteInit();
    
    // Build the site switcher
    if(premierLeague.configuration.showSiteSwitcher){
      siteSwitchInit();
    }
    
    // Override the necessity to load site data via local JSON files, if an override has been provided
    premierLeague.configuration.runLocalDataFeeds = obj.runLocalDataFeeds;
    
    // Provide a CSS override for when running localdata
    if(premierLeague.configuration.runLocalDataFeeds){
      $('BODY').addClass('localdata');
    }
    
    // If the site is running as 'live', always enable websockets, domWidgets and tracking, regardless of how they've been configured
    if(!premierLeague.configuration.runLocalDataFeeds){
      premierLeague.websockets.configuration.enabled = true;
      premierLeague.configuration.domWidgets.enabled = true;
      premierLeague.omniture.configuration.trackingEnabled = true;
      premierLeague.configuration.pushStateEnabled = true;
    }
    
    // Update the global site configuration, taking values as specified within the HTML source-code
    premierLeague.configuration.articleId = obj.articleId;
    premierLeague.configuration.baseUrl = premierLeague.configuration.runLocalDataFeeds ? obj.baseUrls.local : obj.baseUrls.live;
    premierLeague.configuration.adverts.pageSlotName = obj.adverts.pageSlotName;
    
    if(obj.hasOwnProperty('pageId')){
      premierLeague.configuration.pageId = obj.pageId;
    }
    
    premierLeague.configuration.pageType = obj.pageType;
    
    if(obj.pageType === 'fixture'){
      premierLeague.leagueTable.configuration.initiallySelectedGroup = obj.initiallySelectedGroup.toUpperCase().replace(/GROUP /,'');
      premierLeague.configuration.fixtureId = obj.pageId; 
    }
    
    // Handle tablet devices showing the fixed grid layout, in order to scale it to the devices resolution        
    if(premierLeague.configuration.deviceType === 'fixed'){
      var viewportObj = document.getElementById('viewport');
      viewportObj.setAttribute('content','width=' + 1350);  
    }
    
    try {
      // Check to see whether local storage is available within the current browser
      if(supportsLocalStorage()){
        premierLeague.configuration.supportsLocalStorage = true;

        // If local storage is supported, define storage key names for subsequent usage
        premierLeague.dropdownBar.localStorageInit();
        // premierLeague.fixtures.localStorageInit();
      }
    }
    catch(err){
      $.logEvent('[premierLeague.core.init]: an error occured requesting data from local storage');
    }
    
    // Initialize tracking events, without handlers associated by default
    premierLeague.omniture.trackingEventsInit();
    
    // Pull initial site content from the API || local file system
    pullInitialSiteContent();
  };
  
  /**
  * Pull initial site content from the API || local file system
  * @method pullInitialSiteContent
  */
  function pullInitialSiteContent(){
    $.logEvent('[premierLeague.core.pullInitialSiteContent]: local or live data? ' + (premierLeague.configuration.runLocalDataFeeds ? 'local' : 'live'));
        
    var jsonUrl = premierLeague.configuration.baseUrl + premierLeague.configuration.pageType;
    
    if(premierLeague.configuration.pageId !== null){
      jsonUrl += '/' + premierLeague.configuration.pageId;
    }
    
    if(premierLeague.configuration.runLocalDataFeeds){
      jsonUrl += '/pageLoad.json';
    }
    
    // Allow for components specifying their own local JSON file
    if(premierLeague.configuration.localJSONUrl !== null){
      jsonUrl = premierLeague.configuration.localJSONUrl;
    }
        
    $.ajax({
      dataType: 'json',
      success: function(data){
        // Store namespaced references to retrieved data, whilst the dispatcher executes
        premierLeague.configuration.initialSiteContent = data.premierLeague;
        
        // Initialize all site-wide functionality which doesn't need to be bound to load sequences, since their initialization doesn't involve JSON data/content
        globalComponentsInit();
        
        
        // Work out what the sequence loader should be, and work through the dispatcher to load the necessary components sequentially
        var loadSequenceOutput = '';
        $.each(premierLeague.configuration.initialSiteContent,function(componentName,dataObj){
          if(componentName !== 'configuration'){
            premierLeague.configuration.loadSequence.push({
              id: componentName,
              initialized: false
            });
          
            loadSequenceOutput += ',' + componentName;
          }
        });
        
        loadSequenceOutput = loadSequenceOutput.substr(1,loadSequenceOutput.length-1);
        
        $.logEvent('[premierLeague.core.pullInitialSiteContent]: loadSequence created as: ' + loadSequenceOutput);
                
        // Only a single connection is required to Pusher, which can then have multiple subscriptions attached to it
        // Always open the connection, regardless of whether websockets are enabled or not. This will enable channels to be dynamically subscribed/unsubscribed, knowing that the connection object is always going to be open
        if(premierLeague.websockets.configuration.enabled){
          premierLeague.websockets.connectToPusher();
        }
        
        // Once the load sequence has been defined, initialize the dispatcher, to sequentially execute all DOM injection (provided there are >0 components to initialize)
        if(premierLeague.configuration.loadSequence.length > 0){
          premierLeague.dispatcher.moduleInitialize({
            id: premierLeague.configuration.loadSequence[0].id
          });
        }
        else{
          premierLeague.dispatcher.dispatcherComplete();
        }
      },
      type: 'get',
      url: jsonUrl
    });
  } 
  
  /**
  * Initialize all site-wide functionality which doesn't need to be bound to load sequences, since their initialization doesn't involve JSON data/content
  * @method globalComponentsInit
  */
  function globalComponentsInit(){
    $.logEvent('[premierLeague.core.globalComponentsInit]');
    
    // Initialize the header
    premierLeague.header.init();
  }
    
  /**
  * All functionality to load once the correct CSS and JavaScript has been attached to the DOM (via adaptJS)
  * @method postCSSLoadInit
  */
  function postCSSLoadInit(){
    $.logEvent('[premierLeague.core.postCSSLoadInit]');
    
    // Load a library which adds full CSS3 support to the browser for IE8
    attachCSS3SupportForIE();
  }
  
  /**
  * Load a library which adds full CSS3 support to the browser for IE8
  * @method attachCSS3SupportForIE
  */
  function attachCSS3SupportForIE(){
    $.logEvent('[premierLeague.core.attachCSS3SupportForIE]');
    
    // Re-attach the selectivizr plugin to the DOM (IE8 and lower) upon each opening of the footer
    if(document.addEventListener === undefined){
      $('#selectivizr').remove();
      
      $('<script />')
        .attr({
          id: 'selectivizr',
          src: '/assets/shared/scripts/selectivizr-min.js'
        })
        .appendTo($('HEAD'))
    }
  }

  /**
  * Build the site switcher
  * @method siteSwitchInit
  */
  function siteSwitchInit(){
    $.logEvent('[premierLeague.core.siteSwitchInit]');
    
    $('<ul />')
      .append(
        $('<li />')
          .append(
            $('<a />')
              .attr('href','#')
              .text('Fixed')
          )
          .attr('id','switch-fixed')
          .IF(premierLeague.configuration.deviceType === 'fixed')
            .attr('class','active')
          .ENDIF()
      )
      .append(
        $('<li />')
          .append(
            $('<a />')
              .attr('href','#')
              .text('Fluid')
          )
          .attr('id','switch-fluid')
          .IF(premierLeague.configuration.deviceType === 'fluid')
            .attr('class','active')
          .ENDIF()
      )
      .attr('id','site-switch')
      .prependTo($('BODY'))
      
    // Assign the event handlers, to change the BODY id attribute, which will toggle the CSS styles, and alter the bubbling for event delegation
    $('#site-switch A').on('click',function(e){
      e.preventDefault();
      
      var requestedMode = $(this).parent().attr('id').replace('switch-','');
      
      if(requestedMode === premierLeague.configuration.deviceType){
        return;
      }
      
      premierLeague.configuration.deviceType = $(this).parent().attr('id').replace('switch-','');
      $('BODY').attr('id',premierLeague.configuration.deviceType);
      
      premierLeague.configuration.eventType = premierLeague.configuration.deviceType === 'fixed' ? 'click' : 'touchstart';
      
      $(this)
        .parent()
          .attr('class','active')
        .siblings()
          .removeAttr('class')
          
      // Unload and refresh all site functionality
      unloadAndRefreshSite();
    });
  }
  
  /**
  * Unload and refresh all site functionality
  * @method unloadAndRefreshSite
  */
  function unloadAndRefreshSite(){
    $.logEvent('[premierLeague.core.unloadAndRefresh]');
    
    // Run any fluid-specific tasks every time the site is unloaded
    fluidSiteInit();
        
    if(premierLeague.configuration.pageType === 'fixture'){
      // Calculate offsets for adverts and articles within Match Report
      premierLeague.tabs.calculateMatchCentreOffsets();
    }
    
    // Unload (and re-initialize) the fixtures
    try {
      premierLeague.fixtures.unload();
      $('.fixtures').fixtures('init');      
    }
    catch(err){
      $.logEvent('[premierLeague.core.siteSwitchInit]: unable to unload and re-initialize fixtures: ' + $.logJSONObj(err)); 
    }
    
    // Unload (and refresh) the header
    try{
      premierLeague.header.unload();
    }
    catch(err){
      $.logEvent('[premierLeague.core.siteSwitchInit]: unable to unload and re-initialize header: ' + $.logJSONObj(err)); 
    }
    
    // Refresh the layout of the tabs
    try{
      premierLeague.tabs.refresh();
    }
    catch(err){
      $.logEvent('[premierLeague.core.siteSwitchInit]: unable to refresh tabs: ' + $.logJSONObj(err));  
    }
    
    // Unload all pie chart instances, as the rendering of them in fluid vs fixed is different
    try{
      premierLeague.pieChart.unload();  
    }
    catch(err){
      $.logEvent('[premierLeague.core.siteSwitchInit]: unable to unload pie charts: ' + $.logJSONObj(err)); 
    }
    
    // Unload all escenic chart instances, as the rendering of them in fluid vs fixed is different
    try{
      premierLeague.escenicCharts.unload(); 
    }
    catch(err){
      $.logEvent('[premierLeague.core.siteSwitchInit]: unable to unload escenic charts: ' + $.logJSONObj(err)); 
    }
  }
  
  /**
  * Run any fluid-specific tasks every time the site is unloaded
  * @method fluidSiteInit
  */
  function fluidSiteInit(){
    $.logEvent('[premierLeague.core.fluidSiteInit]');

    var navigationTriggerObj = $('#navigation-trigger');
    
    if(premierLeague.configuration.deviceType === 'fluid'){
      premierLeague.configuration.fluid.deviceHeight = $(window).height();
    }
  }
    
  /**
  * Initialize the handlers to process the dynamic injection of articles into either Hub or Opinion Teaser content types
  * @method articleInlineEventsInit
  */
  function articleInlineEventsInit(){
    $.logEvent('[premierLeague.core.articleInlineEventsInit]');
        
    // Retrieve the article on toggle, and inject into into the teaser content type
    $('#tabs').on('click','.hub-teaser .container,.opinion-teaser .container',function(e){
      e.preventDefault();
      
      var linkObj = $('.see-more',this);
      var teaserObj = linkObj.parents('DIV[class*=-teaser]');
      var additionalContentObj = $('.additional-content',teaserObj);
      
      // If the initial JSON is being retrieved, do not allow an additional event to be fired
      if(teaserObj.hasClass('loading')){
        return;
      }
      
      teaserObj.addClass('loading');
      
      if(linkObj.attr('data-loaded') === 'false'){
        // Send this endpoint URL in the JSON
        var articleURL = linkObj.attr('data-article-api-url');
        
        additionalContentObj.show();
        
        setTimeout(function(){
          $.ajax({
            dataType: 'json',
            success: function(dataObj){
              $.extend(dataObj.premierLeague.article,{type: 'article'});
              
              // Add an overriding property for expando MPUs, so that it always runs as a double MPU
              $.extend(dataObj.premierLeague.article.content[0].relatedContent[0],{runDoubleSize: true});
              
              // Add an overriding property for expando MPUs, so that they never auto-load
              $.extend(dataObj.premierLeague.article.content[0].relatedContent[0],{autoLoad: false});

              var promoTargeting = 1;
              
              // Add an overriding property for expando MPUs and other ads, so that they never auto-load
              dataObj.premierLeague.article.content[0].relatedContent.forEach(function(obj,i){
                $.extend(obj,{autoLoad: false});
              
                if(obj.advertType === 'promo'){
                  $.extend(obj,{targeting: {index: promoTargeting}});
                  promoTargeting = promoTargeting + 1;
                }
              });

              // Inject the Article body to the page
              additionalContentObj.appendContentTypeObject({
                contentTypeObj: dataObj.premierLeague.article
              });
              
              // Scroll the window to the top of the hub teaser
              $.scrollTo({
                left:0, 
                top: teaserObj.offset().top - premierLeague.configuration.expando.negativeTopOffset
              },{
                duration: premierLeague.configuration.expando.timings.animateToTop,
                easing: premierLeague.configuration.expando.easing,
                onAfter: function(){
                  teaserObj.removeClass('loading');
                }
              });
              
              linkObj
                .attr('data-loaded','true')
                .removeClass('loading');
              
              $('.loader',additionalContentObj).hide();
              linkObj.attr('class','see-more ' + (additionalContentObj.is(':visible') ? 'contracted' : 'expanded'));
          
              // Initialize the adverts (there are now multiple cos of the fantasy football promo) within the expanded article
              $('.advert',additionalContentObj).advert('activate');
              
              // For any galleries (photo/video) added to the DOM via Expando, initialize them
              if(premierLeague.configuration.domWidgets.enabled){               
                // DomWidgets to initialize additional functionality
                $('[data-widget="tm.video.brightcove"]',additionalContentObj).loadDomWidgets();
                $('[data-widget="tm.share.shareBar"]',additionalContentObj).loadDomWidgets();
                $('[data-widget="tm.omniture.omniLinkTracking"]',additionalContentObj).loadDomWidgets();

                $('[data-widget-loaded=false][data-widget!="tm.ad.gpt"][data-widget!="tm.ad.outbrain"]')
                  .loadDomWidgets()
                  .attr('data-widget-loaded',true);
              }
          
              var pageTitle = $('.article>.outer>H3',additionalContentObj).text();
              var authorName = $('.date-author STRONG',additionalContentObj).text();
              var publicationDate = $('.date-author LI:eq(0)',additionalContentObj).text();
              
              // Send tracking request to Omniture
              premierLeague.omniture.track({
                additionalProperties: {
                  dataAction: 'expand:article',
                  dataType: 'wc:article:' + pageTitle,
                  dataContext: 'wc-expando'
                }, 
                callee: linkObj,
                friendlyTitle: 'Expando article expansion',
                trackingType: 'event-click'
              });
              
              // Send tracking request to Omniture
              premierLeague.omniture.track({
                additionalProperties: {
                  prop30: 'article:news',
                  prop69: 'world-cup-2014:world-cup-hub'
                },
                trackingType: 'page-view'
              });
            },
            type: 'get',
            url: articleURL
          });
        },premierLeague.configuration.runLocalDataFeeds ? premierLeague.configuration.timings.expandoLoadDelay : 1);
      }
      else{
        additionalContentObj.toggle();
        linkObj.attr('class','see-more ' + (additionalContentObj.is(':visible') ? 'contracted' : 'expanded'));
        teaserObj.removeClass('loading');
      }
      
      // Change the URL to reflect the URL of the article, which is being expanded
      updatePushState({
        url: linkObj.attr('data-article-web-url')
      });
    }); 
  }
  
  /**
  * Change the URL in the address bar
  * @method updatePushState
  */
  function updatePushState(obj){
    $.logEvent('[premierLeague.core.updatePushState]: ' + $.logJSONObj(obj));
    
    if(top.location.href != obj.url && premierLeague.configuration.pushStateEnabled){
      try{
        window.history.pushState(null,null,obj.url);
      }
      catch(err){
        $.logEvent('[premierLeague.core.articleInlineEventsInit]: unable to run pushState functionality');  
      }
    }
  }
    
  /**
  * Update the bounds of what's in view
  * @method updateScrollYAxisBounds
  * @param {BOOLEAN} applyUrlChange Whether to execute a Url change or not
  * @return {OBJECT} The bottom and top bounds of the screen, in relating to the page scroll offset
  */
  function updateScrollYAxisBounds(obj){
    premierLeague.configuration.scrollYAxisBounds = {
      bottom: $(window).scrollTop() + $(window).height(),
      top: $(window).scrollTop()
    }

    if(premierLeague.tabs.configuration.inViewMonitorEnabled){
      $('#inview-monitor .top').text('Top: ' + premierLeague.configuration.scrollYAxisBounds.top + 'px');
      $('#inview-monitor .bottom').text('Bottom: ' + premierLeague.configuration.scrollYAxisBounds.bottom + 'px');
    }
    
    if(premierLeague.tabs.configuration.matchReportBeingViewed){
      // Check to see whether adverts are in view or not
      refreshAdvertsInView();

      // Check to see whether articles are in view or not
      var articleObj;
      var articlesInView = [];
      $('#match-report .article').each(function(){
        articleObj = $(this);
        
        if(premierLeague.tabs.configuration.inViewMonitorEnabled){
          $('#monitor-' + articleObj.attr('id'))
            .find('SPAN')
              .remove()
            .end()
            .IF(articleObj.inViewArticle())
              .append(
                $('<span />')
                  .text('(' + articleObj.articlePixelsInView() + ')')
              )
              .attr('class','inview')
            .ELSE()
              .removeAttr('class')
            .ENDIF()
        }
        
        // Sort an array of articles in view, in order to change to the correct URL in the address bar
        if(articleObj.inViewArticle()){
          articlesInView.push(articleObj.articlePixelsInView());
        }
      });
      
      var articlePixelsMatch = articlesInView.sort(numericSort).reverse()[0];
      var matchedArticleObj = $('.article[data-pixels-in-view=' + articlePixelsMatch + ']');
      var articleUrl = matchedArticleObj.attr('data-article-url');
      
      $('#inview-monitor H5').text($('>H3',matchedArticleObj).text());
      
      if(obj.applyUrlChange && top.location.href != articleUrl && matchedArticleObj.attr('data-viewed') === 'false'){
        if(top.location.href !== articleUrl){       
          // Change the URL to reflect the URL of the article, which is in view
          updatePushState({
            url: articleUrl
          });
          
          var pageTitle = $('>H3',matchedArticleObj).text();
          var authorName = $('.date-author STRONG',matchedArticleObj).text();
          var publicationDate = $('.date-author LI:eq(0)',matchedArticleObj).text();  
          
          // Update data attribute to ensure a subsequent tracking event is never sent for an already viewed article
          matchedArticleObj.attr('data-viewed',true);
          
          // Send tracking request to Omniture
          premierLeague.omniture.track({
            additionalProperties: {
              prop30: 'article:news',
              prop69: 'world-cup-2014:live-match-centre'
            },
            trackingType: 'page-view'
          });
        }
      }
    }
  }
  
  /**
  * Check to see whether adverts are in view or not
  * @method refreshAdvertsInView
  */
  function refreshAdvertsInView(){
    var advertObj;
    
    $('#match-report .advert').each(function(){
      advertObj = $(this);
      
      if(advertObj.attr('data-initialized') === 'false' && advertObj.inViewAdvert()){
        advertObj
          .addClass('loaded')
          .attr('data-initialized','true');
          
        // Activate a specific advert
        advertObj.advert('activate');

        if(premierLeague.tabs.configuration.inViewMonitorEnabled){
          $('#monitor-' + advertObj.attr('id')).attr('class','inview');
        }
      }
    });
  }
    
  /**
  * Check to see whether local storage is available within the current browser
  * @method supportsLocalStorage
  * @return {BOLLEAN} Whether or not local storage is supported or not
  */
  function supportsLocalStorage(){
    try {
      $.logEvent('[premierLeague.core.supportsLocalStorage]');
      
      return 'localStorage' in window && window['localStorage'] !== null;
    }
    catch(err){
      return false;
    }
  }
  
  /**
  * Additional algorithm to pass to native .sort() functionality for sorting arrays
  * @method numericSort
  * @return {INTEGER}
  */
  function numericSort(inputA,inputB){
    return inputA - inputB;
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
      
    $.logEvent('[premierLeague.core.createDebugLogger]');
  } 
  
  /**
  * Is a number positive or not?
  * @method isPositiveNumber
  * @param {INTEGER} number The number to check whether it is positive or not
  * @return {INTEGER}
  */
  function isPositiveNumber(number){    
    var isPositive = number > 0;
    
    // $.logEvent('[premierLeague.core.isPositiveNumber]: ' + number + ' (' + isPositive + ')');
    
    return isPositive;
  }
  
  /**
  * Lock/unlock the site
  * @method siteLock
  * @param {STRING} Method 'lock' or 'unlock'
  */
  function siteLock(obj){
    $.logEvent('[premierLeague.core.siteLock]: ' + $.logJSONObj(obj));

    switch(obj.method){
      case 'lock':
        premierLeague.configuration.locked = true;
        $('BODY').addClass('locked');
        break;
      case 'unlock':
        premierLeague.configuration.locked = false;
        $('BODY').removeClass('locked');
        break;
    }
  } 
  
  /**
  * Check to see if the site is currently in a locked/disabled state
  * @method isSiteLocked
  * @return {BOOLEAN}
  */
  function isSiteLocked(){
    return $('BODY').hasClass('locked');
  }
  
  /**
  * Convert input to xxx-xxx-xxx
  * @method lowerCaseWithDashes
  * @param {STRING} stringToFormat The string to convert to lowercase and add replace spaces with dashes
  * @return {STRING}
  */  
  function lowerCaseWithDashes(stringToFormat){
    $.logEvent('[premierLeague.core.lowerCaseWithDashes]');
    
    var output = stringToFormat.toLowerCase().replace(/ /g,'-').replace(/ô/g,'o');
    output = output.replace(/[']/gi,'');
    output = output.replace(/&/g,'and');
    
    return output;
  }
  
  /**
  * Disable (gesture-based) page scrolling except for internal scrollers (iScroll)
  * @method disableGestureScrolling
  */
  function disableDefaultGestureScrolling(){
    $.logEvent('[premierLeague.core.disableDefaultGestureScrolling]');
    
    premierLeague.dropdownBar.configuration.defaultGestureScrollingEnabled = false;
    
    $('BODY').on('touchmove',function(e){
      if($(e.target).hasParent('#internal-scroller') == 0){
        e.preventDefault();
      }
    });
  }
  
  /**
  * Enable (gesture-based) page scrolling
  * @method enableDefaultGestureScrolling
  */
  function enableDefaultGestureScrolling(){
    $.logEvent('[premierLeague.core.enableDefaultGestureScrolling]');
    
    premierLeague.dropdownBar.configuration.defaultGestureScrollingEnabled = true;
    
    $('BODY').off('touchmove');
  } 
  
  /**
  * Initialize DOM widgets for photo galleries/video galleries/polls
  * @method domWidgetsInit
  */
  function domWidgetsInit(){
    $.logEvent('[premierLeague.core.domWidgetsInit]');
    
    if(typeof(tm) === 'object'){
      tm.config.set('resources.rootPath',premierLeague.configuration.domWidgets.rootPath);
      tm.config.set('frontend.rootPath',premierLeague.configuration.domWidgets.rootPath + '/..');
      tm.config.set('resources.js.rootPath',premierLeague.configuration.domWidgets.rootPath + premierLeague.configuration.domWidgets.jsPathSuffix);
      tm.config.set('resources.skin.url',premierLeague.configuration.domWidgets.skinUrl);
      tm.config.set('resources.skin.sharedUrl',premierLeague.configuration.domWidgets.sharedUrl);
      tm.config.set('resources.handlebars.rootPath',premierLeague.configuration.domWidgets.rootPath + premierLeague.configuration.domWidgets.handleBarsRootPathSuffix);
      tm.config.set('resources.js.version',premierLeague.configuration.domWidgets.jsVersion);
      
      // For GPT adverts
      tm.trigger('tm.ad.gpt');

      // Apply takeover ads to the fixed layout (only)
      if(premierLeague.configuration.deviceType === 'fixed'){
        // Enable outbrain adverts, but only on fixed layout
        tm.trigger('tm.ad.outbrain');
        
        $('<div />')
          .attr({
            id: 'gpt-oop',
            'data-slot': premierLeague.configuration.adverts.pageSlotName,
            'data-widget': 'tm.ad.gpt-pseudo-oop'
          })
          .prependTo($('BODY'))
      }
      else{
        $('<div />')
          .attr({
            id: 'fluid-oop',
            'data-height': 50,
            'data-slot': premierLeague.configuration.adverts.pageSlotName,
            'data-widget': 'tm.ad.gpt',
            'data-width': 320
          })
          .prependTo($('BODY'));
        
        // Auto load the advert (using DOM Widgets)
        $('#fluid-oop').loadDomWidgets();
      }
      
      // Auto load any other widgets (Polls/Galleries)
      $('[data-widget]')
        .loadDomWidgets()
        .attr('data-widget-loaded',true);
    }
  }
  
  /**
  * Check to see whether a JSON property exists within an object
  * @param {OBJECT} jsonDataObj The data object to check against
  * @param {STRING} propertyName The propertyName to check for
  * @return {BOOLEAN} Whether the property exists or not
  */
  function hasJSONProperty(obj){
    $.logEvent('[premierLeague.core.hasJSONProperty]');
    
    var dataObj = obj.jsonDataObj;
    var hasProperty = false;
    
    if(dataObj.hasOwnProperty(obj.propertyName)){
      if(dataObj[obj.propertyName] !== null && dataObj[obj.propertyName] !== ''){
        hasProperty = true;
      }
    }
    
    return hasProperty;
  }
    
  /**
  * Attach colours to chart data
  * @method attachChartColors
  * @param {OBJECT} chartData The JSON data required by the chart instance
  * @return {OBJECT} The JSON data required by the chart instance (with colors attached)
  */
  function attachChartColors(obj){
    $.logEvent('[premierLeague.core.attachChartColors]');
    
    var chartData = obj.chartData;
    
    $.each(chartData,function(index,value){
      $.extend(this,{color: premierLeague.configuration.chartColors[index]});
    });
    
    return chartData;
  }
  
  /**
  * Allow pre-renderer to reset initial HTML markup
  * @method componentObj
  * @param {OBJECT} componentObj The outer most Dom object of the component to be reset
  */
  function resetComponent(obj){
    $.logEvent('[premierLeague.core.resetComponent]: component id=' + obj.componentObj.attr('id'));
    
    obj.componentObj.empty();
  }
  
  return {
    articleInlineEventsInit: articleInlineEventsInit,
    attachChartColors: attachChartColors,
    createDebugLogger: createDebugLogger,
    disableDefaultGestureScrolling: disableDefaultGestureScrolling,
    domWidgetsInit: domWidgetsInit,
    enableDefaultGestureScrolling: enableDefaultGestureScrolling,
    hasJSONProperty: hasJSONProperty,
    init: init,
    isPositiveNumber: isPositiveNumber,
    isSiteLocked: isSiteLocked,
    lowerCaseWithDashes: lowerCaseWithDashes,
    postCSSLoadInit: postCSSLoadInit,
    refreshAdvertsInView: refreshAdvertsInView,
    resetComponent: resetComponent,
    siteLock: siteLock,
    siteSwitchInit: siteSwitchInit,
    supportsLocalStorage: supportsLocalStorage,
    updateScrollYAxisBounds: updateScrollYAxisBounds
  }
}());

// Window events
$(window).on({
  load: function(){   
    // All functionality to load once the correct CSS and JanvaScript has been attached to the DOM (via adaptJS)
    premierLeague.core.postCSSLoadInit();
  },
  resize: function(){
    // Update the bounds of what's in view
    premierLeague.core.updateScrollYAxisBounds({
      applyUrlChange: true
    });
    
    try{
      // Unload all pie chart instances, as the rendering of them in fluid vs fixed is different
      premierLeague.pieChart.unload();
    }
    catch(err){
      $.logEvent('[Site unload]: unable to unload pie charts: ' + $.logJSONObj(err)); 
    }
    
    try{
      // Unload all escenic chart instances, as the rendering of them in fluid vs fixed is different
      premierLeague.escenicCharts.unload();
    }
    catch(err){
      $.logEvent('[Site unload]: unable to unload escenic charts: ' + $.logJSONObj(err)); 
    }
  },
  scrollstart: function(){    
    if(premierLeague.configuration.pageType === 'fixture'){
      // Calculate offsets for adverts and articles within Match Report
      premierLeague.tabs.calculateMatchCentreOffsets();
    }
  },
  scrollstop: $.debounce(premierLeague.configuration.timings.debounceDelay,function(event){   
    // Update the bounds of what's in view
    premierLeague.core.updateScrollYAxisBounds({
      applyUrlChange: true
    });
  })
});

// jQuery extensions
$.extend({
  /**
  * Logging, based on whether it has been configured to log or not
  * @method logEvent
  * @param {STRING} Event The event to log
  */
  logEvent: function(event){
    if(premierLeague.configuration.debugLogging){
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
  * Is a number between 2 numbers?
  * @method numberInRange
  * @param {INTEGER} number The number to check whether it is within the lower and upper bounds
  * @param {INTEGER} lower The lower number to check against
  * @param {INTEGER} upper The upper number to check against
  */  
  numberInRange: function(obj){   
    return obj.number >= obj.lower && obj.number <= obj.upper;
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
  
  hasParent: function(filterCriteria){
    return this.parents(filterCriteria).length;
  },
        
  inViewAdvert: function(){
    var advertTopPosition = $(this).offset().top;
    var advertBottomPosition = (advertTopPosition + $(this).height()) - 10; // 10px is the bottom CSS margin
    
    if(advertTopPosition > premierLeague.configuration.scrollYAxisBounds.top && advertBottomPosition < premierLeague.configuration.scrollYAxisBounds.bottom){
      return true;
    }
    
    return false;
  },
  
  inViewArticle: function(){
    var articleTopPosition = $(this).offset().top;
    var articleBottomPosition = articleTopPosition + $(this).height();
    
    if(articleBottomPosition < premierLeague.configuration.scrollYAxisBounds.top || articleTopPosition > premierLeague.configuration.scrollYAxisBounds.bottom){
      return false;
    }
    
    return true;
  },
  
  articlePixelsInView: function(){
    var selfObj = $(this);
    var dataTopOffset = parseInt(selfObj.attr('data-top-offset'));
    var dataBottomOffset = parseInt(selfObj.attr('data-bottom-offset'));
    var currentTopScroll = premierLeague.configuration.scrollYAxisBounds.top;
    var currentBottomScroll = premierLeague.configuration.scrollYAxisBounds.bottom;
    var topOverflow = 0;
    var bottomOverflow = 0;
    var currentViewportArea = currentBottomScroll - currentTopScroll;
    var pixelsInView = 0;
    
    if(dataTopOffset > currentTopScroll){
      topOverflow = dataTopOffset - currentTopScroll;
    }
    
    if(currentBottomScroll > dataBottomOffset){
      bottomOverflow = currentBottomScroll - dataBottomOffset;
    }
    
    pixelsInView = currentViewportArea - (topOverflow + bottomOverflow);
    
    selfObj
      .IF(pixelsInView > 0)
        .attr('data-pixels-in-view',pixelsInView)
      .ELSE()
        .removeAttr('data-pixels-in-view')
      .ENDIF()
    
    return pixelsInView;
    
  }
});