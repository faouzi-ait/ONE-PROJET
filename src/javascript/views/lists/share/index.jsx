import React from 'react'
import Select from 'react-select'
import FormControl from 'javascript/components/form-control'
import Checkbox from 'javascript/components/custom-checkbox'
import UserService from 'javascript/services/users'
import ListShareActions from 'javascript/actions/list-shares'
import ListSharesStore from 'javascript/stores/list-shares'

import withTheme from 'javascript/utils/theme/withTheme'
import shareClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import user from 'javascript/views/reporting/user'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

class ShareList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: props.list,
      users: [],
      selectedUsers: [],
      authorizedUsers: [],
      emails: '',
      authorizedEmails: [],
      message: '',
      step: 1,
      errors: props.errors
    }
  }

  componentWillMount() {
    ListSharesStore.on('error', this.retrieveErrors)
  }

  componentWillUnmount() {
    ListSharesStore.removeListener('error', this.retrieveErrors)
  }

  setUser = selectedUsers => {
    this.setState({
      selectedUsers,
    })
  }

  updateNotes = e => {
    this.setState({
      message: e.currentTarget.value,
    })
  }

  updateEmails = e => {
    this.setState({
      emails: e.currentTarget.value,
    })
  }

  updateStep = (step) => {
    this.setState({
      step
    })
  }

  updateAuthorizedEmails = (e, email) => {
    const update = this.state.authorizedEmails
    if(e.target.checked){
      update.push(email)
    } else {
      update.splice(email, 1)
    }
    this.setState({
      authorizedEmails: update
    })
  }

  updateAuthorizedUsers = (e, user) => {
    let update = this.state.authorizedUsers
    if(e.target.checked){
      update.push(user)
    } else {
      update = update.filter(m => m.value !== user.value)
    }
    this.setState({
      authorizedUsers: update
    })
  }

  shareList = e => {
    e.preventDefault()
    const {emails, selectedUsers, authorizedEmails, message, authorizedUsers} = this.state
    if (selectedUsers || emails.length > 0) {
      this.setState({ loading: true })
      const update = {
        list: this.props.list,
        users: selectedUsers.filter(e => !authorizedUsers.includes(e)).map(s => {return {id: s.value}}),
        'authorized-users': authorizedUsers.filter(e => selectedUsers.includes(e)).map(s => {return {id: s.value}}),
        'email-addresses': emails.replace(/\s/g,'').split(',').filter(Boolean).filter(e => !authorizedEmails.includes(e)),
        'authorized-email-addresses': authorizedEmails.filter(e => emails.replace(/\s/g,'').split(',').includes(e)),
        message,
      }
      ListShareActions.createResource(update)
    }
  }

  retrieveErrors = () => {
    const errors = ListSharesStore.getErrors()
    if(errors.data){
      errors['data']?.['invalid_emails']?.map(e => {
        errors[e] = '- email address is invalid'
      })
      delete errors['list-share-emails']
      delete errors['data']
    }
    this.setState(() => ({
      loading: false,
      errors
    }))
  }

  renderErrors = () => {
    if (this.state.errors) {
      return (
        <ul className="form__errors">
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return (
              <li className="form__error" key={i}>{key} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  createSelectOptions = userList => {
    let accounManagerId = null
    const myselfId = this.props.user.id

    let users = [
      {
        label: 'Share with myself',
        value: myselfId,
        id: myselfId,
      },
    ]

    if (this.props.theme.features.accountManager) {
      if (this.props.user['account-manager']) {
        users.push({
          label: this.props.theme.localisation.accountManager.upper,
          value: this.props.user['account-manager'].id,
          id: this.props.user['account-manager'].id,
        })
        accounManagerId = this.props.user['account-manager'].id
      }
    }
    return userList.reduce((acc, user) => {
      if (user.id !== myselfId && user.id !== accounManagerId) {
        acc.push({
          label: `${user['first-name']} ${user['last-name']} - ${user.company?.name}`,
          value: user.id,
        })
      }
      return acc
    }, users)
  }

  searchForUser = (input, callBack) => {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      UserService.search(
        {
          include: 'company',
          fields: {
            users: 'first-name,last-name,company',
            companies: 'name'
          },
          page: {
            size: 200
          },
          sort: 'first-name',
          filter: {
            'choices-for': 'list-shared-by',
            search: input,
          },
        },
        response => {
          const options = this.createSelectOptions(response)
          callBack(null, { options })
        },
      )
    }, 300)
  }

  renderUserSelection = () => {
    const {shareVariablesCV} = this.props
    return (
      <>
        <FormControl label="Users">
          <Select.Async
            onChange={this.setUser}
            value={this.state.selectedUsers}
            placeholder="Search for a user..."
            loadOptions={this.searchForUser}
            multi={true}
            autoLoad={false}
            />
        </FormControl>
        <div className="form__control">
          <label className="form__label">External Email Addresses</label>
          <input
            className="form__input"
            type="text"
            onChange={this.updateEmails}
            value={this.state.emails}
            name="emails"
            />
          <p className="form__info">
            comma separated list e.g. John@hello.com, Jane@hello.com
          </p>
        </div>
        <FormControl
        label="Message"
        type="textarea"
        onChange={this.updateNotes}
        value={this.state.message}
        />

        <div class="form__control form__control--actions">
          <button type="button" className={shareVariablesCV.primaryButtonClasses} onClick={()=>this.updateStep(2)}
          disabled={this.state.selectedUsers.length === 0 && !this.state.emails}>Continue</button>
        </div>
      </>
    )
  }

  findProgrammeName = (r) => {
    const { data } = this.state.list?.['list-elements']?.find(({ data }) => data.id === r.id && data.type === r.type) || []
    if (data) {
      return data.attributes['programme-name']
    }
  }

  renderListItem = {
    'list-programmes': (r) => {
      return (
        <tr>
          <td>{r.programme?.title}</td>
          <td>{r.programme?.restricted && <span className="tag tag--unregistered">Restricted</span>}</td>
        </tr>
      )
    },
    'list-series': (r) => {
      return (
        <tr>
          <td>
            {r.series?.name}<br />
            {r.series?.programme?.title}
          </td>
          <td>{r.series?.restricted && <span className="tag tag--unregistered">Restricted</span>}</td>
        </tr>
      )
    },
    'list-videos': (r) => {
      return (
        <tr>
          <td>
            {r.video?.name}<br />
            {r.video?.parent?.type === 'programme' ? r.video?.parent?.name : this.findProgrammeName(r)}
          </td>
          <td>{r.video?.restricted && <span className="tag tag--unregistered">Restricted</span>}</td>
        </tr>
      )
    }
  }

  canGrantAccess = () => {
    const {user} = this.props
    return (isAdmin(user) ||
    hasPermission(user, ['extend_permissions']) ||
    hasPermission(user, ['manage_programmes']) ||
    hasPermission(user, ['manage_video_permissions']))
  }

  renderConfirmation = () => {
    const {shareVariablesCV, theme} = this.props
    const classes = this.state.loading ? shareVariablesCV.loadingButtonClasses : shareVariablesCV.primaryButtonClasses
    const listItems = [...this.props.list['list-programmes'], ...this.props.list['list-series'], ...this.props.list['list-videos']]
    return (
      <>
      <div className="grid grid--full grid--two">
        <>
          <div className="form__control form__control--full-width">
            <label className="form__label">{`${theme.localisation.list.upper} Items (${this.props.listCount})`}</label>
            <div className="table__scroll-wrapper">
              <table className="table">
                {listItems.sort((a, b) => a['list-position'] - b['list-position']).map((r) => {
                  return this.renderListItem[r.type](r)
                })}
              </table>
            </div>
          </div>
        </>
        <div>
          {this.state.selectedUsers.length === 0 && !this.state.emails &&
            <p className="form__info">{`You have no users selected. To share a ${theme.localisation.list.lower}, go back and select some users or email addresses.`}</p>
          }
          {this.state.selectedUsers.length > 0 &&
            <div className="form__control form__control--full-width">
              <label className="form__label">Users</label>
              {this.canGrantAccess() &&
                <p className="form__info">{`If selected, the following users will be granted permission to all items within this ${theme.localisation.list.lower}.`}</p>
              }
              <div className="table__scroll-wrapper table__scroll-wrapper--half">
                <table className="table">
                  {this.state.selectedUsers.map((u, i) => {
                    return (
                      <tr>
                        <td>{u.label}</td>
                        {this.canGrantAccess() &&
                          <td width="40px">
                            {this.props.user.id !== u.id &&
                              <Checkbox
                                labeless={true}
                                id={`select-user-${i}`}
                                checked={this.state.authorizedUsers.filter(p => p.value === u.value).length > 0}
                                onChange={(e)=>this.updateAuthorizedUsers(e, u)}
                              />
                            }
                          </td>
                        }
                      </tr>
                    )
                  })}
                </table>
              </div>
            </div>
          }
          {this.state.emails &&
            <div className="form__control form__control--full-width">
              <label className="form__label">External Email Addresses</label>
              {this.canGrantAccess() &&
                <p className="form__info">{`If selected, the following email addresses will be granted anonymous access to all items within this ${theme.localisation.list.lower} via email.`}</p>
              }
              <div className="table__scroll-wrapper table__scroll-wrapper--half">
                <table className="table">
                  {this.state.emails.split(',').map((email, i) => {
                    return (
                      <tr>
                        <td>{email}</td>
                        {this.canGrantAccess() &&
                          <td width="40px">
                            <Checkbox
                              labeless={true}
                              id={`select-email-${i}`}
                              checked={this.state.authorizedEmails.includes(email)}
                              onChange={(e)=>this.updateAuthorizedEmails(e, email)}
                            />
                          </td>
                        }
                      </tr>
                    )
                  })}
                </table>
              </div>
            </div>
          }
        </div>
      </div>
      {this.renderErrors()}
        <div class="form__control form__control--actions">
          <button type="button" className={shareVariablesCV.secondaryButtonClasses} onClick={()=>this.updateStep(1)}>Back</button>
          <button type="submit" className={classes} disabled={this.state.selectedUsers.length === 0 && !this.state.emails}>Share</button>
        </div>
      </>
    )
  }

  render() {
    return (
      <form ref="form" onSubmit={this.shareList} className={`form ${this.state.step === 1 ? 'form--skinny' : ''}`}>
        {this.state.step === 1 && this.renderUserSelection()}
        {this.state.step === 2 && this.renderConfirmation()}
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('shareVariablesCV', shareClientVariables),
)

export default enhance(ShareList)
