describe('<Layout> (desktop)', () => {
  // Set the viewport to desktop dimensions for each test
  beforeEach(function () {
    cy.visit('/');
    cy.viewport(992, 1000);
  });

  it('Shows the sidebar by default', function(){
    cy.get('.ant-layout-sider').should('be.visible');
  });
});

describe('<Layout> (mobile)', () => {
  // Set the viewport to mobile (iPhone X) dimensions for each test
  beforeEach(function () {
    cy.visit('/');
    cy.viewport('iphone-x');
  });

  it('Shows the drawer when requested', function(){
    // The <Drawer> should not exist on initial page
    cy.get('.ant-drawer').should('not.exist');

    // Click the toggle button
    cy.get('[data-cy="toggle-drawer"]')
      .click()
      .then(() => {
        cy.get('.ant-drawer')
          .should('have.class', 'ant-drawer-open')
          .should('be.visible')
      });
  });

  it('Closes a visible <Drawer> by pressing the escape key', function(){
    // Show the <Drawer>
    cy.get('[data-cy="toggle-drawer"]').click();

    // Hide the <Drawer> by pressing the escape key
    cy.get('body').type('{esc}');
  });

  it('Closes a visible <Drawer> by clicking anywhere on the document body', function(){
    // Show the <Drawer>
    cy.get('[data-cy="toggle-drawer"]').click();

    // Hide the <Drawer> by clicking anywhere on the document body
    cy.get('body').click();
  });

  it('Expands a visible drawer to its expanded state, then back to its contracted state', function(){
    // Show the <Drawer>
    cy.get('[data-cy="toggle-drawer"]').click();

    // Show the <Drawer> in its most expanded state
    cy.get('[data-cy="drawer-expand"]').click();

    // Return the <Drawer> to its usual expanded height
    cy.get('[data-cy="drawer-contract"]').click();

    // When returning to a contracted state (from an expanded state), it is possible the scroll offset needs resetting to ensure the scrolloffset of any overflows is 0px
    cy.get('[data-cy="resource-list-pages"]:eq(0)').scrollTo('top');

    // Hide the <Drawer> by clicking anywhere on the document body
    cy.get('body').click();
  });
});