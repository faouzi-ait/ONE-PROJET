import React from 'react'

import ListStore from 'javascript/stores/lists'
import ListProgrammeNotesStore from 'javascript/stores/list-programme-notes'
import ListSeriesNotesStore from 'javascript/stores/list-series-notes'
import ListVideoNotesStore from 'javascript/stores/list-video-notes'

import ListActions from 'javascript/actions/lists'
import ListProgrammeNotesActions from 'javascript/actions/list-programme-notes'
import ListSeriesNotesActions from 'javascript/actions/list-series-notes'
import ListVideoNotesActions from 'javascript/actions/list-video-notes'

import Note from 'javascript/components/note'
import NewNoteForm from '../note-form'

// @ts-ignore
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'
// @ts-ignore
import ProgrammePlaceholderRetina from 'images/theme/programme-placeholder-retina.jpg'
import { ListType } from 'javascript/types/ModelTypes'
import styled from 'styled-components'
import LikeActionIndicator from './LikeActionIndicator'
import { useLazyLoadImage } from 'javascript/components/lazy-load-image'
import VideoProviders from 'javascript/types/VideoProviders'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

type Props = {
  listId: any
  videoProviders: VideoProviders
  theme: ThemeType
}

interface State {
  list: ListType
}

class ListNotes extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      list: null,
    }
  }

  componentWillMount() {
    ListStore.on('change', this.setListToState)
    ListProgrammeNotesStore.on('change', this.getList)
    ListSeriesNotesStore.on('change', this.getList)
    ListVideoNotesStore.on('change', this.getList)
  }

  componentWillUnmount() {
    ListStore.removeListener('change', this.setListToState)
    ListProgrammeNotesStore.removeListener('change', this.getList)
    ListSeriesNotesStore.removeListener('change', this.getList)
    ListVideoNotesStore.removeListener('change', this.getList)
  }

  componentDidMount() {
    this.getList()
  }

  setListToState = () => {
    this.setState({
      list: ListStore.getResource(),
    })
  }

  deleteListProgrammeNote = note => {
    ListProgrammeNotesActions.deleteResource(note)
  }

  deleteListSeriesNote = note => {
    ListSeriesNotesActions.deleteResource(note)
  }

  deleteListVideoNote = note => {
    ListVideoNotesActions.deleteResource(note)
  }

  getList = () => {
    ListActions.getResource(this.props.listId, {
      include: [
        'list-programmes',
        'list-programmes.like',
        'list-programmes.list-programme-notes',
        'list-programmes.programme',
        'list-series',
        'list-series.like',
        'list-series.list-series-notes',
        'list-series.series',
        'list-series.series.programme',
        'list-videos',
        'list-videos.like',
        'list-videos.list-video-notes',
        'list-videos.video',
      ].join(','),
      fields: {
        lists: 'list-programmes,list-series,list-videos',
        'list-programmes':
          'list-programme-notes,programme,notes-count,list-position,like,screener',
        'list-series':
          'list-series-notes,series,notes-count,programme-name,list-position,like,screener',
        'list-videos':
          'list-video-notes,video,notes-count,programme-name,list-position,like,screener',
        'list-programme-notes': 'text,created-at',
        'list-series-notes': 'text,created-at',
        'list-video-notes': 'text,created-at',
        likes: 'action',
        programmes: 'title,thumbnail',
        series: 'name,programme',
        videos: 'name,poster',
      },
    })
  }

  render() {
    const { list } = this.state
    const { videoProviders, theme } = this.props

    if (!list) {
      return <div className="loader" />
    }

    return (
      <div className="listing">
        {list['list-programmes']
          .sort((a, b) => a['list-position'] - b['list-position'])
          .map(listProgramme => {
            let thumbnailUrl = listProgramme.programme.thumbnail.small.url
            if(theme.features.lite) {
              thumbnailUrl = theme.customer.programmeThumbnailPlaceholderImageUrls.default
            }

            return (
              <div className="listing__item" key={listProgramme.id}>
                <div className="listing__left-col">
                  <ThumbnailImage
                    src={thumbnailUrl}
                    placeholderSrc={ProgrammePlaceholder}
                  />
                  <LikeActionIndicator
                    action={(listProgramme.like || { action: 'its_ok' }).action}
                  />
                </div>
                <div>
                  <h2 className="listing__heading">
                    {listProgramme.programme.title}
                  </h2>

                  {listProgramme['notes-count'] > 0 && (
                    <table className="meeting-notes__table">
                      <tbody>
                        {listProgramme['list-programme-notes'].map(note => (
                          <Note
                            deleteNote={this.deleteListProgrammeNote}
                            note={note}
                            parent="table"
                            key={note.id}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <NewNoteForm resource={listProgramme} />
              </div>
            )
          })}

        {list['list-series']
          .sort((a, b) => a['list-position'] - b['list-position'])
          .map(listSeries => {
            let thumbnail =
              listSeries.series.programme.thumbnail.small.url ||
              `${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`
            if(theme.features.lite) {
              thumbnail = theme.customer.programmeThumbnailPlaceholderImageUrls.default
            }

            return (
              <div className="listing__item" key={listSeries.id}>
                <div className="listing__left-col">
                  <ThumbnailImage
                    src={thumbnail}
                    placeholderSrc={ProgrammePlaceholder}
                  />
                  <LikeActionIndicator
                    action={(listSeries.like || { action: 'its_ok' }).action}
                  />
                </div>

                <div>
                  <h2 className="listing__heading">{listSeries.series.name}</h2>

                  <h3 className="listing__sub-heading">
                    {listSeries['programme-name']}
                  </h3>

                  {listSeries['notes-count'] > 0 && (
                    <table className="meeting-notes__table">
                      <tbody>
                        {listSeries['list-series-notes'] &&
                          listSeries['list-series-notes'].map(note => (
                            <Note
                              deleteNote={this.deleteListSeriesNote}
                              note={note}
                              parent="table"
                              key={note.id}
                            />
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <NewNoteForm resource={listSeries} />
              </div>
            )
          })}

        {list['list-videos']
          .sort((a, b) => a['list-position'] - b['list-position'])
          .map(listVideo => {
            let thumbnail = listVideo.video.poster.small.url
            if (videoProviders.wistia && thumbnail === null) {
              thumbnail = listVideo.video['wistia-thumbnail-url']
            } else if (thumbnail === null) {
              thumbnail = `${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina}`
            }

            return (
              <div className="listing__item" key={listVideo.id}>
                <div className="listing__left-col">
                  <ThumbnailImage
                    src={thumbnail}
                    placeholderSrc={ProgrammePlaceholder}
                  />
                  <LikeActionIndicator
                    action={(listVideo.like || { action: 'its_ok' }).action}
                  />
                </div>

                <div>
                  <h2 className="listing__heading">{listVideo.video.name}</h2>

                  <h3 className="listing__sub-heading">
                    {listVideo['programme-name']}
                  </h3>

                  {listVideo['notes-count'] > 0 && (
                    <table className="meeting-notes__table">
                      <tbody>
                        {listVideo['list-video-notes'] &&
                          listVideo['list-video-notes'].map(note => (
                            <Note
                              deleteNote={this.deleteListVideoNote}
                              note={note}
                              parent="table"
                              key={note.id}
                            />
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <NewNoteForm resource={listVideo} />
              </div>
            )
          })}
      </div>
    )
  }
}

const ImageWithPlaceholder: React.FC<{
  src: string
  placeholderSrc: string
}> = ({ src, placeholderSrc, ...props }) => {
  const image = useLazyLoadImage({ src, placeholderSrc })
  return <img src={image} {...props}></img>
}

const ThumbnailImage = styled(ImageWithPlaceholder)`
  width: 100%;
  background-color: #d94857;
`

export default withVideoProviders(ListNotes)