/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Forgotten password functionality', () => {
  it('Should open the login modal, then link and load the forgotten password page', () => {

    if (env.OKTA) {
      return
    }

    cy.server()

    cy.visit(`${Cypress.env('URL')}`)
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="login_button"]').click()
    cy.get('[test-id="forgot_password_button"]', { timeout: 1000 }).click()
  })
})
