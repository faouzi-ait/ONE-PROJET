/**
 * This script will create a branch deploy from your currently checkout out branch.
 *
 *  Usage:
 *    Building with branchName derived from git branch
 *
 *         node branchDeploy <clientName> ( optional: <clientName>)
 *    OR   node branchDeploy all
 *
 *  e.g.
 *       node branchDeploy demo
 *       node branchDeploy demo cineflix all3
 *       node branchDeploy all
 *
 *    Providing a branch name: (first argument should be -b=<branchName> )
 *
 *  e.g.
 *       node branchDeploy -b=myCoolBranch demo
 *       node branchDeploy -b=myCoolBranch demo cineflix all3
 *       node branchDeploy -b=myCoolBranch all
 *
 */
const { execSync } = require('child_process')

const clientList = [
  'ae',
  'all3',
  'amc',
  'banijaygroup',
  'cineflix',
  'demo',
  'discovery',
  'drg',
  'endeavor',
  'fremantle',
  'itv',
  'keshet',
  'storylab',
  'wildbrain',
]

const branchName = execSync('echo $(git symbolic-ref --short -q HEAD)')
  .toString()
  .trim()

let clientsToBuild = process.argv.slice(2)
let domainBranchName = branchName
if ((clientsToBuild[0] || '').includes('-b=')) {
  domainBranchName = clientsToBuild[0].replace('-b=', '')
  clientsToBuild = clientsToBuild.slice(1)
}

if (!clientsToBuild.length) {
  console.log('You must pass a client')
  process.exit(1)
}

if (clientsToBuild.includes('all') && clientsToBuild.length > 1) {
  console.log('Invalid client passed: <all> can only be on its own')
  process.exit(1)
}

if (clientsToBuild[0] === 'all') {
  clientsToBuild = [...clientList]
} else {
  clientsToBuild.forEach((client) => {
    if (!clientList.includes(client) && client !== 'all') {
      console.log('Invalid client passed: ' + client)
      process.exit(1)
    }
  })
}

if (!branchName) {
  console.log('Something went wrong getting the branch')
  process.exit(1)
}

if (branchName === 'staging') {
  console.log('You can only deploy to staging from CircleCI.')
  process.exit(1)
}

const encodeForDomainName = (name) => {
  let encoded = name.replace(/[!@#$%^&*(),.?":{}|<>]/g, '')
  encoded = encoded.replace(/__/g, '-')
  encoded = encoded.replace(/ONE-/gi, 'ONE-')
  return encoded.toLowerCase()
}
const branchNameDomainEncoded = encodeForDomainName(domainBranchName)

try {
  execSync(`git pull origin ${branchName}`, { stdio: 'inherit' })
  clientsToBuild.forEach((clientName) => {
    execSync(`netlify unlink`, { stdio: 'inherit' })
    execSync(`netlify link --name ${clientName}-staging`, { stdio: 'inherit' })
    execSync(`rm -rf ./dist`, { stdio: 'inherit' })
    execSync(`npm run staging ${clientName}`, { stdio: 'inherit' })
    execSync(`netlify deploy -d dist --alias ${branchNameDomainEncoded}`, { stdio: 'inherit' })
  })
} catch (e) {
  console.log(e.toString())
  process.exit(1)
}
