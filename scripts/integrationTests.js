
const { execSync } = require('child_process')

let buildHasFailed = 0
const clientsToIgnore = ['rtv', 'discovery']

const client = process.env.CIRCLE_JOB.replace(/(_releases|_all_branches|_staging|_master)/g, '')

if (clientsToIgnore.includes(client)) {
  console.log('\n\n IntegrationTests - This Client has not been tested:', client)
  console.log('\n   ...PERCY INTEGRATION TEST BYPASSED')
  process.exit(buildHasFailed)
}

const percyToken =process.env[`${client.toUpperCase()}_PERCY_TOKEN`]
try {
  if (percyToken) {
    execSync(`./node_modules/.bin/start-server-and-test "serve dist -s" http://localhost:5000 "PERCY_TOKEN=${percyToken} npx percy exec -- yarn cypress:run --record  -- --env CLIENT=${client}"`, { stdio: 'inherit' })
  }
} catch (catchError) {
  console.log('(integrationTests - Caught Error):', catchError.toString())
  buildHasFailed = 1
}

setTimeout(() => {
  process.exit(buildHasFailed)
}, 1000)


