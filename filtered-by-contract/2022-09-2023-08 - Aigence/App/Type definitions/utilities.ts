// NPM imports
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { differenceInCalendarDays, differenceInMonths, differenceInYears, eachWeekendOfInterval } from "date-fns";
import format from "date-fns/format";
import sortBy from "lodash.sortby";

// Scripts
import { LOCALE_STRING_OPTIONS } from "@aigence/scripts/consts";

// Types
import { DateObject } from "react-multi-date-picker";
import { EActionTypes } from "@aigence/types/enums";
import { IDynamicObject } from "@aigence/types/interfaces";
import {
  IBuildDataAttributes,
  TActivateCheckbox,
  TActivateRadioListItem,
  TApiActions,
  TButtonThemeFromActionType,
  TCalculateDaysBetweenDates,
  TCapitalize,
  TConvertDateToFriendlyFormat,
  TConvertYYYYMMDDStringToDateObject,
  TDateDiffInDays,
  TDateDiffInMonthsAndDays,
  TDaySuffix,
  TFetchFirstInitial,
  TFindSelectIndexByOption,
  TFormatEmployeeName,
  TGenerateFromAndToDate,
  TGenerateStartDate,
  TOnSubmitFormDebug,
  TRemoveFormDataIdPrefix,
  TRemoveNestedObjectProperty,
  TRenderAsCurrency,
  TResetCheckbox,
  TResetRadioListItem,
  TSortDataByStatus,
  TToggleDataTableSuffixRow,
  TUpdateCheckboxListSelectedItems,
  TValidateNumberInput,
} from "./types/index.types";

// Activate a custom checkbox due to the component being bespoke (despite using native <input type="checkbox>")
export const activateCheckbox: TActivateCheckbox = (ref, checked) => {
  if (checked) {
    ref.current.parentElement.click();
  }
};

// Activate a specific radio button within a radio list
export const activateRadioListItem: TActivateRadioListItem = (ref, value) => {
  const inputElem = ref.current.querySelector(`input[value="${value}"]`);

  if (inputElem) {
    (inputElem as HTMLInputElement).click();
  }
};

