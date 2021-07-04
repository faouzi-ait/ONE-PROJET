import React from 'react'

import 'stylesheets/core/components/video'

export default class Video extends React.Component {
  render() {
    const { src } = this.props
    return (
      <div className="video">
        <iframe src={src} frameBorder="0" className="video__iframe"></iframe>
      </div>
    )
  }
}