/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.websockets = (function(){
  var configuration = {
    channels: [],
    enabled: false,
    monitorEnabled: false,
    pusherObj: null,
    runMultipleInSimulation: false,
    sockets: [
      {
        name: 'liveFeed',
        enabled: false
      }
    ],
    timings: {
      websocketTriggerDelay: 1000,
      websocketMultipleTriggerDelay: 3000
    }
  };
  
  /**
  * Only a single connection is required to Pusher, which can then have multiple subscriptions attached to it
  * @method connectToPusher
  */
  function connectToPusher(){
    $.logEvent('[premierLeague.websockets.connectToPusher]');

    var pusherConfiguration = premierLeague.configuration.initialSiteContent.configuration.pusher;
    var pusherMode = pusherConfiguration.runLive ? 'live' : 'simulated';
    var apiKey = pusherConfiguration[pusherMode].apiKey;

    // Create the connection to Pusher
    configuration.pusherObj = new Pusher(apiKey);
  }
  
  /**
  * Subscribe to the requested websocket channel, which will broadcast all real-time website updates for that unique component
  * @method channelSubscribe
  * @param {STRING} componentId The id of the component which needs to have a websocket event listener created
  * @param {isMatchSpecific} isMatchSpecific Whether or not the websocket channelName needs to include the unique fixture id
  */  
  function channelSubscribe(obj){
    if(premierLeague.websockets.configuration.enabled){
      // Subscribe to Pusher only once it has been successfully connected to
      configuration.pusherObj.connection.bind('connected',function(){
        $.logEvent('[premierLeague.websockets.channelSubscribe]: ' + $.logJSONObj(obj));

        var channelNamePrefix = premierLeague.configuration.initialSiteContent.configuration.pusher.channelName;        
        var channelObj;
        var channelFullName = channelNamePrefix + '.' + (obj.isMatchSpecific ? premierLeague.configuration.fixtureId + '.' : '') + obj.componentId;

        channelObj = configuration.pusherObj.subscribe(channelFullName);

        if(typeof(configuration.channels[channelFullName]) !== 'object'){
          configuration.channels.push({
            channelFullName: channelFullName,
            componentId: obj.componentId,
            isMatchSpecific: obj.isMatchSpecific
          }); 
        }
        
        channelObj.bind('broadcast',function(data){
          // Process the Pusher real-time update
          premierLeague[obj.componentId].websocketCallback({data: data});
        });
          
        // An update has occured to the websocket channel, reflect that in the websockets monitor
        if(configuration.monitorEnabled){
          monitorUpdate({
            channelFullName: channelFullName,
            updateType: 'subscribe'
          });
        }
      });     
    }
  }
    
  /**
  * Unsubscribe from a requested websocket channel
  * @method channelUnsubscribe
  * @param {STRING} channelFullName The websocket channel name which needs to be unsubscribed
  */
  function channelUnsubscribe(obj){
    $.logEvent('[premierLeague.websockets.channelUnsubscribe]: ' + $.logJSONObj(obj));
    
    configuration.pusherObj.unsubscribe(obj.channelFullName);
    
    // An update has occured to the websocket channel, reflect that in the websockets monitor
    if(configuration.monitorEnabled){
      monitorUpdate({
        channelFullName: obj.channelFullName,
        updateType: 'unsubscribe'
      });
    }   
  }
    
  /**
  * An update has occurred to the websocket channel, reflect that in the websockets monitor
  * @method monitorUpdate
  * @param {STRING} channelFullName The name of the websocket channel which is being updated
  * @param {STRING} updateType Whether the channel is being subscribed to or unsubscribed from
  */
  function monitorUpdate(obj){
    $.logEvent('[premierLeague.websockets.monitorUpdate]: ' + $.logJSONObj(obj));
    
    // Create the websockets monitor if it hasn't been
    if($('#websockets-monitor').size() == 0){
      $('<div />')
        .append(
          $('<h4 />')
            .text('Websocket connections')
        )
        .append(
          $('<ul />')
        )
        .attr('id','websockets-monitor')
        .prependTo($('BODY'))
    }
            
    var monitoredChannelObj = $('#websockets-monitor LI[data-component-id="' + obj.channelFullName + '"]');
    if(monitoredChannelObj.size() == 1){
      monitoredChannelObj.attr('class',obj.updateType == 'subscribe' ? 'open' : 'closed');
    }
    else{
      $('#websockets-monitor UL')
        .append(
          $('<li />')
            .attr({
              'class': obj.updateType == 'subscribe' ? 'open' : 'closed',
              'data-component-id': obj.channelFullName
            })
            .text(obj.channelFullName)
        )
    }
  }
  
  return {
    channelSubscribe: channelSubscribe,
    channelUnsubscribe: channelUnsubscribe,
    configuration: configuration,
    connectToPusher: connectToPusher
  }
}());