/**
 * File: /assets/scripts/dashboard/dot-menu.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import copy from 'clipboard-copy';
import {CONSTS as configConsts} from './../global/config';
import dashboard from './dashboard';
import events from './../global/events';
import {sendLog} from './../global/logger';
import overlay from './../global/overlay';
import {
  apiGet,
  debounce,
  findParentNode,
  isDescendant,
  padStart,
  scrollOffset
} from './../global/utilities';

const CONSTS = {
  ANIMATIONFADE: 250,
  DOT_MENU: {
    URLS: {
      EDIT: '{{URL_PREFIX}}/edit/{{EXPERIMENT_ID}}',
      OVERVIEW: '{{LOCATION_ORIGIN}}{{URL_PREFIX}}/overview/{{EXPERIMENT_ID}}',
    }
  }
};

const options = {
  active: false,
  activeElem: null,
  activeListElem: null
};

class dotMenu {
  constructor(elem) {
    this.dotMenuElem = elem;
    this.dotMenuListElem = elem.querySelector('.dot-menu__list');

    // Bind functions to the contextual instance of the class
    this.eventsInit = this.eventsInit.bind(this);
  }

  /**
   * Initialize dot menu
   * @function init
   */
  init() {
    sendLog('[dashboard/dot-menu.js](init)');

    // Setup all events for the dot menu
    this.eventsInit();
  }

  /**
   * Setup all events for the dot menu
   * @function eventsInit
   */
  eventsInit() {
    // Hide the currently visible dot menu when clicking anywhere on the body outside of the visible dot menu (only whilst it is open)
    events.listen(document.body, 'click', (e) => {
      if(options.active){
        e.preventDefault();

        const clickedFromWithinDotMenu = findParentNode({className: 'dot-menu'}, e.target).classList.contains('dot-menu');
        const clickedFromWithinTrigger = e.target.hasAttribute('data-trigger-dot-menu');

        if(!clickedFromWithinDotMenu && !clickedFromWithinTrigger){
          // Hide the current dot menu
          this.hideDotMenu();
        }
      }
    });

    // Add support for closing the Brand selector when the escape key is pressed
    document.addEventListener('keyup', (e) => {
      if(e.keyCode === 27){
        if(options.active){
          // Hide the current dot menu
          this.hideDotMenu();
        }
      }
    });

    // Show a dot menu when a trigger element (coloured area) is clicked
    events.delegate(this.dotMenuElem, '.dot-menu__trigger', 'click', (e) => {
      e.preventDefault();

      // Reset any previously expanded dot menus, so that no more than 1 can ever be open at one time
      if(options.active && (e.target.nextElementSibling !== options.activeListElem)){
        events.fire(options.activeListElem.previousElementSibling, 'click');
      }

      // Process the clicking of a dot menu trigger element 
      this.processLink(e);

      // Retrieve information about the dashboard row relating to the active Dot Menu
      const dashboardRow = this.lookupDashboardRow(e.target);
      
      // Highlight a specific dashboard row
      dashboard.highlightDashboardRow(dashboardRow.selectedDashboardRowElem);
    });

    // Process the 'Edit' link being clicked
    events.delegate(this.dotMenuElem, '.dot-menu__item', 'click', (e) => {
      e.preventDefault();

      // If an item is not available, don't process the event
      const linkElem = e.target;
      if(linkElem.classList.contains('dot-menu__item--disabled')) return;

      const dashboardRecordId = this.lookupDashboardRow(e.target).selectedDashboardRowId;
      let mode = linkElem.getAttribute('data-event');

      const apiMode = configConsts.api.mode;
      let apiEndpoint;

      // Perform logic based on which type of link was clicked within the Dot Menu
      switch(mode){
        case 'edit':
          let editUrl = CONSTS.DOT_MENU.URLS.EDIT;
          editUrl = editUrl.replace('{{URL_PREFIX}}', configConsts.api.mode === 'local' ? '/final' : '/experiments');
          editUrl = editUrl.replace('{{EXPERIMENT_ID}}', configConsts.api.mode === 'local' ? '' : dashboardRecordId);

          // Re-direct to the selected experiment (in Edit mode)
          window.location.href = editUrl;

          break;
        case 'copy-test-link':
          let overviewUrl = CONSTS.DOT_MENU.URLS.OVERVIEW;
          overviewUrl = overviewUrl.replace('{{LOCATION_ORIGIN}}', window.location.origin);
          overviewUrl = overviewUrl.replace('{{URL_PREFIX}}', configConsts.api.mode === 'local' ? '/final' : '/experiments');
          overviewUrl = overviewUrl.replace('{{EXPERIMENT_ID}}', configConsts.api.mode === 'local' ? '' : dashboardRecordId);

          // Copy the current URL to the clipboard
          copy(overviewUrl);

          // Show the overlay with all the necessary data
          overlay.show({
            icon: 'attention',
            iconColour: 'blue',
            content: `The current URL of...<br><br>${overviewUrl}<br><br>...has been copied to the clipboard`,
            header: 'URL copied to clipboard',
            buttonCancelLabel: 'Close'
          });

          break;
        case 'duplicate':
          // Should a live or local URL endpoint be used?
          apiEndpoint = configConsts.api.domains[apiMode] + configConsts.api.components.duplicateTest;

          // Send data to the API via GET
          apiGet(`${apiEndpoint}?experimentId=${dashboardRecordId}`).then((data) => {
            const httpNewExperimentId = data.newId;
            
            console.log('[forms/dot-menu.js](duplicate API call)', `Database id via Http response from server: ${httpNewExperimentId}`);

            // Re-direct the user straight to the new experiement (in Edit mode)
            let editUrl = CONSTS.DOT_MENU.URLS.EDIT;
            editUrl = editUrl.replace('{{URL_PREFIX}}', configConsts.api.mode === 'local' ? '/final' : '/experiments');
            editUrl = editUrl.replace('{{EXPERIMENT_ID}}', configConsts.api.mode === 'local' ? '' : httpNewExperimentId);

            // Re-direct to the selected experiment (in Edit mode)
            window.location.href = editUrl;
          }).catch((error) => {
            // Show the overlay with all the necessary data
            overlay.show({
              icon: 'attention',
              iconColour: 'blue',
              content: `An error has occured submitting data to the API: ${error}`,
              header: 'API error',
              buttonCancelLabel: 'Close'
            });
          });

          break;
        case 'set-to-candidate':
        case 'cancel-test':

          // Should a live or local URL endpoint be used?
          apiEndpoint = configConsts.api.domains[apiMode] + configConsts.api.components.updateTestStatus;
          const statusCode = mode === 'set-to-candidate' ? 2 : 0;
          const statusType = mode === 'set-to-candidate' ? 'Candidate' : 'Cancelled';

          // Send data to the API via GET
          apiGet(`${apiEndpoint}?experimentId=${dashboardRecordId}&statusCode=${statusCode}&statusType=${statusType}`).then((data) => {
            console.log('[forms/dot-menu.js](change status API call)', `Http response from server: experimentId=${dashboardRecordId}, statusCode=${data.statusCode}, statusType=${data.statusType}`);

            // Switch the status of the experiment, whilst it's inview
            // The next time the page is loaded, it will not be visible, as it's status is different
            const experimentStatusCellElem = document.querySelector(`[data-item-id="${data.experimentId}"] [data-column-id="status"] .dashboard__cell-status`);
            experimentStatusCellElem.className = `dashboard__cell-status dashboard__cell-status--type${padStart(data.statusCode.toString(), 2, '0')}`;

            let cellText = statusCode !== 0 ? `${statusCode}. ` : '';
            cellText += statusType;
            experimentStatusCellElem.innerText = cellText;
          }).catch((error) => {
            // Show the overlay with all the necessary data
            overlay.show({
              icon: 'attention',
              iconColour: 'blue',
              content: `An error has occured submitting data to the API: ${error}`,
              header: 'API error',
              buttonCancelLabel: 'Close'
            });
          });

          break;
      }
    }); 
  }

  /**
   * Retrieve information about the dashboard row relating to the active Dot Menu
   * @function lookupDashboardRow
   * @param {element} elem - An element from within the Dot Menu
   * @returns {object} object.selectedDashboardRowElem - The <tr> element in the dashboard relating to the active Dot Menu
   * @returns {object} object.selectedDashboardRowId - The unique database record id of the <tr> element in the dashboard relating to the active Dot Menu
   */
  lookupDashboardRow(elem) {
    const dotMenuElem = findParentNode({className: 'dot-menu'}, elem);
    const selectedDotMenuIndex = Array.prototype.indexOf.call([...dotMenuElem.parentNode.querySelectorAll('.dot-menu')], dotMenuElem);
    const selectedDashboardRowElem = document.querySelectorAll('.dashboard tbody tr')[selectedDotMenuIndex];
    const selectedDashboardRowId = selectedDashboardRowElem.getAttribute('data-item-id');

    return {
      selectedDashboardRowElem,
      selectedDashboardRowId
    }
  }

  /**
   * Process the clicking of a dot menu trigger element
   * @function processLink
   * @param {event} e - The event fired by the trigger element
   */
  processLink(e) {
    // Store a reference of the active Dot Menu elements (required when hiding)
    options.activeElem = this.dotMenuElem;
    options.activeListElem = this.dotMenuListElem;

    options.activeElem.classList.toggle('dot-menu--active');

    if(!options.activeElem.classList.contains('dot-menu--active')){
      // Hide the current dot menu
      this.hideDotMenu();
    } else {
      options.active = true;

      this.dotMenuListElem.classList.add('dot-menu__list--below');
      this.dotMenuListElem.classList.remove('dot-menu__list--above');

      const dotMenuListHeight = parseInt(window.getComputedStyle(this.dotMenuListElem, null).getPropertyValue('height'));
      const bodyRect = document.body.getBoundingClientRect();
      const elemRect = this.dotMenuListElem.getBoundingClientRect();
      const offset = elemRect.top - bodyRect.top;
      const dotMenuListBottom = (offset + dotMenuListHeight) - scrollOffset().top;

      const data = {
        dotMenuListBottom,
        dotMenuListHeight,
        offset,
        scrollOffset: scrollOffset().top,
        windowHeight: window.innerHeight
      }

      sendLog('[dashboard/dot-menu.js](processLink)', data);

      // Should the menu appear above the Dot Menu trigger?
      if(dotMenuListBottom > window.innerHeight){
        this.dotMenuListElem.classList.remove('dot-menu__list--below');
        this.dotMenuListElem.classList.add('dot-menu__list--above');
      }
    }
  }

  /**
   * Hide the current dot menu
   * @function hideDotMenu
   */
  hideDotMenu(callback) {
    options.activeElem.classList.remove('dot-menu--active');
    options.activeListElem.classList.add('dot-menu__list--animating');

    // Reset the active state of all dashboard highlighted rows
    dashboard.resetHighlightedRows();

    // For the necessity of timings, scope the dotMenuListElem locally, as the garbage collection within this function code MUST run before the timer completes
    const dotMenuListElem = options.activeListElem;
    
    // Reset the state of the dot menus visibility to false
    options.active = false;

    // Perform any additional cleanup
    options.activeListElem = null;

    setTimeout(() => {
      dotMenuListElem.classList.remove('dot-menu__list--animating');
    }, CONSTS.ANIMATIONFADE);
  }
}

export default dotMenu;