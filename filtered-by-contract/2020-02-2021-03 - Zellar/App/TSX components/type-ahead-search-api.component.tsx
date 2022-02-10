import Classnames from "classnames/bind";
import debounce from "lodash/debounce";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";

// Components
import { actions, selectors } from "../../../../../store";
import AxiosErrorHandler from "../../axios-error-handler";
import Spinner from "../../spinner";

// Configuration
import { applicationURLs, FORM_FIELD_DEBOUNCE } from "../../../../configuration";

// Styles
import styles from "./type-ahead-search-api.module.scss";
import textboxSyles from "../textbox/textbox.module.scss";

// Types
import {
  ICustomHeaders,
  INoMatchesFound,
  ITypeAheadSearchAPI,
  IUseState,
  TFetch,
  TSearchTerm
} from "./type-ahead-search-api.types";

// Utilities
import { apiReplaceKeys, constructAPIEndpoint, getLocalStorage, log, setLocalStorage } from "../../../../utilities";
import axios from "../../../../utilities/axios/registration";
import ListItems from "./type-ahead-search-api-list-items";
import ResultsList from "./type-ahead-search-api-results-list";

const NoMatchesFound: React.FC<INoMatchesFound> = ({ children, onClick }) => (
  <div data-selector="first-entry" onClick={onClick}>
    {children}
  </div>
);

