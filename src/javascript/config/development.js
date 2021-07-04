// This allows running in devMode using production API's
// Just overwrite the apiUrl and apiKey you wish to point at and use.

const devConfig = {
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  dummyApi: false // see https://github.com/thisisonetv/dummy-backend
}

export default devConfig
