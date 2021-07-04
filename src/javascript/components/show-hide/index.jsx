import React from 'react'

import withTheme from 'javascript/utils/theme/withTheme'

import 'stylesheets/core/components/show-hide'

/* #region  cineflix */
import Icon from 'javascript/components/icon'
/* #endregion */


class ShowHide extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: props.open || false
    }
  }

  render() {

    const { title, children, subTitle, triggerContent, restricted, theme, tags, newRelease } = this.props

    let titleClass = "show-hide__title";
    if (!children) {
      titleClass += " show-hide__title--empty"
    }

    /* #region  drg | itv */
    const styles = {
      display: this.state.open && children ? 'block' : 'none'
    }
    /* #endregion */

    return (
      <article className={['show-hide', this.state.open && 'active'].join(' show-hide--')}>
        <div className="show-hide__wrap">
          {triggerContent && triggerContent()}
          <div className="show-hide__title-wrap">
            <h1 className={titleClass} onClick={() => this.setState(({ open }) => ({ open: !open }))} >
              {title}
            </h1>
            { subTitle &&
              <p className="show-hide__sub-title">{subTitle}</p>
            }

            { tags && tags.length > 0 &&
              <div className="tags">
                {tags.map(({ id, value }) => (<span key={id+value} className="tag">{value}</span>))}
              </div>
            }

            { restricted &&
              <span class="tag tag--unregistered">{theme.localisation.restricted.upper}</span>
            }

            { newRelease &&
              <span class="tag tag--new">New</span>
            }

          </div>
          { children && (Array.isArray(children) && children.some(c => c) || !Array.isArray(children)) &&

            <button className="show-hide__trigger"
              onClick={() => this.setState(({ open }) => ({ open: !open }))}
              title={`${title} Detail`}
            >
              /* #region  cineflix */
              <Icon width="16" height="11" viewBox="0 0 32 32" id="i-chevron-down" classes="show-hide__icon" />
              /* #endregion */
            </button>
          }
        </div>

        /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | keshet | rtv | storylab | wildbrain */
        {this.state.open && children}
        /* #endregion */
        /* #region  drg | itv */
        <div style={styles} className="show-hide__content">
          {children}
        </div>
        /* #endregion */

      </article>
    )
  }
}

export default withTheme(ShowHide)