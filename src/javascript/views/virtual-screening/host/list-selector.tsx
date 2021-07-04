import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import useTheme from 'javascript/utils/theme/useTheme'
import useResource from 'javascript/utils/hooks/use-resource'
import useVideoProviders from 'javascript/utils/hooks/use-video-providers'
import { getVideosForVideoSelector } from 'javascript/views/virtual-screening/host/video-carousel'
import { createFilterOptions, SelectorPropsType } from 'javascript/views/virtual-screening/host/video-asset-search'
import VideoCarousel from 'javascript/views/virtual-screening/host/video-carousel'


interface Props {
  filterBy: string
  hideListVideoButton: () => void
  renderFilter: (filterOptions: any) => JSX.Element
  selectorProps: SelectorPropsType
}

const VirtualListSelector: React.FC<Props> = ({
  filterBy,
  hideListVideoButton,
  renderFilter,
  selectorProps,
}) => {

  const { variables } = useTheme()

  const {
    handleViewportChange,
    listId,
    meetingId,
    meetingIsLive,
    presentationVideo,
  } = selectorProps

  const listVideosResource = useResource('list-videos')
  const [videos, setVideos] = useState([])
  const [filterOptions, setFilterOptions] = useState(null)
  const videoProviders = useVideoProviders()

  useEffect(() => {
    if (listId) {
      listVideosResource.findAllFromOneRelation({
        'name': 'list',
        'id': listId
      }, {
        include: 'video',
        fields: {
          'list-videos': 'video',
          'videos': getVideosForVideoSelector(videoProviders)
        },
        sort: 'list-position'
      })
      .then((response) => {
        const data = response.map((listVideo) => listVideo.video)
        const {items, options} = createFilterOptions(data, 'programme-name')
        setVideos(items)
        setFilterOptions(options)
        if (items.length === 0) {
          hideListVideoButton()
        }
      })
    } else {
      setVideos([])
    }
  }, [listId])

  if (!listId) {
    const meetingUrl = meetingId ? `/${meetingId}/edit` : ''
    return (
      <div style={{textAlign: 'center', paddingTop: '20px'}}>
        No list provided for meeting.
        <NavLink className="text-button"
          to={`/${variables.SystemPages.account.path}/${variables.SystemPages.meeting.path}${meetingUrl}`}
        >
          <span style={{marginLeft: '4px'}}>Edit Meeting</span>
        </NavLink>
      </div>

    )
  }

  return (
    <div>
      {renderFilter(filterOptions)}
      <VideoCarousel
        displayProgrammeName
        meetingIsLive={meetingIsLive}
        presentationVideo={presentationVideo}
        onPresentVideo={handleViewportChange('video')}
        videos={filterBy !== 'all' ? videos.filter((video) => video['programme-name'] === filterBy) : videos}
      />
    </div>
  )
}

export default VirtualListSelector
