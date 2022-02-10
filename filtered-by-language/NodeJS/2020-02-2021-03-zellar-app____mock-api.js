const cors = require("cors");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3001;

// Whether Refresh Tokens are enabled or not for speciifc sections of the application
const refreshTokens = {
  scoreboard: {
    counter: 0,
    enabled: false
  }
};

/**
 * @function returnJSONData - Return JSON data based on whether Refresh Tokens are enabled for a specific section or not
 * @param {object} json - The JSON object to render when no token is being refreshed
 * @param {string} section - The section of the site (eg: "onboarding" || "scoreboard" || "signin")
 * @returns {object} - The JSON block to return, either a new token object or the JSON data for page rendering
 */
const returnJSONData = (json, section) => {
  let returnJSON;

  // If Refresh Tokens are enabled for the specified section, return a new token
  if (refreshTokens[section].enabled && refreshTokens[section].counter === 0) {
    returnJSON = {
      token: uuidv4(),
      tokenType: "Bearer"
    };

    refreshTokens[section].counter++;
  } else {
    returnJSON = json;

    refreshTokens[section].counter = 0;
  }

  return returnJSON;
};

// Allow POST data to be accessed
app.use(express.json());

// Allow cross origin access from localhost
app.use(
  cors({
    credentials: true,
    exposedHeaders: "X-Anonymous-UserTracking",
    origin: ["http://localhost:8080", "http://localhost:3000"] // Client-side (8080) and server-side (3000)
  })
);

// Retrieve company names
// [GET] /onboarding/companies/:name
app.get("/onboarding/companies/:name", (req, res) => {
  const guid = uuidv4();

  res.setHeader("X-Anonymous-UserTracking", guid);
  res.json([
    {
      title: "ZELLAR LTD",
      companyName: "ZELLAR LTD",
      companyNumber: "10193629",
      companyAddress: {
        premise: "1",
        firstLine: "Fore Street Avenue",
        postCode: "EC2Y 9DT"
      }
    },
    {
      title: "ZELLAR LIMITED",
      companyName: "ZELLAR LIMITED",
      companyNumber: "08696621",
      companyAddress: {
        premise: "352 ",
        firstLine: "Lordship Lane",
        postCode: "N17 7QX"
      }
    },
    {
      title: "ZELLARGO LIMITED",
      companyName: "ZELLARGO LIMITED",
      companyNumber: "08470541",
      companyAddress: {
        premise: "69",
        firstLine: "Rosendale Road",
        postCode: "SE21 8EZ"
      }
    },
    {
      title: "ZELLARON LIMITED",
      companyName: "ZELLARON LIMITED",
      companyNumber: "07522173",
      companyAddress: {
        premise: "Fairfield House 1 Fairfield Street",
        firstLine: "Bingham",
        postCode: "NG13 8FB"
      }
    }
  ]);
});

// Retrieve addresses
// [GET] /onboarding/addresses/:name
app.get("/onboarding/addresses/:name", (req, res) => {
  res.json([
    {
      text: "(E) Test, 215 Princess Parade High Street",
      highlight: "0-4",
      description: "West Bromwich, B70 7QZ",
      addressId: "GB|UT|A|E1184213",
      meterType: ["electricity"]
    },
    {
      text: "(G) Test, 3 Brick Kiln Street",
      highlight: "0-4",
      description: "Hinckley, LE10 0NA",
      addressId: "GB|UT|A|G17707090",
      meterType: ["gas"]
    },
    {
      text: "(B) Te, The Granary, Bannel Lane",
      highlight: "0-2",
      description: "Penymynydd, Chester, CH4 0EP",
      addressId: "GB|UT|A|B6014471",
      meterType: ["electricity", "gas"]
    },
    {
      text: "(N) Test, Ranoldcoup Road",
      highlight: "0-4",
      description: "Darvel, KA17 0JU",
      addressId: "GB|UT|A|N16033824",
      meterType: []
    },
    {
      text: "(E) Testa Teres House, Copse Road",
      highlight: "0-17",
      description: "Fleetwood, FY7 7NY",
      addressId: "GB|UT|A|E12295174",
      meterType: ["electricity"]
    },
    {
      text: "(G) Testa Teres House, Copse Road",
      highlight: "0-17",
      description: "Fleetwood, FY7 7NY",
      addressId: "GB|UT|A|G12295173",
      meterType: ["gas"]
    },
    {
      text: "(N) Llandybie, 2, Ammanford, Te",
      highlight: "25-27",
      description: "Llandybie, Ammanford, SA18",
      addressId: "GB|UT|A|N28615894",
      meterType: ["electricity"]
    },
    {
      text: "(E) Briggs Marine Contractors Ltd",
      highlight: ";0-9",
      description: "Test Mpan, XZ",
      addressId: "GB|UT|A|E36722626",
      meterType: ["electricity"]
    },
    {
      text: "(E) Unit B37, Barwell, T E, Barwell Business Park Leatherhead Road",
      highlight: "",
      description: "Chessington, KT9 2NY",
      addressId: "GB|UT|A|E16223404",
      meterType: ["electricity"]
    },
    {
      text: "(E) Unit C64, Barwell, T E, Barwell Business Park Leatherhead Road",
      highlight: "",
      description: "Chessington, KT9 2NY",
      addressId: "GB|UT|A|E16223405",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 1, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525362",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 2, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525363",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 3, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525364",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 4, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525365",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 5, Plot 12)",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525366",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 6, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525367",
      meterType: ["electricity"]
    },
    {
      text: "(E) Plot 7, Plot 12",
      highlight: "",
      description: "Technology Park, ST1 2TG",
      addressId: "GB|UT|A|E31525368",
      meterType: ["electricity"]
    }
  ]);
});

