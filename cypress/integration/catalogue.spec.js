/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Catalogue functionality', () => {
  it('Should open the catalogue page, search for a catalogue item and play a video', () => {

    cy.viewport(1600, 1200)

    cy.server()    

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
          
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()
    
    cy.get('[test-id="menu_toggle"]', { timeout: 30000 }).click()

    if (env.TOP_NAVIGATION) {
      cy.get('.top-navigation', { timeout: 30000 })
      .contains(env.CATALOGUE_NAME)
      .click()
    } else {
      cy.get('.navigation', { timeout: 30000 })
        .contains(env.CATALOGUE_NAME)
        .click()
    }
    
    cy.get('.card', { timeout: 30000 })
    cy.percySnapshot(`${Cypress.env('CLIENT')} - Catalogue Search Page`)

    cy.get('#catalogue-search').type(env.CATALOGUE_ITEM_NAME)
    cy.get('#react-autowhatever-1-section-0-item-0').click()

    cy.wait(3000)
    cy.percySnapshot(`${Cypress.env('CLIENT')} - Programme Page`)

    cy.get('.video-carousel', { timeout: 30000 })
      .get(`[test-id="click_to_open_video"]`, { timeout: 30000 })
      .first()
      .click({ force: true })

    cy.get('[test-id="modal-video"]', { timeout: 20000 })
    cy.get('[test-id="close_modal_button"]').click()
  })
})
