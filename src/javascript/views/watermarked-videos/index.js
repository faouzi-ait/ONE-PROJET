import React from 'react'
import WatermarkedVideoStore from 'javascript/stores/watermarked-video-downloads'
import WatermarkedVideoActions from 'javascript/actions/watermarked-video-downloads'
import withTheme from 'javascript/utils/theme/withTheme'

class DownloadTrigger extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.download.click()
  }
  render() {
    return (
      <a href={this.props.link} ref={node => {this.download = node}}></a>
    )
  }
}

class VideoDownloadIndex extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      video: false
    }
  }

  componentWillMount = () => {
    WatermarkedVideoStore.on('change', this.setVideo)
    WatermarkedVideoStore.on('error', this.getErrors)
  }

  componentWillUnmount() {
    WatermarkedVideoStore.removeListener('change', this.setVideo)
    WatermarkedVideoStore.removeListener('error', this.getErrors)
  }

  componentDidMount() {
    if(!this.props.user) {
      const { location, theme } = this.props
      this.props.history.push(`/${theme.variables.SystemPages.login.path}?from=${location.pathname}`)
    }
    this.downloadVideo()
  }

  setVideo = () => {
    this.setState({
        video: WatermarkedVideoStore.getResources()[0]
    })
  }

  getErrors = () => {
    this.props.history.push({
        pathname: '/',
        state: {
          notification: {
            message: `Video ${WatermarkedVideoStore.getErrors()['uuid']}`,
            type: 'error'
          }
        }
    })
  }

  downloadVideo = () => {
    WatermarkedVideoActions.createResource({
        'uuid' : this.props.match.params.video
    })
  }

  render() {
    if (this.state.video) {
      return <DownloadTrigger link={this.state.video['download-url']} />
    } else {
      return null
    }
  }
}

export default withTheme(VideoDownloadIndex)