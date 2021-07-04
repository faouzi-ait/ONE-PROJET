import React from 'react'

import { extractClientVariables } from 'javascript/utils/client-switch/tools'

interface Props {
  clientProps: any
  renderProp: (clientProps: any) => any
}

const ClientProps: React.FC<Props> = ({
  clientProps,
  renderProp,
}) => {
  const calculatedProps = extractClientVariables(clientProps)
  return renderProp(calculatedProps) || null
}

export default ClientProps