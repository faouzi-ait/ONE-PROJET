import React, { useState, useMemo } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import styled from 'styled-components'

import Button from 'javascript/components/button'
import DatePicker from 'javascript/components/datepicker'
import Icon from 'javascript/components/icon'
import withTheme from 'javascript/utils/theme/withTheme'
import useResource from 'javascript/utils/hooks/use-resource'

import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  handleDateSelected: (update: any) => Promise<any>
  item: any
  theme: CustomThemeType
}

const PermissionExpiry: React.FC<Props> = ({
  handleDateSelected,
  item,
  theme
}) => {

  const [expiryDate, setExpiryDate] = useState(item['expires-after'])
  const [hasErrored, setHasErrored] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const buttonClasses = ['button', 'filled', 'small'].join(' button--')
  const buttonTxt = expiryDate ? 'Edit' : 'Add'

  const dateSelected = (date, organicSelection) => {
    setIsLoading(true)
    const update = {
      'id': item.id,
      'expires-after': date ? date : null,
    }

    handleDateSelected(update)
    .then((response) => {
      setExpiryDate(response['expires-after'])
      setIsLoading(false)
    })
    .catch((error) => {
      setHasErrored(true)
      setTimeout(() => setHasErrored(false), 2000)
    })
    if (organicSelection) {
      toggleDatePicker()
    }
  }

  const toggleDatePicker = () => setShowDatePicker((state) => !state)

  if (hasErrored) {
    return (
      <ExpiryWrapper>
        <span>Error! Please refresh and try again.</span>
      </ExpiryWrapper>
    )
  }

  if (isLoading) {
    return (
      <ExpiryWrapper>
        <LoadingButton className={`${buttonClasses} button--loading`}></LoadingButton>
      </ExpiryWrapper>
    )
  }

  return (
    <ExpiryWrapper>
      { showDatePicker ? (
        <DatePicker
          selected={expiryDate}
          onChange={(date) => dateSelected(date, true)}
          placeholderText="Expiry Date"
          dateFormat="DD/MM/YYYY"
        />
      ) : (
        <ActionsWrapper>
          <span>
            {expiryDate ? moment(expiryDate).format(theme.features.formats.shortDate) : ''}
          </span>
          { expiryDate && (
            <DeleteButton className="icon-button" type="button" onClick={() => dateSelected(null, false)} >
              <Icon id="i-close"/>
            </DeleteButton>
          )}
          <Button
            className={buttonClasses}
            style={{minWidth: '130px', float: 'right'}}
            onClick={toggleDatePicker}
          >
            {`${buttonTxt} Expiry`}
          </Button>
        </ActionsWrapper>
      )}
    </ExpiryWrapper>
  )
}

const ExpiryWrapper = styled.div`
  width: 35%;
`

const ActionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const DeleteButton = styled.button`
  width: 25px !important;
  height: 25px !important;
`

const LoadingButton = styled.button`
 min-width: 80%;
`

const PermissionExpiryWithTheme = withTheme(PermissionExpiry)

export const PermissionExpiryMultipleAssets = ({
  expiryDateUpdated,
  resource,
  setMixedAssets,
  type
}) => {
  const setDateOnAllSharedResources = (date) => {
    const update = {...resource}
    if (!update[type]) {
      update[type] = [{
        type,
      }]
    }
    update[type] = update[type].map((restrictedPermission) => {
      return {
        ...restrictedPermission,
        'expires-after': date,
      }
    })
    return update
  }

  const handleDateSelected = (update) => new Promise((resolve, reject) => {
    const updatedResource = setDateOnAllSharedResources(update['expires-after'])
    expiryDateUpdated(updatedResource)
    resolve(update)
  })

  const createItemFromSharedResources = () => {
    let allDatesTheSame = {
      'expires-after': null
    }
    if (resource[type]?.length) {
      allDatesTheSame = resource[type].reduce((acc, curr) => {
        if (acc['expires-after'] === curr['expires-after']) return curr
        return false
      })
    }
    if (!allDatesTheSame) {
      expiryDateUpdated(setDateOnAllSharedResources(null))
      setMixedAssets(true)
    }
    return {
      id: null, // id not required  - item represents multiple shared restrictions
      'expires-after': allDatesTheSame ? allDatesTheSame['expires-after'] : null
    }
  }

  const item = useMemo(createItemFromSharedResources, [resource])

  return (
    <PermissionExpiryWithTheme item={item} handleDateSelected={handleDateSelected}/>
  )
}

const PermissionExpiryWithUpdate = ({ item }) => {
  const restrictedResource = useResource(pluralize.singular(item.type))
  const handleDateSelected = (update) => {
    return restrictedResource.updateResource(update)
  }
  return (
    <PermissionExpiryWithTheme item={item} handleDateSelected={handleDateSelected}/>
  )
}
export default PermissionExpiryWithUpdate



