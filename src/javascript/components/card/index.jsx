import React from 'react'
import NavLink from 'javascript/components/nav-link'
import moment from 'moment'

/* #region  cineflix */
import 'stylesheets/core/generic/tag'
/* #endregion */
import 'stylesheets/core/components/card'

import cardClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import { getResponsiveBannerImage } from 'javascript/components/banner'

import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'
import LikeActionIndicator from 'javascript/views/meetings/list-notes/LikeActionIndicator'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

class Card extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'card'
    this.imageSizes = {
      small: {
        x: props.cardCV.smallImageX,
        y: props.cardCV.smallImageY,
      },
      medium: {
        x: props.cardCV.mediumImageX,
        y: props.cardCV.mediumImageY,
      },
      large: {
        x: props.cardCV.largeImageX,
        y: props.cardCV.largeImageY,
      },
      tall: {
        x: props.cardCV.tallImageX,
        y: props.cardCV.tallImageY,
      },
      productionCompany: {
        x: props.cardCV.productionCompanyImageX,
        y: props.cardCV.productionCompanyImageY,
      },
      people: {
        x: props.cardCV.peopleImageX,
        y: props.cardCV.peopleImageY,
      },
      poster: {
        x: props.cardCV.posterImageX,
        y: props.cardCV.posterImageY,
      },
      posterLarge: {
        x: props.cardCV.posterLargeImageX,
        y: props.cardCV.posterLargeImageY,
      },
    }
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  parseExternalUrl = (url = '') => {
    const isExternal = (pathname = '') => {
      return pathname.includes('http://') || pathname.includes('https://')
    }

    if (typeof url === 'object') {
      return isExternal(url.pathname)
    }

    return isExternal(url)
  }

  renderDraggableIcon = () => {
    return <Icon id="i-move" classes="card__move-icon" />
  }

  renderCustomIcon = () => {
    return <Icon id={`i-${this.props.icon}`} width="20" height="22" classes="card__display-icon" />
  }

  renderImage = () => {
    const { cardCV, image, url, theme } = this.props
    const urlIsExternal = this.parseExternalUrl(url)
    const size = this.props.size || 'small'

    const placeholderSize = theme.variables.Placeholders[size] || theme.variables.Placeholders.small
    const ProgrammePlaceholder = placeholderSize.nonRetina
    const ProgrammePlaceholderRetina = placeholderSize.retina
    let responsiveImage = null


    if (image) {
      const programmeIconClasses = ['programme__icon', this.props.iconCentered && 'programme__icon--centered'].filter(Boolean).join(' ')
      return (
        <>
          { this.props.draggable && !this.props.iconsOutside &&
            this.renderDraggableIcon()
          }

          {/* Image is an object so needs to render as a responsive picture element */}
          {image?.default ? (
            getResponsiveBannerImage(image, 'card__media')
          ) : (
            image.src ? (
              <img srcSet={`${image.src.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image.src.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt={image.alt} className={cardCV.cardMediaImageClasses} draggable="false" />
            ) : (
              <>
                {theme.features.lite ? (
                  <img src={theme.customer.programmeThumbnailPlaceholderImageUrls.default || ProgrammePlaceholderRetina} className="card__media" />
                ) : (
                  <img srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className={cardCV.cardMediaImagePlaceholderClasses(this.props.video)} draggable="false"  />
                )}
              </>
            )
          )}

          { this.props.video &&
            <span className={programmeIconClasses}></span>
          }
          { this.props.icon && !this.props.iconsOutside &&
            this.renderCustomIcon()
          }
        </>
      )
    }
  }

  mapImages = images => {
    let {theme, size} = this.props
    if (!size) {
      size = 'small'
    }
    const placeholderSize = theme.variables.Placeholders[size] || theme.variables.Placeholders.small
    const ProgrammePlaceholder = placeholderSize.nonRetina
    const ProgrammePlaceholderRetina = placeholderSize.retina

    if (images.length > 0 && images.length < 4) {
      return images.map((image, i) => {
        if (image) {
          return (<img key={`img_${i}`} srcSet={`${image.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt="" className="card__media" draggable="false" />)
        } else {
          if(theme.features.lite) {
            return (<img src={theme.customer.programmeThumbnailPlaceholderImageUrls.default} className="card__media" />)
          }
          return (<img key={`img_${i}`} srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="card__media" draggable="false" />)
        }
      })
    } else if (images.length === 4) {
      return images.map((image, i) => {
        return (<img key={`img_${i}`} srcSet={`${image.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt="" className="card__media" draggable="false" />)
      })
    } else {
      if(theme.features.lite) {
        return (<img src={theme.customer.programmeThumbnailPlaceholderImageUrls.default} className="card__media" />)
      }
      return [(<img key={'placeHolder'} srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="card__media" />)]
    }
  }

  renderImages = () => {
    const { images, url } = this.props
    const urlIsExternal = this.parseExternalUrl(url)
    if (images) {
      return (
        <>
          {this.props.draggable &&
            this.renderDraggableIcon()
          }
          {this.mapImages(images)}
        </>
      )
    }
  }

  renderLogo = (key) => {
    const { logo, title } = this.props
    if (logo && logo.url) {
      return (
        <img key={key}
        srcSet={`${logo.url.replace('.net/', `.net/140xnull/`)}, ${logo.url.replace('.net/', `.net/280xnull/`)} 2x`}
        alt={`${title} logo`}
        className="card__logo" />
      )
    }
  }

  renderTitle = (key) => {
    const { cardCV, title, url, logo } = this.props
    if (cardCV.titleLogo && logo && logo.url) {
      this.renderLogo()
    }
    const urlIsExternal = this.parseExternalUrl(url)
    if (title) {
      return (
        <ClientChoice>
          <ClientSpecific client="default">
            <h3 key={key} className="card__title">{title}</h3>
          </ClientSpecific>
          <ClientSpecific client="amc | endeavor | cineflix">
            { url ? (
                <h3 key={key} className="card__title">
                  {urlIsExternal ? (
                    <a href={url} target="_blank" draggable="false">{title}</a>
                  ) : (
                      <NavLink to={url} draggable="false">{title}</NavLink>
                    )}
                </h3>
              ) : (
                <h3 key={key} className="card__title"><span>{title}</span></h3>
            )}
          </ClientSpecific>
        </ClientChoice>
      )
    }
  }

  renderIntroTitle = () => {
    const { introTitle, url, logo } = this.props
    if (logo && logo.url) {
      return (
        <div className="card__logo-wrapper">
          <img srcSet={`${logo.url.replace('.net/', `.net/140xnull/`)}, ${logo.url.replace('.net/', `.net/280xnull/`)} 2x`} alt={`${introTitle} logo`} className="card__logo" />
        </div>
      )
    }
    if (introTitle) {
      return <h3 className="card__title-over">{introTitle}</h3>
    }
  }

  renderIntro = () => {
    const { intro } = this.props
    if (intro) {
      return (
        <>
          <ClientSpecific client="drg">
            <div className="card__description">
              <div className="card__copy" dangerouslySetInnerHTML={{ __html: intro }}></div>
            </div >
          </ClientSpecific>
          <ClientSpecific client="endeavor | cineflix | fremantle">
            <div dangerouslySetInnerHTML={{ __html: intro }}></div>
          </ClientSpecific>
        </>
      )
    }
  }

  renderDescription = (key) => {
    const { description } = this.props
    if (description) {
      return (
        <ClientChoice>
          <ClientSpecific client="default">
            <div key={key} className="card__copy" dangerouslySetInnerHTML={{ __html: description }}></div>
          </ClientSpecific>
          <ClientSpecific client="drg">
            <div key={key} className="card__description">
              <div className="card__copy" dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
          </ClientSpecific>
        </ClientChoice>
      )
    }
  }

  putParentsFirst(genres) {
    const parentGenres = []
    const childGenres = []
    genres.filter(({ name }) => name).forEach((genre, i) => {
      if (genre['parent-id']) {
        childGenres.push(genre)
      } else {
        parentGenres.push(genre)
      }
    });
    return [
      ...parentGenres.sort((a, b) => a?.name?.localeCompare(b?.name)),
      ...childGenres.sort((a, b) => a?.name?.localeCompare(b?.name)),
    ]
  }

  renderTags = (key) => {
    let { cardCV, tags } = this.props
    if (tags && tags.filter(c => c.name).length) {
      if (cardCV.tagsPutParentFirst) {
        tags = this.putParentsFirst(tags)
      }
      return (
        <div key={key} className="card__tags">
          {tags.filter(c => c.name).map(t => (<span key={t.id} className={cardCV.tagClasses(t)}>{t.name}</span>))}
        </div>
      )
    }
  }

  renderSubTitle = (key) => {
    if(this.props.subTitle) {
      return <span class="card__sub-title" key={key}>{this.props.subTitle}</span>
    }
  }

  renderAMCContent = () => {
    return (
      <>
        <div className="card__head">
          {!this.props.childrenAfter &&
            this.props.children
          }
          {this.renderSubTitle(`${this.props.cardId}_sub-title`)}
          <div className="card__title-wrap">
            {this.renderTitle(`${this.props.cardId}_title`)}
          </div>
        </div>
        {this.props.tagsAlwaysVisible && this.renderTags()}
      </>
    )
  }

  renderDate = (key) => {
    if (!this.props.date) return null
    return <div key={key} className="card__date">{moment(this.props.date).utc().format(this.props.theme.features.formats.longDate)}</div>
  }

  renderLabel = (key) => {
    if (!this.props.label) return null
    return <div key={key} className="card__date">{this.props.label}</div>
  }

  renderChildren = (key) => {
    return <div key={key}> {this.props.children} </div>
  }

  orderContent() {
    const { cardId, cardCV } = this.props
    const renderContent = {
      'title': this.renderTitle,
      'tags': this.renderTags,
      'date': this.renderDate,
      'description': this.renderDescription,
      'children': this.renderChildren,
      'label': this.renderLabel,
      'subTitle': this.renderSubTitle
    }
    return cardCV.contentOrder.map((key) => renderContent[key](`${cardId}_${key}`))
  }

  image() {
    return (
      <>
        { this.renderImages() }
        { this.props.video ? (
          <div className="card__video-image">
            { this.renderImage() }
          </div>
          ) : this.renderImage()
        }
        <ClientSpecific client="drg">
          { this.renderIntro() }
        </ClientSpecific>
        <ClientSpecific client="amc">
          { this.props.date &&
            <div className="card__date">{moment(this.props.date).format(this.props.theme.features.formats.longDate)}</div>
          }
        </ClientSpecific>
        <ClientSpecific client="endeavor | cineflix | fremantle">
          { this.renderIntroTitle() }
          { this.props.intro &&
            <div className="card__hover">
              {this.renderIntro()}
            </div>
          }
        </ClientSpecific>
      </>
    )
  }

  render() {
    const { cardCV, url, draggable, onDragStart, onDragEnd, onDragOver, onDrop, onClick, withScreenerIcon } = this.props
    const dragProps = draggable ? { draggable, onDragStart, onDragEnd, onDragOver, onDrop } : {}
    const cardLinkProps = {
      url,
      urlIsExternal: this.parseExternalUrl(url),
      linkState: this.props.linkState
    }
    return (
      <div className={this.state.classes} {...dragProps} onClick={onClick} >
        <ClientChoice>
          <ClientSpecific client="default">
            <CardLinkElement {...cardLinkProps} >
              {this.image()}
            </CardLinkElement>
          </ClientSpecific>
          <ClientSpecific client="amc">
            <CardLinkElement {...cardLinkProps} >
              <div className="card__top">{this.image()}</div>
            </CardLinkElement>
          </ClientSpecific>
          <ClientSpecific client="drg">
            <div className="card__top">
              <CardLinkElement {...cardLinkProps} >
                {this.image()}
              </CardLinkElement>
            </div>
          </ClientSpecific>
          <ClientSpecific client="endeavor | cineflix">
            <div className="card__over">
              <CardLinkElement {...cardLinkProps} >
                {this.image()}
              </CardLinkElement>
            </div>
          </ClientSpecific>
        </ClientChoice>
        <ClientSpecific client="discovery">
          {this.renderLogo()}
        </ClientSpecific>
        <div className="card__content">
          {withScreenerIcon && (
            <LikeActionIndicator action="screener" style={{ right: '10px', top: '-15px' }} />
          )}
          { url &&
            <CardLinkElement {...cardLinkProps} linkClasses={'card__link'} ></CardLinkElement>
          }
          <ClientChoice>
            <ClientSpecific client="default">
              {this.orderContent()}
              {cardCV.renderChildren && this.props.children}
            </ClientSpecific>
            <ClientSpecific client="amc">
              {this.renderAMCContent()}
              {this.props.childrenAfter &&
                this.props.children
              }
            </ClientSpecific>
          </ClientChoice>
        </div>
        <ClientSpecific client="amc">
          {this.renderDescription()}
        </ClientSpecific>
      </div>
    )
  }
}
const enhance = compose(
  withTheme,
  withClientVariables('cardCV', cardClientVariables)
)

export default enhance(Card)


const CardLinkElement = ({
  url,
  urlIsExternal,
  children,
  linkClasses = 'card__media-link',
  linkState
}) => {
  const splitByQuery = url?.split('?')
  if (url) {
    if (urlIsExternal) {
      return <a href={url} draggable="false" target="_blank" className={linkClasses}>{children}</a>
    } else {
      return (
        <NavLink draggable="false" className={linkClasses}
          to={{
            pathname: splitByQuery.length > 0 ? splitByQuery[0] : url,
            search: splitByQuery.length > 0 ? splitByQuery[1] : '',
            ...(linkState && { state: linkState }),
          }}
        >
          {children}
        </NavLink>
      )
    }
  } else {
    return <div className="card__media-link">{children}</div>
  }
}