import React from 'react'
import withTheme from 'javascript/utils/theme/withTheme'
import useProgrammesAutosuggest from 'javascript/utils/hooks/use-programmes-autosuggest'
import useApi from 'javascript/utils/hooks/use-api'
import AsyncSelect from '../async-select'

const RelatedProgrammesForm = ({
  onChange,
  existingProgrammes = [],
  theme,
}) => {
  const idsToNotInclude = existingProgrammes.map((a) => a.id)
  const { searchProgrammes, programmeSuggestions } = useProgrammesAutosuggest({
    buildParams: (keywords) => ({
      filter: {
        keywords: encodeURIComponent(keywords),
        restricted: false,
      },
    }),
    onLoad: (options, callback) => {
      callback({
        options,
      })
      return options
    },
  })

  const [_, fetchProgrammeById] = useApi((api) => (programmeId) =>
    api.find('programme', programmeId, {
      fields: {
        programmes: 'title,thumbnail,short-description,logo,genres',
        genres: 'name,parent-id',
      },
      include: 'genres',
    }),
  )

  const handleProgrameSelection = (programme) => {
    fetchProgrammeById(programme.id).then((result) => {
      onChange(result)
    })
  }

  return (
    <AsyncSelect
      onChange={handleProgrameSelection}
      clearable={true}
      options={programmeSuggestions.filter((programme) => {
        return !idsToNotInclude.includes(programme.id)
      })}
      autoload={false}
      backspaceRemoves={true}
      labelKey="title-with-genre"
      loadOptions={searchProgrammes}
      valueKey="id"
      placeholder={`Search for ${theme.localisation.programme.path}`}
    />
  )
}

export default withTheme(RelatedProgrammesForm)
