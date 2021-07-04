import React, { useEffect, useRef, useState, ReactNode } from 'react'
import { Waypoint } from 'react-waypoint'
import styled, { css } from 'styled-components'

import allClientVariables from './variables'

import { findOneByModel } from 'javascript/utils/apiMethods'
import useAsyncProcessChecker from 'javascript/utils/hooks/use-async-process-checker'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

import MultiProviderVideo from 'javascript/components/multi-provider-video'
import SharedIcon from 'javascript/components/shared-icon'

import { VideoType } from 'javascript/types/ModelTypes'

interface Props {
  video: VideoType
  image: ReactNode | string
  isOnScreen: boolean
  animationDuration?: string
  disableVideo?: boolean
  shouldUseLargeMuteButton?: boolean
  shouldUseDisappearingTextElements?: boolean
  programmeTitle?: string,
  isHovering?: boolean
}

type States =
  | 'initial'
  | 'allAssetsLoaded'
  | 'complete'
  | 'errored'

const blackSquare =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const BannerVideo: React.FC<Props> = ({
  video,
  image,
  isOnScreen,
  animationDuration,
  children,
  disableVideo,
  shouldUseLargeMuteButton,
  shouldUseDisappearingTextElements,
  programmeTitle,
  isHovering,
}) => {

  const clientVariables = useClientVariables(allClientVariables)

  const [state, setState] = useState<States>('initial')
  const [isMuted, setIsMuted] = useState<boolean>(true)

  const [isInScrollView, setIsInScrollView] = useState(true)

  const screenIsBigEnough = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    setTimeout(() => {
      setIsMuted(!(isMuted && state === 'allAssetsLoaded' && isHovering))
    }, 500)
  }, [state])


  const imageSrc = usePreloadImage(image, blackSquare)

  const loadedVideo = useGetVideo({
    video,
    shouldLoad: isInScrollView && isOnScreen,
    onError: () => setState('errored'),
  })

  const videoHasLoadedFromApi = Boolean(loadedVideo)

  const videoIsRestricted = loadedVideo && loadedVideo.restricted

  const shouldShowVideo =
    !disableVideo &&
    !videoIsRestricted &&
    videoHasLoadedFromApi &&
    screenIsBigEnough

  const [shouldBeInDOMNoMatterWhat, setShouldBeInDOMNoMatterWhat] = useState(
    false,
  )
  useWatchForTruthy(shouldShowVideo, () => setShouldBeInDOMNoMatterWhat(true))
  return (
    <Waypoint
      onPositionChange={({ currentPosition }) =>
        setIsInScrollView(currentPosition === 'inside')
      }
    >
      <BannerVideoWrapper isNotInBanner={shouldUseDisappearingTextElements}>
        <VideoHeightFixer
          isBrightcoveVideo={Boolean(
            (loadedVideo || { 'brightcove-id': undefined })['brightcove-id'],
          )}
        >
          {(shouldShowVideo || shouldBeInDOMNoMatterWhat) && (
            <MultiProviderVideo
              isVisible={
                isOnScreen &&
                isInScrollView &&
                screenIsBigEnough &&
                state !== 'complete'
              }
              video={loadedVideo}
              controls={false}
              withStyle={false}
              onLoad={() => {
                setState('allAssetsLoaded')
              }}
              onComplete={() => {
                setState('complete')
              }}
              onError={() => {
                setState('errored')
              }}
              muted={isMuted}
              style={{ height: '100%' }}
            />
          )}
        </VideoHeightFixer>
        <BannerImageObjectFitIEFix
          shouldShowVideo={
            isOnScreen &&
            screenIsBigEnough &&
            videoHasLoadedFromApi &&
            !videoIsRestricted &&
            state === 'allAssetsLoaded'
          }
          animationDuration={animationDuration}
          isNotInBanner={shouldUseDisappearingTextElements}>
          {typeof image === 'string' ? (
              <BannerImage
                src={imageSrc}
                isNotInBanner={shouldUseDisappearingTextElements} />
          ) : (
          <div>
            {image}
          </div>
          )}
        </BannerImageObjectFitIEFix>

        <ChildrenWrapper>
          <LinearGradient />
          {!shouldUseDisappearingTextElements && children}
          {shouldUseDisappearingTextElements && programmeTitle && (
            <>
              <TextWrapper
                visiblePermanently={state === 'errored' && isOnScreen}
                shouldFadeInThenOut={state !== 'errored' && isOnScreen}
              >
                <ProgrammeTitle>{programmeTitle}</ProgrammeTitle>
                {state !== 'errored' && videoHasLoadedFromApi && video.name && (
                  <VideoTitle>{video.name}</VideoTitle>
                )}
              </TextWrapper>
            </>
          )}

          <MuteIconWrapper
            isVisible={
              isOnScreen &&
              isInScrollView &&
              !disableVideo &&
              screenIsBigEnough &&
              !videoIsRestricted &&
              videoHasLoadedFromApi &&
              state === 'allAssetsLoaded'
            }
            useLargeMuteButton={shouldUseLargeMuteButton}
            clientVariables={clientVariables}
          >
            <MuteIconButton
              type="button"
              onClick={e => {
                e.stopPropagation()
                setIsMuted(!isMuted)
              }}
            >
              <SharedIcon icon={isMuted ? 'muted' : 'un-muted'} />
            </MuteIconButton>
          </MuteIconWrapper>
        </ChildrenWrapper>
      </BannerVideoWrapper>
    </Waypoint>
  )
}

