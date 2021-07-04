// React
import React from 'react'
import { capitalize } from 'javascript/utils/generic-tools'

class User extends React.Component {

  render() {
    let statusClasses = 'count'
    switch(this.props.status) {
      case 'pending': {
        statusClasses = 'count count--warning'
        break;
      }
      case 'approved': {
        statusClasses = 'count count--success'
        break;
      }
      case 'rejected': {
        statusClasses = 'count count--error'
        break;
      }
    }

    return (
      <tr className="with-action">
        <td>
          { this.props.name }
        </td>
        <td>{ this.props.company }</td>
        <td>
          { this.props.roles &&
            <ul>
              { this.props.roles.map((role, i) => { return <li key={i}>{ role.name.charAt(0).toUpperCase() + role.name.substring(1).replace(/_/g, ' ')  }</li> }) }
            </ul>
          }
        </td>
        <td>
          {this.props.suspended ?
            <span className="count count--error">Suspended</span>
          : this.props.status &&
            <span className={statusClasses}>{capitalize(this.props.status)}</span>
          }
        </td>
        {this.props.createdAt &&
          <td>{ this.props.createdAt }</td>
        }
        <td className="cms-table__actions">
          { this.props.children }
        </td>
      </tr>
    )
  }
}

export default User
