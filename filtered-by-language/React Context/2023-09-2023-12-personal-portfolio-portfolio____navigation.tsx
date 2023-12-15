// NPM imports
import React, { createContext, useState } from "react";

// Construct the initial context
const NavigationContext = createContext({
  expanded: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleNavigation: function (mode: boolean) {},
});

/**
 * @function NavigationContextProvider - The Provider for the "Navigation" context
 * @param {object} props - All props provided to the Provider (this will only ever be children in this case)
 * @returns {provider} The provider holding the context, defining the current theme
 */
export function NavigationContextProvider({ children }) {
  const [expanded, updateExpanded] = useState(false);

  // The toggle handler to switch the visiblity (ecxpanded state) of the navigation
  function toggleNavigationHandler(mode) {
    updateExpanded(mode);
  }

  // Construct the context to be passed down via the Provider
  const context = {
    expanded,
    toggleNavigation: toggleNavigationHandler,
  };

  return <NavigationContext.Provider value={context}>{children}</NavigationContext.Provider>;
}

export default NavigationContext;
