(function(jQuery){
  var barGraphConfiguration = {
    svgPaletteToUse: 'dark', // A default has to be specified, which can be overwritten, if 'light' is specified within the JSON
    svgPalettes: {
      dark: {
        axisTitleColor: '#333',
        gridColor: '#999',
        textColor: '#333'
      },
      light: {
        axisTitleColor: '#fff',
        gridColor: '#fff',
        textColor: '#fff'
      }
    },
    autoMarginOffset: 0,
    fillAlpha: 1,
    gridAlpha: 0,
    gridPosition: 'start',
    labelRotation: 90,
    lineAlpha: 0,
    marginRight: 10,
    marginTop: 10
  }
      
  var methods = {
    /**
    * Build the chart dynamically
    * @method init
    * @param (STRING} svgPalette The name of the colour paletter to use
    * @param (STRING} orientation Whether the bar graph should run in horizontal or vertical mode
    */
    init: function(obj){
      $.logEvent('[$.fn.barGraph (init)]: ' + $.logJSONObj(obj));
      
      var device = dataVisualization.configuration.device;
      var selfObj = $(this);
      var dataObj = selfObj.data('interactive');
      var rotate = (dataObj.orientation == 'horizontal' ? true : false); // true for horizontal, false for vertical
      
      // Check to see whether an SVG palette has been specified   
      if(obj.svgPalette != null){
        barGraphConfiguration.svgPaletteToUse = obj.svgPalette;
      }
      
      // Chart
      var chartObj = new AmCharts.AmSerialChart();
      
      chartObj.dataProvider = dataObj.data;
      
      chartObj.autoMarginOffset = barGraphConfiguration.autoMarginOffset;
      chartObj.balloon.enabled = false;
      chartObj.categoryField = 'labelText';
      chartObj.fontFamily = 'PT Sans';
      chartObj.marginRight = dataObj['margin-right'] ? dataObj['margin-right'] : barGraphConfiguration.marginRight;
      chartObj.marginTop = barGraphConfiguration.marginTop;
      chartObj.rotate = rotate; 
      chartObj.startDuration = dataVisualization.configuration.timings.pluginStartDuration[device];

      // y-Axis
      var yAxis = chartObj.categoryAxis;

      yAxis.axisColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].gridColor
      yAxis.color = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].textColor
      yAxis.gridAlpha = barGraphConfiguration.gridAlpha;
      yAxis.gridColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].gridColor      
      yAxis.gridPosition = barGraphConfiguration.gridPosition;
      yAxis.labelsEnabled = dataObj.axis.labelsVisible.y;     
      
      // If the y-axis label is not set to be visible, set the tick length to be hidden
      if(!dataObj.axis.labelsVisible.y){
        yAxis.tickLength = 0;
      }
      
      yAxis.labelRotation = barGraphConfiguration.labelRotation;
      yAxis.title = dataObj.axis.y;
            
      // Only show the y-axis title if specified within the JSON
      yAxis.title = dataObj.axis.titlesVisible.y ? dataObj.axis.y : '';     
      yAxis.titleColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].axisTitleColor;     
      
      // x-Axis
      var xAxis = new AmCharts.ValueAxis();

      // Set a maximum axis value, if specified within the JSON
      if(dataObj.axis['value-axis'] != undefined){
        xAxis.maximum = dataObj.axis['value-axis'].maximum;
      }

      // Set a minimum axis value, if specified within the JSON
      if(dataObj.axis['value-axis'] != undefined){
        xAxis.minimum = dataObj.axis['value-axis'].minimum;
      }
      
      xAxis.axisColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].gridColor
      xAxis.color = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].textColor
      xAxis.gridAlpha = barGraphConfiguration.gridAlpha;
      xAxis.gridColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].gridColor

      // Should the value axis only show integers, rather than supporting floats?
      if(dataObj['integers-only']){
        xAxis.integersOnly = true;      
      }

      xAxis.labelsEnabled = dataObj.axis.labelsVisible.x;
      
      // If the x-axis label is not set to be visible, set the tick length to be hidden
      if(!dataObj.axis.labelsVisible.x){
        xAxis.tickLength = 0;
      }
            
      // Only show the x-axis title if specified within the JSON
      xAxis.title = dataObj.axis.titlesVisible.x ? dataObj.axis.x : '';     
      xAxis.titleColor = barGraphConfiguration.svgPalettes[barGraphConfiguration.svgPaletteToUse].axisTitleColor; 

      chartObj.addValueAxis(xAxis);

      // Graph-specific settings
      var graphObj = new AmCharts.AmGraph();
      
      graphObj.colorField = 'color';
      graphObj.fillAlphas = barGraphConfiguration.fillAlpha;
      graphObj.lineAlpha = barGraphConfiguration.lineAlpha;
      graphObj.type = 'column';
      graphObj.valueField = 'value';

      // Add the graph to the chart object
      chartObj.addGraph(graphObj);

      // Add the heading to the component (provided it exists in the JSON)
      if(dataObj.headline != undefined){  
        $('<h3 />')
          .html(dataObj.headline)
          .insertBefore(selfObj.parent())
      }
      
      // Add the description to the component (provided it exists in the JSON)
      if(dataObj.description != undefined){ 
        selfObj
          .parent()
            .append(
              $('<p />')
                .html(dataObj.description)
            )
      }       
                  
      // Build the standalone key for the graph (if required)
      if(dataObj['generate-key']){
        selfObj.barGraph('generateKey',{dataObj: dataObj});
      }
                  
      // Once the graph has been added to the DOM, remove the overlay
      selfObj
        .parents('.module')
          .find('.overlay')
            .fadeOut(dataVisualization.configuration.timings.hideOverlay[device],function(){              
              // Make sure that before rendering, the visualization sits at 100% width of its container
              chartObj.invalidateSize();
              chartObj.write(selfObj.attr('id'));     

              // Store a reference to the chart object, for re-rendering upon responsive resizing
              window[selfObj.attr('id')] = chartObj;
            
              // Be sure to complete this process after the bars have finished animating
              setTimeout(function(){
                if(!selfObj.attr('data-initialized')){
                  // Notify dispatcher that a component has finished initializing
                  dataVisualization.dispatcher.initializeComplete({
                    finishedId: selfObj.attr('id')
                  });
                }
                
                // Set flag so that this complete callback will not ever be called again
                selfObj.attr('data-initialized',true);
              },dataVisualization.configuration.timings.pluginStartDuration[device]*1000);
            });
    },
    
    /**
    * Build the standalone key for the graph (if required)
    * @method generateKey
    * @param {OBJECT} dataObj The complete dataset for the interactive element
    */    
    generateKey: function(obj){
      $.logEvent('[$.fn.barGraph (generateKey)]');
      
      var selfObj = $(this)
      var keyContent = '';
      
      $('<ul />')
        .html(function(){
          $.each(obj.dataObj.key.colors,function(index){
            keyContent += '<li style="color:' + this + '"><span style="background:' + this + '">Key color=' + this + '</span>' + obj.dataObj.key.labels[index] + '</li>';
          });
          
          return keyContent;
        })
        .attr('class','key')
        .appendTo(selfObj.parents('.module'))
    }
  };
  
  // Initialize plugin
  $.fn.barGraph = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));