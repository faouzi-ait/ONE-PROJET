import React from 'react'
import useAdminToolbarState, { AdminToolbarStateType } from 'javascript/components/admin-toolbar/use-admin-toolbar-state'

export type WithAdminToolbarStateType = {
  toolbarState: AdminToolbarStateType
}

const withAdminToolbarState = Component => props => {
  const toolbarState = useAdminToolbarState()
  return <Component {...props} toolbarState={toolbarState} />
}

export default withAdminToolbarState
