import Bugsnag from '@bugsnag/js'
import { UserType } from 'javascript/types/ModelTypes'

if (process.env.NODE_ENV !== 'development') {
  Bugsnag.start({
    apiKey: '0f66ef15cc45c20de76db47a4945a5b0',
    autoDetectErrors: false,
    releaseStage: process.env.TARGET_ENV || 'development',
  })
}

export const notifyBugsnag = (e: Error, user?: UserType, metaData = {}) => {
  if (process.env.NODE_ENV !== 'development') {
    Bugsnag.notify(e, event => {
      event.addMetadata('metadata', {
        ...metaData, user
      })
    })
  } else {
    console.error(e)
  }
}
