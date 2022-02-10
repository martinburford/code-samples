// File: conditional-forms.js
// Author: Martin Burford (martin@martinburford.co.uk)

import extend from 'extend';
import events from './../../global/js/events';
import {findParentNode} from './../../global/js/utils';

class ConditionalForms {
  init() {
    // If returning to a form (via a Back button), re-instate the visibility of previously active
    // conditional blocks
    this.autoShowActiveConditionals();

    // Attach disabled states for conditions which are not visible
    this.addInitialDisabledProperty();

    // Delegated events for radio buttons
    events.delegate(document.body, '[data-has-conditional-logic] [data-related-question]', 'change', (e) => {
      // Process the handling of showing/hiding contextual form elements
      this.processContextualFormElement(e);
    });
  }

  /**
   * If returning to a form (via Back button), re-instate the visibility of previously active
   * conditional blocks
   * @function autoShowActiveConditionals
   */
  autoShowActiveConditionals() {
    const conditionalFormElem = document.querySelector('[data-conditional-form]');
    let idToToggleVisible;

    // Toggle display states for selected radio buttons
    Array.from(conditionalFormElem.querySelectorAll('input[type="radio"][data-related-question]:checked')).forEach((radioElem) => {
      idToToggleVisible = radioElem.getAttribute('data-related-question');

      if (this.doesRelatedQuestionExist(idToToggleVisible)) {
        conditionalFormElem.querySelector(`[data-related-question-id="${idToToggleVisible}"]`).classList.add('active');
      }
    });
  }

  /**
   * Check to see whether a specific conditional DOM element wrapper exists or not. This will
   * determine whether or not to process toggling (visible OR hidden) of a given condition
   * @function doesRelatedQuestionExist
   * @param {number} id - The id of the selected (and the related condition)
   * @returns {boolean} - Whether or not the conditional element exists in the DOM
   */
  doesRelatedQuestionExist(id) {
    return document.querySelector(`[data-related-question-id="${id}"]`) !== null;
  }

  /**
   * Process the handling of showing/handling contextual form elements
   * @function processContextualFormElement
   * @param {event} e - The event captured in order to show the associated contextual form element
   */
  processContextualFormElement(e) {
    const capturedEventElem = e.target;
    const containerElement = findParentNode({className: 'nested-question'}, capturedEventElem);
    const requestedElementId = e.target.getAttribute('data-related-question');
    const isValidConditionalDomElement = this.doesRelatedQuestionExist(requestedElementId);

    // If a conditional block of questions have had a non-conditional answer selected, remove
    // all visibible conditions
    if (!isValidConditionalDomElement) {
      this.resetFormConditionalVisibility(containerElement);

      return;
    }

    // If a checkbox has been de-selected, reset/hide the contextual form element
    if (capturedEventElem.type === 'checkbox') {
      if (!capturedEventElem.checked) {
        this.resetFormConditionalVisibility(containerElement);

        return;
      }
    }

    const contextualElementToShow = document.querySelector(`[data-related-question-id="${requestedElementId}"]`);
    contextualElementToShow.classList.add('active');

    // Remove the disabled property from all form elements when they are visible, so they
    // CAN have values entered by the user
    this.removeDisabledFlags(contextualElementToShow);

    // Does the requested conditional block contain an RTE field which needs to disable the form?
    this.checkForRTEToDisableForm(contextualElementToShow);

    // Reset the display state of all contextual questions before showing the related question
    Array.from(containerElement.querySelectorAll('[data-related-question-id]')).forEach((elem) => {
      if (elem !== contextualElementToShow) {
        elem.classList.remove('active');

        // Add the disabled property to all form elements (within the correct context) when they
        // are hidden, so they CANNOT have values entered by the user
        this.addDisabledFlags(elem);
      }
    });
  }

