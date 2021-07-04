import React from 'react'
import NavLink from 'javascript/components/nav-link'

import Icon from 'javascript/components/icon'

import programmeClientVariables from './variables'
import cardClientVariables from 'javascript/components/card/variables'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

import 'stylesheets/core/components/programme'

class Programme extends React.Component {

  renderPoster = () => {
    const {theme, cardCV, programmeCV} = this.props

    const imageSizes = {
      x: cardCV[`${programmeCV.cardImageSize(this.props.video)}ImageX`],
      y: cardCV[`${programmeCV.cardImageSize(this.props.video)}ImageY`],
    }

    const placeholderSize = theme.variables.Placeholders[programmeCV.cardImageSize(this.props.video)] || theme.variables.Placeholders.small
    const ProgrammePlaceholder = placeholderSize.nonRetina
    const ProgrammePlaceholderRetina = placeholderSize.retina

    if (this.props.provider) {
      if (this.props.poster) {
        return <img src={ this.props.poster || theme.variables.Placeholder.small.nonRetina } alt="" />
      } else {
        if(theme.features.lite) {
          return (<img src={theme.customer.programmeThumbnailPlaceholderImageUrls.default} className="programme__placeholder" />)
        }
        return <img srcSet={ `${theme.variables.Placeholders.small.nonRetina}, ${theme.variables.Placeholders.small.retina} 2x` } alt="" className="programme__placeholder" />
      }
    } else {
      if (this.props.poster) {
        return <img srcSet={ `${this.props.poster.replace('.net/', `.net/${imageSizes.x}x${imageSizes.y}/`)}, ${this.props.poster.replace('.net/', `.net/${imageSizes.x * 2}x${imageSizes.y * 2}/`)} 2x` } alt="" />
      } else {
        if(theme.features.lite) {
          return (<img src={theme.customer.programmeThumbnailPlaceholderImageUrls.default} className="programme__placeholder" />)
        }
        return <img srcSet={ `${ProgrammePlaceholder}, ${ProgrammePlaceholderRetina} 2x` } alt="" className="programme__placeholder" />
      }
    }
  }
  render() {
    const { onClick, href, theme, centreIcon, programmeCV, ...props } = this.props
    const programmeIconClasses = ['programme__icon',  this.props.iconCentered && 'programme__icon--centered'].filter(Boolean).join(' ')

    return (
      <ClientProps
        clientProps={{
          className: {
            'default': this.props.classes ? this.props.classes : 'programme',
            'cineflix': ['programme', this.props.video && 'video'].filter(Boolean).join(' programme--')
          },
        }}
        renderProp={(clientProps) => (
          <article {...clientProps} >
            <NavLink test-id={this.props.video && 'click_to_open_video'} className="programme__image" onClick={onClick && onClick} to={href || '#'}>
              { this.renderPoster() }
              { this.props.video && programmeCV.showPlayIcon &&
                <span className={programmeIconClasses}></span>
              }
              {this.props.restricted &&
                <div class="programme__strip">{theme.localisation.restricted.upper}</div>
              }
            </NavLink>
            { this.props.children }
          </article>
        )}
      />
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('cardCV', cardClientVariables),
  withClientVariables('programmeCV', programmeClientVariables)
)

export default enhance(Programme)