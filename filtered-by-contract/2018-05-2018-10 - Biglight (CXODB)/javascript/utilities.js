/**
 * File: /assets/scripts/global/utilities.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import {CONSTS as configConsts} from './config';
import {sendLog} from './logger';

export const options = {
  DEBOUNCE: {
    RESIZE: 350,
    SCROLL: 5,
    SCROLLVARIATIONS: 200
  }
}

/**
 * Once the page is ready to execute script, execute the provided function
 * @function ready
 * @param {function} fn - The function to execute
 */
export function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * Take a string/object and retrieve all elements on the page for the selector match, then instantiate the component for the DOM nodeList
 * @param {string/object} componentSelector - A selector/object/collection to get the component on page
 * @param {object} Component - A Component to be rendered
 * @param {*} args - Additional arguments to be passed through to a component on construction
 */
export function renderComponent(Component, componentSelector = null, ...args) {
  try {
    let componentInstances = {};
    args = args[0];

    if (componentSelector === null) {
      const newComponent = new Component(args);
      newComponent.init();

      return newComponent;
    } else {
      if(Array.isArray(componentSelector)){
        componentInstances = componentSelector;
      } else if (typeof componentSelector === 'string') {
        componentInstances = document.querySelectorAll(componentSelector);
      } else if (typeof componentSelector === 'object') {
        const newComponent = new Component(componentSelector, args);
        newComponent.init();

        return newComponent;
      }

      if (componentInstances.length === 1) {
        const instance = document.querySelector(componentSelector);
        const newComponent = new Component(instance, args);
        newComponent.init();

        return newComponent;
      }

      const components = [];
      for(let i = 0; i < componentInstances.length; i++) {
        let instance = componentInstances[i];
        const newComponent = new Component(instance, args);
        components.push(newComponent);
        newComponent.init();
      }

      return components;
    }
  } catch(err) {
    // Temp error handling. Works for now but need a better way to find the component
    err = `
Component Error: ${Component.name}
----------------
${err.stack}`;
console.error(err);
  }
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
 * Locate a parentnode DOM element, based on a classname || tagName to match
 * @function findParentNode
 * @param {String} optons.className - The className to look for, in order to find the desired parent node
 * @param {String} options.tagName - The tagName to look for, in order to find the desired parent node
 * @param {String} options.attributeName - The attributeName to look for, in order to find the desired parent node
 * @param {Object} obj - The originating DOM element, where the event was initiated
 * @returns {Object} - The DOM element which is the requested parentNode
 * ****
 * Sample usage:
 * > Find parent by className: const elem = findParentNode({'className': 'node-to-find'}, originalDomElem);
 * > Find parent by tagName: const elem = findParentNode({'tagName': 'DIV'}, originalDomElem);
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
 * Retrieve the height of a specific DOM element
 * @function getDOMElementHeight
 * @param {object} element - The DOM element to check the height for
 */
export function getDOMElementHeight(element){
  // True reflects ALL child nodes should be included as part of the clone
  const cloneElem = element.cloneNode(true);
  cloneElem.classList.add('dimensions-check');

  // Add the cloned DOM element to the same parent DOM element of the one being cloned, so as to inherit all of the same CSS styles
  element.parentNode.appendChild(cloneElem);
  
  cloneElem.removeAttribute('style');

  const elementHeight = Math.round(cloneElem.offsetHeight);

  sendLog('[global/utilties.js](getDOMElementHeight)', element, `Height=${elementHeight}px`);

  // Remove the cloned DOM element, as it is no longer used, now that its height has been retrieved
  cloneElem.parentNode.removeChild(cloneElem);

  return elementHeight;
}

/**
 * Send data to the API via GET
 * @function apiGet
 * @param {string} url - The URL to send the data to (inclusive of parameters)
 * @retruns {promise} - The returned fetch promise
 */
export function apiGet(url){
  return fetch(url, {
    method: 'GET'
  }).then((response) => {
    return response.json();
  });
}

/**
 * Send data to the API via POST
 * @function apiPost
 * @param {string} url - The URL to send the data to
 * @param {object} data - The data to post
 * @retruns {promise} - The returned fetch promise
 */
export function apiPost(url, method='POST', data = {}){
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(data),
  })
  .then((response) => {
    return response.json();
  });
}

/**
 * What are the current scroll positions of the page?
 * @function scrollOffset
 * @returns {number} left - The x offset of the page
 * @returns {number} top - The y offset of the page 
 */
export function scrollOffset(){
  const documentElem = document.documentElement;

  return {
    left: (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0),
    top: (window.pageYOffset || documentElem.scrollTop)  - (documentElem.clientTop || 0)
  }
}

/**
 * Determine the api construct, based on the current component
 * @function apiUrlLookup
 * @param {string} componentName - The component which will connect to the API
 * @returns {string} - The path to the API, based on the mode type ('development' || 'live') MINUS the suffix
 */
export function apiUrlLookup(componentName){
  const apiUrlMode = configConsts.api.mode;
  const apiUrlPrefix = configConsts.api.urls.prefixes[apiUrlMode];
  const apiUrlComponent = `${configConsts.api.urls.components[componentName]}/`;
  const apiUrlSuffix = configConsts.api.urls.suffixes[apiUrlMode];

  return `${apiUrlPrefix}${apiUrlComponent}{{api-url-suffix}}${apiUrlSuffix}`;
}

