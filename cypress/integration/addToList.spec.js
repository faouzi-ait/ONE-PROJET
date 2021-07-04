/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Add to list functionality', () => {
  it('Should open the catalogue page, click add to list and the modal will open with list rendered', () => {

    cy.viewport(1600, 1200)    

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }

    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.wait(3000)
    cy.percySnapshot(`${Cypress.env('CLIENT')} - Home Page`)
    
    cy.get('[test-id="menu_toggle"]').click()

    if (env.TOP_NAVIGATION) {
      cy.get('.top-navigation', { timeout: 30000 })
      .contains(env.CATALOGUE_NAME)
      .click()
    } else {
      cy.get('.navigation')
        .contains(env.CATALOGUE_NAME)
        .click()
    }

    // click on the first cards add to list button
    cy.wait(3000)
    cy.get(`[test-id="add_to_list_button"]`)
      .first()
      .click()

    //if lists have loaded there will be a card here
    cy.wait(3000)
    cy.get(`[test-id="list_modal"]`)
    .find(`.card`).first()
    .click()
  })
})
