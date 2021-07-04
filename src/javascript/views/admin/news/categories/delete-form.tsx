import React, { useState } from 'react'
import pluralize from 'pluralize'

import Button from 'javascript/components/button'

const NewsCategoryDeleteForm = (props) => {

  const { closeEvent, count, deleteResource, resourceName, resource, theme } = props
  const [isDeleting, setIsDeleting] = useState(false)
  const buttonClasses = ['button', 'filled', 'reversed', isDeleting && 'loading'].join(' button--')

  const handleDeleteResource = (e) => {
    e.preventDefault()
    setIsDeleting(true)
    deleteResource(resource)
  }

  const newsArticle = count === 1 ? theme.localisation.newsArticle.lower : pluralize(theme.localisation.newsArticle.lower)

  return (
    <form className="cms-form" onSubmit={handleDeleteResource} >
      <div>
        <div className="cms-form__control">
          <div>
            <p>
              This { resourceName } has {count} {theme.localisation.news.lower} {newsArticle} assigned to it!
            </p>
            <p>Are you sure you want to delete the { resourceName.toLowerCase() } <strong>{ resource.name }</strong>?</p>
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

export default NewsCategoryDeleteForm
