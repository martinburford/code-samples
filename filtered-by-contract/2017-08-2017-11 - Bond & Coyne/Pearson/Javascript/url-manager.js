/**
* @module urlManager
* @author Martin Burford (martin@martinburford.co.uk)
* All functionality related to the management of URL/hash changes
*/

// Hashchange/Url management
import createHistory from 'history/createBrowserHistory';

// Object extension support
import extend from 'extend';

// Project modules
import events from './events';
import flyout from './flyout';
import overlay from './overlay';
import underlay from './underlay';
import utilities from './utilities';

const urlManager = (function(){
	const options = {};
	const history = createHistory();

	// Useful to check for debugging:
	// location.pathname
	// location.search
	// location.href
	// action
	history.listen((location, action) => {
		// console.log(`URL: ${location.pathname}${location.search}${location.hash}, ${action}`);

		// Submit tracking data to Google Tag Manager upon each change (PUSH or POP state)
		if(dataLayer){
			const trackingIdentifierArr = location.hash.split('/');
			const trackingIdentifier = trackingIdentifierArr[trackingIdentifierArr.length-1];
			const pageTitle = utilities.titleCase(trackingIdentifier, '-');
			const virtualPageViewTrackingData = {
			  'event': 'VirtualPageview',
			  'virtualPageURL': location.hash,
			  "virtualPageTitle" : pageTitle
			}

			dataLayer.push(virtualPageViewTrackingData);
		}

		if(action === 'POP'){
			if(overlay.options.isOverlayOpen){
				// Fade the overlay out of view
				overlay.hideOverlay();
			}

			// Process any URL changes by loading the associated content
		  	checkHashUrl(true);

			// Force the expansion of a specific toggle group within the flyout WITHOUT any PushState updates
			flyout.expandSingleGroupNoUrlSwitch();
		}
	})

	/**
	 * Force a URL change, which will persist into the history API (pushState)
	 * @function pushState
	 * @param {string} url - The URL framgment to update the existing URL with
	 */
	const pushState = (url) => {
		history.push(url);
	}

	/**
	 * Change the URL in the address bar in line with a link clicked on the homepage
	 * @function processHomepageLink
	 * @param {event} e - The event which triggered the showing of different content within the underlay
	 */
	const processHomepageLink = (e) => {
		const linkElem = e.target;
		const launchId = linkElem.getAttribute('data-underlay-content');
		const launchIdArr = launchId.split('|');
		const level1Id = launchIdArr[launchIdArr.length-1];
		let level2Id = null;

		if(linkElem.hasAttribute('data-content-block')){
			level2Id = linkElem.getAttribute('data-content-block');
		}

		let newUrl = '#/' + level1Id;
		if(level2Id !== null) {
			newUrl += '/' + level2Id;
		}

		// Force a URL change, which will persist into the history API (pushState)
		pushState(newUrl);
	}

	/**
	 * Change the URL in the address bar in line with a link clicked within a section of the flyout navigation
	 * @function processFlyoutSectionLink
	 * @param {object} linkElem - The section child link which has triggered a content switch
	 */
	const processFlyoutSectionLink = (linkElem) => {
		const childPageId = linkElem.getAttribute('data-identifier');
		const sectionId = utilities.findParentNode({tagName: 'ol'}, linkElem).previousElementSibling.getAttribute('data-identifier');

		// Change the URL in the address bar in line with a link clicked within the flyout
		urlManager.pushState('#/' + sectionId + '/' + childPageId);
	}

	/**
	 * Assign (or bypass) a pushState definition being set
	 * @function processUrlState
	 * @param {event} e - The click event
	 * @param {function} fn - The function to call in order to set the relevant pushState
	 */
	const processUrlState = (e, fn) => {
		if(e.data && e.data.pushState === false){
			return;
		} else {
			fn();
		}
	}

	/**
	 * Try to resolve the current hash URL value to an associated DOM navigation element/page content block
	 * @function currentHashPathToElem
	 * @returns {element} - The flyout DOM element which is related to the current hash value
	 */
	const currentHashPathToElem = () => {
		let pageElem;
		let level1Id;
		let level2Id;
		const pageId = window.location.hash.split('/');

		// Remove the # from the URL, in order to process the requested URL fragment
		pageId.shift();

		if(pageId.length === 0){
			pageElem = document.getElementById('home');
		} else {
			level1Id = pageId[0];

			switch(pageId.length){
				case 1:
					pageElem = document.querySelector('#flyout [data-identifier="' + level1Id + '"]');

					break;
				case 2:
					level2Id = pageId[1];

					if(level2Id.indexOf('?') > -1){
						level2Id = level2Id.split('?')[0];
					}
					
					pageElem = document.querySelector('#flyout [data-identifier="' + level2Id + '"]');

					break;
			}
		}

		return pageElem;
	}

	/**
	 * Process any URL changes by loading the associated content
	 * @function chexkHashUrl
	 */
	const checkHashUrl = (skipActiveCheck) => {
		let pageElem = currentHashPathToElem();

		// If the target DOM element exists, fire the related navigation item for it, in order to load the content AND update the flyout navigation
		if(pageElem !== null){
			let eventData = {
				pushState: false
			}

			// On POPstate, attach an additional property to the event data, so it can step over a specific check
			// This allows the home screen to remain within the POPstate feature of the site (forwards and backwards)
			if(skipActiveCheck){
				extend(eventData, {skipActiveCheck: skipActiveCheck});
			}

			events.fire(pageElem, 'click', eventData);
		}
	}

	return {
		checkHashUrl,
		currentHashPathToElem,
		processFlyoutSectionLink,
		processHomepageLink,
		processUrlState,
		pushState
	};
}());

export default urlManager;