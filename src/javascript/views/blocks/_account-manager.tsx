import React from 'react'
import AccountManager from 'javascript/components/account-manager'

import UserStore from 'javascript/stores/user'

const AccountManagerBlock = (block, assets, props) => {

  const user = UserStore.getUser()
  if (!user) return null

  const isDraftBlock = block.hasOwnProperty('published') && !block.published
  const injectedProps = {...props}
  if (isDraftBlock) {
    injectedProps.adminMode = true
  }
  return (
    <AccountManager user={user} {...injectedProps} />
  )
}

export default AccountManagerBlock
