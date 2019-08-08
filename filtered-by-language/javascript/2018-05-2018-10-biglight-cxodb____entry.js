/**
 * File: /assets/scripts/global/entry.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

// Import modules for use within this file
import accordion from './accordion';
import events from './events';
import hoverbox from './hoverbox';
import {sendLog} from './logger';
import overlay from './overlay';
import tooltip from './tooltip';
import {
  debounce, 
  options as utilityOptions, 
  padStart,
  ready, 
  renderComponent
} from './utilities';

sendLog('[global/entry.js]', 'Running from global/entry.js');

const init = () => {
  // Components which have multiple instances
  renderComponent(accordion, '.accordion');
  renderComponent(hoverbox, '[data-trigger-hoverbox]'); 
  renderComponent(tooltip, '.tooltip');

  // Modules which:
  // 1. Are called by other modules
  // OR
  // 2. Only exist as a single instance, so are not coded into ES6 classes
  // ----

  // Initialize overlay
  overlay.init();
};

// Once the page is ready to execute script, execute the provided function
ready(init);

// Resize.start event (window)
window.addEventListener('resize', debounce(() => {
  events.fire(window, 'resizeStart');

  // Any CSS masks required whilst animating should use the 'resizing' classname
  document.body.classList.add('resizing');
}, utilityOptions.DEBOUNCE.RESIZE, true));

// Resize.stop event (window)
window.addEventListener('resize', debounce(() => {
  events.fire(window, 'resizeStop');

  document.body.classList.remove('resizing');
}, utilityOptions.DEBOUNCE.RESIZE));

// Scroll.start event (window)
window.addEventListener('scroll', debounce(() => {
  events.fire(window, 'scrollStart');
}, utilityOptions.DEBOUNCE.SCROLL, true));

// Scroll.stop event (window)
window.addEventListener('scroll', debounce(() => {
  events.fire(window, 'scrollStop');
}, utilityOptions.DEBOUNCE.SCROLL));