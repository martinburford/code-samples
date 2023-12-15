"use client";

import { NavigationContextProvider } from "./navigation";
import { ThemeContextProvider } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <NavigationContextProvider>
        {children}
      </NavigationContextProvider>
    </ThemeContextProvider>
  );
}
