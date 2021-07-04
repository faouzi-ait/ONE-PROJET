import React, { useState } from 'react'
import axios from 'axios'

import 'stylesheets/core/components/pdf-download-button'

import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import allClientVariables from 'javascript/components/pdf-download-button/variables'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { AUTH_TOKEN, IMPERSONATED_AUTH_TOKEN } from 'javascript/utils/constants'
import { clientName, isLiteClient } from 'javascript/utils/theme/liteClientName'

let SERVERLESS_URL = process.env.TARGET_ENV === 'production' ?
  'https://qqhujsl1td.execute-api.eu-west-1.amazonaws.com/production/pdf'
  : 'https://doqy0dk5g0.execute-api.eu-west-1.amazonaws.com/staging/pdf'

if(process.env.TARGET_ENV === 'development'){
  SERVERLESS_URL = 'http://0.0.0.0:3000/pdf'
}

const generatePdf = (pdfType, postData) => {
  // pdfType format - (i.e. 'programmes')
  // postData - contains all post request data required by lambda
  const requestData = {
    ...postData,
    pdfType,
    client: process.env.CLIENT,
    token: safeLocalStorage.getItem(IMPERSONATED_AUTH_TOKEN) || safeLocalStorage.getItem(AUTH_TOKEN),
  }

  if (isLiteClient()) {
    const liteClient = clientName().toUpperCase()
    const environment = process.env.TARGET_ENV === 'production' ? 'production' : 'staging'
    requestData.liteClient = process.env.TARGET_ENV === 'production' ? liteClient : clientName()
  }
  return axios.post(SERVERLESS_URL, requestData)
}

const ProgrammeButton = (props) => {

  const buttonText = props.buttonText || props.pdfButtonCV.programmeButtonText

  let buttonClasses = props.pdfButtonCV.programmeButtonClasses
  if (props.isLoading) {
    buttonClasses += ' button--loading'
  }

  return (
    <Button type="button" onClick={props.onButtonClick} className={buttonClasses} title="Download PDF">
      { props.isLoading ? null : (
        <ClientChoice>
          <ClientSpecific client="default">
            <Icon id={props.pdfButtonCV.downloadIcon} classes="button__icon" />
            {buttonText}
          </ClientSpecific>
          <ClientSpecific client="drg">
            <span className="button-circle__icon" ><Icon width="20" height="20" id="i-download" /></span>
            <span className="button-circle__text">{buttonText}</span>
          </ClientSpecific>
        </ClientChoice>
      )}
    </Button>
  )
}

const MarketingButton = (props) => {
  const buttonClasses = props.isLoading ? 'button button--loading' : 'button'
  return (
    <Button className={buttonClasses} onClick={props.onButtonClick} >
      { props.isLoading ? null : <Icon width="14" height="14" id="i-admin-add" classes="button__icon" /> }
      Create Report
    </Button>
  )
}

const ListsButton = (props) => {
  let pdfButtonClasses = props.buttonClasses ? props.buttonClasses : 'button'
  if (props.isLoading) {
    pdfButtonClasses += ' button--loading'
  }
  return (
    <Button className={pdfButtonClasses} onClick={props.onButtonClick} >
       <ClientChoice>
        <ClientSpecific client="default">
          Save as PDF
        </ClientSpecific>
        <ClientSpecific client="ae">
          <Icon id="i-download" classes="button__icon" />
          Download PDF
        </ClientSpecific>
      </ClientChoice>
    </Button>
  )
}

const PdfDownloadButton = (props) => {
  const {
    autoDownload = false, // generates download dialog
    displayPdf = false, // opens iFrame displaying pdf
    pdfType, // pdf format - (i.e. 'programmes')
    postData, // postData - contains all post request data required by lambda
    pdfTitle = '', // provides new window with a title
  } = props

  const pdfButtonCV = useClientVariables(allClientVariables)

  const [isLoading, setIsLoading] = useState(false)

  const onButtonClick = () => {
    setIsLoading(true)
    let pdfWindow
    if (displayPdf) {
      pdfWindow = window.open('')
      const html = `
        <html>
          <head>
            <link rel="icon" type="image/png" href="${encodeURI(`${window.location.protocol}/${window.location.host}/assets/images/favicon.png`)}" ></link>
            <title>${`pdf - ${pdfTitle}`}</title>
            <style> html, body, iframe { height: 100vh; width: 100vw } </style>
          </head>
          <body>
            <div id="pdf-loading" style="width:100%; text-align:center; padding-top:15%;">Loading...</div>
            <div id="pdf-content"></div>
          </body>
        </html>
      `
      pdfWindow.document.write(html)
    }

    generatePdf(pdfType, postData)
      .then((response) => {
        setIsLoading(false)
        const pdfUrl = response.data
        const sliceIndex = pdfUrl.lastIndexOf('/') + 1
        const s3Location = pdfUrl.slice(0, sliceIndex)
        const fileName = encodeURIComponent(pdfUrl.slice(sliceIndex))
        const encodedUrl = s3Location + fileName
        if (displayPdf) {
          pdfWindow.location.href = encodedUrl
          pdfWindow.document.close()
        }
        if (autoDownload) {
          const downloadLink = document.createElement('a')
          downloadLink.setAttribute('href', encodedUrl)
          downloadLink.setAttribute('download', `${pdfTitle}.pdf`)
          downloadLink.style.display = 'none'
          document.body.append(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        }
      })
      .catch((error) => console.error(error))
  }

  const otherProps = {
    isLoading,
    onButtonClick,
    pdfButtonCV,
  }

  return (
    <div>
      { props.pdfType === 'programmes' ? <ProgrammeButton {...props} {...otherProps} /> : null }
      { props.pdfType === 'marketing' ? <MarketingButton {...props} {...otherProps} /> : null }
      { props.pdfType === 'lists' ? <ListsButton {...props} {...otherProps} /> : null }
    </div>
  )
}

export default PdfDownloadButton