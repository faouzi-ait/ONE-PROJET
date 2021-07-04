/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Reporting functionality', () => {
  it('Should open the reporting page', () => {

    cy.viewport(1024, 768)

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains(/(reporting)/i)
      .first()
      .click()

    cy.get('.tabs', { timeout: 30000 }).contains(/(Production Companies|Producers|producer)/i).click()
    cy.get('.programme-search__input').type(env.PRODUCER_NAME || 'e')

    cy.get('.tabs').contains(/(Programmes|Program|Series|Show)/i).click()
    cy.get('.programme-search__input').type(env.CATALOGUE_ITEM_NAME)
    cy.get('#react-autowhatever-1--item-0', { timeout: 20000 }).click()

    cy.get('.tabs').contains(/users|user/i).click()

    cy.get('.tabs').contains(/individual users/i).click()
    cy.get('.programme-search__input').type(env.USER_NAME || 'e')
    cy.get('#react-autowhatever-1--item-0', { timeout: 20000 }).click()
  })
})
