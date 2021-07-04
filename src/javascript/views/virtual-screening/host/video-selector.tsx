import React, { useEffect, useState } from 'react'

import useResource from 'javascript/utils/hooks/use-resource'
import useVideoProviders from 'javascript/utils/hooks/use-video-providers'
import { getVideosForVideoSelector } from 'javascript/views/virtual-screening/host/video-carousel'
import { createFilterOptions, SelectorPropsType } from 'javascript/views/virtual-screening/host/video-asset-search'
import VideoCarousel from 'javascript/views/virtual-screening/host/video-carousel'

interface Props {
  filterBy: string
  renderFilter: (filterOptions: any) => JSX.Element
  selectorProps: SelectorPropsType
}

const VirtualVideoSelector: React.FC<Props> = ({
  filterBy,
  renderFilter,
  selectorProps,
}) => {

  const {
    handleViewportChange,
    selectedProgramme,
    meetingIsLive,
    presentationVideo,
  } = selectorProps

  const [videos, setVideos] = useState([])
  const [filterOptions, setFilterOptions] = useState(null)
  const videoProviders = useVideoProviders()
  const videoResource = useResource('video')

  useEffect(() => {
    if (selectedProgramme) {
      videoResource.findAll({
        fields: {
          'videos': getVideosForVideoSelector(videoProviders),
        },
        filter: {
          'programme-id': selectedProgramme.id
        },
      })
      .then((response) => {
        const {items, options} = createFilterOptions(response, 'series-name')
        setVideos(items)
        setFilterOptions(options)
      })
    } else {
      setVideos([])
    }
  }, [selectedProgramme])

  return (
    <>
      {renderFilter(filterOptions)}
      <VideoCarousel
        displayProgrammeName
        meetingIsLive={meetingIsLive}
        presentationVideo={presentationVideo}
        onPresentVideo={handleViewportChange('video')}
        videos={filterBy !== 'all' ? videos.filter((video) => video['series-name'] === filterBy) : videos}
      />
    </>
  )
}

export default VirtualVideoSelector
