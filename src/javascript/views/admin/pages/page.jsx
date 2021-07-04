import React from 'react'
import moment from 'moment'

// Stores
import Store from 'javascript/stores/pages'

// Actions
import Actions from 'javascript/actions/pages'

// Components
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import DatePicker from 'javascript/components/datepicker'
import FormControl from 'javascript/components/form-control'
import FormHelper from 'javascript/views/form-helper'
import Select from 'javascript/components/select'
import StaticPageForm from 'javascript/views/admin/pages/static-page-forms'

import withTheme from 'javascript/utils/theme/withTheme'

class PagesForm extends FormHelper {
  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.resourceName = 'Page'
    this.isStatic = props.resource?.hasOwnProperty('page-type') && props.resource['page-type'] !== 'generic'
    const resource = Object.assign({
      'title': '',
      'slug': '',
      'banner-text-color': '',
      'published': this.isStatic,
      'private-page': props['private-page'] || false,
      'show-in-collection': props['show-in-collection'] || true,
    }, props.resource)
    this.state = {
      resource: resource,
      method: props.method
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const isChildPage = !!this.state.resource.collection
    if (prevState.resource.collection !== this.state.resource.collection && isChildPage) {
      this.setState({
        resource: {
          ...this.state.resource,
          'show-in-footer': false,
          'show-in-featured-nav': false,
          'show-in-collection': true
        }
      })
    }
  }

  updateBool = (e) => {
    this.setState({
      resource: {
        ...this.state.resource,
        [e.target.name]: !this.state.resource[e.target.name]
      }
    })
  }

  handleCollectionChange = (collection) => {
    const update = collection.value ? collection : null
    this.setState({
      resource: {
        ...this.state.resource,
        collection: update
      }
    })
  }

