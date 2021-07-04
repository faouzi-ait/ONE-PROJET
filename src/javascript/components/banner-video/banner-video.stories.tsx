import React from 'react'
import { storiesOf } from '@storybook/react'
import BannerVideo from './index'
import { VideoType } from 'javascript/types/ModelTypes'

const blackSquare =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const fakeVideo: Partial<VideoType> = {
  'mp4-url':
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
}

storiesOf('Banner Video', module).add('mp4 Video', () => {
  return (
    <BannerVideo
      isOnScreen={true}
      image={blackSquare}
      video={fakeVideo as any}
    />
  )
})
