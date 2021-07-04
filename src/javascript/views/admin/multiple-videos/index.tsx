// React
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Prompt, RouteComponentProps } from 'react-router'
import axios from 'axios'
import batchPromises from 'batch-promises'
import pluralize from 'pluralize'
import uuid from 'uuid/v4'

import 'stylesheets/admin/components/progress'

import { findAllByModel, findOneByModel } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import {useWistiaMultiVideoUploadState, useBrightcoveMultiVideoUploadState} from 'javascript/utils/hooks/use-multi-video-upload-state'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import withVideoProviders, { WithVideoProvidersType } from 'javascript/components/hoc/with-video-providers'
import useBrightcoveUploader from 'javascript/utils/hooks/use-brightcove-uploader'

// Components
import Button from 'javascript/components/button'
import Form from 'javascript/views/admin/multiple-videos/form'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Uploader from 'javascript/components/uploader'

import { VideoType } from 'javascript/types/ModelTypes'
import { WithThemeType } from 'javascript/utils/theme/withTheme'

interface MatchParams {
  programme: string
  series?: string
  episode?: string
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType, WithThemeType, WithVideoProvidersType {
  resources: VideoType[]
}

type OnProgressHandler = (params: {
  percentComplete: number
  secondsLeft: number
  fileSize: number
  remainingSize: number
  video: VideoType
}) => void

const MultipleVideos: React.FC<Props> = ({
  history,
  match,
  pageIsLoading,
  resources,
  modalState,
  theme,
  videoProviders
}) => {

  const programmeId = Number.parseInt(match.params.programme) || 0
  const seriesId = Number.parseInt(match.params.series) || 0
  const episodeId = Number.parseInt(match.params.episode) || 0

  const [programme, setProgramme] = useState(null)
  const [series, setSeries] = useState(null)
  const [episode, setEpisode] = useState(null)
  const [parent, setParent] = useState(null)
  const [wistiaConfig, setWistiaConfig] = useState(null)

  const [displayUploader, setDisplayUploader] = useState(false)

  const { localisation } = theme

  const [files, setFiles] = useState(null)
  const [rejectedFiles, setRejectedFiles] = useState(null)
  const [selectedVideoProvider, setSelectedVideoProvider] = useState(null)

  const multiWistiaUploads = useWistiaMultiVideoUploadState()
  const multiBrightcoveUploads = useBrightcoveMultiVideoUploadState()
  let videos = []
  if(selectedVideoProvider === 'wistia') {
    videos = multiWistiaUploads.videos()
  }
  if(selectedVideoProvider === 'brightcove') {
    videos = multiBrightcoveUploads.videos()
  }

  const supportedVideoProviders = ['brightcove', 'wistia'].map(vp => videoProviders[vp]).filter(Boolean)

  useEffect(() => {
    document.getElementById('home-button').addEventListener('click', pageWillLeave)
    fetchResources()
    return () => {
      document.getElementById('home-button').removeEventListener('click', pageWillLeave)
    }
  }, [])

  const fetchResources = () => {
    if (programmeId) {
      findOneByModel('programmes', programmeId, {
        fields: ['title', 'title-with-genre', 'series'],
        include: ['series', 'series.episodes'],
        includeFields: {
          series: ['name', 'episodes'],
          episodes: ['name'],
        },
      }).then((response) => {
        setProgramme(response)
        setParent(response)
      })
    }
    if (match.params.series) {
      findOneByModel('series', seriesId, {
        fields: ['name', 'episodes'],
        include: ['episodes'],
        includeFields: {
          episodes: ['name'],
        },
      }).then((response) => {
        setSeries(response)
        setParent(response)
      })
    }
    if (match.params.episode) {
      findOneByModel('episodes', episodeId, {
        fields: ['name', 'series'],
        include: ['series', 'series.programme', 'series.episodes'],
        includeFields: {
          episodes: ['name', 'series'],
          programmes: ['title', 'title-with-genre', 'series'],
          series: ['name', 'programme', 'episodes'],
        },
      }).then((response) => {
        setEpisode(response)
        setParent(response)
      })
    }
    if (videoProviders.wistia) {
      findAllByModel('wistia-accounts', {
        fields: ['wistia-token', 'wistia-project'],
      }).then(resources => {
        setWistiaConfig(resources[0])
      })
    }
  }

  useEffect(() => {
    pageIsLoading([
      match.params.programme && !programme,
      match.params.series && !series,
      match.params.episode && !episode
    ])
  }, [programme, series, episode])

  const pageWillLeave = (e) => {
    if (resources && 
      ((selectedVideoProvider === 'wistia' && multiWistiaUploads.unSavedChanges()) || 
      selectedVideoProvider === 'brightcove' && !multiBrightcoveUploads.allUploadsCompleted())) {
      e.preventDefault()
      confirmLeave(e.currentTarget.href, false)
    }
  }

  const routerLeave = (nextLocation) => {
    if(selectedVideoProvider === 'wistia'){
      multiWistiaUploads.resetState()
    }
    if(selectedVideoProvider === 'brightcove'){
      multiBrightcoveUploads.resetState()
    }
    history.push(nextLocation.pathname)
  }

  const confirmLeave = (nextLocation, push = true) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
              <div className="cms-form__control u-align-center">
                {selectedVideoProvider === 'wistia' &&
                  <p>{`Are you sure you wish to leave without saving? Your ${pluralize(localisation.video.lower)} will not be saved without saving the form.`}</p>
                }
                {selectedVideoProvider === 'brightcove' &&
                  <p>{`Are you sure you wish to leave? There might be issues with your upload if you leave whilst ${pluralize(localisation.video.lower)} are still uploading to brightcove.`}</p>
                }
              </div>
              <div className="cms-form__control cms-form__control--actions">
                <Button type="button" className="button button--reversed" onClick={ hideModal }>Cancel</Button>
                { push ?
                  <Button type="button" className="button button--reversed" onClick={ () => {
                    hideModal()
                    routerLeave(nextLocation) 
                  }}>Leave anyway</Button>
                  :
                  <a className="cms-button cms-button--reversed" href={nextLocation.pathname}>Leave anyway</a>
                }
              </div>
          </div>
        </Modal>
      )
    })
  }

  const editResources = () => {
    let parent = episode ? episode : series ? series : programme
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal title="Edit Videos" delay={ 500 } closeEvent={ hideModal } >
          <div className="cms-modal__content">
            <Form parent={ parent } series={ series } programme={ programme } onResourcesCreated={resetResources} videoProvider={selectedVideoProvider} />
          </div>
        </Modal>
      )
    })
  }

  const resetResources = () => {
    modalState.hideModal()
    if(selectedVideoProvider === 'wistia'){
      multiWistiaUploads.resetState()
    }
    if(selectedVideoProvider === 'brightcove'){
      multiBrightcoveUploads.resetState()
    }
    let url = `/admin/${localisation.programme.path}/${programmeId}`
    if (seriesId) {
      url += `/${localisation.series.path}/${seriesId}`
    }
    if (episodeId) {
      url += `/${localisation.episodes.path}/${episodeId}`
    }
    history.push(`${url}/${localisation.video.path}`)
  }

  const addFiles = (files, rejectedFiles) => {
    setFiles(files)
    setRejectedFiles(rejectedFiles)
  }

  const uploadWistiaFiles = (updateFiles) => {
    multiWistiaUploads.setVideosToUpload(updateFiles)
    closeUploader()
    batchPromises(1, updateFiles, (file) => {
      return new Promise((resolve) => {
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('access_token', wistiaConfig['wistia-token'])
        formData.append('project_id', wistiaConfig['wistia-project'])
        axios({
          url: 'https://upload.wistia.com',
          method: 'POST',
          data: formData,
          onUploadProgress: (progressEvent) => {
            multiWistiaUploads.setVideoProgress({
              progressEvent,
              id: file.id,
            })
          }
        }).then((response) => {
          multiWistiaUploads.setVideoUploaded({
            response,
            id: file.id,
          })
          resolve('uploaded')
        }).catch((error) => {
          multiWistiaUploads.setVideoErrored({
            error,
            id: file.id,
          })
          resolve('errored')
        })
      })
    }).then((responses) => {
      if (!responses.includes('errored')) {
        multiWistiaUploads.setAllUploadsCompleted(true)
      }
    })
  }

  const reportBrightcoveProgress: OnProgressHandler = ({
    secondsLeft,
    percentComplete,
    video
  }) => {
    multiBrightcoveUploads.setVideoProgress({
      secondsLeft,
      percentComplete,
      id: video.id,
    })
  }

  const uploadBrightcoveFiles = (updateFiles) => {
    multiBrightcoveUploads.setVideosToUpload(updateFiles)
    closeUploader()
    batchPromises(1, updateFiles, (file) => {
      return new Promise((resolve) => {
        const video = {
          ...file,
          parent,
        }
        useBrightcoveUploader(
          video,
          reportBrightcoveProgress,
          theme,
          null,
        ).then((response) => {
            multiBrightcoveUploads.setVideoUploaded({
              response,
              id: file.id,
              key: file.key
            })
            resolve('uploaded')
          })
          .catch(e => {
            resolve('errored')
        })
      })
    }).then((responses) => {
      if (!responses.includes('errored')) {
        multiBrightcoveUploads.setAllUploadsCompleted(true)
      }
    })
  }

  const uploadFiles = ({ provider }) => {
    const updateFiles = files.map((file, id) => ({file, name: file.name, id, key: uuid()}))
    setSelectedVideoProvider(provider)

    if (videoProviders.wistia && provider === 'wistia') {
      uploadWistiaFiles(updateFiles)
    } else if(videoProviders.brightcove && provider === 'brightcove'){
      uploadBrightcoveFiles(updateFiles)
    }
  }

  const closeUploader = (cancel = false) => {
    if (cancel) {
      setFiles(null)
    }
    setDisplayUploader(false)
  }

  const renderUploader = () => {
    return (
      <Uploader
        onDrop={ addFiles }
        files={ files }
        rejectedFiles={ rejectedFiles }
        onSubmit={uploadFiles}
        onClose={ closeUploader }
        type="video"
        progress={ null }
        videoProviders={supportedVideoProviders}
      />
    )
  }

  const getTimeRemaining = (seconds: number) => {
    if (!seconds || seconds < 1) {
      return ''
    }
    if (seconds > 120) {
      return `Approximately ${(seconds / 60).toFixed(0)} minutes remaining`
    }
    return `Approximately ${seconds.toFixed(0)} seconds remaining`
  }

  const renderResources = () => {
    const resources = (videos || []).map((resource) => {
      return (
        <tr
          key={ resource.id }
          className={'cms-table__row'}>
          <td>{resource.name}</td>
          <td>
            { resource.restricted &&
              <span className="count count--warning">Restricted</span>
            }
            { resource['public-video'] &&
              <span className="count count--success">Public</span>
            }
          </td>
          { resource.response?.data ?
            <td>
              <p className="cms-form__errors">{ resource.response.data.error}</p>
            </td>
            :
            <>
              <td className="cms-table__actions">
                <div className="progress"><span className="progress__bar"><span className="progress__loaded" style={{width: `${resource.progress * 100}%`}}></span></span></div>
              </td>
              <td>
                {resource.secondsLeft > 0 &&
                  <small>{getTimeRemaining(resource.secondsLeft)}</small>
                }
              </td>
            </>
          }
        </tr>
      )
    })

    if(resources.length > 0) {
      return (
        <div className="container">
          <h3>Uploads to {selectedVideoProvider.toUpperCase()}</h3>
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan={4}>Name</th>
              </tr>
            </thead>
            <tbody>
              { resources }
            </tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>{`There are currently no ${pluralize(localisation.video.lower)} being uploaded for this ${localisation.programme.lower}, try uploading some!`}</p>
          </div>
        </div>
      )
    }
  }

  return (
    <main>
      <PageHeader title={ `Manage Multiple ${pluralize(localisation.video.upper)} ${programme ? `for ${programme.title}` : ''}` }>
        { videos.length === 0 &&
          <Button className="button" onClick={() => setDisplayUploader(true)}>
            <Icon width="14" height="14" id="i-admin-add" classes="cms-button__icon" />
              Upload Videos
          </Button>
        }
      </PageHeader>
      <div className="container">
        <div className="page-actions">
          <NavLink className="cms-button"
            to={window.location.pathname.replace('/multiple', '')}
          >
            <Icon width="8" height="13" id="i-admin-back" classes="cms-button__icon" />
            Back to { pluralize(localisation.video.upper) }
          </NavLink>
          { videos.length > 0 &&
            <div>
              <Button className="button" onClick={ editResources }>
                <Icon width="14" height="14" id="i-admin-add" classes="cms-button__icon" />
                Edit Video Details
              </Button>
            </div>
          }
        </div>
      </div>

      { renderResources() }
      { displayUploader && renderUploader() }
      <Prompt
        when={videos && (selectedVideoProvider === 'wistia' ? multiWistiaUploads.unSavedChanges() : !multiBrightcoveUploads.allUploadsCompleted())}
        message={(nextLocation) => {
          confirmLeave(nextLocation, selectedVideoProvider !== 'wistia' && false)
          return false
        }}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper,
  withVideoProviders
)

export default enhance(MultipleVideos)

