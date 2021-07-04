import moment from 'moment'

export const formatTimeOnPage = (ms) => {
  const duration = moment.duration(Math.floor(ms))

  if (duration.minutes() > 0) {
    return duration.humanize()
  } else {
    return `${duration.seconds()} seconds`
  }
}
