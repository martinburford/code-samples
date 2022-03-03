// Retrieve the environment configuration for the specific environment the test is being run against
const environment = Cypress.env("environment");
const {
  apiEndpoints: {
    urlPrefixes: { scoreboard: scoreboardApiPrefix, signin: signinApiPrefix }
  }
} = Cypress.env()[environment];

describe("Scoreboard / Happy path", () => {
  before(() => {
    // Load the login flow as this test contains protected endpoints
    require("../../../commands/login/test.spec.js");
    require("../../../commands/modal-launch-and-hide/test.spec.js");

    // Set the viewport to desktop dimensions for each test
    cy.viewport(1024, 1366); // 1024,1366 || 375,812

    // Initialize a server in order to allow test execution delays whilst API responses are returned
    cy.server();
    cy.route("GET", `${signinApiPrefix}/accounts?email=*`).as("api.signin.get-started");
    cy.route("POST", `${signinApiPrefix}/auth/local`).as("api.signin.login");
    cy.route("GET", `${scoreboardApiPrefix}/scoreboard`).as("api.scoreboard.dashboard");
  });

  it("Completes the Scoreboard flow (happy path)", function() {
    cy.readFile(`./cypress/e2e/scoreboard/happy-path/data/${environment}.json`).then((contents) => {
      const {
        scoreboard: {
          overview: { companyAddress, companyName }
        }
      } = contents;

      // Load the entry URL for the Onboarding flow
      cy.visit(Cypress.config().baseUrl);

      // ******************************
      // **** ONBOARDING / WELCOME ****
      // ******************************

      // Progress onto the Business Sign Up screen
      cy.get("[data-cy='onboarding.welcome.login']")
        .should("be.visible")
        .click({ force: true }); // force: true is used here because the Beta blocker may be layered over the top of the "Let's go" button

      // Perform centralized login
      cy.login(environment);

      // *******************************
      // **** SCOREBOARD / OVERVIEW ****
      // *******************************

      // Check that the URL being tested is the Scoreboard / Overview screen
      cy.url().should("include", "/scoreboard/overview");

      // Check that the “Logout” link is visible in the header
      cy.get("[data-cy='component.logo-bar.logout']").should("exist");

      // Wait for the Scoreboard API data to be returned and rendered on screen
      cy.wait("@api.scoreboard.dashboard");

      // Check that the Company Name in the scoreboard header is correct for the logged in user
      cy.get("[data-cy='scoreboard.overview.company-name']")
        .should("exist")
        .should("have.text", companyName);

      // Check that the Company Address in the scoreboard header is correct for the logged in user
      cy.get("[data-cy='scoreboard.overview.company-address']")
        .should("exist")
        .should("have.text", companyAddress);

      // Check that the Page title says “My scoreboard”
      cy.get("[data-cy='scoreboard.overview.main-heading']")
        .should("exist")
        .should("have.text", "My scoreboard");

      // Check that the FAQs exist
      cy.get("[data-cy='scoreboard.overview.faqs']")
        .should("exist")
        .find("[role='tab']")
        .its("length")
        .should("be.gt", 0);

      // Check that the first FAQ expands correctly
      cy.get("[data-cy='scoreboard.overview.faqs'] [role='tab']")
        .eq(0)
        .click()
        .next()
        .should("have.class", "ant-collapse-content ant-collapse-content-active");

      // Check that the Pledge section is visible
      cy.get("[data-cy='scoreboard.onboarding.pledge']").should("exist");

      // Check that there are 3 scoreboard cards (emissions / fuel mix / usage)
      cy.get("[data-cy='scoreboard.overview.card']").should("have.length", 3);

      // Check that when clicking the "Ask a question" link the Intercom widget becomes available
      cy.get(".intercom-app .intercom-messenger-frame").should("not.exist");
      cy.get("[data-cy='scoreboard.overview.ask-a-question']")
        .should("exist")
        .click();
      cy.get(".intercom-app .intercom-messenger-frame").should("exist");

      // A visible Intercom widget closes when requested
      cy.get("[data-cy='scoreboard.overview.ask-a-question']").click();

      // Check that the first scoreboard card has the title "How much electricity do you use?"
      cy.get("[data-cy='scoreboard.overview.card.heading']")
        .eq(0)
        .should("have.text", "How much electricity do you use?")
        .click();

      // Check that the second scoreboard card has the title "What makes your electricity?"
      cy.get("[data-cy='scoreboard.overview.card.heading']")
        .eq(1)
        .should("have.text", "What makes your electricity?");

      // Check that the third scoreboard card has the title "How much CO2 is emitted from creating your electricity?"
      cy.get("[data-cy='scoreboard.overview.card.heading']")
        .eq(2)
        .should("have.text", "How much CO2 is emitted from creating your electricity?");

      // ****************************
      // **** SCOREBOARD / USAGE ****
      // ****************************

      cy.get("[data-cy='scoreboard.overview.card.usage.view']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Usage screen
      cy.url().should("include", "/scoreboard/usage");

      // Check that the performance circle component is visible
      cy.get("[data-cy='scoreboard.usage.performance-circle']").should("exist");

      // Launch and hide the modal
      cy.modalLaunchAndHide(
        "scoreboard.usage.find-out-more",
        "scoreboard.usage.modal.find-out-more",
        "scoreboard.usage.modal.find-out-more.close"
      );

      cy.get("[data-cy='scoreboard.usage.back-to-scoreboard']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Overview screen
      cy.url().should("include", "/scoreboard/overview");

      // *******************************
      // **** SCOREBOARD / FUEL MIX ****
      // *******************************

      cy.get("[data-cy='scoreboard.overview.card.fuel-mix.view']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Fuel Mix screen
      cy.url().should("include", "/scoreboard/fuel-mix");

      // Check that the performance circle component is visible
      cy.get("[data-cy='scoreboard.fuel-mix.performance-circle']").should("exist");

      // Launch and hide the modal
      cy.modalLaunchAndHide(
        "scoreboard.fuel-mix.find-out-more",
        "scoreboard.fuel-mix.modal.find-out-more",
        "scoreboard.fuel-mix.modal.find-out-more.close"
      );

      // Check that the "Change your supplier" button is enabled
      cy.get("[data-cy='component.quote-ctas.change-your-supplier']")
        .should("exist")
        .should("have.text", "Request quotes");

      // Check that the "Set a reminder" button is disabled
      cy.get("[data-cy='component.quote-ctas.set-a-reminder']")
        .should("exist")
        .should("have.text", "Coming soon");

      // Check that the "Use less" button is disabled
      cy.get("[data-cy='component.quote-ctas.use-less']")
        .should("exist")
        .should("have.text", "Coming soon");

      cy.get("[data-cy='scoreboard.fuel-mix.back-to-scoreboard']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Overview screen
      cy.url().should("include", "/scoreboard/overview");

      // ********************************
      // **** SCOREBOARD / EMISSIONS ****
      // ********************************

      cy.get("[data-cy='scoreboard.overview.card.emissions.view']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Fuel Mix screen
      cy.url().should("include", "/scoreboard/emissions");

      // Check that the performance circle component is visible
      cy.get("[data-cy='scoreboard.emissions.performance-circle']").should("exist");

      // Launch and hide the modal
      cy.modalLaunchAndHide(
        "scoreboard.emissions.find-out-more",
        "scoreboard.emissions.modal.find-out-more",
        "scoreboard.emissions.modal.find-out-more.close"
      );

      // Check that the "Change your supplier" button is enabled
      cy.get("[data-cy='component.quote-ctas.change-your-supplier']")
        .should("exist")
        .should("have.text", "Request quotes");

      // Check that the "Set a reminder" button is disabled
      cy.get("[data-cy='component.quote-ctas.set-a-reminder']")
        .should("exist")
        .should("have.text", "Coming soon");

      // Check that the "Use less" button is disabled
      cy.get("[data-cy='component.quote-ctas.use-less']")
        .should("exist")
        .should("have.text", "Coming soon");

      cy.get("[data-cy='scoreboard.emissions.back-to-scoreboard']")
        .should("exist")
        .click();

      // Check that the URL being tested is the Scoreboard / Overview screen
      cy.url().should("include", "/scoreboard/overview");
    });
  });
});
