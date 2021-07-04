import React from 'react'
import NavLink from 'javascript/components/nav-link'
import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'
import 'stylesheets/admin/components/card'
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'
import ProgrammePlaceholderRetina from 'images/theme/programme-placeholder-retina.jpg'

import moment from 'moment'
import styled, { css } from 'styled-components'
import LikeActionIndicator from 'javascript/views/meetings/list-notes/LikeActionIndicator'

export default class Card extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'admin-card'
    this.imageSizes = {
      quarter: {
        x: 140,
        y: 87
      },
      small: {
        x: 280,
        y: 175
      },
      medium: {
        x: 560,
        y: 350
      },
      large: {
        x: 840,
        y: 525
      }
    }
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  renderImage = () => {
    const { image, url } = this.props
    let size = this.props.size
    if (!size) {
      size = 'small'
    }
    if (image && image.src) {
      if (url) {
        return (
          <NavLink to={url} draggable="false" className="admin-card__media-link">
            {this.props.draggable &&
              <Icon id="i-move" width="41" height="41" classes="card__move-icon" />
            }
            <img srcSet={`${image.src.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image.src.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt={image.alt} className="admin-card__media" draggable="false" />
            {this.props.video &&
              <span class="programme__icon"></span>
            }
            {this.props.icon &&
              <Icon id={`i-${this.props.icon}`} width="20" height="22" classes="card__display-icon" />
            }
          </NavLink>
        )
      } else {
        return (
          <img srcSet={`${image.src.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image.src.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt={image.alt} className="admin-card__media" />
        )
      }
    } else if (image) {
      if (url) {
        return (
          <NavLink to={url} draggable="false" className="admin-card__media-link">
            {this.props.draggable &&
              <Icon id="i-move" width="41" height="41" classes="card__move-icon" />
            }
            <img srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="admin-card__media" draggable="false" />
            {this.props.video &&
              <span class="programme__icon"></span>
            }
            {this.props.icon &&
              <Icon id={`i-${this.props.icon}`} width="20" height="22" classes="card__display-icon" />
            }
          </NavLink>
        )
      } else {
        return (
          <img srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="admin-card__media" />
        )
      }
    }
  }

  mapImages = images => {
    let size = this.props.size
    if (!size) {
      size = 'small'
    }
    if (images.length > 0 && images.length < 4) {
      return images.map((image, i) => {
        if (image) {
          return (<img key={i} srcSet={`${image?.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes[size].y}/`)}, ${image?.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt={image?.alt} className="admin-card__media" draggable="false" />)

        } else {
          return (<img key={i} srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="admin-card__media" draggable="false" />)
        }
      })
    } else if (images.length === 4) {
      size = 'quarter'
      return images.map((image, i) => {
        if(image) {
          return (<img key={i} srcSet={`${image?.replace('.net/', `.net/${this.imageSizes[size].x}x${this.imageSizes['quarter'].y}/`)}, ${image?.replace('.net/', `.net/${this.imageSizes[size].x * 2}x${this.imageSizes[size].y * 2}/`)} 2x`} alt={image?.alt} className="admin-card__media" draggable="false" />)
        } else {
          return (<img key={i} srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="admin-card__media" draggable="false" />)
        }
      })
    } else {
      return (<img srcSet={`${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x`} alt="" className="admin-card__media" />)
    }
  }

  renderImages = () => {
    const { images, url, withScreenerIcon } = this.props
    if (images) {
      if (url) {
        return (
          <NavLink to={url} draggable="false" className="admin-card__media-link">
            {this.props.draggable &&
              <Icon id="i-move" width="41" height="41" classes="card__move-icon" />
            }
            {this.mapImages(images)}
            {withScreenerIcon && (
              <LikeActionIndicator action="screener" style={{ right: '10px', bottom: '-15px' }} />
            )}
          </NavLink>
        )
      } else {
        return (
          <div className="admin-card__media-link">
            {this.mapImages(images)}
            {withScreenerIcon && (
              <LikeActionIndicator action="screener" style={{ right: '10px', bottom: '-15px' }} />
            )}
          </div>
        )
      }
    }
  }

  renderTitle = () => {
    const { title, url } = this.props
    if (title) {
      if (url) {
        return (
          <h3 className="admin-card__title"><NavLink to={url} draggable="false">{title}</NavLink></h3>
        )
      } else {
        return (
          <h3 className="admin-card__title">{title}</h3>
        )
      }
    }
  }

  renderDescription = () => {
    const { description } = this.props
    if (description) {
      return (
        <div className="admin-card__copy" dangerouslySetInnerHTML={{ __html: description }}></div>
      )
    }
  }

  renderTags = () => {
    const { tags } = this.props
    if (tags) {
      return (
        <div className="admin-card__tags">
          {tags.map(t => (<span className="admin-card__tag" key={t.id}>{t.name}</span>))}
        </div>
      )
    }
  }

  render() {
    return (
      <Wrapper className={this.state.classes} {...this.props}>
        {this.renderImages()}
        {this.props.video ? (
          <div className="admin-card__video-image">
            {this.renderImage()}
          </div>
        ) : this.renderImage()}
        <div className="admin-card__content">
          {this.renderTitle()}
          {this.props.date &&
            <date className="admin-card__date">{moment(this.props.date).format('ddd, Do MMM YYYY')}</date>
          }
          {this.renderTags()}
          {this.renderDescription()}
          {this.props.children}
        </div>
      </Wrapper>
    )
  }

}

const Wrapper = styled.div`
  ${props => props.useShadow && css`
    box-shadow: 0px 2px 4px rgba(0,0,0,0.18)
  `}
`