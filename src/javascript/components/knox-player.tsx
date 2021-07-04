import React from 'react'

interface Props {
  source: string
  title: string
}

const KnoxPlayer = ({ source, title }: Props) => {

  return (
    <iframe
      allowFullScreen
      width="1600"
      allowTransparency={true}
      className="wistia_embed"
      frameBorder="0"
      height="900"
      name="wistia_embed"
      scrolling="no"
      src={`${source}`}
      title={title}
    ></iframe>
  )
}

export default KnoxPlayer
