// @ts-ignore
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'
import {
  ProgrammeSearchResultType,
  ProgrammeType,
  VideoType,
} from 'javascript/types/ModelTypes'
import React, { useRef, useEffect, useContext } from 'react'
import styled, { css } from 'styled-components'
import BannerVideo from '../banner-video'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import { CarouselContext } from '../carousel'

const VideoCard: React.FC<Props> = ({
  image,
  isHovering,
  shouldTrackMouseMoves,
  video,
  programme,
  onClick,
  areAnyHovering,
  onMouseOut,
  onMouseOver,
  makeOnMouseMoveFromElement,
  clientVariables
}) => {
  const { isThisSlideOnTheFarLeft, isThisSlideOnTheFarRight } = useContext(
    CarouselContext,
  )
  const shouldBehaveLikeAVideo = useMediaQuery('(min-width: 768px)')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = makeOnMouseMoveFromElement(wrapperRef.current)

  useEffect(() => {
    if (shouldTrackMouseMoves) {
      document.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [wrapperRef.current, shouldTrackMouseMoves])

  return (
    <div>
      <Wrapper
        ref={wrapperRef}
        onMouseOver={onMouseOver}
        onFocus={onMouseOver}
        onBlur={onMouseOut}
        isHovering={isHovering && shouldBehaveLikeAVideo}
        tabIndex={0}
        role="button"
        onClick={onClick}
        shouldGoABitTransparent={
          areAnyHovering && !isHovering && shouldBehaveLikeAVideo
        }
        shouldEdgeRight={isThisSlideOnTheFarLeft}
        shouldEdgeLeft={isThisSlideOnTheFarRight}
        clientVariables={clientVariables}
      >
        <BannerVideo
          isOnScreen={isHovering && shouldBehaveLikeAVideo}
          isHovering={isHovering}
          image={image || ProgrammePlaceholder}
          video={video}
          animationDuration={'1s'}
          disableVideo={!shouldBehaveLikeAVideo}
          shouldUseDisappearingTextElements
          programmeTitle={programme.title}
        >
        </BannerVideo>
      </Wrapper>
      <TextWrapper isHovering={shouldBehaveLikeAVideo && isHovering} clientVariables={clientVariables}>
        <h3 className="card__title">{programme.title}</h3>
      </TextWrapper>
    </div>
  )
}

interface Props {
  image: string
  onClick?: () => void
  isHovering: boolean
  shouldTrackMouseMoves: boolean
  video: VideoType
  programme: ProgrammeType | ProgrammeSearchResultType
  areAnyHovering: boolean
  onMouseOut: () => void
  onMouseOver: () => void
  makeOnMouseMoveFromElement: (
    divElement: HTMLDivElement,
  ) => (event: any) => void,
  clientVariables: any
}

interface TextWrapperProps {
  isHovering: boolean,
  clientVariables: any
}

const TextWrapper = styled.div<TextWrapperProps>`
  transition: opacity 0.2s;
  opacity: ${props => (props.isHovering ? 0 : 1)};
  h3,
  h4 {
    font-size: 20px;
    line-height: 26px;
    margin: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    /** Override for AMC */
    box-shadow: none !important;
    background: none !important;
    display: block !important;
    ${({ clientVariables }) =>
    clientVariables.titleColorOverride &&
      css`
        color: ${clientVariables.titleColorOverride};
      `}
  }
  h3 {
    margin-bottom: 5px;
  }
  h4 {
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 10px;
    margin-top: 0px;
  }
`

interface WrapperProps {
  isHovering: boolean
  shouldGoABitTransparent: boolean
  shouldEdgeLeft: boolean
  shouldEdgeRight: boolean
  clientVariables: any
}

const Wrapper = styled.div<WrapperProps>`
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: 0.25s all;
  
  transform: ${({ isHovering, shouldEdgeLeft, shouldEdgeRight }) => {
    const scale = isHovering ? `scale(1.4, 1.4)` : `scale(1, 1)`
    let translate = ''
    if (shouldEdgeRight) {
      translate = isHovering ? 'translateX(12%)' : ''
    } else if (shouldEdgeLeft) {
      translate = isHovering ? 'translateX(-12%)' : ''
    }
    return `${scale} ${translate}`
  }};
  box-shadow: ${({ isHovering }) =>
    isHovering ? `0px 8px 16px rgba(0,0,0,0.32)` : `none`};
  z-index: ${({ isHovering }) => (isHovering ? 20 : 1)};
  opacity: ${({ shouldGoABitTransparent }) =>
    shouldGoABitTransparent ? 0.3 : 1};
  cursor: pointer;
  video {
    transition: 0.25s opacity;
    transition-delay: 0.25s opacity;
    opacity: ${({ shouldGoABitTransparent }) =>
      shouldGoABitTransparent ? 0 : 1};
  }
  ${({ clientVariables }) =>
    clientVariables.roundedCorners &&
      css`
        border-radius: ${clientVariables.roundedCorners}px;
      `}
  ${({ shouldGoABitTransparent }) =>
    shouldGoABitTransparent
      ? css`
          pointer-events: none;
        `
      : ''}
`

const enhance = compose(
  withClientVariables('clientVariables', allClientVariables),
)

export default enhance(VideoCard)