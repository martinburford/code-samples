/**
 * File: /assets/scripts/dashboard.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import {sendLog} from './../global/logger';
import {CONSTS as configConsts} from './../global/config';
import dotMenu from './dot-menu';
import events from './../global/events';
import overlay from './../global/overlay';
import searchBar from './search-bar';
import store from 'store';
import uiFilters from './ui-filters';
import {
  apiGet,
  apiUrlLookup,
  findParentNode,
  formatDateTime,
  padStart,
  renderComponent
} from './../global/utilities';

const CONSTS = {
  DEVICE: `<li class="dashboard__cell-device dashboard__cell-device--{{deviceType}}">{{deviceType}}</li>`,
  LITERALS: {
    DOT_MENU: `
      <div class="dot-menu"><a class="dot-menu__trigger" href="#" data-trigger-dot-menu="data-trigger-dot-menu">Click here to show/hide additional menu options</a>
        <ul class="dot-menu__list">
          <li><a class="dot-menu__item dot-menu__item--edit{{IS_DISABLED_EDIT}}" href="/final/edit" data-event="edit">Edit</a></li>
          <li><a class="dot-menu__item dot-menu__item--copy{{IS_DISABLED_COPY_TEST_LINK}}" href="#" data-event="copy-test-link">Copy test link</a></li>
          <li><a class="dot-menu__item dot-menu__item--duplicate{{IS_DISABLED_DUPLICATE}}" href="#" data-event="duplicate">Duplicate</a></li>
          <li><a class="dot-menu__item dot-menu__item--set-status{{IS_DISABLED_CANDIDATE}}" href="#" data-event="set-to-candidate">Set status as 'Candidate'</a></li>
          <li><a class="dot-menu__item dot-menu__item--cancel-test{{IS_DISABLED_CANCEL_TEST}}" href="#" data-event="cancel-test">Cancel test</a></li>
        </ul>
      </div>`
  },
  LOCATION: `<img class="dashboard__flag" src="/assets/images/flags/{{countryCode}}.svg">`,
  NAME: `<a class="dashboard__link" href="{{EXPERIMENTS_PREFIX}}/{{LOCAL_OR_LIVE}}overview/{{EXPERIMENT_ID}}">{{NAME}}</a>`,
  PRIORITY: `<div class="dashboard__cell-priority dashboard__cell-priority--{{priorityType}}">{{priorityType}}</div>`,
  STATUS: `<div class="dashboard__cell-status dashboard__cell-status--type{{code}}">{{content}}</div>`,
  WIN: `<div class="dashboard__cell-win dashboard__cell-win--{{winType}}">{{content}}</div>`
};

const options = {
  selectors: {
    dashboardElem: document.querySelector('.dashboard'),
    dashboardHeadElem: document.querySelector('.dashboard thead'),
    dashboardBodyElem: document.querySelector('.dashboard tbody'),
    paginationElem: document.querySelector('.pagination')
  },
  tabHeadingColumnTypes: {
    default: ['team','client','brand','testId','name','date','theme','area','device','location','duration','priority','score'],
    cancelled: ['plannedDate','status','plannedDuration','workbookJobNumber'],
    backlog: ['origin','status'],
    roadmap: ['plannedDate','status','plannedDuration','workbookJobNumber'],
    completed: ['win','resultsSummary','plannedDate','status','plannedDuration','workbookJobNumber']
  },
  tableData: null,
  tableHeadings: []
};

const dashboard = (function(){
  /**
   * Initialize dashboard
   * @function init
   */
  function init(){
    sendLog('[dashboard/dashboard.js](init)');

    // Create a holding localStorage key for all dashboard related (persisting) configuration
    checkAndCreateLocalStorageEntry();

    // Assign selectors to global references
    overlay.assignDomSelectorReferences();

    if(options.selectors.dashboardElem){
      // Setup all events for the dashboard
      eventsInit();

      // Store all table headings, based on the initially rendered markup, as this will be needed when switching tabs
      storeTableHeadings();

      // Auto-select the active dashboard tab ('Cancelled' || 'Backlog' || 'Roadmap' || 'Completed'). This information is within localStorage
      // Always perform a page fetch, as the activeTab requires a filter from the API against statuses
      autoSelectActiveTab();

      // Auto-select the relevant heading cell which is sorting by. This information is within localStorage
      autoSelectActiveHeading();
    }
  }

  /**
   * Setup all events for the dashboard
   * @function eventsInit
   */
  function eventsInit(){
    // Any row highlight
    events.delegate(document.body, '.dashboard tbody tr', 'click', (e) => {
      sendLog('[dashboard/dashboard.js](eventsInit)', 'tr clicked');

      const targetElem = findParentNode({tagName: 'tr'}, e.target);

      // Highlight a specific dashboard row
      highlightDashboardRow(targetElem);
    });

    // Interacting with the sort ordering within a column header
    events.delegate(document.body, '.dashboard__heading-container', 'click', (e) => {
      e.preventDefault();

      const elem = e.target;

      // Do not process any logic if the selected cell is not sortable
      if(!elem.parentNode.hasAttribute('data-sortable')){
        return false;
      }

      // Remove all data-orderby data attributes of sibling header cells
      [...elem.parentNode.siblingsByTagName('th')].forEach((siblingElem) => {
        siblingElem.removeAttribute('data-orderby');
      });

      // Check to see if the chosen column has a sort order already
      const existingSortOrder = elem.parentNode.getAttribute('data-orderby');

      let newSortOrder;

      // If there is an existing sort order, invert it, otherwise set it as 'ascending' by default
      if(existingSortOrder){
        newSortOrder = existingSortOrder === 'ascending' ? 'descending' : 'ascending';
      } else {
        newSortOrder = 'ascending';
      }
      
      const columnName = elem.parentNode.getAttribute('data-column-id');

      sendLog('[dashboard/dashboard.js](eventsInit)', `Table header click id=(${columnName})`, `New sort order: ${newSortOrder}`);

      // Set the new sort order, based on the users input
      elem.parentNode.setAttribute('data-orderby', newSortOrder);

      // Update the localStorage entries for the current user
      updateStorageEntry({
        sortBy: columnName, 
        sortOrder: newSortOrder
      });

      // Retrieve new data for the first page, since a sort order has been requested
      fetchData(1);

      // Remove the active state of any table rows
      resetActiveRows();
    });

    // Pagination data retrieval
    events.delegate(document.body, '.pagination__link', 'click', (e) => {
      e.preventDefault();

      const targetElem = e.target;

      // Don't process the event if the page the browser is currently showing has been re-requested from the pagination bar
      if(targetElem.classList.contains('pagination__link--active')){
        return false;
      }

      sendLog('[dashboard/dashboard.js](eventsInit)', '.pagination__link clicked');

      // What is the requested page number?
      const paginationListElem = findParentNode({className: 'pagination__list'}, targetElem);
      const requestedPageNumber = Array.prototype.indexOf.call(paginationListElem.children, targetElem.parentNode)+1;
      
      sendLog('[dashboard/dashboard.js](eventsInit)', `Requesting data for page ${requestedPageNumber}`);

      // Retrieve new data for a specified page number
      fetchData(requestedPageNumber);
    });

    // Tab switching
    events.delegate(document.body, '.header-links__link[data-tab-id]', 'click', (e) => {
      e.preventDefault();

      const targetElem = e.target;
      const activeTabId = targetElem.getAttribute('data-tab-id');

      // Activate a tab within the dashboard tabs
      switchDashboardTab(activeTabId);
    });

    // Reset Brand Selector localStorage entries when logging out
    document.getElementById('logout-form').querySelector('button').addEventListener('click', (e) => {
      store.set('brand-selector', {
        brands: []
      });
    });
  }

  /**
   * Highlight a specific dashboard row
   * @function highlightDashboardRow
   * @param {element} rowElem - The row in the dashboard to highlight
   */
  function highlightDashboardRow(rowElem){
    rowElem.classList.toggle('dashboard__row--highlight');

    [...rowElem.siblingsByTagName('tr')].forEach((siblingElem) => {
      siblingElem.classList.remove('dashboard__row--highlight');
    });
  }

  /**
   * Reset the active state of all dashboard highlighted rows
   * @function resetHighlightedRows
   */
  function resetHighlightedRows(){
    [...options.selectors.dashboardElem.querySelectorAll('.dashboard__row--highlight')].forEach((highlightedRowElem) => {
      highlightedRowElem.classList.remove('dashboard__row--highlight');
    });
  }

  /**
   * Store all table headings, based on the initially rendered markup, as this will be needed when switching tabs
   * @function storeTableHeadings
   */
  function storeTableHeadings(){
    [...options.selectors.dashboardElem.querySelectorAll('th')].forEach((headingElem) => {
      options.tableHeadings.push(headingElem.getAttribute('data-column-id'));
    });
  }

  /**
   * Check for the existence of a localStorage entry for dashboard. Create it if it doesn't exist
   * @function checkAndCreateLocalStorageEntry
   */
  function checkAndCreateLocalStorageEntry(){
    // Create a holding localStorage key for all dashboard related (persisting) configuration
    if(store.get('dashboard') === undefined){
      store.set('dashboard', {
        activeTab: 'roadmap',
        sortBy:'name',
        sortOrder: 'ascending'
      });
    }

    // Reset any previous searches since the page is being loaded fresh
    if(store.get('search-bar') !== undefined){
      // Update the localStorage value with a new search term
      searchBar.updateLocalStorage('');
    }
  }

  /**
   * Update the localStorage entries for the current user
   * @function updateStorageEntry
   * @param {string} data.[activeTab] - Either 'cancelled' || 'backlog' || 'roadmap' || 'completed'
   * @param {string} data.[sortBy] - Which column name to sort by
   * @param {string} data.[sortOrder] - Either 'ascending' || 'descending'
   */
  function updateStorageEntry(data){
    const activeTab = data.activeTab !== undefined ? data.activeTab : store.get('dashboard').activeTab;
    const sortBy = data.sortBy !== undefined ? data.sortBy : store.get('dashboard').sortBy;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : store.get('dashboard').sortOrder;
    
    // Update sorting settings in localStorage
    store.set('dashboard', {
      activeTab,
      sortBy,
      sortOrder
    });
  }

  /**
   * Auto-select the active dashboard tab ('Cancelled' || 'Backlog' || 'Roadmap' || 'Completed'). This information is within localStorage
   * @function autoSelectActiveTab
   */
  function autoSelectActiveTab(){
    const currentActiveTabId = store.get('dashboard').activeTab;

    // Activate a tab within the dashboard tabs 
    switchDashboardTab(currentActiveTabId);

    sendLog('[dashboard/dashboard.js](autoSelectActiveTab)', `Dashboard tab ${currentActiveTabId} activated, table columns adjusted`);
  }

  /**
   * Activate a tab within the dashboard tabs
   * @function switchDashboardTab
   * @param {element} activeTabId - The id of the tab which is to be made active
   * @param {event} event - The event triggering the tab switch
   */
  function switchDashboardTab(activeTabId){
    const activeTabElem = document.querySelector(`.header-links__link[data-tab-id="${activeTabId}"]`);

    // Update the active classes
    activeTabElem.classList.add('header-links__link--active');
    [...activeTabElem.parentNode.siblingsByTagName('LI')].forEach((headerLinkElem) => {
      headerLinkElem.querySelector('a').classList.remove('header-links__link--active');
    });

    // Construct a single array with the columns which should be shown, based on the selected tab
    const columnsToShow = store.get('dashboard-filters')[activeTabId].columns;

    sendLog('[dashboard/dashboard.js](eventsInit)', `New columns to show: ${columnsToShow}`);

    // Update the localStorage entries for the current user (based on what tab is selected)
    updateStorageEntry({
      activeTab: activeTabId
    });

    sendLog('[dashboard/dashboard.js](eventsInit)', `Switching tab to ${activeTabId}`);

    // Show/hide columns based on the active tab type ('Cancelled' || 'Backlog' || 'Roadmap' || 'Completed')
    refreshColumnVisibility(columnsToShow);

    // Dispatch an event, notifying the website that the UI Filters have been updated
    uiFilters.updateFiltersCounterLabel();

    sendLog('[dashboard/dashboard.js](eventsInit)', 'Fetching page 1 data');

    // Retrieve new data for a specified page number
    // It is possible that the user may be on page 2, 3, xx. With a tab change, page 1 needs to be reloaded
    fetchData(1);
  }

  /**
   * Auto-select the relevant heading cell which is sorting by. This information is within localStorage
   * @function autoSelectActiveHeading
   */
  function autoSelectActiveHeading(){
    const currentSortBy = store.get('dashboard').sortBy;
    const currentSortOrder = store.get('dashboard').sortOrder;

    sendLog('[dashboard/dashboard.js](autoSelectActiveHeading)', `Activating dashboard column ${currentSortBy} by ${currentSortOrder}`);

    // Apply the necessary filter arrow (up or down to represent ascending or descending) to the column which was most recently sorted
    options.selectors.dashboardHeadElem.querySelector(`[data-column-id="${currentSortBy}"]`).setAttribute('data-orderby', currentSortOrder);
  }

  /**
   * Show/hide columns based on the active tab type ('Cancelled' || 'Backlog' || 'Roadmap' || 'Completed')
   * @function refreshColumnVisibility
   * @param {array} columns - The columns titles to be shown
   */
  function refreshColumnVisibility(columns){
    [...options.selectors.dashboardElem.querySelectorAll('[data-column-id]')].forEach((cellElem) => {
      // Re-instate any previously hidden columns, since a new tab selection has been made
      cellElem.classList.remove('dashboard__cell--hidden');

      // If the current cell doesn't include a matching column to show (for the active tab), then hide it
      if(!columns.includes(cellElem.getAttribute('data-column-id'))){
        cellElem.classList.add('dashboard__cell--hidden');
      }
    });
  }

  /**
   * Reset sibling columns, to ensure they remove their sort order, since the table is now being sorted by another columns data
   * @function resetSiblingHeadingsSortOrder
   * @param {element} headingElem - Remove column ordering from all <th> elements, except the current column which is being sorted by
   */
  function resetSiblingHeadingsSortOrder(headingElem){
    [...headingElem.siblingsByTagName('TH')].forEach((headingSiblingElem) => {
      headingSiblingElem.querySelector('.dashboard__heading-container').removeAttribute('data-orderby');
    });
  }

  /**
   * Re-render the new dataset into the table
   * @function redrawTable
   */
  function updateTable(){
    // Empty out the dashboard <tbody> and re-generate it
    // This is necessary, since paginated pages can contain different numbers of rows (as in, the last page will rarely be a full page of records)
    options.selectors.dashboardBodyElem.innerHTML = '';

    // Remove all previous Dot Menus
    removeDotMenusFromDom();

    let rowElemStr = '';

    [...options.tableData.rows].forEach((rowElem, rowIndex) => {
      rowElemStr += `<tr class="dashboard__row" data-item-id="${rowElem.id}">`;

      let columnElemsStr = '';

      for(let column in rowElem){
        columnElemsStr += `<td class="dashboard__cell" data-column-id="${column}" title="${rowElem[column]}">${renderTableColumnData(rowElem[column], column, rowElem.id)}</td>`; 
      }

      rowElemStr += columnElemsStr;
      rowElemStr += '</tr>';
    });

    options.selectors.dashboardBodyElem.insertAdjacentHTML('beforeend', rowElemStr);

    sendLog('[dashboard/dashboard.js](updateTable)', 'New data: ', options.tableData);

    // Construct a single array with the columns which should be shown, based on the selected tab
    const activeTabId = store.get('dashboard').activeTab;
    const columnsToShow = store.get('dashboard-filters')[activeTabId].columns;
    refreshColumnVisibility(columnsToShow);

    // Re-build Dot Menus, to ensure the correct amount are being shown to the user
    reattachDotMenusToDom(options.tableData);
  }

  /**
   * Remove all previous Dot Menus
   * @function removeDotMenusFromDom
   */
  function removeDotMenusFromDom(){
    [...document.querySelectorAll('.dot-menu')].forEach((dotMenuElem) => {
      dotMenuElem.parentNode.removeChild(dotMenuElem);
    });
  }

  /**
   * Re-build Dot Menus, to ensure the correct amount are being shown to the user
   * @function reattachDotMenusToDom
   * @param {number} recordsCount - The number of records in the current page
   */
  function reattachDotMenusToDom(dashboardData){
    const dotMenuInnerElem = document.querySelector('.dashboard__inner');

    for(let i=1; i<=dashboardData.rows.length; i++){
      let dotMenuMarkup = CONSTS.LITERALS.DOT_MENU;
      const rowData = dashboardData.rows[i-1];
      const allowEdit = rowData.dotMenuAllowEdit;
      const allowCopyTestLink = rowData.dotMenuAllowCopyTestLink;
      const allowDuplicate = rowData.dotMenuAllowDuplicate;
      const allowCandidate = rowData.dotMenuAllowCandidate;
      const allowCancelTest = rowData.dotMenuAllowCancelTest;

      // Disabled elements IF they are specified as being unavailable to the user from the returned API data
      dotMenuMarkup = dotMenuMarkup.replaceAll('{{IS_DISABLED_EDIT}}', allowEdit ? '' : ' dot-menu__item--disabled');
      dotMenuMarkup = dotMenuMarkup.replaceAll('{{IS_DISABLED_COPY_TEST_LINK}}', allowCopyTestLink ? '' : ' dot-menu__item--disabled');
      dotMenuMarkup = dotMenuMarkup.replaceAll('{{IS_DISABLED_DUPLICATE}}', allowDuplicate ? '' : ' dot-menu__item--disabled');
      dotMenuMarkup = dotMenuMarkup.replaceAll('{{IS_DISABLED_CANDIDATE}}', allowCandidate ? '' : ' dot-menu__item--disabled');
      dotMenuMarkup = dotMenuMarkup.replaceAll('{{IS_DISABLED_CANCEL_TEST}}', allowCancelTest ? '' : ' dot-menu__item--disabled');

      dotMenuInnerElem.insertAdjacentHTML('beforebegin', dotMenuMarkup);
    }

    // Re-initialize all new Dot Menus
    renderComponent(dotMenu, '.dot-menu');
  }

  /**
   * Render the correct inner content based on the column type
   * @function renderTableColumnData
   * @param {obejct} data -  The data (either as a string or an object) for the column cell being populdated
   * @param {string} columnType - Either 'status' || 'text'
   * @param {number} experimentId - The id of the current experiment which this cell is being attached to
   */
  function renderTableColumnData(data, columnType, experimentId){
    switch(columnType){
      case 'name':
        let nameHtml = CONSTS.NAME;
        nameHtml = nameHtml.replace('{{EXPERIMENTS_PREFIX}}', configConsts.api.mode !== 'local' ? '/experiments' : '');
        nameHtml = nameHtml.replace('{{EXPERIMENT_ID}}', configConsts.api.mode !== 'local' ? experimentId: '');
        nameHtml = nameHtml.replace('{{LOCAL_OR_LIVE}}', configConsts.api.mode !== 'local' ? '': 'final/');
        nameHtml = nameHtml.replace('{{NAME}}', data);
        return nameHtml;

        break;
      case 'status':
        const statusText = data.code == 0 ? data.text : `${data.code}. ${data.text}`;
        return CONSTS.STATUS.replace('{{code}}', `${padStart(data.code.toString(), 2, '0')}`).replace('{{content}}', statusText);
        break;
      case 'win':
        return CONSTS.WIN.replace('{{winType}}', data === 1 ? 'yes' : data === 0 ? 'no' : 'unknown').replace('{{content}}', data);
        break;
      case 'location':
        let locationHtml = '';
        [...data].forEach((device) => {
          locationHtml += CONSTS.LOCATION.replace('{{countryCode}}', device);
        });
        return locationHtml;
        break;
      case 'theme':
      case 'area':
        if(Array.isArray(data)){
          return data.join(', ');  
        } else {
          return 'no array';
        }
        break;
      case 'device':
        if(Array.isArray(data)){
          const deviceUl = document.createElement('ul');
          let devicesHtml = '<ul>';

          [...data].forEach((device) => {
            devicesHtml += CONSTS.DEVICE.replaceAll('{{deviceType}}', device);
          });
          
          devicesHtml += '</ul>';

          return devicesHtml;
        } else {
          return 'no array';
        }
        break;
      case 'date':
      case 'plannedDate':
        if(data){
          return formatDateTime(data);  
        } else {
          return '';
        }
        break;
      case 'priority':
        return CONSTS.PRIORITY.replaceAll('{{priorityType}}', data);
        break;
      default: 
        if(data){
          return data;
        } else {
          return '';
        }
        break;
    }
  }

  /**
   * Remove the active state of any table rows
   * @function resetActiveRows
   */
  function resetActiveRows(){
    const highlightedRowElem = options.selectors.dashboardBodyElem.querySelector('.dashboard__row--highlight');
    if(highlightedRowElem){
      highlightedRowElem.classList.remove('dashboard__row--highlight');
    }
  }

  /**
   * Should another parameter/value be added to the fetch API Url?
   * @function constructFetchUrl
   * @param {string} currentUrl - The current fetch Url as it stands
   * @param {string} parameter - The parameter name to attach to the Url
   * @param {string} value - The related value for the current parameter being passed
   */
  function constructFetchUrl(currentUrl, parameter, value){
    const joiningStr = currentUrl.indexOf('?') !== -1 ? '&' : '?';
    let attachValue = false;

    // If a value has been passed for the parameter, add it to the end of the existing API Url
    if(value){
      if(Array.isArray(value)){
        if(value.length > 0){
          attachValue = true;
        }
      } else {
        attachValue = true;
      }
    }

    // Should the parameter/value be added to the Url?
    if(attachValue){
      return `${joiningStr}${parameter}=${value}`;
    } else {
      return '';  
    }
  }

  /**
   * Retrieve new data for a specified page
   * @function fetchData
   * @param {number} pageNumber - The page number to retrieve data for
   * @param {string} pageType - For a custom page type (such as search), the type of query (pageType) takes precedence over the page number, as all queries of this type will always start on page 1
   */
  function fetchData(pageNumber, pageType=null){
    // If the overlay is visible when a new fetch of data is made, be sure to hide the overlay
    if(overlay.isActive()){
      // Hide the overlay
      overlay.hide();
    }

    const apiMode = configConsts.api.mode;
    let apiDomain = configConsts.api.domains[apiMode];
    const activeTab = store.get('dashboard').activeTab;
    const sortBy = store.get('dashboard').sortBy;
    const sortOrder = store.get('dashboard').sortOrder;
    const brands = store.get('brand-selector').brands.join(',');
    const searchText = store.get('search-bar').searchText;

    // For the live API pagination
    const rows = configConsts.api.components.dashboard.recordsPerPage;
    const startRow = (pageNumber*rows) - (rows-1);

    // Build up the URL to be requested
    let apiUrl = configConsts.api.components.dashboard.url;

    // Handle the local-filename property in the string literal
    // Clean up the URL for local development
    if(apiMode === 'local'){
      apiDomain += 'assets/data/';
      apiUrl = apiUrl.replace('{{localFilename}}', `page-${pageNumber}.json`);
    } else {
      apiUrl = apiUrl.replace('{{localFilename}}', '');
    }

    // These are used by the live API, but ignored when running local stubbed JSON data
    apiUrl += constructFetchUrl(apiUrl, 'activeTab', activeTab);
    apiUrl += constructFetchUrl(apiUrl, 'sortBy', sortBy);
    apiUrl += constructFetchUrl(apiUrl, 'sortOrder', sortOrder);
    apiUrl += constructFetchUrl(apiUrl, 'startRow', startRow);
    apiUrl += constructFetchUrl(apiUrl, 'rows', rows);
    apiUrl += constructFetchUrl(apiUrl, 'brands', brands);
    apiUrl += constructFetchUrl(apiUrl, 'searchText', searchText);

    // Attach any UI Filters which have been specified by the user
    // Which tab group is currently active?
    const activeTabId = store.get('dashboard').activeTab;
    const currentFiltersData = store.get('dashboard-filters')[activeTabId];

    apiUrl += constructFetchUrl(apiUrl, 'area', currentFiltersData.elements['area']);
    apiUrl += constructFetchUrl(apiUrl, 'dateFrom', currentFiltersData.elements['date-from']);
    apiUrl += constructFetchUrl(apiUrl, 'dateTo', currentFiltersData.elements['date-to']);
    apiUrl += constructFetchUrl(apiUrl, 'device', currentFiltersData.elements['device']);
    apiUrl += constructFetchUrl(apiUrl, 'duration', currentFiltersData.elements['duration']);
    apiUrl += constructFetchUrl(apiUrl, 'location', currentFiltersData.elements['location']);
    apiUrl += constructFetchUrl(apiUrl, 'origin', currentFiltersData.elements['origin']);
    apiUrl += constructFetchUrl(apiUrl, 'plannedDateFrom', currentFiltersData.elements['plannedDate-from']);
    apiUrl += constructFetchUrl(apiUrl, 'plannedDateTo', currentFiltersData.elements['plannedDate-to']);
    apiUrl += constructFetchUrl(apiUrl, 'plannedDuration', currentFiltersData.elements['plannedDuration']);
    apiUrl += constructFetchUrl(apiUrl, 'priority', currentFiltersData.elements['priority']);
    apiUrl += constructFetchUrl(apiUrl, 'score', currentFiltersData.elements['score']);
    apiUrl += constructFetchUrl(apiUrl, 'status', currentFiltersData.elements['status']);
    apiUrl += constructFetchUrl(apiUrl, 'theme', currentFiltersData.elements['theme']);
    apiUrl += constructFetchUrl(apiUrl, 'win', currentFiltersData.elements['win']);

    sendLog('[dashboard/dashboard.js](fetchData)', `Url passed to API: ${apiUrl}`);

    // Send data to the API via GET
    apiGet(apiDomain + apiUrl).then((data) => {
      options.tableData = data;

      // If the API return data is in response to a search, re-enable text entry within the search box
      if(searchText !== ''){
        searchBar.options.selectors.searchBarElem.classList.remove('search-bar--searching'); 
        searchBar.options.selectors.searchBarInputBoxElem.removeAttribute('disabled');
      }

      // Is the server response an error?
      if(options.tableData.hasOwnProperty('error')){
        const overlayData = {
          content: `${options.tableData.error.exception} ${options.tableData.error.message}`,
          icon: 'attention',
          iconColour: 'blue',
          header: 'API error',
          buttonCancelLabel: 'Close'
        }

        // Show the overlay with all the necessary data
        overlay.show(overlayData);

        sendLog('[dashboard/dashboard.js](fetchData)', `Error returned from API: ${options.tableData.error.exception} ${options.tableData.error.message}`);

        return;
      }

      // With a fresh dataset, update the contents of the table
      updateTable();

      // Refresh the contents of the pagination bar
      updatePaginationLinks(options.tableData.count);

      // Set which page is shown as active within the pagination
      setPaginationActiveStatus(pageNumber);

      // If a search was performed and there were 0 results returned, show an overlay to inform the user
      if(searchText !== '' && options.tableData.count === 0){
        const overlayData = {
          buttonCancelLabel: 'Close',
          content: `No search results found for the query: ${searchText}`,
          header: 'Search results',
          icon: 'attention',
          iconColour: 'magenta',
          theme: 'blue'
        }

        // Show the overlay with all the necessary data
        overlay.show(overlayData);

        sendLog('[dashboard/dashboard.js](fetchData)', 'Search returned 0 results, restricted overlay shown');
      }

      sendLog('[dashboard/dashboard.js](fetchData)', `Record count: ${options.tableData.count}`);

      // Dispatch an event, notifying the website that the dashboard has been updated
      events.fire(window, 'dashboard.update', {recordCount: options.tableData.count});
    }).catch((error) => {
      console.log('Error', error);

      const overlayData = {
        buttonCancelLabel: 'Close',
        content: `An error has occured submitting data to the API: ${error}`,
        header: 'API error',
        icon: 'attention',
        iconColour: 'blue'
      }

      // Show the overlay with all the necessary data
      overlay.show(overlayData);
    });
  }

  /**
   * Refresh the contents of the pagination bar
   * @function updatePaginationLinks
   * @param {number} dashboardRecords - The total number of records returned from the most recent API request
   */
  function updatePaginationLinks(dashboardRecords){
    // Empty out the previous pagination element
    options.selectors.paginationElem.innerHTML = '';

    // How many pages are required?
    const pagesRequired = Math.ceil(dashboardRecords/configConsts.api.components.dashboard.recordsPerPage);

    let paginationElem = '<ul class="pagination__list">';

    for(let i=1; i<=pagesRequired; i++){
      paginationElem += `<li class="pagination__item"><a class="pagination__link" href="#pagination-${i}">${i}</a></li>`;
    }

    paginationElem += '</ul>';

    options.selectors.paginationElem.insertAdjacentHTML('afterbegin', paginationElem);
  }

  /**
   * Set which page is shown as active within the pagination
   * @function setPaginationActiveStatus
   * @param {number} pageNumber - The current page which data is showing for
   */
  function setPaginationActiveStatus(pageNumber){
    const paginatedPageElem = [...options.selectors.paginationElem.querySelectorAll('.pagination__link')][pageNumber-1];

    // Set the new active page state
    // It is possible that 0 records are returned, hence the need to perform the if() here
    if(paginatedPageElem){
      paginatedPageElem.classList.add('pagination__link--active');
    }
  }

  /**
   * Find which columns should be shown for a specific tab switcher type (eg: 'cancelled' || 'backlog' || 'roadmap' || 'completed')
   * @function getTabGroupColumns
   * @param {string} tabId - The id of the tab to request the column names for
   * @returns {array} - An array containing the columns to show
   */
  function getTabGroupColumns(tabId){
    return [
      ...options.tabHeadingColumnTypes.default, 
      ...options.tabHeadingColumnTypes[tabId]
    ];
  }

  return {
    fetchData,
    getTabGroupColumns,
    highlightDashboardRow,
    init,
    options,
    refreshColumnVisibility,
    resetHighlightedRows,
    switchDashboardTab,
    updateStorageEntry
  }
}());

export default dashboard;