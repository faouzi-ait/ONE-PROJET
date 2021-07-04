import React from 'react'

import { isClient } from 'javascript/utils/client-switch/tools'

interface Props {
  client: string
}

const ClientSpecific: React.FC<Props> = (props) => {
  if (props.client === 'default' || isClient(props.client)) {
    return <>{props.children}</>
  }
  return null
}

export default ClientSpecific