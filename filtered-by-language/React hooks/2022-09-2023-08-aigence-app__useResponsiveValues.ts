// Scripts
import { currentBreakpoint } from "@aigence/scripts/utilities/responsive";

// Types
import { IResponsiveValues } from "@aigence/types/interfaces";

export const useResponsiveValues = (values: IResponsiveValues) => {
  const breakpoint = currentBreakpoint();

  return {
    responsiveWidth: values[breakpoint],
  };
};
