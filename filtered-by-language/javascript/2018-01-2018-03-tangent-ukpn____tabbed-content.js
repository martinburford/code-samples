// File: tabbed-content.js
// Author: Martin Burford (martin@martinburford.co.uk)

import {findParentNode, getDOMElementHeight, isBreakpointLgBreakpointOrHigher, isTouch} from './utils';
import events from './events';

const CONSTS = {
  ANIMATETIMER: 500
};

class TabbedContent {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.activePaneIndex = 0;
    this.eventType = isTouch() ? 'click' : 'focusin';
  }

  /**
   * What is the index of the currently selected navigation item?
   * @function getRequestedTabIndex
   * @param {element} clickedTabElem - The clicked tab element
   * @returns {number} - The index (zero-based) of the currently selected tab
   */
  getRequestedTabIndex(clickedTabElem) {
    const requestedTabElem = clickedTabElem.nextElementSibling;

    // eslint-disable-next-line max-len
    return Array.from(this.element.querySelectorAll('.tabbed-content__content')).indexOf(requestedTabElem);
  }

  /**
   * Show the requested tab
   * @function showRequestedTab
   * @param {number} requestedTabIndex - The index (zero-based) of the tab to show
   */
  showRequestedTab(requestedTabIndex) {
    const isMobile = !isBreakpointLgBreakpointOrHigher();
    let isCurrentlyActive = false;

    Array.from(this.element.querySelectorAll('.tabbed-content__content')).forEach((tabElem, index) => {
      isCurrentlyActive = tabElem.classList.contains('tabbed-content__content--active');

      // If the current tab is the requested tab, set it to be visible
      if (index === requestedTabIndex) {
        tabElem.previousElementSibling.classList.add('tabbed-content__trigger--active');
        tabElem.classList.add('tabbed-content__content--active');

        // eslint-disable-next-line no-lonely-if
        if (isMobile) {
          // Animate the requested tab open
          this.animateRequestedTabOpen(requestedTabIndex);
        } else {
          tabElem.style.height = 'auto';
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (isCurrentlyActive) {
          tabElem.classList.remove('tabbed-content__content--active');
          tabElem.previousElementSibling.classList.remove('tabbed-content__trigger--active');
          // Close any tabs which are open BUT are NOT the requestedTabIndex
          // eslint-disable-next-line no-lonely-if
          if (isMobile) {
            // Animate tab closed
            this.animateTabClosed(index);
          } else {
            tabElem.removeAttribute('style');
          }
        }
      }

      isCurrentlyActive = false;
    });
  }

  /**
   * Animate tab closed
   * @function animateTabClosed
   * @param {number} requestedTabIndex - The index (zero-based) of the tab to hide
   */
  animateTabClosed(requestedTabIndex) {
    const requestedTabElem = Array.from(this.element.querySelectorAll('.tabbed-content__content'))[requestedTabIndex];
    const tabElemToHideHeight = getDOMElementHeight(requestedTabElem);

    requestedTabElem.style.height = `${tabElemToHideHeight}px`;
    window.getComputedStyle(requestedTabElem).height;
    requestedTabElem.style.height = '0px';

    // Once the animation is complete, remove the animating class
    setTimeout(() => {
      requestedTabElem.removeAttribute('style');
    }, CONSTS.ANIMATETIMER);
  }

  /**
   * Animate the requested tab open
   * @function animateRequestedTabOpen
   * @param {number} requestedTabIndex - The index (zero-based) of the tab to show
   */
  animateRequestedTabOpen(requestedTabIndex) {
    const requestedTabElem = Array.from(this.element.querySelectorAll('.tabbed-content__content'))[requestedTabIndex];
    const tabElemToShowHeight = getDOMElementHeight(requestedTabElem);
    
    requestedTabElem.style.height = `${tabElemToShowHeight}px`;

    // Once the animation is complete, remove a px height, to cater for breakpoint differences
    setTimeout(() => {
      if (requestedTabElem.classList.contains('tabbed-content__content--active')) {
        requestedTabElem.style.height = 'auto';
      }
    }, CONSTS.ANIMATETIMER);
  }

  /**
   * Find the clicked link element (since an SVG icon could have fired this event)
   * @function findTriggerLinkElement
   * @param {event} e - The fired event
   * @returns {element} targetElem - The associated anchor link for the fired event
   */
  static findTriggerLinkElem(e) {
    let targetElem = e.target;

    if (targetElem.tagName.toUpperCase() !== 'A') {
      targetElem = findParentNode({tagName: 'A'}, targetElem);
    }

    return targetElem;
  }

  /**
   * Initialize all events for Tabbed Content
   * @function eventsInit
   */
  eventsInit() {
    // Force a focus event to fire based on a click event for browsers which don't trigger focusin
    // from a 'click' by default (eg: Safari desktop)
    events.delegate(this.element, '.tabbed-content__trigger', 'click', (e) => {
      e.preventDefault();

      // Find the clicked link element (since an SVG icon could have fired this event)
      const targetElem = TabbedContent.findTriggerLinkElem(e);

      // Fire focus event is triggered from a click (not via a focusin) - eg: Safari desktop
      if (targetElem !== document.activeElement) {
        targetElem.focus();
      }
    });

    // Focus event for tabbing through the Tabbed Content component
    events.delegate(this.element, '.tabbed-content__trigger', this.eventType, (e) => {
      // Find the clicked link element (since an SVG icon could have fired this event)
      const targetElem = TabbedContent.findTriggerLinkElem(e);

      const requestedTabIndex = this.getRequestedTabIndex(targetElem);

      // Show the requested tab
      this.showRequestedTab(requestedTabIndex);
    });

    // Check that a tab is open when links inside it are focused upon
    // This is primarily to cover Shift+Tab, for reverse tabbing
    events.delegate(this.element, '.tabbed-content__content a', this.eventType, (e) => {
      e.preventDefault();

      const tabElemLinkBelongsTo = findParentNode({className: 'tabbed-content__content'}, e.target);

      if (!tabElemLinkBelongsTo.classList.contains('active')) {
        events.fire(tabElemLinkBelongsTo.previousElementSibling, this.eventType);
      }
    });
  }

  /**
   * Initialize Tabbed Content
   * @function init
   */
  init() {
    // Initialize all events for Tabbed Content
    this.eventsInit();

    // open the first tab by default
    this.showRequestedTab(0);
  }
}

export default TabbedContent;
