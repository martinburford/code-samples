// Node imports
import fs from "fs/promises";
import path from "path";

// Types
import {
  TDeconstructGallerySlug,
  TGetCompaniesData,
  TGetCompaniesWithGalleryData,
  TGetGalleryData,
} from "./data-fetching.types";

// Utilities
import { MONTH_NAMES } from "./consts";

// Take a slug, and derive additional information from it
const deconstructGallerySlug: TDeconstructGallerySlug = (slug) => {
  const [yearFrom, monthFrom, yearTo, monthTo, ...companyName] = slug.split("-");

  // Find out the text string value of the month numbers
  const monthFromConverted = MONTH_NAMES[+monthFrom - 1];
  const monthToConverted = MONTH_NAMES[+monthTo - 1];

  return {
    companyName: companyName.join("-"),
    dates: {
      from: `${monthFromConverted} ${yearFrom}`,
      to: `${monthToConverted} ${yearTo}`,
    },
  };
};

// Fetch ALL companies data
export const getCompaniesData: TGetCompaniesData = async (enabledOnly = true) => {
  const filePath = path.join(process.cwd(), "data", "companies", "index.json");
  const jsonData = await fs.readFile(filePath);
  const { companies } = JSON.parse(jsonData.toString());

  // Return only the companies which are enabled
  if (enabledOnly) {
    return companies.filter((company) => company.enabled);
  } else {
    return companies;
  }
};

// Fetch ALL companies data who have a gallery
export const getCompaniesWithGalleryData: TGetCompaniesWithGalleryData = async () => {
  const companies = await getCompaniesData();

  // Remove the company data which isn't required for this page (those without galleries)
  return companies.filter((company) => company.galleries);
};

// Fetch the data for a specific gallery
export const getGalleryData: TGetGalleryData = async (slug) => {
  const companies = await getCompaniesWithGalleryData();

  const matchedGallery = companies.filter((company) => {
    const {
      summary: {
        companyName,
        dates: { from, to },
      },
    } = company;
    const {
      companyName: slugCompanyName,
      dates: { from: slugDatesFrom, to: slugDatesTo },
    } = deconstructGallerySlug(slug);

    return (
      companyName.split(" ").join("-").toLowerCase() == slugCompanyName && from == slugDatesFrom && to == slugDatesTo
    );
  });

  return matchedGallery[0];
};
