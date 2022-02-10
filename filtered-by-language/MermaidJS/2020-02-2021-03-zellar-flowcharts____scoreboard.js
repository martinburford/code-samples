import ConfigurationScoreboard from "./configuration/scoreboard";

const SECTION_PREFIX = "SCOREBOARD";

export default `
  %% Overview
  ${SECTION_PREFIX}_OVERVIEW(Scoreboard overview) -- "[GET] /scoreboard" --> ${SECTION_PREFIX}_OVERVIEW_API{API}
  ${SECTION_PREFIX}_OVERVIEW_SHOW --> ${SECTION_PREFIX}_PLEDGE_STEP_1("Pledge (step 1)")
  ${SECTION_PREFIX}_PLEDGE_STEP_1 --> ${SECTION_PREFIX}_PLEDGE_STEP_2("Pledge (step 2)")
  ${SECTION_PREFIX}_PLEDGE_STEP_2 --> ${SECTION_PREFIX}_PLEDGE_STEP_3("Pledge (step 3)")
  ${SECTION_PREFIX}_PLEDGE_STEP_3 -- "[POST] /scoreboard/pledge" --> ${SECTION_PREFIX}_PLEDGE_POST_API{API}
  ${SECTION_PREFIX}_PLEDGE_STEP_3 -- "[PUT] /scoreboard/pledge" --> ${SECTION_PREFIX}_PLEDGE_PUT_API{API}
  ${SECTION_PREFIX}_OVERVIEW_API -- 200 --> ${SECTION_PREFIX}_OVERVIEW_SHOW(Show page)
  ${SECTION_PREFIX}_OVERVIEW_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_OVERVIEW_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR(Generic error page)
  ${SECTION_PREFIX}_OVERVIEW_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_OVERVIEW_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_OVERVIEW_SHOW -- "[GET] /scoreboard/emissions" --> ${SECTION_PREFIX}_EMISSIONS_API{API}
  ${SECTION_PREFIX}_OVERVIEW_SHOW -- "[GET] /scoreboard/fuelMix" --> ${SECTION_PREFIX}_FUEL_MIX_API{API}
  ${SECTION_PREFIX}_OVERVIEW_SHOW -- "[GET] /scoreboard/usage" --> ${SECTION_PREFIX}_USAGE_API{API}

  %% Pledge
  ${SECTION_PREFIX}_PLEDGE_POST_API -- 201 --> ${SECTION_PREFIX}_CONFIRMATION("Pledge (confirmation)")
  ${SECTION_PREFIX}_PLEDGE_EMAIL(Loaded from email) --> ${SECTION_PREFIX}_CONFIRMATION
  ${SECTION_PREFIX}_PLEDGE_POST_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_POST_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_POST_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_POST_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR

  ${SECTION_PREFIX}_PLEDGE_PUT_API -- 201 --> ${SECTION_PREFIX}_CONFIRMATION
  ${SECTION_PREFIX}_PLEDGE_PUT_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_PUT_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_PUT_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_PUT_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR

  %% Pledge (from social platform)
  ${SECTION_PREFIX}_PLEDGE_SHARE(Loaded from social platform) --> ${SECTION_PREFIX}_PLEDGE_PUBLIC(Public pledge)
  ${SECTION_PREFIX}_PLEDGE_PUBLIC -- "[GET] /scoreboard/pledge" --> ${SECTION_PREFIX}_PLEDGE_GET_API{API}
  ${SECTION_PREFIX}_PLEDGE_GET_API -- 200 --> ${SECTION_PREFIX}_PLEDGE_PUBLIC_SHOW(Show page)
  ${SECTION_PREFIX}_PLEDGE_GET_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_GET_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_PLEDGE_PUBLIC --> ${SECTION_PREFIX}_PLEDGE_STEP_1

  %% Emissions
  ${SECTION_PREFIX}_EMISSIONS_API -- 200 --> ${SECTION_PREFIX}_EMISSIONS_SHOW(Show page)
  ${SECTION_PREFIX}_EMISSIONS_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_EMISSIONS_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_EMISSIONS_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_EMISSIONS_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR

  ${SECTION_PREFIX}_EMISSIONS_SHOW -- "[POST] /requestQuote" --> ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_API{API}
  ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_API{API} -- "201" --> ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_CONFIRMATION(Confirmation)
  ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_API{API} -- "401" --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_API{API} -- "404" --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_EMISSIONS_REQUEST_QUOTE_API{API} -- "500" --> ${SECTION_PREFIX}_GENERIC_ERROR

  %% Fuel Mix
  ${SECTION_PREFIX}_FUEL_MIX_API -- 200 --> ${SECTION_PREFIX}_FUEL_MIX_SHOW(Show page)
  ${SECTION_PREFIX}_FUEL_MIX_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_FUEL_MIX_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_FUEL_MIX_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_FUEL_MIX_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR

  ${SECTION_PREFIX}_FUEL_MIX_SHOW -- "[POST] /requestQuote" --> ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_API{API}
  ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_API{API} -- "201" --> ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_CONFIRMATION(Confirmation)
  ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_API{API} -- "401" --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_API{API} -- "404" --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_FUEL_MIX_REQUEST_QUOTE_API{API} -- "500" --> ${SECTION_PREFIX}_GENERIC_ERROR

  %% Usage
  ${SECTION_PREFIX}_USAGE_API -- 200 --> ${SECTION_PREFIX}_USAGE_SHOW(Show page)
  ${SECTION_PREFIX}_USAGE_API -- 401 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_USAGE_API -- 403 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_USAGE_API -- 404 --> ${SECTION_PREFIX}_GENERIC_ERROR
  ${SECTION_PREFIX}_USAGE_API -- 500 --> ${SECTION_PREFIX}_GENERIC_ERROR

  %% Custom error redirects
  ${SECTION_PREFIX}_GENERIC_ERROR --> ${SECTION_PREFIX}_REDIRECT_401(401 redirect)
  ${SECTION_PREFIX}_REDIRECT_401 --> SIGNIN_GET_STARTED(Signin / Get started)

  ${ConfigurationScoreboard}
`;
  