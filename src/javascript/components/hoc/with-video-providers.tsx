import React from 'react'
import useTheme from 'javascript/utils/theme/useTheme'
import VideoProviders from 'javascript/types/VideoProviders'


type WithVideoProviders = <T = {}>(
  component: React.ComponentType<T>,
) => React.ComponentType<Omit<T, 'videoProviders'>>

export type WithVideoProvidersType = {
  videoProviders: VideoProviders
}

// @ts-ignore
const withVideoProviders: WithVideoProviders = Component => {
  return React.forwardRef((props, ref) => {
    //@ts-ignore
    const theme = props.theme || useTheme()
    const videoProviders = getVideoProviders(theme)
    return <Component {...props} videoProviders={videoProviders} ref={ref} />
  })
}

export const getVideoProviders = (theme) => {
  const videoProviders: VideoProviders = {}
  if (theme !== null) {
    videoProviders.wistia =
      theme.features.providers.includes('wistia') ||
      theme.features.providers.find(
        p => p.name && p.name === 'wistia' && p['wistia-enabled'],
      )
    videoProviders.brightcove =
      theme.features.providers.find(p => p['brightcove-enabled']) ||
      false
    videoProviders.knox =
      theme.features.providers.find(p => p['knox-enabled']) ||
      false
    videoProviders.jwplayer =
      theme.features.providers.find(p => p['jwplayer-enabled']) ||
      false
    videoProviders.comcast =
      theme.features.providers.find(p => p['comcast-platform-enabled']) ||
      false
  }
  return videoProviders
}

export default withVideoProviders
