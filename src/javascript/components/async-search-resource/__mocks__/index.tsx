import React from 'react'

const MockAsyncSearchResource = (props) => {
  const inputProps = props.inputProps || {}
  if (!inputProps['aria-label']) {
    inputProps['aria-label'] = props.resourceType
  }
  return (
    <select
      {...inputProps}
      onChange={({ target }) => {
        //@ts-ignore
        props.onChange(target.data)
      }}
    />
  )
}

export default MockAsyncSearchResource