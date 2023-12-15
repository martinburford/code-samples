// NPM imports
import { useMediaQuery } from "react-responsive";

// Scripts
import { BREAKPOINTS } from "scripts/consts";

// Types
import { EBreakpoints } from "types/enums";
import { TBreakpointRender, TCurrentBreakpoint } from "./responsive.types";

// Breakpoint detection
const useMobile = () => useMediaQuery({ maxWidth: 767 });
const useTabletPortrait = () =>
  useMediaQuery({
    minWidth: BREAKPOINTS.tabletPortrait.min,
    maxWidth: BREAKPOINTS.tabletPortrait.max,
  });
const useTabletLandscape = () =>
  useMediaQuery({
    minWidth: BREAKPOINTS.tabletLandscape.min,
    maxWidth: BREAKPOINTS.tabletLandscape.max,
  });
const useDesktop = () => useMediaQuery({ minWidth: BREAKPOINTS.desktop.min, maxWidth: BREAKPOINTS.desktop.max });
const useWide = () => useMediaQuery({ minWidth: BREAKPOINTS.wide.min, maxWidth: BREAKPOINTS.wide.max });

// Return content for the mobile breakpoint
export const Mobile: TBreakpointRender = ({ children }) => {
  const isMobile = useMobile();
  return isMobile ? children : null;
};

// Return content for the tabletPortrait breakpoint
export const TabletPortrait: TBreakpointRender = ({ children }) => {
  const isTabletPortrait = useTabletPortrait();
  return isTabletPortrait ? children : null;
};

// Return content for the tabletLandscape breakpoint
export const TabletLandscape: TBreakpointRender = ({ children }) => {
  const isTabletLandscape = useTabletLandscape();
  return isTabletLandscape ? children : null;
};

// Return content for the desktop breakpoint
export const Desktop: TBreakpointRender = ({ children }) => {
  const isDesktop = useDesktop();
  return isDesktop ? children : null;
};

// Return content for the wide breakpoint
export const Wide: TBreakpointRender = ({ children }) => {
  const isWide = useWide();
  return isWide ? children : null;
};

// What breakpoint is current being used?
export const currentBreakpoint: TCurrentBreakpoint = () => {
  let breakpoint = EBreakpoints.MOBILE;

  if (useMobile()) breakpoint = EBreakpoints.MOBILE;
  if (useTabletPortrait()) breakpoint = EBreakpoints.TABLET_PORTRAIT;
  if (useTabletLandscape()) breakpoint = EBreakpoints.TABLET_LANDSCAPE;
  if (useDesktop()) breakpoint = EBreakpoints.DESKTOP;
  if (useWide()) breakpoint = EBreakpoints.WIDE;

  return breakpoint;
};