// Grant consent to access meter details (automatic consent)
// [POST] /onboarding/consent
app.post("/onboarding/consent", (req, res) => {
  let mpans;

  switch (req.body.addressId) {
    case "GB|UT|A|E1184213":
      mpans = ["*********1234"];
      break;
    case "GB|UT|A|B6014471":
      mpans = ["*********1234", "*********2222", "*********3333", "*********4444"];
      break;
  }

  res.status(201).send({
    quoteId: 1,
    mpans
  });
});

// Grant consent to access meter details (automatic consent)
// [PUT] /onboarding/consent
app.put("/onboarding/consent", (req, res) => {
  res.status(201).send({
    quoteId: 2,
    mpans: ["*********1234", "*********6666", "*********7777", "*********8888"]
  });
});

// Grant consent to access meter details (manual consent)
// [POST] /onboarding/manualConsent
app.post("/onboarding/manualConsent", (req, res) => {
  const providedMpan = req.body.mpan;

  res.status(201).send({
    quoteId: 3,
    mpans: [providedMpan]
  });
});

// Grant consent to access meter details (manual consent)
// [PUT] /onboarding/manualConsent
app.put("/onboarding/manualConsent", (req, res) => {
  const providedMpan = req.body.mpan;

  res.status(201).send({
    quoteId: 4,
    mpans: [providedMpan]
  });
});

// Select a specific MPAN
// [PATCH] /onboarding/mpan
app.patch("/onboarding/mpan", (req, res) => {
  res.sendStatus(200);
});

// Retrieve a list of addresses for a specific MPAN
// GET /onboarding/addresses/mpans/{mpan}
// ! Set the array to an empty array in order to have manual MPAN entry auto consent and NOT show the Address Selection screen
app.get("/onboarding/addresses/mpans/:mpan", (req, res) => {
  res.json([
    {
      text: "Address 1 (text)",
      highlight: "Address 1 (highlight)",
      description: "Address 1 (description)",
      addressId: "GB|UT|A|E11111111",
      meterType: ["electricity"]
    },
    {
      text: "Address 2 (text)",
      highlight: "Address 2 (highlight)",
      description: "Address 2 (description)",
      addressId: "GB|UT|A|E22222222",
      meterType: ["electricity"]
    },
    {
      text: "Address 3 (text)",
      highlight: "Address 3 (highlight)",
      description: "Address 3 (description)",
      addressId: "GB|UT|A|E33333333",
      meterType: ["electricity"]
    }
  ]);
});

// Retrieve data for Onboarding playback screen
// [GET] /onboarding/quotes/{id}
app.get("/onboarding/quotes/:id", (req, res) => {
  res.json({
    companyName: "Mock company name",
    mpans: [
      {
        electricityMeterNumber: "*********0009",
        electricityUsage: "****",
        supplierName: "Opus Energy Renewables Limited",
        supplierLogo: "/assets/energy-providers/opus-energy.svg",
        supplierAltLogo: null,
        supplyAddress: "Test, 215 Princess Parade High Street, West Bromwich, B70 7QZ"
      }
    ]
  });
});

// Signin a user
// [GET] /signin/accounts/{email}
app.get("/signin/accounts", (req, res) => {
  switch (req.query.email) {
    case "existing-user@zellar.com":
      res.sendStatus(409); // 409: account already exists
      break;
    case "new-user@zellar.com":
      res.sendStatus(404); // 404: no account exists
      break;
    case "unverified-user@zellar.com":
      res.sendStatus(401); // 401: account not yet verified
      break;
    default:
      res.sendStatus(404); // 404: no account exists
  }
});

// Create a new account
// [POST] /signin/accounts
app.post("/signin/accounts", (req, res) => {
  // Which email address was posted to the API?
  const emailAddress = req.body.email;

  switch (emailAddress) {
    case "201@zellar.com":
      res.sendStatus(201); // 201: new account created, but it's not verified (page redirect)
      break;
    case "401@zellar.com":
      res.sendStatus(401); // 401: account previously created, but it's not verified (inline error message)
      break;
    case "409@zellar.com":
      res.sendStatus(409); // 409: account previoulsy created, and it's already been verified (inline error message)
      break;
    case "500@zellar.com":
      res.sendStatus(500); // 500: generic server error (inline error message)
      break;
  }
});

