import React, { useState } from 'react'

import Button from 'javascript/components/button'

const IndexHelperDeleteForm = (props) => {

  const { closeEvent, deleteResource, resourceName, deleteWarningMsg, resource } = props
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
            <p>Are you sure you want to delete the { resourceName } <strong>{ resource.name }</strong>?</p>
            { deleteWarningMsg && (
              <p>{ deleteWarningMsg }</p>
            )}
          </div>
        </div>
        <div class="cms-form__control cms-form__control--actions">
          <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
          <Button type="submit" className={ buttonClasses }>Delete</Button>
        </div>
      </div>
    </form>
  )
}

export default IndexHelperDeleteForm
