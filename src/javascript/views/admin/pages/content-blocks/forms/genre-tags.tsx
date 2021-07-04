import React, {useState, useEffect} from 'react'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  GenreType,
} from 'javascript/types/ModelTypes'

import { makeGenreSelectOptions } from 'javascript/utils/generic-tools'
// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
// Hoc
import useResource from 'javascript/utils/hooks/use-resource'
import withTheme from 'javascript/utils/theme/withTheme'

interface Props {
  block?: GenreTagsBlock
  index: undefined | number
  onSubmit: (block: GenreTagsBlock, index?: number) => void
  theme: CustomThemeType
}

interface GenreTagsBlock {
  title: string
  background: string
  catalogueLink?: boolean
  loading?: boolean
  genres?: GenreType[]
  selectedGenres: any[]
}

const GenreTagsBlockForm: React.FC<Props> = (props) => {
  const {
    block,
    index: blockIndexPosition,
    theme
  } = props

  const [title, setTitle] = useState(block?.title || '')
  const [background, setBackground] = useState(block?.background || 'light')
  const [catalogueLink, setCatalogueLink] = useState(block?.catalogueLink || false)
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState(block?.selectedGenres || [])
  const [isLoading, setIsLoading] = useState(false)
  const [resourceErrors, setResourceErrors] = useState([])
  const genreResource = useResource('genre')

  useEffect(() => {
    genreResource.findAll({
      include: 'sub-genres',
      fields: {
        genres: 'name,parent-id',
      },
    })
    .then((resources) => {
      setGenres(makeGenreSelectOptions(resources))
    })
  }, [])

  const isValid = () => {
    const errors = selectedGenres.map((g, i) => {return {...g, key: i}}).filter((g) => !g.value)

    setResourceErrors(errors)
    return (
      errors.length <= 0
    )
  }

  const saveBlock = (e) => {
    e.preventDefault()
    if (!isValid()) {
      return false
    }
    setIsLoading(true)
    const block = {
      title,
      background,
      selectedGenres,
      catalogueLink,
      type: 'genre-tags',
    }
    if (blockIndexPosition > -1) {
      props.onSubmit(block, blockIndexPosition)
    } else {
      props.onSubmit(block)
    }
  }

  const buttonClasses = [
    'button',
    'filled',
    isLoading && 'loading',
  ].join(' button--')

  return (
    <form onSubmit={saveBlock} className="cms-form">
      <FormControl label="Background">
        <Select
          options={[
            { value: 'light', label: 'Plain' },
            { value: 'shade', label: 'Shaded' },
          ]}
          onChange={setBackground}
          value={background}
          clearable={false}
          simpleValue={true}
        />
      </FormControl>
      <FormControl type="text"
        label="Title" name="title"
        value={title}
        onChange={({ target }) => setTitle(target.value) }
      />
      <FormControl>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={catalogueLink}
            name="catalogueLink"
            className="checkbox__input"
            id="catalogueLink"
            onChange={({ target }) => setCatalogueLink(target.checked) }
          />
          <label htmlFor="catalogueLink" className="checkbox__label cms-form__label">Show {theme.localisation.catalogue.upper} Link</label>
        </div>
      </FormControl>
      <div>
          {selectedGenres?.map((resource, i) => {
            return (
              <div className="cms-form__group">
                <div className="cms-form__group-actions">
                  <Button
                    type="button"
                    className="button button--smallest button--error"
                    onClick={() => {
                      const update = selectedGenres
                      update.splice(i, 1)
                      setSelectedGenres([...update])
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <FormControl label="Genre">
                  <Select
                    options={genres}
                    onChange={(target) => {
                      const update = selectedGenres
                      update[i] = genres.filter((g) => g.value === target)?.[0]
                      setSelectedGenres([...update])
                    }}
                    value={resource}
                    clearable={ false }
                    simpleValue={ true }
                  />
                </FormControl>
                {resourceErrors.filter((r) => r.key === i).length > 0 &&
                  <p className="cms-form__error">
                    Please complete this field
                  </p>
                }
              </div>
            )
          })}
        </div>
        <div className="cms-form__actions">
          <Button
            className="button button--small"
            onClick={() => {
              setSelectedGenres([...selectedGenres, {name: ''}])
            }}
            type="button"
          >
            Add Genre
          </Button>
        </div>
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={buttonClasses}>
          Save Content Block
        </Button>
      </div>
    </form>
  )
}

export default withTheme(GenreTagsBlockForm)