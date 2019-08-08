/**
* @module utilities
* @author Martin Burford (martin@martinburford.co.uk)
* Global utilities for use site-wide
*/

const utilities = (function(){
	const options = {
		breakpoints: [
			{name: 'mobile', width: -1},
			{name: 'tablet', width: 728},
			{name: 'desktop', width: 1025},
		]
	};

	/**
	 * Retrieve some content via AJAX
	 * @function xhr
	 * @param {string} url - The URL of the AJAX content
	 * @param {function} callback - The callback function to execute upon the content having been successfully returned
	 * @param {Object} [options] - Additional options
	 * @param {string} [options.method] - The http method to use for the request (defaults to 'get')
	 * @param {boolean} [options.sync] - Make the request synchronous (defaults to false)
	 */
	function ajax(url, callback, options){
		if(!url || !callback){
			return;
		}

		options = options || {};

		try {
			var xhr = new XMLHttpRequest();

			xhr.open(options.method || 'get', url, !options.sync);

			if(options.headers){
				Object.keys(options.headers).forEach(function(key){
					xhr.setRequestHeader(key, options.headers[key]);
				});
			}

			xhr.send(options.data || null);

			// Process the AJAX having been successfully returned
			xhr.onload = function(){
				if(xhr.readyState === 4){
					if(xhr.status === 200){
						callback(xhr);
					} else if(options.errorCallback){
						options.errorCallback(xhr);
					}
				}
			};
		} catch(err){}
	}

	/**
	 * Retrieve some content via AJAX. Returns a promise
	 * @function xhr
	 * @param {string} url - The URL of the AJAX content
	 * @param {Object} [options] - Additional options
	 * @param {string} [options.method] - The http method to use for the request (defaults to 'get')
	 * @param {boolean} [options.sync] - Make the request synchronous (defaults to false)
	 */
	function ajaxPromise(url, options){
		return new Promise(function(resolve, reject){
			if(!url){
				reject('missing required parameters');
				return;
			}

			options = options || {};

			try {
				var xhr = new XMLHttpRequest();

				xhr.open(options.method || 'get', url, !options.sync);

				if(options.headers){
					Object.keys(options.headers).forEach(function(key){
						xhr.setRequestHeader(key, options.headers[key]);
					});
				}

				xhr.send(options.data || null);

				// Process the AJAX having been successfully returned
				xhr.onload = function(){
					if(xhr.readyState === 4 && xhr.status === 200){
						resolve(xhr);
					} else {
						reject(xhr);
					}
				};
			} catch(err){
				reject(err);
			}
		});
	}

	/**
	 * Debounce a function to prevent too many executions
	 * @function debounce
	 * @param {Function} func - The function to run
	 * @param {number} wait - The debounce delay, in milliseconds
	 * @param {boolean} immediate - Execute at the start of the debounce period instead of the end
	 * @returns {Function}
	 */
	const debounce = (func, wait, immediate) => {
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
	 * Which breakpoint is the site being viewed within?
	 * @function getBreakpoint
	 * @param {number} [input] - The width of the window
	 * @returns {string} - Either 'mobile' || 'tablet' || 'desktop'
	 */
	const getBreakpoint = (width) => {
		width = width || window.innerWidth;

		const breakpoints = options.breakpoints;
		const breakpointLength = breakpoints.length;

		for(let i=0; i<breakpointLength; i++){
			if(width < breakpoints[i].width){
				return breakpoints[i-1].name;
			}
		}

		return breakpoints[breakpointLength-1].name;
	}

	/**
	 * For the mobile breakpoint, set the height of a DOM element equal to the window.innerHeight, to accomodate for the shrinking Safari address bar
	 * @function setElementToWindowInnerHeight
	 * @param {element} element - The DOM element to apply the height to
	 * @param {object} [topOffset] - If there is a top and bottom gutter to apply, take account of it (eg: the underlay has a custom offset for different breakpoints)
	 */
	const setElementToWindowInnerHeight = (element, topOffset) => {
		topOffset = topOffset ? topOffset : 0;

		const currentBreakpoint = site.options.currentBreakpoint;
		const elementHeight = topOffset ? window.innerHeight - (topOffset * 2) : window.innerHeight;

		if(currentBreakpoint === 'mobile'){
			element.style.height = elementHeight + 'px';
			element.style.top = topOffset + 'px';
		}
	}

	/**
	 * Retrieve the height of a DOM element which is potentially hidden by CSS
	 * @function getElementHeight
	 * @param {element} element - The DOM element to calculate the height for
	 * @returns {number} - The height of the DOM specified
	 */
	const getElementHeight = (element) => {
		const newDomElement = element.cloneNode(true);
		let foundHeight;
		newDomElement.appendBefore(element);
		newDomElement.setAttribute('data-clone', true);

		// Flush out any cloned attributes which would affect subsequent height calculation
		newDomElement.removeAttribute('data-toggle-height');
		newDomElement.removeAttribute('class');
		newDomElement.removeAttribute('style');

		foundHeight = newDomElement.offsetHeight;

		// Remove the temporary clone now that the height has been calculated
		newDomElement.parentNode.removeChild(newDomElement);

		return foundHeight;
	}

	/**
	 * Locate a parentnode DOM element, based on a classname || tagName to match
	 * @function findParentNode
	 * @param {String} className - The className to look for, in order to find the desired parent node
	 * @param {String} tagName - The tagName to look for, in order to find the desired parent node
	 * @param {Object} obj - The originating DOM element, where the event was initiated
	 * @returns {Object} - The DOM element which is the requested parentNode
	 */
	const findParentNode = (options, obj) => {
		let nodeToTestElem = obj.parentNode;
		const searchByClassName = options.hasOwnProperty('className');
		const searchByTagName = options.hasOwnProperty('tagName');

		if(searchByClassName){
			while(!nodeToTestElem.classList.contains(options.className)){
				nodeToTestElem = nodeToTestElem.parentNode;
			}
		} else if(searchByTagName){
			while(nodeToTestElem.tagName !== options.tagName.toUpperCase()){
				nodeToTestElem = nodeToTestElem.parentNode;
			}
		}

		return nodeToTestElem;
	}

	/**
	 * Sort an array of objects by a specific object property name
	 * @function sortArrayByObjectProperty
	 * @param {array} arrToSort - The array to sort
	 * @param {string} filterProperty - The property name to sort by
	 * @returns {array} - The newly sorted array
	 */
	const sortArrayByObjectProperty = (arrToSort, filterProperty) => {
		// Clone the input array to that a new instance (sorted array) is returned
		const tempArray = arrToSort.slice();
		
		return tempArray.sort((a, b) => {
			return a[filterProperty] == b[filterProperty] ? 0 : + (a[filterProperty] < b[filterProperty]) || -1;
		})
	}

	/**
	 * Convert a string of text to title case (eg: 'Hello there world' => 'Hello There World')
	 * @function titleCase
	 * @param {string} text - The text string to re-format
	 * @param {string} separator - The divider to split the string with
	 * @returns {string} - The re-formatted string in title case
	 */
	const titleCase = (text, separator) => {
		return text.toLowerCase().split(separator).map((word) => {
			return word[0].toUpperCase() + word.substr(1)
		}).join(' ');
	}

	/**
	 * Format a component name into JavaScript module name construct (eg: responsive-image => responsiveImage)
	 * @function formatModuleNameToScriptModuleName
	 * @param {string} moduleName - The name of a module, as specified by its [data-module] property
	 * @returns {string} - The re-formatted module name in camelCase format (eg: responsiveImage)
	 */
	const formatModuleNameToScriptModuleName = (moduleName) => {
		return moduleName.split('-').map((moduleSnippet, index) => {
			let isFirstIndex = index === 0;
			return (isFirstIndex ? moduleSnippet.substr(0,1).toLowerCase() : moduleSnippet.substr(0,1).toUpperCase()) + moduleSnippet.substr(1,moduleSnippet.length-1).toLowerCase();
		}).join('');
	}

	/**
	 * Find the siblings of an element (flyout navigation specific)
	 * @function siblings
	 * @returns [array] - An array of the sibling elements for the requesting DOM element
	 */
	Element.prototype.siblings = function(){
		return [...this.parentElement.children].filter((node) => node != this && node.querySelector('a').classList.contains('active'));
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
	 * Check to see whether a flyout navigation item has any direct a.toggle elements. If not, no first link selection should take place
	 * @function checkForNonToggleLinks
	 * @returns {boolean} - Whether the flyout group expanded includes direct a.toggle links or not
	 */
	Element.prototype.checkForNonToggleLinks = function(){
		const children = this.children;
		let innerChildren;
		let hasNonToggleElements = false;

		[...children].forEach(function(childListItem){ // LI
			innerChildren = [...childListItem.children].filter((node) => node.nodeName.toLowerCase() === 'a' && !node.classList.contains('toggle')); // EACH ANCHOR
			if(innerChildren.length === 1){
				hasNonToggleElements = true;
				return;
			}
		});

		return hasNonToggleElements;
	}

	/**
	 * Attach an element to the DOM BEFORE the provided element
	 * @function appendBefore
	 */
	Element.prototype.appendBefore = function(element){
		element.parentNode.insertBefore(this, element);
	}

	return {
		ajax,
		ajaxPromise,
		debounce,
		findParentNode,
		formatModuleNameToScriptModuleName,
		getBreakpoint,
		getElementHeight,
		setElementToWindowInnerHeight,
		sortArrayByObjectProperty,
		titleCase
	};
}());

export default utilities;	