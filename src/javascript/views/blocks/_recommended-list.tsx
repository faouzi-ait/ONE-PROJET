import React from 'react'
import RecommendedList from 'javascript/components/recommended-list'

import UserStore from 'javascript/stores/user'

const RecommendedListBlock = (block, assets, props) => {
  const user = UserStore.getUser()
  if (!user) return null
  return (
    <RecommendedList title={block.title} {...props} />
  )
}

export default RecommendedListBlock
