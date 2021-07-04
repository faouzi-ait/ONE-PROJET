export const findFirstInstanceOfClientKey = (obj) => {
  return Object.keys(obj).find((key) => isClient(key))
}

export const isClient = (clientList: string) => {
  //@ts-ignore
  const overrideClientVariables = process.env.NODE_ENV === 'test' && testClient ? testClient : false
  // overrideClientVariables - Used to force all clientSwitching components/hooks/HOC to only import from this client.
  if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && overrideClientVariables) {
    return clientList.replace(/\s/g,'').split('|').includes(overrideClientVariables)
  }
  return clientList.replace(/\s/g,'').split('|').includes(process.env.CLIENT)
}

export const extractClientVariables = (clientProps, returnDefaultValues = false) => {
  return Object.keys(clientProps).reduce((clientVariablesToInject, propVariableName) => {
    let key = 'default'
    if (!returnDefaultValues) {
      key = findFirstInstanceOfClientKey(clientProps[propVariableName]) || 'default'
    }
    if (clientProps[propVariableName].hasOwnProperty(key)) {
      clientVariablesToInject[propVariableName] = clientProps[propVariableName][key]
    }
    return clientVariablesToInject
  }, {})
}

export default {
  findFirstInstanceOfClientKey,
  isClient,
}