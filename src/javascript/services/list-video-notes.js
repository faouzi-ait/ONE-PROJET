import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListVideoNotesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-video-note'
    this.jsonApi.define('list-video-note', modelData.listVideoNotes)
    this.jsonApi.define('list-video', modelData.listVideos)
    //mono-repo: How does this get defined??
    // this.jsonApi.define('list-videos')
  }
}

export default new ListVideoNotesService