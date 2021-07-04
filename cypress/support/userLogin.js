const env = Cypress.env(Cypress.env('CLIENT'))

Cypress.Commands.add('userLogin', () => {
  cy.request({
    method: 'POST',
    url: `https://api-${Cypress.env('CLIENT')}.rawnet.one/user-token`,
    body: {
      auth: {
        email: Cypress.env('EMAIL_ADDRESS'),
        password: Cypress.env('PASSWORD'),
      },
    },
    headers: {
      'x-web-api-key': Cypress.env('API_KEY'),
    },
  })
    .its('body')
    .then((body) => {
      window.localStorage.setItem('AUTH_TOKEN', body.jwt)
    })
    cy.visit(Cypress.env('URL'))
})