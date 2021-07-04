import React from 'react'
import apiConfig from 'javascript/config'
import downloadjs from 'downloadjs'
import axios from 'axios'

class DownloadTrigger extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const name = this.props.name
    var x=new XMLHttpRequest();
    x.open('GET', this.props.link , true)
    x.responseType="blob";
    x.onload= function(e){downloadjs(e.target.response, `${name}.mp4`)}
    x.send();
    this.props.history.push({
      pathname: '/',
      state: {
        notification: {
          message: 'Your download is in progress',
          type: 'static'
        }
      }
    })
  }
  render() {
    return (
      <a href={this.props.link} ref={node => {this.download = node}}></a>
    )
  }
}

export default class VideoDownloadIndex extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      video: false
    }
  }
  componentDidMount() {
    this.downloadVideo()
  }
  downloadVideo = () => {
    const self = this
    axios({
      url: `${apiConfig.apiUrl}/${this.props.theme.localisation.video.path}/download/${this.props.match.params.video}`,
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
      },
    }).then((response) => {
      if(response.data.error) {
        this.props.history.push({
          pathname: '/',
          state: {
            notification: {
              message: response.data.error,
              type: 'error'
            }
          }
        })
      }
      self.setState({
        video: response.data.data.attributes
      })
    }).catch((err) => {
      this.props.history.push({
        pathname: '/',
        state: {
          notification: {
            message: 'This download link has expired',
            type: 'error'
          }
        }
      })
    })
  }
  render() {
    if (this.state.video) {
      return <DownloadTrigger history={this.props.history} link={this.state.video['download-link'].replace('http://', '//')} name={this.state.video['video-name']} />
    } else {
      return null
    }
  }
}

