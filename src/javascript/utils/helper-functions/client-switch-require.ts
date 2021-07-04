export interface ClientMap<T> {
  default?: T
  [clientNames: string]: T
}

const clientSwitchRequire = (clientMap: ClientMap<string>) => {
  const keyMatch = Object.keys(clientMap).find(key => key.includes(process.env.CLIENT))
  if (keyMatch) {
    return require(clientMap[keyMatch])
  } else if (clientMap.default) {
    return require(clientMap.default)
  }
  return undefined
}

export default clientSwitchRequire

/**
 * Usage:
 * 

const logo = clientSwitchRequire({
  'amc | endeavor': '../logo.svg',
  cineflix: '../logo.jpg',
})

 */