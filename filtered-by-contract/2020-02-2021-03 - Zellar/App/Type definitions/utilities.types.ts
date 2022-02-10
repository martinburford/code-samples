// Interfaces

// Types

export type TAPIReplaceKeys = (
  /** The path to replace strings within */
  apiOriginalPath: string,
  /** An array of keys which are to be replaced */
  keys: {
    key: string;
    value: any;
  }[]
) => string;

export type TConstructAPIEndpoint = (obj: {
  /** The section of the application eg: "registration", "signin" */
  section: string;
  apiReference: string;
}) => string;

export type TConstructMetaPageTags = (metaData: {
  /** The value to place within the <title> tag */
  title: string;
  /** The value to place within the <meta name="description"> tag */
  description: string;
}) => React.ReactElement;

export type TGetLocalStorage = (
  /** The name of the key to retrieve the value for */
  key: string
) => string;

export type TJsonSyntaxHighlight = (
  /** The stringified JSON data object */
  json: string
) => string;

export type TLog = (
  /** The message(s) to log to the console */
  ...args: any[]
) => void;

export type TParseURLParams = (
  /** The querystring of the current url eg: ?referrer=/url&status=true */
  querystring: string
) => {
  /** An object in the form of {referrer: "/url", status: true} */
  [key: string]: any;
};

export type TRemoveLocalStorage = (
  /** The key which is to be removed from local storage */
  key: string
) => void;

export type TSetAuthorizationHeader = (
  /** Always "Bearer" */
  tokenType: string,
  /** The token the API requires in order to authenticate a user */
  token: string
) => void;

export type TSetLocalStorage = (
  /** The name of the key to use in localStorage */
  key: string,
  /** The value to set inside the key within localStorage */
  value: string
) => void;

export type TSortObjectAlphabetically = (obj: {
  /** The input object in (potentially) unordered pattern */
  [key: string]: any;
}) => {
  [key: string]: any;
};

export type TUpdateDisabledLoadingState = (
  /** The elements on page to update the state for */
  settings: {
    /** Which element to update */
    reference: string;
    /** Either "disabled" || "loading" */
    type: "disabled" | "loading";
    /** Whether to enable or disable a feature */
    value: boolean;
  }[],
  /** The existing component state object Re: button states */
  state: {
    [key: string]: {
      disabled: boolean;
      loading: boolean;
    };
  }
) => {
  /** A new state object for all elements on a specific page */
  [key: string]: {
    disabled: boolean;
    loading: boolean;
  };
};
