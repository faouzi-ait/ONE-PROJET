import React from 'react'
import styled from 'styled-components'

export const Alert = ({ text, ...props }) => {
  return (
    <AlertWrapper {...props}>
      <AlertText>{text}</AlertText>
    </AlertWrapper>
  )
}

const AlertWrapper = styled.div`
  padding: 1.5rem 1.8rem;
  background-color: white;
  display: inline-flex;
  border-left: solid #ccc 4px;
`

const AlertText = styled.p`
  margin: 0px;
  font-size: 0.9rem;
  line-height: 1.7;
`
