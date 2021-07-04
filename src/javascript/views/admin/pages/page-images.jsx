import React, {useEffect, useState} from 'react'
import imageDimensions from 'javascript/config/image-dimensions'

import { getPagesToPreventAddingThumbnailsTo } from 'javascript/utils/helper-functions/get-pages-to-prevent-adding-thumbnails-to'
import catalogueClientVariables from 'javascript/views/catalogue/variables'
import compose from 'javascript/utils/compose'
import pageClientVariables from 'javascript/views/pages/page/variables'
import useResource from 'javascript/utils/hooks/use-resource'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import useTheme from 'javascript/utils/theme/useTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'

import ImagesStore from 'javascript/stores/page-images'
import ImageActions from 'javascript/actions/page-images'

// Components
import Button from 'javascript/components/button'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import FileUploader from 'javascript/components/file-uploader'
import withTheme from 'javascript/utils/theme/withTheme'
import NavLink from 'javascript/components/nav-link'
import snakeToCamel from 'javascript/utils/helper-functions/snakeToCamel'

const PageImages = (props) => {

  const renderImageUpload = (title, type) => (
    <FileUploader title={title}
      name={type}
      fileType="Image"
      fileSrc={props.resource[type] && props.resource[type].preview || (props.page[type] && props.page[type].admin_preview.url)}
      filePath={props.resource[type] && props.resource[type].path}
      onRemoveFile={() => {
        props.removePageImage(type)
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
    const resourceType = 'pages'
    const imageName = 'banner'
    props.history.push(`/admin/${resourceType}/${props.pageId}/image-cropper/${imageName}/${props.bannerVariant}`)
  }

  const pagesToPreventAddingThumbnailsTo = getPagesToPreventAddingThumbnailsTo(props.theme)
  if (!props.loaded || !props.page) {
    return (
      <main>
        <PageHeader title="Manage Banner" />
        <div className="container">
          <div className="loader"></div>
        </div>
      </main>
    )
  } else {
    const { page, loading } = props
    let previewPanelClasses = 'file-input__preview'
    let bannerPreviewImage
    if (page['banner-urls'][props.bannerVariant]?.large?.normal) {
      bannerPreviewImage = page['banner-urls'][props.bannerVariant].large.normal
      previewPanelClasses += ' file-input__preview--invisible'
    }
    const buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'

    const catalogueImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Catalogue')
    const staticImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Static Page')
    let pageImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Page')
    if(page.slug === props.theme.localisation.catalogue.path && catalogueImageConfig.length){
      pageImageConfig = catalogueImageConfig
    } else if(props.systemPages.includesSlug(page?.slug) && staticImageConfig.length){
      pageImageConfig = staticImageConfig
    }

    const shouldHideThumbnailUploader = pagesToPreventAddingThumbnailsTo.includes(page.slug)

    let backPath = '/admin/pages'
    let backText = 'Back to pages'

    const sPg = props.systemPages.hasOwnCmsPath(page.slug)
    if (sPg) {
      backPath = `/admin/${sPg.localisation.path}`
      backText = `Back to ${sPg.localisation.lower}`
    }

    let thumbnailTitle = `Thumbnail Image ${pageImageConfig?.length && `(${pageImageConfig[0].components.Thumbnail})`}`
    return (
      <main>
        <PageHeader title={`Manage Images for ${page.title}`}>
          <NavLink to={backPath} className="button">
            <Icon
              width="8"
              height="13"
              id="i-admin-back"
              classes="button__icon"
            />
            {backText}
          </NavLink>
        </PageHeader>
        <div className="container">
          <form className="cms-form cms-form--large" onSubmit={props.uploadPageImage}>

            <h3 className="cms-form__title">Banner Image {pageImageConfig?.length && `(${pageImageConfig[0].components.Banner})`}</h3>
            <div className="file-input">
              {bannerPreviewImage && (
                <Button type="button" class="file-input__remove" onClick={e => {
                  props.removeResponsiveImage('banner')
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

            {!shouldHideThumbnailUploader && (
              <>{renderImageUpload(thumbnailTitle, 'thumbnail')}</>
            )}

            <div className="cms-form__control cms-form__control--actions">
              {renderErrors()}
              <NavLink to="/admin/pages" className="button">
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

const enhance = compose(
  withTheme,
  withClientVariables('catalogueCV', catalogueClientVariables),
  withClientVariables('pageCV', pageClientVariables),
  withHooks((props) => {
    const pageId = props.match.params.page
    const [resource, setResource] = useState({
      thumbnail: {
        path: 'No file chosen'
      }
    })
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(null)

    const pageResource = useResource('page')
    const responsiveImageResource = useResource('responsive-image')

    const page = pageResource.getDataById(pageId)

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
      props.history.push('/admin/pages')
    }

    const uploadPageImage = (e) => {
      e.preventDefault()
      setLoading(true)
      ImageActions.patchUploadImages(resource, pageId)
    }
    const { systemPages } = useSystemPages()
    const shouldDisplayCatalogueBannerVariant = page?.slug === props.theme.variables.SystemPages.catalogue.path
    const shouldDisplayStaticBannerVariant = systemPages.includesSlug(page?.slug)
    let bannerVariant = props.pageCV.bannerVariant
    if(shouldDisplayCatalogueBannerVariant) {
      bannerVariant = props.catalogueCV.bannerVariant
    } else if(shouldDisplayStaticBannerVariant) {
      bannerVariant = props.pageCV.staticBannerVariant(page?.slug)
    }

    const removeResponsiveImage = (type) => {
      const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
      if (!confirmed) return
      const imageName = `page-${type}`
      const responsiveImage = (page['responsive-images'] || [])
        .filter((elem) => elem.name === imageName)
        .find((elem) => elem.variant === bannerVariant)

      if (responsiveImage) {
        responsiveImageResource.deleteResource({
          'id': responsiveImage.id,
        })
        .then(getResource)
      }
    }

    const removePageImage = (type) => {
      pageResource.updateResource({
        id: pageId,
        [`remove-${type}`]: true
      }).then(getResource)
    }

    const getResource = () => {
      pageResource.findOne(pageId, {
        include: 'responsive-images',
        fields: {
          pages: 'title,slug,banner-urls,thumbnail,responsive-images',
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
      page,
      pageId,
      removePageImage,
      removeResponsiveImage,
      resource,
      setResource,
      uploadPageImage,
      bannerVariant,
      systemPages,
    }
  })
)

export default enhance(PageImages)