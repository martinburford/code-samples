/**
* PremierLeague
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.dispatcher = (function(){   
  /**
  * Initialize the required functionality for the desired module
  * @method moduleInitialize
  * @param {STRING} type The type of component, mapped to the plugin name used to build/initialize it
  */
  function moduleInitialize(obj){
    $.logEvent('[premierLeague.dispatcher.moduleInitialize]: ' + $.logJSONObj(obj));

    switch(obj.id){
      case 'fixtures':
        premierLeague.fixtures.build();
        break;
      case 'splash':
        premierLeague.splash.build();
        break;
      case 'tabs':
        premierLeague.tabs.build();
        break;
      case 'leagueTable': 
        premierLeague.leagueTable.build();
        break;
      case 'inSummary':
        premierLeague.inSummary.build();
        break;
      case 'score':
        premierLeague.score.build();
        break;
      case 'article':
        premierLeague.article.build();
        break;
      case 'pageDescription':
        premierLeague.pageDescription.build();
        break;
      case 'titleAuthorShare':
        premierLeague.titleAuthorShare.build();
        break;
    }
  }
  
  /**
  * Notify dispatcher that a component has finished initializing
  * @method initializeComplete
  * @param (STRING} finishedId The DOM element id of the module which has finished initializing
  */
  function initializeComplete(obj){
    $.logEvent('[premierLeague.dispatcher.initializeComplete]: ' + $.logJSONObj(obj));
        
    var loadSequence = premierLeague.configuration.loadSequence;
    var matchedSequencePosition;
        
    for(i=0; i<premierLeague.configuration.loadSequence.length; i++){
      // Locate the component which just finished initializing
      if(premierLeague.configuration.loadSequence[i].id == obj.finishedId){
        matchedSequencePosition = i;
        
        // Update the configuration to confirm that the passed component id has finishined initializing
        premierLeague.configuration.loadSequence[matchedSequencePosition].initialized = true;
        
        break;
      }
    }
    
    // Check to see if there are any more components left to initialize
    if(premierLeague.configuration.loadSequence.length > (matchedSequencePosition+1)){
      var newComponentToInitializeObj = premierLeague.configuration.loadSequence[matchedSequencePosition+1];
    
      // Initialize the required functionality for the desired module
      moduleInitialize(newComponentToInitializeObj);
    }
    else{
      // Run any functionality which is dependant on the dispatcher having been completed
      dispatcherComplete();
            
      // All actions within the load sequence are now complete
      $.logEvent('[premierLeague.dispatcher.initializeComplete]: site dispatcher is complete');
    }
  }
    
  /**
  * Run any functionality which is dependant on the dispatcher having been completed
  * @method dispatcherComplete
  */
  function dispatcherComplete(){
    $.logEvent('[premierLeague.dispatcher.dispatcherComplete]');
    
    try{
      // Initialize events for all instances of League Table components (inside and outside of tab blocks)
      premierLeague.leagueTable.eventHandlersInit();  
    }
    catch(err){
      $.logEvent('[premierLeague.dispatcher.dispatcherComplete]: an error occured running post dispatcher functions (league table event handlers init)');
    }
    
    // Remove the site overlay (shown during sequence loading)
    $('#site-loader').fadeOut(premierLeague.configuration.timings.fadeOutSiteLoader,function(){
      $(this).remove();     
    });
    
    // Build the dropdown bar (only if the current page contains a Live Feed
    if($('#live-feed').size() === 1){
      premierLeague.dropdownBar.build();
    }
    
    // Initialize the handlers to process the dynamic injection of articles into either Hub or Opinion Teaser content types
    premierLeague.core.articleInlineEventsInit();
    
    // If the URL contains a hash when loading, trigger the event attached to that hash value
    premierLeague.tabs.processHash();
    
    // Initialize DOM widgets for photo galleries/video galleries/polls
    if(premierLeague.configuration.domWidgets.enabled){
      premierLeague.core.domWidgetsInit();
    }
    
    // Add the required Twitter widget JavaScript file to the DOM, as specified within their embed code
    var scriptObj = document.createElement('script');
    scriptObj.type = 'text/javascript';
    scriptObj.src = 'http://platform.twitter.com/widgets.js';
    $('HEAD').append(scriptObj);

    // Calculate all necessary heights for an expanding (fluid) carousel
    premierLeague.fixtures.configuration.fluidHeights = premierLeague.fixtures.calculateCarouselDropdownHeights();
    
    premierLeague.configuration.siteInitialized = true;
        
    // If running in simulation mode, load the broadcasts in a popup window
    if(premierLeague.websockets.configuration.enabled){
      setTimeout(function(){
        if(premierLeague.configuration.runLocalDataFeeds){
          var modalWindow = window.open(premierLeague.configuration.urls.local.pusherSimulation,'pusher','alwaysRaised=yes,height=200,left=0,modal=yes,top=0,width=200',null);
          
          if(premierLeague.websockets.configuration.runMultipleInSimulation){
            // Load the 2nd set of simulated events
            setTimeout(function(){
              modalWindow.location.href = premierLeague.configuration.urls.local.pusher2ndSimulation;
            },premierLeague.websockets.configuration.timings.websocketMultipleTriggerDelay*2);
            
            // Load the 3rd set of simulated events
            setTimeout(function(){
              modalWindow.location.href = premierLeague.configuration.urls.local.pusher3rdSimulation;
            },premierLeague.websockets.configuration.timings.websocketMultipleTriggerDelay*4);
          }
        }
      },premierLeague.websockets.configuration.timings.websocketTriggerDelay);    
    }
  }
    
  return {
    dispatcherComplete: dispatcherComplete,
    initializeComplete: initializeComplete,
    moduleInitialize: moduleInitialize
  }
}());