/**
 * Format a dateTime string from YYYY-MM-DDTHH:MM:DD to DD/MM/YYYY
 * @function formatDateTime
 * @param {string} dateTime - A date time in the format of YYYY-MM-DDTHH:MM:DD
 * @returns {string} - A date only in the format of DD/MM/YYYY
 */
export function formatDateTime(dateTime){
  const dateOnly = dateTime.split('T')[0];
  const dateArr = dateOnly.split('-');

  return `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
}

/**
 * Sort an array of objects by a specific object property name
 * @function sortArrayByObjectProperty
 * @param {array} arrToSort - The array to sort
 * @param {string} filterProperty - The property name to sort by
 * @returns {array} - The newly sorted array
 */
export function sortArrayByObjectProperty(arrToSort, filterProperty){
  // Clone the input array to that a new instance (sorted array) is returned
  const tempArray = arrToSort.slice();
  
  return tempArray.sort((a, b) => {
    return a[filterProperty] == b[filterProperty] ? 0 : + (a[filterProperty] < b[filterProperty]) || -1;
  })
}

/**
 * Retrieve an elements position relative to the top of the browser window
 * @function positionRelativeToWindow
 * @param {element} elem - The element who is having their position retrieved
 * @returns {number} ojbect.bottom - The bottom (px) position of the element
 * @returns {number} ojbect.top - The top (px) position of the element
 */
export function positionRelativeToWindow(elem){
  const offset = elem.getBoundingClientRect();

  return {
    bottom: Math.round(offset.top + elem.offsetHeight),
    top: Math.round(offset.top)
  }
}

/**
 * Retrieve the current document scrollTop
 * @function getDocumentScrollTop
 * @returns {number} - The current scroll offset of the page
 */
export function getDocumentScrollTop(){
  return window.scrollY || document.documentElement.scrollTop;
}

/**
 * Polyfil for ES8 padStart
 * @function padStart
 * @param {string} targetString - The string to prefix
 * @param {number} targetLength - The number of digits to prefix by
 * @param {string} padString - The string to padd out
 */
export function padStart(targetString, targetLength, padString){
  targetLength = targetLength>>0; // Truncate if number or convert non-number to 0;
  padString = String((typeof padString !== 'undefined' ? padString : ' '));
  
  if(targetString.length > targetLength){
    return String(targetString);
  } else {
    targetLength = targetLength-targetString.length;
  
    if(targetLength > padString.length){
      padString += padString.repeat(targetLength/padString.length); // Append to original to ensure the string is no longer than needed
    }

    return padString.slice(0,targetLength) + String(targetString);
  }
};

/**
 * Check to see if a child element is a descendant of a specified parent element
 * @function isChildOfParent
 * @param {element} childElem - The child element
 * @param {element} parentElem - The parent element
 * @returns {boolean} - Whether or not the child element is a descendant of the parent element
 */
export function isChildOfParent(childElem,parentElem){
  while((childElem=childElem.parentNode) && childElem !== parentElem);

  return !!childElem;
}

/**
 * Find the siblings of an element (by tagName)
 * @function siblingsByTagName
 * @param {string} tagName - The tag name to be searching for as a sibling
 * @returns [array] - An array of the sibling elements for the requesting DOM element
 */
Element.prototype.siblingsByTagName = function(tagName){
  return [...this.parentElement.children].filter((node) => node != this && node.tagName.toUpperCase() === tagName.toUpperCase());
}

/**
 * Find the siblings of an element (by tagName and className)
 * @function siblingsByTagNameAndClassName
 * @param {string} tagName - The tag name to be searching for as a sibling
 * @param {string} className - A matching className to be searching for as a sibling
 * @returns [array] - An array of the sibling elements for the requesting DOM element
 */
Element.prototype.siblingsByTagNameAndClassName = function(tagName, className){
  return [...this.parentElement.children].filter((node) => node != this && node.tagName.toUpperCase() === tagName.toUpperCase() && node.classList.contains(className));
}

/**
 * Find the siblings of an element (flyout navigation specific) INCLUDING itself in the return
 * @function siblingsIncludingSelf
 * @returns [array] - An array of the sibling elements for the requesting DOM element
 */
Element.prototype.siblingsIncludingSelf = function(){
  return [...this.parentElement.children].filter((node) => node);
}

/**
 * Is a number between 2 other numbers?
 * @param {number} lower - The lower number to compare against
 * @param {number} upper - The upper number to compare against
 * @returns {boolean} - Whether or not the provided number sits between the lower and upper values
 */
Number.prototype.between = function(lower, upper){
  const minimum = Math.min.apply(Math, [lower, upper]);
  const maximum = Math.max.apply(Math, [lower, upper]);

  return this >= minimum && this <= maximum;
};

/**
 * Capitalize the first letter of a string of text
 * @function capitalize
 */
String.prototype.capitalize = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Replace all instances of a string within another string
 * @function replaceAll
 * @param {string} search - The string to find
 * @param {string} replacement - The string to replace the found string with
 */
String.prototype.replaceAll = function(search, replacement){
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};