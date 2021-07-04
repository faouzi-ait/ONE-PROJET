# Deployments

The following steps outline the process for deploying the master branch to production sites.

- In the current Jira board, run through the 'Ready For Release' column and add any cards to the weekly release using the 'Fix Versions' field. Check the release list with management.  `https://rawnet.atlassian.net/projects/ONE?selectedItem=com.atlassian.Jira.Jira-projects-plugin%3Arelease-page`
- Once the release is approved, create a `release-x.x.x` branch (e.g. release-23.04.21) Ensure this branch is the latest version of `master`.  Merge all related pull requests into `release-x.x.x` for each card. Some pull requests may need creating from attached branches. If work is out of date, you may need to pull the `master` branch into the branch first and resolved any conflicts. Take note of any cards that require an api deployment as well an liase with a developer to ensure this happens at the same time.
- After `release-x.x.x` contains all the code to be released. (i.e. master plus all branches being released). Commit the code and create a Pull Request to `master`. This will then start a build in Circle CI including Percy integration tests.
- Once all tests have passed, snapshots should be reviewed within `https://percy.io/ONE-Web`. If there have been no changes since the previous deploy then the build will be automatically approved. If there are differences then you will need to visually check these changes. Often these are due to changing content or an intentional change to the styling. In this case you can manually approve the changes.
- Once all tests have passed and percy snapshots have been approved, the `release-x.x.x` build can be merged to `master`.
- Release notes should be updated in intercom article https://support.thisisone.tv/en/articles/4561040-release-notes-2021
- Move all cards from 'Ready For Release' column to 'Final QA (Production)' column in Jira.
- Mark the weekly release as 'Released' in Jira

### Client differences
- Each Lite client is different so this does not use snapshot testing. After deploying lite-production please check that theming and api lookup is working by loading a few lite websites e.g `https://sr.cssentertainment.com/`, `https://itvmedia.thisisone.tv/`, `https://onetv.thisisone.tv/`

### Failing Cypress Tests
`https://docs.cypress.io/`
- If a cypress test fails the script will stop and display in red which test has failed.
- You should now run these tests locally to decipher the problem. Locally a video will be created within `cypress/videos` to find the point of failure.
- Once you have fixed the failed code you will have to push a fix to `release-x.x.x` to restart the tests.
- A test may also fail due to out of date client information which can be updated within `cypress.json` or the environment variables within Circle CI.


### To run cypress tests Locally

Using Docker:

- Edit the `.env` file to run for a specific client. You will need to edit all the CYPRESS_* environment variables to match the current CLIENT. These values can be found in 1Pass under `Circle CI - config`
- After this is saved run `npm run docker:cypress:run` this will run the tests locally creating cypress/videos.
- Alternatively you can run `npm run docker:cypress:open` which will start the cypress interactive test suite.

Outside Docker:

- Edit the `cypress.env.json` file to run for a specific client. You will need to edit all the environment variables to match the current CLIENT. These values can be found in 1Pass under `Circle CI - config`
- Build the current CLIENT code e.g. `npm run production endeavor --API_KEY=xxx`
- Then run the commands as you normally would. e.g. `./node_modules/.bin/start-server-and-test "serve dist" http://localhost:5000 "PERCY_TOKEN=xxx npx percy exec -- yarn cypress:run -- --env CLIENT=endeavor"`