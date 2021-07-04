import React, { useEffect, useState, useRef } from 'react'
import pdfjs from 'pdfjs-dist'
import styled from 'styled-components'

import { AssetPreviewType } from 'javascript/views/virtual-screening/host/pdf-selector'
import { SocketConnectionType } from 'javascript/views/virtual-screening/use-sockets'

interface Props {
  asset: AssetPreviewType,
  isHostController: boolean
  remoteControlPageNumber?: number
  scale?: number
  socketConn?: SocketConnectionType
  stopSharing?: () => void
}

const PdfPresentation: React.FC<Props> = ({
  asset,
  isHostController,
  remoteControlPageNumber,
  scale = 1.3,
  socketConn,
  stopSharing = () => {},
}) => {

  const canvasRef = useRef()
  const [ctx, setCtx] = useState(null)
  const [editPageNum, setEditPageNum] = useState(1)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [page, setPage] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageRendering, setPageRendering] = useState(false)
  const [pageNumPending, setPageNumPending] = useState(null)
  const [totalPages, setTotalPages] = useState(null)

  useEffect(() => {
    // need to keep this GlobalWorkerOptions inline with version in package.json or else it can fail setting up webWorker
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://npmcdn.com/pdfjs-dist@2.3.200/build/pdf.worker.js'
    if (canvasRef.current) {
      //@ts-ignore
      setCtx(canvasRef.current.getContext('2d'))
    }
  }, [])

  const loadPdfDocument = () => {
    pdfjs.getDocument(asset.url).promise.then((loadedPdfDoc) => {
      setPdfDoc(loadedPdfDoc)
      setTotalPages(loadedPdfDoc.numPages)
      getPage(loadedPdfDoc, 1)
    })
  }

  useEffect(() => {
    clearPage()
    setPageNum(1)
    if (!asset) return
    loadPdfDocument()
  }, [asset])

  useEffect(() => {
    window.addEventListener('resize', reportWindowSize)
    return () => removeEventListener('resize', reportWindowSize)
  }, [ctx, page])

  let resizeTimer
  const reportWindowSize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      clearPage()
      setImmediate(getPage)
    }, 500)
  }

  useEffect(() => {
    if (!isHostController && remoteControlPageNumber && page && !pageRendering) { //wait for initial page to complete rendering before setting new page position
      queuePageNumberRendering(remoteControlPageNumber)
    }
  }, [remoteControlPageNumber, page, pageRendering])

  useEffect(() => {
    if (pageNum) {
      getPage()
      if (isHostController) {
        socketConn.sendPdfPageNumber(pageNum)
      }
    }
  }, [pageNum])

  useEffect(() => {
    setEditPageNum(pageNumPending || pageNum)
  }, [pageNum, pageNumPending])

  useEffect(() => {
    renderPage()
  }, [page])

  const getPage = (_pdfDoc = pdfDoc, _pageNum = pageNum) => {
    if (!_pdfDoc || !_pageNum) return
    _pdfDoc.getPage(_pageNum).then((page) => {
      setPage(page)
    })
  }

  const clearPage = () => {
    setPage(null)
    if (canvasRef.current && ctx) {
      //@ts-ignore
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const renderPage = () => {
    if (page && !pageRendering) {
      setPageRendering(true)
      const maxCanvasWidth = (document.documentElement.clientWidth / 100) * 90
      let viewport = page.getViewport({ scale })
      if (viewport.width > maxCanvasWidth) {
        viewport = page.getViewport(maxCanvasWidth / page.getViewport(1.0).width)
      }
      if (canvasRef.current) {
        //@ts-ignore
        canvasRef.current.height = viewport.height
        //@ts-ignore
        canvasRef.current.width = viewport.width
      }
      const renderContext = {
        //@ts-ignore
        canvasContext: ctx,
        viewport: viewport
      }

      page.render(renderContext).promise.then(() => {
        setPageRendering(false)
        if (pageNumPending !== null) {
          setPageNum(pageNumPending)
          setPageNumPending(null)
        }
      })
    }
  }

  const queuePageNumberRendering = (nextPageNumber) => {
    setTimeout(() => {
      if (pageRendering) {
        setPageNumPending(nextPageNumber)
      } else {
        setPageNum(nextPageNumber)
      }
    }, 1500)
  }
  const loadNextPage = () => queuePageNumberRendering(pageNum < totalPages ? pageNum + 1 : pageNum)
  const loadPrevPage = () => queuePageNumberRendering(pageNum > 1 ? pageNum - 1 : pageNum)

  const renderControls = () => {
    return (
      <>
        { isHostController && (
          <div style={{ position: 'relative', height: '50px', paddingBottom: '8px'}}>
            <PrevButton type="button" className="button" onClick={loadPrevPage}>Previous</PrevButton>
            <PageInfo>
              Page:
              <input type="text" className="form__input virtual__page-number"
                value={editPageNum}
                onKeyUp={(e) => {
                  if (e.keyCode == 13) {
                    //@ts-ignore
                    const num = Number.parseInt(e.target.value)
                    if (num > 0 && num <= totalPages) {
                      queuePageNumberRendering(num)
                    } else {
                      queuePageNumberRendering(num === 0 ? 1 : totalPages)
                    }
                  }
                }}
                //@ts-ignore
                onChange={(e) => setEditPageNum(e.target.value.replace(/[^0-9]+/g, ''))}
              />
              <span>{`/ ${totalPages}`}</span>
            </PageInfo>
            <NextButton type="button" className="button" onClick={loadNextPage}>Next</NextButton>
          </div>
        )}
      </>
    )
  }

  const renderLoadingPdf = () => (
    <div className="loader"></div>
  )

  //@ts-ignore
  const pdfHeight = canvasRef.current?.height
  //@ts-ignore
  const pdfWidth = canvasRef.current?.width
  let maxHeight = '100%'
  if (canvasRef.current && isHostController) {
    //@ts-ignore
    const ratio = canvasRef.current?.clientWidth / pdfWidth
    //@ts-ignore
    maxHeight = pdfHeight * ratio
  }

  return (
    <div className="grid grid--justify virtual__presentation virtual__presentation--pdf"
    style={{
        maxWidth: '100%',
        width: pdfWidth || '100%',
        height: pdfHeight || '100%',
        maxHeight
      }}
    >
      <div className={`virtual__pdf-wrapper ${!isHostController && 'virtual__pdf-wrapper--client'}`}>
        {pdfDoc ? renderControls() : renderLoadingPdf()}
        <div className={['virtual__pdf-viewer', isHostController &&  pdfDoc && 'virtual__pdf-viewer--is-host'].filter(Boolean).join(' ')}
          data-title="YOU ARE SCREENING THIS PDF"
        >
          {pdfDoc && isHostController &&
            <button className="virtual__stop-sharing-button" onClick={stopSharing}>Stop Sharing</button>
          }
          <canvas
            style={{maxWidth: '100%'}}
            ref={canvasRef}
          />
        </div>
      </div>
    </div>
  )
}

export default PdfPresentation

const PrevButton = styled.button`
  position: absolute;
  left: 0;
`

const NextButton = styled.button`
  position: absolute;
  right: 0;
`

const PageInfo = styled.div`
  position: absolute;
  left: calc(50% - 85px);
  width: 180px;
`
