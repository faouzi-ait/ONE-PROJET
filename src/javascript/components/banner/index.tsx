import React, { useEffect, useState } from 'react'

import { imageDimensions } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

// @ts-ignore
import DefaultBanner from 'images/theme/banner-default.jpg'
import HelperComponent from 'javascript/components/helper'
import BannerVideo from 'javascript/components/banner-video'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'

import { VideoType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import 'stylesheets/core/components/banner'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'

interface Props {
  breakpoints: any;
  copy: string;
  tags?: string[];
  image: string;
  imageConfigVersion?: string
  label?: string;
  logo: string | { url: string };
  programme: () => any;
  restricted?: boolean
  shouldShowVideo?: boolean
  static?: boolean;
  textColor: string;
  theme: CustomThemeType
  title: string;
  video?: VideoType;
  clientVariables: any;
  subTitle: string;
  variant?: string;
  placeholder? :string
  clickable?: string
}

const defaultBreakpoints = {
  small: 568,
  medium: 768,
  large: 1024
}

const renderImage = (imageSrc, breakpoints, imageClasses, variant = 'default') => {
  // all images are saved as variant = 'default' (this happened when migrating banner images to responsive-images)

  const makeRetinaUrlsIfAvailable = (urlSource) => {
    if (typeof urlSource === 'object' && urlSource.normal && urlSource.retina) {
      return `${urlSource.normal} 1x, ${urlSource.retina} 2x`
    }
    return `${urlSource} 1x`
  }

  const smallImageSrc = typeof imageSrc === 'string' ? imageSrc : (imageSrc?.[variant] || {}).small
  const mediumImageSrc = typeof imageSrc === 'string' ? imageSrc : (imageSrc?.[variant] || {}).medium
  const largeImageSrc = typeof imageSrc === 'string' ? imageSrc : (imageSrc?.[variant] || {}).large
  const xlargeImageSrc = typeof imageSrc === 'string' ? imageSrc : (imageSrc?.[variant] || {}).xlarge

  return (
    <picture>
      <source srcSet={makeRetinaUrlsIfAvailable(smallImageSrc)} media={`(max-width: ${breakpoints.small + 1}px)`} />
      <source srcSet={makeRetinaUrlsIfAvailable(mediumImageSrc)} media={`(max-width: ${breakpoints.medium + 1}px)`} />
      <source srcSet={makeRetinaUrlsIfAvailable(largeImageSrc)} media={`(max-width: ${breakpoints.large + 1}px)`} />
      <img srcSet={makeRetinaUrlsIfAvailable(xlargeImageSrc)} alt="" className={imageClasses} />
    </picture>
  )
}

const useBreakpoints = (props) => {
  const [breakpoints, setBreakpoints] = useState(defaultBreakpoints)

  const imageConfigResource = useResource('image-configuration')
  useEffect(() => {
    if (props.imageConfigVersion) {
      imageConfigResource.findAll({
        fields: {
          'image-configuration': 'version,variant,small,medium,large,xlarge'
        },
        filter: {
          version: props.imageConfigVersion
        }
      })
      .then((response) => {
        setBreakpoints({
          'small': imageDimensions.parse(response[0].small).width,
          'medium': imageDimensions.parse(response[0].medium).width,
          'large': imageDimensions.parse(response[0].large).width
        })
      })
    }
  }, [])

  return {
    breakpoints
  }
}

class Banner extends HelperComponent<Props, any> {
  constructor(props) {
    super(props)
    this.resourceName = 'banner'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    const {
      title,
      copy,
      label,
      image,
      tags,
      programme,
      logo,
      restricted,
      video,
      shouldShowVideo,
      clientVariables,
      textColor,
      theme,
      subTitle,
      variant,
      placeholder,
      clickable
    } = this.props

    const { breakpoints } = this.props
    let {classes} = this.state
    const fallbackBanner = theme.features.lite && theme.customer.programmeBannerPlaceholderImageUrls.default ? {default: theme.customer.programmeBannerPlaceholderImageUrls.default}: (placeholder || DefaultBanner)
    const shouldUseFallbackBanner = image === NO_CUSTOM_BANNER
    let imageSrc = shouldUseFallbackBanner ? fallbackBanner : image
    const bannerClasses = classes += shouldUseFallbackBanner ? ' banner--fallback': ''
    const textStyle: { color?: string } = {}

    if (textColor) {
      textStyle.color = textColor
    }

    let logoSrc
    if (logo) {
      if (typeof logo === 'string') {
        logoSrc = logo
      } else if (logo.url) {
        logoSrc = logo.url
      }
    }

    const renderBannerDetails = () => (
      <>
        <ClientSpecific client="drg">
            <div className="banner__circle">
              <div className="container"></div>
            </div>
          </ClientSpecific>
          <div className="container">
            <div className="banner__content">

              <ClientSpecific client="amc">
                {title &&
                  <>
                    <div className="banner__wrap-title">
                      <h1 className="banner__title" style={textStyle}>
                        {title}
                      </h1>
                    </div>
                  </>
                }
              </ClientSpecific>

              {(tags?.length > 0 || restricted) && (
                <div className="tags banner__tags">
                  {tags?.map((g, index) => {
                    return <span key={`genre-${index}`} className={`banner__tag tag tag--${g.toLowerCase()}`} style={textStyle}>{g.replace(/_/g, ' ')}</span>
                  })}

                  {restricted &&
                    <span className="tag tag--unregistered">{theme.localisation.restricted.upper}</span>
                  }
                </div>
              )}

              <ClientChoice>
                <ClientSpecific client="default">
                  {logoSrc &&
                    <>
                      <h1 className="sr-only" style={textStyle}>{title}</h1>
                      <img srcSet={logoSrc} alt={`${title} logo`} className="banner__logo" />
                    </>
                  }
                  {(!logoSrc) && title &&
                    <h1 className="banner__title" style={textStyle}>{title}</h1>
                  }
                  {subTitle &&
                    <h2 className="banner__sub-title" style={textStyle}>{subTitle}</h2>
                  }
                  {copy &&
                    <p className="banner__copy" style={textStyle} dangerouslySetInnerHTML={{__html: copy}}></p>
                  }
                  {this.props.children}
                </ClientSpecific>
                <ClientSpecific client="amc">
                  {copy &&
                    <div className="banner__wrap-copy"><p className="banner__copy" style={textStyle} dangerouslySetInnerHTML={{__html: copy}}></p></div>
                  }
                  { this.props.children &&
                    <div className="banner__actions">{ this.props.children }</div>
                  }
                </ClientSpecific>
              </ClientChoice>
            </div>
          </div>
          {label &&
            <span className="banner__label" style={textStyle}>{label}</span>
          }
          {clientVariables.programmeComponent && programme &&
            <div className="banner__programme">
              {programme()}
            </div>
          }
          <div className="banner__image">
            {(video && !video['wistia-id'] && imageSrc) ? (
              <BannerVideo
                video={video}
                image={renderImage(imageSrc, breakpoints, 'banner__media', variant)}
                isOnScreen={shouldShowVideo}
                shouldUseLargeMuteButton
              />
            ) : (
              <>
                {this.props.static ?
                  renderImage(imageSrc, breakpoints, 'banner__media', variant)
                  : (
                    <div>
                      {renderImage(imageSrc, breakpoints, 'banner__media', variant)}
                    </div>
                  )
                }
              </>
            )}
          </div>
      </>
    )

    if (theme.features.lite && (!imageSrc || imageSrc === 'liteBanner')) {
      return (
        <h1 className="page__title">{title}</h1>
      )
    }

    return (
      <div className="banner__iefix">
        {clickable ? (
          <a href={clickable} className={bannerClasses}>
            {renderBannerDetails()}
          </a>
        ) : (
          <div className={bannerClasses}>
            {renderBannerDetails()}
          </div>
        )}
      </div>
    )
  }

}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables),
  withHooks(useBreakpoints)
)

export default enhance(Banner)

export const getResponsiveBannerImage = (image, classes) => {
  return renderImage(image, defaultBreakpoints, classes)
}


export const getBannerImageUrls = (resource) => {
  const bannerImageUrls = resource?.['banner-urls']
  if (bannerImageUrls) {
    return Object.keys(bannerImageUrls).length ? bannerImageUrls : NO_CUSTOM_BANNER
  }
}