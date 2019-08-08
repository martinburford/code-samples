/**
* Account Opening v1.0
* @module ao
*/

var ao = window.ao || {};

ddressLookup = (function(){
  var configuration = {
    apiUrls: {
      countryList: '/_prototyping/address-lookup/assets/json/countryList.json',
      countrySpecificFieldsPrefix: '/_prototyping/address-lookup/assets/json/countrySpecificFields-',
      postcode: '/_prototyping/address-lookup/assets/json/postcode.json'
    }
  }
  
  /**
  * Initialize Address Lookup
  * @method init
  */
  function init(obj){
    $.extend(ao.configuration,{
      addressLookup: configuration
    });
    
    $.logEvent('[ao.addressLookup.init]: ao.configuration extended to contain: ' + $.logJSONObj(ao.configuration.addressLookup));
    
    // Initialize delegated events
    eventsInit(); 
    
    // Initialize all associated debug functionality
    debugInit();
  }
  
  /**
  * Initialize delegated events
  * @method eventsInit
  */
  function eventsInit(){
    $.logEvent('[ao.addressLookup.eventsInit]');
    
    var postcodeToUse;
    $('.address-lookup').on('click','[data-lookup-postcode]',function(){
      // Don't process event if the DOM element has already been locked/disabled
      if($(this).hasClass('locked')){
        return;
      }
      
      var addressLookupObj = $(this).parents('.address');
      var addressLookupParentObj = addressLookupObj.parents('.address-lookup');
            
      // Remove all previous results
      addressLookupObj        
        .find('.available-addresses')
          .remove()
          .end()
        .find('.cant-find-address')
          .remove()
          .end()
        .find('[data-manual-entry]')
          .remove();
      
      postcodeToUse = $(this).prev().val();
      
      // Lookup a postal address, and return the available addresses
      lookupPostalAddressViaPostcode({
        callback: processAvailableAddresses,
        context: $(this).parents('FIELDSET.address'),
        postcode: postcodeToUse
      })
    }).on('change','.available-addresses SELECT',function(){
      // Don't process event if the DOM element has already been locked/disabled
      if($(this).hasClass('locked')){
        return false;
      }
      
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'enable'});
      
      // Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element   
      updateOldestAddressDates({resetOrContinue: 'reset'});
      
      // Auto-fill in the address fields based on an address having been selected
      addressSelectionBuildAndPopulate({
        addressObj: $('OPTION:selected',this),
        context: $(this).parents('FIELDSET.address')
      });
    }).on('change','.abroad-country-list SELECT',function(){
      var addressLookupObj = $(this).parents('FIELDSET.address');
      var selectedCountryCode = $('OPTION:selected',this).val();
      
      // Disable the country list
      $(this).prop('disabled','disabled');
      
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'enable'});
      
      // Perform an AJAX request to locate the fields for the country type the address belongs to
      lookupCountryManualEntryFields({
        context: addressLookupObj,
        countryCode: selectedCountryCode
      });
    }).on('change','.date-moved-in SELECT',function(){
      var addressLookupObj = $(this).parents('.address-lookup');
      $('>INPUT.submit',addressLookupObj).parents('FORM').submit();
      
    }).on('click','.cant-find-address',function(e){
      e.preventDefault();
      
      var addressLookupObj = $(this).parents('FIELDSET.address');
      
      // Add a classname to toggle the visibility of the manual entry form elements
      // Remove the localscope CSS classname override
      addressLookupObj
        .addClass('manual-entry')
        .find('[data-manual-entry]')
          .remove();
  
      // Disable the postcode entry textbox, as manual entry will be used from now on
      $('[data-postcode-entry]',addressLookupObj).addClass('locked').attr('readonly','readonly');
      
      // Disable the postcode search button
      $('[data-lookup-postcode]',addressLookupObj).addClass('locked');
      
      // Disable the address list, returned from the postcode entry
      $('.available-addresses SELECT',addressLookupObj)
        .addClass('locked')
        .attr('disabled','disabled')
        .find('OPTION')
          .prop('selected',false);
      
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'enable'});
          
      // Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element   
      updateOldestAddressDates({resetOrContinue: 'reset'});
                
      // Perform an AJAX request to locate the fields for the country type the address belongs to
      lookupCountryManualEntryFields({
        context: addressLookupObj,
        countryCode: 'uk'
      });     
    }).on('click','.location A',function(e){
      e.preventDefault();
      
      var locationObj = $(this);
      var locationsObj = locationObj.parents('.location');
      var addressLookupObj = locationsObj.parents('FIELDSET.address');
      
      // Do not process event if the locations have already been disabled
      if(locationsObj.hasClass('disabled')){
        return false;
      }
      
      // Specify the active styling for the selected address type
      locationObj.parent().addClass('active');      
      locationsObj.addClass('disabled');
      
      // Inject either for a UK or an abroad address type
      var addressTypeIsUK = locationObj.parent().hasClass('uk') ? true : false;
      
      switch(addressTypeIsUK){
        case true:
          // Add the default entry form element for a UK address type
          attachUKPostcodeEntry({
            context: addressLookupObj
          });
          
          break;
        case false:
          // Add the default country list form element for an abroad address type
          attachAbroadCountryListSelection({
            context: addressLookupObj
          });
          
          break;
      }
    }).on('click','.add-address',function(){    
      var addressLookupObj = $('.address-lookup');
      var newIdPrefix = $('.address',addressLookupObj).size() + 1;
      
      $(this).attr('disabled','disabled');
      
      $('<fieldset />')
        .append(
          $('<legend />')
            .text('Address lookup: address ' + newIdPrefix)
        )
        .attr({
          'class': 'address',
          id: 'address-prefix-' + newIdPrefix
        })
        .append(
          $('<ul />')
            .append(
              $('<li />')
                .append(
                  $('<a />')
                    .attr('href','#')
                    .text('UK')
                )
                .attr('class','uk')
            )
            .append(
              $('<li />')
                .append(
                  $('<a />')
                    .attr('href','#')
                    .text('Abroad')
                )
                .attr('class','abroad')
            )
            .attr('class','location')
        )
        .insertBefore($('.address:first',addressLookupObj));
        
      // Attach the debug links to each unique address entry
      attachDebugLinks();
    });
  }
  
  /**
  * Initialize all associated debug functionality
  * @method debugInit
  */
  function debugInit(){
    $.logEvent('[ao.addressLookup.debugInit]');
    
    var addressLookupObj;
    
    // Attach the debug links to each unique address entry
    attachDebugLinks();
    
    $('.address-lookup').on('click','[data-toggle-edit-state]',function(e){
      e.preventDefault();
      
      addressLookupObj = $(this).parents('FIELDSET.address');
      
      addressLookupObj
        .toggleClass('locked')
        .find('SELECT')
          .each(function(){
            if(addressLookupObj.hasClass('locked')){
              $(this).prop('disabled','disabled');
            }
            else{
              $(this).removeProp('disabled');
            }
          })
    }).on('click','[data-reset-address]',function(e){
      e.preventDefault();
      
      addressLookupObj = $(this).parents('FIELDSET.address');
      
      addressLookupObj
        .removeClass('locked')
        .find('.form-field,.cant-find-address')
          .remove()
        .end()
        .find('.location')
          .removeClass('disabled')
          .find('.active')
            .removeClass('active');
            
      // Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element   
      updateOldestAddressDates({resetOrContinue: 'reset'});
                
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'disable'});
    }).on('click','[data-delete-address]',function(e){
      e.preventDefault();
      
      addressLookupObj = $(this).parents('FIELDSET.address');
      addressLookupObj
        .remove();
            
      // Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element   
      updateOldestAddressDates({resetOrContinue: 'continue'});
    });
  }
  
  /**
  * The most recently added address has passed clientside validation checks. Process the dates now
  * @method processCompleteAddress
  */
  function processCompleteAddress(){
    $.logEvent('[ao.addressLookup.processCompleteAddress]');
    
    // Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element   
    updateOldestAddressDates({resetOrContinue: 'continue'});
        
    isValidReadyToSubmit();
  }
  
  /**
  * Check to see whether the form is ready to submit, since all of it's addresses are validating
  * @method isValidReadyToSubmit
  */
  function isValidReadyToSubmit(){
    $.logEvent('[ao.addressLookup.isValidReadyToSubmit]');
    
    var addressLookupObj = $('.address-lookup');
    
    if(addressLookupObj.hasClass('invalid')){
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'disable'});
      
      // Enable or disable the add another address button, depending on whether 36 months worth of addresses has been provided
      addAnotherAddressButton({mode: 'enable'});
    }
    else{
      // Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
      submitButton({mode: 'enable'});
    
      /*
      var proceed = confirm('3 years of addresses have been provided\n\nSubmit data?');
      if(proceed){
        alert('SUBMIT');
      }
      */
    }
  }
  
  /**
  * Based on the address details provided, locate the oldest month and year value provided and set data attributes on the root address DOM wrapper element
  * @method updateOldestAddressDates
  * @param {STRING} resetOrContinue Whether the oldest dates are being updated from a reset of an address or a new address being added. If from a reset, get the second addresses dates in the form, if from a new address, get the first addresses dates in the form
  */
  function updateOldestAddressDates(obj){
    $.logEvent('[ao.addressLookup.updateOldestAddressDates]: ' + $.logJSONObj(obj));
        
    // Check the last address in the stack to obtain the oldest month and year values provided
    var addressLookupWrapperObj = $('.address-lookup');
    var resetOrContinueAddressIndex = obj.resetOrContinue === 'reset' ? 1 : 0;
    var oldestAddressObj = $('.address:eq(' + resetOrContinueAddressIndex + ')',addressLookupWrapperObj);   
    var oldestMonth = 0;
    var oldestYear = 0;
    var months = 0;
    
    addressLookupWrapperObj.attr('data-total-months',0);
    
    if($('.date-moved-in',oldestAddressObj).size() > 0){
      var currentMonth = (new Date).getMonth();
      var currentYear = (new Date).getFullYear();
      var monthNow = new Date(currentYear,currentMonth,01);
      
      var providedMonth = $('.date-moved-in SELECT:eq(0) OPTION:selected',oldestAddressObj).val()-1;
      var providedYear = $('.date-moved-in SELECT:eq(1) OPTION:selected',oldestAddressObj).val();
      var monthSelected = new Date(providedYear,providedMonth,01);
    
      oldestMonth = providedMonth;
      oldestYear = providedYear;
      
      var months = monthsBetweenDates({
        monthNow: monthNow,
        monthSelected: monthSelected
      });
    }
    
    // Update the months submitted so far
    totalAddressMonths({months: months});
    
    // Check to see whether 3 years worth (36 months) of addresses has been provided, taking into account the most recent addition
    checkAddressMonthsTotal();
    
    $.logEvent('[ao.addressLookup.updateOldestAddressDates]: provided (M/Y): ' + providedMonth + '/' + providedYear + '\n\ncurrent (M/Y): ' + currentMonth + '/' + currentYear + '\n\nmonthNow: ' + monthNow + '\monthSelected: ' + monthSelected + ',\nmonths between: ' + months);
  
    // Set as data attributes the oldest month and year values supplied by the user, to ensure overlaps can be avoided when adding subsequent addresses
    oldestDatesUptoNow({
      oldestMonth: oldestMonth,
      oldestYear: oldestYear
    });
  }
  
  /**
  * Set as data attributes the oldest month and year values supplied by the user, to ensure overlaps can be avoided when adding subsequent addresses
  * @method oldestDatesUptoNow
  * @param {INTEGER} oldestMonth The month value provided in the oldest address
  * @param {INTEGER} oldestYear The year value provided in the oldest address
  */
  function oldestDatesUptoNow(obj){
    $.logEvent('[ao.addressLookup.oldestDatesUptoNow]: ' + $.logJSONObj(obj));
    
    $('.address-lookup')
      .attr({
        'data-oldest-month': obj.oldestMonth,
        'data-oldest-year': obj.oldestYear
      });
  }
  
  /**
  * Update the months submitted so far
  * @method totalAddressMonths
  * @param {INTEGER} months The total number of months dates have so far been provided for
  */
  function totalAddressMonths(obj){
    $.logEvent('[ao.addressLookup.totalAddressMonths]: ' + $.logJSONObj(obj));
    
    var addressLookupWrapperObj = $('.address-lookup');
    addressLookupWrapperObj
      .find('.total-months')
        .text('Total months: ' + obj.months)
      .end()
      .attr('data-total-months',obj.months)
      .removeClass('invalid valid');
  } 
      
  /**
  * Check to see whether 3 years worth (36 months) of addresses has been provided, taking into account the most recent addition
  * @method checkAddressMonthsTotal
  */
  function checkAddressMonthsTotal(){
    $.logEvent('[ao.addressLookup.checkAddressMonthsTotal]');
    
    var addressLookupObj = $('.address-lookup');
    var totalMonths = parseInt(addressLookupObj.attr('data-total-months'));
    
    $('.total-months',addressLookupObj).text('Total months: ' + totalMonths);
    
    addressLookupObj
      .IF(totalMonths >= 36)
        .removeClass('invalid')
        .addClass('valid')
      .ELSE()
        .removeClass('valid')
        .addClass('invalid')
      .ENDIF()
      
    // If 0 months information has been provided, do not provide the invalid styling
    if(totalMonths === 0){
      addressLookupObj.removeClass('invalid');
    }
  }
  
  /**
  * How many months are there between the current month and the month provided
  * @method monthsBetweenDates
  * @param {DATE} monthNow The current month number (zero-base indexed)
  * @param {DATE} monthSelected The month selected by the user (zero-base indexed)
  * @return {INTEGER} The number of months between the 2 provided dates
  */
  function monthsBetweenDates(obj){
    $.logEvent('[ao.addressLookup.monthsBetweenDates]: ' + $.logJSONObj(obj));
        
    var months;
    months = (obj.monthSelected.getFullYear() - obj.monthNow.getFullYear()) * 12;
    months -= obj.monthNow.getMonth() + 1;
    months += obj.monthSelected.getMonth();
    return Math.abs(months);
  }
      
  /**
  * Add the default country list form element for an abroad address type
  * @method attachAbroadCountryListSelection
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */
  function attachAbroadCountryListSelection(obj){
    $.logEvent('[ao.addressLookup.attachAbroadCountryListSelection]: ' + $.logJSONObj(obj));
        
    $.ajax({
      dataType: 'json',
      success: function(data){
        // Build a list of countries which an address can be provided for
        buildCountryList({
          context: obj.context,
          countries: data.countries
        });
      },
      type: 'get',
      url: ao.configuration.addressLookup.apiUrls.countryList
    }); 
  }
  
  /**
  * Build a list of countries which an address can be provided for
  * @method buildCountryList
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  * @param {OBJECT} countries The JSON data for the list of acceptable countries
  */
  function buildCountryList(obj){
    $.logEvent('[ao.addressLookup.buildCountryList]: ' + $.logJSONObj(obj));
    
    var addressIdPrefix = obj.context.attr('id');
        
    // Loop through all countries, and build the country list with all countries from the JSON data provided
    $('<div />')
      .append(
        $('<label />')
          .attr('for',addressIdPrefix + '-country-list')
          .text('Select country of address: ')
      )
      .append(function(){
        var selectObj = $('<select />')
          .append(
            $('<option />')
              .text('Please select a country')
          )
          .attr('id',addressIdPrefix + '-country-list')
        
        $.each(obj.countries,function(index,countryObj){
          selectObj.append(
            $('<option />')
              .text(countryObj.displayLabel)
              .val(countryObj.countryCode)
          );
        });
        
        return selectObj;
      })
      .attr('class','form-field abroad-country-list')
      .insertAfter($('.location',obj.context));
  }

  /**
  * Add the default entry form element for a UK address type
  * @method attachUKPostcodeEntry
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */
  function attachUKPostcodeEntry(obj){
    $.logEvent('[ao.addressLookup.attachUKPostcodeEntry]: ' + $.logJSONObj(obj));
    
    var addressIdPrefix = obj.context.attr('id');
    
    $('<div />')
      .append(
        $('<label />')
          .attr('for',addressIdPrefix + '-postcode-entry')
          .text('Enter postcode: ')
      )
      .append(
        $('<input />')
          .attr({
            'data-postcode-entry': '',
            id: addressIdPrefix + '-postcode-entry',
            type: 'text'
          })
          .val('E141AB')
      )
      .append(
        $('<input />')
          .attr({
            'data-lookup-postcode': '',
            id: 'postcode-search',
            type: 'button'
          })
          .val('Search')
      )
      .attr('class','form-field postcode-entry')
      .insertAfter($('.location',obj.context))
  }
    
  /**
  * Perform an AJAX request to locate the fields for the country type the address belongs to
  * @method lookupCountryManualEntryFields
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  * @param {STRING} countryCode The 2 digit country code, required as a filter for the AJAX request to specify the country the current address is being entered for
  */
  function lookupCountryManualEntryFields(obj){
    $.logEvent('[ao.addressLookup.lookupCountryManualEntryFields]: ' + $.logJSONObj(obj));
    
    $.ajax({
      dataType: 'json',
      success: function(data){
        // Add the default entry fields for the current country
        buildTextInputFields({
          context: obj.context,
          data: data
        });
        
        // Since an address has been selected manually/is being entered manually, attach a generic form element for Residential Status, Date Moved In     
        attachGenericRequirements({context: obj.context});
      },
      type: 'get',
      url: ao.configuration.addressLookup.apiUrls.countrySpecificFieldsPrefix + obj.countryCode + '.json'
    });
  }

  /**
  * Since an address has been selected manually/is being entered manually, attach a generic form element for Residential Status, Date Moved In      
  * @method attachGenericRequirements
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */    
  function attachGenericRequirements(obj){
    $.logEvent('[ao.addressLookup.attachGenericRequirements]: ' + $.logJSONObj(obj));
    
    // Since an address has been selected manually/is being entered manually, attach a generic form element for Residential Status
    attachResidentialStatus({context: obj.context});
    
    // Since an address has been selected manually/is being entered manually, attach a generic form element for Date moved in
    attachDateMovedIn({context: obj.context});
  }
    
  /**
  * Since an address has been selected manually/is being entered manually, attach a generic form element for Residential status
  * @method attachResidentialStatus
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */
  function attachResidentialStatus(obj){
    $.logEvent('[ao.addressLookup.attachResidentialStatus]: ' + $.logJSONObj(obj));
    
    var addressIdPrefix = obj.context.attr('id');
    
    $('<div />')
      .append(
        $('<label />')
          .attr({
            'class': 'mandatory',
            'for': addressIdPrefix + '-' + 'residentialStatus'
          })
          .html('Residential status&nbsp;*')
      )
      .append(
        $('<select />')
          .append($('<option />').attr('value','').text('Please select:'))
          .append($('<option />').attr('value','option1').text('Option 1').attr('selected','selected'))
          .append($('<option />').attr('value','option2').text('Option 2'))
          .attr({
            'id': addressIdPrefix + '-' + 'residentialStatus',
            name: addressIdPrefix + '-' + 'residentialStatus',
            required: ''
          })
      )
      .attr({
        'class': 'form-field',
        'data-manual-entry': true
      })
      .appendTo(obj.context)
  }
  
  /**
  * Since an address has been selected manually/is being entered manually, attach a generic form element for Date moved in
  * @method attachDateMovedIn
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */
  function attachDateMovedIn(obj){
    $.logEvent('[ao.addressLookup.attachDateMovedIn]: ' + $.logJSONObj(obj));
    
    var addressIdPrefix = obj.context.attr('id');
    var currentYear = (new Date).getFullYear();
    var currentMonth = (new Date).getMonth()+1;
    var threeYearsAgo = currentYear-3;
    
    $('<div />')
      .append(
        $('<label />')
          .attr({
            'class': 'mandatory',
            'for': addressIdPrefix + '-' + 'month'
          })
          .html('Date Moved In (months)&nbsp;*')
      )
      .append(function(){
        // Months
        var selectObj = $('<select />')
          .attr({
            id: addressIdPrefix + '-' + 'month',
            name: addressIdPrefix + '-' + 'month',
            title: 'Month required',
            required: ''
          });
          
        selectObj.append($('<option />').text('Month').val('').attr('selected','selected'));
        
        for(var monthIndex=0; monthIndex<=11; monthIndex++){
          selectObj
            .append(
              $('<option />')
                .text(((monthIndex+1) < 10 ? '0' : '') + (monthIndex+1))
                .val(((monthIndex+1) < 10 ? '0' : '') + (monthIndex+1))
                .attr('selected','selected')
            )
        }
        
        return selectObj;
      })
      .append(function(){
        // Years
        var selectObj = $('<select />')
          .attr({
            id: addressIdPrefix + '-' + 'year',
            name: addressIdPrefix + '-' + 'year',
            title: 'Year required',
            required: ''
          });       
        
        for(var yearIndex=threeYearsAgo; yearIndex<=currentYear; yearIndex++){
          selectObj
            .prepend(
              $('<option />')
                .text(yearIndex)
                .val(yearIndex)
                .attr('selected','selected')
            )
        }
        
        selectObj.prepend($('<option />').text('Year').val(''))// .attr('selected','selected'));
        
        return selectObj;
      })
      .attr({
        'class': 'form-field date-moved-in',
        'data-manual-entry': true
      })
      .appendTo(obj.context)
  }
  
  /**
  * Build a collection of form elements (text inputs)
  * @method buildTextInputFields
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  * @param {OBJECT} data The JSON data containing the information for the fields to insert for the current country type, as well as information about mandatory requirements for each individual field
  */  
  function buildTextInputFields(obj){
    $.logEvent('[ao.addressLookup.buildTextInputFields]: ' + $.logJSONObj(obj));
    
    var addressIdPrefix = obj.context.attr('id');
    var labelText;
    
    $.each(obj.data.fields,function(index,addressObj){
      labelText = sentenceCapitalize(addressObj.type) + ' (' + obj.data.country.toUpperCase() + ')';
      
      if(addressObj.mandatory){
        labelText += '&nbsp;*';
      }
      
      $('<div />')
        .append(
          $('<label />')
            .attr('for',addressIdPrefix + '-' + addressObj.type)
            .html(labelText)
            .IF(addressObj.mandatory)
              .addClass('mandatory')
            .ENDIF()
        )
        .append(
          $('<input />')
            .attr({
              id: addressIdPrefix + '-' + addressObj.type,
              name: addressIdPrefix + '-' + addressObj.type,
              type: 'text'
            })
            .IF(addressObj.mandatory)
              .attr('required','')
            .ENDIF()
        )
        .attr({
          'class':'form-field',
          'data-manual-entry': true
        })
        .appendTo(obj.context)
    });
  }
  
  /**
  * Sentence capitalize labels based on the JSON property node name
  * @method sentenceCapitalize
  * @param {STRING} input The JSON property node name to convert into sentence capitalization
  * @return {STRING} The converted JSON property node in sentence capitilization
  */
  function sentenceCapitalize(input){
    var replaced = input.replace(/[a-z][A-Z]/g,function(str,offset){
      return str[0] + ' ' + str[1].toLowerCase();
    });
    
    return replaced.substr(0,1).toUpperCase() + replaced.substr(1,replaced.length-1).toLowerCase();
  }
  
  /**
  * Auto-fill in the address fields based on an address having been selected
  * @method addressSelectionBuildAndPopulate
  * @param {OBJECT} addressObj An object of properties containing the different elements to make up the entire address
  * @param {OBJECT} context The containing address lookup wrapper DOM element
  */
  function addressSelectionBuildAndPopulate(obj){
    $.logEvent('[ao.addressLookup.addressSelectionBuildAndPopulate]: ' + $.logJSONObj(obj));
    
    // Remove all previous manual entry fields, for previous selections
    $('[data-manual-entry]',obj.context).remove();
    
    var addressIdPrefix = obj.context.attr('id');
    var labelText;
    
    $.each(obj.addressObj.data(), function(key,value){
      labelText = sentenceCapitalize(key);
      
      $('<div />')
        .append(
          $('<label />')
            .attr('for',addressIdPrefix + '-' + labelText)
            .html(labelText)
        )
        .append(
          $('<input />')
            .attr({
              id: addressIdPrefix + '-' + labelText,
              readonly: 'readonly',
              type: 'text'
            })
            .val(value)
        )
        .attr({
          'class':'form-field',
          'data-manual-entry': true
        })
        .appendTo(obj.context)
    });
    
    // Since an address has been selected manually/is being entered manually, attach a generic form element for Residential Status, Date Moved In     
    attachGenericRequirements({context: obj.context});
  }
  
  /**
  * Lookup a postal address, and return the available addresses
  * @method lookupPostalAddressViaPostcode
  * @param {FUNCTION} callback The callback function to execute
  * @param {OBJECT} context The postcode textbox which the address was provided from
  * @param {STRING} postcode The postcode to find the addresses for
  */
  function lookupPostalAddressViaPostcode(obj){
    $.logEvent('[ao.addressLookup.lookupPostalAddressViaPostcode]: ' + $.logJSONObj(obj));
    
    $.ajax({
      dataType: 'json',
      success: function(data){
        // Add all available addresses for the provided postcode into a textarea
        obj.callback({
          context: obj.context,
          data: data.addresses
        });
      },
      type: 'get',
      url: ao.configuration.addressLookup.apiUrls.postcode + '?postcode=' + obj.postcode
    }); 
  }
  
  /**
  * Add all available addresses for the provided postcode into a textarea
  * @method processAvailableAddresses
  * @param {OBJECT} data The addresses available for the postcode provided
  * @param {OBJECT} context The postcode textbox which the address was provided from
  */  
  function processAvailableAddresses(obj){
    $.logEvent('[ao.addressLookup.processAvailableAddresses]: ' + $.logJSONObj(obj));
    
    var availableAddresses = $('<div />')
      .append(
        $('<label />')
          .text('Please select address')
      )
      .append(function(){
        var selectObj = $('<select />').attr('size',5);
        var addressDomObj;
        
        $.each(obj.data,function(dataIndex,dataObj){
          var address = '';         
          addressDomObj = $('<option />');
          
          $.each(dataObj,function(addressKey,addressObj){
            address += ', ' + addressObj;

            // Set data attributes, so that when an address is selected, it will auto-fill in the fields
            addressDomObj.data(addressKey,addressObj);
          });
          
          // Remove the trail
          address = address.substr(2,address.length-2);
          
          addressDomObj.text(address);
          selectObj.append(addressDomObj);
        });
        
        return selectObj;
      })
      .attr('class','form-field available-addresses')
    
    availableAddresses.appendTo(obj.context);
    
    // Add the link for the scenario where a user can't find their address
    $('<a />')
      .attr({
        'class':'cant-find-address',
        href:'#'
      })
      .text('Can\'t find your address?')
      .insertAfter(availableAddresses);
  }
  
  /**
  * Enable or disable the 'Continue' submit button, depending on whether 36 months worth of addresses has been provided
  * @method submitButton
  * @param {STRING} mode Either 'enable' or 'disable' 
  */
  function submitButton(obj){
    $.logEvent('[ao.addressLookup.submitButton]: ' + $.logJSONObj(obj));
    
    $('.address-lookup .submit')
      .IF(obj.mode === 'enable')
        .removeAttr('disabled')
      .ELSE()
        .attr('disabled','disabled')
      .ENDIF()
  }
  
  /**
  * Enable or disable the add another address button, depending on whether 36 months worth of addresses has been provided
  * @method addAnotherAddressButton
  * @param {STRING} mode Either 'enable' or 'disable' 
  */
  function addAnotherAddressButton(obj){
    $.logEvent('[ao.addressLookup.addAnotherAddressButton]: ' + $.logJSONObj(obj));
    
    $('.address-lookup .add-address')
      .IF(obj.mode === 'enable')
        .removeAttr('disabled')
      .ELSE()
        .attr('disabled','disabled')
      .ENDIF()
  }
  
  /**
  * Attach the debug links to each unique address entry
  * @method attachDebugLinks
  */
  function attachDebugLinks(){
    $.logEvent('[ao.addressLookup.attachDebugLinks]');
    
    var addressLookupObj;
    var addressesTotal = $('.address-lookup .address').size();
    
    $('.address-lookup .address').each(function(index){
      addressLookupObj = $(this);
      
      if(addressLookupObj.has('.debug').size() === 0 && index < (addressesTotal-1)){
        $('<ul />')
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr({
                    'data-toggle-edit-state': '',
                    href: '#'
                  })
                  .text('Toggle edit state')
              )
          )
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr({
                    'data-reset-address': '',
                    href: '#'
                  })
                  .text('Reset address')
              )
          )
          .append(
            $('<li />')
              .append(
                $('<a />')
                  .attr({
                    'data-delete-address': '',
                    href: '#'
                  })
                  .text('Delete address')
              )
          )
          .attr('class','debug')
          .insertAfter($('LEGEND',addressLookupObj))
      }
    });
  }
  
  return {
    init: init,
    processCompleteAddress: processCompleteAddress
  }
}());