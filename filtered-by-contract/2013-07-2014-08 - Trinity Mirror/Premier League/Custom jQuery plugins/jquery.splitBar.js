(function(jQuery){    
  var splitBarConfiguration = {
    easing: 'easeInOutExpo',
    easingRefresh: 'linear',
    timings: {
      animateIntoView: 1500,
      websocketReanimateBar: 250
    }
  }
  
  var methods = { 
    /** 
    * With all split bars injected, animate them to the final size
    * @method animateIntoView
    * @param {BOOLEAN} initialLoad Whether the animation is the first (longer duration) or a refreshed set of data (shorter duration)
    */
    animateIntoView: function(obj){
      $.logEvent('[$.fn.splitBar (animateIntoView)]: ' + $.logJSONObj(obj));
      
      var homeTeamObj;
      var awayTeamObj;
      var splitBarObj;
      var selfObj = $(this);
      
      return this.each(function(){
        splitBarObj = $(this);
        homeTeamObj = $('LI:first',splitBarObj);
        awayTeamObj = $('LI:last',splitBarObj);

        // Ensure that the graph is set to 'loaded'
        if(!selfObj.hasClass('loaded')){
          setTimeout(function(){
            selfObj.addClass('loaded');
          },splitBarConfiguration.timings.animateIntoView);
        }

        homeTeamObj.animate({
          width: parseInt(homeTeamObj.attr('data-value')) + '%'
        },{
          duration: obj.initialLoad ? splitBarConfiguration.timings.animateIntoView : splitBarConfiguration.timings.websocketReanimateBar,
          easing: obj.initialLoad ? splitBarConfiguration.easing : splitBarConfiguration.easingRefresh
        });

        awayTeamObj.animate({
          width: parseInt(awayTeamObj.attr('data-value')) + '%'
        },{
          duration: obj.initialLoad ? splitBarConfiguration.timings.animateIntoView : splitBarConfiguration.timings.websocketReanimateBar,
          easing: obj.initialLoad ? splitBarConfiguration.easing : splitBarConfiguration.easingRefresh
        }); 
      });
    },
    
    /**
    * Refresh a split bar graph in response to JSON content
    * @method refresh
    * @param {OBJECT} data The updated JSON data for the bar graph
    */
    refresh: function(obj){
      $.logEvent('[$.fn.splitBar (build)]: ' + $.logJSONObj(obj));
      
      var splitBarGraphObj;
      var splitBarObj;
      
      return this.each(function(){
        splitBarGraphObj = $(this);
        
        // Iterate through the In Summary JSON, and update the corresponding split bar with the new data
        $.each(obj.data.data,function(index,dataObj){
          splitBarObj = $('.split-bar[data-title="' + this.title + '"]',splitBarGraphObj);
          
          // Work out the correct values/format (% or not) for home and away values
          var barValuesObj = premierLeague.inSummary.homeAwayValues({
            homeValue: this.values.home,
            awayValue: this.values.away,
            percentages: this.percentages
          });
          
          // Update the data attributes and associated visual labels, before re-animating to those values
          splitBarObj
            .find('STRONG:first').html(this.percentages ? barValuesObj.homeValue + '%' : this.values.home)
            .end()
            .find('STRONG:last').html(this.percentages ? barValuesObj.awayValue + '%' : this.values.away)
            .end()
            .find('LI:first').attr('data-value',barValuesObj.matchedValues ? 50 : barValuesObj.homeValue).html(this.percentages ? barValuesObj.homeValue + '%' : this.values.home)
            .end()
            .find('LI:last').attr('data-value',barValuesObj.matchedValues ? 50 : barValuesObj.awayValue).html(this.percentages ? barValuesObj.awayValue + '%' : this.values.away)
        });
        
        // With all split bars injected, animate them to the final size
        $('.split-bar',splitBarGraphObj).splitBar('animateIntoView',{initialLoad: false});
      });
    }   
  };
  
  // Initialize plugin
  $.fn.splitBar = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));