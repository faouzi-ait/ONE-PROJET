import React, { useState } from 'react'
import pluralize from 'pluralize'

import Button from 'javascript/components/button'

interface Props {
  closeEvent: (e: any) => void
  deleteResource: (resource: any) => void
  relationCount: number
  relationName: string
  resource: any
  resourceName: string
  resourceNameIdentifier?: string
}

const DeleteFormConfirm: React.FC<Props> = ({
  closeEvent,
  deleteResource,
  relationCount,
  relationName,
  resource,
  resourceName,
  resourceNameIdentifier = 'name',
}) => {


  const [isDeleting, setIsDeleting] = useState(false)
  const buttonClasses = ['button', 'filled', 'reversed', isDeleting && 'loading'].join(' button--')

  const handleDeleteResource = (e) => {
    e.preventDefault()
    setIsDeleting(true)
    deleteResource(resource)
  }

  return (
    <form className="cms-form" onSubmit={handleDeleteResource} >
      <div>
        <div className="cms-form__control">
          <div>
            <p>
              This { resourceName } has {relationCount} {relationCount === 1 ? relationName : pluralize(relationName)} assigned to it!
            </p>
            <p>Are you sure you want to delete the { resourceName } <strong>{ resource[resourceNameIdentifier] }</strong>?</p>
          </div>
        </div>
        <div className="cms-form__control cms-form__control--actions">
          <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
          <Button type="submit" className={ buttonClasses }>Delete</Button>
        </div>
      </div>
    </form>
  )
}

export default DeleteFormConfirm