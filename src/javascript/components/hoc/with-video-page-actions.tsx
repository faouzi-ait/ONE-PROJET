import React from 'react'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'

import DeleteForm from 'javascript/components/admin/video/delete-video'
import DownloadLink from 'javascript/components/admin/video/download-link'
import Modal from 'javascript/components/modal'
import ModalVideo from 'javascript/components/modal-video'
import PermissionsForm from 'javascript/components/video-permissions'
import PosterForm from 'javascript/components/admin/video/poster'
import VideoForm from 'javascript/components/admin/video-form'

import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withVideoProviders, { WithVideoProvidersType } from './with-video-providers'

// Types
import {
  EpisodeType,
  ProgrammeType,
  SeriesType
} from 'javascript/types/ModelTypes'

interface FormPropsType {
  onSave: () => any
  resource?: EpisodeType | ProgrammeType | SeriesType
  programme?: ProgrammeType
  series?: SeriesType
  episode?: EpisodeType
}

interface Props extends WithThemeType, WithModalType, WithVideoProvidersType {
  component: any
}

const VideoPageActions: React.FC<Props> = (props) => {

  const { theme } = props
  const { knox } = props.videoProviders
  const videoDownloadLinksResource = useResource('video-download-link')

  const openVideoModal = (video) => {
    props.modalState.showModal(({ hideModal }) => {
      let classes = ['video']
      if(knox && video['knox-uuid']) {
        classes.push('full-width')
      }
      return (
        <Modal delay={500} closeEvent={hideModal} modifiers={classes}>
          <h3 className="cms-modal__title">{video.name}</h3>
          <ModalVideo video={video} isFullWidthModal={classes.includes('full-width')} />
        </Modal>
      )
    })
  }

  const newVideoResource = (formProps: FormPropsType) => editVideoResource(formProps, false)

  const editVideoResource = (formProps: FormPropsType, isEdit = true) => {
    if (!formProps.onSave) {
      // default js error is not obvious in development
      console.error('Edit/New Video Resource, must provide onSave method to with-video-actions - formProps')
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${isEdit ? 'Edit' : 'New'} ${theme.localisation.video.upper}`}
          delay={500}
          closeEvent={hideModal}
        >
          <div className="cms-modal__content">
            <VideoForm { ...formProps } onSave={() => {
              hideModal()
              formProps.onSave()
            }}/>
          </div>
        </Modal>
      )
    })
  }

  const deleteVideoResource = (resource, onSave = () => {}) => {
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={hideModal}
          title="Warning"
          modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <DeleteForm resource={resource} closeEvent={hideModal} onSave={onSave} />
          </div>
        </Modal>
      )
    })
  }

  const editVideoPermissions = (resource, onSave = () => {}) => {
    const modalModifiers = []
    if (theme.features.restrictions.expiring) {
      modalModifiers.push('large')
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={`${resource.name} Permissions`}
          modifiers={modalModifiers}
          closeEvent={() => {
            hideModal()
            onSave()
          }}>
          <div className="cms-modal__content">
            <PermissionsForm resource={resource} />
          </div>
        </Modal>
      )
    })
  }

  const editVideoPoster = (resource, onSave = () => {}) => {
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal title={`${resource.name} Poster`} closeEvent={hideModal}>
          <div className="cms-modal__content">
            <PosterForm resource={resource} closeEvent={() => {
              onSave()
              hideModal()
            }} />
          </div>
        </Modal>
      )
    })
  }

  const generateOneTimeVideoDownload = (resource) => {
    videoDownloadLinksResource.createResource({
      video: {
        id: resource.id
      }
    }).then((response) => {
      props.modalState.showModal(({ hideModal }) => (
        <Modal title="Your one-time download link" closeEvent={hideModal}>
          <DownloadLink url={`https://${window.location.host}/${theme.localisation.video.path}/download/${response.uid}`} />
        </Modal>
      ))
    })

  }

  const videoActions = {
    deleteVideoResource,
    editVideoPermissions,
    editVideoPoster,
    editVideoResource,
    generateOneTimeVideoDownload,
    newVideoResource,
    openVideoModal,
  }

  return <props.component {...props} {...videoActions} />
}
const enhance = compose(
  withModalRenderer,
  withTheme,
  withVideoProviders
)

const EnhancedVideoPageActions = enhance(VideoPageActions)


const withVideoPageActions = (Component) => (props) => {
  return <EnhancedVideoPageActions {...props} component={Component} />
}

export default withVideoPageActions


