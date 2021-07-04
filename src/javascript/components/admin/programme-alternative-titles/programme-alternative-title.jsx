// React
import React from 'react'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import withPrefix from 'javascript/components/hoc/with-prefix'

class ProgrammeAlternativeTitle extends React.Component {

  render() {
    const { resource, editEvent, deleteEvent, newEvent, prefix } = this.props
    return (
      <table className={`${prefix}table`}>
        <thead>
          <tr className='with-action'>
            <th>{ resource.name }</th>
            <th className={`${prefix}table__actions`}>
              <ActionMenu name="Actions">
                <ActionMenuItem label="Edit" onClick={() => { editEvent(resource) } }/>
                <ActionMenuItem label="Delete" onClick={() => { deleteEvent(resource) } } />
                <ActionMenuItem label="Add New Child" onClick={() => { newEvent(resource) } } divide />
              </ActionMenu>
            </th>
          </tr>
        </thead>
        { this.props.children }
      </table>
    )
  }

}

export default withPrefix(ProgrammeAlternativeTitle)