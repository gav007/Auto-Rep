describe('User onboarding', () => {
  it('loads the onboarding page', () => {
    cy.visit('/');
    cy.contains('Create My Workout Plan').should('be.visible');
  });
});
