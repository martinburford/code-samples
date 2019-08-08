(function(jQuery){
  var configuration = {
    teams: {
      threeLetterPrefix: {
        'arsenal': 'ARS',
        'aston-villa': 'AST',
        'burnley': 'BUR',
        'chelsea': 'CHE',
        'crystal-palace': 'CRY',
        'everton': 'EVE',
        'hull': 'HUL',
        'leicester': 'LEI',       
        'liverpool': 'LIV',
        'manchester-city': 'MCY',
        'manchester-united': 'MUN',
        'newcastle': 'NEW',
        'queens-park-rangers': 'QPR',
        'southampton': 'SOU',
        'stoke': 'STO',
        'sunderland': 'SUN',
        'swansea': 'SWA',
        'tottenham': 'TOT',
        'west-bromwich-albion': 'WBA',
        'west-ham': 'WHU'
      }
    }
  }
    
  var methods = {   
    /**
    * Initialize heatmaps
    * @method init
    */
    init: function(){
      var selfObj;
      var width;
      var height;
      var orientation;
      
      this.each(function(index){
        selfObj = $(this);
        orientation = selfObj.attr('data-orientation');
        
        // Calculate height and widths, since they need to be passed as parameters to the JSON endpoint
        width = selfObj.width();
        height = Math.round(width * heatmap.configuration.canvasAspectRatio[orientation]);
        
        selfObj
          .append(
            $('<div />')
              .append(
                $('<div />')
                  .attr({
                    'class': 'map',
                    'data-height': height,
                    'data-index': index,
                    id: 'heatmap-' + selfObj.attr('data-heatmap-id'),
                    'data-width': width
                  })
                  .css('height',Math.round($(this).width()*heatmap.configuration.canvasAspectRatio[orientation])) // Scale the canvas wrapper according to the football pitch background aspect ratio
              )
              .attr('class','inner')
          );
        
        // Load the necessary JSON for each unique heatmap instance
        selfObj.heatmap('pullInitialSiteContent');
      });
    },
    
    /**
    * Load the necessary JSON for each unique heatmap instance
    * @method pullInitialSiteContent
    */
    pullInitialSiteContent: function(){
      var selfObj = $(this);
      var height = parseInt($('.map',selfObj).attr('data-height'));
      var width = parseInt($('.map',selfObj).attr('data-width'));
      
      $.ajax({
        dataType: 'json',
        success: function(data){
          var jsonDataToStore = {};
          var playerCoordinates = {};
          var dataCoordinates = {};
          
          if(selfObj.hasAttr('data-single-player')){
            jsonDataToStore.playerFirstName = data.heatmap.filters[0].id.split(' ')[0];
            jsonDataToStore.playerSurname = data.heatmap.filters[0].id.split(' ')[1];
          }
          else{         
            jsonDataToStore.awayTeam = data.heatmap.filters[1].id;
            jsonDataToStore.homeTeam = data.heatmap.filters[0].id;
            jsonDataToStore.title = data.heatmap.metaData.title;
          };
          
          // Parse the JSON, so that a single unified object is created for all players (to be stored), regardless of the filter they belong to (eg: hometeam/awayteam)
          $.each(data.heatmap.filters,function(index,dataObj){
            // Starting lineup
            $.each(dataObj.content.startingLineup,function(nodeIndex,playerDataObj){
              jsonDataToStore[playerDataObj.id] = playerDataObj.data;
              dataCoordinates['player-' + playerDataObj.id] = {};
              
              $.each(playerDataObj.data,function(coordinatesIndex,coordinatesObj){
                // Add the required data points to a unique array, used to store the maximum count value for co-ordinates
                if(dataCoordinates['player-' + playerDataObj.id].hasOwnProperty(coordinatesObj.x + ',' + coordinatesObj.y)){
                  dataCoordinates['player-' + playerDataObj.id][coordinatesObj.x + ',' + coordinatesObj.y] = (dataCoordinates['player-' + playerDataObj.id][coordinatesObj.x + ',' + coordinatesObj.y] + 1);
                }
                else{
                  dataCoordinates['player-' + playerDataObj.id][coordinatesObj.x + ',' + coordinatesObj.y] = 1;
                }

                jsonDataToStore[playerDataObj.id][coordinatesIndex].filterId = playerDataObj.id;
              });
            });
            
            // Substitutions
            $.each(dataObj.content.substitutes,function(nodeIndex,playerDataObj){
              jsonDataToStore[playerDataObj.id] = playerDataObj.data;
              
              $.each(playerDataObj.data,function(coordinatesIndex,coordinatesObj){              
                jsonDataToStore[playerDataObj.id][coordinatesIndex].filterId = playerDataObj.id;
              });
            });
          });
                    
          var filterContentsToStoreStartingLineup = {};
          var filterContentsToStoreSubstitutes = {};
          
          // Create a data property (per heatmap) to store the current flattened dataset
          selfObj.data('dataPoints',{
            data: [],
            max: null
          });
                    
          // Parse the JSON, so that 2 lists are created (1 for a single player heatmap), representing the contents for the filters
          $.each(data.heatmap.filters,function(index,dataObj){          
            // filterContentsToStore[dataObj.id] = [];
            filterContentsToStoreStartingLineup[dataObj.id] = [];
            filterContentsToStoreSubstitutes[dataObj.id] = [];
            
            // Starting lineup
            $.each(dataObj.content.startingLineup,function(nodeIndex,playerDataObj){
              filterContentsToStoreStartingLineup[dataObj.id].push(playerDataObj.id);
            });
            
            // Substitutes
            $.each(dataObj.content.substitutes,function(nodeIndex,playerDataObj){
              filterContentsToStoreSubstitutes[dataObj.id].push(playerDataObj.id);
            });
          });
          
          $.logEvent('[$.fn.heatmap (pullInitialSiteContent)]: jsonDataToStore=' + jsonDataToStore);
          $.logEvent('[$.fn.heatmap (pullInitialSiteContent)]: filterContentsToStoreStartingLineup=' + filterContentsToStoreStartingLineup);
          $.logEvent('[$.fn.heatmap (pullInitialSiteContent)]: filterContentsToStoreSubstitutes=' + filterContentsToStoreSubstitutes);
          $.logEvent('[$.fn.heatmap (pullInitialSiteContent)]: dataCoordinates=' + dataCoordinates);

          // Attach unified player data to the data storage of the individual heatmap
          selfObj.data('jsonData',jsonDataToStore);
          
          // Attach filter list data (starting lineup) to the data storage of the individual heatmap
          selfObj.data('filterContentsStartingLineupData',filterContentsToStoreStartingLineup);
          
          // Attach filter list data (substitutes) to the data storage of the individual heatmap
          selfObj.data('filterContentsSubstitutesData',filterContentsToStoreSubstitutes);
          
          // Attach data coordinates for all heatmap players to the data storage of the individual heatmap
          selfObj.data('dataCoordinates',dataCoordinates);
          
          // Build the controls and attach the <canvas> layers for the heatmap instance
          selfObj.heatmap('build');
        },
        type: 'get',
        url: selfObj.attr('data-json-url') + '?height=' + height + '&width=' + width
      });
    },
    
    /**
    * Build the flyout (filters) and attach the <canvas> layers for the heatmap instance
    * @method build
    */
    build: function(){
      var selfObj = $(this);
      var heatmapId = selfObj.attr('data-heatmap-id');
      var isGoalMouth = selfObj.hasAttr('data-goal-mouth');
      var showFlyout = selfObj.hasAttr('data-flyout');
      var singlePlayer = selfObj.hasAttr('data-single-player');
      var homeTeamShortened;
      var awayTeamShortened;
      
      $.logEvent('[$.fn.heatmap (build)]: heatmap id=' + heatmapId);
      
      // Store the selectedFilters for future checks
      var selectedFilters = selfObj.attr('data-selected-filters').length > 0 ? selfObj.attr('data-selected-filters').split(',') : [];
      selfObj.data('selectedFilters',selectedFilters);
            
      // Change the intensity for the goal mouth type of heatmap
      if(isGoalMouth){
        heatmap.configuration.intensityMaximum = 1;
      }
            
      // Add an overriding CSS classname for heatmaps which only show a single player, since the key needs to render slightly differently
      if(singlePlayer){
        selfObj.addClass('single-player');
        
        // Build the key
        $('>.inner',selfObj)
          .prepend(
            $('<div />')
              .append(
                $('<p />')
                  .append(
                    $('<span />')
                      .text(selfObj.data('jsonData').playerFirstName)
                  )
                  .append(
                    $('<strong />')
                      .text(selfObj.data('jsonData').playerSurname)
                  )
              )
              .attr('class','key')
          )
      }
      else{
        var homeTeam = selfObj.data('jsonData').homeTeam;
        var awayTeam = selfObj.data('jsonData').awayTeam;
        
        homeTeamShortened = configuration.teams.threeLetterPrefix[heatmap.core.lowerCaseWithDashes({input: homeTeam})];
        awayTeamShortened = configuration.teams.threeLetterPrefix[heatmap.core.lowerCaseWithDashes({input: awayTeam})];
        
        // Build the key
        $('>.inner',selfObj)
          .prepend(
            $('<a />')
              .append(
                $('<strong />')
                  .html('Filter players&nbsp;')
                  .append(
                    $('<span />')
                      .text('(expand/collapse)')
                  )
              )
              .attr({
                'class': 'toggle',
                href: '#'
              })
          )
          .prepend(
            $('<div />')
              .append(
                $('<ul />')
                  .append(
                    $('<li />')
                      .html('&nbsp;')
                      .prepend(
                        $('<span />')
                          .text(homeTeamShortened)
                      )
                      .append(
                        $('<strong />')
                          .text(homeTeamShortened)
                      )
                      .attr('class',heatmap.core.lowerCaseWithDashes({input: homeTeam}))
                  )
                  .append(
                    $('<li />')
                      .html('&nbsp;')
                      .prepend(
                        $('<span />')
                          .text(awayTeamShortened)
                      )
                      .append(
                        $('<strong />')
                          .text(awayTeamShortened)
                      )
                      .attr('class',heatmap.core.lowerCaseWithDashes({input: awayTeam}))
                  )
              )
              .attr('class','key')
          )
      }
      
      // Build the inner filter lists (with gesture/scroll support)
      if(showFlyout){       
        $('.map',selfObj)
          .append(
            $('<div />')
              .append(
                $('<ul />')
                  .append(
                    $('<li />')
                      .append(
                        $('<a />')
                          .attr('href','#')                   
                          .text(homeTeamShortened)
                      )
                      .attr('class','active')
                  )
                  .append(
                    $('<li />')
                      .append(
                        $('<a />')
                          .attr('href','#')
                          .text(awayTeamShortened)
                      )
                  )
                  .attr('class','tab-triggers')
              )
              .append(
                $('<div />')
                  .append(
                    $('<div />')
                      .append(
                        $('<div />')
                          .append(function(){
                            var ulObj = selfObj.heatmap('appendPlayerFiltersToTeam',{
                              playerType: 'startingLineup',
                              teamName: homeTeam
                            });
                            return ulObj;
                          })
                          .append(
                            $('<p />')
                              .text('Subs')
                          )
                          .append(function(){
                            var ulObj = selfObj.heatmap('appendPlayerFiltersToTeam',{
                              playerType: 'substitutes',
                              teamName: homeTeam
                            });
                            return ulObj;
                          })
                          .attr('class','iscroll-wrapper')
                      )
                      .attr({
                        'class': 'tab-content',
                        id: heatmapId + '-home'
                      })
                  )
                  .append(
                    $('<div />')
                      .append(
                        $('<div />')
                          .append(function(){
                            var ulObj = selfObj.heatmap('appendPlayerFiltersToTeam',{
                              playerType: 'startingLineup',
                              teamName: awayTeam
                            });
                            return ulObj;
                          })
                          .append(
                            $('<p />')
                              .text('Subs')
                          )
                          .append(function(){
                            var ulObj = selfObj.heatmap('appendPlayerFiltersToTeam',{
                              playerType: 'substitutes',
                              teamName: awayTeam
                            });
                            return ulObj;
                          })
                          .attr('class','iscroll-wrapper')
                      )
                      .attr({
                        'class': 'tab-content',
                        id: heatmapId + '-away'
                      })
                  )
                  .attr('class','inner')
              )
              .attr('class','flyout')
          );
      }
      else{
        // Add an overriding CSS classname for heatmaps which are defined not to show the (flyout) filter options
        selfObj.addClass('hideFlyout');
      }
      
      // Add the goal lines to the pitch
      $('.map',selfObj)
        .IF(!isGoalMouth)
          .append(
            $('<div />')
              .attr('class','lines')
          )
        .ENDIF()
        
      // Add the direction of play footer message
      $('<p />')
        .append(
          $('<strong />')
            .append(
              $('<span />')
                .text('Direction of play')
            )
        )
        .attr('class','direction')
        .insertAfter($('.map',selfObj));
      
      // Create a single unified <canvas> data layer per heatmap instance
      $.logEvent('[$.fn.heatmap (build)]: heatmapId=' + heatmapId);
      
      var heatmapSize = selfObj.hasAttr('data-compact') ? 'small' : 'regular';
      
      heatmap.configuration.heatmapLayers[heatmapId] = h337.create({
        blur: 1,
        container: document.getElementById('heatmap-' + heatmapId),
        gradient: heatmap.configuration.gradient,
        maxOpacity: 1,
        minOpacity: 0,
        radius: heatmap.configuration.radius[heatmapSize]
      });
      
      // Assign unique id to the <canvas> element
      $('#heatmap-' + heatmapId + ' CANVAS').attr('id','canvas-' + heatmapId);
      
      // Set the dimensions for the internal (gesture-based) scrolling
      if(showFlyout){
        selfObj.heatmap('defineHeights');
      }

      // Auto-toggle the first team tab active
      $('.tab-triggers LI:eq(0) A',selfObj).click();
      
      // Loop through all selected filters, in order to retrieve the necessary data for the selected players
      // Process the active players in order to work out the maximum value for the heatmap
      var redefineMaximumValue = false;
      
      $.each(selectedFilters,function(index,filterName){
        if(index+1 === selectedFilters.length){
          redefineMaximumValue = true;
        }
        
        // Add a single filters dataset to the flattened dataset
        selfObj.heatmap('addSingleFilterDataset',{
          filterName: filterName,
          redefineMaximumValue: redefineMaximumValue
        });
      });
            
      // If the heatmap is a goalmouth heatmap type, add a dynamic scrubber bar to enable the user to scroll through the events, one-by-one
      // Otherwise, add a scrollbar to process the scrolling for the internal scroller/filters
      if(isGoalMouth){
        selfObj
          .addClass('goal-mouth')
          .sliderBar('goalMouthSlider');
      }
      else{
        if(showFlyout){
          selfObj.sliderBar('filtersSlider');
        }
      }
    },
        
    /**
    * Add a single filters dataset to the flattened dataset
    * @method addSingleFilterDataset
    * @param {STRING} filterName The filter which needs to have its data attached to the flattened dataset
    * @param {BOOLEAN} redefineMaximumValue Whether or not the maximum value needs to be updated and sent to the heatmap (which also triggers a canvas re-paint)
    */
    addSingleFilterDataset: function(obj){
      $.logEvent('[$.fn.heatmap (addSingleFilterDataset)]: ' + $.logJSONObj(obj));

      var selfObj = $(this);
      var localDataPoints = selfObj.data('dataPoints').data;
      var selectedFilters = selfObj.data('selectedFilters');

      $.each(selfObj.data('jsonData')[obj.filterName],function(coordinatesIndex,coordinatesDataObj){
        localDataPoints.push(coordinatesDataObj);
      });

      // Update the stored (flattened) data points
      selfObj.data('dataPoints').data = localDataPoints;
      
      // Update the counters, to enable the max count value to be re-calculated
      if(obj.redefineMaximumValue){
        // Add the newly selected filter to the stored filters
        if($.inArray(obj.filterName,selectedFilters) === -1){
          selectedFilters.push(obj.filterName);
          selfObj.data('selectedFilters',selectedFilters);  
        }
        
        // Add the required data points to a unique array, used to store the combined dataset, in response to the filters selected
        selfObj.heatmap('renderDataPointsToCanvasLayer',{
          max: heatmap.configuration.intensityMaximum
        });
      }
    },
    
    /**
    * Remove a single filters dataset from the flattened dataset
    * @method removeSingleFilterDataset
    * @param {STRING} filterName The filter which needs to have its data removed from the flattened dataset
    */
    removeSingleFilterDataset: function(obj){
      $.logEvent('[$.fn.heatmap (removeSingleFilterDataset)]: ' + $.logJSONObj(obj));
      
      var selfObj = $(this);
      
      // Find all coordinates which DO NOT match the filter dataset to be removed. These will form the new flattened dataset
      var coordinatesToKeep = $.grep(selfObj.data('dataPoints').data,function(o,i){
        return o.filterId !== obj.filterName;
      },false);
      
      $.logEvent('[$.fn.heatmap (removeSingleFilterDataset)]: coordinatesToKeep=' + coordinatesToKeep);
      
      // Find all coordinates which DO match the filter dataset to be removed. These will be removed from the new flattened dataset
      var coordinatesToRemove = $.grep(selfObj.data('dataPoints').data,function(o,i){
        return o.filterId === obj.filterName;
      },false);
      
      $.logEvent('[$.fn.heatmap (removeSingleFilterDataset)]: coordinatesToRemove=' + coordinatesToRemove);
      
      // Update the stored (flattened) data points
      selfObj.data('dataPoints').data = coordinatesToKeep;
      
      // Remove the newly selected filter from the stored filters
      var selectedFilters = selfObj.data('selectedFilters');
      
      selectedFilters = $.grep(selectedFilters,function(value){
        return value != obj.filterName;
      });
      
      selfObj.data('selectedFilters',selectedFilters);
      
      // Add the required data points to a unique array, used to store the combined dataset, in response to the filters selected
      selfObj.heatmap('renderDataPointsToCanvasLayer',{
        max: heatmap.configuration.intensityMaximum
      });
    },
    
    /**
    * Add the required data points to a unique array, used to store the combined dataset, in response to the filters requested
    * @method renderDataPointsToCanvasLayer
    * @param {INTEGER} max The maximum value to set within the heatmap
    */
    renderDataPointsToCanvasLayer: function(obj){
      var selfObj = $(this);
      var heatmapId = selfObj.attr('data-heatmap-id');
      
      selfObj.data('dataPoints').max = obj.max;
      
      // Provide a default empty data set upon creation for each heatmap <canvas> layer
      heatmap.configuration.heatmapLayers[heatmapId].setData(selfObj.data('dataPoints'));

      // Blur all <canvas> dataPoints
      if(heatmap.configuration.blur.enabled){
        var canvasObj = $('#canvas-' + heatmapId);
        var height = canvasObj.height();
        var width = canvasObj.width();
        
        stackBlurCanvasRGBA('canvas-' + heatmapId,0,0,width,height,heatmap.configuration.blur.radius);
      }
    },
            
    /**
    * Set the dimensions for the internal (gesture-based) scrolling
    * @method defineHeights
    */
    defineHeights: function(){
      $.logEvent('[$.fn.heatmap (defineHeights)]');
      
      var selfObj = $(this);
      var tabTriggersObj = $('.tab-triggers',selfObj);
      var tabContentObj = $('.tab-content',selfObj);
      
      // Retrieve the height of the container, regardless of orientation
      var containerHeight = parseInt($('.map',selfObj).attr('data-height'));
      var tabContentHeight = containerHeight - tabTriggersObj.outerHeight();
      
      // Set the height of the container for iScroll
      tabContentObj
        .attr('data-height',tabContentHeight)
        .css('height',tabContentHeight);
            
      $('.tab-content',selfObj).each(function(){
        var tabContentId = $(this).attr('id');
        heatmap.configuration.heatmapScrollers[tabContentId] = new IScroll('#' + tabContentId,{
          //bounce: false,
          mouseWheel: true,
          probeType: 3
        });
        
        heatmap.configuration.heatmapScrollers[tabContentId].on('scroll',function(){
        
          // Don't update the scrollbar, if the current (bound) IScroll offset is beyond the top threshold
          if(this.y > 0){
            return false;
          }
        
          var max = $('#' + tabContentId + ' .vertical-scrollbar').slider('option','max');
  
          $('#' + tabContentId + ' .vertical-scrollbar').slider({
            value: max-Math.abs(this.y>>0)
          });
        });
      });
    },
    
    /**
    * Attach the list of players to the flyout
    * @method appendPlayerFiltersToTeam
    * @param {STRING} playerType Whether the players started the match or were a substitute
    * @param {STRING} teamName The name of the team to retrieve the player names from the JSON
    * @return {OBJECT} The DOM object representing the player filters
    */
    appendPlayerFiltersToTeam: function(obj){
      $.logEvent('[$.fn.heatmap (appendPlayerFiltersToTeam)]: ' + $.logJSONObj(obj));

      var selfObj = $(this);
      var heatmapId = selfObj.attr('data-heatmap-id');      
      var ulObj = $('<ul />');
      var storedFilters = selfObj.data('selectedFilters').toString();
      var playerTypeNodeName = obj.playerType === 'startingLineup' ? 'filterContentsStartingLineupData' : 'filterContentsSubstitutesData';
            
      if(storedFilters.indexOf(',') >-1){
        storedFilters = storedFilters.split(','); 
      }
      else{
        storedFilters = [storedFilters];
      }
                    
      $.each(selfObj.data(playerTypeNodeName)[obj.teamName],function(filterIndex,filterName){     
        // Add the option to the select element
        ulObj
          .append(
            $('<li />')
              .append(
                $('<div />')
                  .append(
                    $('<label />')
                  )
                  .attr('class','checkbox')
              )
              .append(
                $('<label />')
                  .text(heatmap.configuration.playerNames[filterName])
              )
              .attr('data-value',filterName)
              .IF($.inArray(filterName,storedFilters) !== -1)
                .attr('class','active')
              .ENDIF()
          )
      });
      
      return ulObj;
    },
        
    /**
    * Refresh heatmap
    * @method refresh
    * @param {BOOLEAN} showFlyout Whether to showo the flyout menu option or not
    * @param {STRING} selectedFilters The comma separated list of filters to show data for
    */
    refresh: function(obj){
      $.logEvent('[$.fn.heatmap (refresh)]: ' + $.logJSONObj(obj));
      
      var selfObj = $(this);
      
      // Reset all persistent data properties and associated values
      selfObj.data({
        dataPoints: null,
        jsonData: null,
        filterContentsStartingLineupData: null,
        filterContentsSubstitutesData: null
      });
      
      // Update inline data property values, ready for re-initialization
      selfObj
        .removeClass('hideFlyout')
        .removeAttr('data-flyout')
        .IF(obj.showFlyout)
          .attr('data-flyout','')
        .ELSE()
          .removeAttr('data-flyout')
        .ENDIF()
        .attr('data-selected-filters',obj.selectedFilters)
        .heatmap('init');       
    },
    
    /**
    * Simulate an auto-updating heatmap
    * @method automateUpdate
    */
    automateUpdate: function(){
      var selfObj = $(this);
      
      if(heatmap.configuration.automation.counter === 1661){
        clearInterval(heatmap.configuration.automation.interval);
      }
      
      // Attach the new data to the heatmap
      selfObj.data('dataPoints').data.push(matchData[heatmap.configuration.automation.counter]);
      heatmap.configuration.automation.counter = heatmap.configuration.automation.counter + 1;
      
      // Add the required data points to a unique array, used to store the combined dataset, in response to the filters selected
      selfObj.heatmap('renderDataPointsToCanvasLayer',{
        max: heatmap.configuration.intensityMaximum
      });
    }
  };
  
  // Initialize plugin
  $.fn.heatmap = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));