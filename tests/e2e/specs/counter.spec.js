describe('Counter Test', () => {
  before(() => {
    cy.login('foo', 'bar');
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('session');
    cy.visit('/');
    cy.get('a#link_about').click();
  });
  it('Reset counter', () => {
    cy.get('button#btn_reset').click();
    cy.contains('span#info_counter', 'Counter: 0').should('not.be.null');
  });
  it('Increment counter', () => {
    cy.get('button#btn_reset').click();
    cy.get('button#btn_increment').click();
    cy.contains('span#info_counter', 'Counter: 1').should('not.be.null');

    cy.get('button#btn_increment').click();
    cy.contains('span#info_counter', 'Counter: 2').should('not.be.null');
  });
});
