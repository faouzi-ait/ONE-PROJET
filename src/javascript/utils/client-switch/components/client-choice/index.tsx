import React, { ReactElement } from 'react'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import { isClient } from 'javascript/utils/client-switch/tools'

const validChildren = children => {
  let noDefaultChild = true
  let allChildrenAreClientSpecific = true
  children.forEach((child) => {
    if (noDefaultChild && child.props.client === 'default') {
      noDefaultChild = false
    }
    if (child.type !== ClientSpecific) {
      allChildrenAreClientSpecific = false
    }
  })
  if (!allChildrenAreClientSpecific || noDefaultChild) {
    if (!allChildrenAreClientSpecific) {
      throw Error('ClientChoice - all children must be of type <ClientSpecific>')
    }
    if (noDefaultChild) {
      throw Error('ClientChoice - must have a default child <ClientSpecific client="default">')
    }
    return false
  }
  return true
}

const ClientChoice: React.FC = ({ children }) => {
  const childrenAsArray = React.Children.toArray(children)
  if (!validChildren(childrenAsArray)) return null
  const clientChild = childrenAsArray.find((child: ReactElement) => {
    return isClient(child?.props?.client)
  })
  return (
    <>
      {clientChild ||
        childrenAsArray.find((child: ReactElement) => {
          return child?.props?.client === 'default'
        })}
    </>
  )
}

export default ClientChoice
