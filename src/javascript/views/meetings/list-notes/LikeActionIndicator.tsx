import React from 'react'

// @ts-ignore
import ScreenerImage from './icon-screener.png'
// @ts-ignore
import LoveItImage from './icon-thumbs-up.png'
// @ts-ignore
import NotInterestedImage from './icon-thumbs-down.png'
// @ts-ignore
import NeutralImage from './icon-neutral.png'
import styled, { css } from 'styled-components'

const LikeActionIndicator: React.FC<LikeActionIndicatorProps> = ({
  action = 'its_ok',
  style,
}) => {
  return (
    <LikeWrapper
      backgroundColor={actionsMatrix[action].color}
      transform={actionsMatrix[action].transform}
      style={style}
    >
      <img
        alt={action.replace(/_/, ' ')}
        src={actionsMatrix[action].image}
      ></img>
    </LikeWrapper>
  )
}
interface LikeActionIndicatorProps {
  action: 'its_ok' | 'love_it' | 'not_interested' | 'screener'
  style?: any
}

const actionsMatrix: {
  [K in LikeActionIndicatorProps['action']]: {
    color: string
    image: string
    transform?: string
  }
} = {
  screener: {color: '#2ECC71', image: ScreenerImage },
  love_it: { color: '#2ECC71', image: LoveItImage },
  not_interested: {
    color: '#d94857',
    image: NotInterestedImage,
    transform: 'translateY(1px)',
  },
  its_ok: { color: '#AAB2BD', image: NeutralImage },
}

const LikeWrapper = styled.div<{ backgroundColor: string; transform?: string }>`
  background-color: ${props => props.backgroundColor};
  display: flex;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: -5px;
  bottom: -5px;

  img {
    width: 14px;
    ${({ transform }) =>
      transform
        ? css`
            transform: ${transform};
          `
        : ''}
  }
`

export default LikeActionIndicator