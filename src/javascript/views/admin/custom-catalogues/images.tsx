import React, {useEffect, useState} from 'react'

import imageDimensions from 'javascript/config/image-dimensions'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'

// Components
import Button from 'javascript/components/button'
import FileUploader from 'javascript/components/file-uploader'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import { RouteComponentProps, useHistory } from 'react-router-dom'

let VARIANT = 'default'

interface MatchParams {
  catalogueId
}

interface Props extends RouteComponentProps<MatchParams> {}

type ImageTypes = 'catalogue-thumbnail'

const CustomCataloguesImages: React.FC<Props> = ({
  match,
}) => {
  const theme = useTheme()
  const history = useHistory()

  const imageResource = useResource('image')
  const responsiveImageResource = useResource('responsive-image')

  const [errors, setErrors] = useState(null)
  const [images, setImages] = useState(null)
  const [imagesToSave, setImagesToSave] = useState({})
  const [loading, setLoading] = useState(false)
  const [responsiveImages, setResponsiveImages] = useState(null)

  const { catalogueId } = match.params
  const catalogueRelation = {
    id: catalogueId,
    name: 'catalogue'
  }

  useEffect(() => {
    getCatalogueImages()
    getCatalogueResponsiveImages()
  }, [])

  const getCatalogueImages = () => {
    imageResource.findAllFromOneRelation(catalogueRelation, {
      fields: {
        'images': 'name,remote-urls'
      },
      filter: {
        'variant': VARIANT
      }
    }).then((response) => {
      setImages(response)
    })
  }

  const getCatalogueResponsiveImages = () => {
    responsiveImageResource.findAllFromOneRelation(catalogueRelation, {
      fields: {
        'responsive-images': 'name,remote-urls'
      },
      filter: {
        'variant': 'default'
      }
    }).then((response) => {
      setResponsiveImages(response)
    })
  }

  const removeResponsiveImage = (type) => {
    const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
    if (!confirmed) return
    const responsiveImage = responsiveImages.find((elem) => elem.name === type)
    if (responsiveImage) {
      responsiveImageResource.deleteResource({
        'id': responsiveImage.id,
      })
      .then(getCatalogueResponsiveImages)
    }
  }

  const saveImages = (e) => {
    e.preventDefault()
    setLoading(true)
    const saveActions = Object.keys(imagesToSave).map((type, i) => {
      const image = imagesToSave[type]
      const save = image.id ? imageResource.updateResource : imageResource.createResource
      const saveResource = {
        id: image.id || null,
        name: type,
        'image-data-uri': image.preview,
        'variant': VARIANT
      }
      if (!saveResource.id) {
        saveResource['catalogue'] = {
          id: catalogueId
        }
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          save(saveResource).then(resolve).catch(reject)
        }, i * 200)
      })
    })
    Promise.all(saveActions)
    .then((response) => {
      setTimeout(() => {
        history.push(`/admin/${theme.localisation.catalogue.path}`)
      }, 1500) //loading images to s3 is async - give it a chance
    })
    .catch(setErrors)
  }

  const removeImage = (type) => {
    const imageToDelete = images.find((img) => img.name === type)
    if (imageToDelete) {
      imageResource.deleteResource(imageToDelete)
      .then((response) => {
        getCatalogueImages()
      })
    }
    if (imagesToSave[type]) {
      const updateSaveImages = {...imagesToSave}
      delete updateSaveImages[type]
      setImagesToSave(updateSaveImages)
    }
  }

  const renderImageUpload = (title: string, type: ImageTypes) => {
    const image = images.find((img) => img.name === type) || {}
    const fileSrcFromImageResource = image['remote-urls'] && image['remote-urls']['admin_preview']?.normal
    const fileSrc = imagesToSave[type]?.preview || fileSrcFromImageResource || ''
    const filePath = imagesToSave[type]?.path || ''
    return (
      <FileUploader title={title}
        name={type}
        fileType="Image"
        fileSrc={fileSrc}
        filePath={filePath}
        deleteAllowed={true}
        onRemoveFile={() => {
          removeImage(type)
        }}
        onChange={(targetName, baseStr, file) => {
          let update = {
            ...image,
            preview: baseStr,
            file: file,
            path: file.name
          }
          setImagesToSave((imagesToSave) => ({
            ...imagesToSave,
            [targetName]: update
          }))
        }}
      />
    )
  }

  const renderErrors = () => {
    if (errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(errors).map((key, i) => {
            const error = errors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  const manageBanner = () => {
    const resourceType = 'catalogue'
    const imageName = 'banner'
    history.push(`/admin/${resourceType}/${catalogueId}/image-cropper/${imageName}/${VARIANT}`)
  }

  if (!images || !responsiveImages) {
    return (
      <main>
        <PageHeader title="Manage Images" />
        <div className="container">
          <div className="loader"></div>
        </div>
      </main>
    )
  } else {
    let previewPanelClasses = 'file-input__preview'
    let bannerPreviewImage
    const bannerImage =  responsiveImages.find((img) => img.name === 'catalogue-banner') || null
    if (bannerImage) {
      bannerPreviewImage = bannerImage['remote-urls']?.large?.cropped
      if (bannerPreviewImage) previewPanelClasses += ' file-input__preview--invisible'
    }
    const buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'
    const pageImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Custom Catalogue')

    let thumbnailTitle = `Thumbnail Image ${pageImageConfig.length > 0 ? `(${pageImageConfig[0].components.Thumbnail})` : ''}`

    return (
      <main>
        <PageHeader title={`Manage Images`}>
          <NavLink to={`/admin/${theme.localisation.catalogue.path}`} className="button" classesToPrefix={['button']} >
            <Icon
              id="i-admin-back"
              classes="button__icon"
            />
            {`Back to ${theme.localisation.catalogue.upper}`}
          </NavLink>
        </PageHeader>
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={saveImages}>
            <h3 className="cms-form__title">Banner Image</h3>
            <div className="file-input">
              {bannerPreviewImage && (
                <Button type="button" className="file-input__remove" onClick={e => {
                  removeResponsiveImage('catalogue-banner')
                }}>
                  <Icon id="i-close" />
                </Button>
              )}
              <div className={previewPanelClasses}>
                <img src={bannerPreviewImage} />
              </div>
              <Button
                type="button"
                className="button button--filled button--small"
                onClick={manageBanner}
              >
                Manage Banner
              </Button>
            </div>

            {renderImageUpload(thumbnailTitle, 'catalogue-thumbnail')}

            <div className="cms-form__control cms-form__control--actions">
              {renderErrors()}
              <NavLink to={`/admin/${theme.localisation.catalogue.path}`} className="button"  classesToPrefix={['button']}>
                Cancel
              </NavLink>
              <Button type="submit" className={buttonClasses}>
                Upload Image
              </Button>
            </div>
          </form>
        </div>
      </main>
    )
  }
}

export default CustomCataloguesImages
