/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Producer hub functionality', () => {
  it('Should load the producer hub page', () => {

    if (!env.USES_PRODUCER_HUB) {
      return
    }

    cy.viewport(1024, 768)

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains(/(producer hubss)/i)
      .first()
      .click()

    cy.get('.programme-search__input').type(env.PRODUCER_NAME || 'e')
    cy.get('#react-autowhatever-1--item-0', { timeout: 20000 }).click()
  })
})
