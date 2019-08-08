/**
 * File: /assets/scripts/dashboard/ui-filters.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import dashboard from './dashboard';
import dropdown from './../global/dropdown';
import events from './../global/events';
import extend from 'extend';
import header from './header';
import moment from 'moment';
import {sendLog} from './../global/logger';
import store from 'store';

const CONSTS = {
  COLUMNS: null,
  TABTYPES: ['cancelled','backlog','roadmap','completed']
};
const options = {
  datepickers: {},
  dropdowns: {}
};

const uiFilters = (function(){
  /**
   * Initialize UI Filters
   * @function init
   */
  function init() {
    sendLog('[dashboard/ui-filters.js](init)');

    // Define the column types per tab group type
    CONSTS.COLUMNS = {
      CANCELLED: [...dashboard.options.tabHeadingColumnTypes.default, ...dashboard.options.tabHeadingColumnTypes.cancelled],
      BACKLOG: [...dashboard.options.tabHeadingColumnTypes.default, ...dashboard.options.tabHeadingColumnTypes.backlog],
      ROADMAP: [...dashboard.options.tabHeadingColumnTypes.default, ...dashboard.options.tabHeadingColumnTypes.roadmap],
      COMPLETED: [...dashboard.options.tabHeadingColumnTypes.default, ...dashboard.options.tabHeadingColumnTypes.completed]
    }

    // Setup all events for the UI Filters
    eventsInit();

    if(!store.get('dashboard-filters')){
      store.set('dashboard-filters', {});

      // Create empty localStorage entries (for all tabs in the tab switcher)
      createLocalStorageEntries();  
    }
  }

  /**
   * Setup all events for the UI Filters
   * @function eventsInit
   */
  function eventsInit() {
    // Process the save (and close) event for the UI Filters
    events.listen(window, 'uiFilters.saveAndApply', (e) => {
      // When clicking on 'Save', all filters must be saved to localStorage
      saveSelectionsToLocalStorage();

      // Show/hide columns based on the active tab type (from localStorage)
      const activeTabId = store.get('dashboard').activeTab;
      dashboard.refreshColumnVisibility(store.get('dashboard-filters')[activeTabId].columns);

      // Retrieve new data for the first page, since a sort order has been requested
      dashboard.fetchData(1);

      sendLog('[dashboard/ui-filters.js](eventsInit)', 'uiFilters.saveAndApply event received, and actioned');
    });

    // Process the beforeShow event, in order to pre-populate the UI Filters overlay based on the currently selected tab
    events.listen(window, 'uiFilters.beforeShow', (e) => {
      // Which tab group is the UI Filters being loaded for?
      const activeTabId = store.get('dashboard').activeTab;
      const localStorageElementsData = store.get('dashboard-filters')[activeTabId].elements;

      // Show the overlay, since the preceding functionality has now been executed
      if(e.data){
        if(e.data.callback){
          e.data.callback();
          
          // Refresh the content in the UI Filters, specific to the active tab group
          // Datepickers
          Object.keys(options.datepickers).forEach((key) => {
            // Reset the datepicker, before re-instating its value
            options.datepickers[key].datePicker.setDate('');

            // Pre-populate its value
            options.datepickers[key].datePicker.setMoment(moment(localStorageElementsData[key], 'D MM YYYY'));
          });

          // Dropdowns
          Object.keys(options.dropdowns).forEach((key) => {
            // Reset the Choices.js dropdown, before re-instating its values
            options.dropdowns[key].choicesElem.removeActiveItems();

            // Pre-populate its value
            options.dropdowns[key].choicesElem.setValueByChoice(localStorageElementsData[key]);
          });

          // Auto-highlight the columns which have either been selected OR belong to the active tab within the tab switcher
          autoHighlightColumns();
        }
      }
    });

    // Set up delegation for the toggle column visibility icons
    events.delegate(document.body, '.ui-filters__toggle', 'click', (e) => {
      e.preventDefault();

      const linkElem = e.target;
      linkElem.classList.toggle('ui-filters__toggle--disabled');
    });
  }

  /**
   * Create empty localStorage entries (for all tabs in the tab switcher)
   * @function createLocalStorageEntries
   */
  function createLocalStorageEntries(){
    const currentStorage = store.get('dashboard-filters');
    const newStorageData = {};

    // Create empty localStorage entries (for all tabs in the tab switcher)
    CONSTS.TABTYPES.forEach((tabType) => {
      // Create an empty entry for the new tab group
      newStorageData[tabType] = {
        columns: CONSTS.COLUMNS[tabType.toUpperCase()],
        elements: {
          'area':[],
          'date-from': '',
          'date-to': '',
          'device': [],
          'duration': '',
          'location': [],
          'origin': '',
          'plannedDate-from': '',
          'plannedDate-to': '',
          'plannedDuration': '',
          'priority': '',
          'score': [],
          'status': [],
          'theme': [],
          'win': []
        }
      };
    });

    // Create the entry
    store.set('dashboard-filters', newStorageData);

    sendLog('[dashboard/ui-filters.js](createLocalStorageEntries)');
  }

  /**
   * Store a global reference of the current datepicker instance
   * @function addNewDatePickerReference
   * @param {object} datePicker.datePicker - The actual datepicker instance for the converted datepicker
   * @param {string} datePicker.id - The unique identifier for the datepicker instance
   */
  function addNewDatePickerReference(datepicker){
    // Add a new datepicker reference, for later use (when saving records to localStorage)
    options.datepickers[datepicker.id] = {
      datePicker: datepicker.datePicker,
      id: datepicker.id
    };

    sendLog('[dashboard/ui-filters.js](addNewDatePickerReference)', `id=${datepicker.id}`);
  }

  /**
   * Store a global reference of the current choices.js instance
   * @function addNewDropdownReference
   * @param {object} dropdown.choicesElem - The actual choices.js instance for the converted dropdown list
   * @param {element} dropdown.dropdownElem - The native <select> item (pre-choices.js)
   * @param {string} dropdown.id - The unique identifier for the choices.js instance
   */
  function addNewDropdownReference(dropdown){
    // Add a new choices.js reference, for later use (when saving records to localStorage)
    options.dropdowns[dropdown.id] = {
      choicesElem: dropdown.choicesElem,
      dropdownElem: dropdown.dropdownElem,
      id: dropdown.id
    };

    sendLog('[dashboard/ui-filters.js](addNewDropdownReference)', `id=${dropdown.id}`);
  }

  /**
   * Return all datepicker element values
   * @function retrieveCurrentDatePickerSelections
   * @returns {object} - The object containing the references to all datepicker elements on page
   */
  function retrieveCurrentDatePickerSelections(){
    const datepickerData = {};

    Object.keys(options.datepickers).forEach((key) => {
      datepickerData[key] = options.datepickers[key].datePicker.toString('DD-MM-YYYY');
    });

    sendLog('[dashboard/ui-filters.js](retrieveCurrentDropdownSelections)', datepickerData);

    return datepickerData;
  }

  /**
   * Return all choices.js element values
   * @function retrieveCurrentDropdownSelections
   * @returns {object} - The object containing the references to all choices.js elements on page
   */
  function retrieveCurrentDropdownSelections(){
    const dropdownData = {};

    Object.keys(options.dropdowns).forEach((key) => {
      dropdownData[key] = options.dropdowns[key].choicesElem.getValue(true);
    });

    sendLog('[dashboard/ui-filters.js](retrieveCurrentDropdownSelections)', dropdownData);

    return dropdownData;
  }

  /**
   * Return all selected columns to show
   * @function retrieveCurrentColumnSelections
   * @returns {array} - The list of columns which have been chosen to be visible within the Dashboard
   */
  function retrieveCurrentColumnSelections(){
    const columnData = [];

    [...document.querySelectorAll('.ui-filters__toggle:not(.ui-filters__toggle--disabled)')].forEach((columnElem) => {
      columnData.push(columnElem.getAttribute('data-column-id'));
    });

    sendLog('[dashboard/ui-filters.js](retrieveCurrentColumnSelections)', columnData);

    return columnData;
  }

  /**
   * When clicking on 'Save', all filters must be saved to localStorage
   * @function saveSelectionsToLocalStorage
   */
  function saveSelectionsToLocalStorage(){
    let filters = {};

    // Return all choices.js element values
    const dropdownFilters = retrieveCurrentDropdownSelections();

    const datepickerFilters = retrieveCurrentDatePickerSelections();

    // Join datepicker and dropdown filters into a single object, for persistence into localStorage
    extend(filters, dropdownFilters);
    extend(filters, datepickerFilters);

    // Return all selected columns to show
    const selectedColumns = retrieveCurrentColumnSelections();

    // Which tab group is the UI Filters being loaded for?
    const activeTabId = store.get('dashboard').activeTab;

    // Commit the filters to localStorage
    const currentFiltersData = store.get('dashboard-filters');

    // Remove the previous saved entry for the active tab group
    delete currentFiltersData[activeTabId];

    const newFiltersData = extend(currentFiltersData, {
      [activeTabId]: {
        columns: selectedColumns,
        elements: filters
      }
    });

    store.set('dashboard-filters', newFiltersData);

    // Dispatch an event, notifying the website that the UI Filters have been updated
    updateFiltersCounterLabel();

    sendLog('[dashboard/ui-filters.js](saveSelectionsToLocalStorage)');
  }

  /**
   * Auto-highlight the columns which have been selected
   * @function autoHighlightColumns
   */
  function autoHighlightColumns(){
    // Show/hide columns based on the active tab type (from localStorage)
    const activeTabId = store.get('dashboard').activeTab;
    const columns = store.get('dashboard-filters')[activeTabId].columns;
    let columnId;

    // Reset any previously selected columns (from a different tab group)
    [...document.querySelectorAll('.ui-filters__toggle')].forEach((toggleElem) => {
      toggleElem.classList.remove('ui-filters__toggle--disabled');
    });

    // Now toggle the state of the columns related to the active tab
    [...document.querySelectorAll('.ui-filters__toggle')].forEach((toggleElem) => {
      columnId = toggleElem.getAttribute('data-column-id');

      if(!columns.includes(columnId)){
        toggleElem.classList.add('ui-filters__toggle--disabled');
      }
    });

    sendLog('[dashboard/ui-filters.js](autoHighlightColumns)');
  }

  /**
   * Dispatch an event, notifying the website that the UI Filters have been updated
   * @function updateFiltersCounterLabel
   */
  function updateFiltersCounterLabel(){
    const currentUIfiltersCount = getCurrentUIFiltersCount();
    events.fire(window, 'filterBar.update', {uiFiltersCount: currentUIfiltersCount});

    sendLog('[dashboard/ui-filters.js](updateFiltersCounterLabel)');
  }

  /**
   * How many UI Filters are currently stored within localStorage?
   * @function getCurrentUIFiltersCount
   * @returns {number} - The number of filters currently stored within localStorage
   */
  function getCurrentUIFiltersCount(){
    let activeFilters = 0;

    // Which tab group is the UI Filters showing settings for?
    const activeTabId = store.get('dashboard').activeTab;
    const localStorageFilters = store.get('dashboard-filters')[activeTabId].elements;
    let currentFilter;
    let singleOrMultiple;

    // Loop through all localStorage entries, checking for non-empty entries
    Object.keys(localStorageFilters).forEach((key) => {
      currentFilter = localStorageFilters[key];
      singleOrMultiple = typeof currentFilter === 'string' ? 'single' : 'multiple';

      switch(singleOrMultiple){
        case 'single':
          if(currentFilter !== ''){
            activeFilters++;
          }
          break;
        case 'multiple':
          if(currentFilter.length > 0){
            activeFilters++;
          }
          break;
      }
    }); 

    sendLog('[dashboard/ui-filters.js](getCurrentUIFiltersCount)', `Count=${activeFilters}`);
  
    return activeFilters;
  }

  /**
   * Reset the localStorage entry (back to its defaults) for a specific tab type
   * @function resetLocalStorageEntry
   */
  function resetLocalStorageEntry(){
    const activeTabId = store.get('dashboard').activeTab;

    const newStorageData = {
      columns: CONSTS.COLUMNS[activeTabId.toUpperCase()],
      elements: {
        'area':[],
        'date-from': '',
        'date-to': '',
        'device': [],
        'duration': '',
        'location': [],
        'origin': '',
        'plannedDate-from': '',
        'plannedDate-to': '',
        'plannedDuration': '',
        'priority': '',
        'score': [],
        'status': [],
        'theme': [],
        'win': []
      }
    };

    // Set the new entry in localStorage
    const filtersData = store.get('dashboard-filters');
    filtersData[activeTabId] = newStorageData;

    store.set('dashboard-filters', filtersData);

    // Show/hide columns based on the active tab type ('Cancelled' || 'Backlog' || 'Roadmap' || 'Completed')
    dashboard.refreshColumnVisibility(store.get('dashboard-filters')[activeTabId].columns);

    // Dispatch an event, notifying the website that the UI Filters have been updated
    updateFiltersCounterLabel();

    // Retrieve new data for the first page, since a sort order has been requested
    dashboard.fetchData(1);
  }

  return {
    addNewDatePickerReference,
    addNewDropdownReference,
    autoHighlightColumns,
    init,
    resetLocalStorageEntry,
    updateFiltersCounterLabel
  }
}());

export default uiFilters;