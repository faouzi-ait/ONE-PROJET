import React, {useEffect, useState} from 'react'

import useResource from 'javascript/utils/hooks/use-resource'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import { RouteComponentProps } from 'react-router-dom'
import { WithThemeType } from 'javascript/utils/theme/withTheme'

let VARIANT = 'default'

interface MatchParams {
  highlightPageId: string
}

interface Props extends RouteComponentProps<MatchParams>, WithThemeType {}

const ProgrammeHighlightPagesImages: React.FC<Props> = ({
  history,
  match,
  theme,
}) => {
  const { highlightPageId } = match.params
  const responsiveImageResource = useResource('responsive-image')
  const [responsiveImages, setResponsiveImages] = useState(null)

  const highlightPageRelation = {
    id: highlightPageId,
    name: 'programme-highlight-page'
  }

  useEffect(() => {
    getHighlightPageResponsiveImages()
  }, [])


  const getHighlightPageResponsiveImages = () => {
    responsiveImageResource.findAllFromOneRelation(highlightPageRelation, {
      fields: {
        'responsive-images': 'name,remote-urls'
      },
      filter: {
        'variant': 'default'
      }
    }).then((response) => {
      console.log('getHighlightPageResponsiveImages -> response', response)
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
      .then(getHighlightPageResponsiveImages)
    }
  }

  const manageBanner = () => {
    const resourceType = 'programme-highlight-page'
    const imageName = 'banner'
    history.push(`/admin/${resourceType}/${highlightPageId}/image-cropper/${imageName}/${VARIANT}`)
  }

  if (!responsiveImages) {
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
    const bannerImage =  responsiveImages.find((img) => img.name === 'programme-highlight-page-banner') || null
    if (bannerImage) {
      bannerPreviewImage = bannerImage['remote-urls']?.xlarge?.cropped
      if (bannerPreviewImage) previewPanelClasses += ' file-input__preview--invisible'
    }
    return (
      <main>
        <PageHeader title={`Manage Images`}>
          <NavLink to={'/admin/highlight-pages'} className="button" classesToPrefix={['button']} >
            <Icon
              id="i-admin-back"
              classes="button__icon"
            />
            {`Back to Highlight Pages`}
          </NavLink>
        </PageHeader>
        <div className="container">
          <form className="cms-form cms-form--large" >
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

            <div className="cms-form__control cms-form__control--actions">
              <NavLink to={`/admin/highlight-pages`} className="button"  classesToPrefix={['button']}>
                Cancel
              </NavLink>
            </div>
          </form>
        </div>
      </main>
    )
  }
}

export default ProgrammeHighlightPagesImages
