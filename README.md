# ONE Web

## Getting Started
- Clone the repo
- CD into the project folder
- Run `npm install`
- Run `npm start [CLIENT_NAME]`

A full list of clients can be found in `/src/theme`. On build the theme folder for the current running client will be copied across to the root of the project so changes to stylesheets, images, config etc. should be made in the client's theme folder.

If starting a new client, RTV theme should be used as the base.

## ONE Lite - Running lite locally
- Run `npm run lite onetv`

## How to Deploy
- Netlify will automatically deploy from master and staging branches.
- Deploys to staging will automatically publish.
- Deploys to **Production:** will require publishing via the Netlify dashboard.
- Deploy your individual branch to a branch deploy (for dev testing and code sharing) by running `npm run deploy <client>`. To deploy to all clients, run `npm run deploy all`
- Staging deploys are currently completed by Circle CI. Please read CIRCLE-CI.md


## How to change the models in javascript/models

We inject a big stack of models into our JSON API client, devour, at runtime. In order to not put the burden of parsing all our models at runtime, we pre-build them into a JSON object at src/javascript/models. This script runs whenever you run the repo locally or build it for staging or production. You can run it yourself by running `npm run build-models`.

## Further docs

- [Deployments](https://github.com/rawnet/one-web/blob/master/docs/deployments.md)
- [Client configuration](https://github.com/thisisonetv/one-web/blob/master/docs/client-configuration.md)
- [Onboarding a Pro Client](https://github.com/rawnet/one-web/blob/master/docs/pro-clients.md)
- [Onboarding a LITE Client](https://github.com/rawnet/one-web/blob/master/docs/lite-clients.md)
- [Virtual Screening Room](https://github.com/rawnet/one-web/blob/master/docs/virtual-screening-room.md)