// Central methods for directing API calls
export const apiActions: TApiActions = {
  benefits: {
    "change-options": (id) => {
      alert(`[Benefits]: "Change benefit options": id=${id}`);
    },
  },
  expenses: {
    approve: (id) => {
      alert(`[Expenses]: "Approve": id=${id}`);
    },
    recall: (id) => {
      alert(`[Expenses]: "Recall": id=${id}`);
    },
    submit: (id) => {
      alert(`[Expenses]: "Submit": id=${id}`);
    },
  },
  leave: {
    approve(id) {
      alert(`[Leave]: "Approve leave": id=${id}`);
    },
  },
  payroll: {
    "review-and-run": (id) => {
      alert(`[Payroll]: "Review and run" id=${id}`);
    },
  },
  timesheets: {
    approve(id) {
      alert(`[Timesheet]: "Approve": id=${id}`);
    },
    archive(id) {
      alert(`[Timesheet]: "Archive": id=${id}`);
    },
    "cancel-request"(id) {
      alert(`[Timesheet]: "Cancel": id=${id}`);
    },
    delete(id) {
      alert(`[Timesheet]: "Delete": id=${id}`);
    },
    reject(id) {
      alert(`[Timesheet]: "Reject": id=${id}`);
    },
    submit(id) {
      alert(`[Timesheet]: "Submit": id=${id}`);
    },
  },
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

// Convert an action type to a tangible button theme
export const buttonThemeFromActionType: TButtonThemeFromActionType = (actionType) => {
  let buttonTheme;

  switch (actionType) {
    case EActionTypes.APPROVE:
    case EActionTypes.CHANGE_OPTIONS:
    case EActionTypes.COMPLETE:
    case EActionTypes.QUICK_APPROVE:
    case EActionTypes.QUICK_SUBMIT:
    case EActionTypes.REVIEW_AND_RUN:
    case EActionTypes.SUBMIT:
      buttonTheme = "theme-green";
      break;
    case EActionTypes.ARCHIVE:
      buttonTheme = "theme-gray";
      break;
    case EActionTypes.CANCEL_REQUEST:
    case EActionTypes.DELETE:
    case EActionTypes.RECALL:
    case EActionTypes.REJECT:
      buttonTheme = "theme-red";
      break;
  }

  return {
    label: actionType.split("-").join(" "),
    theme: buttonTheme,
  };
};

// Calculate the days between the from date and the to date (in terms of actual days AND business days)
export const calculateDaysBetweenDates: TCalculateDaysBetweenDates = (dates) => {
  const datesArr = (dates as Array<DateObject>).join(",").split(",");
  const [fromYear, fromMonth, fromDay] = datesArr[0].split("-");

  // How many dates have been selected (if only from, that's 1, if from and to, that's 2)
  const numberOfSelectedDates = datesArr.length;

  if (numberOfSelectedDates === 1) {
    return {
      businessDays: 1,
      days: 1,
    };
  } else {
    // If a from and a to date have been selected, work out the days in between the 2 dates
    const [toYear, toMonth, toDay] = datesArr[1].split("-");

    // Format all dates into numeric format
    const fromDayConverted = Number(fromDay);
    const fromMonthConverted = Number(fromMonth);
    const fromYearConverted = Number(fromYear);
    const toDayConverted = Number(toDay);
    const toMonthConverted = Number(toMonth);
    const toYearConverted = Number(toYear);

    // Calculate the weekend days within the range selected
    const weekendDays = eachWeekendOfInterval({
      start: new Date(fromYearConverted, fromMonthConverted - 1, fromDayConverted),
      end: new Date(toYearConverted, toMonthConverted - 1, toDayConverted),
    });

    const daysDiff = differenceInCalendarDays(new Date(toYearConverted, toMonthConverted - 1, toDayConverted, 0, 1), new Date(fromYearConverted, fromMonthConverted - 1, fromDayConverted, 23, 59)) + 1;

    return {
      businessDays: daysDiff - weekendDays.length,
      days: daysDiff,
    };
  }
};

// Capitalize a string of text
export const capitalize: TCapitalize = ([firstLetter, ...restOfWord]) => firstLetter.toUpperCase() + restOfWord.join("");

// Convert "YYYY-MM-DD" into new Date(year, month, day)
export const convertYYYYMMDDStringToDateObject: TConvertYYYYMMDDStringToDateObject = (date) => {
  if (!date) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = Number(today.getFullYear());
    return new DateObject(`${year}/${month}/${day}`);
  }

  const [year, month, day] = date.split("-");

  return new DateObject({ year: Number(year), month: Number(month), day: Number(day) });
};

