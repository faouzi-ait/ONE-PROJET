import React from 'react'
import RecommendedProgrammes from 'javascript/components/recommended-programmes'

import UserStore from 'javascript/stores/user'

const RecommendedProgrammeBlock = (block, assets, props) => {
  const user = UserStore.getUser()
  if (!user) return null
  return (
    <RecommendedProgrammes title={block.title} includeRestrictedProgrammes={true} {...props} />
  )
}

export default RecommendedProgrammeBlock