// Verify an account via an email link
// PUT /signin/accounts/verify
app.put("/signin/accounts/verify", (req, res) => {
  // Which accountId was sent to the endpoint?
  const accountId = req.body.accountId;

  const token = uuidv4();
  const tokenType = "Bearer";

  switch (accountId) {
    case "184172184032164020229199096182223132111115000233":
      res.status(200).send({
        token,
        tokenType
      }); // 200: account has successfully been verified
      break;
    case "invalid":
      res.sendStatus(404); // 404: no account was found with the id of "invalid"
      break;
    case "163089129076136052148204042055204026244147110089":
      res.sendStatus(409); // 409: account has already been verified
      break;
    case "expired-token":
      res.sendStatus(440); // 440: the token for the verification has expired
      break;
    case "server-error":
      res.sendStatus(500); // 500: server error
      break;
  }
});

// Login a user
// POST /signin/auth/local
app.post("/signin/auth/local", (req, res) => {
  const token = uuidv4();
  const tokenType = "Bearer";

  res.json({
    token,
    tokenType
  });
});

// Send an email Re: forgotten password
// [POST] /signin/accounts/forgotpassword
app.put("/signin/accounts/forgotpassword", (req, res) => {
  // Which email address was posted to the API?
  const emailAddress = req.body.email;

  switch (emailAddress) {
    case "200@zellar.com":
      res.sendStatus(200); // Another email would be sent by the live API
      break;
    case "404@zellar.com": // The API returned a 404 (presumably account not found)
      res.sendStatus(404);
      break;
    case "500@zellar.com": // The API returned a server 500 error
      res.sendStatus(500);
      break;
  }
});

// Reset a password
// [POST] /signin/accounts/resetpassword
app.post("/signin/accounts/resetpassword", (req, res) => {
  // Which accountId was posted to the API?
  const accountId = req.body.accountId;
  const guid = uuidv4();

  switch (accountId) {
    case "201":
      // The password has been successfully changed
      res.status(201).json({
        token: guid,
        tokenType: "Bearer",
        scope: "identity_api openid"
      });

      break;
    case "404": // The account could not be found
      res.sendStatus(404);
      break;
    case "500": // The API returned a server 500 error
      res.sendStatus(500);
      break;
  }
});

// Resend account verification email
// POST /signin/accounts/resend
app.post("/signin/accounts/resend", (req, res) => {
  // Which email address was posted to the API?
  const email = req.body.email;

  switch (email) {
    case "unverified-user@zellar.com":
      // The password has been successfully changed
      res.sendStatus(200);

      break;
    default:
      // An invalid email address was provided
      res.sendStatus(500);
      break;
  }
});

// Retrieve Scoreboard data
// [GET] /profile/scoreboard
app.get("/profile/scoreboard", (req, res) => {
  const returnJSON = returnJSONData(
    {
      profileId: 0,
      companies: [
        {
          companyId: 1,
          name: "[MOCK] HD Property Services Limited",
          meters: [
            {
              address: "[MOCK] Unit 7B, Old Bridge Way, Shefford SG17 5HQ",
              contractEndDate: null,
              emissions: [
                {
                  nationalAverage: 3.12,
                  percentage: 7.5,
                  score: 1,
                  tonnage: 28.21
                }
              ],
              fuelMix: [
                {
                  fuelRenewable: 60.3,
                  nationalAverage: {
                    renewable: 64.1
                  },
                  percentage: 28.3,
                  score: 2
                }
              ],
              meterId: "123456789012345678901",
              supplierId: 1,
              supplierName: "My supplier name",
              usage: [
                {
                  eac: 21896,
                  nationalAverage: 24882,
                  percentage: 88,
                  score: 4
                }
              ]
            }
          ],
          // When a pledge has been made
          pledge: {
            carbonZeroDate: -1, // YYYY: Year to become carbon zero
            dateOfPledge: "",
            originalSupplierName: null, // The supplier when the pledge was made
            originalTotalEmissions: -1, // The CO2 tonnage when the pledge was made
            pledgeId: 2,
            sharedGuid: "26a7facd-3055-45e3-9c2c-87b3bdff9d38"
          }
        }
      ],
      firstName: "Mock firstname",
      lastName: "Mock lastname",
      pledgeStats: {
        totalToday: 0,
        totalUk: 1754,
        totalTonnage: 105000
      }
    },
    "scoreboard"
  );

  res.json(returnJSON);
});

// Retrieve Scoreboard / Emissions data
// [GET] /profile/emissions
app.get("/profile/emissions", (req, res) => {
  const returnJSON = returnJSONData(
    {
      profileId: 0,
      emissions: [
        {
          quoteId: 0,
          min: 0,
          max: 0,
          nationalAverage: 3.12,
          percentage: 7.5,
          score: 1,
          tonnage: 28.21
        }
      ],
      otherBusinesses: [
        {
          supplier: "string",
          emissions: 0
        }
      ]
    },
    "scoreboard"
  );

  res.json(returnJSON);
});

