import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import useTheme from 'javascript/utils/theme/useTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

import collectionClientVariables from 'javascript/views/pages/collection/variables'
import imageCropperClientVariables from 'javascript/views/admin/image-cropper/variables'
import pageClientVariables from 'javascript/views/pages/page/variables'
import programmeClientVariables from 'javascript/views/catalogue/show/catalogue-banner/variables'
import newsClientVariables from 'javascript/views/news/article/variables'
import catalogueClientVariables from 'javascript/views/catalogue/variables'

import {
  imageDimensions,
  isBase64,
} from 'javascript/utils/generic-tools'

import 'stylesheets/admin/components/image-cropper'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import ImageCropper from 'javascript/components/admin/image-cropper'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import Tabs from 'javascript/components/tabs'

//Preview Components
import Banner from 'javascript/components/banner'


interface ButtonProps {
  handleFileChange: (e: any) => void,
  path: string
}

const ImageSelectButton = ({
  handleFileChange,
  path
}: ButtonProps) => {
  const  { prefix } = usePrefix()
  return (
    <>
      <div className="file-input">
      <input type="file" onChange={handleFileChange} className="file-input__input" />
      <span className={`${prefix}button ${prefix}button--filled ${prefix}button--small`}>Select an Image</span>
      <span className="file-input__path">{path}</span>
    </div>
    </>
  )
}

const tabSizes = {
  xlarge: {
    title: 'X-Large',
    index: 0,
  },
  large: {
    title: 'Large',
    index: 1,
  },
  medium: {
    title: 'Medium',
    index: 2,
  },
  small: {
    title: 'Small',
    index: 3,
  }
}

interface Props extends WithPageHelperType {}

