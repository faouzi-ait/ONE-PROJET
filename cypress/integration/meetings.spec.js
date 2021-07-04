/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Meetings functionality', () => {
  it('Should load the meetings page', () => {

    if (env.MEETINGS_OFF) {
      return
    }

    cy.viewport(1600, 1200)

    if(env.OKTA) {
      cy.oktaLogin();
    } else {
      cy.userLogin();
    }
    cy.get('.cookie-policy__banner', { timeout: 30000 }).find(`.button`).first().click()

    cy.get('[test-id="menu_toggle"]').click()

    cy.get('.navigation')
      .contains(/(meetings)/i)
      .first()
      .click()

    cy.get('.meetings__range > :nth-child(1)', { timeout: 30000 })
      .click()
      .click()
      .click()

    cy.get('.meetings__range > :nth-child(3)', { timeout: 30000 }).click()

    cy.contains(/today/i).click()

    cy.contains(/clear filters/i).click()

    cy.get('.calendar__view').scrollTo(0, 120)
    cy.get('.calendar__view').scrollTo(0, 50)
    cy.get('.calendar__view').scrollTo(0, 800)

    cy.contains(/search for an attendee/i).click()
    cy.get('.modal__search > input').type(env.USER_NAME || 'a')

    cy.get('.modal__content')
      .contains(/completed/i)
      .click()

    cy.get('tbody')
      .contains(/view/i)
      .click()

    cy.get('.modal__content')
      .contains(/notes/i)
      .click()
    cy.get('.modal__content')
      .contains(/list/i)
      .click()
    cy.get('.modal__content')
      .contains(/summary/i)
      .click()
  })
})