export const TypeAheadSearchAPI: React.FC<ITypeAheadSearchAPI> = ({
  apiType,
  error,
  form,
  formLabel,
  history,
  input: { name },
  placeholder,
  required,
  touched
}) => {
  // Component state
  const [state, updateState] = useState<IUseState>({
    axiosError: {
      apiReferrer: "",
      pageReferrer: "",
      status: -1
    },
    currentValue: "",
    data: [],
    isLoading: false,
    matches: 0,
    resultsVisible: false
  });

  // Redux data
  const addressManualFull = useSelector(selectors.registration.getAddressManualFull);
  const { typeahead: addressTypeahead } = useSelector(selectors.registration.getAddress);
  const { name: companyName } = useSelector(selectors.registration.getCompany);

  // Pre-populate the display value of the Company Name in line with the contents from Redux (on page load ONLY)
  useEffect(() => {
    let inputFieldValue;
    if (name === "company-name") inputFieldValue = companyName;

    // Determine whether a previously entered address was a manual entry or a typeahead selection
    if (name === "address-lookup") {
      inputFieldValue = addressTypeahead !== "" ? addressTypeahead : addressManualFull;
    }

    // Update the form in order to perform pre-population
    if (inputFieldValue) {
      form.change("" + name, inputFieldValue);
      inputRef.current!.value = inputFieldValue;
    }
  }, [addressManualFull, addressTypeahead, companyName]);

  // LocalStorage
  const anonymousTrackingId = getLocalStorage("X-Anonymous-UserTracking");

  // De-structured objects
  const {
    axiosError: { apiReferrer, pageReferrer, status },
    data: results,
    isLoading,
    matches,
    resultsVisible,
    currentValue
  } = state;
  const { instance: axiosRegistration } = axios;
  const { registration } = applicationURLs;

  // Component outermost refernce
  const componentRef = useRef<HTMLDivElement>(null);

  // Input field reference
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroller reference (for scroll resetting)
  const resultsScrollerRef = useRef<HTMLDivElement>(null);

  // Dispatch actions to Redux
  const dispatch = useDispatch();

  // Lookup the API endpoint
  const apiEndpoint = constructAPIEndpoint({
    section: "registration",
    apiReference: apiType
  });

  let apiEndpointFormatted;

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = Classnames.bind(styles);
  const classnames = cx({
    [formLabel]: true,
    "is-loading": isLoading,
    "no-matches": matches === 0,
    "type-ahead-search-api": true
  });

  const resultsClassnames = cx({
    results: true,
    visible: resultsVisible
  });

  const scrollerClassnames = cx({
    [formLabel]: true,
    scroller: true
  });

  // Custom data attributes to flag multiple states of the form element
  const formItemDataAttributes = {
    "data-form-item": true,
    "data-form-item-error": touched && error,
    "data-form-item-required": required,
    "data-selector": "typeahead"
  };

  // Should a spinner be shown?
  // Yes if the API is fetching data (state.isLoading === true)
  const isLoadingElem = isLoading ? (
    <Spinner color="stone" dataAttributes={{ "data-selector": "spinner" }} size="medium" />
  ) : null;

  /**
   * @function onSearchHandler
   * Update the component state based on whether a value has been provided or not, in order to perform a search
   * @param {event} event - The event which triggered a new search
   **/
  const onSearchHandler = () => {
    const currentValue = inputRef.current!.value;

    // Perform ALL search terms, even empty ones
    // This will catch the edge-case where a term was previously entered and the user removed all characters
    searchTerm(currentValue);
  };

  /**
   * @function searchTerm
   * Debounced action to perform upon a search term having been entered
   * @param {string} value - The term being searched for
   */
  const searchTerm: TSearchTerm = debounce((value) => {
    log(`[components/type-ahead-search-api.component.tsx]: Searched for term: ${value}`);

    // Save to Redux
    // It's important to do this here (for company search), as the user shouldn't be forced to have to select a company
    if (name === "company-name") {
      dispatch(actions.registration.saveCompany({ companyName: value }));
    }

    // If the term is empty after a debounce, the field has been cleared
    // Reset all stored data and do not execute an API call
    if (value === "") {
      onResetHandler();
      return false;
    }

    // Switch the component to "isLoading"
    updateState({
      ...state,
      isLoading: true
    });

    const encodedValue = encodeURIComponent(value);

    // If there is a valid value, search the API
    if (encodedValue) {
      fetch(encodedValue, (data) => {
        // Store the found matches within components state
        updateState({
          ...state,
          currentValue: value,
          data,
          isLoading: false,
          matches: data.length,
          resultsVisible: true
        });
      });
    } else {
      // If there is an empty value, reset the loading state
      updateState({
        ...state,
        isLoading: false
      });
    }
  }, FORM_FIELD_DEBOUNCE); // FORM_FIELD_DEBOUNCE

  /**
   * @function fetch
   * Debounced routine to retrieve API data
   * @param {string} value - The term being searched for
   * @param {function} callback - The callback which receives the API response and processes the results
   */
  const fetch: TFetch = (value, callback) => {
    // Inject the necessary dynamic values into the necessary API endpoint URL
    apiEndpointFormatted = apiReplaceKeys(apiEndpoint, [
      {
        key: "{SEARCH}",
        value
      }
    ]);

    log(
      `[components/type-ahead-search-api.component.tsx]: Type: ${apiType}, apiEndpointFormatted: ${apiEndpointFormatted}`
    );

    // Do any custom headers need to be provided to the API?
    const customHeaders: ICustomHeaders = {};
    switch (apiType) {
      case "addressLookup":
        customHeaders["X-Anonymous-UserTracking"] = anonymousTrackingId;
        break;
    }

    // Perform API lookup
    axiosRegistration
      .get(apiEndpointFormatted, {
        headers: customHeaders,
        withCredentials: true
      })
      .then((xhr) => {
        const {
          data: { value: results },
          headers
        } = xhr;

        // Since a 404 for this component still needs to do something in the UI, pass the 2xx results through a centralized function
        processAPIResponse({
          callback,
          headers,
          results
        });
      })
      .catch((error) => {
        log(
          `[components/type-ahead-search-api.component.tsx]: Type: ${apiType}, API (ERROR) response, url=${apiEndpointFormatted}`,
          error.response
        );

        // Possible API error responses
        // 404 => company OR address not found
        // 440 => expiry (address lookup only)
        // 500 => server error

        const { status: errorStatus } = error.response;

        switch (error.response.status) {
          // Since a 404 for this component still needs to do something in the UI, pass the 2xx results through a centralized function
          case 404:
            processAPIResponse({
              callback,
              headers: [],
              results: []
            });

            break;
          default:
            log("[components/type-ahead-search-api.component.tsx]: Generic error");

            // Store the error and generically process it via <AxiosErrorHandler />
            updateState({
              ...state,
              axiosError: {
                apiReferrer: apiEndpointFormatted,
                pageReferrer: "registration.addressLookup",
                status: errorStatus
              }
            });
        }
      });
  };

  /**
   * @function processAPIResponse
   * Since a 404 for this component still needs to do something in the UI, process both 2xx and 404 responses
   * @param {}
   **/
  const processAPIResponse = ({ callback, headers, results }) => {
    log(
      `[components/type-ahead-search-api.component.tsx]: Type: ${apiType}, API (SUCCESS) response, url=${apiEndpointFormatted}, results:`,
      results
    );

    // Perform the necessary data construction via the utility function for the specific apiType
    const resultsList = ResultsList[apiType](results);

    log("[components/type-ahead-search-api.component.tsx]: resultsList", resultsList);

    callback(resultsList);

    // Check to see if any of the following headers are retrieved. If they are, handle them accordingly
    // X-Anonymous-usertracking
    const newAnonymousTrackingId = headers["x-anonymous-usertracking"];
    if (newAnonymousTrackingId) {
      log(
        `[components/type-ahead-search-api.component.tsx]: Type: ${apiType}, X-Anonymous-UserTracking received, set in localStorage, value:`,
        newAnonymousTrackingId
      );

      // Store the anonymous trackingId sent from the server within localStorage
      setLocalStorage("X-Anonymous-UserTracking", newAnonymousTrackingId);
    }
  };

  /**
   * @function outsideComponentClick
   * Perform an action when clicking outside of the specified component DOM element node
   * @param {ref} ref - The component reference
   */
  const outsideComponentClick = (ref) => {
    useEffect(() => {
      // Has the event been fired on an element outside the bounds of the components ref?
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          updateState({
            ...state,
            matches: currentValue !== "" ? 1 : 0,
            resultsVisible: false
          });
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    });
  };

  /**
   * @function onResetHandler
   * Called in a few scenarios when having to flush the current results set
   */
  const onResetHandler = () => {
    updateState({
      ...state,
      currentValue: "",
      data: [],
      isLoading: false,
      matches: 0,
      resultsVisible: false
    });

    // Save to Redux
    dispatch(
      actions.registration.addressSelection({
        addressId: "",
        typeahead: ""
      })
    );

    // ! The form field value MUST be reset whenever the resetHandler() is called
    // ! This is so that form validation logic will treat the field (correctly) as empty
    form.change(`${name}`, undefined);
  };

  /**
   * @function onFocusHandler
   * If focusing on the input field and there is a value already there, re-show the current results list
   */
  const onFocusHandler = () => {
    if (currentValue !== "") {
      updateState({
        ...state,
        matches: results.length,
        resultsVisible: true
      });
    }
  };

  // Register handlers (and the de-registration of them) via hooks
  outsideComponentClick(componentRef);

  // List out the current options for the search component
  const options = ListItems[apiType](dispatch, results, form, inputRef, state, updateState);

  return (
    <AxiosErrorHandler apiReferrer={apiReferrer} pageReferrer={pageReferrer} status={status}>
      <div {...formItemDataAttributes} ref={componentRef}>
        <div className={classnames}>
          <em className={styles.matches}>Matches: {matches}</em>
          <input
            className={textboxSyles.textbox}
            name={name}
            onChange={onSearchHandler}
            onFocus={onFocusHandler}
            placeholder={`${placeholder}${required ? " *" : ""}`}
            ref={inputRef}
            type="text"
          />
          {isLoadingElem}
          <div className={resultsClassnames}>
            {/* Custom first field for Company Name */}
            {apiType === "companyName" && currentValue != "" && (
              <NoMatchesFound
                onClick={() => {
                  // Hide the results list
                  updateState({
                    ...state,
                    matches: 1,
                    resultsVisible: false
                  });
                }}
              >
                <strong>{currentValue}</strong>
              </NoMatchesFound>
            )}
            {/* Custom first field for Address Lookup */}
            {apiType === "addressLookup" && currentValue != "" && (
              <NoMatchesFound
                onClick={() => {
                  // Save to Redux
                  dispatch(
                    actions.registration.addressSelection({
                      addressId: "",
                      typeahead: ""
                    })
                  );

                  history.push(registration.addressLookupConfirm);
                }}
              >
                <strong>Can't find your address? Click here.</strong>
              </NoMatchesFound>
            )}
            {currentValue != "" && (
              <div className={scrollerClassnames} ref={resultsScrollerRef}>
                {options.length > 0 && (
                  <ul className={styles["scroller-inner"]}>
                    {options.map((result, index) => (
                      <li key={index}>{result}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        {touched && error && <div data-form-error-message>{error}</div>}
      </div>
    </AxiosErrorHandler>
  );
};

export default withRouter(TypeAheadSearchAPI);