// Retrieve Scoreboard / Fuel mix data
// [GET] /profile/fuelMix
app.get("/profile/fuelMix", (req, res) => {
  const returnJSON = returnJSONData(
    {
      profileId: 0,
      fuels: [
        {
          quoteId: 0,
          fuelRenewable: 28.3,
          nuclear: 0,
          fossil: 0,
          supplierName: "string",
          supplierLogo: "string",
          nationalAverage: {
            renewable: 9.750440251572327,
            nuclear: 13.1337106918239,
            fossil: 4.403522012578616,
            other: 1.6502515723270441,
            renewableMin: 0,
            renewableMax: 100,
            average: 10.02062893081761
          },
          percentage: 28.3,
          score: 2
        }
      ]
    },
    "scoreboard"
  );

  res.json(returnJSON);
});

// Retrieve Scoreboard / Usage data
// [GET] /profile/usage
app.get("/profile/usage", (req, res) => {
  const returnJSON = returnJSONData(
    {
      profileId: 0,
      quoteUsages: [
        {
          quoteId: 0,
          min: 0,
          max: 0,
          energyProfile: {
            additionalProp1: 0,
            additionalProp2: 0,
            additionalProp3: 0
          },
          nationalAverage: 24882,
          percentage: 88,
          eac: 21896,
          score: 4
        }
      ]
    },
    "scoreboard"
  );

  res.json(returnJSON);
});

// Create a new pledge
// [POST] /profile/pledge
app.post("/profile/pledge", (req, res) => {
  // Which carbon zero date was posted to the API?
  // To simulate different responses, only a selection of year 2020 will return a success code
  const carbonZeroDate = req.body.carbonZeroDate;
  const guid = uuidv4();

  const returnJSON = returnJSONData(
    {
      pledgeId: 1,
      sharedGuid: guid
    },
    "scoreboard"
  );

  switch (carbonZeroDate) {
    case 2020:
      res.status(201).send(returnJSON);
      break;
    case 2021:
      res.sendStatus(401);
      break;
    case 2022:
      res.sendStatus(403);
      break;
    case 2023:
      res.sendStatus(404);
      break;
    default:
      res.sendStatus(500);
      break;
  }
});

// Update an existing pledge
// [PUT] /profile/pledge/:pledgeId
app.put("/profile/pledge/:pledgeId", (req, res) => {
  // Which carbon zero date was posted to the API?
  // To simulate different responses, only a selection of year 2020 will return a success code
  const carbonZeroDate = req.body.carbonZeroDate;
  const guid = uuidv4();

  const returnJSON = returnJSONData(
    {
      pledgeId: 2,
      sharedGuid: guid
    },
    "scoreboard"
  );

  switch (carbonZeroDate) {
    case 2020:
      res.status(201).send(returnJSON);
      break;
    case 2021:
      res.sendStatus(401);
      break;
    case 2022:
      res.sendStatus(403);
      break;
    case 2023:
      res.sendStatus(404);
      break;
    default:
      res.sendStatus(500);
      break;
  }
});

// Profile - retrieve data for a public pledge
// [GET] /profile/pledge/:sharedGuid
app.get("/profile/pledge/:sharedGuid", (req, res) => {
  // Return pledge data for a provided sharedGuid
  res.json({
    companyName: "Shared company name",
    contractEndDate: "2020-01-01T00:00:00.000Z",
    customerName: "Shared customer name",
    dateOfPledge: "28/05/2020",
    pledgeId: 1,
    pledgeStats: {
      totalToday: 8,
      totalUk: 256,
      totalTonnage: 65536
    },
    pledgeYear: 2026,
    sharedGuid: "xxx-yyy-zzz",
    tonnage: 64
  });
});

// Profile - scoreboard / request a quote (interim)
// [POST] /requestQuote
app.post("/profile/requestQuote", (req, res) => {
  // Trigger an email to be sent to Zellar
  res.sendStatus(201);
});

// Retrieve business types
// [GET] /quote/businessTypes
app.get("/profile/businessTypes", (req, res) => {
  res.json({
    businessTypes: [
      {
        id: 0,
        name: "Business Type 0"
      },
      {
        id: 1,
        name: "Business Type 1"
      },
      {
        id: 2,
        name: "Business Type 2"
      },
      {
        id: 3,
        name: "Business Type 3"
      },
      {
        id: 4,
        name: "Business Type 4"
      },
      {
        id: 5,
        name: "Business Type 5"
      }
    ]
  });
});

