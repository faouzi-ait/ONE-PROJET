
const { execSync } = require('child_process')
const clientApiKeyOverrides = {
  ae: 'aenetworks-web',
  rtv: 'onetv-web',
}

let buildHasFailed = 0
const client = process.env.CIRCLE_JOB.replace(/(_releases|_all_branches|_staging|_master)/g, '')
const build = process.argv[2] === 'production' ? 'production' : 'staging'
let apiKey = clientApiKeyOverrides[client] || `${client}-web`
if (build === 'production') {
  apiKey = process.env[`${client.toUpperCase()}_API_KEY`]
}

try {
  execSync(`rm -rf ./dist`, { stdio: 'inherit' })
  execSync(`npm run ${build} ${client} --API_KEY=${apiKey}`, { stdio: 'inherit' })
  execSync(`npm run lint`, { stdio: 'inherit' })
  execSync(`./node_modules/.bin/tsc --allowJs false`, { stdio: 'inherit' })
  execSync(`npm run securityChecks`, { stdio: 'inherit' })
  execSync(`npm run test:${build} --CLIENT=${client}`, { stdio: 'inherit' })
} catch (catchError) {
  console.log('(buildAndUnitTest - Caught Error):', catchError.toString())
  buildHasFailed = 1
}

setTimeout(() => {
  process.exit(buildHasFailed)
}, 1000)


