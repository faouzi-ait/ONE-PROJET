import React, { useState } from 'react'
import ImportedAutosuggest from 'react-autosuggest'
import striptags from 'striptags'
import 'stylesheets/core/generic/autosuggest'

const Autosuggest = ({
  onSuggestionSelected,
  placeholder,
  fetchSuggestions,
  className,
  titleExtractor = suggestion => suggestion.title,
  id,
  suggestions,
  onClear,
}) => {
  const [query, setQuery] = useState('')
  return (
    <ImportedAutosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value }) => {
        fetchSuggestions(value)
      }}
      onSuggestionsClearRequested={onClear}
      getSuggestionValue={titleExtractor}
      renderSectionTitle={section => <span>{section.title}</span>}
      getSectionSuggestions={section => section.suggestions}
      renderSuggestion={suggestion => {
        if (suggestion.highlight) {
          return (
            <span
              dangerouslySetInnerHTML={{
                __html: striptags(suggestion.highlight, '<b>'),
              }}
            />
          )
        } else {
          return <span>{titleExtractor(suggestion)}</span>
        }
      }}
      onSuggestionSelected={(_, { suggestion }) => {
        onSuggestionSelected(suggestion)
      }}
      inputProps={{
        placeholder,
        onChange: (e, { newValue }) => setQuery(newValue),
        value: query,
        className,
        id,
      }}
    />
  )
}

export default Autosuggest
