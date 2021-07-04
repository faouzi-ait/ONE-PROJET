## What is Cypress?

Cypress is an end to end testing tool that clicks through our site as if a real user were piloting it. It lets us check for runtime errors in our code before pushing to production.

## How do I run it?

`npm i`

Go to 1password and search for cypress.json. Take the contents of that file and paste it into `cypress.json` at the root of your project. NEVER commit this file to the repo - it contains admin passwords.

### Run it so you can see it

`npm run start cineflix`

In a separate terminal, run `npm run cypress:open`

Change the value of CLIENT in cypress.json to `cineflix`, or the client you're testing

You can now open the cypress window and run whichever tests you like.

### Run in background (handy for CI)

Run `bash cypress/runInAllClients.sh`

This will load your local server, run cypress, and exit if it fails. When it fails, it will leave behind an mp4 video of its failure at cypress/videos, as well as a screenshot at cypress/screenshots.