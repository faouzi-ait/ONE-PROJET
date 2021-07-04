import React, { useState, useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'

// Components
import CheckboxFilters from 'javascript/components/checkbox-filters'
import Icon from 'javascript/components/icon'
// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
// HOC
import usePrefix from 'javascript/utils/hooks/use-prefix'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import genreClientVariables from './variables'
// Types
import { GenreType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  allLoaded?: boolean
  genres: GenreType[]
  kids: boolean
  removeGenre: (genre: number) => void
  selectedGenres: number[]
  updateGenres: (e: any) => void
  cms: boolean
  theme: CustomThemeType
  meta: any,
  genreCV: any
}

const GenreFilters = ({
  allLoaded = true,
  genres,
  kids,
  removeGenre,
  selectedGenres,
  updateGenres,
  cms,
  theme,
  meta = {},
  genreCV
} : Props) => {

  const { prefix } = usePrefix()

  const renderSelectedGenres = () => {
    const selection = []    
    genres.map((genre) => {
      let sortedSubGenres = genre['sub-genres']
      if(genreCV.genreSortOrder === 'name') {
        sortedSubGenres.sort((a, b) => { return a.name.localeCompare(b.name) })
      } else if(genreCV.genreSortOrder === 'position') {
        sortedSubGenres.sort((a, b) => { return a.position - b.position })
      }

      if (selectedGenres.includes(genre.id)) {
        selection.push({
          name: genre.name,
          id: genre.id
        })
      }
      sortedSubGenres.map((sub) => {
        if (selectedGenres.includes(sub.id)) {
          selection.push({
            name: `${genre.name} - ${sub.name}`,
            id: sub.id
          })
        }
      })
    })
    if (selection.length > 0) {
      return (
        <div className={`${prefix}programme-filters__selection`}>
          {selection.map((genre) => {
            return (
              <span className={genreCV.genreTagClasses} key={genre.id} onClick={() => { removeGenre(genre.id) }}>
                {genre.name}
                <Icon id="i-close" classes="tag__icon" />
              </span>
            )
          })}
        </div>
      )
    }
  }

  if (allLoaded) {
    if (meta['genre-ids'] && meta['genre-ids'].length === 0) {
      return (
        <div style={{
          width: '100%',
          textAlign: 'center'
        }}>
          {`There are currently no ${pluralize(theme.localisation.genre.lower)} matching the current filter criteria.`}
        </div>
      )
    }
    
    let sortedGenres = genres
    if(genreCV.genreSortOrder === 'name') {
      sortedGenres.sort((a, b) => { return a.name.localeCompare(b.name) })
    } else if(genreCV.genreSortOrder === 'position') {
      sortedGenres.sort((a, b) => { return a.position - b.position })
    }

    return (
      <>
        {genreCV.showSelectedGenres && renderSelectedGenres()}
        { !cms && genreCV.showGenreTitle && (
          <div className={`${prefix}programme-filters__row ${prefix}programme-filters__row--compact`}>
            <div className={`${prefix}programme-filters__column`}>
              <label className={`${prefix}programme-filters__label`}>Genre</label>
            </div>
          </div>
        )}
        <div className={genreCV.checkboxFilterClasses}>
          {sortedGenres.map((genre, index) => {
            if (theme.variables.KidsVersion && kids && genre.name.toLowerCase() !== 'kids') {
              return
            }
            const parentIsChecked = selectedGenres.includes(genre.id)
            const checkedChildren = genre['sub-genres'].filter(genre => selectedGenres.includes(genre.id)).map(genre => genre.id)
            return (
              <CheckboxFilters key={genre.id}
                parent={genre}
                checkParent={parentIsChecked}
                toggleText={genreCV.subGenreToggleText(pluralize(theme.localisation.genre.lower))}
                children={genre['sub-genres']}
                checkChildren={checkedChildren}
                onChange={updateGenres}
                multi={genres.length > 1}
                openByDefault={genreCV.openFirstGenre && index === 0} />
            )
          })}
        </div>
      </>
    )
  }
  return null
}

const enhance = compose(
  withTheme,
  withClientVariables('genreCV', genreClientVariables),
  withHooks(props => {
    const [genres, setGenres] = useState([])
    const [kids] = useState(window.location.hostname.includes('kids'))
    const [selectedGenres, setSelectedGenres] = useState([])
    const { meta } = props

    const genreResource = useResource('genre')
    const metaIds = meta['genre-ids'] ? meta['genre-ids'].join(',') : []

    useEffect(() => {
      genreResource.findAll({
        include: 'sub-genres',
        filter: {
          scope: 'top_level',
          id: metaIds,
          'sub-genres.id': metaIds
        },
        fields: {
          genres: 'name,sub-genres,programmes-count,parent,position'
        }
      })
      .then((response) => {
        setGenres(response)
        props.onFinishedLoading()
      })
      .catch(console.warn)
    }, [metaIds])

    useEffect(() => {
      if (props.selectedGenres) {
        const updateSelectedGenres = props.selectedGenres.split(',')
        if (props.theme.variables.KidsVersion && kids && updateSelectedGenres.length < 1) {
          updateSelectedGenres.push("509")
        }
        setSelectedGenres(updateSelectedGenres)
      }
    }, [props.selectedGenres])

    const removeGenre = (genre) => {
      const updateSelectedGenres = [...selectedGenres].filter(id => id != genre)
      props.updateQuery('filter[genre]', updateSelectedGenres.join(','))
      setSelectedGenres(updateSelectedGenres)
    }

    const updateGenres = ({ target }) => {
      const parentId = target.getAttribute('data-parent')
      let updateSelectedGenres = [...selectedGenres]
      let genre = null
      let parent = null

      if (parentId) {
        parent = genres.find(genre => genre.id == parentId)
        genre = parent['sub-genres'].find(sub => sub.id == target.value)
      } else {
        genre = genres.find(genre => genre.id == target.value)
      }

      if (updateSelectedGenres.includes(genre.id)) {
        if (parent) {
          updateSelectedGenres = updateSelectedGenres.filter(id => id != parent.id)
        }
        updateSelectedGenres = updateSelectedGenres.filter(id => id != target.value)
      } else {
        if (parent) {
          if (updateSelectedGenres.includes(parent.id)) {
            updateSelectedGenres = updateSelectedGenres.filter(id => id != parent.id)
            parent['sub-genres'].map((sub) => {
              if (sub.id !== genre.id) {
                updateSelectedGenres.push(sub.id)
              }
            })
          } else {
            let count = 0
            updateSelectedGenres.push(genre.id)
            parent['sub-genres'].map((sub) => {
              if (updateSelectedGenres.includes(sub.id)) {
                count++
              }
            })
            if (count === parent['sub-genres'].length) {
              updateSelectedGenres.push(parent.id)
              parent['sub-genres'].map((sub) => {
                updateSelectedGenres = updateSelectedGenres.filter(id => id != sub.id)
              })
            }
          }
        } else {
          updateSelectedGenres.push(genre.id)
          genre['sub-genres'].map((sub) => {
            updateSelectedGenres = updateSelectedGenres.filter(id => id != sub.id)
          })
        }

      }
      if (props.theme.variables.KidsVersion && kids && updateSelectedGenres.length < 1) {
        updateSelectedGenres.push("509")
      }
      props.updateQuery(props.filterName || 'filter[genre]', updateSelectedGenres.join(','))
      setSelectedGenres(updateSelectedGenres)
    }

    return {
      ...props,
      genres,
      kids,
      removeGenre,
      selectedGenres,
      updateGenres,
    }
  })
)

export default enhance(GenreFilters)
