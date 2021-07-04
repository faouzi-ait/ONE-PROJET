/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Register functionality', () => {
  it('Should load the register page', () => {

    cy.server()

    cy.visit(Cypress.env('URL'))
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    if (env.REGISTER_BUTTON_IN_NAVIGATION) {
      cy.get('[test-id="menu_toggle"]').click()
      cy.get('.navigation')
        .contains(/register/i)
        .click()
    } else {
      cy.get('header')
        .contains(/register/i)
        .first()
        .click()
    }

    cy.get('form')
    cy.percySnapshot(`${Cypress.env('CLIENT')} - Register Page`)
  })
})
