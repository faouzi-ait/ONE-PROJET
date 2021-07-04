/// <reference types="Cypress" />

const env = Cypress.env(Cypress.env('CLIENT'))

context('Admin functionality', () => {
  it('Should not whitescreen on any admin page', () => {

    cy.viewport(1600, 1200)

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

    cy.get('.cms-navigation')
      .contains('Admin')
      .click()

    cy.get('.sub-navigation')
      .contains('Companies')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Users')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Roles')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Approvals')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Permissions')
      .click()
    cy.get('.page-header')

    if (env.USES_TERRITORIES) {
      cy.get('.sub-navigation')
        .contains('Territories')
        .click()
      cy.get('.page-header')
    }

    cy.get('.cms-navigation')
      .contains('Content Management')
      .click()

    cy.get('.sub-navigation')
      .contains('Pages')
      .click()
    cy.get('.page-header', { timeout: 30000 })

    cy.get('.sub-navigation')
      .contains('News')
      .click()
    cy.get('.page-header')

    cy.get('.cms-navigation')
      .contains(/(Programme|Program|Series|Show) Management/)
      .click()

    cy.get('.sub-navigation')
      .contains(/(Programmes|Programs|Series|Show|)/)
      .click()
    cy.get('.page-header', { timeout: 30000 })

    cy.get('main')
      .get('.action-menu__trigger')
      .first()
      .click()

    cy.get('main')
      .get('.action-menu__list')
      .contains(/Manage Images/i)
      .click()

    cy.get('main')
      .get('.file-input')
      .contains(/Manage Banner/i, { timeout: 30000 })
      .click()

    cy.get('.cms-navigation')
      .contains(/(Programme|Program|Series|Show) Management/)
      .click()
      
    cy.get('.sub-navigation')
      .contains('Videos')
      .click()
    cy.get('.page-header', { timeout: 30000 })

    /**
     * Checking that the 'new video'
     * modal opens
     */
    cy.get('.page-header').contains(/New Video/i).click()
    cy.get('.cms-modal__close')
      .last()
      .click()    

    cy.get('.sub-navigation')
      .contains('Genres', { timeout: 30000 })
      .click()
    cy.get('.page-header')

    if (env.USES_PROGRAMME_TYPES) {
      cy.get('.sub-navigation')
        .contains('Programme Types')
        .click()
      cy.get('.page-header')
    }

    cy.get('.sub-navigation')
      .contains('Qualities')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Languages')
      .click()
    cy.get('.page-header')

    if (env.USES_TALENTS) {
      cy.get('.sub-navigation')
        .contains('Talents')
        .click()
      cy.get('.page-header')
    }

    cy.get('.sub-navigation')
      .contains(/(Production Companies|Producers)/)
      .click()
    cy.get('.page-header')

    if (env.USES_BROADCASTERS) {
      cy.get('.sub-navigation')
        .contains('Broadcasters')
        .click()
      cy.get('.page-header')
    }

    cy.get('.sub-navigation')
      .contains('Custom Attributes')
      .click()
    cy.get('.page-header')

    if (env.USES_WEIGHTED_SEARCH) {
      cy.get('.sub-navigation')
        .contains('Weighted Search Terms')
        .click()
      cy.get('.page-header')
    }

    if (env.USES_IMPORT) {
      cy.get('.sub-navigation')
        .contains('Import')
        .click()
      cy.get('.page-header')
    }
    if (env.USES_VIDEO_DOWNLOAD_LINKS) {
      cy.get('.sub-navigation')
        .contains('Video Download Link')
        .click()
      cy.get('.page-header', { timeout: 30000 })
    }

    cy.get('.cms-navigation')
      .contains('Asset Management')
      .click()

    cy.get('.sub-navigation')
      .contains('Categories')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Assets')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Permissions')
      .click()
    cy.get('.page-header')

    cy.get('.sub-navigation')
      .contains('Assets Access')
      .click()
    cy.get('.page-header')

    if (env.USES_APP) {
      cy.get('.cms-navigation')
        .contains('App Management')
        .click()
      
      cy.get('.sub-navigation')
        .contains('Highlights')
        .click()
      cy.get('.page-header')

    }

    if (env.USES_MARKETING) {
      cy.get('.cms-navigation')
        .contains('Marketing')
        .click()
      cy.get('.sub-navigation')
        .contains('Categories')
        .click()
      cy.get('.page-header', { timeout: 30000 })

      cy.get('.sub-navigation')
        .contains('Activities')
        .click()
      cy.get('.page-header')
    }
    if (env.USES_PASSPORT) {
      cy.get('.cms-navigation')
        .contains('ITVS Passport')
        .click()

      cy.get('.sub-navigation')
        .contains('Market')
        .click()
      cy.get('.page-header')

      cy.get('.sub-navigation')
        .contains('Invoice Types')
        .click()
      cy.get('.page-header')

      cy.get('.sub-navigation')
        .contains('User Types')
        .click()
      cy.get('.page-header')
    }
  })
})