const ImageCropperIndex: React.FC<Props & ReturnType<typeof useLogic>> = (props) => {

  const {
    croppedImages,
    modalState,
    originalUploadedImages,
    previewResource,
    saveImages,
    setCroppedImages,
    setDefaultImageSize,
    setOriginalUploadedImages,
    errors
  } = props

  const { features  }  = useTheme()
  const { systemPages } = useSystemPages()
  const collectionCV = useClientVariables(collectionClientVariables)
  const imageCropperCV = useClientVariables(imageCropperClientVariables)
  const pageCV = useClientVariables(pageClientVariables)
  const programmeCV = useClientVariables(programmeClientVariables)
  const newsArticleCV = useClientVariables(newsClientVariables)
  const catalogueCV = useClientVariables(catalogueClientVariables)

  const [activeTab, setActiveTab] = useState(0)
  const [showSmallPageError, setShowSmallPageError] = useState(true)
  const appOnly = imageCropperCV.appOnlyResource?.includes(props.resourceType)

  //App only images
  if(appOnly){
    delete tabSizes['large'] 
    delete tabSizes['medium'] 
    delete tabSizes['small'] 
  }

  const media = window.matchMedia('(min-width: 1024px)')
  const resize = ({ matches }) => {
    setShowSmallPageError(!matches)
  }
  useEffect(() => {
    resize(media)
    media.addListener(resize)
    return () => media.removeListener(resize)
  }, [])

  const handleFileChange = (e, size) => {
    const isOnlyUploadedImage = Object.keys(tabSizes).reduce((acc, tabSize) => {
      if (originalUploadedImages[tabSize].preview && tabSize !== size) {
        acc = false
      }
      return acc;
    }, true)
    if (isOnlyUploadedImage) {
      setDefaultImageSize(size)
    }
    const [ file ] = e.target.files
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const updateOriginalImages = {
        ...originalUploadedImages,
        [size]: {
          path: file.name,
          preview: e.target.result,
          usingDefaultImage: false,
          usingDefaultCrop: false,
          croppedAreaPixels: {},
        }
      }
      setOriginalUploadedImages(updateOriginalImages)
    }
    reader.readAsDataURL(file)
  }

  const getFinalSizes = (size) => {
    return props.previewPanelStyles[size] || {}
  }

  const renderPreviewPanel = (size = 'xlarge') => {
    const updatedImage = !croppedImages[size] ? null : {
      default: { // only has large/xlarge as image-cropper cannot be viewed on smaller screen sizes.
        large: croppedImages[size],
        xlarge: croppedImages[size]
      }
    }
    const mediaQueryClasses = {
      small: 'medium-media',
      medium: 'large-media',
      large: 'xlarge-media',
      xlarge: 'xlarge-media'
    }
    const width = imageDimensions.pixelify(getFinalSizes(size)).width
    const bannerProps = {
      classes: [mediaQueryClasses[size]],
      image: updatedImage || NO_CUSTOM_BANNER,
      title: previewResource.title,
      copy: null,
      logo: null
    }
    if (props.imageName === 'banner') {
      switch (props.resourceType) {
        case 'programmes': {
          if (programmeCV.showBannerCopy()) {
            bannerProps.copy = previewResource.introduction
          }
          bannerProps.logo = features.programmeOverview && features.programmeOverview.logoTitleBanner && previewResource.logo
          bannerProps.classes = bannerProps.classes.concat(programmeCV.bannerClasses)
          break
        }
        case 'pages': {
          bannerProps.classes = bannerProps.classes.concat(pageCV.bannerClasses)
          if (pageCV.showIntro) {
            bannerProps.copy = previewResource.introduction
          } else {
            bannerProps.copy = previewResource['published-at'] && moment(previewResource['published-at']).format(features.formats.longDate)
          }
          break
        }
        case 'collections': {
          bannerProps.classes = bannerProps.classes.concat(collectionCV.bannerClasses)
          break
        }
        case 'news-article': {
          bannerProps.classes = bannerProps.classes.concat(newsArticleCV.bannerClasses)
          break
        }
        case 'catalogue': {
          bannerProps.title = previewResource.name
          bannerProps.classes = bannerProps.classes.concat(catalogueCV.bannerClasses)
          break
        }
      }
      if (systemPages.includesSlug(props.previewResource?.slug)) {
        if (imageCropperCV.staticPageClasses) {
          bannerProps.classes = [mediaQueryClasses[size], ...imageCropperCV.staticPageClasses]
        }
      }
      return (
        <div className="cropper__preview" style={{ width }} >
          <Banner {...bannerProps}/>
        </div>
      )
    }
  }

  const onImageChanged = (size) => (croppedImageDataUrl, cropConfig) => {
    const updateCroppedImages = { ...croppedImages }
    updateCroppedImages[size] = croppedImageDataUrl
    setCroppedImages(updateCroppedImages)
    const updateOriginalImages = { ...originalUploadedImages }
    // crop has changed - need to provide crop details. (usingDefaultCrop: false)
    updateOriginalImages[size] = {
      ...updateOriginalImages[size],
      ...cropConfig,
      usingDefaultCrop: false
    }
    setOriginalUploadedImages(updateOriginalImages)
  }

  const makeDefaultImage = (newDefaultImageSize) => {
    const updateUploadedImages = {...originalUploadedImages}
    const updateCroppedImages = {...croppedImages}
    Object.keys(tabSizes).forEach((size => {
      if (newDefaultImageSize !== size) {
        updateUploadedImages[size] = {
          path: originalUploadedImages[newDefaultImageSize].path,
          preview: originalUploadedImages[newDefaultImageSize].preview,
          usingDefaultImage: true,
          usingDefaultCrop: true,
          croppedAreaPixels: originalUploadedImages[newDefaultImageSize].croppedAreaPixels,
          zoom: props.removeFloatFraction(originalUploadedImages[newDefaultImageSize].zoom),
          minZoom: null,
        }
        updateCroppedImages[size] = null
      }
    }))
    setDefaultImageSize(newDefaultImageSize)
    setOriginalUploadedImages(updateUploadedImages)
    setCroppedImages(updateCroppedImages)
    modalState.hideModal()
  }

  const renderDefaultImageWarning = (newDefaultImageSize) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}
        >
          <div className="cms-modal__content">
            <div style={{textAlign: 'center'}}>
              <p>This will overwrite all responsive image sizes with the current image.</p>
              <p>Crop settings for each size will need to be reset.</p>
              <Button type="button"
                className="button button--reversed"
                onClick={hideModal}
              >
                Cancel
              </Button>
              <Button type="button"
                className="button button--filled button--reversed"
                style={{marginLeft: '8px'}}
                onClick={() => makeDefaultImage(newDefaultImageSize)}
              >
                Yes, set as Default!
              </Button>
            </div>
          </div>
        </Modal>
      )
    })
  }

  if (showSmallPageError) {
    return (
      <div style={{ textAlign: 'center'}}>
        <SmallScreenMessage/>
      </div>
    )
  }

  const renderErrors = () => {
    if(errors) {
      return (
        <div className="container">
          <ul className="cms-form__errors cms-form__errors--spaced">
            { Object.keys(errors).map((key, i) => {
              const error = errors[key]
              return (
                <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
              )
            }) }
          </ul>
        </div>
      )
    }
  }

  return (
    <main>
      <>
        <PageHeader title={`Manage Images for ${previewResource.title || previewResource.name}`}>
          <Button type="button" onClick={props.closeImageCropper} className="button">
            <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
            Back to Manage Images
          </Button>
        </PageHeader>
        <Tabs onChange={({value}) => setActiveTab(value)}>
          { Object.keys(tabSizes).map((tabSize) => {
            const finalSizes = getFinalSizes(tabSize)
            const retinaSizes = Object.keys(finalSizes).reduce((retina, key) => {
              retina[key] = finalSizes[key] * 2
              return retina
            }, {})
            return (
              <div title={`${tabSizes[tabSize].title} (${imageDimensions.pixelify(retinaSizes).width})`} key={tabSizes[tabSize].index} >
                <div className="cropper__tab">
                  <div className="cropper__preview-panel">
                    <h3>Preview:</h3>
                    {renderPreviewPanel(tabSize)}
                  </div>
                  <div className="cropper__wrapper">
                    <h3>Zoom &amp; crop your images</h3>
                    <p>Use the zoom-slider and drag the image around until you are happy with the placement.</p>
                    <div style={{ display: 'flex'}}>
                      <div className="cropper__controls">
                        <ImageCropper
                          image={originalUploadedImages[tabSize].preview || ''}
                          finalImageSize={getFinalSizes(tabSize)}
                          initialCrop={originalUploadedImages[tabSize].initialCrop}
                          onImageChanged={onImageChanged(tabSize)}
                          zoom={originalUploadedImages[tabSize].zoom}
                          minZoom={originalUploadedImages[tabSize].minZoom}
                          imagesLoaded={props.imagesLoaded}
                          visible={activeTab === tabSizes[tabSize].index}
                          size={tabSize}
                        />
                      </div>
                      <div className="cropper__controls" >
                        <ImageSelectButton
                          handleFileChange={(e) => handleFileChange(e, tabSize)}
                          path={originalUploadedImages[tabSize].path || ''}
                        />
                        {!appOnly &&
                          <div className="cropper__default-button">
                            <Button type="button"
                              className="button button--filled button--small"
                              onClick={() => renderDefaultImageWarning(tabSize)}
                            >
                              Use as default
                            </Button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </Tabs>
        {renderErrors()}
        <div style={{textAlign: 'center'}}>
          <Button type="button" className="button button--null" style={{ marginRight: '10px'}} onClick={props.closeImageCropper}>Cancel</Button>
          <Button type="submit" className="button button--filled" onClick={saveImages} >Save Changes</Button>
        </div>
      </>
    </main>
  )
}

const useLogic = (props) => {
  const { resourceId, resourceType, imageName, variant } = props.match.params
  const resourceTypeSingular = pluralize.singular(resourceType)

  const imageConfigResource = useResource('image-configuration')
  const responsiveImageResource = useResource('responsive-image')
  const imageCropperPreviewResource = useResource(resourceType)

  const [defaultImageSize, setDefaultImageSize] = useState('xlarge')
  const [previewPanelStyles, setPreviewPanelStyles] = useState({})
  const [previewResource, setPreviewResource] = useState({})
  const [previewResourceLoading, setPreviewResourceLoading] = useState(true)
  const [imageConfigLoading, setImageConfigLoading] = useState(true)
  const [imageResourcesLoading, setImageResourcesLoading] = useState(true)
  const [responsiveImageId, setResponsiveImageId] = useState(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [errors, setErrors] = useState(null)

  const [originalUploadedImages, setOriginalUploadedImages] = useState({
    xlarge: {},
    large: {},
    medium: {},
    small: {}
  })

  const [croppedImages, setCroppedImages] = useState({
    // used for rendering a preview panel (renderPreviewPanel) - generated from canvas (drawCrop)
    xlarge: null,
    large: null,
    medium: null,
    small: null
  })

  const relation = {
    name: resourceType,
    id: resourceId
  }

  useEffect(() => {
    props.pageIsLoading(true)
    getImageConfig()
    getPreviewResource()
    getResponsiveImages()
  }, [])

  useEffect(() => {
    props.pageIsLoading([imageConfigLoading, previewResourceLoading, imageResourcesLoading])
    setImagesLoaded(!imageConfigLoading && !previewResourceLoading && !imageResourcesLoading)
  }, [imageConfigLoading, previewResourceLoading, imageResourcesLoading])

  const getImageConfig = () => {
    imageConfigResource.findAll({
      fields: {
        'image-configuration': 'version,variant,small,medium,large,xlarge'
      },
      filter: {
        variant,
        version: `${resourceTypeSingular}-${imageName}`
      }
    })
    .then((response) => {
      const imageConfiguration = response[0] || {}
      setPreviewPanelStyles({
        small: imageDimensions.parse(imageConfiguration.small),
        medium: imageDimensions.parse(imageConfiguration.medium),
        large: imageDimensions.parse(imageConfiguration.large),
        xlarge: imageDimensions.parse(imageConfiguration.xlarge)
      })
    })
    .catch(props.pageReceivedError)
    .finally(() => {
      setImageConfigLoading(false)
    })
  }

  const getPreviewResource = () => {
    let params = {}
    switch (resourceType) {
      case 'programmes': {
        params = {
          fields: {
            programmes: 'title,introduction'
          }
        }
        break
      }
      case 'pages': {
        params = {
          fields: {
            pages: 'title,published-at,slug'
          }
        }
        break
      }
      case 'collections': {
        params = {
          fields: {
            collections: 'title'
          }
        }
        break
      }
      case 'news-article': {
        params = {
          fields: {
            'news-articles': 'title'
          }
        }
        break
      }
      case 'catalogue': {
        params = {
          fields: {
            'catalogues': 'name'
          }
        }
        break
      }
      case 'programme-highlight-page': {
        params = {
          fields: {
            'programme-highlight-page': 'title'
          }
        }
        break
      }
    }
    imageCropperPreviewResource.findOne(resourceId, params)
    .then((response) => {
      setPreviewResource(response)
    })
    .catch(props.pageReceivedError)
    .finally(() => {
      setPreviewResourceLoading(false)
    })
  }

  const getResponsiveImages = () => {
    responsiveImageResource.findAllFromOneRelation(relation, {
      fields: {
        'responsive-images': 'name,variant,default-image,small,small-crop,medium,medium-crop,large,large-crop,xlarge,xlarge-crop,remote-urls'
      },
      filter: {
        variant,
        name: `${resourceTypeSingular}-${imageName}`
      }
    })
    .then((response) => {
      if (response.length) {
        const responsiveImages = response[0]
        const updateOriginalImages = {}
        Object.keys(tabSizes).forEach((size) => {
          updateOriginalImages[size] = {
            path: '',
            preview: responsiveImages['remote-urls'][size] ? responsiveImages['remote-urls'][size].original : '',
            croppedAreaPixels: imageDimensions.parse(responsiveImages[`${size}-crop`].crop),
            zoom: Number.parseFloat(responsiveImages[`${size}-crop`].zoom),
            minZoom: Number.parseFloat(responsiveImages[`${size}-crop`].minZoom),
            initialCrop: responsiveImages[`${size}-crop`].initialCrop,
          }
        })
        setOriginalUploadedImages(updateOriginalImages as any)
        setResponsiveImageId(responsiveImages.id)
        setDefaultImageSize(responsiveImages['default-image'])
      }
    })
    .catch(props.pageReceivedError)
    .finally(() => {
      setImageResourcesLoading(false)
    })
  }

  // calculating zoom with float division gives values like: 1.2500000000002
  const removeFloatFraction = (value) => {
    if (!value) return ''
    return value.toString().slice(0, 4)
  }

  const saveImages = () => {
    setImageResourcesLoading(true)
    const updateOriginalImages = {}
    let defaultImageResource
    // Reset all tabSizes using default image
    Object.keys(tabSizes).forEach((size) => {
      const updateSize = {...originalUploadedImages[size]}

      if (updateSize.usingDefaultImage) { //remove base64 strings
        updateSize.path = null
        updateSize.preview = null
      }
      if (updateSize.usingDefaultCrop && size !== defaultImageSize) {
        updateSize.croppedAreaPixels = null
      }
      if (defaultImageSize === size) {
        defaultImageResource = updateSize
      }
      updateOriginalImages[size] = updateSize
    })
    //Create Resources for saving
    const saveResource = {
      id: null,
      'name': `${resourceTypeSingular}-${imageName}`,
      variant,
      'default-image': defaultImageSize,
    }
    if (responsiveImageId) {
      saveResource.id = responsiveImageId
    } else {
      saveResource[resourceTypeSingular] = {
        id: resourceId
      }
    }
    Object.keys(tabSizes).forEach((size) => {
      const crop = updateOriginalImages[size].croppedAreaPixels || defaultImageResource.croppedAreaPixels
      const initialCrop = updateOriginalImages[size].initialCrop || defaultImageResource.croppedAreaPixels
      const zoom = updateOriginalImages[size].zoom || defaultImageResource.zoom
      const minZoom = updateOriginalImages[size].minZoom // no default minZoom - must run autoZoom for each image size on load

      let uri = isBase64(updateOriginalImages[size].preview) ? updateOriginalImages[size].preview : ''
      if (responsiveImageId && updateOriginalImages[size].usingDefaultImage) {
        uri = 'default'
      }
      saveResource[`${size}-data-uri`] = uri
      saveResource[`${size}-crop`] = {
        crop: imageDimensions.stringify(crop),
        initialCrop,
        zoom: removeFloatFraction(zoom),
        minZoom: removeFloatFraction(minZoom),
      }
      delete saveResource[size]
      delete saveResource['remote-urls']
    })
    const save = responsiveImageId ? responsiveImageResource.updateResource : responsiveImageResource.createResource
    save(saveResource)
    .then(imagesCreatedOnS3)
    .then(closeImageCropper)
    .catch((error) => {
      props.pageIsLoading(false)
      setErrors(error)
    })
  }

  const imagesCreatedOnS3 = (savedImages) => new Promise((resolve, reject) => {
    const startPoll = () => {
      setTimeout(() => {
        responsiveImageResource.findOne(savedImages.id, {
          fields: {
            'responsive-images': 'small,medium,large,xlarge'
          }
        })
        .then((response) => {
          const allImagesSaved = Object.keys(tabSizes).reduce((acc, key) => {
            if (acc) {
              acc = response[key].cropped ? response[key].cropped.storage === 'store' : false
            }
            return acc
          }, true)
          if (allImagesSaved) {
            return resolve(true)
          } else {
            startPoll()
          }
        })
      }, 1000)
    }
    startPoll()
  })

  const closeImageCropper = () => {
    props.history.goBack();
  }

  return {
    ...props,
    closeImageCropper,
    croppedImages,
    imageName,
    imagesLoaded,
    originalUploadedImages,
    previewPanelStyles,
    previewResource,
    removeFloatFraction,
    resourceId,
    resourceType,
    saveImages,
    setCroppedImages,
    setDefaultImageSize,
    setImagesLoaded,
    setOriginalUploadedImages,
    errors
  }
}

const enhance = compose(
  withPageHelper,
  withHooks(useLogic)
)

export default enhance(ImageCropperIndex)