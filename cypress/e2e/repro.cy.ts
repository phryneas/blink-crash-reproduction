describe('blink renderer crash repro', () => {
  // The crash needs the churn (virtua RO -> flushSync + fixScrollJump) to
  // coincide with a caret-blink paint while layout is dirty. Reload a few
  // times and idle so those windows line up; a renderer crash fails the run.
  for (let i = 0; i < 8; i++) {
    it(`iteration ${i}: focused caret + virtua resize churn`, () => {
      cy.visit('/');
      // Real user gesture so the frame is truly focused and paints a caret.
      cy.get('[data-testid=caret]').click();
      cy.focused().should('have.attr', 'data-testid', 'caret');
      // Let the rAF churn run against the blinking caret for several seconds.
      cy.wait(6000);
    });
  }
});
