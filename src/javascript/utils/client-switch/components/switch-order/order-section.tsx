import React from 'react'

interface Props {
  name: string
  children: any
}

const OrderSection: React.FC<Props> = props => {
  return <>{props.children}</>
}

export default OrderSection
