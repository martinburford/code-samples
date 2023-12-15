// Interfaces
// ...

// Types
export type TBuildDataAttributes = (
  componentId: string,
  dataAttributes?: {
    [key: string]: string;
  }
) => {
  [key: string]: string;
};

export type TCapitalize = (status) => string;
export type TGenerateGallerySlug = (
  company: string,
  dates: {
    from: string;
    to: string;
  }
) => string;
export type TGetMonthsAndYearsFromDateUntilNow = (date: string) => {
  months: number;
  years: number;
};
export type TGetTechnologyDateDiff = (technology: string) => string;
export type TGetTodaysDate = () => {
  day: string;
  month: string;
  year: number;
};

export type TGetTodaysMonthName = () => string;
export type THasParent = (element: EventTarget, parentToCheck: Element) => boolean;
