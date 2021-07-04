import React from 'react'
import ContinueWatching from 'javascript/components/continue-watching'

import UserStore from 'javascript/stores/user'

const ContinueWatchingBlock = (block, props) => {
  const user = UserStore.getUser()
  if (!user) return null
  return (
    <ContinueWatching title={block.title} />
  )
}

export default ContinueWatchingBlock
