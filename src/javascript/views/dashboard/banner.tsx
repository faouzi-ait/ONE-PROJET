import React from 'react'
import { withRouter } from 'react-router-dom'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

import Icon from 'javascript/components/icon'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { GenreType } from 'javascript/types/ModelTypes'

interface Props {
  genre: GenreType
  theme: ThemeType
  history: any
}

const Banner: React.FC<Props> = ({
  genre,
  theme,
  history,
}) => {

  const featuredProgramme = genre['featured-programme']
  if (!featuredProgramme || featuredProgramme.restricted) {
    return (
      <div className="banner__content">
        <h1 className="banner__title" >{`${theme.variables.SystemPages.dashboard.upper}`}</h1>
        <p className="banner__copy" >{`${theme.variables.SystemPages.dashboard.upper} will track usage and provide ${theme.localisation.genre.upper} suggestions`}</p>
      </div>
    )
  }
  return (
    <div className="banner__content">
      <div className={`tag tag--${genre.name}`}>{genre.name}</div>
      <div className="banner__title">{featuredProgramme.title}</div>
      <div className="banner__copy" >{featuredProgramme.introduction}</div>
      <div className="banner__actions">
        {featuredProgramme['promo-video-id'] &&
          <div>
            <button className="button button--filled button--with-icon"
              onClick={() => {
                history.push(`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(featuredProgramme, theme)}/${featuredProgramme['promo-video-id']}`)
              }}>
              <Icon classes="button__icon" id="i-play" />
              Watch Promo
            </button>
          </div>
        }
        <button className="button button--filled button--with-icon"
          onClick={() => {
            history.push(`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(featuredProgramme, theme)}`)
          }}
        >
          <Icon id="i-right-arrow" classes="button__icon" />
          More Info
        </button>
      </div>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withTheme
)

export default enhance(Banner)