  handleTitleChange = (e) => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    this.setState({
      resource: update
    })
  }

  handleSlugChange = (e) => {
    const update = this.state.resource
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '-')
    this.setState({
      resource: update
    })
  }

  handleDateChange = (value) => {
    const update = this.state.resource
    update['published-at'] = value ? moment(value).toDate().toString() : null
    this.setState({
      resource: update
    })
  }

  handleBannerChange = (e) => {
    this.setState({
      resource: {
        ...this.state.resource,
        'banner-text-color': e.target.value
      }
    })
  }

  renderCollections = () => {
    const { collections, method } = this.props
    if (!collections) return null

    const options = Object.values(collections).map(collection => ({
      ...collection,
      value: collection.title,
      label: collection.title
    }))
    const parent = options.find(opt => {
      if (this.state.resource.collection) {
        return opt.id === this.state.resource.collection.id
      }
    })
    if (parent) {
      options.unshift({
        value: null,
        label: 'No collection'
      })
    }
    return (
      <FormControl label="Collection">
        <Select options={ options } value={ parent } onChange={ this.handleCollectionChange } clearable={ false } />
      </FormControl>
    )
  }

  renderForm = () => {
    const { method, slug, resource, theme, staticPagesOnly } = this.props
    const restrictedPages = [theme.variables.SystemPages.home.lower, theme.features.producerHub && theme.variables.SystemPages.producerHub.path]
    const canBePrivatePages = [theme.variables.SystemPages.catalogue.path]
    const editableSystemPage = this.isStatic && !!this.props.resource.slug
    const isChildPage = !!this.state.resource.collection

    let date = this.state.resource['published-at']
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <div>
        { method === 'updateResource' &&
          <FormControl label="Page URL">
            { this.state.resource.collection ? (
                <span className="cms-form__copy"><a href={`/${this.state.resource.collection.slug}/${this.state.resource.slug}`} target="_blank">{window.location.origin}/{ this.state.resource.collection.slug }/{ this.state.resource.slug }</a></span>
              ) : (
                <span className="cms-form__copy"><a href={`/${this.state.resource.slug}`} target="_blank">{window.location.origin}/{ this.state.resource.slug }</a></span>
            )}
          </FormControl>
        }
        {restrictedPages.includes(this.props.resource.slug) || (this.isStatic && !editableSystemPage) ? (
          <FormControl label="Title">
            <p className="cms-form__copy">{ this.state.resource.title }</p>
          </FormControl>
        ) : (
          <div>
            { !this.isStatic && this.renderCollections() }
            <FormControl label="Title" type="text" name="title" value={ this.state.resource.title } required onChange={ this.handleTitleChange } />
          </div>
        )}
        <FormControl label="Slug">
          {restrictedPages.includes(this.props.resource.slug) || (this.isStatic && !editableSystemPage) ? (
              <p className="cms-form__copy">{ this.state.resource.slug }</p>
            ) : (
              <input type="text" name="slug" className="cms-form__input" value={this.state.resource.slug} required onChange={ this.handleSlugChange } />
            )
          }
        </FormControl>
        <FormControl type="textarea" name="introduction" label="Introduction" value={ this.state.resource.introduction } maxLength="255" onChange={ this.handleInputChange } />
        {!this.isStatic &&
          <>
            <FormControl label="Redirect url">
              <input type="text" name="redirect-url" className="cms-form__input" value={this.state.resource['redirect-url']} onChange={ this.handleInputChange } />
            </FormControl>
            <FormControl type="text" name="banner-text-color" label="Banner Text Color" value={ this.state.resource['banner-text-color'] } onChange={ this.handleBannerChange } />
            <FormControl label="Publish Date">
              <DatePicker isClearable={true} onChange={ this.handleDateChange } selected={ date } dateFormat={theme.features.formats.longDate} />
            </FormControl>
            <FormControl>
              <div className="cms-form__collection">
                <CustomCheckbox label="Published" id="published" name="published" onChange={ this.updateBool } checked={ this.state.resource.published } />
              </div>
            </FormControl>
          </>
        }
        {theme.features.pages.private && (!this.isStatic || canBePrivatePages.includes(this.state.resource.slug)) &&
          <FormControl>
            <div className="cms-form__collection">
              <CustomCheckbox label="Private" id="private-page" name="private-page" onChange={ this.updateBool } checked={ this.state.resource['private-page'] } />
            </div>
          </FormControl>
        }
        {!this.isStatic &&
          <>
            <FormControl>
              <div className="cms-form__collection">
                <CustomCheckbox label="Enable Sharing" id="shareable" name="shareable" onChange={ this.updateBool } checked={ this.state.resource.shareable } />
              </div>
            </FormControl>
            <FormControl>
              <div className="cms-form__collection">
                <CustomCheckbox label="Display in Main Navigation" id="show-in-nav" name="show-in-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-nav'] } />
              </div>
            </FormControl>
            {theme.features.navigation.centeredNav && !isChildPage &&
              <FormControl>
                <div className="cms-form__collection">
                  <CustomCheckbox label="Display in Featured Navigation" id="show-in-featured-nav" name="show-in-featured-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-featured-nav'] } />
                </div>
              </FormControl>
            }
            {theme.features.navigation.megaNav &&
              <FormControl>
                <div className="cms-form__collection">
                  <CustomCheckbox label="Display in Mega Navigation" id="show-in-mega-nav" name="show-in-mega-nav" onChange={ this.updateBool } checked={ this.state.resource['show-in-mega-nav'] } />
                </div>
              </FormControl>
            }
            {!isChildPage && (
              <FormControl>
                <div className="cms-form__collection">
                  <CustomCheckbox label="Display in Footer Navigation" id="show-in-footer" name="show-in-footer" onChange={ this.updateBool } checked={ this.state.resource['show-in-footer'] } />
                </div>
              </FormControl>
            )}
            {this.state.resource.collection && (
              <FormControl>
                <div className="cms-form__collection">
                  <CustomCheckbox label="Display on Collection Page" id="show-in-collection" name="show-in-collection" onChange={ this.updateBool } checked={ this.state.resource['show-in-collection'] } />
                </div>
              </FormControl>
            )}
          </>
        }
        {this.isStatic &&
          <StaticPageForm
            slug={this.props.slug}
            resource={this.state.resource}
            theme={theme}
            updateResource={(resource) => {
              this.setState({ resource })
            }}
          />
        }
        { this.renderErrors() }
        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className={ buttonClasses }>Save Page</Button>
        </div>
      </div>
    )
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    return (
      <div>
        <div className="cms-form__control">
          <p>Are you sure you want to delete the { this.resourceName } <strong>{ resource.title }</strong>?</p>
        </div>
        <div class="cms-form__control cms-form__control--actions">
          <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
          <Button type="submit" className={ buttonClasses }>Delete</Button>
        </div>
      </div>
    )
  }
}

export default withTheme(PagesForm)