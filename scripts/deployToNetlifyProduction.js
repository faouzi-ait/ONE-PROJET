const { execSync } = require('child_process')

const axios = require('axios')

const slackUrl = 'https://hooks.slack.com/services/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' //fe-alerts

const prefix = `NETLIFY_AUTH_TOKEN=${process.env.NETLIFY_AUTH_TOKEN}`

const netlifySiteNameOverrides = {
  banijaygroup: '--id cafaa13d-c226-48bb-98d6-94a388c71a75',
}

const sendSlackErrorMessage = (clientName, githubCommitId = 'def', githubUser = 'unKnown') => {
  return axios.post(slackUrl, {
    channel: 'fe-alerts',
    username: 'Circle-CI',
    text: `${clientName} - production has failed. <https://github.com/rawnet/one-web/commit/${githubCommitId} | Commit> ( ${githubUser} )`
  })
}

let buildHasFailed = 0

const client = process.env.CIRCLE_JOB.replace(/(_releases|_all_branches|_staging|_master)/g, '')
const netlifySiteName = netlifySiteNameOverrides[client] || `--name ${client}-production`

try {
  execSync(`${prefix} node_modules/.bin/netlify unlink`, { stdio: 'inherit' })
  execSync(`${prefix} node_modules/.bin/netlify link ${netlifySiteName}`, { stdio: 'inherit' })
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


