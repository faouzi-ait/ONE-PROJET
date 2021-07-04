import React from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'

import programmeSearchResultQuery from 'javascript/utils/queries/programme-search-results'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
import withTheme from 'javascript/utils/theme/withTheme'
import { query } from 'javascript/utils/apiMethods'

// Components
import AsyncSelect from 'javascript/components/async-select'
import ActivityIndicator from 'javascript/components/activity-indicator'
import CustomCheckbox from 'javascript/components/custom-checkbox'

// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { ProgrammeType, ProgrammeSearchResultType } from 'javascript/types/ModelTypes'
import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'

interface Props {
  programmes: any
  apiQueueStatus: ReturnType<typeof useEnumApiLogic>['state']['status']
  theme: CustomThemeType
}

const LimitedAccessForm: React.FC<Props> = ({ theme, programmes, apiQueueStatus }) => {
  const {
    programmesAutosuggestProps,
  } = useFetchLogic()

  return (
    <form>
      <div className="permissions-list">
        <LimitedAccessWrapper>
          <div className="container">
            <h3>{pluralize(theme.localisation.programme.upper)}</h3>
            <AsyncSelect
              value={null}
              onChange={item => {
                if (!item) {
                  programmesAutosuggestProps.onClear()
                } else {
                  programmes.addToList(item)
                  programmesAutosuggestProps.onClear()
                }
              }}
              labelKey="label"
              valueKey={'id'}
              loadOptions={(query, callback) => {
                programmesAutosuggestProps.fetchSuggestions(query).then(options => {
                  callback(null, {
                    options: options
                      .filter((suggestion: any) => {
                        return  !programmes.value.find((item) => item['limited-access-programme'].id === suggestion.id)
                      })
                      .map((item) => ({
                        ...item,
                        label: item['limited-access-programme']['title-with-genre'] || item['limited-access-programme'].title
                      })),
                  })
                })
              }}
              placeholder={`Search for a ${theme.localisation.programme.lower}`}
              clearable={true}
            />
          </div>
          <ul className="permissions-list__list">
            {(programmes.value || []).map(item => {
              return (
                <AnimateInListItem
                  className="permissions-list__item"
                  key={item['limited-access-programme'].id}
                >
                  <LimitedAccessResource>
                    <CustomCheckbox
                      labeless={true}
                      checked={item.checked}
                      id={item.type + item['limited-access-programme'].id}
                      onChange={() => programmes.toggleItem(item)}
                    />
                    <LimitedAccessTitle>
                      {item['limited-access-programme']['title-with-genre'] || item['limited-access-programme'].title}
                    </LimitedAccessTitle>
                    {item['limited-access-programme'].restricted && (
                      <span className="count count--warning" style={{minWidth: '70px'}}>Restricted</span>
                    )}
                  </LimitedAccessResource>
                </AnimateInListItem>
              )
            })}
          </ul>
        </LimitedAccessWrapper>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActivityIndicator
          status={apiQueueStatus}
          successLabel={'Permissions saved'}
        />
      </div>
    </form>
  )
}

const LimitedAccessWrapper = styled.div`
  min-width: 595px;
  padding-bottom: 60px;
  margin-top: -20px
  min-height: 260px;
`

const AnimateInListItem = styled.li`
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0px);
    }
  }
  animation: fadeInLeft 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const LimitedAccessResource = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`

export const LimitedAccessTitle = styled.span`
  max-width: 97%;
`

const useFetchLogic = () => {
  const programmesAutosuggestProps = useAutosuggestLogic({
    query: (
      keywords,
    ): Promise<{'limited-access-programme': ProgrammeType }[]> => {
      if (keywords) {
        return query<'programme-search-results', ProgrammeSearchResultType[]>(
          `programmes/search`,
          'programme-search-results',
          {
            ...programmeSearchResultQuery,
            page: {
              size: 10,
            },
            filter: {
              keywords,
            },
          },
        )
        .then(response => response.map(
          (programmeSearchResult) => ({
            ...programmeSearchResult,
            'limited-access-programme': {
              ...programmeSearchResult.programme,
            },
          })
        ))
      }
      return Promise.resolve([])
    },
  })
  return {
    programmesAutosuggestProps,
  }
}


export default withTheme(LimitedAccessForm)