import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import 'stylesheets/core/components/list-modal'

// Utils
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withHooks from 'javascript/utils/hoc/with-hooks'

// Components
import Button from 'javascript/components/button'
import Card from 'javascript/components/card'
import Carousel from 'javascript/components/carousel'
import CreateForm from 'javascript/components/create-form'
import Icon from 'javascript/components/icon'
import Toggle from 'javascript/components/toggle'
import withTheme from 'javascript/utils/theme/withTheme'


const ProgrammeListModal = (props) => {
  const [createListValidate, setCreateListValidate] = useState(false)
  const [hiding, setHiding] = useState(false)
  const {
    isSingleResource,
    resourcesToAddToList,
    resourcesToAddType,
    creatingNewList,
    listType,
    theme
  } = props

  const classes = hiding ? 'list-modal list-modal--is-hiding' : 'list-modal'
  let cardClasses = ['small', 'toggle', 'list']

  const toggleProgramme = (list, index) => {
    if (list.loading) {
      return
    }
    if (list.hasResources === 'all') {
      props.removeFromList(list, index)
    } else {
      props.addToList(list, index)
    }
  }

  const createList = (e) => {
    e.preventDefault()
    if (props.listName.length) {
      props.createList({
        name: props.listName,
        user: props.user,
        global: false
      })
    }
    setCreateListValidate(!props.listName.length)
  }

  const hideModal = () => {
    setHiding(true)
    props.closeEvent()
  }

  const sumResources = (resource) => (resource['programmes-count-without-restricted'] + resource['series-count-without-restricted'] + resource['videos-count-without-restricted'])

  if (!resourcesToAddType) {
    return (
      <div className="list-modal">
        <div className="container">
          <p>No Resource Selected</p>
        </div>
      </div>
    )
  }

  if (props.loading) {
    return <div className="loader"/>
  }

  const resourceTitle = isSingleResource
  ? resourcesToAddToList[0].title || resourcesToAddToList[0].name
  : `${resourcesToAddToList.length} ${pluralize(transformTypeToLocalisation(resourcesToAddType, theme.localisation))}`

  const { SystemPages } = theme.variables

  return (
    <div className={classes} test-id="list_modal">
      <Button className="modal__close" type="button" onClick={hideModal} classesToPrefix={['modal']}>
        <Icon id="i-drop-arrow" /> Close
      </Button>

      <div className="container">
        <div className="list-modal__list">
          <h2 className="list-modal__title">Add {resourceTitle} to a {theme.localisation.list.upper}</h2>
          <CreateForm onSubmit={createList} buttonCopy={`+ New ${theme.localisation.list.upper}`} validateMessage={createListValidate && 'Please enter a name'} loading={creatingNewList}>
            <input type="text"
              value={props.listName}
              className="create-form__input"
              placeholder={`Create a new ${theme.localisation.list.upper}`}
              onChange={({ target }) => props.setListName(target.value)}
            />
          </CreateForm>
        </div>
      </div>

      <Carousel
        options={theme.components.addToList.carousel.xlarge}
        responsive={[{
          breakpoint: 1024,
          options: theme.components.addToList.carousel.large
        }, {
          breakpoint: 768,
          options: theme.components.addToList.carousel.medium
        }, {
          breakpoint: 568,
          options: theme.components.addToList.carousel.small
        }]}
        classes={['arrows-under']}
      >
        {props.listResources.map((listResource, index) => (
          <Card key={listResource.id}
            classes={cardClasses}
            images={listResource.images.length >= 4 ? listResource.images : [listResource.images[0]]}
            title={listResource.name}
            url={`/${SystemPages.account.path}/${SystemPages.list.path}/my-${SystemPages.list.path}/${listResource.id}`}>
            <Toggle
              onClick={() => toggleProgramme(listResource, index)}
              classes={[listResource.hasResources !== 'none' && 'active', listResource.loading && 'loading']}
              indeterminate={listResource.hasResources === 'indeterminate'}
            />
            <p className="card__count">
              {theme.variables.ListFolderIcon ?
                <>
                  <Icon id="i-folder" />
                  <span>
                    {sumResources(listResource)}
                  </span>
                </>
              : sumResources(listResource)}
            </p>
            <p className="card__copy">{moment(listResource['updated-at']).format('D MMM YYYY')}</p>
          </Card>
        ))}
      </Carousel>
    </div>
  )
}

const transformType = (type) => {
  return {
    'videos': 'list-videos',
    'series': 'list-series',
    'programmes': 'list-programmes',
    'programme-search-results': 'list-programmes'
  }[type]
}

