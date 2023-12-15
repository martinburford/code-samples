// NPM imports
import differenceInYears from "date-fns/differenceInYears";
import differenceInMonths from "date-fns/differenceInMonths";

// Scripts
import { MONTH_NAMES, TECHNOLOGY_START_DATES } from "scripts/consts";

// Types
import {
  TBuildDataAttributes,
  TCapitalize,
  TGenerateGallerySlug,
  TGetMonthsAndYearsFromDateUntilNow,
  TGetTechnologyDateDiff,
  TGetTodaysDate,
  TGetTodaysMonthName,
  THasParent,
} from "./utilities.types";

// Construct a data attributes object for a specific component instance
export const buildDataAttributes: TBuildDataAttributes = (componentId, dataAttributes) => {
  return {
    "data-component-id": componentId,
    "data-component-spacing": "m",
    ...dataAttributes,
  };
};

// Capitalize a string of text
export const capitalize: TCapitalize = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join("");

// Generate a slug for a portfolio gallery (eg: 2021-02-2021-03-zellar)
export const generateGallerySlug: TGenerateGallerySlug = (companyName, dates) => {
  const { from, to } = dates;
  const [fromMonth, fromYear] = from.split(" ");
  const [toMonth, toYear] = to.split(" ");

  // Generate the kebab syntax dates fragment of a galleries url eg: 2020-02-2021-03 (from February 2020 to March 2021)
  const roleFrom = `${fromYear}-${(MONTH_NAMES.indexOf(fromMonth) + 1).toString().padStart(2, "0")}`;
  const roleTo = `${toYear}-${(MONTH_NAMES.indexOf(toMonth) + 1).toString().padStart(2, "0")}`;

  const companyNameFormatted = companyName.toLowerCase().split(" ").join("-");

  return `${roleFrom}-${roleTo}-${companyNameFormatted}`;
};

// Calculate how many months have passed from a date in the past until now
export const getMonthsAndYearsFromDateUntilNow: TGetMonthsAndYearsFromDateUntilNow = (date) => {
  // Grab the year, month and day values of the date
  const dateArr = date.split("/");
  const [day, month, year] = dateArr;

  // Calculate the different between then and now
  return {
    months: differenceInMonths(Date.now(), new Date(Number(year), Number(month), Number(day))) + 1,
    years: differenceInYears(Date.now(), new Date(Number(year), Number(month) - 1, Number(day))),
  };
};

// Check how many years and months have passed since I started using a technology
export const getTechnologyDateDiff: TGetTechnologyDateDiff = (technology) => {
  if (!technology) return;

  // Find the matching date
  const matchedDate = TECHNOLOGY_START_DATES.find((technologies) => technologies.technology === technology);

  // Grab the year, month and day values of the date
  const { months, years } = getMonthsAndYearsFromDateUntilNow(matchedDate?.startDate);

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

// Retreive todays date
export const getTodaysDate: TGetTodaysDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  return {
    year: yyyy,
    month: mm,
    day: dd,
  };
};

// Retreive todays date
export const getTodaysMonthName: TGetTodaysMonthName = () => {
  return new Date().toLocaleString("default", { month: "long" });
};

// Is an element a child of a specific parent?
export const hasParent: THasParent = (element, parentToCheck) => {
  let currentParent = (element as Element).parentNode;

  while (currentParent) {
    if (currentParent === parentToCheck) {
      return true;
    }

    currentParent = currentParent.parentNode;
  }

  return false;
};