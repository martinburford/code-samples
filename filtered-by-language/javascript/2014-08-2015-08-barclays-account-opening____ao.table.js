/**
* Account Opening v1.0
* @module ao
*/

var ao = window.ao || {};

ao.table = (function(){
  function init(){
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
    
    $.logEvent('[ao.table.init): ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.table));
      
    // Initialize all event delegation associated to tables
    eventsInit();
  }
  
  /**
  * Initialize delegated events for all tables
  * @method eventsInit
  */
  function eventsInit(){
    $.logEvent('[ao.table.eventsInit]');
    
    var tableObj;

    $('.table').each(function(index){
      tableObj = $(this);
      tableObj.attr('id','table-' + (index+1));
            
      // Attach IScroll functionality to an individual <table> element
      try{
        // Attach IScroll functionality to an individual <table> element
        attachIScroll({
          id: 'table-' + (index+1),
          tableDomObj: tableObj
        });
      }
      catch(err){
        $.logEvent('[ao.table.eventsInit]: error initializing iScroll: ' + err);
      }
      
      // Process any logic specific to advanced tables (with a single locked heading)
      if(tableObj.hasClass('advanced')){
        // DOM inject the necessary locked triggers
        // Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
        advancedInit({
          tableDomObj: tableObj
        });
      }
    });
  }
  
  /**
  * DOM inject the necessary locked triggers
  * Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
  * @method advancedInit
  * @param {OBJECT} tableDomObj The <table> DOM element
  */
  function advancedInit(obj){
    $.logEvent('[ao.table.advancedInit]: ' + $.logJSONObj(obj));
    
    var tableWrapperObj;
    var tableObj = obj.tableDomObj;
    var headings = [];
    
    $('TBODY TR',tableObj).each(function(){
      headings.push($('TH:eq(0)',this).text());
    });
    
    // Create the container for the advanced table
    tableObj.wrap('<div class="table-wrapper"></div>');
    tableWrapperObj = tableObj.parent();
    
    if(tableObj.hasClass('framework')){
      tableWrapperObj.addClass('framework');
      tableObj.removeClass('framework');
    }
    
    // Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
    setHeights({
      section: 'thead',
      sectionObj: $('THEAD',tableObj)
    });
        
    var headingsTopOffset = parseInt($('THEAD',tableObj).attr('data-height'));
        
    // Attach the headings DOM element
    tableObj
      .parents('.table-wrapper')
        .prepend(function(){          
          var ulObj = $('<ul />').attr('class','headings').css({
            'background-position': 'left ' + (headingsTopOffset-2) + 'px',
            'padding-top': headingsTopOffset
          });
          
          $.each(headings,function(index,value){
            ulObj
              .append(
                $('<li />')
                  .text(value)
              )
          });
          
          return ulObj;
        }); 
    
    // Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
    setHeights({
      section: 'tbody',
      sectionObj: $('TBODY',tableObj)
    });
    
    // Update the indicators, to ensure they only sit within the body of the table
    $('.indicators LI',tableObj).css('top',headingsTopOffset);
  }
  
  /**
  * Due to a rounding issue within Firefox, JavaScript needs to implicitly set heights
  * @method setHeights
  * @param {STRING} section The type of DOM element to perform the height detection on
  * @param {OBJECT} sectionObj The DOM element to perform the height detection on
  */
  function setHeights(obj){
    var sectionObj = obj.sectionObj;
    
    switch(obj.section){
      case 'thead':
        sectionObj.attr('data-height',$('TH:first',sectionObj).actual('outerHeight'));
        
        break;
      case 'tbody':
        var headingsObj = sectionObj.parents('.table-wrapper').find('.headings');
        var headingsListObj;
        var rowHeight;
        var headerCellObj;
        
        $('TR',sectionObj).each(function(index){
          headerCellObj = $('TH:first',this);
          rowHeight = headerCellObj.actual('outerHeight');
          headingsListObj = $('LI:eq(' + index + ')',headingsObj);
          headingsListObj.css('height',rowHeight);
          
          // Set all cells within each row equal to the height of the related .headings <li> DOM element
          headerCellObj.attr('data-height',rowHeight).css('height',rowHeight);
        });
        
        break;
    }
  }
  
  /**
  * Attach IScroll functionality to an individual <table> element
  * @method attachIScroll
  * @param {STRING} id The id of the tables wrapper DOM element,
  * @param {OBJECT} tableDomObj The <table> DOM element
  */
  function attachIScroll(obj){
    $.logEvent('[ao.table.attachIScroll]: ' + $.logJSONObj(obj));
        
    var tableObj = obj.tableDomObj;
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
      var tableIScrollObj = $(this.wrapper);
      var delta = parseInt(tableIScrollObj.attr('data-delta'));
      var currentOffset = this.x>>0;
      
      // Should the right-hand boundary gradient be added?
      if(Math.abs(currentOffset)*1 < delta){
        scrollerObj.addClass('scrolling-next');
      }
      else{
        scrollerObj.removeClass('scrolling-next');
      }
      
      // Should the left-hand boundary gradient be added?
      if(currentOffset >= 0){
        scrollerObj.removeClass('scrolling-previous');
      }
      else if(Math.abs(currentOffset)*1 > 0 && Math.abs(currentOffset)*1 < delta){
        scrollerObj.addClass('scrolling-previous');
      }
    });
    
    // Store a reference to the IScroll instance, in case it needs to be accessed/manipulated at a later time
    ao.configuration.table.instances.push(IScrollObj);
    
    // Set the widths of both the overall table and the wrapper container as data attributes
    setWidths({
      tableDomObj: tableObj
    });
    
    // Add the indicators (for mobile use only)
    addIndicators({
      tableDomObj: tableObj
    });
  }
  
  /**
  * Set the widths of both the overall table and the wrapper container as data attributes
  * @method setWidths
  * @param {OBJECT} tableDomObj The <table> DOM element
  */
  function setWidths(obj){
    var wrapperObj = obj.tableDomObj;
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
      
    $.logEvent('[ao.table.setWidths]: bounds-left=0, bounds-right=' + wrapperWidth + ', table-width=' + tableObj.actual('outerWidth') + ', wrapper-width=' + wrapperObj.actual('outerWidth'));
    
    // Ensure that the initial scrolling right-hand gradient is added, if a table has scrolling 
    if(delta > 0){
      wrapperObj.addClass('scrolling-next');
    }
    
    $('.debug',wrapperObj).text(wrapperObj.attr('class') + ', delta=' + delta);
    
    // Having set the widths, reset the scroll position to always be left:0
    var instanceIndex = parseInt(wrapperObj.attr('id').replace('table-',''))-1;
    
    $.logEvent('[ao.table.setWidths]: instanceIndex: ' + instanceIndex);
    $.logEvent('[ao.table.setWidths]: ao.configuration.table.instances length: ' + ao.configuration.table.instances.length);
    $.logEvent('[ao.table.setWidths]: ao.configuration.table.instances[' + instanceIndex + ']: ' + ao.configuration.table.instances[instanceIndex]);
    
    try{
      ao.configuration.table.instances[instanceIndex].scrollTo(0,0,0);
    }
    catch(err){
      $.logEvent('[ao.table.setWidths]: error scrolling table to 0px on all 3 axis'); 
    }
  }

  /**
  * Add the indicators (for mobile use only)
  * @method addIndicators
  * @param {OBJECT} tableDomObj The <table> DOM element
  */
  function addIndicators(obj){
    $.logEvent('[ao.table.addIndicators]: ' + $.logJSONObj(obj));
    
    var selfObj = obj.tableDomObj;
    
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
  
  return {
    init: init,
    setWidths: setWidths
  }
}());