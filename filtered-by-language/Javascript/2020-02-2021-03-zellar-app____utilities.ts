import * as localStorage from "local-storage";
import { useSelector } from "react-redux";

// Components
import { selectors } from "../../store";

// Configuration
import { apiEndpoints, DEBUG_LOGGING } from "../configuration";

// Types
import {
  TAPIReplaceKeys,
  TConstructAPIEndpoint,
  TGetLocalStorage,
  TJsonSyntaxHighlight,
  TLog,
  TParseURLParams,
  TRemoveLocalStorage,
  TSetAuthorizationHeader,
  TSetLocalStorage,
  TSortObjectAlphabetically,
  TUpdateDisabledLoadingState
} from "./utilities.types";

// Utilities
import axiosProfile from "./axios/profile";
import axiosRegistration from "./axios/registration";
import axiosSignin from "./axios/signin";

/**
 * Replace specific placeholder keys within an API address to allow dynamic injection
 * @function apiReplaceKeys
 * @param {string} apiOriginalPath - The path to replace strings within
 * @param {array} keys - An array of keys which are to be replaced
 * @returns - The converted url path with keys converted
 * Example
 * FROM: https://zellar-quotes-api.azurewebsites.net/companies/{SEARCH}
 * TO: https://zellar-quotes-api.azurewebsites.net/companies/zellar
 */
export const apiReplaceKeys: TAPIReplaceKeys = (apiOriginalPath, keys) => {
  return keys
    .map((item) => {
      return apiOriginalPath.replace(item.key, item.value);
    })
    .join();
};

/**
 * Construct an API endpoint
 * @function constructAPIEndpoint
 * @param {string} section - The section of the application eg: "registration", "signin"
 * @param {string} apiReference - The specific endpoint reference key in the central application configuration file
 * @returns {string} object.url - The url of the endpoint
 */
export const constructAPIEndpoint: TConstructAPIEndpoint = ({ section, apiReference }) => {
  const apiPrefix = useSelector(selectors.global.getAPIType);
  const url = apiEndpoints.urlSuffixes[section][apiReference];

  return `${apiEndpoints.urlPrefixes[section][apiPrefix]}${url}`;
};

/**
 * Get a value out of localStorage based on a provided key
 * @function getLocalStorage
 * @param {string} key - The name of the key to retrieve the value for
 * @returns {string} - The value for the key provided within localStorage
 */
export const getLocalStorage: TGetLocalStorage = (key) => {
  // If the app is rendering via ssr, provide a placeholder token in order to let the API handle the authentication for potentially protected resources
  return localStorage.get(key);
};

/**
 * Syntax highlight limitless levels of nested JSON objects
 * @function jsonSyntaxHighlight
 * @param {string} string - The stringified JSON data object
 * @returns {string} The formatted json object
 */
export const jsonSyntaxHighlight: TJsonSyntaxHighlight = (json) => {
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function(match) {
      let className = "number";

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          className = "key";
        } else {
          className = "string";
        }
      } else if (/true|false/.test(match)) {
        className = "boolean";
      } else if (/null/.test(match)) {
        className = "null";
      }

      return `<span class="${className}">${match}</span>`;
    }
  );
};

/**
 * Log messages out to the console, based on whether the feature is enabled or not
 * @function log
 * @param {string} message - The message(s) to log to the console
 */
export const log: TLog = (...args) => {
  if (DEBUG_LOGGING) {
    console.log(...args);
  }
};

/**
 * Logout a user, removing their persisted token
 * @function logoutUser
 */
export const logoutUser = () => {
  // Remove the token localStorage entries since a user has logged out
  removeLocalStorage("token");
  removeLocalStorage("tokenType");

  // Update Axios Authorization header for all requests
  axiosRegistration.removeAuthorizationHeader();
  axiosSignin.removeAuthorizationHeader();
};

/**
 * Parse the url parameters of a querystring
 * @param {string} - The querystring of the current url eg: ?referrer=/url&status=true
 * @returns {object} - An object in the form of {referrer: "/url", status: true}
 */
export const parseURLParams: TParseURLParams = (querystring) => {
  const params = {};
  const cleanQueryString = querystring.replace("?", "").split("&");

  cleanQueryString.map((queryFragment) => {
    const [key, value] = queryFragment.split("=");
    params[key] = decodeURIComponent(value);
  });

  return params;
};

/**
 * Remove a value out of localStorage based on a provided key
 * @function removeLocalStorage
 * @param {string} key - The name of the key to retrieve the value for
 */
export const removeLocalStorage: TRemoveLocalStorage = (key) => {
  localStorage.remove(key);
};

/**
 * Update the Authorization headers for all Axios instances that need to send it to the API
 * @function setAuthorizationHeader
 * @param {string} tokenType - Always "Bearer"
 * @param {string} token - The token the API requires in order to authenticate a user
 */
export const setAuthorizationHeader: TSetAuthorizationHeader = (tokenType, token) => {
  axiosProfile.setAuthorizationHeader(tokenType, token);
  axiosRegistration.setAuthorizationHeader(tokenType, token);
  axiosSignin.setAuthorizationHeader(tokenType, token);
};

/**
 * Set a key value pair within localStorage
 * @function setLocalStorage
 * @param {string} key - The name of the key to use in localStorage
 * @param {string} value - The value to set inside the key within localStorage
 */
export const setLocalStorage: TSetLocalStorage = (key, value) => {
  localStorage.set(key, value);
};

/**
 * Order JSON objects alphabetically by key name
 * @function sortObjectAlphabetically
 * @param {object} - The input object in (potentially) unordered pattern
 * @returns {object} - The re-ordered object with keys in alphabetical order
 */
export const sortObjectAlphabetically: TSortObjectAlphabetically = (obj) => {
  const ordered = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => (ordered[key] = obj[key]));

  return ordered;
};

/**
 * Toggle the disabled/loading states of independent elements (links or buttons)
 * @function updateDisabledLoadingState
 * @param {array} settings - The elements on page to update the state for
 * @param {string} settings.reference - Which element to update
 * @param {string} settings.type - Either "disabled" || "loading"
 * @param {boolean} settings.value - Whether to enable or disable a feature
 * @param {object} state - The existing component state object Re: button states
 * @returns {object} - A new state object for all elements on a specific page
 */
export const updateDisabledLoadingState: TUpdateDisabledLoadingState = (settings, state) => {
  let elementToChange;
  let newState = {
    ...state
  };

  settings.map((setting) => {
    const { reference, type, value } = setting;

    // Which element is being toggled?
    elementToChange = {
      ...state[reference]
    };

    // Update the property specified to the value specified
    elementToChange![type] = value;

    // Additionally:
    // ----
    // Loading
    if (type === "loading") {
      if (value) {
        // If an element is entering loading it MUST be disabled
        elementToChange.disabled = true;
      } else {
        // If an element is leaving loading it MUST be enabled
        elementToChange.disabled = false;
      }
    }

    newState = {
      ...newState,
      [reference]: elementToChange
    };
  });

  return newState;
};
