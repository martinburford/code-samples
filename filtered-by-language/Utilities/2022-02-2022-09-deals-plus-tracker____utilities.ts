// NPM imports
import inRange from "lodash.inrange";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { DateObject } from "react-multi-date-picker";

// Scripts
import { BREAKPOINTS } from "scripts/consts";

// Type imports
import { EColours } from "types/enums";
import {
  IBuildDataAttributes,
  TActivateButtonGroupItem,
  TActivateCheckbox,
  TCapitalize,
  TConvertDDMMYYYYStringToDateObject,
  TConvertValueToPercentageBanding,
  TFindSelectIndexByOption,
  TFormatCountryNameForFlagIconCode,
  TFormatHistoryItem,
  TGenerateDateObject,
  TGetIconColourForFileType,
  TGetUniqueColumnValues,
  TOnSubmitFormDebug,
  TResetButtonGroup,
  TResetCheckbox,
  TResolveFileExtensionToIconId,
  TSetCircleColour,
  TToCamelCase,
  TValidateNumberInput,
} from "scripts/utilities/types/index.types";

// Activate a specific radio button within a button group
// The reason for outsourcing this is because buttons are dynamically generated within a <ButtonGroup>, based on its props
// Refs are therefore not available when this functionality needs to be executed
export const activateButtonGroupItem: TActivateButtonGroupItem = (ref, identifier) => {
  const identifierFormatted = identifier.split(" ").join("-").toLowerCase();

  // Only auto-select a button IF pre-selection hasn't already taken place
  // This is because the click event handler activates AND de-activates when the element is clicked
  // For previously highlighted buttons, it shouldn't then be clicked again as it will be turned off
  if (ref.current.getAttribute("data-selected-button-index") === "-1") {
    const elementToClick = ref.current.querySelector(`[data-radio-value='${identifierFormatted}']`);

    // Don't process a selection IF there is no selection to perform (meaning the DOM element to click would not resolve)
    if (elementToClick) {
      (elementToClick as HTMLDivElement).click();
    }
  }
};

// Activate a custom checkbox due to the component being bespoke (despite using native <input type="checkbox>")
export const activateCheckbox: TActivateCheckbox = (ref, checked) => {
  if (checked) {
    ref.current.parentElement.click();
  }
};

// Lock document.body from scrolling, except for items with the attribute "body-scroll-lock-ignore", where scrolling is still permitted
export const bodyScrollLock = () => {
  disableBodyScroll(document.body, {
    allowTouchMove: (el) => {
      while (el && el !== document.body) {
        if (el.getAttribute("body-scroll-lock-ignore") !== null) {
          return true;
        }

        el = el.parentElement;
      }
    },
  });
};

// Release the lock on document.body scrolling
export const bodyScrollUnlock = () => {
  enableBodyScroll(document.body);
};

// Construct a data attributes object for a specific component instance
export const buildDataAttributes: IBuildDataAttributes = (componentId, dataAttributes) => {
  return {
    "data-component-id": componentId,
    "data-component-spacing": "m",
    ...dataAttributes,
  };
};

// Capitalize a string of text
export const capitalize: TCapitalize = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join("");

// Convert "DD/MM/YYYY" into new Date(year, month, day)
export const convertDDMMYYYYStringToDateObject: TConvertDDMMYYYYStringToDateObject = (date) => {
  const [day, month, year] = date.split("/");

  return new DateObject({ day: parseInt(day), month: parseInt(month), year: parseInt(year) });
};

// Translate a value of 1, 2 or 3 to a meaningful percentage banding
export const convertValueToPercentageBanding: TConvertValueToPercentageBanding = (id) => {
  switch (id) {
    case 1:
      return ">= 25% and < 50%";
    case 2:
      return ">= 50% and < 75%";
    case 3:
      return ">= 75%";
  }
};

// Based on a collection list (from a dropdown), find the index of an option in that collection which matches the textContent provided
export const findSelectIndexByOptionText: TFindSelectIndexByOption = (
  collection: HTMLSelectElement,
  toMatch: string
) => {
  // return Array.from(collection.options).find((option) => option.textContent === toMatch).index;
  return Array.from(collection.options).findIndex((option) => option.textContent === toMatch);
};

// Based on a collection list (from a dropdown), find the index of an option in that collection which matches the value provided
export const findSelectIndexByOptionValue: TFindSelectIndexByOption = (
  collection: HTMLSelectElement,
  toMatch: string
) => {
  const matchAgainst = toMatch === "" ? "" : toMatch;
  return Array.from(collection.options).findIndex((option) => option.value === matchAgainst);
};

// Convert a country name (eg: United Kingdom) into the related iconId (eg: unitedKingdom)
export const formatCountryNameForFlagIconCode: TFormatCountryNameForFlagIconCode = (country, fallback) => {
  // If the form element watch is undefined, return the fallback icon
  if(!country) return fallback;

  let countryFormatted = country.toLowerCase();

  if(country.indexOf(" ") > -1){
    const processFormat = countryFormatted.split(" ").reduce((previous, current) => {
      // First iteration
      if(previous.length === 0){
        return [...previous, current];
      }

      // Subsequent iterations
      return [...previous, capitalize(current)];
    }, []);

    return processFormat.join("");
  } else {
    return countryFormatted;
  }
}

