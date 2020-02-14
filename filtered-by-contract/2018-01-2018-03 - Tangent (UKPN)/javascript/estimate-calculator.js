// File: estimate-calculator.js
// Author: Martin Burford (martin@martinburford.co.uk)

import Choices from 'choices.js';
import events from './../../global/js/events';
import {debounce, findParentNode} from './../../global/js/utils';

const CONSTS = {
  EMBEDDEDERROR: {
    PARENTCLASS: 'embedded-error',
    TEMPLATE: `<p>${name}</p>`
  },
  POSTCODE: {
    DEBOUNCE: 500,
    REGEXCHECK: /[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}/i,
    REGEXREFORMAT: /(^[A-Z]{1,2}[0-9]{1,2})([0-9][A-Z]{2}$)/i
  }
};

class EstimateCalculator {
  /**
   * Create an error message, based on provided error message data
   * @function constructErrorMessage
   * @param {object} data - The data associated to the error message
   * @returns {string} - The entire error message
   */
  static constructErrorMessage(data) {
    return `
      <div class="embedded-error">
        <div class="embedded-error__message">
          <div class="embedded-error__icon">
            <svg class="icon icon-full">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${data.icon}"></use>
            </svg>
          </div>
          <h5 class="embedded-error__heading">${data.heading}</h5>
          <h5 class="embedded-error__sub-heading">${data.subHeading}</h5>
          <p>${data.content}</p>
          <a href="${data.link.url}">${data.link.text}</a>
        </div>
      </div>
    `;
  }

  /**
   * Attach an error message string into the DOM
   * @function attachErrorMessage
   * @param {element} parentFormElem - The top level parent element the error message belongs to
   * @param {element} formElemToMove - The form element to move when adding/removing error messages
   * @param {string} errorMessage - The error message to add to the form element
   */
  static attachErrorMessage(parentFormElem, formElemToMove, errorMessage) {
    const formWrapperElem = parentFormElem.querySelector('.form-element');
    const labelElem = formWrapperElem.querySelector('label');

    // Add the error message into the DOM, correctly positioned
    labelElem.insertAdjacentHTML('afterend', errorMessage);

    const errorElem = formWrapperElem.querySelector(`.${CONSTS.EMBEDDEDERROR.PARENTCLASS}`);
    
    // Move the form element into the correct position, nested within the error message
    errorElem.insertBefore(formElemToMove, errorElem.childNodes[0]);

    // Attaching an error message de-focuses the form element. Re-focus it now
    formElemToMove.focus();
  }

  /**
   * Remove an error message string from the DOM
   * @function removeErrorMessage
   * @param {element} parentFormElem - The top level parent element the error message belongs to
   * @param {element} formElemToMove - The form element to move when adding/removing error messages
   */
  static removeErrorMessage(parentFormElem, formElemToMove) {
    const labelElem = parentFormElem.querySelector('label');
    const errorElem = parentFormElem.querySelector(`.${CONSTS.EMBEDDEDERROR.PARENTCLASS}`);

    // Move the form element to immediately after the label
    labelElem.insertAdjacentElement('afterend', formElemToMove);

    // Remove the error message
    errorElem.parentNode.removeChild(errorElem);
  }

  /**
   * Initialize all events for Tabbed Content
   * @function eventsInit
   */
  static eventsInit() {
    // Fire an immediate event for textbox entry, to reset any error messages visible when typing
    // begins
    events.delegate(document.body, '.estimate-calculator .postcode-entry input', 'keyup', (e) => {
      const postcodeEntryParentElem = findParentNode({className: 'postcode-entry'}, e.target);

      // Does any error exist?
      const errorElem = postcodeEntryParentElem.querySelector(`.${CONSTS.EMBEDDEDERROR.PARENTCLASS}`);
      const containsError = errorElem !== null;

      // Remove any previous error messages
      if (containsError) {
        // Remove an error message string from the DOM
        EstimateCalculator.removeErrorMessage(postcodeEntryParentElem, e.target);

        e.target.focus();
      }
    });

    // Fire a debounced event upon textbpx entry
    events.delegate(document.body, '.estimate-calculator .postcode-entry input', 'keyup', debounce((e) => {
      // Whenever starting to enter (or edit) a postcode entry, remove any error messages visible
      // at the current time
      const postcodeElem = e.target;
      const postcode = postcodeElem.value;

      // If the postcode length is less than the minimum allowed UK postcode eg: N1ABC, don't process event
      if (postcode.length < 5) return;

      const postcodeEntryParentElem = findParentNode({className: 'postcode-entry'}, e.target);

      // Is the postcode format correct?
      if (EstimateCalculator.isValidPostcode(postcode)) {
        // Reformat postcode into a tidier / consistent format
        const cleanup = EstimateCalculator.cleanupPostcode(postcode);

        console.log('Valid postcode entered', postcode);
        console.log('Valid postcode cleansed', cleanup);
        postcodeElem.value = cleanup;
      } else {
        console.log('Invalid postcode entered', postcode);

        // Construct an error message for the Calculator form element in error state
        const errorMessage = EstimateCalculator.constructErrorMessage({
          icon: 'icon_warning', // icon_warning || icon_not_found
          heading: 'Dynamic heading',
          subHeading: 'Dynamic sub-heading',
          content: 'Dynamic content',
          link: {
            url: '#dynamic-link-url',
            text: 'Dynamic link text'
          }
        });

        // Attach an error message string into the DOM
        EstimateCalculator.attachErrorMessage(postcodeEntryParentElem, postcodeElem, errorMessage);

        console.log(errorMessage);
      }
    }, CONSTS.POSTCODE.DEBOUNCE));

    // a.choices-js-refresh(href="#", data-name="calculator-v2-select-3")

    // Capture the event for refreshing a set of Choice.js items
    events.delegate(document.body, '.estimate-calculator .choices-js-refresh', 'click', (e) => {
      e.preventDefault();

      const selectElem = e.target.nextElementSibling.querySelector('.select__wrapper');

      // Refresh a specific Choices.js dropdown list with new options
      EstimateCalculator.refreshChoicesJSDropdown(selectElem, EstimateCalculator.generateRandomListItems());
    });
  }

