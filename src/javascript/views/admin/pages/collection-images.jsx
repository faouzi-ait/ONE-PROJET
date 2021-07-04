import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'
import imageDimensions from 'javascript/config/image-dimensions'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'

let VARIANT = 'default'


const CollectionImages = (props) => {

  const { collection, loaded } = props

  const manageBanner = () => {
    const resourceType = 'collections'
    const imageName = 'banner'
    props.history.push(`/admin/${resourceType}/${props.collectionId}/image-cropper/${imageName}/${VARIANT}`)
  }

  if(!loaded || !collection) {
    return (
      <main>
        <PageHeader title="Manage Banner" />
        <div className="container">
          <div className="loader"></div>
        </div>
      </main>
    )
  } else {
    let previewPanelClasses = 'file-input__preview'
    let bannerPreviewImage
    if (collection['banner-urls'][VARIANT]?.large?.normal) {
      bannerPreviewImage = collection['banner-urls'][VARIANT].large.normal
      previewPanelClasses += ' file-input__preview--invisible'
    }
    const pageImageConfig = imageDimensions.dimensions.filter(({name}) => name === 'Page')
    return (
      <main>
        <PageHeader title={ `Manage Images for ${collection.title}` }>
          <NavLink to={ '/admin/pages' } className="button">
            <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
            Back to pages
          </NavLink>
        </PageHeader>
        <div className="container">
          <form className="cms-form cms-form--large">
            <h3 className="cms-form__title">Banner Image {pageImageConfig.length && `(${pageImageConfig[0].components.Banner})`}</h3>
            <div className="file-input">
              {bannerPreviewImage &&
                <Button type="button" className="file-input__remove" onClick={e => {
                  props.removeResponsiveImage('banner')
                }}>
                  <Icon id="i-close" />
                </Button>
              }
              <div className={previewPanelClasses}>
                <img src={bannerPreviewImage} />
              </div>
              <Button type="button" className="button button--filled button--small" onClick={manageBanner}>Manage Banner</Button>
            </div>
          </form>
        </div>
      </main>
    )
  }
}

const enhance = compose(
  withHooks((props) => {
    const collectionId = props.match.params.collection
    const [loaded, setLoaded] = useState(false)

    const collectionResource = useResource('collection')
    const responsiveImageResource = useResource('responsive-image')

    const collection = collectionResource.getDataById(collectionId)

    useEffect(() => {
      getResource()
    }, [])

    const removeResponsiveImage = (type) => {
      const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
      if (!confirmed) return
      const imageName = `collection-${type}`
      const responsiveImage = (collection['responsive-images'] || [])
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
      collectionResource.findOne(collectionId, {
        include: 'responsive-images',
        fields: {
          collections: 'title,banner-urls,responsive-images',
          'responsive-images': 'variant,name'
        }
      })
      .then((response) => {
        setLoaded(true)
      })
    }

    return {
      ...props,
      collection,
      collectionId,
      loaded,
      removeResponsiveImage,
    }
  })
)

export default enhance(CollectionImages)