// String replace specific matches in return for JSX elements
export const formatHistoryItem: TFormatHistoryItem = (strToConvert) => {
  return strToConvert.replaceAll("[", "<strong>").replaceAll("]", "</strong>");
};

// Convert a "dd/mm/yyyy" string date into a DateObject (for use within Datepickers)
export const generateDateObject: TGenerateDateObject = (dateAsDDMMYYYY) => {
  const [day, month, year] = dateAsDDMMYYYY.split("/");

  return new DateObject({ year: parseInt(year), month: parseInt(month), day: parseInt(day) });
};

// Query the window for the current breakpoint
export const getCurrentBreakpoint = () => {
  const windowWidth = window.outerWidth;
  const [mobileFrom, mobileTo] = BREAKPOINTS.mobile;
  const [tabletPortraitFrom, tabletPortraitTo] = BREAKPOINTS.tabletPortrait;

  if (inRange(windowWidth, mobileFrom, mobileTo)) {
    return "mobile";
  } else if (inRange(windowWidth, tabletPortraitFrom, tabletPortraitTo)) {
    return "tabletPortrait";
  } else if (windowWidth === BREAKPOINTS.tabletLandscape[0]) {
    return "tabletLandscape";
  }

  return "desktop";
};

// Identify the colour of an icon based on the filename extension
export const getIconColourForFileType: TGetIconColourForFileType = (filename) => {
  switch (filename.split(".").pop()) {
    case "docx":
      return EColours.PRIMARY;
    case "jpg":
    case "xlsx":
      return EColours.SUCCESS;
    case "pdf":
      return EColours.ERROR;
    default:
      return EColours.GRAY;
  }
};

// Find all unique values within a specific column of an active dataset (within AgGrid)
export const getUniqueColumnValues: TGetUniqueColumnValues = (columnId, dataset) => {
  const uniqueItems = [...new Set<string>(dataset.map((obj) => obj[columnId]))];
  return uniqueItems.map((uniqueItem) => uniqueItem);
};

// Merge any number of refs into a single one, so that:
export const mergeRefs = (...refs) => {
  const filteredRefs = refs.filter(Boolean);

  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 0) return filteredRefs[0];

  return (instance) => {
    for (const ref of filteredRefs) {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    }
  };
};

// Process the successful form submission
export const onSubmitFormDebug: TOnSubmitFormDebug = (data) => {
  let formattedDataObj = {};
  let debug = `**** ALL VALIDATION MET: DATA TO SUBMIT ****:`;

  Object.entries(data).forEach(([key, value]) => {
    if(key.indexOf("-add") > -1) {
      formattedDataObj[key.replace("-add", "")] = value; 
      return;
    }

    if(key.indexOf("-edit") > -1) {
      formattedDataObj[key.replace("-edit", "")] = value; 
      return;
    } 

    formattedDataObj[key] = value;
  });

  alert(`**** ALL VALIDATION MET: DATA TO SUBMIT ****:
  
${JSON.stringify(formattedDataObj, null, 4)}`);
};

// Reset the active state of any active buttons within a button group
export const resetButtonGroup: TResetButtonGroup = (ref) => {
  Array.from(ref.current.querySelectorAll("input")).forEach((input) => {
    if ((input as HTMLInputElement).checked) {
      (input.nextElementSibling as HTMLDivElement).click();
    }
  });
};

// Reset a custom checkbox
export const resetCheckbox: TResetCheckbox = (ref) => {
  if (ref.current.checked) {
    ref.current.parentElement.click();
  }
};

// Resolve a file extension type to a valid icon id
export const resolveFileExtensionToIconId: TResolveFileExtensionToIconId = (fileExtension, showDefaultIcon = false) => {
  let iconId = "document";

  if(!showDefaultIcon){
    switch(fileExtension){
      case "pdf":
        iconId = "pdf";
        break;
      case "xls":
        iconId = "excel";
        break;
    }
  }

  return iconId;
}

// Identify the circle colour based on the status type
export const setCircleColour: TSetCircleColour = (status) => {
  switch (status) {
    case "active":
      return EColours.SUCCESS;
    case "inactive":
    case "liquidated":
    case "sold":
      return EColours.ERROR;
    case "dormant":
      return EColours.WARNING;
  }
};

// Convert a string to camelCase format (eg: Deal name => dealName)
export const toCamelCase: TToCamelCase = (str) => {
  const a = str.toLowerCase().replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
  return a.substring(0, 1).toLowerCase() + a.substring(1);
};

/**
 * Check whether the value entered is a number or not
 * @function validateNumberInput
 * @param {event} event - The event from the keypress in the textfield
 * @returns {boolean} - Whether or not the value entered was a number or not
 */
export const validateNumberInput: TValidateNumberInput = (event) => {
  const allowedKeyCodes = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "ArrowLeft",
    ".",
    "ArrowRight",
    "Backspace",
    "Delete",
    "Tab",
  ];
  return allowedKeyCodes.includes(event.key);
};