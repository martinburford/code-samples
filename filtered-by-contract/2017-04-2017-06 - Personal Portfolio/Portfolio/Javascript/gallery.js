var events = require('./events.js');
var lazyload = require('./lazyload.js');
var utilities = require('./utilities.js');

module.exports = (function(){
  var options = {
    customScrollbarWidth: 10,
    overlay: {
      breakpointTolerances: {
        baseLayout: 10,
        mobileLargeUpwards: 10,
        tabletPortraitUpwards: 50,
        tabletLandscapeUpwards: 60,
        desktop: 80
      },
      isOpen: false,
      isVideoActive: false,
      linkedInRestorePositionParentElem: document.querySelector('.summary'),
    },
    toggleIconOverlayTime: 500
  };

  /**
   * Initialize the image gallery
   * @function init
   */
  function init(){
    // Initialize and delegate all events for galleries
    eventsInit();

    var projectsElem = document.getElementById('projects');
    if(projectsElem){
      // Perform a refresh on a specific scrolled DOM element
      lazyload.refresh(projectsElem);
    }
  }

  /**
   * Delegate all events for galleries
   * @function eventsInit
   * @private
   */
  function eventsInit(){
    // Setup the handler for the project selector
    var menuElem = document.getElementById('menu');
    if(menuElem){
      menuElem.addEventListener('click',function(e){
        e.preventDefault();

        // Do not process if the overlay is currently expanded
        if(document.body.classList.contains('overlay-visible')){
          return false;
        }

        document.body.classList.toggle('sidebar');

        if(document.body.classList.contains('sidebar')){
          // Perform a refresh on a specific scrolled DOM element
          lazyload.refresh(document.getElementById('projects'));

          // Remove the visibility:hidden CSS setting, when the sidebar is closed
          var projectsBoxElem = document.getElementById('projects-box');
          projectsBoxElem.removeAttribute('data-contracted');
        }
      });

      // Block iOS bouncing overflow-y elements
      blockElasticBounce(document.getElementById('projects'));
    }

    // Setup the handler for the LinkedIn recommendations
    var overlayScrollerElem = document.getElementById('overlay-scroller');
    if(overlayScrollerElem){
      // Block iOS bouncing overflow-y elements
      blockElasticBounce(overlayScrollerElem);
    }

    document.ontouchmove = function(event){
      var isTouchMoveAllowed = true;
      var target = event.target;

      while(target !== null){
        if(target.classList && target.classList.contains('disabled')){
          isTouchMoveAllowed = false;
          break;
        }

        target = target.parentNode;
      }

      if(!isTouchMoveAllowed){
        event.preventDefault();
      }
    };

    // Click handers for launching the overlay with LinkedIn content
    events.delegate(document.body, '.linkedin-launch', 'click', function(e){
      e.preventDefault();

      // data-linked-container=".no-gallery" data-linked-element=".linkedin-recommendations"
      var hasContainerLink = this.getAttribute('data-linked-container-class') !== null;
      var linkedInElem;
      if(hasContainerLink){
        var containerElem = utilities.findParentNode({className: this.getAttribute('data-linked-container-class')}, this);
        linkedInElem = containerElem.querySelector(this.getAttribute('data-linked-element'));

        // Update the restore reference, for when the LinkedIn DOM element is re-inserted back into its original position, after the overlay is closed
        options.overlay.linkedInRestorePositionParentElem = linkedInElem.parentNode;
      } else {
        linkedInElem = document.querySelector('.linkedin-recommendations');
      }

      // Build and show the overlay, with specific inner content types
      buildAndShowOverlay('linkedin', {contentElem: linkedInElem});
    });

    // Close event for the overlay
    events.delegate(document.body, '#overlay-close', 'click', function(e){
      e.preventDefault();

      // Reset the inner content of the overlay before removing it from the DOM
      resetAndRemoveOverlayContent();
    });

    var projectsBoxElem = document.getElementById('projects-box');
    if(projectsBoxElem){
      projectsBoxElem.addEventListener('transitionend', function(e){
        if(!document.body.classList.contains('sidebar')){
          // Add the visibility:hidden CSS setting, when the sidebar is closed
          projectsBoxElem.setAttribute('data-contracted', true);
        }
      });
    }

    // Click handlers for toggling the breakpoint <section> DOM elements
    events.delegate(document.body, 'section h3', 'click', function(e){
      if(!this.parentNode.classList.contains('active')){
        this.parentNode.classList.toggle('active');

        // Perform a refresh on a specific scrolled DOM element
        lazyload.refresh(window);

        // Retrieve the offset (left and top) of the requested DOM element
        var offsets = utilities.currentOffset(this);

        // Scroll the document to a specifix y-axis offset
        utilities.scrollToY(offsets.top-71, 100, 'easeInOutQuint'); // 71px is the height of the (fixed position) header  
      } else {
        this.parentNode.classList.toggle('active');
      }
    });

    // Click handlers for launching a full-screen image preview
    events.delegate(document.body, '.thumbnail-listing ol>li', 'click', function(e){
      if(!document.body.classList.contains('gallery')) return;

      // Allow anchor paths to be followed if being triggered from a link within the text under the video thumbnail (this is only used within the video page for now)
      var eventElem = e.target.nodeName.toUpperCase();
      if(eventElem !== 'A' && eventElem !== 'STRONG'){
        e.preventDefault();

        // Either an image OR a video can be triggered to load from the inner page content
        var parentElem = utilities.findParentNode({nodeName: 'section'}, this);
        var selectionType = parentElem.getAttribute('data-type').indexOf('video') !== -1 ? 'video' : 'image';

        switch(selectionType){
          case 'video':
            var videoElem = this.querySelector('img');
            var videoData = {
              height: parseInt(videoElem.getAttribute('data-height')),
              src: videoElem.getAttribute('data-video-src'),
              width: parseInt(videoElem.getAttribute('data-width'))
            };

            // Prior to showing the overlay, setup (and execute) a few necessary conditions
            showOverlayInitializer('video', videoData);

            break;
          case 'image':
            var imageElem = this.querySelector('img');
            var imagePreviewData = {
              src: imageElem.getAttribute('src').replace('thumbnails','fullsize'),
              width: parseInt(imageElem.getAttribute('data-width'))
            };

            // Prior to showing the overlay, setup (and execute) a few necessary conditions
            showOverlayInitializer('imagePreview', imagePreviewData);

            break;
        }
      }
    });

    // Click handler for the responsive icons
    events.delegate(document.body, 'section>ul>li', 'click', function(e){
      e.preventDefault();

      var selfObj = this;
      var groupToShow;
      var groupElemToShow;

      if(this.classList.contains('active')){
        return;
      }

      groupToShow = this.className;
      groupElemToShow = document.querySelector('[data-type=' + groupToShow + '-screenshots]');

      if(groupElemToShow.classList.contains('active')){
        // Retrieve the offset (left and top) of the requested DOM element
        var offsets = utilities.currentOffset(groupElemToShow);

        // Scroll the document to a specifix y-axis offset
        utilities.scrollToY(offsets.top-71, 100, 'easeInOutQuint'); // 71px is the height of the (fixed position) header  
      } else {
        // Toggle the group open AND scroll to it (once expanded open)
        groupElemToShow.querySelector('h3').click();
      }
    });
    }

  /**
   * Prior to showing the overlay, setup (and execute) a few necessary conditions
   * @function showOverlayInitializer
   * @private
   * @param {string} contentType - Either 'imagePreview' || 'video'
   * @param {object} [customData.height] - The height of either the video player or the image
   * @param {object} customData.src - The src or either the video or the image
   * @param {object} customData.width - The width of either the video or the image
   */
  function showOverlayInitializer(contentType, customData){
    if(isSidebarVisible()){
      document.body.classList.remove('sidebar');

      setTimeout(function(){
        // Build and show the overlay, with specific inner content types
        buildAndShowOverlay(contentType, customData);
      },options.toggleIconOverlayTime);
    } else {
      // Build and show the overlay, with specific inner content types
      buildAndShowOverlay(contentType, customData);
    }
  }

  /**
   * Build and show the overlay, with specific inner content types
   * @function buildAndShowOverlay
   * @private
   * @param {string} contentType - 'linkedin' || 'imagePreview'
   * @param {object} customData - Settings specific to the content type being rendered within the overlay
   * @param {object} [customData.linkedInElem] - The DOM element where the inner LinkedIn recommendations content exists
   */
  function buildAndShowOverlay(contentType, customData){
    // Build the overlay DOM structure, before populating it
    var overlayFullElem = document.createElement('div');
    overlayFullElem.setAttribute('id', 'overlay-full');
    overlayFullElem.setAttribute('data-content', contentType);

    var overlayInnerElem = document.createElement('div');
    overlayInnerElem.setAttribute('id', 'overlay-inner');

    var overlayCloseElem = document.createElement('a');
    overlayCloseElem.setAttribute('id', 'overlay-close');
    overlayCloseElem.setAttribute('href', '#');
    overlayCloseElem.innerText = 'Close';

    overlayInnerElem.appendChild(overlayCloseElem);

    var overlayScrollerElem = document.createElement('div');
    overlayScrollerElem.setAttribute('id', 'overlay-scroller');        

    switch(contentType){
      case 'linkedin':
        var recommendationsElem = customData.contentElem;
        overlayScrollerElem.appendChild(recommendationsElem);

        break;
      case 'video':
        var videoElem = document.createElement('div');
        videoElem.setAttribute('id','video-preview');

        var iframeElem = document.createElement('iframe');
        iframeElem.setAttribute('height', customData.height);
        iframeElem.setAttribute('src', customData.src);
        iframeElem.setAttribute('width', customData.width);
        iframeElem.setAttribute('allowfullscreen', true);
        iframeElem.setAttribute('frameborder', 0);

        // Adjust the width of the image container, so that it's dynamically sized to the image it contains
        // Check to see whether the image preview needs to be scaled, or can sit on screen at it's natural width
        var innerElementCalculations = calculateInnerElementDimensions(customData);

        if(innerElementCalculations.isScalingRequired){
          // Add an identifier, recognizing that scaling has been performed. CSS will use this to scale the inner content (image or video)
          videoElem.classList.add('scaled');

          // Since scaling is required, the video embed must be adjusted, to accomodate for the scaling
          // Ensure the resize is performed against the right aspect ratio for the video being shown
          var aspectRatio = customData.height/customData.width;
          iframeElem.setAttribute('width', innerElementCalculations.overlayInnerWidth + 'px');
          iframeElem.setAttribute('height', (innerElementCalculations.overlayInnerWidth * aspectRatio) + 'px');
        }

        overlayInnerElem.style.width = innerElementCalculations.overlayInnerWidth + 'px';
        overlayInnerElem.style.left = innerElementCalculations.overlayInnerXPos;

        // Attach the video to the DOM
        videoElem.appendChild(iframeElem);
        overlayScrollerElem.appendChild(videoElem);

        options.overlay.isVideoActive = true;

        break;
      case 'imagePreview':
        var imagePreviewElem = document.createElement('div');
        imagePreviewElem.setAttribute('id', 'image-preview');

        var imageElem = document.createElement('img');
        imageElem.setAttribute('src', customData.src);

        // Adjust the width of the image container, so that it's dynamically sized to the image it contains
        // Check to see whether the image preview needs to be scaled, or can sit on screen at it's natural width
        var innerElementCalculations = calculateInnerElementDimensions(customData);

        if(innerElementCalculations.isScalingRequired){
          // Add an identifier, recognizing that scaling has been performed. CSS will use this to scale the inner content (image or video)
          imagePreviewElem.classList.add('scaled');
        }

        overlayInnerElem.style.width = innerElementCalculations.overlayInnerWidth + 'px';
        overlayInnerElem.style.left = innerElementCalculations.overlayInnerXPos;

        // Attach the image preview to the DOM
        imagePreviewElem.appendChild(imageElem);
        overlayScrollerElem.appendChild(imagePreviewElem);

        break;
    }

    // Add the overlay DOM elements to the <body>
    overlayInnerElem.appendChild(overlayScrollerElem);
    overlayFullElem.appendChild(overlayInnerElem);
    document.body.appendChild(overlayFullElem);

    // Check to see whether the content in the overlay requires scrolling (when showed within the overlay)
    if(overlayScrollerElem.querySelector('div').offsetHeight > overlayScrollerElem.offsetHeight){
      overlayFullElem.classList.add('scroll');
    } else {
      if(contentType === 'video'){
        // Remove the width of the scrollbar from the width of the overlay-inner DOM element, since scrolling is not required in this instance
        var customScrollBarWidth = document.body.classList.contains('has-touch') ? 0 : options.customScrollbarWidth;
        var currentOverlayWidth = overlayInnerElem.offsetWidth;

        overlayInnerElem.style.width = (currentOverlayWidth - customScrollBarWidth) + 'px';
      }
    }

    // Force a reflow, in order to allow the fade to be applied to the newly created element in the DOM
    window.getComputedStyle(overlayFullElem).opacity;

    // Activate the showing of the overlay, now that it has been constructed, and populated with the correct inner content
    document.body.classList.add('overlay-visible');

    options.overlay.isOpen = true;
  }

  /**
   * Adjust the width of the image container, so that it's dynamically sized to the image it contains
   * Check to see whether the image preview needs to be scaled, or can sit on screen at it's natural width
   * @function calculateInnerElementDimensions
   * @private
   * @param {object} customData - Any supplementary data required for the showing of the overlay (and its inner content)
   * @return {boolean} isScalingRequired - Whether a scaling class needs to be added to the DOM, for CSS purpose
   * @return {number} overlayInnerWidth - The width that the inner element (containing either an image or a video needs to be)
   * @return {number} overlayInnerXPos - Where to position the overlay inner element, to ensure it remains centered on screen, once shown to the user
   */
  function calculateInnerElementDimensions(customData){
    var customScrollBarWidth = document.body.classList.contains('has-touch') ? 0 : options.customScrollbarWidth;
    var elementNaturalWidth = customData.width;
    var currentBreakpoint = utilities.getBreakpoint();
    var breakpointTolerance = options.overlay.breakpointTolerances[currentBreakpoint];
    var availableWidthForOverlay = window.innerWidth - (breakpointTolerance*2) - customScrollBarWidth;
    var isScalingRequired = elementNaturalWidth >= availableWidthForOverlay;
    var overlayInnerWidth;
    var overlayInnerXPos;

    if(!isScalingRequired){
      overlayInnerWidth = (elementNaturalWidth + customScrollBarWidth);
      overlayInnerXPos = 'calc(50% - ' + ((elementNaturalWidth/2) + 'px') + ')';
    } else {
      overlayInnerWidth = availableWidthForOverlay;
      overlayInnerXPos = 'calc(50% - ' + ((availableWidthForOverlay/2) + 'px') + ')';
    }

    return {
      isScalingRequired: isScalingRequired,
      overlayInnerWidth: overlayInnerWidth,
      overlayInnerXPos: overlayInnerXPos
    }
  }

  /**
   * Reset the inner content of the overlay before removing it from the DOM
   * Take into account the 500ms fade out effect, taken up by the closing of the overlay
   * @function resetAndRemoveOverlayContent
   * @private
   */
  function resetAndRemoveOverlayContent(){
    // Check which type of content the overlay currently contains
    var contentContained;
    var fnToExecute = null;
    var overlayScrollerElem = document.getElementById('overlay-full');

    switch(overlayScrollerElem.getAttribute('data-content')){
      case 'linkedin':
        fnToExecute = function(callback){
          // Position the LinkedIn recommendations back in their original starting position in the DOM
          var recommendationsElem = overlayScrollerElem.querySelector('.linkedin-recommendations');

          options.overlay.linkedInRestorePositionParentElem.appendChild(recommendationsElem);

          // Execute the specified callback
          callback();
        }

        break;
    }

    document.body.classList.remove('overlay-visible');    

    if(fnToExecute !== null){
      // Execute the functionality, based on the type of reset which is being performed
      setTimeout(function(){
        fnToExecute(removeOverlayFromDOM);
      },options.toggleIconOverlayTime);
    } else {
      setTimeout(removeOverlayFromDOM, options.toggleIconOverlayTime);
    }
  }

  /**
   * Remove the overlay from the DOM
   * @function removeOverlayFromDOM
   * @private
   */
  function removeOverlayFromDOM(){
    var overlayFullElem = document.getElementById('overlay-full');
    overlayFullElem.parentNode.removeChild(overlayFullElem);

    options.overlay.isVideoActive = false;
    options.overlay.isOpen = false;
  }

  /**
   * Is the sidebar currently visible?
   * @function isSidebarVisible
   * @private
   * @returns {boolean} - true || false
   */
  function isSidebarVisible(){
    return document.body.classList.contains('sidebar');
  }

  /**
   * Block iOS bouncing overflow-y elements
   * @function blockElasticBounce
   * @private
   * @param {Object} element - The DOM element to disable elastic bounce against
   */
  function blockElasticBounce(element){
    element.addEventListener('touchstart',function(e){
      // Is the scroll event being triggered against pixel offset 0 || the maximum scroll height of the element
      checkScrollBoundaries(this);
    });   

    element.addEventListener('scroll.start',function(e){
      // Is the scroll event being triggered against pixel offset 0 || the maximum scroll height of the element
      checkScrollBoundaries(this);
    });   
  }

  /**
   * Is the scroll event being triggered against pixel offset 0 || the maximum scroll height of the element
   * @function checkScrollBoundaries
   * @private
   * @param {Object} element - The DOM element to check scroll offsets against
   */
  function checkScrollBoundaries(element){
    var top = element.scrollTop;
    var totalScroll = element.scrollHeight;
    var currentScroll = top + element.offsetHeight;

    if(top === 0){
      element.scrollTop = 1;
    } else if (currentScroll === totalScroll){
      element.scrollTop = top - 1;
    }
  }

  /**
   * If the overlay is open when the browser is resized, hide it immediately
   * @function hideOverlayIfOpen
   */
  function hideOverlayIfOpen(){
    if(options.overlay.isOpen){
      // Reset the inner content of the overlay before removing it from the DOM
      resetAndRemoveOverlayContent();
    }
  }

  return {
    hideOverlayIfOpen: hideOverlayIfOpen,
    init: init,
    options: options
  }
}());