const useGetVideo = ({
  video,
  shouldLoad,
  onError,
}: {
  video: VideoType
  shouldLoad: boolean
  onError: () => void
}): VideoType | undefined => {
  const {
    state: { status, data },
    reportStarted,
    reportError,
    reportFulfilled,
  } = useEnumApiLogic()

  const { begin, checkIfShouldContinue } = useAsyncProcessChecker()
  const savedVideoId = useRef<string>()

  useEffect(() => {
    if (!shouldLoad) {
      return
    }

    if (video && video.id) {
      /** Same as the old one, so finish */
      if (video.id === savedVideoId.current) {
        return
      } else {
        savedVideoId.current = video.id
      }
    }

    if (video && video.id) {
      const thisProcessId = begin()
      reportStarted()
      findOneByModel('videos', video.id, {
        fields: ['restricted', 'brightcove-id', 'programme-name'],
        headers: {
          'login-redirect-override-key': true,
        },
      })
        .then(newVideo => {
          if (checkIfShouldContinue(thisProcessId) && shouldLoad) {
            reportFulfilled(newVideo)
          }
        })
        .catch(e => {
          if (checkIfShouldContinue(thisProcessId)) {
            reportError(e)
            onError()
          }
        })
    }
  }, [(video || { id: undefined }).id, shouldLoad])

  if (status === 'fulfilled') {
    return data
  }

  return undefined
}

export default BannerVideo

const TextWrapper = styled.div<{
  visiblePermanently?: boolean
  shouldFadeInThenOut?: boolean
}>`
  position: absolute;
  left: 16px;
  bottom: 16px;
  width: calc(100% - 32px);
  & > * {
    margin: 0;
  }
  transition: opacity 0.2s;
  @keyframes fadeInThenOut {
    0% {
      opacity: 1;
    }
    88% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  ${props => {
    if (props.visiblePermanently) {
      return css`
        opacity: 1;
      `
    } else if (props.shouldFadeInThenOut) {
      return css`
        animation: fadeInThenOut;
        animation-fill-mode: forwards;
        animation-duration: 3s;
      `
    } else {
      return css`
        opacity: 0;
      `
    }
  }}
`

const VideoTitle = styled.span`
  display: block;
  color: white;
  width: 60%;
  font-size: 11px;
  line-height: 12.5px;
  margin-top: 5px;
  font-weight: bold;
  @keyframes slideIn {
    from {
      max-height: 0px;
      opacity: 0;
    } to {
      max-height: 24px;
      opacity: 1;
    }
  }
  animation: slideIn 0.4s forwards;
`

