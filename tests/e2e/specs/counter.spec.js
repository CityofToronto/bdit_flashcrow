describe('Counter Test', () => {
  it('Load app root', () => {
    cy.visit('/');
    cy.contains('h1', 'Log In');
  });
  it('Log in', () => {
  });
});
