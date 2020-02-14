// File: helpbox.js
// Author: Martin Burford (martin@martinburford.co.uk)

import events from './events';
import {
  getDOMElementHeight,
  isBreakpointMdBreakpointOrHigher,
  lockBodyScroll,
  unlockBodyScroll
} from './utils';

const helpbox = (function () {
  const options = {
    bottomMobilePadding: 75,
    helpboxHeaderObj: null,
    helpboxObj: null,
    helpboxInnerObj: null,
    helpboxToggleObj: null,
    internalScrolling: false,
    toggleAnimate: 350,
    visible: false
  };

  /**
   * Hide the helpbox when switching breakpoints
   * @function reset
   */
  function hideHelpbox() {
    options.helpboxObj.classList.remove('visible');
    options.helpboxObj.classList.remove('internal-scrolling');
    options.helpboxInnerObj.classList.remove('scroller');
    options.helpboxObj.removeAttribute('style');
    options.helpboxInnerObj.removeAttribute('style');

    options.internalScrolling = false;
  }

  /**
   * Restore the helpbox if it was visible prior to a recent resize event
   * @function restoreHelpbox
   */
  function restoreHelpbox() {
    if (options.visible) {
      events.fire(options.helpboxToggleObj, 'click');
    }
  }

  /**
   * Update label text to match the breakpoint specific variant
   * @function updateLabelText
   * @param {string} dataAttributes - The data attributes to find the elements to change
   */
  function updateLabelText(dataAttributes) {
    const currentBreakpoint = isBreakpointMdBreakpointOrHigher() ? 'desktop' : 'mobile';

    Array.from(document.querySelectorAll(dataAttributes)).forEach((labelElem) => {
      labelElem.innerText = labelElem.getAttribute(`data-label-${currentBreakpoint}`);
    });
  }

  /**
   * Initialize all helpbox events
   * @function eventsInit
   * @private
   */
  function eventsInit() {
    // Resize.start event (window)
    events.listen(window, 'resizeStart', () => {
      // Hide the helpbox when switching breakpoints
      hideHelpbox();
    });

    // Resize.stop event (window)
    events.listen(window, 'resizeStop', () => {
      // Restore the helpbox if it was visible prior to a recent resize event
      restoreHelpbox();

      // Update label text to match the breakpoint specific variant
      updateLabelText('[data-label-mobile][data-label-desktop]');
    });

    events.delegate(document.body, '.helpbox__toggle', 'click', (e) => {
      e.preventDefault();

      // Is the helpbox being expanded or contracted?
      const toggleMode = options.helpboxObj.classList.contains('visible') ? 'contract' : 'expand';

      // What's the height of the helpbox being manipulated
      let elementHeight;

      // Because of different visual treatments within the MD breakpoint, the elements to animate
      // to animate open are closed are different
      // By default, the DOM element to expand/contract is the mobile inner block
      let helpboxToggleAnimateObj = options.helpboxObj;

      // Only if a breakpoint of 'md' or higher is being viewed should the animate element change
      if (isBreakpointMdBreakpointOrHigher()) {
        helpboxToggleAnimateObj = options.helpboxInnerObj;
      }

      if (toggleMode === 'expand') {
        options.helpboxObj.classList.add('visible');

        // Retrieve the height of the Helpbox, as this is required for the expand animation
        elementHeight = getDOMElementHeight(helpboxToggleAnimateObj);

        const documentHeight = document.body.clientHeight;

        if (elementHeight > documentHeight) {
          lockBodyScroll();

          options.internalScrolling = true;

          // Attach additional classes, to allow for styles relating to internal scrollers
          options.helpboxObj.classList.add('internal-scrolling');
          options.helpboxInnerObj.classList.add('scroller');

          const headerElemHeight = getDOMElementHeight(options.helpboxHeaderObj);

          elementHeight = documentHeight;

          const innerElemHeight = documentHeight - headerElemHeight - options.bottomMobilePadding;

          options.helpboxInnerObj.style.height = `${innerElemHeight}px`;
        }

        helpboxToggleAnimateObj.style.height = `${elementHeight}px`;

        // Set a flag to indicate the helpbox is currently expanded
        options.visible = true;

        // Force the height to be 'auto' once the destination height is reached.
        // This will ensure the element can adjust to different breakpoint layouts/heights
        if (!options.internalScrolling) {
          setTimeout(() => {
            helpboxToggleAnimateObj.style.height = 'auto';
          }, options.toggleAnimate);
        }
      } else {
        options.helpboxObj.classList.remove('visible');

        // Override the 'auto' height value, so the CSS transition has a start and end height
        helpboxToggleAnimateObj.style.height = `${helpboxToggleAnimateObj.offsetHeight}px`;

        // Force a reflow, in order to allow the height to be adjusted to the tooltip
        window.getComputedStyle(helpboxToggleAnimateObj).height;

        // Set a flag to indicate the helpbox is currently contracted
        options.visible = false;

        helpboxToggleAnimateObj.style.height = '0px';

        // If resetting from an internal scroller (mobile landscape)
        if (options.internalScrolling) {
          setTimeout(() => {
            unlockBodyScroll();
            
            // Remove a flag indicating the internal scrolling is not currently required
            options.internalScrolling = false;

            // There is no longer an internal scroller
            options.helpboxObj.classList.remove('internal-scrolling');
            options.helpboxInnerObj.classList.remove('scroller');

            // Remove any inline styles attached to the helpboxs inner element, since it is
            // now contracted
            options.helpboxInnerObj.removeAttribute('style');
          }, options.toggleAnimate);
        }
      }
    });
  }

  /**
   * Initialize the helpbox
   * @function init
   */
  function init() {
    const helpboxElem = document.querySelector('.helpbox');

    if (helpboxElem) {
      options.helpboxObj = document.querySelector('.helpbox');
      options.helpboxHeaderObj = document.querySelector('.helpbox__header');
      options.helpboxInnerObj = document.querySelector('.helpbox__inner');
      options.helpboxToggleObj = document.querySelector('.helpbox__toggle');

      // Initialize all helpbox events
      eventsInit();

      // Update label text to match the breakpoint specific variant
      updateLabelText('[data-label-mobile][data-label-desktop]');
    }
  }

  return {
    hideHelpbox,
    init,
    restoreHelpbox
  };
}());

export default helpbox;
