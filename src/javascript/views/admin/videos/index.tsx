import React, { useEffect, useState, useMemo } from 'react'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import iconClienVariables from 'javascript/components/icon/variables'
import { applyValidFilters } from 'javascript/containers/filters/filter-tools'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import AsyncSearchVideo from 'javascript/components/async-search-videos'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import VideoFilters from 'javascript/containers/filters/video-filter'
import VideoResource from 'javascript/components/admin/video/video'

import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import useResource from 'javascript/utils/hooks/use-resource'
import withVideoPageActions from 'javascript/components/hoc/with-video-page-actions'


const initialFilterState = {
  'filter[programme-ids]': null,
  'filter[series-ids]': null,
  'filter[episode-ids]': null,
  'filter[restricted]': '',
  'filter[public-video]': '',
  'filter[language_ids]': null
}

const VideosIndex = (props) => {
  const { theme } = props
  const videoLocalisation = theme.localisation.video
  const { wistia, brightcove, jwplayer, comcast } = props.videoProviders
  const videoSearchResource = useResource('video-search-result')
  const programmeResource = useResource('programme')

  const [videos, setVideos] = useState(null)

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [filtered, setFiltered] = useState(false)
  const [filterState, setFilterState] = useState(initialFilterState)
  const [filterProgrammeTitle, setFilterProgrammeTitle] = useState('')

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalPages, setTotalPages] = useState(1)

  const initialQuery = {
    include: [
      'video,languages',
      theme.features.videos.types && 'video.video-type',
    ].filter(Boolean).join(','),
    fields: {
      'video-search-results': 'video,languages',
      'videos':  [
          'name,programme-name,programme-id,series-id,series-name,episode-id,episode-name,mp4-url',
          'parent-id,parent-type,public-video,external-id,poster,restricted,downloadable,public-video',
          'visibility',
          theme.features.videos.promo && 'promo-video-programmes-count',
          theme.features.videos.videoBanners && 'video-banner-programmes-count',
          wistia && 'wistia-id',
          brightcove && 'brightcove-id',
          jwplayer && 'jwplayer-id',
          theme.features.videos.types && 'video-type',
          comcast && 'comcast-platform-id',
        ]
        .filter(Boolean)
        .join(','),
    },
    sort: '-created-at'
  }

  useEffect(() => {
    getVideos()
  }, [filterState, pageSize, pageNumber])

  const getVideos = (videoIds = null) => {
    const query = applyValidFilters(initialQuery, filterState)
    if (videoIds) {
      query['filter[ids]'] = videoIds
    } else {
      query['page[number]'] = pageNumber
      query['page[size]'] = pageSize
    }
    videoSearchResource.findAll(query)
      .then((response) => {
        props.pageIsLoading(false)
        const videosUpdate = response.map((result) => {
          return {
            ...result.video,
            languages: result.languages,
          }
        })
        videosUpdate.meta = response.meta
        setTotalPages(response.meta['page-count'])
        setVideos(videosUpdate)
      })
  }

  const refetchOnSave = () => {
    getVideos(selectedVideo?.id)
  }

  const renderVideoForm = async (resource = null) => {
    const isEdit = resource !== null

    if (isEdit) {
      programmeResource.findOne(resource['programme-id'], {
        include: 'series,series.episodes',
        fields: {
          programmes: 'title,title-with-genre,series',
          series: 'name,episodes',
          episodes: 'name'
        }
      })
      .then((programme) => {
        const parentResources = {
          programme
        }
        if (resource['series-id'] && programme.series?.length) {
          parentResources['series'] = programme.series.find((sery) => sery.id === resource['series-id'].toString())
        }
        if (resource['episode-id'] && parentResources['series'].episodes?.length) {
          parentResources['episode'] = parentResources['series'].episodes.find((ep) => ep.id === resource['episode-id'].toString())
        }
        props.editVideoResource({
          onSave: refetchOnSave,
          resource,
          ...parentResources,
        })
      })
    } else {
      props.newVideoResource({
        onSave: () => setTimeout(refetchOnSave, 1500)
      })
    }
  }

  const openFilters = () => {
    props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title="Filter your search"
        titleIcon={{
          id: 'i-filter',
          ...iconClienVariables['i-filter'].default
        }}
        modifiers={['filters', 'large', 'stretch-select']}>
        <div className="cms-modal__content">
          <VideoFilters
            filterState={filterState}
            programmeTitle={filterProgrammeTitle}
            onSubmit={(filterValues) => {
              setFilterProgrammeTitle(filterValues ? filterValues.programmeTitle : '')
              setFilterState(filterValues ? filterValues.filterState : initialFilterState)
              setFiltered(!!filterValues)
            }}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const updatePage = (page, size = false) => {
    if (size) {
      setPageSize(parseInt(page))
      setPageNumber(1)
    } else {
      setPageNumber(parseInt(page))
    }
  }

  const renderVideoResources = () => {
    const resources = (videos || []).map(resource => {
      return (
        <VideoResource
          resource={resource}
          key={resource.id}
          name={resource.name}
          restricted={
            resource.restricted ? `${resource.restricted}` : undefined
          }
          wistiaId={wistia ? resource['wistia-id'] : undefined}
        >
          <ActionMenu name="Actions">
            <ActionMenuItem
              label="View"
              onClick={() => props.openVideoModal(resource)}
            />
            <ActionMenuItem
              label="Edit"
              onClick={() => {
                renderVideoForm(resource)
              }}
            />
            <ActionMenuItem
              label="Delete"
              onClick={() => {
                props.deleteVideoResource(resource, refetchOnSave)
              }}
            />
            <ActionMenuItem
              label="Permissions"
              onClick={() => {
                props.editVideoPermissions(resource, refetchOnSave)
              }}
              divide
            />
            <ActionMenuItem
              label="Manage Poster"
              onClick={() => {
                props.editVideoPoster(resource, refetchOnSave)
              }}
            />
            {theme.features.videos.oneTimeVideoDownload && (
              <ActionMenuItem
                label="Generate one-time download"
                onClick={() => {
                  props.generateOneTimeVideoDownload(resource)
                }}
                divide
              />
            )}
            {theme.features.videos.privateVideoAccess && (
              <ActionMenuItem
                label="Manage Private Access"
                link={
                  `/admin/${theme.localisation.video.path}/` +
                  resource.id +
                  '/private-access'
                }
              />
            )}
          </ActionMenu>
        </VideoResource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className={`cms-table ${wistia && 'cms-table--fixed'}`}>
            <thead>
              <tr>
                <th>Name</th>
                <th>
                  <div>{theme.localisation.programme.upper} /</div>
                  <div>{theme.localisation.series.upper} /</div>
                  <div>Episode</div>
                </th>
                <th colSpan={wistia ? 1 : 2}></th>
                { wistia &&
                  <>
                    <th>Wistia ID</th>
                    <th />
                  </>
                }
              </tr>
            </thead>
            <tbody>{resources}</tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>
              There are currently no {pluralize(videoLocalisation.lower)}, try
              creating some!
            </p>
          </div>
        </div>
      )
    }
  }

  const videoFilterObj = useMemo(() => {
    const filterStrings = applyValidFilters({}, filterState)
    const filterStringKeys = Object.keys(filterStrings)
    if (filterStringKeys.length) {
      const filter = filterStringKeys.reduce((acc, filterKey) => {
        acc[filterKey.slice(7, -1)] = filterStrings[filterKey]
        return acc
      }, {})
      return { filter }
    }
    return { filter: {}}
  }, [filterState])


  return (
    <Meta
      title={`${theme.localisation.client} :: ${videoLocalisation.upper}`}
      meta={{ description: `View ${videoLocalisation.upper}` }}
    >
      <main>
        <PageHeader
          title={`Manage ${pluralize(videoLocalisation.upper)}`}
          subtitle={`${videos && videos.meta['record-count']
            ? videos.meta['record-count']
            : ''
          }
            ${videos && videos.meta['record-count'] === 1
              ? videoLocalisation.lower
              : pluralize(videoLocalisation.lower)
          }`}
        >
          <Button className="button" onClick={() => renderVideoForm(null)}>
            <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
            New {videoLocalisation.upper}
          </Button>
        </PageHeader>

        <div className="container">
          <div className="page-actions">
            <div className="cms-form__control">
                <AsyncSearchVideo
                  videoFilters={videoFilterObj}
                  value={selectedVideo}
                  onChange={(video) => {
                    setSelectedVideo(video)
                    getVideos(video && video.id || null)
                  }}
                />
            </div>
            { !selectedVideo && (
              <>
                {filtered &&
                  <Button type="button"
                    className="text-button text-button--error page-controls__right"
                    style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                    onClick={(e)=> {
                      setFiltered(false)
                      setFilterProgrammeTitle('')
                      setFilterState(initialFilterState)
                    }}
                  >
                    Clear filters
                  </Button>
                }
                <Button onClick={openFilters} className="button button--filled-bg page-controls__right" style={{height: '45px'}}>
                  <>
                    <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                    {filtered ? 'Filters Applied' : 'Filters'}
                  </>
                </Button>
              </>
            )}
          </div>
        </div>

        {renderVideoResources()}

        {(totalPages > 1 || videos?.length >= 50) && (
          <Paginator currentPage={ pageNumber } totalPages={ totalPages } onChange={ updatePage } onPageSizeChange={(page) => updatePage(page, true)} currentPageSize={pageSize}/>
        )}
      </main>
    </Meta>
  )
}

const enhance = compose(
  withVideoPageActions,
  withVideoProviders,
  withPageHelper
)

export default enhance(VideosIndex)