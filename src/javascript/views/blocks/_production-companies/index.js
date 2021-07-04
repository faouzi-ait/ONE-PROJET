import React from 'react'
import ReactDOM from 'react-dom'

import compose from 'javascript/utils/compose'
import allClientVariables from './variables'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

import Actions from 'javascript/actions/production-companies'
import Store from 'javascript/stores/production-companies'
import Analytics from 'javascript/actions/analytics'

import ProductionCompany from 'javascript/components/production-company'
import CustomSelect from 'javascript/components/custom-select'
import BrightcovePlayer from 'javascript/components/brightcove-player'
import WistiaPlayer from 'javascript/components/wistia-player'
import Modal from 'javascript/components/modal'
import VideoView from 'javascript/components/video-view'


class ProductionCompanies extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      modal: () => { },
      resources: null,
      countryFilter: null
    }
  }

  componentDidMount() {
    const { wistia, brightcove } = this.props.videoProviders
    Actions.getResources({
      // sort: this.props.clientVariables.sortOrder,
      include: 'video,custom-attributes',
      fields: {
        'videos': ['name', wistia && 'wistia-id', brightcove && 'brightcove-id'].filter(v => v).join(','),
        'production-companies': 'name,background-image,country,external-url,intro,logo,programmes-count,video,custom-attributes',
        'custom-attributes': 'name,value'
      },
      filter: {
        ...this.props.category && { 'custom-attribute-value': `string:${this.props.category}` },
        ...!this.props.category && { 'custom-attribute-type-name': 'Global' }
      }
    })
  }

  componentWillMount() {
    Store.on('change', this.getResources)
  }

  componentWillUnmount() {
    Store.removeListener('change', this.getResources)
  }

  getCountries = (resources) => {
    return (
      [
        'All',
        ...Object.keys(resources.reduce((acc, v) => v.country ? ({ ...acc, [v.country]: true }) : acc, {}))
      ]
    )
  }

  getResources = () => {
    let resources = Store.getResources()
    if (!this.props.category) {
      resources = resources.filter(v => v['custom-attributes'].find(a => (a.name === 'Global') && a.value))
    }
    this.setState({
      resources,
      countryFilter: 'All'
    })
  }

  renderVideo = (videoView) => {
    const { wistia, brightcove } = this.props.videoProviders
    if (wistia && videoView['wistia-id']) {
      return (
        <WistiaPlayer id={videoView['wistia-id']} title={videoView.name} />
      )
    } else if (brightcove && videoView['brightcove-id']) {
      return (
        <BrightcovePlayer id={videoView['brightcove-id']} brightcove={brightcove} />
      )
    } else {
      return (
        <video src={videoView['mp4-url']} controls autoPlay onContextMenu={(e) => e.preventDefault()} className="inline-video"></video>
      )
    }
  }

  openVideoModal = (video) => {
    this.setState(() => ({
      modal: () => {
        const timeStart = performance.now()
        return (
          <Modal delay={500} ref="modal" closeEvent={() => {
            const timeStop = performance.now()
            Analytics.recordVideoView({
              id: video.id,
              time: Math.round(timeStop - timeStart)
            })
            this.unsetModal(this.removeRoute)
          }} modifiers={['video']}>
            <h3 className="modal__title">{video.name}</h3>
            <VideoView
              video={video}
              reportingType="content-block"
              renderVideoView={(videoView) => this.renderVideo(videoView)}
            />
          </Modal>
        )
      }
    }))
  }

  unsetModal = callback => {
    if (this.refs.modal) {
      ReactDOM.findDOMNode(this.refs.modal).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState({
          modal: () => { }
        }, typeof callback === 'function' ? callback : () => { })
      }, 500)
    }
  }

  render() {
    if (!this.state.resources) {
      return null
    }
    const resources = this.state.resources.filter(v => (this.state.countryFilter==='All') || (v.country===this.state.countryFilter) || !this.props.countrySelector)
    return resources.length ? (
      <div>
        {this.props.countrySelector && (
          <div className="grid grid--center grid--justify content-block__select">
            <span>Country</span>
            <CustomSelect placeholder={false} onChange={({target}) => this.setState({countryFilter:target.value})} options={this.getCountries(this.state.resources).map(v => ({value:v,label:v}))} value={this.state.countryFilter} />
          </div>
        )}
        {resources.map(resource =>
          <ProductionCompany key={resource.id} resource={resource} onPlayVideo={(video) => () => this.openVideoModal(video)} buttonText={this.props.buttonText} />
        )}
        { this.state.modal && this.state.modal() }
      </div>
    ) : (
      <div className="grid grid--center grid--justify">
        <p>There are no production companies available for this category.</p>
      </div>
    )
  }
}
const enhance = compose(
  withVideoProviders,
  withClientVariables('clientVariables', allClientVariables),
)
const EnhancedProductionCompanies = enhance(ProductionCompanies)

export default (block, assets, props) => {
  return (
    <EnhancedProductionCompanies countrySelector={block.countrySelector} category={block.category} buttonText={block.buttonText} />
  )
}