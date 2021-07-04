/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Content blocks', () => {
  it('It should open the add forms for all content blocks', () => {

    cy.viewport(1024, 768)

    cy.server()

    if(env.OKTA) {
      cy.oktaLogin();
      cy.wait(3000)
    } else {
      cy.userLogin();
    }
    // cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation', { timeout: 30000 })
      .contains('Admin')
      .click()

    /** From now, we're in the CMS */

    cy.get('.cms-navigation')
      .contains('Content Management')
      .click()

    cy.get('.sub-navigation')
      .contains('Pages')
      .click()

    cy.get('main')
      .get('.cms-tabs__item', { timeout: 30000 })
      .first()
      .click()

    cy.get('main')
      .get('.action-menu__trigger', { timeout: 30000 })
      .first()
      .click()

    cy.get('main')
      .get('.action-menu__list')
      .contains(/Manage Content/i)
      .click()

    cy.get('.page-header', { timeout: 20000 }).scrollIntoView()

    // cy.get('main').get('.mock-page__block').first().get('button').contains(/Edit/i).click()

    // cy.get('.modal__close', { timeout: 20000 })
    //   .first()
    //   .click()
  })
})
