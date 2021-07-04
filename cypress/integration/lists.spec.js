/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Lists functionality', () => {
  it('Should open the lists page', () => {

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains(/(lists|playlists|watchlists)/i, { timeout: 30000 })
      .first()
      .click()

    cy.contains(/My (lists|playlists|watchlists)/i, { timeout: 30000 })

    cy.contains(/Global (lists|playlists|watchlists)/i, { timeout: 30000 })

    cy.contains(/My (lists|playlists|watchlists)/i, { timeout: 30000 }).click({ force: true })

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains(/(lists|playlists)/i)
      .first()
      .click()

    cy.contains(/Global (lists|playlists|watchlists)/i, { timeout: 30000 })
    cy.percySnapshot(`${Cypress.env('CLIENT')} - Lists Page`)

    cy.contains(/Global (lists|playlists|watchlists)/i).click({ force: true })

    cy.get(':nth-child(1) > .card__content > .card__link', { timeout: 30000 }).click({
      force: true,
    })
  })
})
