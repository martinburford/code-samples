// File: inobounce.js
// Author: Martin Burford (martin@martinburford.co.uk)

import {findParentNode} from './utils';

const iNoBounce = (function () {
  const options = {
    startY: 0
  };

  /**
   * Handle the check during a touchmove event
   * @function handleTouchMove
   * @private
   */
  const handleTouchMove = (e) => {
    const isScrollableElem = e.target.classList.contains('scroller');
    let scrollElem;

    // Locate the scrollable DOM element
    // It may not be the element the event was called from (this may well be a child of the
    // scrollable parent)
    if (isScrollableElem) {
      scrollElem = e.target;
    } else {
      scrollElem = findParentNode({className: 'scroller'}, e.target);
    }

    const canScroll = scrollElem.scrollHeight > scrollElem.offsetHeight;

    if (canScroll) {
      const currentY = e.touches ? e.touches[0].screenY : e.screenY;
      const isAtTop = (options.startY <= currentY && scrollElem.scrollTop === 0);
      
      // eslint-disable-next-line max-len
      const isAtBottom = (options.startY >= currentY && scrollElem.scrollHeight - scrollElem.scrollTop === scrollElem.offsetHeight);

      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    }
  };

  /**
   * Capture the current offset position when scrolling begins
   * @function handleTouchStart
   * @private
   */
  const handleTouchStart = (e) => {
    options.startY = e.touches ? e.touches[0].screenY : e.screenY;
  };

  /**
   * Enable detection for elastic bouncing
   * @function enable
   * @private
   */
  const enable = () => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
  };

  /**
   * Initialize the iNoBounce module
   * @function init
   */
  const init = () => {
    // Perform a one off check to see whether touch webkit scrolling is supported or not
    const testElem = document.createElement('div');
    document.documentElement.appendChild(testElem);
    testElem.style.WebkitOverflowScrolling = 'touch';

    const scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testElem)['-webkit-overflow-scrolling'] === 'touch';
    document.documentElement.removeChild(testElem);

    if (scrollSupport) {
      enable();
    }
  };

  return {
    init
  };
}());

export default iNoBounce;
