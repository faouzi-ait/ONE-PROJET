import React from 'react'

const withHooks = hook => Component => props => {
  const otherProps = hook(props) || {}
  return <Component {...props} {...otherProps} />
}

export default withHooks