// Check how many days are between a date and todays date
export const dateDiffInDays: TDateDiffInDays = (dateToCheck) => {
  const diffTime = Math.abs(new Date().getTime() - dateToCheck.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Convert dates from "DD/MM/YYYY" format to "6th October 2022" format
export const convertToFriendlyDate: TConvertDateToFriendlyFormat = (date, showTime = false) => {
  if (!date) return "";

  // A datetime has been provided in YYYY-MM-DD HH:MM:SS format
  const splitTime = date.split(" ")[1];

  // A date has been provided in YYYY-MM-DD format
  let [year, month, day]: number[] | string[] = date.split("-");
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  if (showTime) {
    return `${format(new Date(year, month - 1, day), "dd MMM yy")} ${splitTime}`;
  } else {
    return format(new Date(year, month - 1, day), "dd MMM yy");
  }
};

// Fetch the current year
export const currentYear = () => {
  return new Date().getFullYear();
};

// Check how many years and months have passed since a given date
export const dateDiffInMonthsAndDays: TDateDiffInMonthsAndDays = (date) => {
  // Find the matching date
  const matchedDate = date;

  // Grab the year, month and day values of the date
  const dateArr = matchedDate.split("-");
  let [year, month, day]: number[] | string[] = dateArr;
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  // Calculate the different between then and now
  const years = differenceInYears(Date.now(), new Date(year, month - 1, day));
  const months = differenceInMonths(Date.now(), new Date(year, month, day)) + 1;

  // Work out the months within just the current year
  const monthsCurrentYear = months - years * 12;

  // Create appropriate suffix strings
  const yearsSuffix = years > 1 ? "years" : "year";
  const monthsSuffix = monthsCurrentYear === 0 || monthsCurrentYear > 1 ? "months" : "month";

  // Construct the return format
  const showYearsOnly = years >= 5;
  if (showYearsOnly) return `${years} years`;

  // If less than 1 years experience
  if (years === 0) return `${monthsCurrentYear} ${monthsSuffix}`;

  return `${years} ${yearsSuffix} ${monthsCurrentYear} ${monthsSuffix}`;
};

// Apply either "th", "st", "nd", "rd" to the end of a numeric day number
export const daySuffix: TDaySuffix = (day) => {
  if (day > 3 && day < 21) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Fetch the first initial of both the first and last name of the active user
export const fetchFirstInitial: TFetchFirstInitial = (name) => {
  return name.substring(0, 1).toUpperCase();
};

// Based on a collection list (from a dropdown), find the index of an option in that collection which matches the textContent provided
export const findSelectIndexByOptionText: TFindSelectIndexByOption = (collection: HTMLSelectElement, toMatch: string) => {
  // return Array.from(collection.options).find((option) => option.textContent === toMatch).index;
  return Array.from(collection.options).findIndex((option) => option.textContent === toMatch);
};

// Based on a collection list (from a dropdown), find the index of an option in that collection which matches the value provided
export const findSelectIndexByOptionValue: TFindSelectIndexByOption = (collection: HTMLSelectElement, toMatch: string) => {
  const matchAgainst = toMatch === "" ? "" : toMatch;
  return Array.from(collection.options).findIndex((option) => option.value === matchAgainst);
};

// Format an employees name in a specified format
export const formatEmployeeName: TFormatEmployeeName = (firstName, lastName, format) => {
  switch (format) {
    case "caps":
      return `${firstName.toUpperCase()} ${lastName.toUpperCase()}`;
    case "names-first-capital":
      return `${capitalize(firstName)} ${capitalize(lastName)}`;
  }
};

// Generate from and to dates as strings (as this is what will be used to pre-populated the datepicker)
export const generateFromAndToDates: TGenerateFromAndToDate = (from, duration) => {
  if (from) {
    const [year, month, day] = from.split("-");
    const fromDay = Number(day);
    const fromMonth = Number(month);
    const fromYear = Number(year);
    const fromDate = new DateObject({ day: fromDay, month: fromMonth, year: fromYear }).format("YYYY-MM-DD");
    const toDate = new DateObject({
      date: new Date(Number(year), Number(month) - 1, Number(day)),
    })
      .add(duration === 1 ? 0 : Number(duration) - 1, "days")
      .format("YYYY-MM-DD");

    return [fromDate, toDate];
  } else {
    return null;
  }
};

// Based on a date range, format the start date in a friendly format
export const generateStartDate: TGenerateStartDate = (dates) => {
  // How many dates have been selected from the datepicker?
  const howManyDatesSelected = (dates as Array<DateObject>).length;

  // Format the dates into the required format
  let datesToPrint: string[] = [];
  if (howManyDatesSelected > 0) {
    datesToPrint = dates
      .toString()
      .split(",")
      .map((date) => convertToFriendlyDate(date));
  }

  return datesToPrint.length > 0 ? datesToPrint[0] : "";
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
  alert(
    `**** ALL VALIDATION MET: DATA TO SUBMIT ****:
${JSON.stringify(data, null, 2)}
`
  );
};

// Remove the [rowId-] prefix from all form elements
export const removeFormDataIdPrefix: TRemoveFormDataIdPrefix = (data, prefix) => {
  const formattedData: IDynamicObject = {};
  Object.entries(data).forEach(([key, value]) => {
    formattedData[key.replace(`${prefix}-`, "")] = value;
  });

  return formattedData;
};

// Recursively remove a property from an object
export const removeNestedObjectProperty: TRemoveNestedObjectProperty = (obj, property) => {
  if (typeof obj !== "object" || obj === null) {
    // Return non-object values as-is
    return obj;
  }

  if (Array.isArray(obj)) {
    // Process each item in the array
    return obj.map((item) => removeNestedObjectProperty(item, property));
  }

  // Create a copy of the object
  const newObj = { ...obj };

  for (const key in newObj) {
    if (Object.hasOwn(newObj, key)) {
      if (key === property) {
        // Remove the property
        delete newObj[key];
      } else {
        // Recursively process nested objects
        newObj[key] = removeNestedObjectProperty(newObj[key], property);
      }
    }
  }

  return newObj;
};

// Render a number into en-GB currency format
export const renderAsCurrency: TRenderAsCurrency = (value) => value.toLocaleString(...LOCALE_STRING_OPTIONS);

// Reset a custom checkbox
export const resetCheckbox: TResetCheckbox = (ref) => {
  if (ref.current.checked) {
    ref.current.parentElement.click();
  }
};

// Re-instate the editable table row to its initial DOM position
export const resetEditableTableRow = () => {
  const editableRowElem = document.querySelector("[data-edit-row]");
  document.body.appendChild(editableRowElem);
};

// Reset the active state of any active radio items within a radio list
export const resetRadioListItem: TResetRadioListItem = (ref) => {
  Array.from(ref.current.querySelectorAll("input")).forEach((input) => {
    if ((input as HTMLInputElement).checked) {
      input.checked = false;
    }
  });
};

// Sort the return array by the status column, so that the data is order in the correct sort order
// 1. status = "APPROVED"
// 2. status = "PENDING"
// 3. status = "ARCHIVED"
// 4. status = "REJECTED"
export const sortDataByStatus: TSortDataByStatus = (data, statusPriority) => {
  let newRequests = data;
  statusPriority.map((priority) => {
    newRequests = sortBy(newRequests, [(obj) => obj.status === priority]);
  });

  return newRequests;
};

// Toggle the visibility of a data tables suffix row
export const toggleDataTableSuffixRow: TToggleDataTableSuffixRow = (triggerRowElem) => {
  const suffixRowElem = triggerRowElem.nextElementSibling;
  const suffixRowVisibile = suffixRowElem.getAttribute("data-visible");
  triggerRowElem.setAttribute("data-selected", suffixRowVisibile === "true" ? "false" : "true");
  suffixRowElem.setAttribute("data-visible", suffixRowVisibile === "true" ? "false" : "true");
};

// Add and remove entries to the array list of selected checkboxes in a unique collection
export const updateCheckboxListSelectedItems: TUpdateCheckboxListSelectedItems = (checked, currentSelectedItems, id) => {
  if (checked) {
    return [...currentSelectedItems, id];
  } else {
    const newSelectedItems = currentSelectedItems.filter((item) => item !== id);
    return [...newSelectedItems];
  }
};

// Check whether the value entered is a number or not
export const validateNumberInput: TValidateNumberInput = (event) => {
  const allowedKeyCodes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ArrowLeft", ".", "ArrowRight", "Backspace", "Delete", "Tab"];
  return allowedKeyCodes.includes(event.key);
};

export const convertUnixTimestampsToYYYYMMDD = (dates) => {
  let datesConverted;
  const datesSelected = dates as Array<DateObject>;
  if (datesSelected.length === 1) {
    const [fromYear, fromMonth, fromDay] = dates.toString().split("-");

    datesConverted = `${fromYear}-${fromMonth}-${fromDay}`;
  } else if (datesSelected.length === 2) {
    const [fromYear, fromMonth, fromDay] = dates[0].toString().split("-");
    const [toYear, toMonth, toDay] = dates[1].toString().split("-");

    datesConverted = [`${fromYear}-${fromMonth}-${fromDay}`, `${toYear}-${toMonth}-${toDay}`];
  }

  return datesConverted;
};
