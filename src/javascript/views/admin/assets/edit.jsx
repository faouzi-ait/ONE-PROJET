import React from 'react'
import NavLink from 'javascript/components/nav-link'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Icon from 'javascript/components/icon'
import PageHeader from 'javascript/components/admin/layout/page-header'

import AssetMaterialActions from 'javascript/actions/asset-materials'
import AssetMaterialsStore from 'javascript/stores/asset-materials'
import CategoryStore from 'javascript/stores/asset-categories'
import CategoryActions from 'javascript/actions/asset-categories'
import LanguagesStore from 'javascript/stores/languages'
import LanguageActions from 'javascript/actions/languages'

import Form from 'javascript/views/admin/assets/form'

import pluralize from 'pluralize'
import Meta from 'react-document-meta'

export default class AssetManagementEdit extends PageHelper {

  constructor(props) {
    super(props)
    this.state = {
      resource: {
        title: ''
      }
    }
  }

  componentWillMount() {
    AssetMaterialsStore.on('singularChange', this.getResources)
    AssetMaterialsStore.on('save', this.redirect)
    CategoryStore.on('change', this.getResources)
    AssetMaterialsStore.on('refresh', this.refreshResource)
    LanguagesStore.on('change', this.getLanguages)
  }

  componentWillUnmount() {
    AssetMaterialsStore.removeListener('singularChange', this.getResources)
    AssetMaterialsStore.removeListener('save', this.redirect)
    CategoryStore.removeListener('change', this.getResources)
    AssetMaterialsStore.removeListener('refresh', this.refreshResource)
    LanguagesStore.removeListener('change', this.getLanguages)
  }

  componentDidMount() {
    AssetMaterialActions.getResource(this.props.match.params.id, {
      include: 'asset-category,parent,asset-items,languages',
      fields: {
        'asset-materials': 'name,gallery,asset-category,parent,asset-items,languages,restricted,public-asset',
        'asset-categories': 'name',
        'asset-items': 'file-type,file-size,file,file-identifier,external-file-url',
        'languages': 'name'
      }
    })
    CategoryActions.getResources({ fields: { 'asset-categories': 'id,name' } })
    LanguageActions.getResources({ fields: { languages: 'name' }, page: { size: 200 } })
  }

  refreshResource = () => {
    AssetMaterialActions.getResource(this.props.match.params.id, { include: 'asset-category,parent,asset-items' })
  }

  redirect = () => {
    this.props.history.push({ pathname: `/admin/${pluralize(this.props.theme.localisation.asset.lower)}/management`, state: this.props.location.state })
  }

  getLanguages = () => {
    this.setState({
      languages: LanguagesStore.getResources()
    })
  }

  getResources = () => {
    this.setState({
      resource: AssetMaterialsStore.getResource(),
      categories: CategoryStore.getResources()
    })

    if (this.state.resource && this.state.categories) {
      this.finishedLoading()
    }
  }

  render () {
    if (!this.state.resource) return null
    const { theme } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Manage ${this.state.resource.name}`}
        meta={{
          description: `Manage your ${theme.localisation.asset.lower}`
        }}>
        <PageLoader { ...this.state }>
          <main>
            <PageHeader title={ `Manage ${theme.localisation.asset.upper}` }>
              <NavLink className="button"
                to={{ pathname: `/admin/${pluralize(theme.localisation.asset.lower)}/management`, state: this.props.location.state }}
              >
                <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
                Back to { pluralize(theme.localisation.asset.lower) }
              </NavLink>
            </PageHeader>
            <Form resource={ this.state.resource }
              languages={this.state.languages}
              categories={ this.state.categories }
              refresh={ this.refreshResource }
              selection={ this.props.location.state }
            />
          </main>
        </PageLoader>
      </Meta>
    )
  }

}