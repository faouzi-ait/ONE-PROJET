# Lite Clients

Clients that use the Lite version of the ONE platform all use the base 'rtv' theme. Custom styling and configuration is all handled in the cms and saved within the database.

It is therefore a simple process to set up a lite client. Once an api key and url has been provided by back-end, the following will then need updating on the front-end to spin up a new lite client.

### Netlify
- Within netlify, a new environment variable will need to be added here - https://app.netlify.com/sites/one-lite-production/settings/deploys
- A domain name will need to be added here https://app.netlify.com/sites/one-lite-production/settings/domain
- After adding the domain name you will need to click 'Renew Certificate' for the https SSL/TLS certificate

### AWS
- Within aws, a new environment variable will need to be added here to generate pdfs - https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/one-pdf-production-pdf?tab=configuration

### one-web repo
- The client name should be added to the `liteClient` array here - `/src/javascript/utils/lite-clients.js`

### Google Console
- Login to google console here https://www.google.com/u/2/recaptcha/admin (details in 1password) and add a new site v2 with the correct domain
- The site key and secret key will then to be added in the api by backend