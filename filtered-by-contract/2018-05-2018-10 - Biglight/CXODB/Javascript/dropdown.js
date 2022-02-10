/**
 * File: /assets/scripts/global/dropdown.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import Choices from 'choices.js';
import events from './../global/events';
import extend from 'extend';
import formEvents from './../forms/form-events';
import {sendLog} from './../global/logger';
import scrollIntoView from 'scroll-into-view';
import uiFilters from './../dashboard/ui-filters';
import {findParentNode} from './../global/utilities';

const CONSTS = {
  SCROLLTIMER: 250
};

const options = {};

class dropdown {
  /**
   * Contructor for dropdown
   * @function constructor
   * @param {element} elem - The instance of the dropdown
   * @param {boolean} [options.isUIFiltersDropdown] - Whether or not the dropdown is part of the UI Filters
   */
  constructor(elem, options={}) {
    this.ui = {
      dropdownElem: elem,
      dropdownInitialItems: [...elem.querySelectorAll('option')].map((item) => {
        return {
          label: item.innerText,
          value: item.value
        }
      }),
      id: elem.getAttribute('id')
    }

    // Should the shortCodes be added to each <option>? 
    this.attachShortCodes = elem.hasAttribute('data-attach-shortcodes');

    // Is the dropdown within the UI Filters?
    this.isUIFiltersDropdown = options.isUIFiltersDropdown;

    // Is the dropdown limited by how many items it can contain?
    this.hasMaximumItemCount = elem.hasAttribute('data-maximum-item-count');

    // Is the capability to search disabled for this dropdown?
    this.isSearchHidden = elem.hasAttribute('data-search-hidden');

    // Should this dropdown be disabled once initialized?
    this.isDisabled = elem.hasAttribute('data-disabled');

    // Is the dropdown a multi-select?
    this.isMultiSelect = elem.hasAttribute('multiple');

    // Does the dropdown have any custom events specified?
    this.hasCustomSelectEvent = elem.hasAttribute('data-custom-select-event');

    // Should a reference be stored to the post-initialized choices.js reference as well as the native <select>?
    this.bindToFormEvents = elem.hasAttribute('data-bind-to-form-events');

    // Any custom settings?
    let position = options.position ? options.position : 'bottom';

    // There is the possibility to uniquely override a dropdowns position IF it's set on the native <select> element
    // If it is, it'll have the following property: <select data-position="top||bottom||auto">
    if(elem.hasAttribute('data-position')){
      position = elem.getAttribute('data-position');
    }
    
    // Specify custom properties for the instance, based on its native DOM element construct
    this.config = {
      fuseOptions: {
        matchAllTokens: true,
        shouldSort: true,
        threshold: 0,
        tokenize: true
      },
      itemSelectText: '',
      noChoicesText: 'No more options available',
      placeholderValue: 'Please select',
      position,
      shouldSort: false
    };

    // Should the shortCodes be added to each <option>? 
    // This is applicable for the Brand dropdown within the Edit form
    // If true, perform this action BEFORE Choices.js converts it to a custom dropdown
    if(this.attachShortCodes){
      const newChoices = [];

      // Re-build the necessary data array for Choices.js, before re-assigning it
      // This time however, the shortCode will be included since this cannot be interpreted from the initially rendered HTML from the back-end
      const optionElems = [...elem.querySelectorAll('option')];
      optionElems.forEach((optionElem) => {
        newChoices.push({
          label: optionElem.innerText,
          value: optionElem.value,
          selected: optionElem.hasAttribute('selected'),
          customProperties: {
            shortCode: optionElem.getAttribute('data-short-code')
          }
        });
      });

      // Update the dropdown with the correct shortCode values
      // This is so that the header can be updated in real-time, once a brand is selected from a pre-populated Brand custom dropdown
      this.config.callbackOnInit = function(){
        this.setChoices(newChoices, 'value', 'label', true);
      }
    }

    // Is the dropdown limited by how many items it can contain?
    if(this.hasMaximumItemCount){
      const maximumItemCount = parseInt(elem.getAttribute('data-maximum-item-count'));
      this.config.maxItemCount = maximumItemCount;
      this.config.maxItemText = (maxItemCount) => {
        return `Maximum of ${maxItemCount} item(s) can be selected`;
      }
    }

    // Is the capability to search disabled for this dropdown?
    if(this.isSearchHidden){
      this.config.searchEnabled = false;
    }

    // Is the dropdown a multi-select?
    switch(this.isMultiSelect){
      case true:
        this.config.removeItemButton = true;
        break;
    }

    // Does the dropdown have any custom events specified?
    if(this.hasCustomSelectEvent){
      this.ui.dropdownElem.addEventListener('change', (event) => {
        // By default, Choices.js sends event data in the format of event.detail.value
        // Fired events (programmatically) sends event data in the format of event.data.value
        let selectionValue;

        if(event.detail){
          selectionValue = event.detail.value;
        } else {
          selectionValue = event.data.value;
        }

        // Fire the custom event on the window once a selection has been made
        events.fire(window, elem.getAttribute('data-custom-select-event'), selectionValue);
      });
    }

    // Convert each instance into its own Choices.js instance
    this.ui.choicesElem = new Choices(`#${this.ui.id}`, this.config);

    // Should a reference be stored to the post-initialized choices.js reference as well as the native <select>?
    if(this.bindToFormEvents){
      // Store a global reference of the current choices.js instance
      formEvents.addNewDropdownReference({
        choicesElem: this.ui.choicesElem,
        dropdownElem: this.ui.dropdownElem,
        dropdownInitialItems: this.ui.dropdownInitialItems,
        id: this.ui.id
      });
    }

    // Is this instance of a dropdown part of the UI Filters?
    // UI Filters specific functionality
    if(this.isUIFiltersDropdown){
      // Bind functions to the contextual instance of the class
      this.eventsInitUIFilters = this.eventsInitUIFilters.bind(this);

      // Store a global reference of the current choices.js instance
      uiFilters.addNewDropdownReference({
        choicesElem: this.ui.choicesElem,
        dropdownElem: this.ui.dropdownElem,
        id: this.ui.id
      });
    }

    // Disabled the dropdown if it's been configured to initialize in a disabled state
    if(this.isDisabled){
      this.ui.choicesElem.disable();
    }
  }

  /**
   * Initialize file upload
   * @function init
   */
  init() {
    sendLog('[dashboard/dropdown.js](init)');

    // Perform checks whenever the dropdown is shown, to determine whether it should appear above or below
    if(this.isUIFiltersDropdown){
      // Setup all events for the dropdown (IF it exists as part of the UI Filters overlay)
      this.eventsInitUIFilters();
    }
  }

  /**
   * Setup all events for the dropdown (IF it exists as part of the UI Filters overlay)
   * @function eventsInitUIFilters
   */
  eventsInitUIFilters() {
    // Whenever a dropdown is expanded, perform the following
    this.ui.dropdownElem.addEventListener('showDropdown', (event) => {
      // On selecting a dropdown, scroll the overlay inner element, so that it sits at the very top
      const overlayOuterElem = document.querySelector('.overlay__outer');
      const activeFormElem = findParentNode({className: 'ui-filters__filter'}, this.ui.dropdownElem);
      const activeFormElemOffset = activeFormElem.offsetTop - overlayOuterElem.offsetTop;

      // Scroll the UI Filters scrollable container to the top of the selected filter form element
      scrollIntoView(activeFormElem, {
        align:{
          left: 0,
          top: 0
        },
        isScrollable: function(target, defaultIsScrollable){
          return target.className === 'overlay__outer';
        },
        time: CONSTS.SCROLLTIMER
      });
    });
  }
}

export default dropdown;