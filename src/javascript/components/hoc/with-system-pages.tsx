import React from 'react'

import useSystemPages, { SystemPagesArrayType } from 'javascript/utils/hooks/use-system-pages'

export type WithSystemPagesType = {
  fetchSystemPages: () => void
  systemPages: SystemPagesArrayType
}

const withSystemPages = Component => props => {
  const { systemPages, fetchSystemPages } = useSystemPages()
  return <Component {...props} systemPages={systemPages} fetchSystemPages={fetchSystemPages} />
}

export default withSystemPages