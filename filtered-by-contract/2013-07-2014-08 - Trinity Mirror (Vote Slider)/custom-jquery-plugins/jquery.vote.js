(function(jQuery){    
  var voteConfiguration = {
    easingEquation: 'easeInOutExpo',
    maximumStep: 11,
    timings: {
      confirmationVisibleTime: 2500,
      confirmationToggleSpeed: 250,
      submissionPause: 2000
    }
  }
  
  var methods = {
    /**
    * Build the vote/slider dynamically
    * @method init
    */
    init: function(obj){
      $.logEvent('[$.fn.vote (init)]');

      return this.each(function(){
        var selfObj = $(this);
        
        // Create the scale of numbers above each slider instance
        selfObj.vote('createScale');
        
        $('.sliderbar',selfObj).slider({
          min: 1,
          max: voteConfiguration.maximumStep,
          step: 1,
          start: function(event,ui){
            // Remove any previous submitting or success classnames
            $('.scale LI[class*="submitting"]',selfObj).removeClass('submitting');
            $('.scale LI[class*="success"]',selfObj).removeClass('success');
            
            $('.ui-slider-handle',selfObj)
              .removeClass('submitting')
              .removeClass('success');
          },
          slide: function(event,ui){
            $('.scale LI:eq(' + (ui.value-1) + ')',selfObj).addClass('active-scroll').siblings().removeClass('active-scroll');
          },
          stop: function(event,ui){
            // Add specific 'locked' styles to the vote component whilst the vote is being logged
            selfObj.addClass('locked');
            
            // Disable the slider until the update is complete
            $('.sliderbar',selfObj).slider({disabled: true});
          
            var sliderHandleObj = $('.ui-slider-handle',selfObj);
            var scaleLabelObj = $('.scale LI:eq(' + (ui.value-1) + ')',selfObj);
            
            // Update the scale in time with the updates
            scaleLabelObj
              .addClass('submitting')
              .siblings()
                .removeClass('submitting')
                .removeClass('success');

            // Update the style of the slider handle (to submitting)
            sliderHandleObj
              .addClass('submitting');
            
            // The score update has successfully been registered, change the slider handles status to reflect this
            setTimeout(function(){
              var totalVotes = parseInt(selfObj.attr('data-total-votes'));
              var totalScore = parseInt(selfObj.attr('data-total-score'));

              // Increment the total(s)
              totalVotes = totalVotes + 1;
              selfObj.attr('data-total-votes',totalVotes);

              totalScore = totalScore + (ui.value-1);
              selfObj.attr('data-total-score',totalScore);

              var fansAverage = (parseInt(selfObj.attr('data-total-score')) / parseInt(selfObj.attr('data-total-votes'))).toFixed(1);

              $.logEvent('[$.fn.vote (init)]: totalVotes=' + totalVotes + ', totalScore=' + totalScore + ', selected score=' + (ui.value-1) + ', fans average=' + fansAverage);

              // Update the average score in the calling vote component
              $('.fans-average STRONG',selfObj).html(fansAverage);
              
              // Update visual states
              scaleLabelObj
                .addClass('success');
            
              sliderHandleObj
                .removeClass('submitting')
                .addClass('success');

              // Generate and show the success message, before re-enabling the slider control
              $('<p />')
                .append(
                  $('<strong />')
                    .html('Thankyou for your vote')
                )
                .attr('class','confirmation') 
                .insertAfter($('.results',selfObj))
                .animate({
                  height: 'show'
                }, {
                  complete: function(){
                    setTimeout(function(){
                      $('.confirmation',selfObj).animate({
                        height: 'hide'
                      },{
                        complete: function(){
                          // Re-enable the slider with the update now complete
                          $('.sliderbar',selfObj).slider({disabled: false});
                          
                          // Remove the locked styling
                          selfObj.removeClass('locked');
                          
                          // Remove all previously created confirmation messages
                          $('.confirmation',selfObj).remove();
                        },
                        duration: voteConfiguration.timings.confirmationToggleSpeed,
                        easing: voteConfiguration.easingEquation
                      })
                    },voteConfiguration.timings.confirmationVisibleTime);
                  },
                  duration: voteConfiguration.timings.confirmationToggleSpeed,
                  easing: voteConfiguration.easingEquation
                });
            },voteConfiguration.timings.submissionPause);
          },
          value: 1
        });
      });
    },
    
    /** 
    * Create the scale of numbers above each slider instance
    * @method createScale
    */
    createScale: function(){
      $.logEvent('[$.fn.vote (init)]');
      
      var selfObj = $(this);
      var scaleObj = $('<ul />').attr('class','scale');
      
      for(var i=0; i<=voteConfiguration.maximumStep-1; i++){
        scaleObj
          .append(
            $('<li />')
              .attr('class','scale-' + i)
              .html(i)
          )
      }
      
      scaleObj.insertBefore($('.sliderbar',selfObj));
    }
  };
  
  // Initialize plugin
  $.fn.vote = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));

var debugLogging = true;

// jQuery extensions
$.extend({
  /**
  * Logging, based on whether it has been configured to log or not
  * @method logEvent
  * @param {String} Event The event to log
  */
  logEvent: function(event){
    if(debugLogging){
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