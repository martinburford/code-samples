/**
 * File: /assets/scripts/global/date-picker.js
 * Author: Martin Burford (martin@martinburford.co.uk)
 */

import events from './events';
import {sendLog} from './logger';
import pikaday from 'pikaday';
import uiFilters from './../dashboard/ui-filters';
import {
  padStart
} from './utilities';

const CONSTS = {};

const options = {};

class datePicker {
  /**
   * Contructor for date picker
   * @function constructor
   * @param {element} elem - The instance of the datepicker
   * @param {boolean} options.isUIFiltersDatePicker - Whether or not the datepicker is part of the UI Filters
   */
  constructor(elem, options={isUIFiltersDatePicker:false}){
    this.datePickerElem = elem;
    this.datePickerTextElem = elem.querySelector('input');
    this.id = this.datePickerTextElem.getAttribute('data-id');
    this.triggerElem = elem.querySelector('.date-picker__trigger');

    // Is this instane of a datepicker part of the UI Filters?
    this.isUIFiltersDatePicker = options.isUIFiltersDatePicker;
  }

  /**
   * Initialize date picker
   * @function init
   */
  init(){
    // Create an instance of a date picker
    this.createDatePicker();
  }

  /**
   * Create an instance of a date picker
   * @function createDatePicker
   */
  createDatePicker(){
    // Because of the markup Choices.js generates, workout whether a pre-populate date has been specified BEFORE the native DOM element is converted
    const prepopulate = this.datePickerTextElem.value !== '';
    let prepopulateValue;
    if(prepopulate){
      const date = this.datePickerTextElem.value.split('/');
      prepopulateValue = `${date[2]}-${date[1]}-${date[0]}`;
    }

    const datePicker = new pikaday({
      field: document.querySelector(`[data-id="${this.id}"]`),
      position: 'bottom right',
      toString(date, format){
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Add prefixed zeros to months and days so that 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 render as 01, 02, 03, 04, 05, 06, 07, 08, 09
        return `${padStart(day.toString(), 2, '0')}/${padStart(month.toString(), 2, '0')}/${year}`;
      },
      trigger: this.triggerElem
    });

    // Is there a pre-population value to send to the date picker onload?
    if(prepopulate){
      datePicker.setDate(prepopulateValue);
    }

    // UI Filters specific functionality
    if(this.isUIFiltersDatePicker){
      // Store a global reference of the current datepicker instance
      uiFilters.addNewDatePickerReference({
        datePicker,
        id: this.id
      });
    }
  }

  /**
   * Access a specific datepicker instance
   * @function getDatePicker
   * @param {string} id - The unique id of a specific date picker
   * @returns {object} - The datepicker instance
   */ 
  static getDatePicker(id){
    return options.datePickerElems[id].datePicker;
  }
}

export default datePicker;