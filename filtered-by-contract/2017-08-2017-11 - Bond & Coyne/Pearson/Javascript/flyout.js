/**
* @module flyout
* @author Martin Burford (martin@martinburford.co.uk)
* The flyout, triggered by the triple bar/hamburger icon
*/

import events from './events';
import overlay from './overlay';
import site from './site';
import underlay from './underlay';
import urlManager from './url-manager';
import utilities from './utilities';

const flyout = (function(){
	const options = {
		animations: {
			accordionDuration: 500,
			contentSwitch: 500,
			fadeInOut: 250	
		},
		debounce: {
			resize: 250,
			scroll: 500
		},
		isFlyoutOpen: false,
		transitionInterval: null
	};

	/**
	 * Initialize the flyout module
	 * @function init
	 */
	const init = () => {
		// Setup all initial events
		eventsInit();

		// Remove any temporary intervals once the flyout has stopped transitioning
		// This allows for dynamic resizing whilst transition occurs
		// Once the transition completes, it's important to remove this interval
		document.getElementById('flyout').addEventListener('transitionend', (e) => {
			if(overlay.options.isOverlayInDom){
				clearInterval(flyout.options.transitionInterval);
			}
		});
	}

	/**
	 * Setup all initial events
	 * @function eventsInit
	 * @private
	 */
	const eventsInit = () => {
		document.getElementById('flyout-trigger').addEventListener('click', function(e){
			e.preventDefault();

			if(overlay.options.isOverlayInDom){
				// Setup a temporary interval to handle dynamic overlay resizing, whilst the flyout is either animating into or out of view
				options.transitionInterval = setInterval((e) => {
					// overlay.checkOverlayOverflow();
				}, 1);
			}

			if(!document.body.hasAttribute('data-flyout-visible')){
				document.body.setAttribute('data-flyout-visible', false);
			}

			// Toggle the visibility of the flyout
			const flyoutVisibleFlag = document.body.getAttribute('data-flyout-visible');

			switch(flyoutVisibleFlag){
				case 'true': 
					options.isFlyoutOpen = false;

					// Indicate to the entire page that the flyout is NOT visible
					document.body.removeAttribute('data-flyout-visible');
					break;
				case 'false':
					options.isFlyoutOpen = true;

					// Indicate to the entire page that the flyout is visible
					document.body.setAttribute('data-flyout-visible', true);
					break;
			}
		});

		// Toggle a navigation group open
		// Clone the relevant section content into the central site underlay
		events.delegate(document.body, '#flyout a.toggle', 'click', (e) => {
			e.preventDefault();

			const linkElem = e.target;
			const toggleGroupElem = linkElem.nextElementSibling;

			// Retrieve the height of a DOM element which is potentially hidden by CSS
			const toggleGroupHeight = utilities.getElementHeight(toggleGroupElem);

			// Set the height of the element to be expanded as a data-attribute upon every toggle request
			toggleGroupElem.setAttribute('data-toggle-height', toggleGroupHeight);

			// Regardless of nesting level, hide any (active) sibling groups, so that the accordion only allows 1 group to be open at once
			const groupSiblings = linkElem.parentNode.siblings();
			let activeElem;
			groupSiblings.forEach((siblingElem) => {
				activeElem = siblingElem.querySelector('a.toggle');
				if(activeElem){
					events.fire(activeElem, 'click');
				}
			});

			// Toggle the active class, to either expand or contract the toggle group
			linkElem.classList.toggle('active');

			// Find any previously selected child elements, in order to re-show their content in the page
			// A check will need to be made to ensure that the current page doesn't match the active child element, since you don't want to fade to identical page content, which is already in view
			activateAnyActiveChildren(linkElem);

			// Set the height regardless of expand/contract
			// This is due to the shift from 0px to height of element when expanding
			// And resetting height:auto to height:[element height] before contracting
			toggleGroupElem.style.height = toggleGroupElem.getAttribute('data-toggle-height') + 'px';

			if(!linkElem.classList.contains('active')){
				// A close toggle is requested. Reset the height of the group to be closed to it's expanded height BEFORE changing it to 0px
				// This is because expanded groups have the height of 'auto' upon transitionend
				toggleGroupElem.style.height = toggleGroupElem.getAttribute('data-toggle-height') + 'px';

				// Execute the toggling in a separate execution block
				setTimeout(() => toggleGroupElem.style.height = '0px', 0);
			} else {
				// Store a reference for which current section is toggled open
				underlay.options.currentVisibleSection = linkElem.getAttribute('data-identifier');

				// Remove active state from any root level navigation nodes
				resetRootNodeLinks();

				// Does the toogle group expanded have any direct children (which CANNOT be toggled?)
				const hasNonToggleChildLinks = toggleGroupElem.checkForNonToggleLinks();
				if(!hasNonToggleChildLinks){
					// Check to see whether specific nested navigation has been previously selected within a group being expanded
					// If it has, tree walk the nodes to identify (and re-load) the previous content
					treeWalkActiveSelection(linkElem);
				}
			}
		});

		// Scroll to the associated content in the central site underlay
		events.delegate(document.body, '#flyout a:not(.toggle)', 'click', (e) => {
			e.preventDefault();

			// Assign an active state to the selected navigation item
			let linkElem = e.target;

			// On POPstate, to not perform this check, to allow the homescreen to be part of the push/pop state URL changes (forwards and backwards)
			if(e.data && !e.data.skipActiveCheck){
				// Don't allow the link event to be fired if the current link is active
				if(linkElem.classList.contains('active')){
					return;
				}
			}

			// Don't follow the standard non-toggle link functionality if a flyout bar logo has been clicked
			if(utilities.findParentNode({tagName: 'li'}, linkElem).hasAttribute('data-logo')){
				if(linkElem.tagName.toLowerCase() !== 'a'){
					linkElem = utilities.findParentNode({tagName: 'a'}, linkElem);

					// Launch the logo URL in a new window/tab
					window.open(linkElem.getAttribute('href'));
				}
				return false;	
			}

			// Reset and then apply the appropriate active element styling
			const isRootNodeLink = isRootNode(linkElem);
			let selectorNode = document;
			if(!isRootNodeLink){
				selectorNode = utilities.findParentNode({tagName: 'ol'}, linkElem);	
			}

			// Reset active states of all root level links
			const rootSiblings = Array.from(document.querySelectorAll('[data-level="0"]'));
			rootSiblings.forEach((siblingElem) => {
				let activeToggleElem = siblingElem.querySelector('a.active');
				if(activeToggleElem){
					siblingElem.querySelector('a.active').classList.remove('active');	
				}
			});

			linkElem.classList.add('active');

			// Hide the overlay IF it is open when switching underlay content
			if(overlay.options.isOverlayOpen){
				// Fade the overlay out of view
				overlay.hideOverlay();
			}

			// Hide the flyout IF the link click has been triggered from the site being viewed in the mobile breakpoint
			const currentBreakpoint = site.options.currentBreakpoint;
			if(currentBreakpoint === 'mobile' || currentBreakpoint === 'tablet'){
				// Hide the flyout
				hideFlyout();
			}

			let linkIdentifier = linkElem.getAttribute('data-identifier');
			let skipContentSwitch = false; // Any single page navigation may need to skip a content switch

			if(isRootNodeLink){
				// No content needs to be switched for the reset to homepage
				if(linkElem.hasAttribute('data-return-home')){
					// Hide the flyout
					hideFlyout();
				}

				// Assign (or bypass) a pushState definition being set
				urlManager.processUrlState(e, () => {
					// Change the URL in the address bar in line with a link clicked within the flyout navigation
					urlManager.pushState('#/' + linkIdentifier);
				});

				// Store a reference for which current section is toggled open
				underlay.options.currentVisibleSection = linkIdentifier;

				// If a root node has been clicked, reset the necessary level 1 (currently expanded) groups
				const groupSiblings = Array.from(document.querySelectorAll('[data-level="1"]>a.toggle.active'));
				groupSiblings.forEach((siblingElem) => {
					events.fire(siblingElem, 'click');
				});
			} else {
				// Reset active states of all sibling links (specific to the current expanded group)
				const siblings = linkElem.parentNode.siblings();
				siblings.forEach((siblingElem) => {
					let activeToggleElem = siblingElem.querySelector('a.active');
					if(activeToggleElem){
						siblingElem.querySelector('a.active').classList.remove('active');	
					}
				});

				// Is the requested page a Single-page navigation content block?
				const isSinglePageNavigation = linkElem.hasAttribute('data-single-page-navigation-id');

				if(isSinglePageNavigation){
					const underlayElem = document.getElementById('underlay');

					linkIdentifier = linkElem.getAttribute('data-single-page-navigation-id');

					// console.log('isSinglePageNavigation: ', isSinglePageNavigation, ', currentVisibleContentBlock=', underlay.options.currentVisibleContentBlock, ', linkIdentifier=', linkIdentifier);

					// Is the correct content already within the underlay
					if(underlay.options.currentVisibleContentBlock === linkIdentifier){
						// console.log('Already on this page, requested: ', linkElem.getAttribute('data-identifier'));
						
						events.fire(underlayElem.querySelector('[data-jumplink-id="' + linkElem.getAttribute('data-identifier') + '"]'), 'click', e.data);
					} else {
						// console.log('Load content in underlay despite being single page');

						// Grab the content for the requested section, and provide it to the user on screen (within the underlay)
						underlay.contentSwitchWithFade(linkIdentifier, () => {
							events.fire(document.querySelector('#underlay [data-jumplink-id="' + linkElem.getAttribute('data-identifier') + '"]'), 'click', e.data);
						});
					}

					skipContentSwitch = true;
				} else {
					// Assign (or bypass) a pushState definition being set
					urlManager.processUrlState(e, () => {
						// Change the URL in the address bar in line with a link clicked within a section of the flyout navigation
						urlManager.processFlyoutSectionLink(linkElem);
					});
				}
			}

			if(!skipContentSwitch){
				// Grab the content for the requested section, and provide it to the user on screen (within the underlay)
				underlay.contentSwitchWithFade(linkIdentifier);
			}
		});

		// Because there can be nested levels of navigation, a height of 'auto' needs to be applied on transitionEnd, to ensure a fixed height doesn't clip child toggle groups
		events.delegate(document.body, '#flyout ol', 'transitionend', function(e){
			const toggleElem = e.target.previousElementSibling;
			if(toggleElem){
				if(toggleElem.classList.contains('active')){
					// Older versions of iOS run the animation twice due to the transitionend callback being fired for the switch to the actual element height, then AGAIN for the switch to auto
					// In order to get around this, before switching to height:auto, reduce the CSS transition time back to 0ms, then re-instate it once again for subsequent animations
					let accordionElem = document.querySelector('.accordion');
					accordionElem.classList.add('fast-toggle');

					this.style.height = 'auto';

					// Re-instate the regular CSS transition timings
					setTimeout(() => accordionElem.classList.remove('fast-toggle'),1);
				}
			}
		});
	}

	/**
	 * Does the trigger link sits at the root of the flyout navigation?
	 * @function isRootNode
	 * @param {element} linkElem - The link clicked from the flyout navigation
	 * @returns {boolean} - Whether or not the link provided sits at the root of the flyout navigation or not
	 */
	const isRootNode = (linkElem) => {
		return parseInt(linkElem.parentNode.getAttribute('data-level')) === 0;
	}

	/**
	 * Remove active state from any root level navigation nodes
	 * @function resetRootNodeLinks
	 * @private
	 */
	const resetRootNodeLinks = () => {
		const rootNodeElems = Array.from(document.querySelectorAll('[data-level="0"]'));
		let activeElem;
		rootNodeElems.forEach((node) => {
			activeElem = node.querySelector('a.active');
			if(activeElem){
				activeElem.classList.remove('active');
			}
		});
	}

	/**
	 * Check to see whether specific nested navigation has been previously selected within a group being expanded
	 * If it has, tree walk the nodes to identify (and re-load) the previous content
	 * @function treeWalkActiveSelection
	 * @private
	 * @param {element} toggleElem - The toggle group link which has been clicked
	 */
	const treeWalkActiveSelection = (toggleElem) => {
		let existingExpandElem;
		const expandedGroups = [...toggleElem.nextElementSibling.children].filter((node) => node != this && node.querySelector('a').classList.contains('active'));

		if(expandedGroups.length > 0){
			existingExpandElem = expandedGroups[0].querySelector('a.active');
			existingExpandElem.classList.remove('active');
			events.fire(existingExpandElem, 'click');
		}
	}

	/* 
	 * Check to see is a specific level of nesting includes children which are NOT toggle
	 * @function groupContainsDirectChildren
	 * @private
	 * @param {element} linkElem - The toggle group link which has been clicked (to expand its children links)
	 * @returns {boolean} object.containsDirectChildren - Whether or not the toggle group has direct descendant child links which are NOT toggle elements
	 * @returns {array} object.selectedChildElem - Either an empty array OR an array with the single matching selected child descendant element, which will need to be activated
	 */
	const groupContainsDirectChildren = (linkElem) => {
		const currentNestingLevel = parseInt(linkElem.parentNode.getAttribute('data-level'));
		const nestingNodeToCheck = currentNestingLevel+1;
		const toggledGroupElem = linkElem.nextElementSibling;

		// Check to see whether the group has any direct (non-toggle) childen, so essentially, links which have content blocks attached to them, and can therefore be selected
		const childElems = Array.from(toggledGroupElem.querySelectorAll('[data-level="' + nestingNodeToCheck + '"]>a:not(.toggle)'));
		const containsDirectChildren = childElems.length > 0;
		let selectedChildElem = [];

		if(containsDirectChildren){
			// If there are any direct child (which are not toggle links), are any of them currently active?
			selectedChildElem = childElems.filter((childElem) => {
				return childElem.classList.contains('active');
			});		
		}

		return {
			containsDirectChildren,
			selectedChildElem
		}
	}

	/**
	 * Find any previously selected child elements, in order to re-show their content in the page
	 * @function activateAnyActiveChildren
	 * @private
	 * @param {element} linkElem - The toggle group link which has been clicked (to expand its children links)
	 */
	const activateAnyActiveChildren = (linkElem) => {
		if(linkElem.classList.contains('active')){
			// Check to see is a specific level of nesting includes children which are NOT toggle
			const groupHasDirectChildren = groupContainsDirectChildren(linkElem);

			if(groupHasDirectChildren.selectedChildElem.length === 1){
				const dataIdentifier = groupHasDirectChildren.selectedChildElem[0].getAttribute('data-identifier');
				const dataIdentifierElem = document.querySelector('[data-identifier="' + dataIdentifier + '"]');

				// If the group being expanded already has an active child, (temporarily) remove its active state, so it can be re-selected, resulting in an associated pushState update
				dataIdentifierElem.classList.remove('active');
				events.fire(document.querySelector('[data-identifier="' + dataIdentifier + '"]'), 'click', {pushState: false});
			}
		} else {
			// A group has been closed, so there is no need to check any current active states
		}
	}

	/**
	 * Auto-toggle nested levels of navigation at the point in time the underlay is populated AND shown
	 * @function autoToggleNavigationgGroups
	 * @param {event} e - The event which triggered the showing of the underlay
	 * @param {string} launchId - A pipe-delimited identifer indicating which group (or groups) to auto-toggle eg: 'methodology' or 'findings|personas'
	 */
	const autoToggleNavigationgGroups = (e, launchId) => {
		const linkElem = e.target;

		if(!linkElem.hasAttribute('data-bypass-toggle')){
			const navigationAccordionElem = document.querySelector('#flyout .accordion');
			const navigationIdentifiers = launchId.split('|');

			// Reset all active links and close all open toggle groups
			resetActiveLinks();

			// Offset each toggle animations (triggered via the click)
			navigationIdentifiers.forEach((identifier, index) => {
				setTimeout(() => {
					events.fire(navigationAccordionElem.querySelector('[data-identifier="' + identifier + '"]'), 'click', e.data);	
				}, options.animations.accordionDuration * index);
			});
		}
	}

	/**
	 * Force the expansion of a specific toggle group within the flyout WITHOUT any PushState updates
	 * @function expandSingleGroupNoUrlSwitch
	 */
	const expandSingleGroupNoUrlSwitch = () => {
	  	let activeLinkElem = urlManager.currentHashPathToElem();
	  	let activeLinkElemLevel = parseInt(activeLinkElem.parentNode.getAttribute('data-level'));

		if(activeLinkElemLevel > 0) {
		  	let olElem = utilities.findParentNode({tagName: 'ol'}, activeLinkElem);
		  	let toggleGroupElem = olElem.previousElementSibling;

		  	if(!toggleGroupElem.classList.contains('active')){
				// Retrieve the height of a DOM element which is potentially hidden by CSS
				const toggleGroupHeight = utilities.getElementHeight(olElem);

				// Set the height of the element to be expanded as a data-attribute upon every toggle request
				olElem.setAttribute('data-toggle-height', toggleGroupHeight);

				olElem.style.height = olElem.getAttribute('data-toggle-height') + 'px';

		  		// Expand a given navigation group, and close all siblings
		  		toggleGroupElem.classList.add('active');

				// Regardless of nesting level, hide any (active) sibling groups, so that the accordion only allows 1 group to be open at once
				const groupSiblings = toggleGroupElem.parentNode.siblings();
				let activeElem;
				let activeOlElem;
				groupSiblings.forEach((siblingElem) => {
					activeElem = siblingElem.querySelector('a.toggle.active');
					
					if(activeElem){
						activeElem.classList.remove('active');
						activeOlElem = activeElem.nextElementSibling;

						// Restore initial height
						activeOlElem.style.height = activeOlElem.getAttribute('data-toggle-height') + 'px';

						setTimeout(() => activeOlElem.style.height = '0px', 0);
					}
				});
		  	}
		}
	}

	/**
	 * Hide the flyout
	 * @function hideFlyout
	 */
	const hideFlyout = () => {
		// Since the mobile breakpoint attaches a calculated style (height/top), remove it when the flyout is hidden, as it could be hiding due to a breakpoint change
		// Tablet and Desktop breakpoints provide styles entirely via CSS, so any inline styles must not exist
		const flyoutElem = document.getElementById('flyout');
		flyoutElem.removeAttribute('style');

		document.body.removeAttribute('data-flyout-visible');

		options.isFlyoutOpen = false;
	}

	/**
	 * Reset all active links and close all open toggle groups
	 * @function resetActiveLinks
	 */
	const resetActiveLinks = () => {
		// Remove the active class from all non-toggle links
		const nonToggleActiveFlyoutLinks = Array.from(document.querySelectorAll('#flyout .accordion a.active:not(.toggle)'));
		nonToggleActiveFlyoutLinks.forEach((link) => {
			link.classList.remove('active');
		});

		// Close all expanded toggle groups
		const toggleActiveFlyoutLinks = Array.from(document.querySelectorAll('#flyout .accordion a.active.toggle'));
		toggleActiveFlyoutLinks.forEach((link) => {
			events.fire(link, 'click');
		});
	}

	return {
		autoToggleNavigationgGroups,
		expandSingleGroupNoUrlSwitch,
		hideFlyout,
		init,
		isRootNode,
		options,
		resetActiveLinks
	};
}());

export default flyout;