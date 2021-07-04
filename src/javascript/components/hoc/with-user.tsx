import React from 'react'
import UserStore from 'javascript/stores/user'
import { UserType } from 'javascript/types/ModelTypes'

export type WithUserType = {
  user: UserType
}

const withUser = Component => props => {
  const user = UserStore.getUser()
  return <Component {...props} user={user} />
}

export default withUser