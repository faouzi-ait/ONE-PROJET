/* These are whitelisted on ONE-API - if you need a message.type it has to be added here as well as BE */

const socketActions = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  MEETING_ATTENDEES: 'MEETING_ATTENDEES',
  MEETING_ENDED_BY_HOST: 'MEETING_ENDED_BY_HOST',
  MEETING_STARTED_BY_HOST: 'MEETING_STARTED_BY_HOST',
  ATTENDEE_APPEAR: 'ATTENDEE_APPEAR', // not being used - event to handle onFocus dictating online-status
  ATENDEE_AWAY: 'ATENDEE_AWAY', // not being used - event to handle onBlur dictating offline-status
  ATTENDEE_JOINED: 'ATTENDEE_JOINED',
  ATTENDEE_REMOVE: 'ATTENDEE_REMOVE', // not being used - event to remove attendee from meeting (host could kick you out)
  AUDIO_ENABLED: 'AUDIO_ENABLED',
  PDF_LOAD: 'PDF_LOAD',
  PDF_PAGE_NUMBER: 'PDF_PAGE_NUMBER',
  VIDEO_CLIENT_READY: 'VIDEO_CLIENT_READY',
  VIDEO_LOAD: 'VIDEO_LOAD',
  VIDEO_PAUSE: 'VIDEO_PAUSE',
  VIDEO_READY_PLAY: 'VIDEO_READY_PLAY',  
  VIDEO_TRACK_POSITION: 'VIDEO_TRACK_POSITION',
  VIDEO_HOST_POSITION: 'VIDEO_HOST_POSITION',
  VIEWPORT_RESET: 'VIEWPORT_RESET',
}

export default socketActions
