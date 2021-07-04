import React from 'react'
import styled from 'styled-components'

import Button from 'javascript/components/button'
import usePrefix from 'javascript/utils/hooks/use-prefix'

export const ImpersonationTopBar: React.FC<{
  onPressStop: () => void
  firstName: string
  lastName: string
}> = ({ onPressStop, firstName, lastName }) => {
  const { prefix } = usePrefix()
  return (
    <>
      <Wrapper className={`border-error ${prefix}bg-background`}>
        <h4>
          You are impersonating{' '}
          {firstName || lastName
            ? [firstName, lastName].filter(Boolean).join(' ')
            : 'a user'}
          .
        </h4>
        <Button
          className="button button--filled"
          style={{ marginBottom: 0 }}
          onClick={onPressStop}
        >
          Stop Impersonation
        </Button>
      </Wrapper>
      <Gutter></Gutter>
    </>
  )
}

const Gutter = styled.div`
  height: 75px;
`

const Wrapper = styled.div`
  padding: 0rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  height: 75px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  border-bottom-style: solid;
  border-bottom-width: 4px;
  justify-content: flex-end;
  align-items: center;
  padding-right: 100px;
  z-index: 20;
  & > * {
    margin: 0;
  }
  & > h4 {
    margin-right: 2rem;
  }
`
