import React from 'react'
import 'stylesheets/core/generic/inline-video'
import 'stylesheets/core/components/video'
import BrightcovePlayer from 'javascript/components/brightcove-player'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import { isCms } from 'javascript/utils/generic-tools'

class Video extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      played: false,
    }
  }
  componentDidMount(){
    this.setState({
      autoPlay: this.props.poster !== undefined
    })
  }
  playVideo = () => {
    this.setState({
      played: true,
    })
    if (this.video) {
      this.video.src += '?autoplay=1'
    }
  }
  render() {
    const props = this.props
    const { brightcove } = props.videoProviders
    return (
      <>
        <div className={`video ${(!this.state.played && props.poster) &&
          'video--with-poster'}`}>
          {props.poster && (
            <div
              className={`video__poster ${this.state.played &&
                'video__poster--hide'}`}
            >
              <picture>

                /* #region  ae | all3 | amc | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
                {props.isMedia ? (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/580x327/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/1160x654/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                ) : (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/1180x664/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/2360x1328/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                )}
                {/* #endregion */}
                {/* #region banijaygroup */}
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/280x158/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/560x316/',
                  )} 2x`}
                  media="(max-width: 320px)"
                />
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/768x433/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/1536x866/',
                  )} 2x`}
                  media="(max-width: 767px)"
                />
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/568x320/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/1136x640/',
                  )} 2x`}
                  media="(max-width: 568px)"
                />
                {props.isMedia ? (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/580x327/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/1160x654/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                ) : (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/1180x665/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/2360x1330/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                )}
                {/* #endregion */}
                {/* #region  cineflix */}
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/280x158/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/560x316/',
                  )} 2x`}
                  media="(max-width: 320px)"
                />
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/768x443/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/1536x866/',
                  )} 2x`}
                  media="(max-width: 767px)"
                />
                <source
                  srcSet={`${props.poster.file.url.replace(
                    '.net/',
                    '.net/568x320/',
                  )}, ${props.poster.file.url.replace(
                    '.net/',
                    '.net/1136x640/',
                  )} 2x`}
                  media="(max-width: 568px)"
                />
                {props.isMedia ? (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/676x380/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/1352x760/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                ) : (
                  <img
                    srcSet={`${props.poster.file.url.replace(
                      '.net/',
                      '.net/1180x665/',
                    )}, ${props.poster.file.url.replace(
                      '.net/',
                      '.net/2360x1460/',
                    )} 2x`}
                    alt=""
                    className="video__image"
                    onClick={this.playVideo}
                  />
                )}
                {/* #endregion */}
              </picture>
            </div>
          )}
          {!props.dragged && (
            <div>
              {props.provider !== 'brightcove' && 
                <iframe src={props.url + props.vidId} frameBorder="0" allowFullScreen className="video__iframe" ref={(node) => {this.video=node}}></iframe>
              }
              {!isCms() && brightcove && props.provider === 'brightcove' &&
                <BrightcovePlayer className="video__iframe" id={props.vidId} brightcove={brightcove} />
              }
            </div>
          )}
        </div>
        {props.title &&
          <h2 className="video__title">{props.title}</h2>
        }
      </>
    )
  }
}

const VideoBlock = withVideoProviders(Video)

export default (
  { images, provider, vidId, title },
  assets,
  props = { dragged: false },
  isMedia = false,
  theme
  ) => {
    const url = {
    youtube: 'https://www.youtube.com/embed/',
    vimeo: 'https://player.vimeo.com/video/',
    wistia: 'https://fast.wistia.net/embed/iframe/',
  }[provider]
  let poster = null
  if (images && images.length > 0) {
    const posterId = images[0].imageIds[0]
    poster = assets['page-images'] && assets['page-images'].find(a => a.id === posterId)
  }
  return <VideoBlock title={title} poster={poster} url={url} dragged={props.dragged} vidId={vidId} isMedia={isMedia} provider={provider} />
}


