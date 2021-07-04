import liteClients from 'javascript/utils/lite-clients'

const domainNamesMap = {
  'localhost': null,
  '0.0.0.0': null,
  'onetv.staging.thisisone.tv': 'onetv',
  'one-lite-production.netlify.com': 'onetv',

  //Custom domains here
  'sr.cssentertainment.com': 'screenmedia',
  'firstlook.itvmedia.co.uk': 'itvmedia',
  'cakeentertainment.com': 'cake',
  'www.cakeentertainment.com': 'cake',
  'www.fredmedia.com.au': 'fredmedia',
  'totalcontentdigital.com': 'totalcontent',
  'www.totalcontentdigital.com': 'totalcontent'
}

liteClients.map(client => {
  domainNamesMap[`${client}.thisisone.tv`] = client
})

const NO_NAME = 'no_name'

const getClientNameFromDomain = () => {
  const { hostname } = window.location
  // process.env.LITE_CLIENT - this is provided for dev purposes by `npm run lite` script
   return domainNamesMap[hostname] || process.env.LITE_CLIENT || NO_NAME
}

const liteClientName = getClientNameFromDomain()

export const isLiteClient: () => boolean = () => {
  return liteClientName !== NO_NAME
}

export const clientName: () => string = () => {
  return isLiteClient() ? liteClientName : process.env.CLIENT
}

export default {
  clientName,
  isLiteClient,
}