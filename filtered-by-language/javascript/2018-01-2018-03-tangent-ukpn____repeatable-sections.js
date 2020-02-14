// File: repeatable-sections.js
// Author: Martin Burford (martin@martinburford.co.uk)

import Choices from 'choices.js';
import tooltip from './tooltip';
import events from '../../global/js/events';
import {findParentNode, generateGuid} from '../../global/js/utils';

const options = {
  defaultMaximumItemsAllowed: 3,
  templateHTML: {
    removeButton: `
      <div class="repeatable-section__remove container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10 col-xl-8">
            <button type="button" class="repeatable-section__button--delete">Remove</button>
          </div>
        </div>
      </div>
    `
  }
};

class RepeatableSections {
  constructor(repeatableSectionElem) {
    this.repeatableSectionElem = repeatableSectionElem;
    this.repeatableSectionWrapperElem = repeatableSectionElem.querySelector('.repeatable-section__wrapper');
    this.cloneTriggerElem = repeatableSectionElem.querySelector('.repeatable-section__button--add');
    this.cloneWrapperElem = repeatableSectionElem.querySelector('.repeatable-section__add');
    this.addNewCloneMarkup = repeatableSectionElem.querySelector('.repeatable-section__add').outerHTML;

    // How many current sections does the repeatable section have at the moment of initialization?
    // On initial load, this will always be 1
    // If returning to the page via a 'Back' event, it could be a higher number (based on the
    // previous submission)
    this.sectionCount = Array.from(this.repeatableSectionElem.querySelectorAll('.repeatable-section__wrapper')).length;
  }

  /**
   * Update all tooltip ids, so that cloned tooltips are unique
   * @function updateTooltipIds
   * @param {element} element - The container DOM element which has just been cloned
   */
  static updateTooltipIds(element) {
    let tooltipExistingId;
    let tooltipContentElem;
    let autoGuid;

    Array.from(element.querySelectorAll('a[data-related-tooltip]')).forEach((tooltipElem) => {
      tooltipExistingId = tooltipElem.getAttribute('data-related-tooltip');
      tooltipContentElem = element.querySelector(`[data-tooltip-id="${tooltipExistingId}"]`);

      // Auto-generate a new id
      autoGuid = generateGuid();

      tooltipElem.setAttribute('data-related-tooltip', autoGuid);
      tooltipContentElem.setAttribute('data-tooltip-id', autoGuid);
    });
  }

  /**
   * Update a forms attribute within an incrental bumpup, to reflect the sections index
   * @function getAttributeString
   * @param {string} initialAttributeValue - The initial attribute value
   * @param {number} index - The current repeatable section index
   * @returns {string} - The new attribute value
   */
  static updateAttributeString(initialAttributeValue, index) {
    return initialAttributeValue.replace(new RegExp('\\[.*?\\]', 'g'), `[${index}]`);
  }

  /**
   * Retrieve the list of items for the <select> so that Choices.js can successfully re-initialize
   * @function retrieveListItems
   * @param {element} selectWrapperElem - The wrapper of the select (injected by Choices.js)
   * @returns {array} - An array of objects, representing the data for each <option> in the select
   */
  static retrieveListItems(selectWrapperElem) {
    const selectItems = [];

    Array.from(selectWrapperElem.querySelectorAll('.choices__list--dropdown .choices__item')).forEach((item) => {
      selectItems.push({
        label: item.innerText.trim(),
        value: item.getAttribute('data-value')
      });
    });

    return selectItems;
  }

  /**
   * Generate a new <select> element based on data for each <option>
   * @function generateNewNativeSelect
   * @param {array} selectItems - An array of objects, representing the data for each <option> in
   * the select
   * @param {string} identifier - The id AND the name of the <select>
   * @returns {element} - The new <select> element
   */
  static generateNewNativeSelect(selectItems, identifier) {
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

    return selectElem;
  }

  /**
   * For the most recent cloned block, a delete button needs to offer the capablity to remove
   * itself
   * @function generateRemoveButton
   * @param {element} clone - The newly cloned section which is to have a remove button added to it
   */
  static generateRemoveButton(cloneElem) {
    cloneElem.insertAdjacentHTML('beforeend', options.templateHTML.removeButton);
  }

