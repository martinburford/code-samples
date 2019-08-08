(function(jQuery){  
  var methods = {
    /**
    * Initialize all <table> elements
    * @method init
    */
    init: function(){
      // Add configuration settings for all tables to the core configuration
      $.extend(ao.configuration,{
        table: {
          bounce: true,
          disableMouse: true,
          disablePointer: true,
          eventPassthrough: true,
          instances: [],
          mouseWheel: false,
          probeType: 3,
          scrollX: true,
          scrollY: false
        }
      });
      
      $.logEvent('[$.fn.table (init)]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.table));
            
      var tableObj;
      
      return this.each(function(index){
        tableObj = $(this);
        tableObj
          .attr('id','table-' + (index+1))
          .table('attachIScroll',{
            id: 'table-' + (index+1)
          });
        
        // Process any logic specific to advanced tables (with a single locked heading)
        if(tableObj.hasClass('advanced')){
          // DOM inject the necessary locked triggers
          // Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
          tableObj.table('advancedInit');
        }
      });
    },
    
    /**
    * DOM inject the necessary locked triggers
    * Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
    * @method advancedInit
    */
    advancedInit: function(){
      $.logEvent('[$.fn.table (advancedInit)]');
      
      var tableObj = $(this);
      var headings = [];
      
      $('TBODY TR',tableObj).each(function(){
        headings.push($('TH:eq(0)',this).text());
      });
      
      // Create the container for the advanced table
      tableObj.wrap('<div class="table-wrapper"></div>');
      
      // Attach the headings DOM element
      tableObj
        .parents('.table-wrapper')
          .prepend(function(){
            var ulObj = $('<ul />').attr('class','headings');
            
            $.each(headings,function(index,value){
              ulObj
                .append(
                  $('<li />')
                    .text(value)
                )
            });
            
            return ulObj;
          }).table('setHeights'); // Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
    },
    
    /**
    * Attach IScroll functionality to an individual <table> element
    * @method attachIScroll
    * @param {STRING} id The id of the tables wrapper DOM element
    */
    attachIScroll: function(obj){
      $.logEvent('[$.fn.table (attachIScroll)]');
            
      var tableObj = $(this);
      var IScrollObj = new IScroll('#' + obj.id,{
        bounce: ao.configuration.table.bounce,
        disableMouse: ao.configuration.table.disableMouse,
        disablePointer: ao.configuration.table.disablePointer,
        eventPassthrough: ao.configuration.table.eventPassthrough,
        mouseWheel: ao.configuration.table.mouseWheel,
        probeType: ao.configuration.table.probeType,
        scrollX: ao.configuration.table.scrollX,
        scrollY: ao.configuration.table.scrollY       
      });
      
      IScrollObj.on('scroll',function(){
        var tableObj = $(this.wrapper);
        var delta = parseInt(tableObj.attr('data-delta'));
        var currentOffset = this.x>>0;
        
        $('.offset',tableObj).text('Offset: ' + currentOffset);
        
        // Should the right-hand boundary gradient be added?
        if(Math.abs(currentOffset)*1 < delta){
          tableObj.addClass('scrolling-next');
        }
        else{
          tableObj.removeClass('scrolling-next');
        }
        
        // Should the left-hand boundary gradient be added?
        if(currentOffset >= 0){
          tableObj.removeClass('scrolling-previous');
        }
        else if(Math.abs(currentOffset)*1 > 0 && Math.abs(currentOffset)*1 < delta){
          tableObj.addClass('scrolling-previous');
        }
      });
      
      // Store a reference to the IScroll instance, in case it needs to be accessed/manipulated at a later time
      ao.configuration.table.instances.push(IScrollObj);
      
      // Set the widths of both the overall table and the wrapper container as data attributes
      tableObj.table('setWidths');
      
      // Add the indicators (for mobile use only)
      tableObj.table('addIndicators');
    },
    
    /**
    * Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
    * @method setHeights
    */
    setHeights: function(){
      var tableObj = $('TABLE',this);
      var headingsObj = $('.headings',this);
      var rowMaximum;
        
      $('TBODY TR',tableObj).each(function(index){
        rowMaximum = $('TH',this).actual('outerHeight');
                  
        $('TH,TD',this).css('height',rowMaximum);
        $('LI:eq(' + index + ')',headingsObj).css('height',rowMaximum);
      });
      
      $.logEvent('[$.fn.table (setHeights)]: row height=' + rowMaximum);
    },
    
    /**
    * Set the widths of both the overall table and the wrapper container as data attributes
    * @method setWidths
    */
    setWidths: function(){
      var wrapperObj = $(this);
      var tableObj = $('TABLE',wrapperObj);
      var wrapperWidth = wrapperObj.actual('outerWidth');
      var innerTableWidth = tableObj.actual('outerWidth');      
      var delta = innerTableWidth - wrapperWidth;
      
      wrapperObj
        .attr({
          'data-bounds-left': 0,
          'data-bounds-right': wrapperWidth,
          'data-delta': delta,
          'data-table-width': tableObj.actual('outerWidth'),
          'data-wrapper-width': wrapperObj.actual('outerWidth')
        }).removeClass('scrolling-previous').removeClass('scrolling-next');
      
        $.logEvent('[$.fn.table (setWidths)]: bounds-left=0, bounds-right=' + wrapperWidth + ', table-width=' + tableObj.actual('outerWidth') + ', wrapper-width=' + wrapperObj.actual('outerWidth'));
      
      // Ensure that the initial scrolling right-hand gradient is added, if a table has scrolling 
      if(delta > 0){
        wrapperObj.addClass('scrolling-next');
      }
      
      $('.debug',wrapperObj).text(wrapperObj.attr('class') + ', delta=' + delta);
      
      // Having set the widths, reset the scroll position to always be left:0
      var instanceIndex = parseInt(wrapperObj.attr('id').replace('table-',''))-1;
      ao.configuration.table.instances[instanceIndex].scrollTo(0,0,0);
    },
    
    /**
    * Add the indicators (for mobile use only)
    * @method addIndicators
    */
    addIndicators: function(){
      $.logEvent('[$.fn.table (addIndicators)]');
      
      var selfObj = $(this);
      
      selfObj
        .append(
          $('<ul />')
            .append(
              $('<li />')
                .attr('class','previous-data')
                .text('Scroll left for more data records')
            )
            .append(
              $('<li />')
                .attr('class','next-data')
                .text('Scroll right for more data records')
            )
            .attr('class','indicators')
        )
    }
  };
  
  // Initialize plugin
  $.fn.table = function(obj){
    // Method calling logic
    if(methods[obj]){
      return methods[obj].apply(this,Array.prototype.slice.call(arguments,1));
    } 
    else if(typeof obj === 'object' || ! obj){
      return methods.init.apply(this,arguments);
    }
  };
}(jQuery));