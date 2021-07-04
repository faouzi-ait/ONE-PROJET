// React
import React, {useEffect, useState} from 'react'
import pluralize from 'pluralize'
import imageDimensions from 'javascript/config/image-dimensions'

import compose from 'javascript/utils/compose'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'

// Components
import Button from 'javascript/components/button'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import FileUploader from 'javascript/components/file-uploader'
import NavLink from 'javascript/components/nav-link'

// Store
import ImagesStore from 'javascript/stores/programme-images'

// Actions
import ImageActions from 'javascript/actions/programme-images'

const VARIANT = 'default'

const ProgrammeImages = (props) => {

  const renderImageUpload = (title, type) => (
    <FileUploader title={title}
      name={type}
      fileType="Image"
      fileSrc={props.resource[type] && props.resource[type].preview || (props.programme[type] && props.programme[type].admin_preview.url)}
      filePath={props.resource[type] && props.resource[type].path}
      onRemoveFile={() => {
        props.removeProgrammeImage(type)
      }}
      onChange={(targetName, baseStr, file) => {
        let update = {
          ...props.resource,
          [targetName]: {
            preview: baseStr,
            file: file,
            path: file.name
          },
        }
        props.setResource(update)
      }}
    />
  )

  const renderErrors = () => {
    if (props.errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(props.errors).map((key, i) => {
            const error = props.errors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  const manageBanner = () => {
    const resourceType = 'programmes'
    const imageName = 'banner'
    props.history.push(`/admin/${resourceType}/${props.programmeId}/image-cropper/${imageName}/${VARIANT}`)
  }

  if (!props.loaded || !props.programme) {
    return (
      <main>
        <PageHeader title="Manage Images" />
        <div className="container">
          <div className="loader"></div>
        </div>
      </main>
    )
  } else {
    const { programme, loading, theme } = props
    let previewPanelClasses = 'file-input__preview'
    let bannerPreviewImage
    if (programme['banner-urls'][VARIANT]?.large?.normal) {
      bannerPreviewImage = programme['banner-urls'][VARIANT].large.normal
      previewPanelClasses += ' file-input__preview--invisible'
    }
    const buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'
    const programmeImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Programme')
    let thumbnailTitle = `Thumbnail Image ${programmeImageConfig.length && `(${programmeImageConfig[0].components.Thumbnail})`}`
    let logoTitle = `${theme.localisation.programme.upper} Logo ${programmeImageConfig.length && `(${programmeImageConfig[0].components.Logo})`}`

    return (
      <main>
        <PageHeader title={`Manage Images for ${programme.title}`}>
          <NavLink to={`/admin/${theme.localisation.programme.path}`} className="button">
            <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
            Back to {pluralize(theme.localisation.programme.upper)}
          </NavLink>
        </PageHeader>
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={props.uploadProgrammeImage}>
            <h3 className="cms-form__title">Banner Image {programmeImageConfig.length && `(${programmeImageConfig[0].components.Banner})`}</h3>
            <div className="file-input">
              {bannerPreviewImage &&
                <Button type="button" className="file-input__remove" onClick={e => {
                  props.removeResponsiveImage('banner')
                }}>
                  <Icon id="i-close" />
                </Button>
              }
              <div className={previewPanelClasses}>
                <img src={ bannerPreviewImage } />
              </div>
              <Button type="button" className="button button--filled button--small" onClick={manageBanner}>Manage Banner</Button>
            </div>
            { renderImageUpload(thumbnailTitle, 'thumbnail') }
            {(theme.features.programmeOverview.logoTitle || theme.features.programmeOverview.logoTitleBanner) &&
              renderImageUpload(logoTitle, 'logo')
            }
            <div className="cms-form__control cms-form__control--actions">
              {renderErrors()}
              <NavLink to={`/admin/${theme.localisation.programme.path}`} className="button">Cancel</NavLink>
              <Button type="submit" className={buttonClasses}>Upload Images</Button>
            </div>
          </form>
        </div>
      </main>
    )
  }
}

const enhance = compose(
  withHooks((props) => {
    const programmeId = props.match.params.programme
    const [resource, setResource] = useState({
      thumbnail: {
        path: 'No file chosen'
      },
      logo: {
        path: 'No file chosen'
      }
    })
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(null)

    const programmeResource = useResource('programme')
    const responsiveImageResource = useResource('responsive-image')

    const programme = programmeResource.getDataById(programmeId)

    useEffect(() => {
      getResource()
      ImagesStore.on('imagesUploaded', redirect)
      ImagesStore.on('error', retrieveErrors)
      return () => {
        ImagesStore.removeListener('imagesUploaded', redirect)
        ImagesStore.removeListener('error', retrieveErrors)
      }
    }, [])

    const retrieveErrors = () => {
      setErrors(ImagesStore.getErrors())
      setLoading(false)
    }

    const redirect = () => {
      props.history.push(`/admin/${props.theme.localisation.programme.path}`)
    }

    const uploadProgrammeImage = (e) => {
      e.preventDefault()
      setLoading(true)
      const items = Object.keys(resource).filter((i) => { return resource[i].file })
      if (items.length > 0) {
        ImageActions.uploadImages(resource, programmeId)
      } else {
        redirect()
      }
    }

    const removeProgrammeImage = (type, confirmNeeded = false) => {
      if (confirmNeeded) {
        const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
        if (!confirmed) return
      }
      programmeResource.updateResource({
        'id': programmeId,
        [`remove-${type}`]: true
      })
      .then(getResource)

      setResource({
        ...resource,
        [type]: {
          path: 'No file chosen',
          value: ''
        }
      })
    }

    const removeResponsiveImage = (type) => {
      const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
      if (!confirmed) return
      const imageName = `programme-${type}`
      const responsiveImage = (programme['responsive-images'] || [])
        .filter((elem) => elem.name === imageName)
        .find((elem) => elem.variant === VARIANT)

      if (responsiveImage) {
        responsiveImageResource.deleteResource({
          'id': responsiveImage.id,
        })
        .then(getResource)
      }
    }

    const getResource = () => {
      programmeResource.findOne(programmeId, {
        include: 'responsive-images',
        fields: {
          programmes: 'title,banner-urls,thumbnail,logo,responsive-images',
          'responsive-images': 'variant,name'
        }
      })
      .then((response) => {
        setLoaded(true)
      })
    }

    return {
      ...props,
      errors,
      loaded,
      loading,
      programme,
      programmeId,
      removeProgrammeImage,
      removeResponsiveImage,
      resource,
      setResource,
      uploadProgrammeImage,
    }
  })
)

export default enhance(ProgrammeImages)