import React, { useState, useEffect } from 'react'
import axios from 'axios'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import { withRouter } from 'react-router-dom'

const PassportFlightSchedule = (props) => {

  const [downloadUrl, setDownloadUrl] = useState(null)
  const linkRef = React.createRef()

  useEffect(() => {
    if (props.file) {
      const fileURL = window.URL.createObjectURL(new Blob([props.file], {type: 'application/pdf'}))
      setDownloadUrl(fileURL)
      window.open(fileURL)
    }
  }, [props.file])

  useEffect(() => {
    linkRef.current.click()
    setTimeout(() => {
      props.history.push({
        pathname: '/',
        state: {
          notification: {
            message: 'Flight Schedule download commenced',
            type: 'success'
          }
        }
      })
    }, 2000)
  }, [downloadUrl])

  return (
    <div>
      <a href={downloadUrl} ref={linkRef} download="flight-schedule.pdf"></a>
      <object width="400" height="500" type="application/pdf" data={props.file}></object>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withLoader,
  withHooks(props => {
    const { marketId } = props.match.params
    const [file, setFile] = useState(null)
    const marketsResource = nameSpaced('passport', useResource('passport-market'))

    useEffect(() => {
      marketsResource.findOne(marketId, {
        fields: {
          'passport-markets': 'flight-schedule-pdf',
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([Boolean(file)])
    }, [file])

    const downloadError = () => {
      props.history.push({
        pathname: '/',
        state: {
          notification: {
            message: 'This download link has failed',
            type: 'error'
          }
        }
      })
    }

    useWatchForTruthy(marketsResource.queryState.errored, () => {
      downloadError()
    })

    useWatchForTruthy(marketsResource.queryState.succeeded, () => {
      const flightSchedule = marketsResource.getDataById(marketId)
      if (flightSchedule['flight-schedule-pdf'] && flightSchedule['flight-schedule-pdf'].url) {
        axios({
          url: flightSchedule['flight-schedule-pdf'].url,
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          },
          responseType: 'blob'
        }).then((response) => {
          setFile(response.data)
        }).catch(downloadError)
      } else {
        downloadError()
      }
    })

    return {
      ...props,
      file,
    }
  })
)

export default enhance(PassportFlightSchedule)