import React from 'react'
import { getAllClientVariables, ClientVariables } from 'javascript/utils/client-switch/use-client-variables'

const withClientVariables = (nameSpace: string, providedClientVariables: ClientVariables, calculatedVariables: ClientVariables = {}) => Component => props => {
  const clientVars = {
    [nameSpace]: getAllClientVariables(providedClientVariables, calculatedVariables)
  }
  return <Component {...props} {...clientVars} />
}

export const withDefaultClientVariables = (nameSpace: string, providedClientVariables: ClientVariables, calculatedVariables: ClientVariables = {}) => Component => props => {
  const clientVars = {
    [nameSpace]: getAllClientVariables(providedClientVariables, calculatedVariables, true)
  }
  return <Component {...props} {...clientVars} />
}

export default withClientVariables


