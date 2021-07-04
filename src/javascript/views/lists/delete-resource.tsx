import React, { useMemo, useState } from 'react'
import pluralize from 'pluralize'
import useResource from 'javascript/utils/hooks/use-resource'

interface Props {
  resources: any[]
  listId: string
  closeEvent: () => void
}

const DeleteListResourcesFrom: React.FC<Props> = ({
  resources,
  listId,
  closeEvent
}) =>  {
  const [isLoading, setIsLoading] = useState(false)
  const deleteButtonClasses = ['button', 'filled', 'reversed', isLoading && 'loading'].filter(Boolean).join(' button--')
  const programmeResource = useResource('programme')
  const seriesResource = useResource('series')
  const videoResource = useResource('video')

  const { programmes, series, videos } = useMemo(() => {
    return resources.reduce((acc, curr) => {
      let type = curr.type.replace('list-', '')
      acc[type].push(curr[type == 'series' ? type : pluralize.singular(type)])
      return acc
    }, {
      programmes: [],
      series: [],
      videos: []
    })
  }, [resources])


  const deleteResource = () => {
    setIsLoading(true)
    const listRelationship = {
      id: listId,
      name: 'list'
    }
    Promise.all([{
      action: programmeResource.deleteRelationships,
      resources: programmes
    }, {
      action: seriesResource.deleteRelationships,
      resources: series
    }, {
      action: videoResource.deleteRelationships,
      resources: videos
    }]
    .filter(ar => ar.resources.length)
    .map((ar => ar.action(listRelationship, ar.resources))))
    .then(closeEvent)
  }

  return (
    <form className="form" onSubmit={deleteResource}>
      <div>
        <div className="form__control">
          <p>Are you sure you want to delete { resources.length === 1 ? 'this item' : 'these items' }?</p>
        </div>
        <div className="form__control form__control--actions">
          <button type="button" className="button button--reversed" onClick={closeEvent}>Cancel</button>
          <button type="button" className={deleteButtonClasses} onClick={deleteResource}>Delete</button>
        </div>
      </div>
    </form>
  )
}

export default DeleteListResourcesFrom
