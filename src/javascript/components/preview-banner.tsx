import React from 'react'
import styled from 'styled-components'
import breakpoint from 'javascript/utils/theme/breakpoint'

const PreviewBanner: React.FC = () => {
  return (
    <>
      <Wrapper className={`bg-error`}>
        This page is not active. You are viewing a preview.
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  color: #fff;
  padding: 30px 10px 90px;
  box-sizing: border-box;
  display: flex;
  height: 75px;
  position: fixed;
  bottom: 0;
  left: 0;
  font-size: 14px;
  font-weight: bold;
  width: 100%;
  justify-content: center;
  align-items: center;
  z-index: 20;
  ${breakpoint('large')`
    display: none
  `}
`
export default PreviewBanner