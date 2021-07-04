import React from 'react'

import {
  findFirstInstanceOfClientKey
} from 'javascript/utils/client-switch/tools'

const sortChildrenOrder = (order, children) => {
  const childrenCache = children.reduce((cache, child) => {
    cache[child.props.name] = {
      ...child,
      key: child.props.name
    }
    return cache
  }, {})
  return order.map((key) => childrenCache[key])
}

const SwitchOrder = ({
  children,
  clientSpecificOrder
}) => {
  const key = findFirstInstanceOfClientKey(clientSpecificOrder)
  return key
    ? sortChildrenOrder(clientSpecificOrder[key], children)
    : <>{children}</>
}

export default SwitchOrder