// Quote - Results list
// [GET] /quoteResults/:meterId
app.get("/quoteResults/:meterId", (req, res) => {
  res.json({
    id: "4d78c6aa-a9b3-46a5-87e9-aa91750021c7",
    businessTypeCode: 0,
    companyName: "TEST AIR SERVICES LTD",
    companyAddress: "High Street,\r\nWest Midlands,\r\nB70 7QZ\r\n",
    companyNumber: "06650586",
    contractEndDate: "29/10/2020",
    currentSupplierLogo: "/assets/energy-providers/opus-energy.svg",
    currentSupplier: "Opus Energy Renewables Limited",
    earlierStartDate: null,
    meterId: "1414944260009",
    usage: 12849.0,
    renewable: 100.0,
    quotes: [
      {
        quoteId: "c7a94874-f739-45ba-ad85-3babd18e79f4",
        annualEstimatedCost: 1785,
        earliestStartDate: "29/10/2020",
        validFrom: "15/06/2020",
        validTo: "30/11/2020",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "V43.2AGG",
        pricePlanType: "V43.2AGG",
        productCode: "V43.2AGG",
        monthlyEstimatedCost: 148,
        rates: [
          {
            rate: 13.07,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 29.11,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for BG-Lite",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/british-gas-lite.svg",
          name: "British Gas Lite",
          renewable: 32.8,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.8,
            coal: 5.2,
            gas: 41.4,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 208.0
          },
          tonnesProjected: 2.67
        },
        term: 12,
        vat: 357,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2244,
        monthlyEstimatedCostWithVatAndCcl: 187
      },
      {
        quoteId: "6fd628a4-9cae-40eb-bfeb-329fa4181f59",
        annualEstimatedCost: 1837,
        earliestStartDate: "29/10/2020",
        validFrom: "15/06/2020",
        validTo: "30/11/2020",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "V43.2AGG",
        pricePlanType: "V43.2AGG",
        productCode: "V43.2AGG",
        monthlyEstimatedCost: 153,
        rates: [
          {
            rate: 13.45,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 30.08,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for BG-Lite",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/british-gas-lite.svg",
          name: "British Gas Lite",
          renewable: 32.8,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.8,
            coal: 5.2,
            gas: 41.4,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 208.0
          },
          tonnesProjected: 2.67
        },
        term: 24,
        vat: 367,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2307,
        monthlyEstimatedCostWithVatAndCcl: 192
      },
      {
        quoteId: "4d6efcc9-2f23-4300-96da-c978ce2fa219",
        annualEstimatedCost: 1877,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "01/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "Fixed for Business 1 Year",
        pricePlanType: "Fixed for Business 1 Year",
        productCode: "ESC1_FIXED_1500_0000_0000_2500_1",
        monthlyEstimatedCost: 156,
        rates: [
          {
            rate: 13.95,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 23.25,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Edf Energy",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/edf-energy.svg",
          name: "EDF",
          renewable: 0.0,
          termsAndConditions: "https://www.edfenergy.com/sme-business/tariffs/terms-conditions",
          fuelMix: {
            renewable: 0.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 100.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 12,
        vat: 375,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2355,
        monthlyEstimatedCostWithVatAndCcl: 196
      },
      {
        quoteId: "e67dd410-35e5-4d31-a5a8-de48efb285e9",
        annualEstimatedCost: 1892,
        earliestStartDate: "29/10/2020",
        validFrom: "15/06/2020",
        validTo: "30/11/2020",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "V43.2AGG",
        pricePlanType: "V43.2AGG",
        productCode: "V43.2AGG",
        monthlyEstimatedCost: 157,
        rates: [
          {
            rate: 13.8,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 32.72,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for BG-Lite",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/british-gas-lite.svg",
          name: "British Gas Lite",
          renewable: 32.8,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.8,
            coal: 5.2,
            gas: 41.4,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 208.0
          },
          tonnesProjected: 2.67
        },
        term: 36,
        vat: 378,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2373,
        monthlyEstimatedCostWithVatAndCcl: 197
      },
      {
        quoteId: "5016630b-4d4e-4321-8689-742607d7db73",
        annualEstimatedCost: 1913,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "01/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "Fixed for Business 2 Year",
        pricePlanType: "Fixed for Business 2 Year",
        productCode: "ESC1_FIXED_1530_0000_0000_2500_2",
        monthlyEstimatedCost: 159,
        rates: [
          {
            rate: 14.229,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 23.25,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Edf Energy",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/edf-energy.svg",
          name: "EDF",
          renewable: 0.0,
          termsAndConditions: "https://www.edfenergy.com/sme-business/tariffs/terms-conditions",
          fuelMix: {
            renewable: 0.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 100.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 24,
        vat: 382,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2398,
        monthlyEstimatedCostWithVatAndCcl: 199
      },
      {
        quoteId: "206ac68a-35b3-41d1-9311-6f5d09a6f689",
        annualEstimatedCost: 1921,
        earliestStartDate: "29/10/2020",
        validFrom: "02/10/2020",
        validTo: "02/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "1864627",
        pricePlanType: "1864627",
        productCode: "1864627",
        monthlyEstimatedCost: 160,
        rates: [
          {
            rate: 14.07,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 31.0,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Eon",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/eon.svg",
          name: "E.On",
          renewable: 27.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 27.0,
            coal: 7.1,
            gas: 48.3,
            nuclear: 14.5,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 261.0
          },
          tonnesProjected: 3.35
        },
        term: 12,
        vat: 384,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2407,
        monthlyEstimatedCostWithVatAndCcl: 200
      },
      {
        quoteId: "4fe447a9-393b-42a6-80c1-f5ffab432ae2",
        annualEstimatedCost: 1951,
        earliestStartDate: "29/10/2020",
        validFrom: "02/10/2020",
        validTo: "02/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "1864929",
        pricePlanType: "1864929",
        productCode: "1864929",
        monthlyEstimatedCost: 162,
        rates: [
          {
            rate: 14.31,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 31.0,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Eon",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/eon.svg",
          name: "E.On",
          renewable: 27.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 27.0,
            coal: 7.1,
            gas: 48.3,
            nuclear: 14.5,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 261.0
          },
          tonnesProjected: 3.35
        },
        term: 24,
        vat: 390,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2443,
        monthlyEstimatedCostWithVatAndCcl: 203
      },
      {
        quoteId: "72225b8b-712e-464e-a92d-81ea552c425d",
        annualEstimatedCost: 1960,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "01/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "Fixed for Business 3 Year",
        pricePlanType: "Fixed for Business 3 Year",
        productCode: "ESC1_FIXED_1570_0000_0000_2500_3",
        monthlyEstimatedCost: 163,
        rates: [
          {
            rate: 14.601,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 23.25,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Edf Energy",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/edf-energy.svg",
          name: "EDF",
          renewable: 0.0,
          termsAndConditions: "https://www.edfenergy.com/sme-business/tariffs/terms-conditions",
          fuelMix: {
            renewable: 0.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 100.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 36,
        vat: 392,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2454,
        monthlyEstimatedCostWithVatAndCcl: 204
      },
      {
        quoteId: "ce6120b1-9db4-4319-b531-571596682ef6",
        annualEstimatedCost: 2004,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "30/09/2021",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "01/10/2020",
        pricePlanType: "01/10/2020",
        productCode: "01/10/2020",
        monthlyEstimatedCost: 167,
        rates: [
          {
            rate: 14.37,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 43.29,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Ecotricity",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/ecotricity.svg",
          name: "Ecotricity",
          renewable: 100.0,
          termsAndConditions: "https://www.ecotricity.co.uk/customer-service/the-legal-stuff/terms-and-conditions",
          fuelMix: {
            renewable: 100.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 99.8,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 12,
        vat: 400,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2507,
        monthlyEstimatedCostWithVatAndCcl: 208
      },
      {
        quoteId: "5f7318b4-2659-4b81-971a-86c6aec6cdcc",
        annualEstimatedCost: 2015,
        earliestStartDate: "29/10/2020",
        validFrom: "15/09/2020",
        validTo: "14/12/2021",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "MIDE P3 1R 12 months",
        pricePlanType: "MIDE P3 1R 12 months",
        productCode: "MIDE P3 1R 12 months",
        monthlyEstimatedCost: 167,
        rates: [
          {
            rate: 14.685,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 35.22,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Total",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/total-gas-and-power.svg",
          name: "Total",
          renewable: 32.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.0,
            coal: 5.0,
            gas: 53.0,
            nuclear: 6.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 279.0
          },
          tonnesProjected: 3.58
        },
        term: 12,
        vat: 403,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2520,
        monthlyEstimatedCostWithVatAndCcl: 210
      },
      {
        quoteId: "17c40921-9d42-4a87-8d7c-f700c58f9493",
        annualEstimatedCost: 2026,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "30/09/2022",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "01/10/2020",
        pricePlanType: "01/10/2020",
        productCode: "01/10/2020",
        monthlyEstimatedCost: 168,
        rates: [
          {
            rate: 14.53,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 43.6,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Ecotricity",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/ecotricity.svg",
          name: "Ecotricity",
          renewable: 100.0,
          termsAndConditions: "https://www.ecotricity.co.uk/customer-service/the-legal-stuff/terms-and-conditions",
          fuelMix: {
            renewable: 100.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 99.8,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 24,
        vat: 405,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2533,
        monthlyEstimatedCostWithVatAndCcl: 211
      },
      {
        quoteId: "4e58e498-749f-4973-aa8a-7bc2bf1fbf4a",
        annualEstimatedCost: 2038,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "31/03/2022",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "01/10/2020",
        pricePlanType: "01/10/2020",
        productCode: "01/10/2020",
        monthlyEstimatedCost: 169,
        rates: [
          {
            rate: 14.63,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 43.43,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Ecotricity",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/ecotricity.svg",
          name: "Ecotricity",
          renewable: 100.0,
          termsAndConditions: "https://www.ecotricity.co.uk/customer-service/the-legal-stuff/terms-and-conditions",
          fuelMix: {
            renewable: 100.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 99.8,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 30,
        vat: 407,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2548,
        monthlyEstimatedCostWithVatAndCcl: 212
      },
      {
        quoteId: "04959921-c8d7-4f72-b80f-e75e222f32c8",
        annualEstimatedCost: 2048,
        earliestStartDate: "29/10/2020",
        validFrom: "15/09/2020",
        validTo: "14/12/2022",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "MIDE P3 1R 24 months",
        pricePlanType: "MIDE P3 1R 24 months",
        productCode: "MIDE P3 1R 24 months",
        monthlyEstimatedCost: 170,
        rates: [
          {
            rate: 14.925,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 35.83,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Total",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/total-gas-and-power.svg",
          name: "Total",
          renewable: 32.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.0,
            coal: 5.0,
            gas: 53.0,
            nuclear: 6.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 279.0
          },
          tonnesProjected: 3.58
        },
        term: 24,
        vat: 409,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2560,
        monthlyEstimatedCostWithVatAndCcl: 213
      },
      {
        quoteId: "19c50764-0834-4dea-ba73-c3e7216de3f7",
        annualEstimatedCost: 2049,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "31/03/2023",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "01/10/2020",
        pricePlanType: "01/10/2020",
        productCode: "01/10/2020",
        monthlyEstimatedCost: 170,
        rates: [
          {
            rate: 14.71,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 43.69,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Ecotricity",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/ecotricity.svg",
          name: "Ecotricity",
          renewable: 100.0,
          termsAndConditions: "https://www.ecotricity.co.uk/customer-service/the-legal-stuff/terms-and-conditions",
          fuelMix: {
            renewable: 100.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 99.8,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 42,
        vat: 409,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2561,
        monthlyEstimatedCostWithVatAndCcl: 213
      },
      {
        quoteId: "0e0dfa09-2c84-40be-a5c9-1f628f161f3f",
        annualEstimatedCost: 2052,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "30/09/2023",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "01/10/2020",
        pricePlanType: "01/10/2020",
        productCode: "01/10/2020",
        monthlyEstimatedCost: 171,
        rates: [
          {
            rate: 14.73,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 43.85,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Ecotricity",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/ecotricity.svg",
          name: "Ecotricity",
          renewable: 100.0,
          termsAndConditions: "https://www.ecotricity.co.uk/customer-service/the-legal-stuff/terms-and-conditions",
          fuelMix: {
            renewable: 100.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 99.8,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 36,
        vat: 410,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2565,
        monthlyEstimatedCostWithVatAndCcl: 213
      },
      {
        quoteId: "acaf83a4-6af3-4cec-8526-42f53a9c0a5d",
        annualEstimatedCost: 2100,
        earliestStartDate: "29/10/2020",
        validFrom: "15/09/2020",
        validTo: "14/12/2023",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "MIDE P3 1R 36 months",
        pricePlanType: "MIDE P3 1R 36 months",
        productCode: "MIDE P3 1R 36 months",
        monthlyEstimatedCost: 175,
        rates: [
          {
            rate: 15.315,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 36.42,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Total",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/total-gas-and-power.svg",
          name: "Total",
          renewable: 32.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.0,
            coal: 5.0,
            gas: 53.0,
            nuclear: 6.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 279.0
          },
          tonnesProjected: 3.58
        },
        term: 36,
        vat: 420,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2622,
        monthlyEstimatedCostWithVatAndCcl: 218
      },
      {
        quoteId: "42ebba0d-0365-4ddc-adea-e478dc284146",
        annualEstimatedCost: 2153,
        earliestStartDate: "29/10/2020",
        validFrom: "15/09/2020",
        validTo: "14/12/2024",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "MIDE P3 1R 48 months",
        pricePlanType: "MIDE P3 1R 48 months",
        productCode: "MIDE P3 1R 48 months",
        monthlyEstimatedCost: 179,
        rates: [
          {
            rate: 15.705,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 37.01,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Total",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/total-gas-and-power.svg",
          name: "Total",
          renewable: 32.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.0,
            coal: 5.0,
            gas: 53.0,
            nuclear: 6.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 279.0
          },
          tonnesProjected: 3.58
        },
        term: 48,
        vat: 430,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2686,
        monthlyEstimatedCostWithVatAndCcl: 223
      },
      {
        quoteId: "0951f4b0-f3ee-4961-a038-7c88c2376849",
        annualEstimatedCost: 2157,
        earliestStartDate: "29/10/2020",
        validFrom: "02/10/2020",
        validTo: "02/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "1865153",
        pricePlanType: "1865153",
        productCode: "1865153",
        monthlyEstimatedCost: 179,
        rates: [
          {
            rate: 15.91,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 31.0,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Eon",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/eon.svg",
          name: "E.On",
          renewable: 27.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 27.0,
            coal: 7.1,
            gas: 48.3,
            nuclear: 14.5,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 261.0
          },
          tonnesProjected: 3.35
        },
        term: 36,
        vat: 431,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2691,
        monthlyEstimatedCostWithVatAndCcl: 224
      },
      {
        quoteId: "c27f99b1-a187-4a00-bbc8-8f1ddcfd9057",
        annualEstimatedCost: 2213,
        earliestStartDate: "29/10/2020",
        validFrom: "15/09/2020",
        validTo: "14/12/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "MIDE P3 1R 60 months",
        pricePlanType: "MIDE P3 1R 60 months",
        productCode: "MIDE P3 1R 60 months",
        monthlyEstimatedCost: 184,
        rates: [
          {
            rate: 16.155,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 37.68,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Total",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/total-gas-and-power.svg",
          name: "Total",
          renewable: 32.0,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.0,
            coal: 5.0,
            gas: 53.0,
            nuclear: 6.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 279.0
          },
          tonnesProjected: 3.58
        },
        term: 60,
        vat: 442,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2758,
        monthlyEstimatedCostWithVatAndCcl: 229
      },
      {
        quoteId: "67ac94d1-16b2-4a6f-901f-f9fb8b3a3dba",
        annualEstimatedCost: 2271,
        earliestStartDate: "29/10/2020",
        validFrom: "01/10/2020",
        validTo: "01/10/2025",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "Fixed for Business 4 Year",
        pricePlanType: "Fixed for Business 4 Year",
        productCode: "ESC1_FIXED_1830_0000_0000_2500_4",
        monthlyEstimatedCost: 189,
        rates: [
          {
            rate: 17.019,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 23.25,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for Edf Energy",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/edf-energy.svg",
          name: "EDF",
          renewable: 0.0,
          termsAndConditions: "https://www.edfenergy.com/sme-business/tariffs/terms-conditions",
          fuelMix: {
            renewable: 0.0,
            coal: 0.0,
            gas: 0.0,
            nuclear: 100.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 0.0
          },
          tonnesProjected: 0
        },
        term: 48,
        vat: 454,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2827,
        monthlyEstimatedCostWithVatAndCcl: 235
      },
      {
        quoteId: "3ef75529-4448-434f-9676-396f836a6183",
        annualEstimatedCost: 2290,
        earliestStartDate: "29/10/2020",
        validFrom: "15/06/2020",
        validTo: "30/11/2020",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "V43.2AGG",
        pricePlanType: "V43.2AGG",
        productCode: "V43.2AGG",
        monthlyEstimatedCost: 190,
        rates: [
          {
            rate: 15.05,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 97.72,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for BG-Lite",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/british-gas-lite.svg",
          name: "British Gas Lite",
          renewable: 32.8,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.8,
            coal: 5.2,
            gas: 41.4,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 208.0
          },
          tonnesProjected: 2.67
        },
        term: 48,
        vat: 458,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2850,
        monthlyEstimatedCostWithVatAndCcl: 237
      },
      {
        quoteId: "b4de1129-e147-49e1-a40b-cffa1bd32c6e",
        annualEstimatedCost: 2378,
        earliestStartDate: "29/10/2020",
        validFrom: "15/06/2020",
        validTo: "30/11/2020",
        feedInTariff: null,
        paymentMethod: "Direct Debit",
        pricePlanName: "V43.2AGG",
        pricePlanType: "V43.2AGG",
        productCode: "V43.2AGG",
        monthlyEstimatedCost: 198,
        rates: [
          {
            rate: 15.71,
            type: "Single Rate",
            unit: "per kWh"
          }
        ],
        standingCharge: 98.68,
        standingChargeUnit: "Daily",
        supplier: {
          additionalInformation: "Additional info for BG-Lite",
          customerSatisfaction: 0,
          logo: "/assets/energy-providers/british-gas-lite.svg",
          name: "British Gas Lite",
          renewable: 32.8,
          termsAndConditions: null,
          fuelMix: {
            renewable: 32.8,
            coal: 5.2,
            gas: 41.4,
            nuclear: 0.0,
            thermal: 0.0,
            wind: 0.0,
            hydro: 0.0,
            other: 0,
            emissionsGramPerKwh: 208.0
          },
          tonnesProjected: 2.67
        },
        term: 60,
        vat: 475,
        ccl: 102,
        annualEstimatedCostWithVatAndCcl: 2956,
        monthlyEstimatedCostWithVatAndCcl: 246
      }
    ]
  });
});

// Save Contract End Date and Business Type
// [PATCH] /profile/companyAdditionalDetails
app.patch("/profile/companyAdditionalDetails", (req, res) => {
  res.sendStatus(201);
});

// Scoreboard / request a quote
// [POST] /quote/requestQuote
app.post("/contracts", (req, res) => {
  // Trigger an email to be sent to the user
  res.sendStatus(201);
});

app.listen(port, () => {
  console.log(`API available @ http://localhost:${port}`);
});
