import React from 'react'
import styled from 'styled-components'
import useTheme from 'javascript/utils/theme/useTheme'

const ContentPlaceholderBlock = (block, assets, props) => {
  const { localisation } = useTheme()
  const localisedType = localisation[block.placeholderType]?.lower || block.placeholderType
  return (
    <Padding>
      <OuterWrapper>
        <PlaceholderText>{`** Placeholder - ${localisedType} will display here **`}</PlaceholderText>
      </OuterWrapper>
    </Padding>
  )
}

export default ContentPlaceholderBlock

const Padding = styled.div`
  padding: 8px;
`

const OuterWrapper = styled.div`
  border: 3px solid grey;
  border-radius: 15px;
  position: relative;
  height: 350px;
  overflow: hidden;
  background: repeating-linear-gradient(
    135deg,
    #403f3f,
    #403f3f 10px,
    #2a2f2f 10px,
    #2a2f2f 20px
  );
`

const PlaceholderText = styled.div`
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  color: white;
  font-weight: bold;
  font-size: 21px;
  text-align: center;
`
