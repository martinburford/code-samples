/**
* @module site
* @author Martin Burford (martin@martinburford.co.uk)
* The flyout, triggered by the triple bar/hamburger icon
*/

import cookies from './cookies';
import events from './events';
import findings from './components/findings';
import flyout from './flyout';
import overlay from './overlay';
import page from './page';
import underlay from './underlay';
import urlManager from './url-manager';
import utilities from './utilities';

const site = (function(){
	const options = {
		currentBreakpoint: utilities.getBreakpoint(),
		debounce: {
			resize: 250,
			scroll: 250
		},
		eventCaptureMode: 'click',
		isValidDeeplink: false
	}

	/**
	 * Initialize all generic site-wide logic
	 * @function init
	 */
	const init = () => {
		// The Welcome video is accessed/skipped via the absence/presence of a specific cookie key
		checkWelcomeVideoSkip();

		// Process any URL changes by loading the associated content
		urlManager.checkHashUrl();

		// Check to see whether touch support is avaiable on the device/browser viewing the site
		const isTouch = isTouchSupported();
		if(isTouch){
			document.body.classList.add('has-touch');
			options.eventCaptureMode = 'touchstart';
		}

		// Block scrolling on touch devices
		document.ontouchmove = (event) => {
			let isTouchMoveAllowed = true;
			let target = event.target;

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
		}

		// Ensure all a[rel="external"] elements launch their target in a new tab/window
		events.delegate(document.body, '[rel="external"]', 'click', (e) => {
			e.preventDefault();

			let linkElem = e.target;
			if(linkElem.tagName.toLowerCase() !== 'a'){
				linkElem = linkElem.parentNode;
			}

			const linkUrl = linkElem.getAttribute('href');
			window.open(linkUrl);
		});

		// Logic to support the capability to skip the video in future visits (via persistent cookie)
		events.delegate(document.body, '#welcome-video .skip', 'click', (e) => {
			e.preventDefault();

			// Set a cookie to enable bypassing the video upon the next site visit
			cookies.set('skipWelcomeVideo', 'true', {expires: 365});

			// In order to hide the 'Skip' link, add a classname for the CSS to reference
			document.body.classList.add('skip-welcome-video');

			urlManager.pushState('#/homescreen');

			// Process any URL changes by loading the associated content
			urlManager.checkHashUrl();
		});

		// Add support for closing the flyout/underlay/overlay when the escape key is pressed
		document.addEventListener('keyup', (e) => {
			if(e.keyCode === 27){
				if(overlay.options.isOverlayOpen){
					// Fade the overlay out of view
					overlay.hideOverlay();
				} else {
					if(underlay.options.isUnderlayOpen && !flyout.options.isFlyoutOpen){
						// Hide the underlay and reset back to the home screen
						let homeElem = document.getElementById('home');
						events.fire(document.getElementById('home'), 'click');
					}

					// Hide the flyout regardless of whether the underlay is visible or not
					if(flyout.options.isFlyoutOpen){
						// Hide the flyout
						flyout.hideFlyout();
					}
				}
			}
		});

		// Resize.start event (window)
		window.addEventListener('resize', utilities.debounce(function(){
			document.body.classList.add('resizing');

			// Since the overlay height is calculated by JavaScript (for tablet and desktop breakpoints), hide it if it's open, when a resize event begins
			if( overlay.options.isOverlayOpen){
				// Fade the overlay out of view
				overlay.hideOverlay();
			}

			// Reset the visibility of the Data Visualization chart on resize, since the position of the tooltip changes depending on breakpoints
			if(findings.options.isChartVisible){
				// Hide the chart (and for the mobile breakpoint the tooltip as well)
				findings.hideChartAndTooltip();
			}
		}, options.debounce.resize, true));

		// Resize.stop event (window)
		window.addEventListener('resize', utilities.debounce(function(){
			document.body.classList.remove('resizing');

			// Update the globally stored breakpoint
			site.options.currentBreakpoint = utilities.getBreakpoint();

			// Since there is no concept of the overlay on the mobile breakpoint, IF it happens to be visible (from a browser resize), on entering mobile breakpoint, reset it, so the flyout navigation becomes re-enabled
			if(site.options.currentBreakpoint === 'mobile' && overlay.options.isOverlayOpen){
				// Fade the overlay out of view
				overlay.hideOverlay();
			}

			// Check for overflow of any inner content within the underlay
			underlay.checkUnderlayOverflow();
		}, options.debounce.resize));
	}

	/**
	 * Check to see whether touch support is avaiable on the device/browser viewing the site
	 * @function isTouchSupported
	 * @private
	 */
	const isTouchSupported = () => {
		return typeof window.ontouchstart !== 'undefined';    
	}

	/**
	 * Reset the visibility of the overlay the underlay and the flyout
	 * @function resetOverlayAndUnderlayAndFlyout
	 */
	const resetOverlayAndUnderlayAndFlyout = () => {
		const flyoutElem = document.getElementById('flyout');
		if(flyoutElem && flyout.options.isFlyoutOpen){
			// Hide the flyout
			flyout.hideFlyout();
		}

		const underlayElem = document.getElementById('underlay');
		if(underlayElem && underlay.options.isUnderlayOpen){
			// Fade the underlay out of view and return to the home screen
			underlay.hideUnderlay();
		}

		const overlayElem = document.getElementById('overlay');
		if(overlayElem && overlay.options.isOverlayOpen){
			// Fade the overlay out of view
			overlay.hideOverlay();
		}
	}

	/**
	 * The Welcome video is accessed/skipped via the absence/presence of a specific cookie key
	 * @function checkWelcomeVideoSkip
	 */
	const checkWelcomeVideoSkip = () => {
		const skipWelcomeVideo = cookies.get('skipWelcomeVideo');

		if(skipWelcomeVideo !== 'true'){
			urlManager.pushState('#/welcome-video');
		} else {
			// In order to hide the 'Skip' link, add a classname for the CSS to reference
			document.body.classList.add('skip-welcome-video');

			// Try to resolve the current hash URL value to an associated DOM navigation element/page content block
			// This will force the site to deeplink to the requested URL
			let pageElem = urlManager.currentHashPathToElem();
			events.fire(pageElem, 'click');

			// Force the expansion of a specific toggle group within the flyout WITHOUT any PushState updates
			flyout.expandSingleGroupNoUrlSwitch();
		}
	}

	/**
	 * A holding function for any functionality to be called on the window.load event
	 * @function onloadFunctionality
	 */
	const onloadFunctionality = () => {
		// Initialize all components within a specific page
		const underlayPendingContentElem = document.getElementById('underlay');
		page.components.init(underlayPendingContentElem);
		site.options.isValidDeepLink = false;
	}

	return {
		currentBreakpoint: options.currentBreakpoint,
		init,
		onloadFunctionality,
		options,
		resetOverlayAndUnderlayAndFlyout
	};
}());

export default site;