  /**
   * If a conditional block of questions have had a non-conditional answer selected, remove
   * all visibible conditions
   * @function resetFormConditionalVisibility
   * @param {object} formContainerElement - The parent element wrapping ALL conditions
   */
  resetFormConditionalVisibility(formContainerElement) {
    Array.from(formContainerElement.querySelectorAll('[data-related-question-id]')).forEach((elem) => {
      elem.classList.remove('active');

      // Add the disabled property to all form elements (within the correct context) when they
      // are hidden, so they CANNOT have values entered by the user
      this.addDisabledFlags(elem);

      // Reset any radio button previous selections
      this.resetRadioButtons(elem);

      // Reset any checkbox previous selections
      this.resetCheckboxes(elem);

      // Reset any textbox previous entries
      this.resetTextboxes(elem);

      // Reset any textarea previous entries
      this.resetTextareas(elem);

      // Reset all tooltips within a group, so that it is hidden
      this.resetTooltip(elem);

      // Remove any 'Other / Please specify' elements
      this.resetOtherPleaseSpecify(elem);

      // Re-activate the submit button in the form
      this.resetFormSubmissionButton(elem);
    });
  }

  /**
   * Locate the forms submit button, in order to disable/re-enable
   * @function locateFormSearchButton
   * @param {object} elem - The parent element where the RTE block
   * (end form submission) is
   * @returns {element} - The forms submit button
   */
  locateFormSearchButton(elem) {
    return findParentNode({tagName: 'FORM'}, elem).querySelector('[type="submit"]');
  }

  /**
   * Does the requested conditional block contain an RTE field which needs to disable the form?
   * @function checkForRTEToDisableForm
   * @param {object} elem - The parent element which is to be checked against for RTE blocks which
   * should disable the form submission
   */
  checkForRTEToDisableForm(elem) {
    let containsRTEToDisableForm = false;
    const containerElems = Array.from(elem.querySelectorAll('.container:not([data-has-conditional-logic])'));
    const containsNonConditionalContainers = containerElems.length > 0;

    if (containsNonConditionalContainers) {
      containerElems.forEach((containerElem) => {
        if (containerElem.querySelector('[class*="rte-end-form-submission"]')) {
          containsRTEToDisableForm = true;
        }
      });
    } else { /* eslint-disable no-lonely-if */
      if (elem.querySelector('[class*="rte-end-form-submission"]')) {
        containsRTEToDisableForm = true;
      }
    }

    if (containsRTEToDisableForm) {
      const submitButtonElem = this.locateFormSearchButton(elem);

      // Force the forms submit button to be disabled
      submitButtonElem.setAttribute('hidden', 'true');
      submitButtonElem.setAttribute('aria-disabled', 'true');
    }
  }

  /**
   * Re-activate the submit button in the form
   * @function resetFormSubmissionButton
   * @param {object} elem - The parent element which is currently being reset
   */
  resetFormSubmissionButton(elem) {
    const submitButtonElem = this.locateFormSearchButton(elem);

    // Reset the forms submit button to be enabled
    submitButtonElem.removeAttribute('hidden');
    submitButtonElem.removeAttribute('aria-disabled');
  }

  /**
   * Reset any textarea previous entries
   * @function resetTextareas
   * @param {object} elem - The parent element which is to have textareas reset
   */
  resetTextareas(elem) {
    Array.from(elem.querySelectorAll('textarea')).forEach((textareaElem) => {
      textareaElem.value = '';
    });
  }

  /**
   * Reset any textbox previous entries
   * @function resetTextboxes
   * @param {object} elem - The parent element which is to have textboxes reset
   */
  resetTextboxes(elem) {
    Array.from(elem.querySelectorAll('input[type="text"]')).forEach((textElem) => {
      textElem.value = '';
    });
  }

  /**
   * Reset any checkbox previous selections
   * @function resetCheckboxes
   * @param {object} elem - The parent element which is to have checkboxes reset
   */
  resetCheckboxes(elem) {
    Array.from(elem.querySelectorAll('input[type="checkbox"]')).forEach((checkboxElem) => {
      checkboxElem.checked = false;
    });
  }