  /**
   * Generate a random list of items for inclusion within a refresh of a Choices.js dropdown
   * @function generateRandomListItems
   * @returns {array} - A list of objects, each of which contains a new <option>
   */
  static generateRandomListItems() {
    // Randomize the number of new list items to be created between 20 and 100 in total
    const itemTotal = Math.floor(Math.random() * 100) + 20
    const items = [];

    for (let i=1; i<=itemTotal; i++) {
      let itemPrefix = '';

      if (i < 10) {
        itemPrefix = '0';
      }

      items.push({
        label: `Refresh item ${itemPrefix}${i}`,
        value: `Refresh value ${itemPrefix}${i}`
      });
    }

    return items;
  }

  /**
   * Refresh a specific Choices.js dropdown list with new options
   * @function refreshChoicesJSDropdown
   * @param {string} identifier - The data-name of the .select__wrapper container of the <select>
   * to be refreshed
   * @param {array} newListOptions - A list of objects, each of which contains a new <option>
   */
  static refreshChoicesJSDropdown(identifier, newListOptions) {
    // Empty out the previous Choices.js dropdown list
    identifier.innerHTML = '';

    const newElementName = identifier.getAttribute('data-name');
    const newSelectElem = EstimateCalculator.generateNewNativeSelect(newElementName, newListOptions);

    // Append the new native dropdown to the DOM, in order for it to be re-initialized using
    // Choices.js
    identifier.appendChild(newSelectElem);

    // Initialize the newly created Choices.js native <select>
    // eslint-disable-next-line no-new
    new Choices(newSelectElem, {
      placeholder: true,
      searchEnabled: false
    });
  }

  /**
   * Generate a new <select> element based on data for each <option>
   * @function generateNewNativeSelect
   * @param {string} identifier - The data-name of the .select__wrapper container of the <select>
   * to be refreshed
   * @param {array} selectItems - An array of objects, representing the data for each <option> in
   * the select
   * @returns {element} - The new <select> element
   */
  static generateNewNativeSelect(identifier, selectItems) {
    const selectElem = document.createElement('select');
    selectElem.classList.add('select', 'js-select');
    selectElem.setAttribute('id', identifier);
    selectElem.setAttribute('name', identifier);

    let optionElem;
    selectItems.forEach((item) => {
      optionElem = document.createElement('option');
      optionElem.setAttribute('value', item.value);
      optionElem.innerText = item.label;

      selectElem.appendChild(optionElem);
    });

    selectElem.setAttribute('placeholder',`Please select (${selectItems.length} items)`);

    return selectElem;
  }

  /**
   * Is the postcode format correct?
   * @function isValidPostcode
   * @param {string} postcode - The postcode to check for validity
   * @returns {boolean} - Whether or not the postcode supplied is of valid format
   */
  static isValidPostcode(postcode) {
    const postcodeRegEx = CONSTS.POSTCODE.REGEXCHECK;
    return postcodeRegEx.test(postcode);
  }

  /**
   * Reformat postcode into a tidier / consistent format
   * @function cleanupPostcode
   * @param {string} postcode - The postcode to cleanse
   * @returns {string} - The cleaned up postcode
   */
  static cleanupPostcode(postcode) {
    const postcodeRegEx = CONSTS.POSTCODE.REGEXREFORMAT;
    return postcode.replace(postcodeRegEx, '$1 $2').toUpperCase();
  }

  /**
   * Initialize Estimate Calculator
   * @function init
   */
  init() {
    // Initialize all events for Estimate Calculator
    EstimateCalculator.eventsInit();
  }
}

export default EstimateCalculator;
