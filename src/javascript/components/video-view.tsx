import React, { useEffect, useState } from 'react'

import { VideoType, VideoViewType } from 'javascript/types/ModelTypes'
import { createOneByModel, updateOneByModel } from 'javascript/utils/apiMethods'

interface Props {
  renderVideoView: (videoViewIncludingMp4Url: Partial<VideoType>) => JSX.Element
  reportingType: 'video_banner' | 'virtual_screening' | 'content_block' | null
  token?: string
  virtualToken?: string
  video: Partial<VideoType>
}

const VideoView: React.FC<Props> = ({
  video,
  token,
  virtualToken,
  renderVideoView,
  reportingType = null
}) => {

  const [videoMp4Url, setVideoMp4Url] = useState('')
  const [timeViewed, setTimeViewed] = useState(0)
  const [videoViewReportingHasFailed, setVideoViewReportingHasFailed] = useState(false)
  const [updateInterval, setIntervalUpdate] = useState<any>()

  useEffect(() => {
    startVideoViewTracking()
    return () => {
      clearInterval(updateInterval)
    }
  }, [])

  const withToken = () => token ? { token } : virtualToken ? {'virtual-meeting-token': virtualToken} : {}

  const startVideoViewTracking = async () => {
    const videoView: VideoViewType = await createOneByModel('video-view', {
      'video-id': video.id,
      'reporting-type': reportingType,
    }, withToken())

    if (videoView.id !== '-1') {  //Handling logged out users -  Video Views should not be recorded
      startUpdateInterval(videoView)
    }
    setVideoMp4Url(videoView['mp4-url'])
  }

  const startUpdateInterval = videoView => {
    clearInterval(updateInterval)
    const timeInterval = 15000
    const updateIntervalTimer = setInterval(() => {
      const timeSpentWatching = timeViewed + timeInterval
      if (!videoViewReportingHasFailed) {
        updateOneByModel('video-view', {
          id: videoView.id,
          'time-viewed':  timeSpentWatching,
        }, withToken())
        .catch(() => {
          setVideoViewReportingHasFailed(true)
        })
        setTimeViewed(timeSpentWatching)
      }
    }, timeInterval)
    setIntervalUpdate(updateIntervalTimer)
  }

  return renderVideoView({
    ...video,
    'mp4-url': videoMp4Url,
  })
}

export default VideoView
