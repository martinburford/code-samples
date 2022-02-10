/**
* This module contains all intialization logic for the header module, as well as all resize (breakpoint switching) features
* @module header
* @copyright Trinity Mirror 2015
*/

/* global localDataOverrides */

var events = require('chameleon-events');
var log = require('chameleon-core/log');
var utilities = require('chameleon-utilities');
var extend = require('extend');

module.exports = (function(){
  var options = {
    containsFooterNavigation: false,
    containsSecondaryNavigation: false,
    // customLayouts defines which breakpoints require the primary navigation to be moved into the secondary navigations DOM element container (for presentational reasons)
    customLayouts: ['baseLayout','phoneLargeUpwards','tabletPortraitUpwards'],
    domElements: {
      footerNavigationNode: null,
      headerObj: null,
      primaryNavigationNode: null,
      secondaryNavigationNode: null
    }
  };

  /**
   * Initialize the header module
   * @function init
   */
  function init(){
    log.information('[header.init]');

    // If local data overrides have been provided within the calling HTML page, assign those overrides
    assignLocalDataOverrides();

    // Store a reference to both the primary and secondary navigation systems
    storeDomNavigationNodes();

    // Assign events/handlers/delegation
    eventsInit();

    // It is important to now run BOTH orientationchange AND resize events, due to the way re-painting works on mobile devices vs desktop browsers
    if(window.orientation){
      // Orientation change must fired as a debounced event, to allow re-painting to take place when the 'processing' class is removed, and before re-calculations of the header are performed
      window.addEventListener('orientationchange', utilities.debounce(function(){
        // Perform re-calculations, since the position of DOM elements changes between breakpoints
        reset();
      },1));
    } else {
      // Remove the dropdown container DOM element
      window.addEventListener('resize.start',removeDropdownContainer);

      // Perform re-calculations, since the position of DOM elements changes between breakpoints
      window.addEventListener('resize.stop',reset);
    }

    // Perform re-calculations, since the position of DOM elements changes between breakpoints
    reset();

    // For when single-sign-on content is toggled visible, re-calculate the header dimensions
    document.addEventListener('sso.loginbar.initialization',function(){
      // Perform re-calculations, since the position of DOM elements changes between breakpoints
      reset();
    });
  }

  /**
   * If local data overrides have been provided within the calling HTML page, assign those overrides
   * @function assignLocalDataOverrides
   * @private
   */
  function assignLocalDataOverrides(){
    // Attach properties provided in the calling HTML page directly into the configuration settings for header
    if(typeof(localDataOverrides) !== 'undefined'){
      if(localDataOverrides.hasOwnProperty('header')){
        log.override('[header.assignLocalDataOverrides]');

        options = extend(options,localDataOverrides.header);
      }
    }
  }

  /**
   * Assign events/handlers/delegation
   * @function eventsInit
   */
  function eventsInit(){
    log.information('[header.eventsInit]');

    // Hover event for primary navigation elements (which have child navigation groups)
    events.delegate(options.domElements.headerObj,'[data-level="1"]>.has-children','mouseover',function(e){
      e.preventDefault();

      var selfObj = this.querySelector('a');

      // Show the child navigation group
      selfObj.nextElementSibling.classList.add('open');

      var triggerOffsetLeft = selfObj.offsetLeft;
      var triggerWidth = selfObj.offsetWidth;
      var childNavigationGroupObj = selfObj.nextElementSibling;
      var childGroupWidth = childNavigationGroupObj.offsetWidth;

      // Correctly position the child navigation group
      childNavigationGroupObj.style.left = Math.round((triggerOffsetLeft + (triggerWidth/2)) - (childGroupWidth/2)) + 'px';
    });

    // Hide child navigation groups when hovering out of a parent trigger link
    events.delegate(options.domElements.headerObj,'.has-children','mouseout',function(e){
      e.preventDefault();

      var selfObj = this.querySelector('a');

      // Show the child navigation group
      selfObj.nextElementSibling.classList.remove('open');
    });

    // Delegate events for toggle feature, to show and hide sub-groups
    events.delegate(options.domElements.headerObj,'.has-child-group>a.toggle','click',function(e){
      e.preventDefault();

      this.classList.toggle('expanded');
      this.previousElementSibling.classList.toggle('open');
    });

    // Delegate events for lower-breakpoint dropdown menus, to show and hide sub-groups
    events.delegate(document.body,'#header-dropdown .has-children .toggle','click',function(e){
      e.preventDefault();

      var toggleParentObj = this.parentNode;
      var isChildGroupExpanded = toggleParentObj.hasAttribute('data-children-visible');

      if(isChildGroupExpanded) {
        toggleParentObj.removeAttribute('data-children-visible');
      } else {
        toggleParentObj.setAttribute('data-children-visible', true);
      }

      this.classList.toggle('expanded');
    });

    // Attach a listener to the hamburger icon, in order to show the (smaller breakpoint) navigation/dropdown
    var hamburgerObj = document.getElementById('hamburger');
    hamburgerObj.addEventListener('click',function(e){
      e.preventDefault();

      var dropdownObj = document.getElementById('header-dropdown');

      // Change the state of the hamburger icon and the dropdown DOM element
      toggleExpandedState();

      // Show the dropdown overlay
      dropdownObj.classList.toggle('active');

      // Assign the correct top position and height for the (absolutely-positioned) dropdown DOM element
      var dropdownTopPosition = options.domElements.headerObj.querySelector('div.primary').offsetHeight;

      var dropdownHeight = window.innerHeight - dropdownTopPosition;

      dropdownObj.style.top = dropdownTopPosition + 'px';
      dropdownObj.style.height = dropdownHeight + 'px';

      // Toggle the scroll overflow on the <body> to ensure the page behind the hamburger navigation can't be scrolled whilst the dropdown DOM element is expanded/visible
      document.body.classList.toggle('no-scroll');
    });
  }

  /**
   * Change the state of the hamburger icon and the dropdown DOM element
   * @function toggleExpandedState
   * @private
   */
  function toggleExpandedState(){
    log.information('[header.toggleExpandedState]');
    
    var isHeaderExpanded = options.domElements.headerObj.hasAttribute('data-expanded');

    if(isHeaderExpanded) {
      options.domElements.headerObj.removeAttribute('data-expanded');
    } else {
      options.domElements.headerObj.setAttribute('data-expanded', true);
    }
  }

  /**
   * Store a reference to both the primary and secondary navigation systems
   * @function storeDomNavigationNodes
   * @private
   */
  function storeDomNavigationNodes(){
    log.information('[header.storeDomNavigationNodes]');

    // Store a reference to the header DOM object
    options.domElements.headerObj = document.querySelector('.mod-header');

    var primaryNavigationNode = document.createElement('nav');
    primaryNavigationNode.classList.add('primary');

    var primarySection = document.createElement('section');
    primarySection.innerHTML = document.querySelector('.mod-header>.primary nav section').innerHTML;
    primaryNavigationNode.appendChild(primarySection);
    options.domElements.primaryNavigationNode = primaryNavigationNode;
  
    // Create a new node, to act as a reference to an existing DOM element
    createDomNodeReferenceObj('secondary');

    if(options.containsSecondaryNavigation){
      options.domElements.headerObj.setAttribute('data-has-secondary-navigation', true);
    }

    // Create a new node, to act as a reference to an existing DOM element
    createDomNodeReferenceObj('footer');
  }

  /**
   * Create a new node, to act as a reference to an existing DOM element
   * @function createDomNodeReferenceObj
   * @param {string} navigationType - either primary or secondary
   * @private
   */
  function createDomNodeReferenceObj(navigationType){
    log.information('[header.createDomNodeReferenceObj]: navigationType=' + navigationType);

    var navigationObj = document.querySelector('.mod-header>nav.' + navigationType + ' section');

    if(navigationObj !== null){
      var navigationNode = document.createElement('nav');
      navigationNode.classList.add(navigationType);
      navigationNode.appendChild(navigationObj);

      options.domElements[navigationType + 'NavigationNode'] = navigationNode;

      // Set a flag which will need to be referenced elsewhere, indicating that a secondary navigation is available in the markup
      options['contains' + (navigationType.charAt(0).toUpperCase() + navigationType.substr(1)) + 'Navigation'] = true;
    }
  }

  /**
   * Update the 'More' navigation group if the primary navigation content remains in the primary navigation DOM element
   * @function updateMoreNavigationGroup
   * @param {number} [primaryNavigationWidth] - The width of the primary navigation (passed as part of test scritps)
   * @param {number} [viewportWidth] - The width of the viewport (passed as part of test scritps)
   * @private
   */
  function updateMoreNavigationGroup(){
    log.information('[header.updateMoreNavigationGroup]');

    var headerWidth = options.domElements.headerObj.offsetWidth;
    var primaryNavigationWidth = document.querySelector('.mod-header>.primary nav').offsetWidth;

    // Calculate the width of the elements, other than the primary navigation bar
    var logo = document.getElementById('logo');
    var logoWidth = logo.offsetWidth;
    var socialSites = options.domElements.headerObj.querySelector('.social-sites');
    var socialSitesWidth = socialSites.offsetWidth;
    var socialSitesStyles = socialSites.currentStyle || window.getComputedStyle(socialSites);
    socialSitesWidth = socialSitesWidth + parseInt(socialSitesStyles.marginRight);

    // The sign-in element of the page is not mandatory
    // Include it's width in the calculation routines if the element is in the rendered header
    var signIn = document.getElementById('signin');
    var signInWidth = 0;

    if(signIn){
      signInWidth = signIn.offsetWidth;
    }

    // Space which is always taken up equals the result of the following calculation
    var reservedSpace = logoWidth + signInWidth + socialSitesWidth;

    // How much space is left for the navigation to exist within?
    var remainingSpace = headerWidth - reservedSpace;

    // Does the 'More' option need to be attached to the primary navigation bar?
    if(primaryNavigationWidth >= remainingSpace){
      attachNavigationItemsToMoreLink(remainingSpace);
    }
  }

  /**
   * The primary navigation is too wide to contain all of its elements, move some of them to an additional 'More' navigation group
   * @function attachNavigationItemsToMoreLink
   * @param {number} remainingSpace - The space that the navigation width cannot exceed
   * @private
   */
  function attachNavigationItemsToMoreLink(remainingSpace){
    log.information('[header.attachNavigationItemsToMoreLink]: remainingSpace=' + remainingSpace);

    var primaryNavigationObj = document.querySelector('.mod-header>.primary section>ul');

    // Add the more (parent li) DOM element
    var moreParentLiObj = document.createElement('li');
    moreParentLiObj.classList.add('has-children','more');
    moreParentLiObj.innerHTML = '<a href=\'#\'>More</a>';
    
    // Add the (child ul) DOM element
    var moreChildUlObj = document.createElement('ul');
    moreChildUlObj.setAttribute('data-level',2);
    moreParentLiObj.appendChild(moreChildUlObj);

    // Attach the 'More' navigation item to the DOM
    primaryNavigationObj.appendChild(moreParentLiObj);

    // Loop through all navigation items, removing them one-by-one, checking the new width of the navigation on each iteration
    var navigationItems = utilities.nodeListToArray(document.querySelectorAll('.mod-header>.primary section>ul>li'));

    var linkIndex;
    var linkObj;
    var updatedLinkHtml;
    var primaryNavigationWidth;

    for(linkIndex=navigationItems.length-2; linkIndex>-1; linkIndex--){
      // Obtain an upto date width for the primary navigation
      primaryNavigationWidth = document.querySelector('.mod-header>.primary nav').offsetWidth;

      // Check the width of the primary navigation, to see if it's width is now ok (it's not wider than the available space
      if(primaryNavigationWidth >= remainingSpace){
        linkObj = navigationItems[linkIndex];

        // Child groups work slightly different, in terms of toggling events. Ensure the markup for groups moved into the 'More' group call the correct events, based on DOM structure
        if(linkObj.classList.contains('has-children')){
          linkObj.classList.remove('has-children');
          linkObj.classList.add('has-child-group');
        }

        // There are other slight differences in the markup, when regular navigation groups are moved into the 'More' group
        updatedLinkHtml = linkObj.innerHTML;
        updatedLinkHtml = updatedLinkHtml.replace(/data-level="2"/g,'data-level="3"');
        updatedLinkHtml = updatedLinkHtml.replace(/has-children/g,'has-child-group');
        linkObj.innerHTML = updatedLinkHtml;

        moreChildUlObj.insertBefore(linkObj,moreChildUlObj.firstChild);
      } else {
        break;
      }
    }
  }

  /**
   * If the current breakpoint is one which requires a custom layout, re-build the dropdown navigation elements
   * @function buildDropdownContent
   * @private
   */
  function buildDropdownContent(){
    log.information('[header.buildDropdownContent]');

    var dropdownObj = document.createElement('div');
    dropdownObj.setAttribute('id','header-dropdown');
    dropdownObj.setAttribute('data-smooth-scroll','data-smooth-scroll');

    // With the dropdown container created, populate it with the primary, secondary and footer navigation node lists
    dropdownObj.appendChild(options.domElements.primaryNavigationNode);

    if(options.containsSecondaryNavigation){
      dropdownObj.appendChild(options.domElements.secondaryNavigationNode);
    }

    if(options.containsFooterNavigation){
      dropdownObj.appendChild(options.domElements.footerNavigationNode);
    }

    document.body.appendChild(dropdownObj);
  }

  /**
   * Remove the dropdown container DOM element
   * @function removeDropdownContainer
   * @private
   */
  function removeDropdownContainer(){
    log.information('[header.removeDropdownContainer]');

    var dropdownObj = document.getElementById('header-dropdown');

    if(dropdownObj){
      // Remove the header dropdown from the DOM
      document.body.removeChild(dropdownObj);
    }

    // Remove the data-attribute of the header, indicating the #header-dropdown element is expanded
    options.domElements.headerObj.removeAttribute('data-expanded');
  }

  /**
   * Perform re-calculations, since the number of navigation items to show changes between breakpoints
   * @function reset
   */
  function reset(){
    log.information('[header.reset]');

    var primaryNavigationDomContainer = document.querySelector('.mod-header>.primary nav');
    var primaryNavigationContent = options.domElements.primaryNavigationNode.innerHTML;
    var secondaryNavigationContent;
    var secondaryNavigationDomContainer;

    if(options.containsSecondaryNavigation){
      secondaryNavigationDomContainer = document.querySelector('.mod-header>.secondary');
      secondaryNavigationContent = options.domElements.secondaryNavigationNode.innerHTML;
    }

    // Remove the dropdown container DOM element
    removeDropdownContainer();

    // Ensure that the primary and secondary navigation elements are in the correct position, specific to the current breakpoint
    var currentBreakpoint = utilities.getBreakpoint();

    if(options.customLayouts.indexOf(currentBreakpoint) !== -1){
      if(options.containsSecondaryNavigation){
        secondaryNavigationContent = primaryNavigationContent;
      }

      // If the current breakpoint is one which requires a custom layout, re-build the dropdown navigation elements
      buildDropdownContent();
    }

    // Attach the correct navigation elements to the necessary DOM element
    primaryNavigationDomContainer.innerHTML = primaryNavigationContent;

    if(options.containsSecondaryNavigation){
      secondaryNavigationDomContainer.innerHTML = secondaryNavigationContent;
    }

    // Update the 'More' navigation group if the primary navigation content remains in the primary navigation DOM element
    updateMoreNavigationGroup();

    // Reset the hamburger icon to a closed state
    var hamburgerObj = document.getElementById('hamburger');
    hamburgerObj.classList.remove('active');

    // Re-instate any removal of body scrolling
    document.body.classList.remove('no-scroll');
  }

  return {
    init: init,
    options: options,
    reset: reset
  };
}());
