// Apollo
import ApolloProviderWrapper from "apollo/apollo-provider-wrapper";
import DataFetch from "components/global/data-fetch";

// NPM imports
import type { AppProps } from "next/app";
import Head from "next/head";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import ReactBreakpoints from "react-breakpoints";

// Redux
import { wrapper } from "@aigence/store";
import { addLocalReducersToStore } from "store";

// Styles
import "@aigence/styles/app.scss";

const breakpoints = {
  mobile: 1,
  tabletPortrait: 768,
  tabletLandscape: 1024,
  desktop: 1025,
  widescreen: 1280,
  debug: 1920,
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  // Hooks (effects)
  useEffect(() => {
    // add app specific reducers to the store
    addLocalReducersToStore();
  }, []);

  return (
    <SessionProvider session={session}>
      <ApolloProviderWrapper>
        <ReactBreakpoints breakpoints={breakpoints} debounceResize={true}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
          </Head>
          <DataFetch>
            <Component {...pageProps} />
          </DataFetch>
        </ReactBreakpoints>
      </ApolloProviderWrapper>
    </SessionProvider>
  );
}

export default wrapper.withRedux(MyApp);
