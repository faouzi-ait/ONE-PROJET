import React from 'react'

import meetingsClientVariables from 'javascript/views/meetings/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

import FormControl from 'javascript/components/form-control'
import Icon from 'javascript/components/icon'

const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

class NewAttendee extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: props.resource['meeting-attendees'].filter(a => (a.status && a.status.toLowerCase() === 'unregistered') || !a.id).length ? props.resource['meeting-attendees'] : [],
      errors: {}
    }
  }

  validate = () => {
    const errors = {}
    let count = 0
    this.state.users.forEach((u,i) => {
      if (u.id) {
        return false
      }
      errors[i] = {}
      if (!u['first-name'].length) {
        errors[i].first = "Please provide a first name"
        count ++
      }
      if (!u['first-name'].length) {
        errors[i].last = "Please provide a last name"
        count ++
      }
      if (!u['company'].length) {
        errors[i].company = "Please provide a company name"
        count ++
      }
      if (!u['job-title'].length) {
        errors[i].role = "Please provide a role"
        count ++
      }
      if (!u['email'].length || !emailRegex.test(u['email'])) {
        errors[i].email = "Please provide a valid email"
        count ++
      }
    })
    if (count < 1) {
      this.setState({
        errors: {}
      }, () => {
        this.props.assignAttendees(this.state.users)
      })
    } else {
      this.setState({
        errors
      })
    }
  }
  render() {
    const { meetingsCV } = this.props
    const { users, errors } = this.state
    return (
      <div className={meetingsCV.modalClasses}>
        <div className="modal__header modal__header--with-action">
          <h3 className="heading--two modal__title">Add New Attendees</h3>
          {users.filter(u => (u.status && u.status.toLowerCase() === 'unregistered') || !u.id).length > 0 &&
            <button className={meetingsCV.addAttendeesButtonClasses} onClick={this.validate}>
              <span className="button__count">{users.filter(u => (u.status && u.status.toLowerCase() === 'unregistered') || !u.id).length}</span>Assign new attendees
            </button>
          }
        </div>
        <button className="modal__close" type="button" onClick={ this.props.closeEvent }>
          <Icon id="i-close" />
          Close
        </button>
        <div className="modal__content modal__content--wide">
          <div>
            {users.map((u,i) => {
              if ((u.status && u.status.toLowerCase() !== 'unregistered') || (u.id && u.type !== 'meeting-attendees')) {
                return null
              } else {
                return (
                  <div className="form__group" key={i}>
                    <FormControl  type="text" required value={u['first-name']}
                                error={errors[i] ? errors[i].first : null}
                                label="First Name" onChange={e => {
                                  users[i]['first-name'] = e.target.value
                                  this.setState({ users })
                                }}/>

                    <FormControl  type="text" required value={u['last-name']}
                                  error={errors[i] ? errors[i].last : null}
                                  label="Last Name" onChange={e => {
                                    users[i]['last-name'] = e.target.value
                                    this.setState({ users })
                                  }}/>

                    <FormControl  type="text" required value={u['company']}
                                  error={errors[i] ? errors[i].company : null}
                                  label="Company" onChange={e => {
                                    users[i]['company'] = e.target.value
                                    this.setState({ users })
                                  }}/>

                    <FormControl  type="text" required value={u['job-title']}
                                  error={errors[i] ? errors[i].role : null}
                                  label="Role" onChange={e => {
                                    users[i]['job-title'] = e.target.value
                                    this.setState({ users })
                                  }}/>

                    <FormControl  type="email" required value={u['email']}
                                  error={errors[i] ? errors[i].email : null}
                                  disabled={!!u['id']}
                                  label="Email" onChange={e => {
                                    users[i]['email'] = e.target.value
                                    this.setState({ users })
                                  }}/>
                    <button className="delete" onClick={() => {
                      this.setState({
                        users: users.filter((u,j) => j!== i)
                      })
                    }}>
                      <Icon id="i-close" classes="delete__icon"/>
                    </button>
                  </div>
                )
              }
            })}
          </div>
          <div className="form__control form__control--bordered">
            <button className="button button--small" onClick={() => {
              this.setState({
                users: [...users, {
                  'first-name': '',
                  'last-name': '',
                  'company': '',
                  'job-title': '',
                  'email': '',
                  'status': 'Unregistered',
                  'vip': false,
                  'send-virtual-meeting-email': this.props.theme.features.users.meetings.virtual,
                }]
              })
            }}>Add a new attendee</button>
          </div>
        </div>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('meetingsCV', meetingsClientVariables)
)

export default enhance(NewAttendee)