  /**
   * Update labels and form element ids/names/for attributes, to match the section index
   * @function updateFormElements
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateFormElementAttributes(sectionElem) {
    // Update all labels with the correct for attribute (index) value
    this.updateLabels(sectionElem);

    // Update all textboxes with the correct attributes / reset values || state
    this.updateTextboxes(sectionElem);

    // Update all (numeric) textboxes with the correct attributes / reset values || state
    this.updateNumericTextboxes(sectionElem);

    // Update all textareas with the correct attributes / reset values || state
    this.updateTextareas(sectionElem);

    // Update all radio buttons with the correct attributes / reset values || state
    this.updateRadioButtons(sectionElem);

    // Regenerate all selects using Choices.js
    this.updateSelects(sectionElem);
  }

  /**
   * Regenerate all selects using Choices.js
   * @function updateSelects
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateSelects(sectionElem) {
    let selectItems;
    let newSelectElem;

    Array.from(sectionElem.querySelectorAll('.select__wrapper')).forEach((selectElem) => {
      selectItems = RepeatableSections.retrieveListItems(selectElem);

      // Generate a new <select> element based on data for each <option>
      newSelectElem = RepeatableSections.generateNewNativeSelect(selectItems, selectElem.getAttribute('data-name'));

      // Empty out the previous (post-DOM) Choices.js initialized dropdown
      selectElem.innerHTML = '';

      // Update the new <select> with the correct attributes / reset values || state
      selectElem.setAttribute('data-name', RepeatableSections.updateAttributeString(selectElem.getAttribute('data-name'), this.sectionCount - 1));
      newSelectElem.setAttribute('id', RepeatableSections.updateAttributeString(newSelectElem.getAttribute('id'), this.sectionCount - 1));
      newSelectElem.setAttribute('name', RepeatableSections.updateAttributeString(newSelectElem.getAttribute('name'), this.sectionCount - 1));

      // Add the newly created native <select>
      selectElem.appendChild(newSelectElem);

      // Initialize the newly created Choices.js native <select>
      // eslint-disable-next-line no-new
      new Choices(newSelectElem, {
        placeholder: true,
        placeholderValue: 'Please select',
        searchEnabled: false
      });
    });
  }

  /**
   * Update all radio buttons with the correct attributes / reset values || state
   * @function updateRadioButtons
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateRadioButtons(sectionElem) {
    Array.from(sectionElem.querySelectorAll('input[type="radio"]')).forEach((radioButtonElem) => {
      radioButtonElem.setAttribute('id', RepeatableSections.updateAttributeString(radioButtonElem.getAttribute('id'), this.sectionCount - 1));
      radioButtonElem.setAttribute('name', RepeatableSections.updateAttributeString(radioButtonElem.getAttribute('name'), this.sectionCount - 1));

      // Remove any previous checked states from the clone source
      if (radioButtonElem.checked) {
        radioButtonElem.checked = false;
      }
    });
  }

  /**
   * Update all textareas with the correct attributes / reset values || state
   * @function updateTextareas
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateTextareas(sectionElem) {
    Array.from(sectionElem.querySelectorAll('textarea')).forEach((textareaElem) => {
      textareaElem.setAttribute('id', RepeatableSections.updateAttributeString(textareaElem.getAttribute('id'), this.sectionCount - 1));
      textareaElem.setAttribute('name', RepeatableSections.updateAttributeString(textareaElem.getAttribute('name'), this.sectionCount - 1));
      textareaElem.value = '';
    });
  }

  /**
   * Update all textboxes with the correct attributes / reset values || state
   * @function updateTextboxes
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateTextboxes(sectionElem) {
    Array.from(sectionElem.querySelectorAll('input[type="text"]')).forEach((textboxElem) => {
      textboxElem.setAttribute('id', RepeatableSections.updateAttributeString(textboxElem.getAttribute('id'), this.sectionCount - 1));
      textboxElem.setAttribute('name', RepeatableSections.updateAttributeString(textboxElem.getAttribute('name'), this.sectionCount - 1));
      textboxElem.value = '';
    });
  }

  /**
   * Update all (numeric) textboxes with the correct attributes / reset values || state
   * @function updateNumericTextboxes
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateNumericTextboxes(sectionElem) {
    Array.from(sectionElem.querySelectorAll('input[type="number"]')).forEach((numericTextboxElem) => {
      numericTextboxElem.setAttribute('id', RepeatableSections.updateAttributeString(numericTextboxElem.getAttribute('id'), this.sectionCount - 1));
      numericTextboxElem.setAttribute('name', RepeatableSections.updateAttributeString(numericTextboxElem.getAttribute('name'), this.sectionCount - 1));
      numericTextboxElem.value = '';
    });
  }

  /**
   * Update all labels with the correct for attribute (index) value
   * @function updateLabels
   * @param {element} sectionElem - The wrapper element containing the form elements to be changed
   */
  updateLabels(sectionElem) {
    Array.from(sectionElem.querySelectorAll('label')).forEach((labelElem) => {
      labelElem.setAttribute('for', RepeatableSections.updateAttributeString(labelElem.getAttribute('for'), this.sectionCount - 1));
    });
  }

