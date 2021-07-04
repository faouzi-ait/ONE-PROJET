import React from 'react'
import styled from 'styled-components'
import Button from 'javascript/components/button'

export const BrightcoveUploadRefreshAlert: React.FC<{
  onRefresh: () => void
}> = ({ onRefresh }) => {
  return (
    <Wrapper>
      <Text>
        Some of your videos have not yet been processed by Brightcove. Click
        ‘refresh’ to check if they’re ready.
      </Text>
      <Button className="button button--small" onClick={onRefresh}>
        Refresh
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 1.5rem;
  display: inline-flex;
  align-items: center;
  background-color: white;
  border-left: #898989 solid 4px;
`

const Text = styled.p`
  max-width: 340px;
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
  line-height: 1.7;
  margin-right: 1.5rem;
`
