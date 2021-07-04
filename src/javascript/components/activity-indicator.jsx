import React from 'react'
import styled from 'styled-components'
import CustomCheckbox from './custom-checkbox'

const ActivityIndicator = ({ status, successLabel, style = {} }) => {
  if (status === 'idle') {
    return null
  }
  return (
    <Wrapper style={style}>
      {status === 'loading' && (
        <LoaderWrapper>
          <div className="loader" />
        </LoaderWrapper>
      )}
      {status === 'fulfilled' && (
        <FadeOut>
          <CustomCheckbox label={successLabel} checked disabled />
        </FadeOut>
      )}
      {status === 'errored' && (
        <p>An error has occurred. Refresh the page and try again.</p>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
`

const LoaderWrapper = styled.div`
  height: 24px;
  width: 24px;
  transform: translate(-50%, -0%) scale(0.25);
  @keyframes fadeIn {
    from {
      opacity: 0 !important;
    }
    to {
      opacity: 1 !important;
    }
  }
  animation: fadeIn 0.2s;
  animation-delay: 0.5s;
`

const FadeOut = styled.div`
  @keyframes fadeInThenOut {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  animation: fadeInThenOut 4s;
  display: inline-flex;
  align-items: center;
  animation-fill-mode: forwards;
`

export default ActivityIndicator
