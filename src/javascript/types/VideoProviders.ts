import {
  BrightcoveAccountType,
  WistiaAccountType,
  KnoxAccountType
} from 'javascript/types/ModelTypes'

export interface JwplayerProviderType {
  name: string
  'player-library': string
  'jwplayer-enabled': boolean
}

export interface ComcastPlatformProviderType {
  name: string
  username: string
  'comcast-platform-enabled': string
}

export default interface VideoProviders {
  wistia?: boolean | WistiaAccountType
  brightcove?: boolean | BrightcoveAccountType
  knox?: boolean | KnoxAccountType
  jwplayer?: boolean | JwplayerProviderType
  comcast?: boolean | ComcastPlatformProviderType
}