  /**
   * Generate a clone of the active repeatable section element
   * @function generateClonedSection
   * @private
   * @returns {element} clone - The cloned DOM element
   */
  generateClonedSection() {
    const elemToClone = this.repeatableSectionElem.querySelector('.repeatable-section__wrapper');
    const clone = elemToClone.cloneNode(true);

    // Update the counter for how many sections there are within the current repeatable section
    this.sectionCount = this.sectionCount + 1;

    return clone;
  }

  /**
   * How many items can the current repeatable section accept?
   * @function maximumItemsAllowed
   * a clone
   * @returns {number} - The number of maximum allowed clones within the current repeatable section
   */
  maximumItemsAllowed() {
    let maximumNumber = this.repeatableSectionElem.getAttribute('data-maximum-number');

    if (maximumNumber) {
      maximumNumber = parseInt(maximumNumber, 10);
    } else {
      maximumNumber = options.defaultMaximumItemsAllowed;
    }

    return maximumNumber;
  }

  /**
   * Is the clone action permitted?
   * @function isCloneAllowed
   * @param {element} repeatableSectionElem - The top level repeatable section wrapper DOM element
   * @returns {boolean} - Whether or not the cloned section is allowed
   */
  isCloneAllowed() {
    const currentSectionsTotal = this.sectionCount;

    // How many items can the current repeatable section accept?
    const maximumItemsAllowed = this.maximumItemsAllowed();

    return currentSectionsTotal < maximumItemsAllowed;
  }

  /**
   * Add the clone link back into the repeatable section
   * @function addCloneLinkToSection
   */
  addCloneLinkToSection() {
    this.repeatableSectionElem.insertAdjacentHTML('beforeend', this.addNewCloneMarkup);

    // Since the DOM element is being re-created, re-define it's definition (for event delegation
    // to pick up)
    this.cloneWrapperElem = this.repeatableSectionElem.querySelector('.repeatable-section__add');
  }

  /**
   * Remove the clone link from the active repeatable section element
   * @function removeCloneLinkFromSection
   */
  removeCloneLinkFromSection() {
    const cloneLinkParentElem = this.cloneWrapperElem;
    cloneLinkParentElem.parentNode.removeChild(cloneLinkParentElem);
  }

  /**
   * Initialize all repeatable setion events
   * @function eventsInit
   * @private
   */
  eventsInit() {
    // console.log('events init', this.repeatableSelectionElem, this.cloneTriggerElem);

    events.delegate(this.repeatableSectionElem, '.repeatable-section__button--add', 'click', (e) => {
      e.preventDefault();

      // Is the clone action permitted?
      let isCloneAllowed = this.isCloneAllowed();

      if (!isCloneAllowed) {
        return;
      }

      // Generate a clone of the active repeatable section element
      const clone = this.generateClonedSection();

      // Update labels and form element ids/names/for attributes, to match the section index
      this.updateFormElementAttributes(clone);

      // Add the new cloned section block to the repeatable section group
      this.cloneWrapperElem.parentNode.insertBefore(clone, this.cloneWrapperElem);

      // Update all tooltip ids, so that cloned tooltips are unique
      RepeatableSections.updateTooltipIds(clone);

      // Programmatically close a tooltip based on the context of a wrapper DOM element
      tooltip.closeTooltip(clone);

      // Should the 'Clone' link remain in the DOM for the active repeatable section element?
      isCloneAllowed = this.isCloneAllowed();
      if (!isCloneAllowed) {
        // Remove the clone link from the active repeatable section element
        this.removeCloneLinkFromSection();
      }

      // For the most recent cloned block, a delete button needs to offer the capablity to remove
      // itself
      RepeatableSections.generateRemoveButton(clone);
    });

    events.delegate(this.repeatableSectionElem, '.repeatable-section__button--delete', 'click', (e) => {
      e.preventDefault();

      const sectionWrapperElem = findParentNode({className: 'repeatable-section__wrapper'}, e.target);
      sectionWrapperElem.parentNode.removeChild(sectionWrapperElem);

      // If an item is being removed from when the maximum cloned number limit had previously been
      // reached, the 'Add new section' link needs to be re-instated
      if (this.sectionCount === this.maximumItemsAllowed()) {
        // Add the clone link back into the repeatable section
        this.addCloneLinkToSection();
      }

      // Whenever a cloned section is removed, decrement its own counter
      this.sectionCount = this.sectionCount - 1;
    });
  }

  /**
   * Initialize repeatable sections
   * @function init
   */
  init() {
    this.eventsInit();
  }
}

export default RepeatableSections;
