import React from 'react'

import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import compose from 'javascript/utils/compose'
import privateVideosClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

// Actions
import PrivateVideoViewsActions from 'javascript/actions/private-video-views'

// Stores
import PrivateVideoViewsStore from 'javascript/stores/private-video-views'

// Components
import Banner from 'javascript/components/banner'
import BrightcovePlayer from 'javascript/components/brightcove-player'
import Form from 'javascript/views/private-video-access/form'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NotFoundComponent from 'javascript/components/not-found'
import PageHelper from 'javascript/views/page-helper'
import WistiaPlayer from 'javascript/components/wistia-player'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'


class PrivateAccessVideo extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      hasPassword: false,
      modal: () => {}
    }
  }

  renderVideo = (video) => {
    const { brightcove, wistia } = this.props.videoProviders
    if (wistia && video['wistia-id']) {
      return (
        <div className="inline-video">
          <WistiaPlayer id={video['wistia-id']} title={video.name}/>
        </div>
      )
    } else if(brightcove && video['brightcove-id']) {
      return (
        <BrightcovePlayer id={video['brightcove-id']} brightcove={brightcove}/>
      )
    } else {
      return (
        <video src={video['mp4-url']} controls autoPlay className="inline-video" onContextMenu={(e) => e.preventDefault()}></video>
      )
    }
  }

  componentWillMount() {
    PrivateVideoViewsStore.on('change', this.setResource)
    PrivateVideoViewsStore.on('error', this.setErrors)
  }

  componentWillUnmount() {
    PrivateVideoViewsStore.removeListener('change', this.setResource)
    PrivateVideoViewsStore.removeListener('error', this.setErrors)
  }

  componentDidMount() {
    this.renderPasswordModal()
  }

  startVideo = (password) => {
    const { slug } = this.props.match.params
    PrivateVideoViewsActions.createResource({
      slug,
      password
    }, {
      include: 'video'
    })
    this.setState({
      loading: true,
      hasPassword: true
    })
  }

  setErrors = () => {
    const { data } = PrivateVideoViewsStore.getErrors()
    this.setState({
      error: data,
      loading: false
    })
  }

  setResource = () => {
    const [videoAccess] = PrivateVideoViewsStore.getResources()
    this.setState({
      resource: {
        ...videoAccess.video,
        'mp4-url': videoAccess['mp4-url']
      },
      loading: false
    })
  }

  renderPasswordModal = () => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ () => {/* Do nothing - should not be able to close modal without passwordEntered */ } }
            title={`Enter Private ${this.props.theme.localisation.video.upper} Password`}
            closeButton={false}
          >
            <div className="modal__content">
              <Form closeEvent={ this.unsetModal } passwordEntered={this.startVideo} />
            </div>
          </Modal>
        )
      }
    })
  }

  renderBanner = () => {
    const {privateVideosCV} = this.props
    return (
      <LoadPageBannerImage slug="private-video-access" fallbackBannerImage={privateVideosCV.bannerImage}>
        {({ image }) => (
          <Banner
            classes={privateVideosCV.bannerClasses}
            image={image}
          />
        )}
      </LoadPageBannerImage>
    )
  }

  render () {
    const {theme} = this.props

    if (this.state.loading) {
      return (
        <main>
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    }

    if (this.state.error) {
      return (
        <main>
          {this.renderBanner()}
          <div className="container container--clear-header u-align-center">
            <p className="heading heading--two">{this.state.error}</p>
          </div>
        </main>
      )
    }

    if (!this.state.hasPassword) {
      return (
        <main>
          {this.renderBanner()}
          <div className="container">
            { this.state.modal() }
          </div>
        </main>
      )
    }

    if (!this.state.resource) {
      return <NotFoundComponent />
    }

    return (
      <Meta
        title={`${theme.localisation.client} :: ${this.state.resource.name}`}>
        <main>
          {this.renderBanner()}
          <ClientChoice>
            <ClientSpecific client="default">
              <div className="section">
                <div className="container">
                  { this.renderVideo(this.state.resource) }
                </div>
              </div>
            </ClientSpecific>
            <ClientSpecific client="all3 | demo">
              <div class="container container--clear-header">
                { this.renderVideo(this.state.resource) }
              </div>
            </ClientSpecific>
          </ClientChoice>
        </main>
      </Meta>
    )
  }
}


const enhance = compose(
  withVideoProviders,
  withClientVariables('privateVideosCV', privateVideosClientVariables)
)

export default enhance(PrivateAccessVideo)