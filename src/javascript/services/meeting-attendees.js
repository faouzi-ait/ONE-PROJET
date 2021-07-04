import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class MeetingAttendeeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'meeting-attendee'
    this.jsonApi.define('meeting-attendee', modelData.meetingAttendees)
    this.jsonApi.define('user', modelData.users)
  }

  createResources = (resources, cb) => {
    const ids = []
    if (resources.length < 1) {
      cb(ids)
    }
    resources.forEach(r => {
      delete r.status
      if (r.type === 'meeting-attendees') {
        if (r.hasOwnProperty('user') && !r['user']) {
          delete r['user']
        }
        this.jsonApi.update(this.resourceName, r).then(res => {
          ids.push({id: res.id})
          if (ids.length === resources.length) {
            cb(ids)
          }
        })
      } else if (r.id) {
        this.jsonApi.create(this.resourceName, {
          user: { id: r.id },
          vip: r.vip,
          'send-virtual-meeting-email': r['send-virtual-meeting-email']
        }).then(res => {
          ids.push({id: res.id})
          if (ids.length === resources.length) {
            cb(ids)
          }
        })
      } else {
        this.jsonApi.create(this.resourceName, r).then(res => {
          ids.push({id: res.id})
          if (ids.length === resources.length) {
            cb(ids)
          }
        })
      }
    })
  }
}

const service = new MeetingAttendeeService
export default service
