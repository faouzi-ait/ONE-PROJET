import React, { useState, useCallback, useEffect } from 'react'
import { isBase64 } from 'javascript/utils/generic-tools'

import 'stylesheets/admin/components/image-cropper'

import Icon from 'javascript/components/icon'

import ReactCropper from 'react-easy-crop'

const defaultCropSettings = {
  width: 0,
  height: 0,
  x: 0,
  y: 0
}

const renderCropper = (props) => <ReactCropper {...props} />

const createCanvas = (tabSize) => {
  const canvas = document.createElement('canvas')
  canvas.id = `${tabSize}-canvas`
  return canvas
}

const Cropper = (props) => {
  const [cropSize, setCropSize] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(null)
  const [croppedArea, setCroppedArea] = useState(defaultCropSettings)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(defaultCropSettings)
  const [canvas] = useState(createCanvas(props.size))
  const [ctx, setCtx] = useState(null)
  const [img] = useState(new Image())
  const [initialCroppedAreaPixels, setInitialCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedArea)
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  useEffect(() => {
    canvas.setAttribute
    return () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      const canvasInDocument = document.getElementById(`${props.size}-canvas`)
      if (canvasInDocument) {
        document.removeChild(canvasInDocument)
      }
    }
  }, [])

  const drawCrop = () => {
    if (!ctx) return
    img.setAttribute('crossOrigin', 'Anonymous')
    img.onload = (e) => {
      if (croppedAreaPixels.width && croppedAreaPixels.height) {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          props.finalImageSize.width,
          props.finalImageSize.height
        )
        const dataURL = canvas.toDataURL()
        props.onImageChanged(dataURL, { croppedAreaPixels, zoom, minZoom, initialCrop: crop })
      }
    }
    // cacheblock=true is a hack for Chrome, without it CORS failure.
    // seems like after preflight headers are not re-attached
    // https://stackoverflow.com/questions/20253472/cors-problems-with-amazon-s3-on-the-latest-chomium-and-google-canary?rq=1
    img.src = `${props.image}${isBase64(props.image) ? '' : '?cacheblock=true'}`
  }

  const autoZoom = () => { // forces image to cover whole crop area
    if ((props.zoom && props.minZoom) || !props.image) {
      return // image has a crop - no autoZoom required
    }
    if (croppedArea.width === 100 || croppedArea.height === 100) {
      setZoom(zoom + 0.05)
    } else if (!minZoom && croppedArea.width && croppedArea.height) {
      setMinZoom(zoom)
    }
  }
  useEffect(autoZoom, [croppedArea.width, croppedArea.height])

  useEffect(() => {
    if (minZoom) { // minZoom being set implies autoZoom is finished
      drawCrop()
    }
  }, [croppedAreaPixels, minZoom])

  useEffect(() => {
    if (!props.finalImageSize.width || !props.finalImageSize.width) return
    const finalAspectRatio = props.finalImageSize.width / props.finalImageSize.height
    const cropSelectionWidth = 220
    const cropSelectionHeight = cropSelectionWidth / finalAspectRatio
    setCropSize({ width: cropSelectionWidth, height: cropSelectionHeight })
    canvas.width = props.finalImageSize.width
    canvas.height = props.finalImageSize.height
    setCtx(canvas.getContext('2d'))
  }, [props.finalImageSize.width, props.finalImageSize.height])

  useEffect(() => {
    if (!props.image || !ctx) {
      return
    }
    setZoom(1)
    setMinZoom(null)
    setCroppedArea(defaultCropSettings)
    if (props.zoom && props.minZoom) {
      setZoom(props.zoom)
      setMinZoom(props.minZoom)
    }
  }, [props.image, ctx])

  useEffect(() => {
    if (props.initialCrop) {
      if (Object.keys(props.initialCrop).length === 4) {
        setInitialCroppedAreaPixels(props.initialCrop)
      } else {
        setInitialCroppedAreaPixels(null)
        setCrop(props.initialCrop)
      }
    }
  }, [props.initialCrop])

  const cropperProps = {
    image: props.image,
    crop,
    zoom,
    cropSize,
    onCropChange: setCrop,
    onCropComplete,
    initialCroppedAreaPixels
  }

  const cropContainerDimensions = !cropSize ? {} : {
    width: cropSize.width + 20 + 'px',
    height: cropSize.height + 20 + 'px',
  }

  return (
    <div className="cropper__container" style={cropContainerDimensions}>
      <div className="cropper__tool">
        <div className="cropper__view-area">
          <div className="cropper__crop-container">
            { props.imagesLoaded && props.visible && cropSize ? renderCropper(cropperProps) : null }
          </div>

        </div>
      </div>
      <div className="cropper__controls">
        <div className="cropper__range">
          <Icon id="i-image-small" width="16" height="14" viewBox="0 0 16 14" />
          <input
            type="range"
            step={0.05}
            value={zoom}
            min={minZoom || 1}
            max={minZoom ? minZoom + 3 : 3}
            className="cropper__input"
            onChange={({target}) => setZoom(Number.parseFloat(target.value))}
          />
          <Icon id="i-image-large" width="28" height="24" viewBox="0 0 28 24" />
        </div>
      </div>
    </div>
  )
}

export default Cropper
