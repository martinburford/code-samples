// File: utils.js
// Author: Martin Burford (martin@martinburford.co.uk)

import SUID from 'smart-guid';
import store from 'store';

export const options = {
  breakpoints: [
    {name: 'xs', width: -1},
    {name: 'sm', width: 576},
    {name: 'md', width: 768},
    {name: 'lg', width: 992},
    {name: 'xl', width: 1200}
  ],
  debounce: {
    resize: 350
  }
}

/**
 * Retrieve the height of a specific DOM element
 * @function getDOMElementHeight
 * @private
 * @param {object} element - The DOM element to check the height for
 * @param {string} childElem - The string selector of a child element to find the height for
 */
export function getDOMElementHeight(element, childElem) {
  // True reflects ALL child nodes should be included as part of the clone
  const cloneElem = element.cloneNode(true);
  cloneElem.classList.add('dimensions-check');

  // Add the cloned DOM element to the same parent DOM element of the one being cloned, so as to
  // inherit all of the same CSS styles
  element.parentNode.appendChild(cloneElem);
  
  const elemToCheck = childElem !== undefined ? cloneElem.querySelector(childElem) : cloneElem;
  elemToCheck.removeAttribute('style');

  const elementHeight = elemToCheck.offsetHeight;

  // Remove the cloned DOM element, as it is no longer used, now that its height has been
  // retrieved
  cloneElem.parentNode.removeChild(cloneElem);

  return elementHeight;
}

/**
 * Locate a parentnode DOM element, based on a classname || tagName to match
 * @function findParentNode
 * @param {String} className - The className to look for, in order to find the desired parent node
 * @param {String} tagName - The tagName to look for, in order to find the desired parent node
 * @param {Object} obj - The originating DOM element, where the event was initiated
 * @returns {Object} - The DOM element which is the requested parentNode
 * ****
 * Sample usage:
 *   const elem = findParentNode({'className': 'node-to-find'}, originalDomElem);
 *   const elem = findParentNode({'tagName': 'DIV'}, originalDomElem);
 */
export function findParentNode(options, obj) {
  let nodeToTestElem = obj.parentNode;
  const searchByClassName = options.hasOwnProperty('className');
  const searchByTagName = options.hasOwnProperty('tagName');
  const searchByAttributeName = options.hasOwnProperty('attributeName');

  if(searchByClassName){
    while(!nodeToTestElem.classList.contains(options.className)){
      if (!nodeToTestElem.parentNode || nodeToTestElem.parentNode === document.body) {
        return document.body;
      }

      nodeToTestElem = nodeToTestElem.parentNode;
    }
  } else if(searchByTagName){
    while(nodeToTestElem.tagName !== options.tagName.toUpperCase()){
      if (!nodeToTestElem.parentNode || nodeToTestElem.parentNode === document.body) {
        return document.body;
      }

      nodeToTestElem = nodeToTestElem.parentNode;
    }
  } else if(searchByAttributeName){
    while(!nodeToTestElem.hasAttribute(options.attributeName)){
      if (!nodeToTestElem.parentNode || nodeToTestElem.parentNode === document.body) {
        return document.body;
      }

      nodeToTestElem = nodeToTestElem.parentNode;
    }
  }

  return nodeToTestElem;
}

/**
 * Remove scrolling from the document
 * @function lockBodyScroll
 */
export function lockBodyScroll() {
  document.body.classList.add('lock-scroll');
}

/**
 * Enable scrolling on the document
 * @function lockBodyScroll
 */
export function unlockBodyScroll() {
  document.body.classList.remove('lock-scroll');
}

/**
 * Which breakpoint is the site being viewed within?
 * @function getBreakpoint
 * @param {number} [width] - The width of the window
 * @returns {string} - Either 'xs' || 'sm' || 'md' || 'lg' || 'xl'
 */
export function getCurrentBreakpoint(width) {
  width = width || window.innerWidth;

  const breakpoints = options.breakpoints;

  for (let i = 0; i < breakpoints.length; i++) {
    if (width < breakpoints[i].width) {
      return breakpoints[i - 1].name;
    }
  }

  return breakpoints[breakpoints.length - 1].name;
}

/**
 * Determine whether the current breakpoint is 'md' or higher
 * @function isBreakpointMdBreakpointOrHigher
 * @returns {boolean} - Whether or not the current breakpoint is 'md' or higher
 */
