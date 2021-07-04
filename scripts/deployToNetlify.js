/**
 * This script will immediately push this version of staging
 * to netlify, skipping the build queue.
 */
const { execSync } = require('child_process')

const axios = require('axios')

const slackUrl = 'https://hooks.slack.com/services/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' //fe-alerts

const prefix = `NETLIFY_AUTH_TOKEN=${process.env.NETLIFY_AUTH_TOKEN}`

const netlifySiteNameOverrides = {
  rtv: 'one-lite-staging',
  banijaygroup: 'banijay-staging',
}

const sendSlackErrorMessage = (clientName, githubCommitId = 'def', githubUser = 'unKnown') => {
  return axios.post(slackUrl, {
    channel: 'fe-alerts',
    username: 'Circle-CI',
    text: `${clientName} - staging has failed. <https://github.com/rawnet/one-web/commit/${githubCommitId} | Commit> ( ${githubUser} )`
  })
}

let buildHasFailed = 0

const client = process.env.CIRCLE_JOB.replace(/(_releases|_all_branches|_staging|_master)/g, '')
const netlifySiteName = netlifySiteNameOverrides[client] || `${client}-staging`

try {
  execSync(`${prefix} node_modules/.bin/netlify unlink`, { stdio: 'inherit' })
  execSync(`${prefix} node_modules/.bin/netlify link --name ${netlifySiteName}`, { stdio: 'inherit' })
  execSync(`${prefix} node_modules/.bin/netlify deploy --timeout 900 -d dist --prod`, { stdio: 'inherit' })
} catch (catchError) {
  sendSlackErrorMessage(client, process.env.CIRCLE_SHA1, process.env.CIRCLE_USERNAME)
  console.log('(buildAndDeployToNetlify - Caught Error):', catchError.toString())
  buildHasFailed = 1
}

setTimeout(() => {
  // allows time for slackMessage to be sent
  process.exit(buildHasFailed)
}, 1000)


