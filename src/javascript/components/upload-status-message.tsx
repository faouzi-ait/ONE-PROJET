import React from 'react'
import styled from 'styled-components'

export const UploadStatusMessage: React.FC<{ uploadStatus: string, isStale?: boolean }> = ({
  uploadStatus,
  isStale
}) => {
  return (
    <>
      {uploadStatus === 'pending' && (
        <Wrapper>
          <Text>
            This video is being processed by Brightcove
            {isStale && ' but is taking a while. Please check Brightcove to see if this video has failed to ingest'}
          </Text>
        </Wrapper>
      )}
      {uploadStatus === 'failed' && (
        <span className="count count--error">Failed</span>
      )}
    </>
  )
}

const Wrapper = styled.div`
  max-width: 16rem;
  padding: 0rem 0.5rem;
`

const Text = styled.p`
  opacity: 0.7;
  font-size: 0.7rem;
  line-height: 1.6;
  margin: 0;
`