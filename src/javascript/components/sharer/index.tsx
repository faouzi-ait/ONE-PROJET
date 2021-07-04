import React from 'react'
import { css } from 'styled-components'

import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import Icon from 'javascript/components/icon'

import 'stylesheets/core/components/sharer'

interface Props {
  title: string
}

const Sharer = ({
  title
} : Props) => (
  <div className="sharer">
    /* #region banijaygroup */
    <div className="container">
    /* #endregion */
      <ul className="sharer__list" >
        <li className="sharer__item">Share:</li>
        <li className="sharer__item">
          <a target="_blank" className="sharer__link sharer__link--twitter"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${window.location.href}`}
          >
            Twitter
            <Icon classes="sharer__icon" id="i-twitter" width="24" height="20" />
          </a>
        </li>
        <li className="sharer__item">
          <a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} className="sharer__link sharer__link--facebook">Facebook <Icon classes="sharer__icon" id="i-facebook" width="11" height="22" /></a>
        </li>
        <li className="sharer__item">
          <a target="_blank" href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${encodeURIComponent(title)}`} className="sharer__link sharer__link--linkedin">LinkedIn <Icon classes="sharer__icon" id="i-linkedin" width="22" height="22" /></a>
        </li>
      </ul>
    /* #region  banijaygroup */
    </div>
    /* #endregion */
  </div>
)

export default Sharer


export const sharerStyles = makeLiteStyles(styles => {
  return css`
    .sharer {
      background-color: transparent;
    }
  `
})
