/**
 * Log a user in, so that they are logged in for any protected resources / endpoints
 * @command login
 * @param {string} environment - Either "mock" || "dev" || "test" || "live"
 */
Cypress.Commands.add("login", (environment) => {
  cy.readFile(`./cypress/commands/login/data/${environment}.json`).then((contents) => {
    const { emailAddress, password } = contents;

    // ******************************
    // **** SIGNIN / GET STARTED ****
    // ******************************

    // Check that the URL being tested is the Signin / Get Started screen
    cy.url().should("include", "/signin/get-started");

    // Check that the email address field exists
    cy.get("[data-cy='signin.get-started.email-address']")
      .should("be.visible")
      .focus()
      .type(emailAddress);

    // Check that a matching company name has been found against the entered company name search
    cy.get("[data-cy='signin.get-started.get-started']")
      .should("exist")
      .click();

    // Pause the test so that the API response is allowed to return
    // There is a 10s limit for this, as specified within /cypress.json (requestTimeout)
    cy.wait("@api.signin.get-started");

    // ************************
    // **** SIGNIN / LOGIN ****
    // ************************

    // Check that the URL being tested is the Signin / Login screen
    cy.url().should("include", "/signin/login");

    // Check that the email address (as entered) is pre-populated in the email address field
    cy.get("[data-cy='signin.login.email-address']")
      .should("be.disabled")
      .should("have.value", emailAddress);

    // Change the type of the password field so that the entered password can be seen
    cy.get("[data-cy='signin.password.show-hide']")
      .should("be.visible")
      .click();

    // Fill in the password in order to attempt a valid login
    cy.get("[data-cy='signin.login.password']")
      .focus()
      .type(password);

    // Click the login button
    cy.get("[data-cy='signin.login.login']")
      .should("exist")
      .click();

    cy.wait("@api.signin.login");
  });
});
