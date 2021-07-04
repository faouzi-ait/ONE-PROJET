const env = Cypress.env(Cypress.env('CLIENT'))

const extractQueryParam = (url, paramName) => {
  return url
    .substring(url.indexOf(paramName))
    .split('=')[1]
    .split('&')[0];
}

Cypress.Commands.add('oktaLogin', () => {
  cy.request({
    method: 'GET',
    url: `https://api-${Cypress.env('CLIENT')}.rawnet.one/oauth/okta`,
    headers: {
      'x-web-api-key': Cypress.env('API_KEY'),
      'Content-Type': 'application/json'
    },
  }).then(oAuthResponse => {
    const authorizeUrl = oAuthResponse.body.authorize_url;
    const state = extractQueryParam(authorizeUrl, 'state');
    const clientId = extractQueryParam(authorizeUrl, 'client_id');
    cy.request({
      method: 'POST',
      url: env.OKTA.session_token_url,
      body: {
        username: Cypress.env('OKTA_USERNAME'),
        password: Cypress.env('OKTA_PASSWORD'),
        options: {
          warnBeforePasswordExpired: 'true'
        }
      }
    }).then(oktaSessionResponse => {
      const queryStringParams = {
        client_id: clientId,
        state: state,
        redirect_uri: env.OKTA.redirect_uri,
        response_type: 'code',
        scope: 'openid profile email offline_access',
        sessionToken: oktaSessionResponse.body.sessionToken
      };
      cy.request({
        method: 'GET',
        url: env.OKTA.auth_token_url,
        form: true,
        followRedirect: false,
        qs: queryStringParams
      }).then(oktaCodeResponse => {
        const redirectUrl = oktaCodeResponse.redirectedToUrl
        const localUrl = Cypress.env('URL') || env.URL
        const localRedirect = `${localUrl}/oauth/okta/redirect${redirectUrl.slice(redirectUrl.indexOf('?'))}`
        cy.visit(localRedirect);
      });
    });
  });
});