const transformTypeToLocalisation = (type, localisation) => {
  return {
    'videos': localisation.video.lower,
    'series': localisation.series.lower,
    'programmes': localisation.programme.lower,
    'programme-search-results': localisation.programme.lower
  }[type]
}

const transformTypeToIdKey = (type) => {
  return {
    'list-videos': 'video-id',
    'list-series': 'series-id',
    'list-programmes': 'programme-id',
  }[type]
}

const PAGE_SIZE = 8

const enhance = compose(
  withTheme,
  withHooks(props => {

    const [listResources, setListResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [creatingNewList, setCreatingNewList] = useState(false)
    const [listName, setListName] = useState('')
    const [timer, setTimer] = useState(0)

    // Resources
    const listsResource = useResource('list')
    const programmesResource = useResource('programme')
    const seriesResource = useResource('series')
    const videosResource = useResource('video')

    const { resourcesToAddToList } = props
    const isSingleResource = resourcesToAddToList.length === 1
    const resourcesToAddType = resourcesToAddToList[0]?.type
    const listType = transformType(resourcesToAddType)
    const idsBeingAddedCache = resourcesToAddToList.reduce((cache, curr) => {
      cache[curr.id] = true
      return cache
    }, {})

    const actionResource = (type) => {
      return {
        'videos': videosResource,
        'series': seriesResource,
        'programmes': programmesResource,
        'programme-search-results': programmesResource
      }[type]
    }

    const getLists = () => {
      listsResource.findAllBatch(PAGE_SIZE, {
        filter: {
          'meeting-list': false,
          'manage': true,
          'user_id': props.user.id,
          ...props.user['user-type'] === 'external' && {'global': false}
        },
        include: 'list-programmes,list-videos,list-series',
        fields: {
          'lists': 'id,name,programmes-count-without-restricted,series-count-without-restricted,videos-count-without-restricted,list-programmes,list-videos,list-series,images',
          'list-programmes': 'programme-id',
          'list-videos': 'video-id',
          'list-series': 'series-id',
        },
        'sort': '-updated_at',
      })
      .then((response) => {
        setListResources(response.map(r => ({
          ...r,
          hasResources: checkIfListHasResources(r[listType])
        })))
        setLoading(false)
        setCreatingNewList(false)
      })
      .catch((error) => console.warn('list-modal: findAllBatch:', error))
    }

    useEffect(getLists, [])

    const checkIfListHasResources = (listsContents = []) => {
      const idKey = transformTypeToIdKey(listType)
      let resourcesFound = 0
      for (let i = 0; i < listsContents.length; i += 1) {
        if (resourcesFound === resourcesToAddToList.length) break
        if (idsBeingAddedCache[listsContents[i][idKey]]) {
          resourcesFound += 1
        }
      }
      if (resourcesFound && resourcesFound !== resourcesToAddToList.length) {
        return 'indeterminate'
      }
      return resourcesFound ? 'all' : 'none'
    }

    const addToList = (list, index) => {
      const listRelationship = {
        id: list.id,
        name: 'list'
      }
      setListItemLoading(index)
      actionResource(resourcesToAddType).createRelationships(listRelationship, resourcesToAddToList)
        .catch((error) => {
          console.error('list-modal: addToList:', error)
        })
        .finally(() => {
          getListResources()
          props.resourcesSubmitted()
        })
    }

    const removeFromList = (list, index) => {
      const listRelationship = {
        id: list.id,
        name: 'list'
      }
      setListItemLoading(index)
      actionResource(resourcesToAddType).deleteRelationships(listRelationship, resourcesToAddToList)
        .catch((error) => {
          console.error('list-modal: removeFromList:', error)
        })
        .finally(() => {
          getListResources()
          props.resourcesSubmitted()
        })
    }


    const createList = (newList) => {
      setCreatingNewList(true)
      listsResource.createResource(newList)
        .then(() => {
          getLists()
          setListName('')
        })
    }

    const setListItemLoading = (index) => {
      if (timer) {
        clearTimeout(timer)
      }
      const update = [...listResources]
      update[index]['loading'] = true
      setListResources(update)
    }

    const getListResources = () => {
      setTimer(setTimeout(() => {
        setListName('')
        getLists()
      }, 1000))
    }

    return {
      addToList,
      createList,
      creatingNewList,
      isSingleResource,
      listName,
      listResources,
      listType,
      loading,
      removeFromList,
      resourcesToAddToList,
      resourcesToAddType,
      setListName,
    }
  })
)

export default enhance(ProgrammeListModal)