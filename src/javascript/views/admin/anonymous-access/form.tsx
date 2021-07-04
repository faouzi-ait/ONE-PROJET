import React, { useState, useEffect } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import styled from 'styled-components'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withLoader from 'javascript/components/hoc/with-loader'
import withTheme from 'javascript/utils/theme/withTheme'
import { withRouter } from 'react-router-dom'

import Button from 'javascript/components/button'
import ListItem from 'javascript/views/admin/anonymous-access/list-item'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'


interface Props {
  history: any
  pageIsLoading: (loading: boolean) => void
  theme: ThemeType
}

const AnonymousAccessForm: React.FC<Props> = ({
  history,
  pageIsLoading,
  theme,
}) => {

  const [formState, setFormState] = useState({
    'name': '',
    'recipients': '',
    'message': '',
    'expires-after': '',
    'views': '',
    'listId': '',
  })

  const [totalSelected, setTotalSelected] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const handleInputChange = ({target}) => {
    setFormState((currState) => ({
      ...currState,
      [target.name]: target.value
    }))
  }

  const [lists, setLists] = useState([])
  const listResource = useResource('list')
  const getLists = () => {
    listResource.findAll({
      fields: {
        lists: 'name',
      },
      filter: {
        'my-lists-with-global': true,
      }
    })
    .then((response) => {
      setLists(response)
      pageIsLoading(false)
    })
  }

  useEffect(() => {
    getLists()
  }, [])

  const [listItems, setListItems] = useState(null)
  const listItemsResource = useResource('list')
  const getListItems = (listId) => {
    if (!listId) {
      setTotalSelected(0)
      return setListItems(null)
    }
    listItemsResource.findAll({
      include: [
        'list-programmes,list-programmes.programme',
        'list-series,list-series.series',
        'list-videos,list-videos.video'
      ].join(','),
      fields: {
        'lists': 'name,list-programmes,list-series,list-videos',
        'list-programmes': 'list-position,programme',
        'programmes': 'title-with-genre,restricted,active',
        'list-series': 'list-position,series',
        'series': 'name,programme-id,programme-name,restricted,active',
        'list-videos': 'list-position,video',
        'videos': 'name,programme-id,programme-name,programme-title-with-genre,series-id,series-name,episode-id,episode-name,restricted,public-video'
      },
      filter: {
        'id': listId,
      }
    })
    .then((response) => {
      const selectedList = response[0] || {}
      const itemTypes = {
        'list-programmes': 'programme',
        'list-series': 'series',
        'list-videos': 'video'
      }
      const allListItems = Object.entries(itemTypes).reduce((acc, itemType) => {
        const listResources = selectedList[itemType[0]] || []
        listResources.forEach((listResource) => {
          acc.push({
            isSelected: true,
            listPosition: listResource['list-position'],
            ...listResource[itemType[1]]
          })
        })
        return acc
      }, [])
      setListItems(allListItems)
      setTotalSelected(allListItems.length)
    })
  }

  useEffect(() => {
    if (formState.listId !== '') {
      getListItems(formState.listId)
    }
  }, [formState.listId])


  const toggleListItemSelected = (resourceId) => ({target}) => {
    const updateListItems = [...listItems]
    let totalChecked = 0
    updateListItems.forEach((item) => {
      if (item.id === resourceId) {
        item.isSelected = target.checked
      }
      if (item.isSelected) {
        totalChecked += 1
      }
    })
    setListItems(updateListItems)
    setTotalSelected(totalChecked)
  }

  const renderListItems = () => {
    if (listItems === null) return
    if (!listItems.length) {
      return (
        <div style={{
          textAlign: 'center',
          paddingTop: '50px',
          width: '100%'
        }}>
          There are no items in the selected {theme.localisation.list.upper}
        </div>
      )
    }
    const programmeSeriesEpisodeTitle = `${theme.localisation.programme.upper} / ${theme.localisation.series.upper} / ${pluralize.singular(theme.localisation.episodes.upper)}`
    return (
      <div>
        <Notice>
          <BoldText>Please Note:</BoldText> If providing access to a video or series that belong to a restricted programme / series,
          you will be providing access to that restricted programme / series as well. Permissions will be given to
          all the associated resources that the video or series belongs to. These permission relationships are depicted in
          the <strong> {programmeSeriesEpisodeTitle} </strong> column.
        </Notice>

        <table className="cms-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Type</th>
              <th>
                {programmeSeriesEpisodeTitle}
              </th>
            </tr>
          </thead>
          <tbody>
            { listItems
                .sort((a, b) => a.listPosition < b.listPosition ? -1 : 1)
                .map((resource) =>
                  <ListItem key={`${resource.type}_${resource.id}`} resource={resource} toggleListItemSelected={toggleListItemSelected} />
                )
            }
          </tbody>
        </table>
      </div>
    )
  }

  const anonymousAccessResource = useResource('anonymous-access')
  const save = (e) => {
    e.preventDefault()
    setIsSaving(true)
    const resource = {
      'name': formState['name'],
      'emails': formState['recipients'].replace(/\s/g, '').split(','),
      'message': formState['message'],
      'expires-after': formState['expires-after'],
      'view-count-limit': formState['views'],
      'list': {
        'id': formState['listId'],
      },
    }
    const allItems = listItems.reduce((acc, item) => {
      if (item.isSelected) {
        acc[item.type].push({ id: item.id })
      }
      return acc
    }, {
      programmes: [],
      series: [],
      videos: [],
    })
    Object.keys(allItems).forEach((type) => {
      if (allItems[type].length) {
        resource[type] = allItems[type]
      }
    })
    anonymousAccessResource.createResource(resource)
      .then((response) => {
        history.push(`/admin/${theme.localisation.anonymousAccess.path}`)
      })
      .catch((errors) => {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        setIsSaving(false)
        setFormErrors(Object.keys(errors).reduce((acc, curr) => {
          if (curr === 'name') {
            acc['name'] = `Please provide a unique name, "${formState['name']}" is already taken.`
          } else if (curr === 'emails') {
            acc['recipients'] = `Duplicate email address. All recipients must have a unique email.`
          }
          return acc
        }, {}))
      })
  }

  const saveButtonClasses = isSaving
    ? 'button button--filled button--loading'
    : 'button button--filled'

  return (
    <div className="container">
      <form className="cms-form cms-form--large" style={{minHeight: '250px'}} onSubmit={save} >
        <div style={{padding: '20px 0px 20px 0px'}}>
          <FormControl type="text" label="Name" name="name" value={formState['name']} required onChange={handleInputChange} error={formErrors['name']} />
          <FormControl type="email" multiple label="Recipients" name="recipients" value={formState['recipients']} required onChange={handleInputChange} error={formErrors['recipients']} />
          <FormControl type="textarea" label="Message (255 chars)" name="message" value={formState['message']} maxlength="255" onChange={handleInputChange} />
          <FormControl type='date'
            label="Expires after"
            selected={formState['expires-after']
                ? moment(formState['expires-after'])
                : undefined
            }
            onChange={(date) => {
              setFormState((currState) => ({
                ...currState,
                'expires-after': date ? date.endOf('day').toDate().toUTCString() : null
              }))
            }}
            dateFormat={theme.features.formats.mediumDate}
            isClearable={true}
            showYearDropdown
          />
          <FormControl type="number" label="Number of views (per email)" name="views" value={formState['views']} onChange={handleInputChange} style={{ maxWidth: '228px'}} />
          <FormControl required
            label={`Add a ${theme.localisation.list.lower}`}
          >
            <Select
              options={lists.map(l => ({
                  value: l.id,
                  label: l.name
                })
              )}
              value={formState['listId']}
              onChange={(selectedId) => {
                setFormState((currState) => ({
                  ...currState,
                  'listId': selectedId
                }))
              }}
              simpleValue={true}
              clearable={true}
            />
          </FormControl>
          {renderListItems()}
          { totalSelected > 0 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Button className={saveButtonClasses} type="submit" style={{ minWidth: '265px', marginTop: '20px' }}>
                {`Save ${theme.localisation.anonymousAccess.upper}`}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

const enhance = compose(
  withTheme,
  withLoader,
  withRouter,
)

export default enhance(AnonymousAccessForm)

const Notice = styled.div`
  padding: 10px 0px 30px 0px;

`

const BoldText = styled.span`
  font-size: 22px;
  color: red;
`