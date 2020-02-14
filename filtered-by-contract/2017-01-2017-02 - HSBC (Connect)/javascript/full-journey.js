var fullJourney = (function(){
  var options = {
    apiData: {
      channels: [],
      globalCustomerId: 1,
      profileId: null,
      profileName: null,
      version: null
    },
    errorHeadlineText: 'An error has occurred within this section. Please correct the error(s) below:',
    formData: {
      connectionName: {
        isComplete: false
      },
      contactDetails: {
        isComplete: false
      },
      transmissionProtocol: {
        isComplete: false
      },
      messageProtocol: {
        isComplete: false
      },
      files: {
        isComplete: false,
        forDebugOutput: {} // This is required since File objects cannot be JSON.stringified
      },
      serverDetails: {
        isComplete: false
      }
    },
    initialToggleState: 1,
    phases: [
      'connectionName',
      'contactDetails',
      'transmissionProtocol',
      'messageProtocol',
      'files',
      'serverDetails'
    ],
    showDebugOptions: false,
    spaceAboveWhenScrolling: 20
  };
  var accordions = utilities.nodeListToArray(document.querySelectorAll('.accordion'));

  /**
   * Initialize all accordions
   * @function init
   */
  function init(){
    // Delegate all events for accordions
    eventsInit();

    // Auto-expand the initial toggle element
    initialToggleState();
  }

  /**
   * Delegate all events for accordions
   * @function eventsInit
   */
  function eventsInit(){
    // Toggle contracted/expanded state
    events.delegate(document.body, '.accordion h3', 'click', function(e){
      e.preventDefault();

      // Ensure that the selected group is now expanded
      var toggleWrapperElem = this.parentNode;

      // Some accordion groups have dependencies, in that other groups must be filled in before another can be filled in. Check whether the current group to toggle open is allowed to be expanded
      if(groupCanBeExpanded(toggleWrapperElem)){
        // Locate a parentnode DOM element, based on a classname || nodeName to match
        var activeSectionElem = utilities.findParentNode({nodeName: 'section'}, this);

        // Locate a parentnode DOM element, based on a classname || nodeName to match
        var accordionElem = utilities.findParentNode({className: 'accordion'}, this);
        var sectionElems = utilities.nodeListToArray(accordionElem.querySelectorAll('section'));

        // Contract all groups within an accordion
        sectionElems.forEach(function(sectionElem, index){
          sectionElem.classList.add('contracted');
        });

        toggleWrapperElem.classList.remove('contracted');
        toggleWrapperElem.removeAttribute('data-summary');
        toggleWrapperElem.setAttribute('data-enabled', true);

        var scrollToDomElement = this;
        if(!isFirstPhaseToggle(activeSectionElem)){
          scrollToDomElement = activeSectionElem.previousElementSibling;
        }

        // Retrieve the offset (left and top) of the requested DOM element
        var offsets = utilities.currentOffset(scrollToDomElement);
        var bodyTopSpacing = parseInt(window.getComputedStyle(document.body, null).getPropertyValue('padding-top'));

        // Scroll the document to a specifix y-axis offset
        scrollToY(offsets.top - bodyTopSpacing - options.spaceAboveWhenScrolling, 100, 'easeInOutQuint');
      }
    });

    // Toggle forms, based on a +/- icon, and an immediately following form DOM element
    events.delegate(document.body, '.accordion .toggle-form', 'click', function(e){
      e.preventDefault();

      var isContracted = this.classList.contains('contracted');
      var elemClassToToggle = this.getAttribute('data-linked-dom-element');
      var parentElem = utilities.findParentNode({className: 'group-content'}, this);
      var elemToToggle = parentElem.querySelector(elemClassToToggle);

      // If the toggle element is animating from contracted to expanded, remove the inline margin style, so the native CSS definitions can take precedence
      if(isContracted){
        elemToToggle.style.removeProperty('margin-top');
      } else {
        var toggleElemHeight = parseInt(window.getComputedStyle(elemToToggle, null).getPropertyValue('height'));
        elemToToggle.style.marginTop = '-' + toggleElemHeight + 'px';
      }

      this.classList.toggle('contracted');
    });

    // Process the submission of each dorm phase
    events.delegate(document.body, '.accordion input[type="submit"]', 'click', function(e){
      e.preventDefault();

      // Don't execute any logic for disabled submit buttons
      if(this.classList.contains('disabled')){
        return false;
      }

      // Which phase has been submitted, and therefore needs to be validated before continuing
      var currentPhase = parseInt(this.getAttribute('data-current-phase'))-1;
      var currentPhaseName = options.phases[currentPhase];
      var activeSectionElem = utilities.findParentNode({nodeName: 'section'}, this);
      var phaseValidity = validate[currentPhaseName](activeSectionElem);

      // Update the onscreen localstorage indicator
      utilities.refreshDataStorageDebug();

      // Check to see whether all of the mandatory fields (for the entire form) have been filled in, thus enabling the submit button (for submission to SFG) to be enabled)
      var canBeSubmittedToSFG = isFormReadyToSubmitToSFG();
      var completeSubmission = document.getElementById('complete-submission');
      var sfgSubmitElem = document.getElementById('sfg-submit');

      // By default, always set the form to be disabled from submitting, unless all validation checks pass, then unlock it
      completeSubmission.classList.add('disabled');
      sfgSubmitElem.classList.remove('success');

      // Execute the validate routine for the submitted accordion group
      if(phaseValidity === true){
        // If the validated section is linked to any dependant sections, enable them now
        var dependencyElem = document.querySelector('[data-dependency="' + currentPhaseName + '"]');
        if(dependencyElem !== null){
          dependencyElem.setAttribute('data-enabled', true);
        }

        // Add the summary (read-only) information to the successfully validated <section>
        attachSummaryInformation(options.phases[currentPhase]);

        // Remove any previous error states from the active section, as the new error(s) may not be the same as they were previously
        resetErrorState(activeSectionElem);

        // Attach an identifier, to reflect the summary being visible
        document.querySelector('[data-identifier="' + options.phases[currentPhase] + '"]').setAttribute('data-summary', true);

        // Toggle the visibility of a specified group, hiding all other expanded groups in the process (for all groups except the last one)
        toggleAccordionGroup(this, currentPhase===5);

        // Progressive form submission, submit the form data (regardless of what is provided) upon every single phase transition
        // Submit the 'Full Journey' form
        var formElem = utilities.findParentNode({nodeName: 'form'}, this);
        formElem.setAttribute('data-validated',options.phases[currentPhase]);
        form.validateFullJourney(formElem);

        if(canBeSubmittedToSFG){
          completeSubmission.classList.remove('disabled');

          sfgSubmitElem.classList.add('success');
        }
      } else if(phaseValidity.length > 0){
        // If errors have occurred, attach them to the <section> in the form where they have occurred
        attachErrorsToPhase(activeSectionElem, phaseValidity);
      }
    });

    // Process the selection of a radio button (contact details)
    events.delegate(document.body, '.box-list input', 'change', function(e){
      var parentElem = this.parentNode;
      var formElems = utilities.nodeListToArray(parentElem.querySelectorAll('[data-fieldname]'));
      var linkedFieldName;
      var parentSectionElem = document.getElementById(this.getAttribute('name'));
      var inputListElems = utilities.nodeListToArray(parentSectionElem.querySelectorAll('li'));

      inputListElems.forEach(function(inputListElemObj, index){
        inputListElemObj.classList.remove('active');
      });

      // Having remove all active classes, re-instate the active state for the newly selected radio button
      parentElem.classList.add('active');

      formElems.forEach(function(formElemObj, index){
        linkedFieldName = formElemObj.getAttribute('data-fieldname');
        document.getElementById(linkedFieldName).value = formElemObj.innerText;

        // Are there any hint text elements to update?
        if(linkedFieldName.indexOf('-hidden') !== -1){
          // Locate a parentnode DOM element, based on a classname || nodeName to match
          var activeSectionElem = utilities.findParentNode({nodeName: 'section'}, formElemObj);
          activeSectionElem.querySelector('.info').innerHTML = formElemObj.nextElementSibling.innerHTML;
        }
      });
    });

    // Trigger the toggling of an accordion group when clicking on the 'Edit' link
    events.delegate(document.body, '.edit', 'click', function(e){
      e.preventDefault();

      // Locate a parentnode DOM element, based on a classname || nodeName to match
      var activeSectionElem = utilities.findParentNode({nodeName: 'section'}, this);
      activeSectionElem.querySelector('h3').click();
    });
  }

  /**
   * If errors have occurred, attach them to the <section> in the form where they have occurred
   * @function attachErrorToPhase
   * @param {number} activeSectionElem - The <section> DOM element where the error has occurred
   * @param {array} phaseValidity - The form elements which did not pass validation. For certain <sections>, custom error messages can be sent as well
   */
  function attachErrorsToPhase(activeSectionElem, phaseValidity){
    // Remove any previous error states from the active section, as the new error(s) may not be the same as they were previously
    resetErrorState(activeSectionElem);

    // Create the headline error, which appears at the top of <section> DOM elements. This can also contain custom errors, if these were received in the response from the form validation
    var divElem = document.createElement('div');
    divElem.classList.add('form-error');

    var pElem = document.createElement('p');
    pElem.innerText = options.errorHeadlineText;
    divElem.appendChild(pElem);

    // Check to see whether custom errors have been provided, rather than a 1:1 mapping to explicitly named field names
    var customErrors = phaseValidity[0].hasOwnProperty('customErrors') ? true : false;
    var i;

    if(customErrors){
      // Attach each custom error message to the headline error message
      var ulElem = document.createElement('ul');
      var liElem;
      for(i=0; i<=phaseValidity[0].customErrors.length-1; i++){
        liElem = document.createElement('li');
        liElem.innerText = phaseValidity[0].customErrors[i];
        ulElem.appendChild(liElem);
      }

      // Attach the custom errors to the headline error message
      divElem.appendChild(ulElem);
    } else {
      var formElem;
      for(i=0; i<=phaseValidity.length-1; i++){
        formElem = document.getElementById(phaseValidity[i].fieldId);
        formElem.parentNode.classList.add('error');
      }
    }

    var groupContentElem = activeSectionElem.querySelector('.group-content:not(.summary)');
    groupContentElem.insertBefore(divElem, groupContentElem.firstChild);
  }

  /**
   * Remove any previous error states from the active section, as the new error(s) may not be the same as they were previously
   * @function resetErrorState
   * @param {object} activeSectionElem - The <section> DOM element which needs previous error states to be removed from
   */
  function resetErrorState(activeSectionElem){
    var formErrorElem = activeSectionElem.querySelector('.group-content > .form-error');
    var individualErrorElems = utilities.nodeListToArray(activeSectionElem.querySelectorAll('.error'));

    // Remove the singular/global error heading within the <section> DOM element
    if(formErrorElem !== null){
      formErrorElem.parentNode.removeChild(formErrorElem);
    }

    // Remove all individual error states
    individualErrorElems.forEach(function(individualErrorElem, index){
      individualErrorElem.classList.remove('error');
    });
  }

  /**
   * Add the summary (read-only) information to the successfully validated <section>
   * @function attachSummaryInformation
   * @param {string} phaseName - The name of the accordion which has just been contracted, as part of the progression through the form
   */
  function attachSummaryInformation(phaseName){
    function isValidKeyForSummary(str){
      if((str.indexOf('isComplete') === -1 && str.indexOf('Debug') === -1) || options.showDebugOptions){
        return true;
      }

      return false;
    }

    var sectionElem = document.querySelector('[data-identifier="' + phaseName + '"]');

    // Remove any previous summary DOM elements
    var existingSummaryElem = sectionElem.querySelector('.summary');
    if(existingSummaryElem){
      existingSummaryElem.parentNode.removeChild(existingSummaryElem);
    }

    var summaryElem = document.createElement('div');
    summaryElem.classList.add('group-content','summary');

    summaryElem.appendAfter(sectionElem.querySelector('h3'));

    // Attach each entry in data storage to the summary DOM element
    var dataObj = options.formData[phaseName];
    var ulElem = document.createElement('ul');
    var liElem;
    var strongElem;
    var formattedKeyName;
    var innerText;
    var isFileObject;

    Object.keys(dataObj).forEach(function(key){
      if(isValidKeyForSummary(key)){
        // Sentence capitalize the key name (eg: connection-name => Connection Name)
        formattedKeyName = key.split('-').map(function(element){
          return element.substr(0,1).toUpperCase() + element.substr(1,element.length-1);
        }).join(' ');

        liElem = document.createElement('li');

        // Make sure the file name is output in the summary block if the current property is a file object
        isFileObject = dataObj[key].name !== undefined ? true : false;
        if(isFileObject){
          innerText = dataObj[key].name;
        } else {
          innerText = dataObj[key];
        }

        liElem.innerText = innerText;

        strongElem = document.createElement('strong');
        strongElem.innerText = formattedKeyName + ': ';

        liElem.insertBefore(strongElem, liElem.firstChild);
        ulElem.appendChild(liElem);
      }
    });

    summaryElem.appendChild(ulElem);

    var aElem = document.createElement('a');
    aElem.setAttribute('href','#');
    aElem.classList.add('edit');
    aElem.innerText = 'Edit';

    summaryElem.appendChild(aElem);
  }

  /**
   * Check to see whether the toggle heading clicked is the first in the accordion
   * @function isFirstPhaseToggle
   * @param {Object} elem - The <section> element being checked
   * @returns {Boolean} Whether or not the toggle group is the first within the active acccordion
   */
  function isFirstPhaseToggle(elem){
    return elem.previousElementSibling === null;
  }

  /**
   * Auto-expand the initial toggle element
   * @function initialToggleState
   */
  function initialToggleState(){
    var initialExpandPosition;
    var sectionElems;
    var toggleFormElems;

    accordions.forEach(function(accordionObj, index){
      initialExpandPosition = accordionObj.getAttribute('data-initial-expand') || options.initialToggleState;
      sectionElems = utilities.nodeListToArray(accordionObj.querySelectorAll('section'));
      toggleFormElems = utilities.nodeListToArray(accordionObj.querySelectorAll('.toggle-form'));

      // Loop through all inline form toggle blocks (link followed by form/fieldset) to ensure they are all initialized contracted
      // This must be performed before <section> elements are contracted (below), as DOM element heights will be inaccessible, due to items being set to display:none
      toggleFormElems.forEach(function(toggleElem, index){
        toggleElem.click();
      });

      // Loop through all sections, and expand/contract the necessary items, to reflect the default expanded state item
      sectionElems.forEach(function(sectionElem, index){
        if(index !== (initialExpandPosition-1)){
          sectionElem.classList.add('contracted');
        }
      });
    });
  }

  /**
   * Scroll the document to a specifix y-axis offset
   * @function scroltToY
   * @param {Number} pixelPosition - The offset to scroll the y-axis to
   * @param {Number} speed - Time in pixels per second
   * @param {String} easing - The easing equation to use
   */
  function scrollToY(pixelPosition, speed, easing){
    var scrollY = window.scrollY;
    var pixelPosition = pixelPosition || 0;
    var speed = speed || 2000;
    var easing = easing || 'easeOutSine';
    var currentTime = 0;

    // Minimum time .1, maximum time .8 seconds
    var time = Math.max(.1, Math.min(Math.abs(scrollY - pixelPosition) / speed, .8));

    // Further easing equations: https://github.com/danro/easing-js/blob/master/easing.js
    var PI_D2 = Math.PI / 2;
    var easingEquations = {
      /**
       * easeOut animation
       * @function easeOutSine
       * @param {Number} position - The current scroll position
       */
      easeOutSine: function(position){
        return Math.sin(position * (Math.PI / 2));
      },
      /**
       * easeInOut animation
       * @function easeInOutSine
       * @param {Number} position - The current scroll position
       */
      easeInOutSine: function(position){
        return (-0.5 * (Math.cos(Math.PI * position) - 1));
      },
      /**
       * easeOutSine animation
       * @function easeOutSine
       * @param {Number} position - The current scroll position
       */
      easeInOutQuint: function(position){
        if((position /= 0.5) < 1){
          return 0.5 * Math.pow(position, 5);
        }

        return 0.5 * (Math.pow((position - 2), 5) + 2);
      }
    };

    /**
     * Execute animation loop
     * @function tick
     */
    function animateLoop(){
      currentTime += 1 / 60;

      var p = currentTime / time;
      var t = easingEquations[easing](p);

      if(p < 1){
        requestAnimFrame(animateLoop);
        window.scrollTo(0, scrollY + ((pixelPosition - scrollY) * t));
      } else {
        window.scrollTo(0, pixelPosition);
      }
    }

    // Execute animation loop
    animateLoop();
  }

  /**
   * Toggle the visibility of a specified group, hiding all other expanded groups in the process
   * @function toggleAccordionGroup
   * @param {Object} triggerElem - The element triggering the toggle effect
   */
  function toggleAccordionGroup(triggerElem, isLastGroupToggle){
    if(isLastGroupToggle){
      var sectionElem = utilities.findParentNode({nodeName: 'section'}, triggerElem);
      sectionElem.classList.add('contracted');
    } else {
      // Locate a parentnode DOM element, based on a classname || nodeName to match
      var accordionElem = utilities.findParentNode({className: 'accordion'}, triggerElem);
      var sections = utilities.nodeListToArray(document.querySelectorAll('section'));
      var groupToToggle = parseInt(triggerElem.getAttribute('data-current-phase'));
      var toggleWrapperElem = sections[groupToToggle];
      var performToggle = true;

      // Some accordion groups have dependencies, in that other groups must be filled in before another can be filled in. Check whether the current group to toggle open is allowed to be expanded
      if(groupCanBeExpanded(toggleWrapperElem)){
        // Update the next <section> DOM element, by adding the necessary data attributes
        sections[groupToToggle].setAttribute('data-enabled', true);

        // Show the next <section> DOM element
        sections[groupToToggle].querySelector('h3').click();
      }
    }
  }

  /**
   * Some accordion groups have dependencies, in that other groups must be filled in before another can be filled in. Check whether the current group to toggle open is allowed to be expanded
   * @function groupCanBeExpanded
   * @param {Object} toggleWrapperElem - The accordion group element to check whether it can be expanded or not, based on any dependencies it may have
   */
  function groupCanBeExpanded(toggleWrapperElem){
    var performToggle = true;

    if(toggleWrapperElem.hasAttribute('data-dependency')){
      if(!options.formData[toggleWrapperElem.getAttribute('data-dependency')].isComplete){
        performToggle = false;

        alert('**** ERROR ****\nDependency not filled in yet.\nThe requested accordion group cannot yet be extended');
      }
    }

    return performToggle;
  }

  /**
   * Add contact to contacts list
   * @function addContactToList
   * @param {string} firstName - The first name of the contact to be added
   * @param {string} secondName - The second name of the contact to be added
   * @param {string} phoneNumber - The phone number of the contact to be added
   * @param {string} emailAddress - The email address of the contact to be added
   */
  function addContactToList(firstName, secondName, phoneNumber, emailAddress){
    var contactsElem = document.getElementById('contact-details').querySelector('.box-list');
    var liElem = document.createElement('li');

    var inputElem = document.createElement('input');
    inputElem.setAttribute('type', 'radio');
    inputElem.setAttribute('name', 'contact-details');
    liElem.appendChild(inputElem);

    var strongFirstNameElem = document.createElement('strong');
    strongFirstNameElem.setAttribute('data-fieldname', 'first-name');
    strongFirstNameElem.innerText = firstName;
    liElem.appendChild(strongFirstNameElem);

    var strongSecondNameElem = document.createElement('strong');
    strongSecondNameElem.setAttribute('data-fieldname', 'surname');
    strongSecondNameElem.innerText = secondName;
    liElem.appendChild(strongSecondNameElem);

    var spanElem = document.createElement('span');
    spanElem.setAttribute('data-fieldname', 'phone-number');
    spanElem.innerText = phoneNumber;
    liElem.appendChild(spanElem);

    var aElem = document.createElement('a');
    aElem.setAttribute('href', 'mailto:' + emailAddress);
    aElem.setAttribute('data-fieldname', 'email');
    aElem.innerText = emailAddress;
    liElem.appendChild(aElem);

    // Add the contact to the contacts list
    contactsElem.appendChild(liElem);
  }

  /**
   * Check to see whether all of the mandatory fields have been filled in, this enabling the submit button (for submission to SFG) to be enabled)
   * @function isFormReadyToSubmitToFSG
   * @returns {boolean} Whether the form is ready to submit or not
   */
  function isFormReadyToSubmitToSFG(){
    var config = options.formData;
    var keysCount = 0;
    var completeCount = 0;

    Object.keys(config).forEach(function(key){
      keysCount++;

      if(config[key].isComplete){
        completeCount++;
      }
    });

    // Update the contents of the locked footer, which informs the user how many steps are complete
    document.getElementById('complete-submission').nextElementSibling.innerHTML = 'Completed: ' + completeCount + ' of ' + keysCount;

    return completeCount === keysCount;
  }

  /**
   * A different schema is used for local data persistence vs. the API. Transform the local data into an easy to digest format for the API
   * @function mapLocalDataSchemaToAPISchema
   * @param {Object} formElem - The form containing all Full Journey elements
   * @returns {object} The form data translated into a schema consistent with what the API expects
   */
  function mapLocalDataSchemaToAPISchema(formElem){
    var dataObj;
    var validatedPhase = formElem.getAttribute('data-validated');
    var channelsAvailable = options.apiData.channels.length > 0 ? true : false;
    var protocols;
    var protocolsAvailable = false;

    // Have protocols previously been provided
    if(channelsAvailable && options.apiData.channels[0].protocols.length > 0){
      protocolsAvailable = true;
    }

    // Return a different dataset construct, depending on whether this is a profileId at this stage or not
    // This is because a completely different API call is required when POSTING vs. when PUTTING (via xhr)
    // By default, always provide the bare minimum, which equates to the data for phase 1: connection name
    dataObj = {
      channels: channelsAvailable ? options.apiData.channels : [{channelName: dataStoreAssignment(options.formData.connectionName['connection-name'], 'string')}],
      globalCustomerId: options.apiData.globalCustomerId,
      profileName: dataStoreAssignment(options.formData.connectionName['connection-name'], 'string')
    };

    // Update the channelName property, since the API doesn't ever update this
    if(channelsAvailable){
      dataObj.channels[0].channelName = dataStoreAssignment(options.formData.connectionName['connection-name'], 'string');
    }

    // If performing an update (PUT), profileId/version have to be dynamically appended to the profiles API endpoint URL
    if(options.apiData.profileId !== null){
      dataObj.profileId = options.apiData.profileId;
      dataObj.version = options.apiData.version;
    }

    // Update an existing profile (PUT)
    switch(validatedPhase){
      case 'contactDetails':
        var contactDetails = {
          emailAddress: dataStoreAssignment(options.formData.contactDetails['email'], 'string'),
          firstName: dataStoreAssignment(options.formData.contactDetails['first-name'], 'string'),
          phoneNumber: dataStoreAssignment(options.formData.contactDetails['phone-number'], 'string'),
          secondName: dataStoreAssignment(options.formData.contactDetails['surname'], 'string')
        };

        dataObj.channels[0].contact = contactDetails;

        break;
      case 'messageProtocol':
      case 'transmissionProtocol':
        protocols = {
          messageProtocol: dataStoreAssignment(options.formData.messageProtocol['message-protocol'], 'string'),
          transmissionProtocol: dataStoreAssignment(options.formData.transmissionProtocol['transmission-protocol'], 'string')
        };

        break;
      case 'files':

        break;
      case 'serverDetails':
        protocols = {
          port: dataStoreAssignment(options.formData.serverDetails['port-number'], 'number'),
          remoteUserId: dataStoreAssignment(options.formData.serverDetails['username'], 'string'),
          remoteUserPassword: dataStoreAssignment(options.formData.serverDetails['password'], 'string'),
          serverAddress: dataStoreAssignment(options.formData.serverDetails['server-ip-address'], 'string')
        };

        break;
    }

    return  dataObj;
  }

  /**
   * Assign default values to local data persistence (for API submission) to ensure database default values are met (at a minimum) For example, a String should be '' rather than undefined
   * @function dataStoreAssignment
   * @param {(string || Number || null)} value - The value of the form field
   * @param {string} dataType - The expected type of the form field value. This is ued to provide default values in the correct type, should the actual value be undefined
   * @returns {(string || Number)} - Either the initial value provided to the function (if not null) OR a default value, in the desired format
    */
  function dataStoreAssignment(value, dataType){
    var returnValue;

    switch(dataType){
      case 'string':
        returnValue = value === undefined ? 'N/a' : value;
        break;
      case 'number':
        returnValue = value === undefined ? 0 : value;
        break;
    }

    return returnValue;
  }

  // Validation routines
  var validate = {
    /**
     * Validate the input of the connection name
     * @function connectionName
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    connectionName: function(sectionElem){
      // Store key/value into local data object (formData)
      options.formData.connectionName['connection-name'] = document.getElementById('connection-name').value;

      var sectionErrors = [];
      if(document.getElementById('connection-name').value === '') {sectionErrors.push({fieldId: 'connection-name'});}

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.connectionName.isComplete = isCompleteSection ? true : false;

      return sectionErrors.length > 0 ? sectionErrors : true;
    },

    /**
     * Validate the input of the contact details
     * @function contactDetails
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    contactDetails: function(sectionElem){
      // Store key/value into local data object (formData)
      options.formData.contactDetails['first-name'] = document.getElementById('first-name').value;
      options.formData.contactDetails['surname'] = document.getElementById('surname').value;
      options.formData.contactDetails['phone-number'] = document.getElementById('phone-number').value;
      options.formData.contactDetails['email'] = document.getElementById('email').value;

      var sectionErrors = [];
      if(document.getElementById('first-name').value === '') {sectionErrors.push({fieldId: 'first-name'});}
      if(document.getElementById('surname').value === '') {sectionErrors.push({fieldId: 'surname'});}
      if(document.getElementById('phone-number').value === '') {sectionErrors.push({fieldId: 'phone-number'});}
      if(document.getElementById('email').value === '') {sectionErrors.push({fieldId: 'email'});}

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.contactDetails.isComplete = isCompleteSection ? true : false;

      var isInvalid = sectionErrors.length;
      if(isInvalid){
        var toggleElem = sectionElem.querySelector('.toggle-form');

        if(toggleElem.classList.contains('contracted')){
          toggleElem.click();
        }
      }

      return isInvalid ? sectionErrors : true;
    },

    /**
     * Validate the input of the transmission protocol
     * @function transmission protocol
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    transmissionProtocol: function(sectionElem){
      var selection = document.getElementById('transmission-protocol-hidden');

      // Store key/value into local data object (formData)
      options.formData.transmissionProtocol['transmission-protocol'] = selection.value;

      var sectionErrors = [];
      if(selection.value === ''){
        sectionErrors.push({
          customErrors: [
            'Please select one of the available transmission protocols listed.'
          ]
        });
      }

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.transmissionProtocol.isComplete = isCompleteSection ? true : false;

      return sectionErrors.length > 0 ? sectionErrors : true;
    },

    /**
     * Validate the input of the message protocol
     * @function messageProtocol
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    messageProtocol: function(sectionElem){
      var selection = document.getElementById('message-protocol-hidden');

      // Store key/value into local data object (formData)
      options.formData.messageProtocol['message-protocol'] = selection.value;

      var sectionErrors = [];
      if(selection.value === ''){
        sectionErrors.push({
          customErrors: [
            'Please select one of the available message protocols listed.'
          ]
        });
      }

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.messageProtocol.isComplete = isCompleteSection ? true : false;

      return sectionErrors.length > 0 ? sectionErrors : true;
    },

    /**
     * Validate the key files uploaded by the user
     * @function keys
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    files: function(sectionElem){
      /**
       * Because File objects cannot be stringified from within a JSON block, assign a duplicate object with some of the Files properties, to prove a file object has been stored, for submission to SFG
       * @function updateDebugOptions
       */
      function updateDebugOptions(fileType, fileObj){
        var fileForDebug = {
          lastModified: fileObj.lastModified,
          lastModifiedDate: fileObj.lastModifiedDate,
          name: fileObj.name,
          size: fileObj.size,
          type: fileObj.type
        };

        options.formData['files'].forDebugOutput[fileType] = fileForDebug;
      }

      var sectionErrors = [];
      var customErrors = [];

      // Append the selected/uploaded files (publicSSHKeyConnection)
      var publicSSHKeyConnection = document.getElementById('public-ssh-key-connection').files[0];
      if(publicSSHKeyConnection !== undefined){
        // Store key/value into local data object (formData)
        options.formData.files['public-SSH-key-connection'] = publicSSHKeyConnection;

        // Because File objects cannot be stringified from within a JSON block, assign a duplicate object with some of the Files properties, to prove a file object has been stored, for submission to SFG
        updateDebugOptions('public-SSH-key-connection', publicSSHKeyConnection)
      } else {
        customErrors.push('Please upload a Public SSH Key Connection file');
      }

      // Append the selected/uploaded files (publicEncryptionKeyConnection)
      var publicEncryptionKeyConnection = document.getElementById('public-key-for-encrypting').files[0];
      if(publicEncryptionKeyConnection !== undefined){
        // Store key/value into local data object (formData)
        options.formData.files['public-encryption-key-connection'] = publicEncryptionKeyConnection;

        // Because File objects cannot be stringified from within a JSON block, assign a duplicate object with some of the Files properties, to prove a file object has been stored, for submission to SFG
        updateDebugOptions('public-encryption-key-connection', publicEncryptionKeyConnection)
      } else {
        customErrors.push('Please upload a Public Encryption Key Connection file');
      }

      if(customErrors.length > 0){
        sectionErrors.push({
          customErrors: customErrors
        });
      }

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.files.isComplete = isCompleteSection ? true : false;

      return sectionErrors.length > 0 ? sectionErrors : true;
    },

    /**
     * Validate the input of the server details
     * @function serverDetails
     * @param {Object} sectionElem - The parent <section> DOM element
     */
    serverDetails: function(sectionElem){
      // Store key/value into local data object (formData)
      options.formData.serverDetails['server-ip-address'] = document.getElementById('server-ip-address').value;
      options.formData.serverDetails['port-number'] = document.getElementById('port-number').value;
      options.formData.serverDetails['username'] = document.getElementById('username').value;
      options.formData.serverDetails['password'] = document.getElementById('password').value;
      options.formData.serverDetails['repeat-password'] = document.getElementById('repeat-password').value;

      var sectionErrors = [];
      if(document.getElementById('server-ip-address').value === '') {sectionErrors.push({fieldId: 'server-ip-address'});}
      if(document.getElementById('port-number').value === '') {sectionErrors.push({fieldId: 'port-number'});}
      if(document.getElementById('username').value === '') {sectionErrors.push({fieldId: 'username'});}
      if(document.getElementById('password').value === '') {sectionErrors.push({fieldId: 'password'});}
      if(document.getElementById('repeat-password').value === '') {sectionErrors.push({fieldId: 'repeat-password'});}

      var isCompleteSection = sectionErrors.length > 0 ? false : true;
      options.formData.serverDetails.isComplete = isCompleteSection ? true : false;

      return sectionErrors.length > 0 ? sectionErrors : true;
    },
  }

  return {
    init: init,
    options: options,
    mapLocalDataSchemaToAPISchema: mapLocalDataSchemaToAPISchema
  }
}());
