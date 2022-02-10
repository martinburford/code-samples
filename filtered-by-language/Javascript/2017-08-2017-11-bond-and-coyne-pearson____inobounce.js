/**
* @module iNoBounce
* @author Martin Burford (martin@martinburford.co.uk)
* All functionality related to the blocking of iOS elastic bounce
*/

import overlay from './overlay';
import utilities from './utilities';

const iNoBounce = (function(){
	const options = {
		enabled: false,
		startY: 0
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

		if(scrollSupport){
			enable();
		}
	}

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
	 * Disable detection for elastic bouncing
	 * @function disable
	 * @private
	 */
	const disable = () => {
		window.removeEventListener('touchstart', handleTouchStart);
		window.removeEventListener('touchmove', handleTouchMove);
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
		// It may not be the element the event was called from (this may well be a child of the scrollable parent)
		if(isScrollableElem){
			scrollElem = e.target;
		} else {
			scrollElem = utilities.findParentNode({className: 'scroller'}, e.target);
		}

		const canScroll = scrollElem.scrollHeight > scrollElem.offsetHeight;

		// Take account of the site header when scrolling
		const headerHeight = 65;

		if(canScroll){
			let currentY = e.touches ? e.touches[0].screenY : e.screenY;
			currentY = currentY - headerHeight;

			const isAtTop = (options.startY <= currentY && scrollElem.scrollTop === 0);
			const isAtBottom = (options.startY >= currentY && scrollElem.scrollHeight - scrollElem.scrollTop === scrollElem.offsetHeight);

			if(isAtTop || isAtBottom){
				e.preventDefault();
			}

			return;
		}
	}

	/**
	 * Capture the current offset position when scrolling begins
	 * @function handleTouchStart
	 * @private
	 */
	const handleTouchStart = (e) => {
		options.startY = e.touches ? e.touches[0].screenY : e.screenY;
		options.startY = options.startY - 65;
	};

	return {
		init
	}
}());

export default iNoBounce;