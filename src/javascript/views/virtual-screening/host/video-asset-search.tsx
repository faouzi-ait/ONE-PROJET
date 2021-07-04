import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import 'stylesheets/core/components/virtual-asset-search'
import useTheme from 'javascript/utils/theme/useTheme'

import { AssetPreviewType } from 'javascript/views/virtual-screening/host/pdf-selector'
import { ProgrammeType, VideoType } from 'javascript/types/ModelTypes'
import ListSelector from 'javascript/views/virtual-screening/host/list-selector'
import PdfSelector from 'javascript/views/virtual-screening/host/pdf-selector'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import VideoSelector from 'javascript/views/virtual-screening/host/video-selector'
import Select from 'javascript/components/select'

export type SelectorPropsType = {
  handleViewportChange: (type: 'video' | 'pdf' | null) => (viewportObj: VideoType | AssetPreviewType | null) => void
  listId: string
  meetingId: string
  meetingIsLive: boolean
  presentationPdf: AssetPreviewType,
  presentationVideo: VideoType,
  selectedProgramme?: ProgrammeType
}

interface Props {
  selectorProps: SelectorPropsType
}

type DisplayTypeType = 'list' | 'video' | 'pdf'

const VirtualVideoAssetSearch: React.FC<Props> = ({
  selectorProps,
}) => {

  const { localisation } = useTheme()
  const [displayType, setDisplayType] = useState<DisplayTypeType>('list')
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [filterBy, setFilterBy] = useState('all')
  const [listVideoButtonIsVisible, setListVideoButtonIsVisible] = useState(true)

  useEffect(() => {
    setFilterBy('all')
  }, [displayType])

  const renderFilter = (options) => {
    let showFilter = options?.length > 2
    if (options?.length === 2 && options[0].count !== options[1].count) {
      showFilter = true
    }

    return (
      <div className="virtual-asset-search__filters">
        <span className="virtual-asset-search__filter-desc">
          {displayType !== 'list' && 'Show me:'}
          {displayType === 'list' && showFilter && `Show me ${pluralize(localisation.video.lower)} for:`}
        </span>
        {displayType !== 'list' && (
          <div className="virtual-asset-search__filter-btns">
            <button type="button"
              className={`virtual-asset-search__filter-btn ${displayType === 'video' && 'virtual-asset-search__filter-btn--selected'}`}
              onClick={() => setDisplayType('video')}
            >
              {pluralize(localisation.video.upper).toUpperCase()}
            </button>
            <button type="button"
              className={`virtual-asset-search__filter-btn ${displayType === 'pdf' && 'virtual-asset-search__filter-btn--selected'}`}
              onClick={() => setDisplayType('pdf')}

            >PDF's</button>
          </div>
        )}
        {showFilter &&
          <Select
            options={options}
            onChange={(option) => setFilterBy(option.value)}
            value={filterBy}
          />
        }
      </div>
    )
  }

  const renderSelectionCarousel = () => {
    switch (displayType) {
      case 'list': {
        return (
          <ListSelector
            selectorProps={selectorProps}
            filterBy={filterBy}
            renderFilter={renderFilter}
            hideListVideoButton={() => setListVideoButtonIsVisible(false)}
          />
        )
      }
      case 'video': {
        return (
          <VideoSelector
            selectorProps={{
              ...selectorProps,
              selectedProgramme
            }}
            filterBy={filterBy}
            renderFilter={renderFilter}
          />
        )
      }
      case 'pdf': {
        return (
          <PdfSelector
            selectorProps={{
              ...selectorProps,
              selectedProgramme
            }}
            filterBy={filterBy}
            renderFilter={renderFilter}
          />
        )
      }
    }
  }

  return (
    <div>
      <div className="virtual-asset-search">
        {selectorProps.listId && listVideoButtonIsVisible && (
          <button type="button"
            className={['button', 'virtual-asset-search__list-button', displayType === 'list' && 'virtual-asset-search__list-button--selected'].filter(Boolean).join(' ')}
            onClick={() => {
              if (displayType !== 'list') {
                setDisplayType('list')
                setSelectedProgramme(null)
              }
            }}
          >
            {`${localisation.list.upper} ${pluralize(localisation.video.upper)}`}
          </button>
        )
        }

        <ProgrammeSearchSuggestions //@ts-ignore
          onSubmit={(obj) => {
            if (obj['filter[keywords]'] === '') {
              setDisplayType('list')
              setSelectedProgramme(null)
            }
          }}
          clearQuery={true}
          onSuggestionSelected={(e, psr) => {
            setDisplayType('video')
            setSelectedProgramme(psr.suggestion?.programme)
          }}
          placeholder={`Search for content outside your ${localisation.list.upper}...`}
          value={selectedProgramme}
          // allProgrammes={true}
        />
      </div>
      <div className="virtual-asset-search__selector">
        {renderSelectionCarousel()}
      </div>
    </div>
  )
}


export default VirtualVideoAssetSearch

export const createFilterOptions = (items, filterable) => {
  const filterOptionSet = {}
  const allItems = items.map((item) => {
    if (item[filterable]) {
      if (!filterOptionSet[item[filterable]]) filterOptionSet[item[filterable]] = 0
      filterOptionSet[item[filterable]] = filterOptionSet[item[filterable]] += 1
    }
    return {
      ...item,
      filterBy: item[filterable]
    }
  })
  const options = Object.keys(filterOptionSet).map((key) => ({
    value: key,
    label: key,
    count: filterOptionSet[key]
  }))
  return {
    items: allItems,
    options: [{ value: 'all', label: 'All', count: allItems.length}, ...options]
  }
}