const ProgrammeTitle = styled.span`
  display: block;
  color: white;
  width: 60%;
  font-size: 18px;
  line-height: 20px;
  font-weight: bold;
`

const MuteIconButton = styled.button`
  padding: 2px 5px;
  margin: 0;
  background: none;
  border: none;
  display: block;
  outline: 0;
  cursor: pointer;
`

interface MuteIconWrapperProps {
  isVisible?: boolean
  useLargeMuteButton?: boolean
  clientVariables?: any
}

const MuteIconWrapper = styled.div<MuteIconWrapperProps>`
  position: absolute;

  ${({ theme, clientVariables, ...props }) => {
    if (!props.useLargeMuteButton) {
      return css`
        right: 12px;
        bottom: 15px;
        top: auto;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      `
    }
    return css`
      ${() => {
        switch (clientVariables.muteButtonPlacement) {
          case 'right-top': {
            return css`
              right: 12px;
              top: 25px;
            `
          }
          case 'right-center': {
            return css`
              right: 12px;
              top: 50%;
              transform: translateX(-50%);
            `
          }
          case 'left-center': {
            return css`
              left: 20px;
              top: 50%;
              transform: translateX(-50%);
            `
          }
          default: { // 'bottom-left'
            return css`
              left: 20px;
              bottom: 20px;
            `
          }
        }
      }}
      display: flex;
      height: 40px;
      width: 40px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 100%;
      border: 2px solid white;
      display: flex;
      justify-content: center;
      align-items: center;
      svg {
        transform: translateY(1px);
      }
    `
  }}

  svg {
    fill: white;
    pointer-events: none;
  }
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transition: opacity 0.25s;
  z-index: 2;
`

const VideoHeightFixer = styled.div<{ isBrightcoveVideo: boolean }>`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  ${props =>
    !props.isBrightcoveVideo &&
    css`
      height: 100%;
    `}
`

const LinearGradient = styled.div`
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
  pointer-events: none;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
`

const ChildrenWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 15px;
  box-sizing: border-box;
  z-index: 3;

  * {
    z-index: 11;
  }
`

const BannerVideoWrapper = styled.div<BannerImageProps>`
  width: 100%;
  height: 100%;
  background-color: black;
  position: relative;

  .brightcove-player {
    width: 100%;
    height: 100%;
  }

  .video-js .vjs-control-bar {
    display: none;
  }

  video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    height: ${({ isNotInBanner }) => (isNotInBanner ? '100%' : 'auto')};
    width: ${({ isNotInBanner }) => (isNotInBanner ? '100%' : 'auto')};
    transform: translate(-50%, -50%)
  }

  position: relative;
`

interface BannerImageProps {
  shouldShowVideo?: boolean
  animationDuration?: string
  isNotInBanner: boolean
}


const BannerImageObjectFitIEFix = styled.div<BannerImageProps>`
  position: ${({ isNotInBanner }) => (isNotInBanner ? 'static' : 'absolute')};
  left: ${({ isNotInBanner }) => (isNotInBanner ? '-50%' : '0')};
  top: ${({ isNotInBanner }) => (isNotInBanner ? '-50%' : '0')};
  width: 100%;
  height: 100%;
  transition: opacity
    ${props => {
      return props.animationDuration || '4s'
    }};
  transition-delay: 0.5s;
  opacity: ${({ shouldShowVideo }) => (shouldShowVideo ? '0' : '1')};
  animation-fill-mode: forwards;
  object-fit: cover;
`

export const BannerImage = styled.img<BannerImageProps>`
  position: ${({ isNotInBanner }) => (isNotInBanner ? 'relative' : 'absolute')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: ${({ isNotInBanner }) => (isNotInBanner ? '100%' : 'auto')};
  height: ${({ isNotInBanner }) => (isNotInBanner ? 'auto' : '50%')};
  margin: auto;
  z-index: 2;
`

const usePreloadImage = (image, placeholder = null, callback = () => {}) => {
  callback()
  return image ? image : placeholder
}