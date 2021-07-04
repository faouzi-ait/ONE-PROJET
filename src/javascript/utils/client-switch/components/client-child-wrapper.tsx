import React from 'react'

import { isClient } from 'javascript/utils/client-switch/tools'

interface Props {
  client: any
  children: any
  outerWrapper: (children: any) => any
}

const ClientChildWrapper: React.FC<Props> = ({
  client,
  children,
  outerWrapper,
}) => {
  if (isClient(client)) {
    return outerWrapper(children)
  }
  return children
}

export default ClientChildWrapper