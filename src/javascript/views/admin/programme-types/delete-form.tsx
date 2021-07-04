import React, { useState } from 'react'
import pluralize from 'pluralize'
import withTheme from 'javascript/utils/theme/withTheme'

import Button from 'javascript/components/button'
import { removeBlacklistedResourceKeys } from 'javascript/views/admin/programme-types/index'

const infoString = (count, description) => {
  if (count === 0) return ''
  return `${count} ${count === 1 ? description : pluralize(description)}`
}

const ProgrammeTypesDeleteForm = (props) => {

  const { closeEvent, deleteResource, resource, theme } = props

  const programmeTypeStr = theme.localisation.programmeType.upper
  const programmeStr = theme.localisation.programme.lower

  const [isDeleting, setIsDeleting] = useState(false)
  const buttonClasses = ['button', 'filled', 'reversed', isDeleting && 'loading'].join(' button--')

  const handleDeleteResource = (e) => {
    e.preventDefault()
    setIsDeleting(true)
    const update = removeBlacklistedResourceKeys(resource)
    deleteResource(update)
  }

  const userCount = resource['users-count']
  const programmeCount = resource['programmes-count']

  let warningInfo = infoString(userCount, 'user')
  if (programmeCount) {
    if (warningInfo.length) {
      warningInfo += ' and '
    }
    warningInfo = infoString(programmeCount, programmeStr)
  }

  return (
    <form className="cms-form" onSubmit={handleDeleteResource} >
      <div>
        <div className="cms-form__control">
          <div>
            <p>
              This { programmeTypeStr } has {warningInfo} assigned to it!
            </p>
            <p>Are you sure you want to delete the { programmeTypeStr } <strong>{ resource.name }</strong>?</p>
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

export default withTheme(ProgrammeTypesDeleteForm)
