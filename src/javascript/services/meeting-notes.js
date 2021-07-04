import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class MeetingNotesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'meeting-note'
    this.jsonApi.define('meeting-note', modelData.meetingNotes)
    // mono-repo: Where is this definition coming from?? Already on JSONAPI instance?
    // this.jsonApi.define('user')

    this.jsonApi.define('meeting', modelData.meetings)
  }
}

const service = new MeetingNotesService
export default service