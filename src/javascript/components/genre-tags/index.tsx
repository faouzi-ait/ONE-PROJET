import React from 'react'
import { NavLink } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import allClientVariables from './variables'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  genres: GenreTagType[]
  theme: ThemeType
  title?: string,
  catalogueLink?: boolean
}

interface GenreTagType {
  label: string,
  value: number
  name?: string
}

const GenreTags: React.FC<Props> = ({
  genres,
  title,
  theme,
  catalogueLink,
}) => {

  const genreTagsCV = useClientVariables(allClientVariables)

  return (
    <div>
      { title && (
        <h2 className="content-block__heading">{ title }</h2>
      )}
      <div className="content-block__content">
        <div className="grid grid--center grid--wrap">
          {genres?.map((genre) => {
            let genreClassName = genre.label
            if (genre.name) {
              genreClassName = genre.label.replace(` - ${genre.name}`, '')
            }
            const url = `/${theme.variables.SystemPages.catalogue.path}?filter[genre]=${genre.value}`
            return (
              <div className="grid__item u-align-center">
                <NavLink to={url} className={genreTagsCV.genreButtonClasses(genreClassName?.replace(/\s/g, '_').toLowerCase())}>
                  <span>{genre.label}</span>
                  <ClientSpecific client="ae">
                    <Icon id="i-right-long-arrow" width="35" height="23" className="button__icon"/>
                  </ClientSpecific>
                </NavLink>
              </div>
            )
          })}
        </div>
        { catalogueLink && (
          <NavLink to={`/${theme.variables.SystemPages.catalogue.path}`} className={genreTagsCV.catalogueButtonClasses}>{genreTagsCV.catalogueButtonText(theme.localisation.catalogue.lower)}</NavLink>
        )}
      </div>
    </div>
  )
}

const enhance = compose(
  withTheme,
)

export default enhance(GenreTags)
