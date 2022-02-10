var form = (function(){
  var options = {
    captchaInstances: {},
    captchaScriptLoaded: false,
    errorText: {
      forgotTickBox: 'Oops, you forgot to tick the box.',
      invalidLink: 'Ho, ho, no. That\'s not a valid link.'
    },
    buttonText: {
      goGoGo: 'Go, go, go!',
      postAnotherStory: 'Post another story'
    },
    urlBeingShared: null,
    urlSubmitterName: null
  };

  function pasteIntoTextfield(textElem){
    // alert(textElem);
    textElem.style.border = 'solid 10px red';
  }

  /**
   * A captcha has been successfully validated
   * @function captchaIsValid
   * @param {object} formElem - The form DOM element which contains the validaed captcha
   * @param {object} captchaElem - The reference to the captcha being validated
   */
  function captchaIsValid(formElem,captchaElem){
    options.urlSubmitterName = utilities.nodeListToArray(formElem.querySelectorAll('input[type="text"]'))[1].value;

    // Reset the valid captcha, before removing it from the DOM (and associated references)
    grecaptcha.reset(captchaElem);

    var pageNumberArr = formElem.getAttribute('id').split('-');
    var pageNumber = pageNumberArr[pageNumberArr.length-1];
    var captchaId = 'captcha-page-' + pageNumber;
    var captchaElem = document.getElementById(captchaId);

    // Delete the previous reference to the removed captcha
    delete options.captchaInstances[captchaId];

    // Remove the DOM element containing the successfully validated captcha element
    captchaElem.parentNode.removeChild(captchaElem);

    // Reset the form submission call
    formElem.setAttribute('onsubmit','return form.newSubmission(this)');

    // Put the form in 'submitting' mode (which shows the loader icon, and disables submitting)
    formElem.setAttribute('onsubmit', 'return false');

    // Visualize the processing element of the form submission
    var submittingFieldsetElem = utilities.nodeListToArray(formElem.querySelectorAll('fieldset'))[1];
    submittingFieldsetElem.classList.add('submitting');

    // Send the validated URL to the back-end, to be processed
    utilities.ajax('/api/articles/SaveArticle/', function(xhr){
      // Proceed the form process onto a specific phase
      showPhase(formElem,3);

      // Release the lock on the form
      submittingFieldsetElem.classList.remove('submitting');
    },{
      data: 'Url=' + options.urlBeingShared + '&SubmittedBy=' + options.urlSubmitterName,
      errorCallback: function(error){
        // Callback for any errors during AJAX call
        console.log('Ajax error: ', error);
      },
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      method: 'post'
    });
  }

  /**
   * A captcha has been UNsuccessfully validated
   * @function captchaIsInvalid
   * @param {object} formElem - The form DOM element which contains the validaed captcha
   */
  function captchaIsInvalid(formElem){
    // Reset all previous error messages
    resetErrorMessages(formElem);

    // Process a submission phase of the user form
    processForm(formElem,'captchaInvalid');
  }

  /**
   * Validate the filling in of Captcha
   * @function validateCaptcha
   * @param {object} formElem - The <form> DOM which contains the captcha which is being validated
   * @param {object} captchaElem - The reference to the captcha being validated
   * @returns {boolean} True if the captcha validation was successful, false if it was not
   */
  function validateCaptcha(formElem,captchaElem){
    if(grecaptcha.getResponse(captchaElem).length > 0){
      captchaIsValid(formElem,captchaElem);
    } else {
      captchaIsInvalid(formElem);
    }

    // Since the form submission is being processed by client-side AJAX, there is no need to provide a postback
    return false;
  }

  /**
   * Process a submission phase of the user form
   * @function processForm
   * @private
   * @param {object} formElem - The form where the error has occured
   * @param {string} stage - Either 'noUrl' || 'xx' || 'yy' || 'zz'
   */
  function processForm(formElem,stage){
    switch(stage){
      case 'noURL':
        showFormError(formElem,options.errorText.invalidLink);
        break;
      case 'captchaInvalid': 
        showFormError(formElem,options.errorText.forgotTickBox);
    }
  }

  /**
   * Attach an error message to the form which has errored
   * @function showFormError
   * @private
   * @param {object} formElem - The form where the error has occured
   * @param {string} message - The error message to display
   */
  function showFormError(formElem,message){
    if(!formElem.classList.contains('error')){
      formElem.classList.add('error');
    }

    // Reset all previous error messages
    resetErrorMessages(formElem);

    var errorElem = document.createElement('em');
    errorElem.innerHTML = message;

    formElem.querySelector('.inner').appendChild(errorElem);
  }

  /**
   * Reset all previous error messages
   * @function resetErrorMessages
   * @private
   * @param {object} formElem - The form where the error has occured
   */
  function resetErrorMessages(formElem){
    var errorElem = formElem.querySelector('em');

    if(errorElem){
      errorElem.parentNode.removeChild(errorElem);  
    }
  }

  /**
   * Proceed the form process onto a specific phase
   * @function showPhase
   * @private
   * @param {object} formElem - The form where the error has occured
   * @param {number} phase - Either 1 (submission) || 2 (add-name) || 3 (success)
   */
  function showPhase(formElem,phase){
    var fieldsetElems = formElem.querySelectorAll('fieldset');
    var fieldsets = utilities.nodeListToArray(fieldsetElems);
    var i=1;

    // Reset all previous error messages
    resetErrorMessages(formElem);

    fieldsets.forEach(function(fieldset){
      fieldset.style.display = (phase === i) ? 'block' : 'none';

      i++;
    });
  }

  /**
   * Validate the form submission, before processing an AJAX request to the back-end
   * @function newSubmission
   * @param {object} formElem - The <form> DOM which contains the textbox that the specified URL was copied and pasted into
   */
  function newSubmission(formElem){
    var submissionElem = formElem.querySelector('input[type="text"]');

    if(submissionElem.value.length === 0 || !isValidUrl(submissionElem.value)){
      // Process a submission phase of the user form
      processForm(formElem,'noURL');
    } else {
      // Proceed the form process onto a specific phase
      showPhase(formElem,2);

      // Store the URL being shared
      options.urlBeingShared = submissionElem.value;

      // If not already created, create a Captcha element, since the URL supplied is valid
      var formElem = document.getElementById(submissionElem.parentNode.parentNode.parentNode.getAttribute('id'));
      var pageNumberArr = formElem.getAttribute('id').split('-');
      var pageNumber = pageNumberArr[pageNumberArr.length-1];
      var captchaId = 'captcha-page-' + pageNumber;

      if(!document.getElementById(captchaId)){
        var captchaElem = document.createElement('div');
        
        captchaElem.setAttribute('id',captchaId);
        formElem.querySelector('.inner').appendChild(captchaElem);

        options.captchaInstances[captchaId] = grecaptcha.render(document.getElementById(captchaId), {
          'sitekey' : '6Ldp3Q4UAAAAAJGBD7y1sOx6nlLmodFX4bCb6Wdf'
        });

        // Change the form onsubmit function, to now validate the Captcha entry
        formElem.setAttribute('onsubmit','return form.validateCaptcha(this,' + options.captchaInstances[captchaId] + ')');
      }

      return false;
    }

    // Since the form submission is being processed by client-side AJAX, there is no need to provide a postback
    return false;
  }

  /**
   * Check whether a url construct is valid
   * @function isValidUrl
   * @private
   * @param {string} suppliedUrl - A url to check its validaity
   * @returns {boolean} Whether or not the supplied url is of a valid format or not
   */
  function isValidUrl(suppliedUrl){
    var regexQuery = '^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$';
    var url = new RegExp(regexQuery, 'i');
  
    if(url.test(suppliedUrl.trim())){
      return true;
    }
  
    return false;
  }

  return {
    newSubmission: newSubmission,
    options: options,
    pasteIntoTextfield: pasteIntoTextfield,
    validateCaptcha: validateCaptcha
  }
}());