  /**
   * Reset any radio button previous selections
   * @function resetRadioButtons
   * @param {object} elem - The parent element which is to have radio buttons reset
   */
  resetRadioButtons(elem) {
    Array.from(elem.querySelectorAll('input[type="radio"]')).forEach((radioElem) => {
      radioElem.checked = false;
    });
  }

  /**
   * Reset all tooltips within a group, so that it is hidden
   * @function resetTooltip
   * @param {object} elem - The parent element which is to have tooltips hidden
   */
  resetTooltip(elem) {
    Array.from(elem.querySelectorAll('a[data-related-tooltip].active')).forEach((tooltipTriggerElem) => {
      events.fire(tooltipTriggerElem, 'click');
    });
  }

  /**
   * Reset all 'Other / Please specify' textboxes within a group, so that it no longer in the DOM
   * @function resetOtherPleaseSpecify
   * @param {object} elem - The parent element which is to have its 'Other / Please specify'
   * elements removed
   */
  resetOtherPleaseSpecify(elem) {
    Array.from(elem.querySelectorAll('[data-other-please-specify-added]')).forEach((otherPleaseSpecifyWrapperElem) => {
      otherPleaseSpecifyWrapperElem.removeAttribute('data-other-please-specify-added');

      Array.from(otherPleaseSpecifyWrapperElem.querySelectorAll('input[name$="-please-specify-other"]')).forEach((otherPleaseSpecifyElem) => {
        const labelToRemoveElem = otherPleaseSpecifyElem.previousElementSibling;

        labelToRemoveElem.parentNode.removeChild(labelToRemoveElem);
        otherPleaseSpecifyElem.parentNode.removeChild(otherPleaseSpecifyElem);
      });
    });
  }

  /**
   * Attach disabled states for conditions which are not visible
   * @function addInitialDisabledProperty
   */
  addInitialDisabledProperty() {
    // Locate the upper-most conditional block of elements which is not visible
    // and set all form elements from that level down as disabled
    const conditionalWrapperElem = document.querySelector('[data-conditional-form] .container .nested-question:not(.active)');

    if (conditionalWrapperElem) {
      // Add the disabled property to all form elements (within the correct context) when they
      // are hidden, so they CANNOT have values entered by the user
      this.addDisabledFlags(conditionalWrapperElem);
    }
  }

  /**
   * Remove the disabled property from all form elements when they are visible, so they
   * CAN have values entered by the user
   * @function removeDisabledFlags
   * @param {object} element - The conditional form element which is being shown
   */
  removeDisabledFlags(element) {
    // Remove the disabled property from a matching nodelist
    this.removeDisabledFromElement(element.querySelectorAll('input'));
    this.removeDisabledFromElement(element.querySelectorAll('textarea'));
  }

  /**
   * Remove the disabled property from a matching nodelist
   * @function removeDisabledFromElement
   * @param {arraylist} elems - The conditional form elements which are to have their disabled
   * property removed
   */
  removeDisabledFromElement(elems) {
    Array.from(elems).forEach((elem) => {
      elem.removeAttribute('disabled');
      elem.removeAttribute('aria-disabled');
    });
  }

  /**
   * Add the disabled property to all form elements (within the correct context) when they
   * are hidden, so they CANNOT have values entered by the user
   * @function addDisabledFlags
   * @param {object} element - The conditional form element which is being hidden
   */
  addDisabledFlags(element) {
    // Add the disabled property to a matching nodelist
    this.addDisabledToElement(element.querySelectorAll('input'));
    this.addDisabledToElement(element.querySelectorAll('textarea'));
  }

  /**
   * Add the disabled property to a matching nodelist
   * @function addDisabledToElement
   * @param {arraylist} elems - The conditional form elements which are to have their disabled
   * property added
   */
  addDisabledToElement(elems) {
    Array.from(elems).forEach((elem) => {
      elem.setAttribute('disabled', 'disabled');
      elem.setAttribute('aria-disabled', 'true');
    });
  }
}

export default ConditionalForms;
