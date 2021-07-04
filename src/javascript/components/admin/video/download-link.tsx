import React, { useRef, useState, useEffect } from 'react'
import Button from 'javascript/components/button'

const DownloadLink = ({
  url,
}: {
  url: string
}) => {

  const [copiedDownloadLink, setCopiedDownloadLink] = useState(false)
  const downloadLinkRef = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      setCopiedDownloadLink(false)
    }, 3000)
  }, [copiedDownloadLink])

  const copyLink = () => {
    downloadLinkRef.current.select()
    try {
      document.execCommand('copy')
      setCopiedDownloadLink(true)
    } catch (err) {
      alert('Please use Ctrl/Cmd + C to copy')
    }
  }

  return (
    <div className="cms-modal__content">
      <input className="cms-form__input" ref={downloadLinkRef} defaultValue={url} />{' '}
      <Button
        className="button button--filled button--small"
        onClick={copyLink}
      >
        {copiedDownloadLink ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}


export default DownloadLink