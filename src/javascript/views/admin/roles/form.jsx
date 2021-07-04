import React from 'react'
import pluralize from 'pluralize'
import FormHelper from '../../form-helper'
import Store from '../../../stores/roles'
import Actions from '../../../actions/roles'
import Button from 'javascript/components/button'
import FormControl from '../../../components/form-control'
import Checkbox from '../../../components/custom-checkbox'
import { capitalize } from 'javascript/utils/generic-tools'
import withTheme from 'javascript/utils/theme/withTheme'

class RolesForm extends FormHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Role'
    this.state = {
      resource: props.resource,
      method: props.method,
      isAccountManager: props.resource && props.resource.name === 'account_manager'
    }
    delete this.state.resource.users
  }

  updatePermissions = (e) => {
    const permissions = this.state.resource['permissions']
    permissions[e.target.value] = e.target.checked
    this.setState({
      resource: {
        ...this.state.resource,
        'permissions': permissions
      }
    })
  }

  handleInputChange = (e) => {
    const update = this.state.resource
    update[e.target.name] = e.target.value.toLowerCase().replace(' ', '_')
    this.setState({
      resource: update
    })
  }

  renderPermissionCheckbox = (permission, label = false) => (
    <Checkbox
      id={permission}
      label={label || capitalize(permission.replace('manage_', '').replace(/_/g, ' '))}
      value={permission}
      onChange={this.updatePermissions}
      key={permission}
      checked={this.state.resource['permissions'][permission]} />
  )
  renderAvailablePermissions = () => {
    const { theme } = this.props
    return (
      <div>
        <h3>Users and Roles Management</h3>
        <div className="grid grid--two">
          {theme.features.users &&
            <>
              {this.renderPermissionCheckbox('manage_internal_users')}
              {this.renderPermissionCheckbox('manage_external_users')}
            </>
          }
          {this.renderPermissionCheckbox('manage_approvals', `${pluralize(theme.localisation?.approvals?.upper)}`)}
          {theme.features.users.meetings.enabled && this.renderPermissionCheckbox('manage_meetings', `${pluralize(theme.localisation?.meeting?.upper)}`)}
          {this.renderPermissionCheckbox('manage_groups')}
          {theme.features.users.meetings.events && this.renderPermissionCheckbox('manage_events', `${pluralize(theme.localisation?.events?.upper)}`)}
          {theme.features.users.anonymousAccess.enabled && this.renderPermissionCheckbox('manage_anonymous_access')}
          {this.renderPermissionCheckbox('manage_roles')}
          {this.renderPermissionCheckbox('manage_companies')}
          {theme.features.reporting &&
            <>
              {this.renderPermissionCheckbox('view_reporting_all_users')}
              {this.renderPermissionCheckbox('view_reporting_my_users')}
            </>
          }
          {this.renderPermissionCheckbox('manage_global_lists', `Global ${pluralize(theme.localisation?.list?.lower)}`)}

          {theme.features.users.impersonation && this.renderPermissionCheckbox('impersonate_users')}
          {(theme.features.territories.enabled || theme.features.territories.cms) && this.renderPermissionCheckbox('manage_territories')}
          {theme.features.regions.enabled && this.renderPermissionCheckbox('manage_regions', `${pluralize(theme.localisation?.region?.upper)}`)}
          {theme.features.producerHub && this.renderPermissionCheckbox('view_producer_hub')}
          {theme.features.teamMembers && this.renderPermissionCheckbox('manage_teams', `${pluralize(theme.localisation?.team?.upper)}`)}
        </div>
        <h3>Programme Management</h3>
        <div className="grid grid--two">
          {this.renderPermissionCheckbox('manage_programmes', `${pluralize(theme.localisation?.programme?.upper)}`)}
          {this.renderPermissionCheckbox('manage_programme_data_options', `${theme.localisation?.programme?.upper} data options`)}
          {this.renderPermissionCheckbox('manage_videos', `${pluralize(theme.localisation?.video?.upper)}`)}
          {(theme.features.dataImport.manual || theme.features.dataImport.scheduled.enabled || theme.features.dataImport.scheduled.edit) && this.renderPermissionCheckbox('manage_data_import')}
          {theme.features.customCatalogues.enabled && this.renderPermissionCheckbox('manage_catalogues', `${pluralize(theme.localisation?.customCatalogues?.upper)}`)}
        </div>
        <h3>Content Management</h3>
        <div className="grid grid--two">
          {this.renderPermissionCheckbox('manage_pages')}
          {this.renderPermissionCheckbox('manage_news', `${pluralize(theme.localisation?.news?.upper)}`)}
          {theme.features.talents && this.renderPermissionCheckbox('manage_talents', `${pluralize(theme.localisation?.talent?.upper)}`)}
        </div>
        { theme.features.passport.admin && (
            <>
              <h3>Passport Management</h3>
              <div className="grid grid--two">
                {this.renderPermissionCheckbox('manage_passport_admin', `${theme.localisation?.passport?.upper} admin`)}
                {this.renderPermissionCheckbox('manage_passport_trips', `${theme.localisation?.passport?.upper} trips`)}
              </div>
            </>
          )
        }
        {theme.features.assets &&
          <>
            <h3>Asset Management</h3>
            <div className="grid grid--two">
              {this.renderPermissionCheckbox('manage_assets', `${pluralize(theme.localisation?.asset?.upper)}`)}
            </div>
          </>
        }
        {theme.features.app.enabled &&
          <>
            <h3>App Management</h3>
            <div className="grid grid--two">
              {this.renderPermissionCheckbox('manage_highlights')}
            </div>
          </>
        }
        <h3>Permission Management</h3>
        <div className="grid grid--two">
          {this.renderPermissionCheckbox('copy_permissions')}
          {this.renderPermissionCheckbox('manage_asset_permissions')}
          {this.renderPermissionCheckbox('extend_permissions')}
        </div>        
        <h3>Feature Management</h3>
        {this.renderPermissionCheckbox('manage_configurations')}
      </div>
    )
  }

  renderForm = () => {
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <div>
        {!this.state.isAccountManager &&
          <FormControl type="text" name="name" label="Name" value={this.state.resource.name} required onChange={this.handleInputChange} />
        }
        <FormControl label="Users with this role are permitted to:" />
        {this.renderAvailablePermissions()}
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={buttonClasses}>Save {this.resourceName}</Button>
        </div>
      </div>
    )
  }
}

export default withTheme(RolesForm)