(function(jQuery){
  var configuration = {
    innerRingColor: '#e80e0d',
    intervals: {},
    lineWidthInner: 15,
    lineWidthOuter: 25,
    interval: null,
    outerRingColor: '#dedede',
    textColor: '#000000'
  };
    
  var methods = {   
    /**
    * Create gauges
    * @method init
    */
    create: function(){
      var selfObj;
      
      this.each(function(index){
        selfObj = $(this);
        
        // Create a holder for the interval for each gauge
        configuration.intervals['gauge-' + index] = null;
                
        // Assign persistent storage, to maintain uniqueness and create <canvas /> DOM element
        selfObj
          .attr({
            'data-animation-loop': null,
            'data-degrees': 0,
            'data-new-degrees': null,
            'data-difference': null
          })
          .append(
            $('<p />')
              .text(selfObj.attr('data-lastname'))
              .prepend(
                $('<strong />')
                  .text(selfObj.attr('data-firstname'))
              )
          )
          .append(
            $('<canvas />')
              .attr({
                height: selfObj.width(),
                id: 'gauge-' + index,
                width: selfObj.width()
              })
          );
          
          selfObj.css('height',selfObj.height());
          selfObj.gauge('draw');
          
      });
    },
    
    /**
    * Initialize gauge
    * @method init
    */
    init: function(){
      var selfObj = $(this);
      var canvasId = $('CANVAS',selfObj).attr('id');
      var canvasObj = document.getElementById(canvasId);
      var context = canvasObj.getContext('2d');
      var canvasWidth = canvasObj.width;
      var canvasHeight = canvasObj.height;
      var widthInner = canvasWidth/2.5; 
      var degrees = parseInt(selfObj.attr('data-degrees'));
      var textObj;
      var outerRingColor = selfObj.hasAttr('data-outer-color') ? selfObj.attr('data-outer-color') : configuration.outerRingColor;
      var innerRingColor = selfObj.hasAttr('data-inner-color') ? selfObj.attr('data-inner-color') : configuration.innerRingColor;
      var textColor = selfObj.hasAttr('data-text-color') ? selfObj.attr('data-text-color') : configuration.textColor;
      
      context.clearRect(0,0,canvasWidth,canvasHeight);
      
      // Create a 360 degree arc
      context.beginPath();
      context.strokeStyle = outerRingColor;
      context.lineWidth = configuration.lineWidthInner;
      context.arc(canvasWidth/2,canvasHeight/2,widthInner,0,Math.PI*2,false);     
      context.stroke();
      
      // Angle in radians = angle in degrees * PI / 180
      var radians = degrees*Math.PI/180;
      context.beginPath();
      context.strokeStyle = innerRingColor;
      context.lineWidth = configuration.lineWidthOuter;
      
      // Start the arc from the right most end
      context.arc(canvasWidth/2,canvasHeight/2,widthInner,0-90*Math.PI/180,radians-90*Math.PI/180,false); 
      context.stroke();
      
      // Attach the centralized text
      context.fillStyle = textColor;
      context.font = '50px mirror-condensed-semi-bold';
      textObj = Math.floor(degrees/360*100) + '%';
      text_width = context.measureText(textObj).width;
      context.fillText(textObj,canvasWidth/2-text_width/2,canvasHeight/2+15);
    },
    
    /**
    * Draw gauge
    * @method draw
    */
    draw: function(){   
      var selfObj = $(this);
      var canvasObj = $('CANVAS',selfObj);
      var canvasId = canvasObj.attr('id');
      var dataPercentage = parseInt(selfObj.attr('data-percentage'));
      var newDegrees = Math.round(3.6*dataPercentage);
      var difference = newDegrees - parseInt(selfObj.attr('data-degrees'));
      
      if(typeof intervalObj !== undefined){
        clearInterval(configuration.intervals[canvasId]);
      }
            
      // Specify degree of arc (currently randomized)     
      selfObj.attr('data-new-degrees',newDegrees);
      
      selfObj.attr('data-difference',selfObj.attr('data-new-degrees')-selfObj.attr('data-degrees'));
      
      configuration.intervals[canvasId] = setInterval(function(){
        selfObj.gauge('animate');
      },1000/difference);
    },
    
    /**
    * Animate the gauge to its final position
    * @method animate
    */
    animate: function(){    
      var selfObj = $(this);
      var canvasObj = $('CANVAS',selfObj);
      var canvasId = canvasObj.attr('id');
      var degrees = parseInt(selfObj.attr('data-degrees'));
      var newDegrees = parseInt(selfObj.attr('data-new-degrees'));

      if(degrees < newDegrees){
        degrees++;
      }
      else{
        degrees--;
      }
      
      if(degrees === newDegrees){
        clearInterval(configuration.intervals[canvasId]);
      }

      // Update the current degree offset
      selfObj.attr('data-degrees',degrees);

      selfObj.gauge('init');
    }
  };
  
  // Initialize plugin
  $.fn.gauge = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));

$.fn.extend({
  hasAttr: function(name){  
    return this.attr(name) !== undefined;
  }
});