export function isBreakpointMdBreakpointOrHigher() {
  const currentBreakpoint = getCurrentBreakpoint();
  const breakpoints = options.breakpoints;
  const filteredBreakpoints = breakpoints.filter((breakpoint) => {
    return breakpoint.width > 576;
  });

  return filteredBreakpoints.find((breakpoint) => {
    return breakpoint.name ===  currentBreakpoint;
  }) !== undefined;
}

/**
 * Determine whether the current breakpoint is 'lg' or higher
 * @function isBreakpointLgBreakpointOrHigher
 * @returns {boolean} - Whether or not the current breakpoint is 'lg' or higher
 */
export function isBreakpointLgBreakpointOrHigher() {
  const currentBreakpoint = getCurrentBreakpoint();
  const breakpoints = options.breakpoints;

  const filteredBreakpoints = breakpoints.filter((breakpoint) => {
    return breakpoint.width > 768;
  });

  return filteredBreakpoints.find((breakpoint) => {
    return breakpoint.name ===  currentBreakpoint;
  }) !== undefined;
}

/**
 * Is window at XL breakpoint
 */
export function isBreakpointXL() {
  return (getCurrentBreakpoint() === 'xl');
}

/**
 * Is window at LG breakpoint
 */
export function isBreakpointLG() {
  return (getCurrentBreakpoint() === 'lg');
}

/**
 * Is window at MD breakpoint
 */
export function isBreakpointMD() {
  return (getCurrentBreakpoint() === 'md');
}

/**
 * Is window at SM breakpoint
 */
export function isBreakpointSM() {
  return (getCurrentBreakpoint() === 'sm');
}

/**
 * Is window at XS breakpoint
 */
export function isBreakpointXS() {
  return (getCurrentBreakpoint() === 'xs');
}


/**
 * Debounce a function to prevent too many executions
 * @function debounce
 * @param {Function} func - The function to run
 * @param {number} wait - The debounce delay, in milliseconds
 * @param {boolean} immediate - Execute at the start of the debounce period instead of the end
 * @returns {Function}
 */
export function debounce(func, wait, immediate) {
  let timeout;

  return function(){
    const context = this, args = arguments;
    const later = function(){
      timeout = null;

      if(!immediate){
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if(callNow){
      func.apply(context, args);
    }
  };
}

/**
 * Generate selector from className
 * @param className
 * @returns {string}
 */
export function getSelector(className = 'option-selector') {
  return `.${className}`;
}

/**
 * Test for touch device
 * @returns {boolean}
 */
export function isTouch() {
  return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

/**
 * Generate selector from className
 * @param className
 * @returns {string}
 */
export function getIdSelector(idName = 'option-selector') {
  return `#${idName}`;
}

/**
 * Generate selector from className
 * @param className
 * @returns {string}
 */
export function stripHash(idString = '') {
  return (idString && idString.indexOf('#') > -1) ? idString.substr(1, idString.length) : idString;
}

/**
 * Set/get/remove localStorage entries
 * Example usage: 
 * > localStorage.get('keyname')
 * > localStorage.set('keyname', 'keyvalue')
 * > localStorage.remove('keyname')
 * > localStorage.clearAll()
 */
export const localStorage = {
  /**
   * Get a value from localStorage based on a key name
   * @function get
   * @param {string} key - The localStorage key to return the value for
   * @returns {*} - The return of the localStorage query
   */
  get: function(key) {
    if (!store.get(key)) {
      return;
    }
    
    return store.get(key);
  },
  /**
   * Set a value within localStorage
   * @function set
   * @param {string} key - The localStorage key to assign the new value to
   * @param {*} value - The value to assign to the new entry
   */
  set: function(key, value) {
    store.set(key, value);
  },
  /**
   * Remove an entry from localStorage
   * @function remove
   * @param {string} key - The localStorage key to remove
   */
  remove: function(key) {
    store.remove(key);
  },
  /**
   * Remove all entries in localStorage for a specific key
   * @function clearAll
   */
  clearAll: function() {
    store.clearAll();
  }
}

/**
 * Generate a 128-bit GUID
 * @function generateGuid
 * @returns {string} - A guid in the form of xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function generateGuid() {
  return SUID().toLowerCase();
}
