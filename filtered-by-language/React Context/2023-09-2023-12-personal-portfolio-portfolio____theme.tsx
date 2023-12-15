// NPM imports
import React, { createContext, useState } from "react";

// Construct the initial context
const ThemeContext = createContext({
  theme: "light", // "light" || "dark"
  toggleTheme: function () {},
});

/**
 * @function ThemeContextProvider - The Provider for the "Theme" context
 * @param {object} props - All props provided to the Provider (this will only ever be children in this case)
 * @returns {provider} The provider holding the context, defining the current theme
 */
export function ThemeContextProvider({ children }) {
  const [theme, updateTheme] = useState("light");

  // The toggle handler to switch the theme
  function toggleThemeHandler() {
    updateTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  // Construct the context to be passed down via the Provider
  const context = {
    theme,
    toggleTheme: toggleThemeHandler,
  };

  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

export default ThemeContext;
