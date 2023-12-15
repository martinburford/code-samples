// Components
import Debug from "components/organisms/debug";
import Header from "components/organisms/header";
import Outer from "components/organisms/outer";

// Context
import { Providers } from "context/providers";

// Fonts
import { raleway } from "./fonts";

// Styles
import "styles/app.scss";
import styles from "./layout.module.scss";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={raleway.className} lang="en">
      <body className={styles.body}>
        <Providers>
          <Debug />
          <main className={styles.main}>
            <Header dataAttributes={{ "data-component-spacing": "0" }}/>
            <Outer dataAttributes={{ "data-component-spacing": "0" }}>
              {children}
            </Outer>
          </main>
        </Providers>
      </body>
    </html>
  );
}
