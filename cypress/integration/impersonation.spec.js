/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Impersonation', () => {
  it('Impersonate should be in the list of allocatable roles', () => {

    cy.viewport(1024, 768)

    cy.server()

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains('Admin')
      .click()

    /** From now, we're in the CMS */

    cy.get('.cms-navigation', { timeout: 30000 })
      .contains('Admin')
      .click()

    cy.get('.sub-navigation')
      .contains('Roles')
      .click()
    cy.get('.page-header')

    cy.get('table').contains('Actions').first().click()

    cy.get('.action-menu__list').contains('Edit').click()

    cy.get('.cms-modal__content').contains(/impersonate/i)
  })
})
