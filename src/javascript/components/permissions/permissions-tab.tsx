import React from 'react'
import styled from 'styled-components'

import 'stylesheets/admin/components/permissions-tab'

import AsyncSelect from 'javascript/components/async-select'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import PermissionExpiry from 'javascript/components/permissions/permission-expiry'
import withTheme from 'javascript/utils/theme/withTheme'

const PermissionsTab = ({
  addToList,
  onClear,
  fetchSuggestions,
  suggestions,
  value,
  toggleItem,
  placeholder,
  titleExtractor = ({ name }: any) => name,
  keyExtractor = ({ id }: any) => id,
  restrictedExtractor = ({ id }: any) => false,
  theme
}) => {
  const hasExpiryDate = theme.features.restrictions.expiring
  return (
    <>
      <div className="container">
        <AsyncSelect
          value={null}
          onChange={item => {
            if (!item) {
              onClear()
            } else {
              addToList(item)
              onClear()
            }
          }}
          labelKey="label"
          valueKey={'id'}
          loadOptions={(query, callback) => {
            fetchSuggestions(query).then(options => {
              callback(null, {
                options: options.filter(
                  suggestion =>
                    !value.find(item => keyExtractor(item) === suggestion.id),
                ).map(s => ({ ...s, label: titleExtractor(s) })),
              })
            })
          }}
          placeholder={placeholder}
          clearable={true}
        />
      </div>
      <ul className="permissions-list__list">
        {(value || []).map(item => (
          <AnimateInListItem
            className="permissions-list__item"
            key={keyExtractor(item)}
          >
            <PermissionResource
              //@ts-ignore
              hasExpiryDate={hasExpiryDate}
            >
              <CustomCheckbox
                labeless={true}
                checked={item.checked}
                id={item.type + keyExtractor(item)}
                onChange={() => toggleItem(item)}
              />
              <PermissionTitle>
                {titleExtractor(item)}
              </PermissionTitle>
              {restrictedExtractor(item) && (
                <span className="count count--warning" style={{minWidth: '70px'}}>Restricted</span>
              )}
            </PermissionResource>
            { theme.features.restrictions.expiring && item.checked && (
              <PermissionExpiry item={item} />
            )}
          </AnimateInListItem>
        ))}
      </ul>
    </>
  )
}

export const AnimateInListItem = styled.li`
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

export const PermissionResource = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  max-width: ${
    //@ts-ignore
    ({hasExpiryDate}) => hasExpiryDate ? '63%' : '100%'
  }
`

export const PermissionTitle = styled.span`
  max-width: 97%;
`

export default withTheme(PermissionsTab)
