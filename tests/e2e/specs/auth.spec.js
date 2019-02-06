describe('Auth Test', () => {
  it('Load app root', () => {
    cy.visit('/');
    cy.hash().should('eq', '#/login');
  });
  it('Log in', () => {
    cy.get('input[name=username]').type('foo');
    cy.get('input[name=password]').type('bar{enter}');
    cy.hash().should('eq', '#/');
    cy.getCookie('sessionId').should('not.be.null');
  });
  it('Log out', () => {
    cy.get('input#btn_logout').click();
    cy.hash().should('eq', '#/login');
  });
});
