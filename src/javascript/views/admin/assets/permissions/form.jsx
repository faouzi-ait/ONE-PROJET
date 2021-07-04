import React, { useState } from 'react'
import pluralize from 'pluralize'

import 'stylesheets/admin/components/permissions-header'
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import { query, updateOneByModel, createOneByModel } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'

// Actions
import AssetMaterialActions from 'javascript/actions/asset-materials'

// Stores
import AssetMaterialStore from 'javascript/stores/asset-materials'

// Components
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import Tabs from 'javascript/components/tabs'
import { PermissionExpiryMultipleAssets } from 'javascript/components/permissions/permission-expiry'
import { AnimateInListItem, PermissionResource, PermissionTitle } from 'javascript/components/permissions/permissions-tab'


class AssetPermissionsFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mixedPermissions: true,
      restrictedCompanies: [],
      restrictedGroups: [],
      restrictedUsers: [],
      saved: 0,
      userHasGroups: false,
    }
  }

  updateInput = ({ target }) => {
    this.getResources(target.name, target.value)
  }

  componentWillMount() {
    AssetMaterialStore.on('save', this.resourcesSaved)
  }

  componentWillUnmount() {
    AssetMaterialStore.removeListener('save', this.resourcesSaved)
  }

  resourceCount = (saved = 0) => () => {
    saved++
    this.setState({ saved })
    if (saved >= this.props.resources.length) {
      this.saveExpirationDates()
      .then((response) => {
        this.props.update(this.state)
      })
    }
  }
  resourcesSaved = this.resourceCount()

  componentDidMount() {
    const { theme, user, resources } = this.props
    const userHasGroups = !!(theme.features.groups.enabled && (isAdmin(user) || hasPermission(user, ['manage_groups'])))
    if (resources.length <= 0) { return }
    const compareRestrictions = [ 'restricted-users', 'restricted-companies']
    if (userHasGroups) {
      compareRestrictions.push('restricted-groups')
    }
    const mixedPermissions = this.comparePermissions(resources, ...compareRestrictions)
    const allUserPermissions = []
    const allCompanyPermissions = []
    const allGroupPermissions = []
    const assetIds = []

    // find permissions that exist on ALL of the selected resources
    resources.forEach((r) => {
      assetIds.push(r.id)
      allUserPermissions.push(...r[ 'restricted-users' ])
      allCompanyPermissions.push(...r[ 'restricted-companies' ])
      if (userHasGroups) {
        allGroupPermissions.push(...r[ 'restricted-groups' ])
      }
    })

    const findAllSharedDuplicates = (allPermissions) => {
      const sharedPermissions = []
      allPermissions.forEach((permission) => {
        // select perms that have a duplicate (i.e. exists in more than 1 resource)
        const duplicatePermissions = allPermissions.filter(_permission => _permission.id === permission.id)
        // select those that exist in ALL selected resources and are not already in the set
        if (duplicatePermissions.length === resources.length && !sharedPermissions.find(sharedPermission => permission.id === sharedPermission.id)) {
          sharedPermissions.push(permission)
        }
      })
      return sharedPermissions
    }

    Promise.all([
      this.addExpirationDates('companies', assetIds, findAllSharedDuplicates(allCompanyPermissions)),
      this.addExpirationDates('groups', assetIds, findAllSharedDuplicates(allGroupPermissions)),
      this.addExpirationDates('users', assetIds, findAllSharedDuplicates(allUserPermissions)),
    ])
    .then((responses) => {
      this.setState({
        mixedPermissions,
        restrictedCompanies: responses[0],
        restrictedGroups: responses[1],
        restrictedUsers: responses[2],
        userHasGroups,
      })
    })
  }

  addExpirationDates = (permissionType, assetIds, sharedPermissions) => new Promise((resolve, reject) => {
    if (!this.props.theme.features.restrictions.expiring || sharedPermissions.length === 0) {
      return resolve(sharedPermissions)
    }
    const restrictedType = `restricted-${pluralize.singular(permissionType)}`
    const type = `restricted-asset-material-${permissionType}`
    query(type, type, {
      include: [restrictedType],
      fields: ['expires-after', restrictedType],
      includeFields: {
        users: ['first-name', 'last-name'],
        companies: ['name'],
        groups: ['name'],
      },
      filter: {
        'restricted-asset-material': assetIds.join(','),
        [restrictedType]: sharedPermissions.map(p => p.id).join(',')
      },
    })
    .then((response) => {
      const retValue = sharedPermissions.map((permission) => {
        const allRestricted = response.filter((p) => p[restrictedType].id === permission.id)
        return {
          ...permission,
          [type]: allRestricted
        }
      })
      return resolve(retValue)
    })
  })

  selectResource = (resourceAlias, resource) => () => {
    const resourceName = {
      restrictedCompanies: 'company',
      restrictedGroups: 'group',
      restrictedUsers: 'user',
    }

    this.setState((state) => {
      const selectedResources = [ ...state[ resourceAlias ] ]
      const selectedIndex = selectedResources.findIndex(d => d.id === resource.id)
      if (selectedIndex <= -1) {
        selectedResources.push(resource)
      } else {
        selectedResources.splice(selectedIndex, 1)
      }
      return {
        [ resourceAlias ]: selectedResources
      }
    }, () => {
      const allValues = this.props[`${resourceName[resourceAlias]}Resources`]
        .concat([resource]) // could be a remove action so add resource, duplicates will get filtered out
        .sort(sortByName)
      const type = pluralize(resourceName[resourceAlias])
      const currentlySelected = this.state[resourceAlias]
      this.props.setFilteredResource(type, currentlySelected, allValues)
    })
  }

  expiryDateUpdated = (resourceAlias, resource) => {
    this.setState((state) => {
      const selectedResources = [ ...state[ resourceAlias ] ]
      const selectedIndex = selectedResources.findIndex(d => d.id === resource.id)
      selectedResources[selectedIndex] = resource
      return {
        [ resourceAlias ]: selectedResources
      }
    })
  }

  comparePermissions = (resources, ...resourceTypes) => {
    const makeIdType = (permissionType) => (i) => [ permissionType, i.id ].join('')
    const createHash = (resource) => resourceTypes.map(
      type => resource[type].map(makeIdType(type)).join('')
    ).join('')
    const firstHash = createHash(resources[ 0 ])
    return [ ...resources ].splice(1).some(r => createHash(r) !== firstHash)
  }

  getResources = (queryType, searchValue) => {
    const searchFuncs = {
      'companyResources': () => {
        this.props.searchApi('companies', 'companies', {
          fields: ['name'],
          filter: {
            search: searchValue
          },
          sort: 'name'
        }, this.state.restrictedCompanies)
      },
      'groupResources': () => {
        this.props.searchApi('groups', 'groups', {
          fields: ['name'],
          filter: {
            search: searchValue
          },
          sort: 'name'
        }, this.state.restrictedGroups)
      },
      'userResources': () => {
        this.props.searchApi('users', 'users', {
          fields: ['first-name', 'last-name', 'company-name'],
          filter: {
            search: searchValue
          },
          sort: 'first-name'
        }, this.state.restrictedUsers)
      }
    }
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(searchFuncs[queryType], 500)
  }

  onSubmit = e => {
    e.preventDefault()
    const removeKeyBeforeSaving = (resources = [], keyToRemove) => {
      return resources.map((resource) => {
        const update = {...resource}
        delete update[keyToRemove]
        return update
      })
    }
    const restrictedUsers = removeKeyBeforeSaving(this.state.restrictedUsers, 'restricted-asset-material-users')
    const restrictedCompanies = removeKeyBeforeSaving(this.state.restrictedCompanies, 'restricted-asset-material-companies')
    const restrictedGroups = removeKeyBeforeSaving(this.state.restrictedGroups, 'restricted-asset-material-groups')
    this.props.resources.map((r, i) => {
      setTimeout(() => {
        const resourceUpdate = {
          'id': r.id,
          'restricted-users': restrictedUsers,
          'restricted-companies': restrictedCompanies,
        }
        if (this.state.userHasGroups) {
          resourceUpdate['restricted-groups'] = restrictedGroups
        }
        AssetMaterialActions.saveResource(resourceUpdate)
      }, i * 20)
    })
  }

  saveExpirationDates = () => new Promise(async (resolveSaveExpirationDates) => {
    if (!this.props.theme.features.restrictions.expiring) {
      return resolveSaveExpirationDates('No need to save expiration dates')
    }

    const getIdsForNewlyCreatedResources = (newResources, type, parentType) => new Promise((resolve, reject) => {
      const parentIds = newResources.map(r => r[parentType].id).join(',')
      const assetMaterialIds = newResources.map(r => r['restricted-asset-material'].id).join(',')
      query(type, type, {
        fields: ['id', 'restricted-asset-material', parentType],
        include: ['restricted-asset-material', parentType],
        includeFields: {
          users: ['id'],
          companies: ['id'],
          groups: ['id'],
          'asset-materials': ['id'],
        },
        filter: {
          [parentType]: parentIds,
          'restricted-asset-material': assetMaterialIds
        },
      })
      .then((response) => {
        const newResourcesWithIds = newResources.map((newResource) => {
          const responseItem = response.find((ncr) => (
            ncr[parentType].id === newResource[parentType].id &&
            ncr['restricted-asset-material'].id === newResource['restricted-asset-material'].id)
          )
          const update = {
            ...newResource,
            id: responseItem.id
          }
          delete update[parentType]
          delete update['restricted-asset-material']
          return update
        })
        resolve(newResourcesWithIds)
      })
    })

    const extractRestrictedAssetMaterialResources = (parentResources, type, parentType) => {
      return new Promise(async (resolve) => {
        const extractedResources = []
        const extractedResourcesForCreating = []
        parentResources.forEach((parentResource) => {
          parentResource[type]?.forEach((restrictedAssetMaterialResource) => {
            const updateObj = {
              'expires-after': restrictedAssetMaterialResource['expires-after'],
              type: restrictedAssetMaterialResource.type,
            }
            if (restrictedAssetMaterialResource.id) {
              updateObj['id'] = restrictedAssetMaterialResource.id
              extractedResources.push(updateObj)
            } else {
              this.props.resources.map((eachAsset) => {
                const assetUpdateObj = {...updateObj}
                assetUpdateObj[parentType] = { id: parentResource.id }
                assetUpdateObj['restricted-asset-material'] = { id: eachAsset.id }
                extractedResourcesForCreating.push(assetUpdateObj)
              })
            }
          })
        })

        if (extractedResourcesForCreating.length) {
          const createResourcesWithIds = await getIdsForNewlyCreatedResources(extractedResourcesForCreating, type, parentType)
          return resolve(extractedResources.concat(createResourcesWithIds))
        }
        return resolve(extractedResources)
      })
    }

    const saveAllRestrictions = (restrictions, modelType) => {
      return new Promise((saveAllResolved) => {
        const allSaveRequests = restrictions.map((restriction, i) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              updateOneByModel(modelType, restriction)
              .then(resolve)
            }, i  * 30)
          })
        })
        Promise.all(allSaveRequests)
        .then(() => saveAllResolved())
      })
    }

    const { restrictedUsers, restrictedCompanies, restrictedGroups } = this.state
    const restrictedAssetMaterialUsers = await extractRestrictedAssetMaterialResources(restrictedUsers, 'restricted-asset-material-users', 'restricted-user')
    await saveAllRestrictions(restrictedAssetMaterialUsers, 'restricted-asset-material-user')
    const restrictedAssetMaterialCompanies = await extractRestrictedAssetMaterialResources(restrictedCompanies, 'restricted-asset-material-companies', 'restricted-company')
    await saveAllRestrictions(restrictedAssetMaterialCompanies, 'restricted-asset-material-company')
    if (this.state.userHasGroups) {
      const restrictedAssetMaterialGroups = await extractRestrictedAssetMaterialResources(restrictedGroups, 'restricted-asset-material-groups', 'restricted-group')
      await saveAllRestrictions(restrictedAssetMaterialGroups, 'restricted-asset-material-group')
    }
    return resolveSaveExpirationDates('expiration dates all saved')
  })

  getResourceImage = (resource) => {
    if (resource[ 'asset-items' ].length <= 0) {
      return ProgrammePlaceholder
    }
    return resource[ 'asset-items' ][ 0 ].file.thumb.url || ProgrammePlaceholder
  }

  renderHeader = () => {
    /* #region  banijaygroup */
    const self = this
    /* #endregion */
    const { programme, resources, theme } = this.props
    const { mixedPermissions } = this.state
    return function (resource) {
      return (resources.length === 1) ? (
        <div className="permissions-header">
          <div>

            /* #region  ae | all3 | amc | cineflix | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
            <img src={resource[ 'asset-items' ][ 0 ].file.thumb.url || ProgrammePlaceholder} className="permissions-header__media" />
            /* #endregion */
            /* #region  banijaygroup */
            <img src={self.getResourceImage(resource)} className="permissions-header__media" />
          /* #endregion */

          </div>
          <div>
            <h3 className="permissions-header__title">{programme.title}</h3>
            {resource.name &&
              <p className="permissions-header__copy">{resource.name}</p>
            }
            {resource[ 'asset-items' ].length > 0 &&
              <p className="permissions-header__copy">{resource[ 'asset-items' ][ 0 ][ 'file-identifier' ]}</p>
            }
          </div>
        </div>
      ) : (
          <div className="permissions-header">
            <div className="permissions-header__images">
              {[ ...resources ].splice(0, 4).map(i => (

                /* #region  ae | all3 | amc | cineflix | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
                <div key={i.id} className="permissions-header__image" style={{ backgroundImage: `url(${i[ 'asset-items' ][ 0 ].file.thumb.url || ProgrammePlaceholder})` }} />
                /* #endregion */
                /* #region  banijaygroup */
                <div key={i.id} className="permissions-header__image" style={{ backgroundImage: `url(${self.getResourceImage(i)})` }} />
                /* #endregion */

              ))}
            </div>
            <div>
              <h3 className="permissions-header__title">{programme.title}</h3>
              <p className="permissions-header__copy">{resources.length} Assets</p>
              {mixedPermissions &&
                <div>
                  <p className="permissions-header__copy permissions-header__copy--warning">{
                    `Files have mixed access ${theme.features.restrictions.expiring ? '/ expiration dates' : ''}`
                  }</p>
                  <p className="permissions-header__copy">(note, changing access type will apply across ALL files and cannot be undone).</p>
                </div>
              }
            </div>
          </div>
        )
    }(resources[ 0 ])
  }

  renderResources = (resources, resourceAlias, restrictedResourceType) => resources.map((resource, i) => {
    const name = resource.name || `${resource[ 'first-name' ]} ${resource[ 'last-name' ]}`
    const itemChecked = this.state[ resourceAlias ].some(d => d.id === resource.id)
    return (
      <AnimateInListItem className="permissions-list__item" key={resource.id}>
        <PermissionResource
          hasExpiryDate={this.props.theme.features.restrictions.expiring}
        >
          <CustomCheckbox labeless={true} id={resource.id} onChange={this.selectResource(resourceAlias, resource)} checked={itemChecked} />
          <PermissionTitle>
            {name}{resource[ 'company-name' ] && ` | ${resource[ 'company-name' ]}`}
          </PermissionTitle>
        </PermissionResource>
        { this.props.theme.features.restrictions.expiring && itemChecked && (
          <PermissionExpiryMultipleAssets
            resource={resource}
            type={restrictedResourceType}
            expiryDateUpdated={(update) => this.expiryDateUpdated(resourceAlias, update)}
            setMixedAssets={(newState) => {
              this.setState({
                mixedPermissions: newState
              })
            }}
          />
        )}
      </AnimateInListItem>
    )
  })

  render() {
    return (
      <form className="cms-form" onSubmit={this.onSubmit}>
        {this.renderHeader()}
        <div className="permissions-list">
          <Tabs>
            <div title="Users">
              <div className="container">
                <div className="cms-form__control">
                  <input type="text" className="cms-form__input"
                    autoComplete="off"
                    placeholder="Search for individual users"
                    onChange={this.updateInput}
                    name="userResources"
                  />
                </div>
              </div>
              <ul className="permissions-list__list">
                {this.renderResources(this.state.restrictedUsers, 'restrictedUsers', 'restricted-asset-material-users')}
                {this.renderResources(this.props.userResources, 'restrictedUsers', 'restricted-asset-material-users')}
              </ul>
            </div>
            <div title="Companies">
              <div className="container">
                <div className="cms-form__control">
                  <input type="text" className="cms-form__input"
                    autoComplete="off"
                    placeholder="Search for companies"
                    onChange={this.updateInput}
                    name="companyResources"
                  />
                </div>
              </div>
              <ul className="permissions-list__list">
                {this.renderResources(this.state.restrictedCompanies, 'restrictedCompanies', 'restricted-asset-material-companies')}
                {this.renderResources(this.props.companyResources, 'restrictedCompanies', 'restricted-asset-material-companies')}
              </ul>
            </div>
            { this.state.userHasGroups && (
              <div title="Groups">
                <div className="container">
                  <div className="cms-form__control">
                    <input type="text" autoComplete="off" placeholder="Search for groups"
                      onChange={this.updateInput}
                      name="groupResources"
                      className="cms-form__input"
                    />
                  </div>
                </div>
                <ul className="permissions-list__list">
                  {this.renderResources(this.state.restrictedGroups, 'restrictedGroups', 'restricted-asset-material-groups')}
                  {this.renderResources(this.props.groupResources, 'restrictedGroups', 'restricted-asset-material-groups')}
                </ul>
              </div>
            )}
          </Tabs>
        </div>
        <div className="cms-form__control cms-form__control--actions">
          <Button className="button" type="button" onClick={this.props.closeEvent}>Cancel</Button>
          <Button type="submit" className={[ 'button', 'filled', this.state.saved > 0 && 'loading' ].join(' button--')}>Save permissions</Button>
        </div>
      </form>
    )
  }
}

const enhance = compose(
  withTheme,
  withUser,
  withHooks((props) => {

    const [companyResources, setCompanyResources] = useState([])
    const [groupResources, setGroupResources] = useState([])
    const [userResources, setUserResources] = useState([])
    const setResources = {
      companies: setCompanyResources,
      groups: setGroupResources,
      users: setUserResources,
    }

    const removeAlreadySelected = (currentSelection, allValues) => (
      allValues.filter((resource) => (
        !currentSelection.some((currentItem) => currentItem.id === resource.id))
      )
    )

    const setFilteredResource = (type, currentSelection, allValues) => {
      setResources[type](removeAlreadySelected(currentSelection, allValues))
    }

    const searchApi = (url, type, queryParams, currentState) => {
      query(url, type, queryParams)
      .then(response => {
        setFilteredResource(type, currentState, response)
      })
    }

    return {
      ...props,
      companyResources,
      groupResources,
      searchApi,
      setFilteredResource,
      userResources,
    }
  })
)

const sortByName = (a, b) => {
  const sortField = a.name ? 'name' : 'first-name'
  return a[sortField].localeCompare(b[sortField])
}

export default enhance(AssetPermissionsFrom)