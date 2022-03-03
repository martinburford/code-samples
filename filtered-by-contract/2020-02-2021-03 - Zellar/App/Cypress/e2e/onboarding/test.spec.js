// ! To take a screenshot
// cy.screenshot("welcome-screen");

// ! To use a dynamic value from the npm scripts argument list
// Cypress.config().baseUrl || http://localhost:8080

// Retrieve the environment configuration for the specific environment the test is being run against
const environment = Cypress.env("environment");
const {
  apiEndpoints: {
    urlPrefixes: { onboarding: onboardingApiPrefix }
  }
} = Cypress.env()[environment];

describe("Onboarding / Happy path", () => {
  before(() => {
    // Set the viewport to desktop dimensions for each test
    cy.viewport(992, 1000); // 992,1000 || 375,812

    // Initialize a server in order to allow test execution delays whilst API responses are returned
    cy.server();
    cy.route("GET", `${onboardingApiPrefix}/companies/*`).as("api.onboarding.business-sign-up");
    cy.route("GET", `${onboardingApiPrefix}/addresses/*`).as("api.onboarding.address-lookup");
    cy.route("PATCH", `${onboardingApiPrefix}/mpan`).as("api.onboarding.select-mpan");

    cy.task("log", `environment: ${environment}`);
    cy.task("log", `onboardingApiPrefix: ${onboardingApiPrefix}`);
    cy.task("log", `${onboardingApiPrefix}/companies/*`);
    cy.task("log", `${onboardingApiPrefix}/addresses/*`);
    cy.task("log", `${onboardingApiPrefix}/mpan`);
  });

  it("Completes the Business Signup flow (happy path)", function() {
    cy.task("log", `happy-path/data/${environment}.json`);

    cy.readFile(`./cypress/e2e/onboarding/happy-path/data/${environment}.json`).then((contents) => {
      const {
        onboarding: {
          businessSignUp: { companyName, selectedCompanyName },
          addressLookup: { address, selectedAddress },
          lookupSuccess: {
            companyName: lookupSuccessCompanyName,
            address: lookupSuccessAddress,
            supplier,
            meterNumber2,
            checkDigit
          }
        }
      } = contents;

      // Load the entry URL for the Onboarding flow
      cy.visit(Cypress.config().baseUrl);

      // ******************************
      // **** ONBOARDING / WELCOME ****
      // ******************************

      // Progress onto the Business Sign Up screen
      cy.get("[data-cy='onboarding.welcome.lets-go']")
        .should("be.visible")
        .click({ force: true }); // force: true is used here because the Beta blocker may be layered over the top of the "Let's go" button

      cy.task("log", `Welcome lets go button clicked`);

      // ***************************************
      // **** ONBOARDING / BUSINESS SIGN UP ****
      // ***************************************

      // Check that the URL being tested is the Business Sign Up screen
      cy.url().should("include", "/onboarding/business-sign-up");

      cy.task("log", `Business signup URL correct`);

      // Since no company has been selected, the selected tick icon should not be visible
      cy.get("[data-cy='icon-type-ahead-search-api-tick']").should("not.exist");

      cy.task("log", `Business signup tick not exist`);

      // Enter a company name into the typeahead textfield
      cy.get("[data-cy='typeahead-search-api-company-name']")
        .should("be.visible")
        .focus()
        .type(companyName);

      cy.task("log", `Business search: ${companyName}`);

      // Pause the test so that the API response is allowed to return
      // There is a 10s limit for this, as specified within /cypress.json (requestTimeout)
      cy.wait("@api.onboarding.business-sign-up");

      // With a company name having been supplied, the results list should now be visible (and have more than 1 result)
      // 1 result indicates the default "Not a Limited Company? Click here" entry
      cy.get("[data-cy='onboarding.type-ahead-search-api']")
        .should("be.visible")
        .find(">li")
        .its("length")
        .should("be.gt", 1);

      // Check that a matching company name has been found against the entered company name search
      cy.get("[data-cy='onboarding.type-ahead-search-api']>li")
        .eq(0)
        .find("strong")
        .should("have.text", selectedCompanyName)
        .click();

      // With a company now selected, the selected tick icon should now be visible
      cy.get("[data-selector='icon-type-ahead-search-api-tick']").should("be.visible");

      // Select the Consent checkbox
      cy.get("[data-cy='onboarding.business-sign-up.checkbox']")
        .check()
        .should("be.checked");

      // With the Consent now granted, continue to the next screen
      cy.get("[data-cy='onboarding.business-sign-up.next']").click();

      // *************************************
      // **** ONBOARDING / ADDRESS LOOKUP ****
      // *************************************

      // Check that the URL being tested is the Business Sign Up screen
      cy.url().should("include", "/onboarding/address-lookup");

      // Since no company has been selected, the selected tick icon should not be visible
      cy.get("[data-cy='icon-type-ahead-search-api-tick']").should("not.exist");

      // Enter aaddress into the typeahead textfield
      cy.get("[data-cy='typeahead-search-api-address-lookup']")
        .should("be.visible")
        .focus()
        .type(address);

      // Pause the test so that the API response is allowed to return
      // There is a 10s limit for this, as specified within /cypress.json (requestTimeout)
      cy.wait("@api.onboarding.address-lookup");

      // With an address having been supplied, the results list should now be visible (and have more than 0 result)
      // For the sake of testing, an address which always yields results will be used
      cy.get("[data-cy='onboarding.type-ahead-search-api']")
        .should("be.visible")
        .find(">li")
        .its("length")
        .should("be.gt", 0);

      // Check that a matching address has been found against the entered address search
      cy.get("[data-cy='onboarding.type-ahead-search-api']>li")
        .contains(selectedAddress)
        .should("exist")
        .click();

      // With an address now selected, the selected tick icon should now be visible
      cy.get("[data-selector='icon-type-ahead-search-api-tick']").should("be.visible");

      // Select the Consent checkbox
      cy.get("[data-cy='onboarding.address-lookup.checkbox']")
        .check()
        .should("be.checked");

      // With the Consent now granted, continue to the next screen
      cy.get("[data-cy='onboarding.address-lookup.next']").click();

      // *************************************
      // **** ONBOARDING / LOOKUP SUCCESS ****
      // *************************************

      // Check that the URL being tested is the Select MPAN screen
      cy.url().should("include", "/onboarding/lookup-success");

      // Check to make sure the company name matches the test data
      cy.get("[data-cy='onboarding.lookup-success.company-name']").should("have.text", lookupSuccessCompanyName);

      // Check to make sure the address matches the test data
      cy.get("[data-cy='onboarding.lookup-success.address']").should("have.text", lookupSuccessAddress);

      // Check to make sure the supplier matches the test data
      cy.get("[data-cy='onboarding.lookup-success.supplier']").should("have.text", supplier);

      // Check to make sure the MPAN (meterNumber2) matches the test data
      cy.get("[data-cy='onboarding.find-your-mpan.meterNumber2']").should("have.text", meterNumber2);

      // Check to make sure the MPAN (checkDigit) matches the test data
      cy.get("[data-cy='onboarding.find-your-mpan.checkDigit']").should("have.text", checkDigit);
    });
  });
});
