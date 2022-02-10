/**
* PremierLeague v1.0
* @module premierLeague
*/

var premierLeague = window.premierLeague || {};

premierLeague.score = (function(){
  var configuration = {
    containerObj: $('#score')
  };  
  
  /** 
  * Build the score
  * @method init
  */
  function build(){
    $.logEvent('[premierLeague.score.build]');

    // Allow pre-renderer to reset initial HTML markup
    if(premierLeague.configuration.resetOnInit){
      premierLeague.core.resetComponent({
        componentObj: configuration.containerObj
      });
    }
    
    var scoreObj = premierLeague.configuration.initialSiteContent.score;
    var contentObj = scoreObj.content[0];
    
    configuration.containerObj
      .append(
        $('<div />')
          .append(
            $('<p />')
              .append(
                $('<a />')
                  .attr('href','#')
                  .text('Click here to show/hide goals scored')
              )
              .attr({
                'class': 'expanded',
                id: 'toggle-goal-scorers'
              })
              .IF(matchHasGoalScorers({homeTeamGoals: contentObj.homeTeam.goalsScored.length,awayTeamGoals: contentObj.awayTeam.goalsScored.length}) && premierLeague.configuration.deviceType === 'fluid')
                .show()
              .ENDIF()
          )
          .append(
            $('<ol />')
              .append(
                $('<li />')
                  .append(
                    $('<div />')
                      .append(
                        $('<span />')
                          .attr('class',premierLeague.core.lowerCaseWithDashes(contentObj.homeTeam.name))
                          .text('Goal scorers for home team:')
                      )
                      .append(
                        $('<strong />')
                          .text(contentObj.homeTeam.name)
                      )
                  )
                  .attr('class','home')
              )
              .append(
                $('<li />')
                  .text(contentObj.homeTeam.goalsScored.length + ' - ' + contentObj.awayTeam.goalsScored.length)
                  .attr('class','separator')
              )
              .append(
                $('<li />')
                  .append(
                    $('<div />')
                      .append(
                        $('<span />')
                          .attr('class',premierLeague.core.lowerCaseWithDashes(contentObj.awayTeam.name))
                          .text('Goal scorers for away team:')
                      )
                      .append(
                        $('<strong />')
                          .text(contentObj.awayTeam.name)
                      )
                  )
                  .attr('class','away')
              )
          )
          .attr('class','outer')
      )
      .append(
        $('<table />')
          .append(
            $('<thead />')
              .append(
                $('<tr />')
                  .append(
                    $('<th />')
                      .text(contentObj.homeTeam.name)
                  )
                  .append(
                    $('<th />')
                      .html('&nbsp;')
                  )
                  .append(
                    $('<th />')
                      .text(contentObj.awayTeam.name)
                  )
              )
          )
          .append(
            attachGoalsScoredToMatch({
              homeTeamGoalScorers: scoreObj.content[0].homeTeam.goalsScored, 
              awayTeamGoalScorers: scoreObj.content[0].awayTeam.goalsScored
            })
          )
          .attr('border',1)
      )
      .append(
        $('<ul />')
          .append(
            $('<li />')
              .attr('data-meta-type','kick-off')
              .text(scoreObj.metaData.kickOff)
              .prepend(
                $('<strong />')
                  .text('Ko: ')
              )
          )
          .IF(scoreObj.metaData.hasOwnProperty('referee'))
            .append(
              $('<li />')
                .attr('data-meta-type','referee')
                .text(scoreObj.metaData.referee)
                .prepend(
                  $('<strong />')
                    .text('Ref: ')
                )
            )
          .ENDIF()
          .IF(scoreObj.metaData.hasOwnProperty('attendance'))
            .append(
              $('<li />')
                .attr('data-meta-type','attendance')
                .text(scoreObj.metaData.attendance)
                .prepend(
                  $('<strong />')
                    .text('Attendance: ')
                )
            )
          .ENDIF()
          .IF(scoreObj.metaData.hasOwnProperty('location'))
            .append(
              $('<li />')
                .attr('data-meta-type','location')
                .text(scoreObj.metaData.location)
                .prepend(
                  $('<strong />')
                    .text('At: ')
                )
            )
          .ENDIF()
          .attr('id','summary-statistics')
      )
      .attr('class','expanded');
    
    // Process penalty shootouts
    if(contentObj.hasOwnProperty('period')){
      var penaltiesInMatch = false;
      if(contentObj.homeTeam.penaltyShots.length > 0 && contentObj.awayTeam.penaltyShots.length > 0){
        penaltiesInMatch = true;
      }
        
      if(contentObj.period === 'ShootOut' || penaltiesInMatch){
        // Add penalty details to the active match
        attachPenaltiesToMatch({
          homeTeamPenalties: contentObj.homeTeam.penaltyShots,
          awayTeamPenalties: contentObj.awayTeam.penaltyShots
        });
      
        // Show penalty shootout winner 
        if(contentObj.hasOwnProperty('finished')){
          if(contentObj.finished){
            showPenaltyShootoutWinner({
              homeTeamPenalties: contentObj.homeTeam.penaltyShots,
              awayTeamPenalties: contentObj.awayTeam.penaltyShots
            });
          }
        }
      }
    } 
    
    if(premierLeague.websockets.configuration.enabled){
      // Subscribe to the requested websocket channel, which will broadcast all real-time website updates for that unique component
      premierLeague.websockets.channelSubscribe({
        componentId: 'score',
        isMatchSpecific: true
      });
    }
    
    // Set up handler for the toggle goalscorers button and the social share links
    eventHandlersInit();
    
    // Notify the main site dispatcher that the footer bar has finished initializing
    premierLeague.dispatcher.initializeComplete({finishedId: 'score'});
  }
  
  /**
  * Add penalty details to the active match
  * @method attachPenaltiesToMatch
  * @param {ARRAY} homeTeamPenalties The array of penalty takers for the home team
  * @param {ARRAY} awayTeamPenalties The array of penalty takers for the away team
  */
  function attachPenaltiesToMatch(obj){
    $.logEvent('[premierLeague.score.attachPenaltiesToMatch]: ' + $.logJSONObj(obj));
    
    configuration.containerObj
      .find('#penalties')
        .remove();
        
    var penaltyObj = $('<div />')
      .append(
        $('<p />')
          .text('Penalties')
      )
      .append(
        $('<ol />')
          .append(
            $('<li />')
              .append(function(){
                var ulObj = $('<ul />');
                
                $.each(obj.homeTeamPenalties,function(index,penaltyObj){
                  ulObj
                    .append(
                      $('<li />')
                        .attr('class',penaltyObj.scored ? 'goal' : 'miss')
                        .text(penaltyObj.playerName)
                        .append(
                          $('<span />')
                            .text(penaltyObj.scored ? 'Goal' : 'Miss')
                        )
                    )
                });
                
                return ulObj;
              })
          )
          .append(
            $('<li />')
              .attr('class','separator')
          )
          .append(
            $('<li />')
              .append(function(){
                var ulObj = $('<ul />');
                
                $.each(obj.awayTeamPenalties,function(index,penaltyObj){
                  ulObj
                    .append(
                      $('<li />')
                        .attr('class',penaltyObj.scored ? 'goal' : 'miss')
                        .text(penaltyObj.playerName)
                        .append(
                          $('<span />')
                            .text(penaltyObj.scored ? 'Goal' : 'Miss')
                        )
                    )
                });
                
                return ulObj;
              })
          )
      )
      .attr('id','penalties');
      
    penaltyObj.insertBefore($('#summary-statistics',configuration.containerObj));
  }
  
  /**
  * Show penalty shootout winner
  * @method showPenaltyShootoutWinner
  * @param {ARRAY} homeTeamPenalties The array of penalty takers for the home team
  * @param {ARRAY} awayTeamPenalties The array of penalty takers for the away team
  */
  function showPenaltyShootoutWinner(obj){
    $.logEvent('[premierLeague.score.showPenaltyShootoutWinner]: ' + $.logJSONObj(obj));
    
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
    
    var winningTeamType = 'home';
    if(awayTeamScorers > homeTeamScorers){
      winningTeamType = 'away';
    }
    
    var winningTeamObj = $('.' + winningTeamType + ' STRONG',configuration.containerObj);
    var winningTeamName = winningTeamObj.text();
    var winnerLabel = winningTeamType == 'home' ? winningTeamName + ' win ' + homeTeamScorers + '-' + awayTeamScorers : winningTeamName + ' win ' + awayTeamScorers + '-' + homeTeamScorers;
        
    // Show description of what team won the penalty shootout, and by how many penalties
    $('<p />')
      .text(winnerLabel + ' on penalties')
      .appendTo($('.outer',configuration.containerObj));
      
    $('<em />')
      .text('*')
      .insertAfter(winningTeamObj);
  }
  
  /**
  * Check whether the active match has any goalscorers
  * @method matchHasGoalScorers
  * @param {INTEGER} homeTeamGoals The number of goals scored by the home team
  * @param {INTEGER} awayTeamGoals The number of goals scored by the away team
  * @return {BOOLEAN} Whether the match has had any goals scored
  */
  function matchHasGoalScorers(obj){
    $.logEvent('[premierLeague.score.matchHasGoalScorers]: ' + $.logJSONObj(obj));
    
    if(obj.homeTeamGoals > 0 || obj.awayTeamGoals > 0){
      return true;
    }
    else{
      return false;
    }
  }
  
  /**
  * Set up handler for the toggle goalscorers button
  * @method eventHandlersInit
  */
  function eventHandlersInit(){
    $.logEvent('[premierLeague.score.eventHandlersInit]');
    
    // Create the event handler for the toggle goalscorers button
    $('#toggle-goal-scorers A').on('click',function(e){
      e.preventDefault();
      
      var tableObj = $('TABLE',configuration.containerObj);
      $('TABLE,#penalties',configuration.containerObj).toggle();
      
      $(this).parent().attr('class',tableObj.is(':visible') ? 'visible' : 'visible');
      configuration.containerObj.attr('class',tableObj.is(':visible') ? 'contracted' : 'expanded');
    });
  } 
  
  /** 
  * Add an array of events to a single player
  * @method attachEventToPlayer
  * @param {OBJECT} homeTeamGoalScorers A JSON object containing all goal information for the home team
  * @param {OBJECT} awayTeamGoalScorers A JSON object containing all goal information for the away team
  * @return {OBJECT} The complete DOM object to be attached to the current match
  */  
  function attachGoalsScoredToMatch(obj){
    $.logEvent('[premierLeague.score.attachGoalsScoredToMatch]: ' + $.logJSONObj(obj));
        
    var maximumGoals = obj.homeTeamGoalScorers.length > obj.awayTeamGoalScorers.length ? obj.homeTeamGoalScorers.length : obj.awayTeamGoalScorers.length;
    var goalsDomObj = $('<tbody />');
    
    // Loop through the maximum goals counter, to create a table row for each goal, which will allow the alternating row pattern to be created
    for(var i=0; i<=maximumGoals-1; i++){
      var homeTypeOfGoal = '';
      var awayTypeOfGoal = '';
    
      if(obj.homeTeamGoalScorers[i] != undefined && obj.homeTeamGoalScorers[i].hasOwnProperty('typeOfGoal')){       
        switch(obj.homeTeamGoalScorers[i].typeOfGoal){
          case 'own-goal': homeTypeOfGoal = ' (OG)'; break;
          case 'penalty': homeTypeOfGoal = ' (P)'; break;
        }
      }

      if(obj.awayTeamGoalScorers[i] != undefined && obj.awayTeamGoalScorers[i].hasOwnProperty('typeOfGoal')){
        switch(obj.awayTeamGoalScorers[i].typeOfGoal){
          case 'own-goal': awayTypeOfGoal = ' (OG)'; break;
          case 'penalty': awayTypeOfGoal = ' (P)'; break;
        }
      }
      
      goalsDomObj
        .append(
          $('<tr />')
            .append(
              $('<td />')
                .attr('class','home')
                .html(obj.homeTeamGoalScorers[i] != undefined ? obj.homeTeamGoalScorers[i].name + '&nbsp;' + homeTypeOfGoal + '&nbsp;' + obj.homeTeamGoalScorers[i].minuteOfGoal + '"' : '&nbsp;')
            )
            .append(
              $('<td />')
                .attr('class','separator')
                .html('&nbsp;')
            )
            .append(
              $('<td />')
                .attr('class','away')
                .html(obj.awayTeamGoalScorers[i] != undefined ? obj.awayTeamGoalScorers[i].name + '&nbsp;' + awayTypeOfGoal + '&nbsp;' + obj.awayTeamGoalScorers[i].minuteOfGoal + '"' : '&nbsp;')
            )
        )
    }
    
    return goalsDomObj;
  }
  
  /**
  * Process the Pusher real-time update
  * @method websocketCallback
  * @param {OBJECT} data A JSON update from Pusher
  */  
  function websocketCallback(obj){
    $.logEvent('[premierLeague.score.websocketCallback]: ' + $.logJSONObj(obj));
    
    // Show the toggle arrow, since there are now goal scorers
    $('#toggle-goal-scorers').addClass('visible');
    
    // Since the websocket update re-defines the entire goalscorers list, any previous scores need to be removed before adding the new updates
    $('TBODY',configuration.containerObj).remove();
    
    // Capture any errors should the content for the Match Summary not be correct
    try{
      var contentObj = obj.data.score.content[0];
      
      // Update the score
      $('OL:first>LI.separator',configuration.containerObj).text(obj.data.score.content[0].homeTeam.goalsScored.length + ' - ' + obj.data.score.content[0].awayTeam.goalsScored.length);
      
      // Dynamically assign the referee name to the match
      addMetaDataToMatch({
        metaDataObj: obj.data.score.metaData,
        tagLabel: 'Ref',
        tagName: 'referee'
      });
      
      // Dynamically assign attendance to the match
      addMetaDataToMatch({
        metaDataObj: obj.data.score.metaData,
        tagLabel: 'Attendance',
        tagName: 'attendance'
      });
      
      // Dynamically assign location to the match
      addMetaDataToMatch({
        metaDataObj: obj.data.score.metaData,
        tagLabel: 'At',
        tagName: 'location'
      });
      
      // Update the goalscorers
      $('TABLE',configuration.containerObj)
        .append(
          attachGoalsScoredToMatch({
            homeTeamGoalScorers: obj.data.score.content[0].homeTeam.goalsScored, 
            awayTeamGoalScorers: obj.data.score.content[0].awayTeam.goalsScored
          })
        );
        
      // Process penalty shootouts
      if(contentObj.hasOwnProperty('period')){
        var penaltiesInMatch = false;
        if(contentObj.homeTeam.penaltyShots.length > 0 && contentObj.awayTeam.penaltyShots.length > 0){
          penaltiesInMatch = true;
        }
          
        if(contentObj.period === 'ShootOut' || penaltiesInMatch){
          // Remove any previous winning labels
          $('.outer P[id!="toggle-goal-scorers"]',configuration.containerObj).remove();
          
          // Remove any previous winning star indicators
          $('EM',configuration.containerObj).remove();
        
          // Add penalty details to the active match
          attachPenaltiesToMatch({
            homeTeamPenalties: contentObj.homeTeam.penaltyShots,
            awayTeamPenalties: contentObj.awayTeam.penaltyShots
          });
        
          // Show penalty shootout winner 
          if(contentObj.hasOwnProperty('finished')){
            if(contentObj.finished){
              showPenaltyShootoutWinner({
                homeTeamPenalties: contentObj.homeTeam.penaltyShots,
                awayTeamPenalties: contentObj.awayTeam.penaltyShots
              });
            }
          }
        }
      }
                
      // Calculate offsets for adverts and articles within Match Report
      premierLeague.tabs.calculateMatchCentreOffsets();
    }
    catch(err){
      $.logEvent('[premierLeague.score.websocketCallback]: an error occured populating the Score component (via Pusher): ' + $.logJSONObj(err));
    }
  }
  
  /**
  * Dynamically assign either the attendance/location/referee name to the match
  * @method addMetaDataToMatch
  * @param {OBJECT} metaDataObj The metaData JSON object
  * @param {STRING} tagLabel The label for the meta data which has been provided 
  * @param {STRING} tagName The meta data which has been provided 
  */  
  function addMetaDataToMatch(obj){
    $.logEvent('[premierLeague.score.addMetaDataToMatch]: ' + $.logJSONObj(obj));

    if(obj.metaDataObj.hasOwnProperty(obj.tagName)){
      if($('#summary-statistics LI[data-meta-type=' + obj.tagName + ']').size() == 1){
        $('#summary-statistics LI[data-meta-type=' + obj.tagName + ']')
          .text(obj.metaDataObj[obj.tagName])
          .prepend(
            $('<strong />')
              .text(obj.tagLabel + ': ')
          )
      }
      else{
        $('#summary-statistics')
          .append(
            $('<li />')
              .attr('data-meta-type',obj.tagName)
              .text(obj.metaDataObj[obj.tagName])
              .prepend(
                $('<strong />')
                  .text(obj.tagLabel + ': ')
              )
          )
      }
    }
  }
    
  return {
    build: build,
    websocketCallback: websocketCallback
  }
}());