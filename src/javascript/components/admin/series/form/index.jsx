import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import { withRouter } from 'react-router-dom'

import { ReadOnlyAttrs } from 'javascript/config/features'
import allVariables from './variables'

// State
import SeriesStore from 'javascript/stores/series'
import SeriesActions from 'javascript/actions/series'
import CustomAttributeActions from 'javascript/actions/custom-attributes'
import SeriesTalentActions from 'javascript/actions/series-talents'
// Services
import TalentService from 'javascript/services/talents'
// Components
import Button from 'javascript/components/button'
import FormHelper from 'javascript/views/form-helper'
import FormControl from 'javascript/components/form-control'
import Editor from 'javascript/components/wysiwyg'
import Select from 'react-select'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import DatePicker from 'javascript/components/datepicker'
import NavLink from 'javascript/components/nav-link'
// Hoc
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPrefix from 'javascript/components/hoc/with-prefix'
import useTheme from 'javascript/utils/theme/useTheme'
import useResource from 'javascript/utils/hooks/use-resource'

class SeriesForm extends React.Component {
  constructor(props) {
    super(props)
    const { resource, theme } = this.props
    this.resourceName = theme.localisation.series.upper
    this.state = {
      resource: null,
      data: [],
      'custom-attributes': [],
      'talents': [],
      isLoading: false
    }
  }

  componentDidMount() {
    this.setResource(this.props.resource)
  }

  componentDidUpdate(prevProps) {
    if (this.props.resource?.id && prevProps.resource?.id !== this.props.resource.id) {
      this.setResource(this.props.resource)
    }
  }

  setResource = (providedResource) => {
    const resource = {
      ...providedResource
    }
    if (!resource['show-in-programme-description']) {
      resource['show-in-programme-description'] = false
    }
    this.setState({
      resource,
      data: Object.keys(resource.data || []).map(key => ({ key: key, value: resource.data[key] })),
      'custom-attributes': (resource['custom-attributes'] || []).sort((a, b) => a.position - b.position),
      'talents': resource['series-talents'] || []
    })
  }

  addTalent = () => {
    this.setState({
      'talents': [...this.state['talents'], {
        'talent-type': {
          'id': null
        },
        'talent': {
          'id': null,
          'full-name': 'Search'
        },
        'series': {
          'id': this.state.resource.id
        }
      }]
    })
  }

  addAttribute = () => {
    this.setState({
      'custom-attributes': [...this.state['custom-attributes'], {
        'custom-attribute-type': {
          'id': null
        },
        'value': '',
        position: this.state['custom-attributes'].length,
        'related': {
          'id': this.state.resource.id,
          'type': 'series'
        }
      }]
    })
  }

  handleBooleanChange = (type) => () => {
    let update = this.state.resource
    update[type] = !update[type]
    this.setState(({ resource }) => ({
      resource: update
    }))
  }

  searchForTalent = (search, callback) => {
    clearTimeout(this.searchTimer)
    if(search.length) {
      this.searchTimer = setTimeout(() => {
        TalentService.search({
          fields: {
            talent: 'full-name'
          },
          page: {
            size: 10
          },
          filter: {
            search_by_full_name: search
          }
          }, (response) => {
            this.setState({
              searchResults: response
            }, () => {
              callback(null, {
                options: this.state.searchResults.map(t => ({ ...t, label: `${t['full-name']}`, value: t.id }))
              })
            })
          })
      }, 300)
    }
  }

  renderAttributeValue = (a,i) => {
    const attrs = this.state['custom-attributes']
    const type = this.props.types.find(t => t.id === a['custom-attribute-type'].id)
    if(!ReadOnlyAttrs.includes(a['custom-attribute-type'].name)) {
      if(type && type['attribute-type'] === 'Boolean') {
        return (
          <div>
            <input
              type="checkbox"
              className="checkbox__input"
              id={`boolean-attribute${i}`}
              value={a.value}
              checked={a.value}
              onChange={({ target }) => {
                attrs[i].value = (!a.value) ? 1 : 0
                this.setState(() => ({ 'custom-attributes': attrs }))
              }} />
            <label htmlFor={`boolean-attribute${i}`} className="checkbox__label cms-form__label"></label>
          </div>
        )
      } else if (type && type.config.limitValues) {
        return (
          <Select
          options={type.config.values.filter(v => {
            const match = this.state['custom-attributes'].find(a => a['custom-attribute-type'].id === type.id && a.value === v)
            if (match && match.value !== a.value) {
              return false
            } else {
              return v
            }
          }).map(v => ({ label: v, value: v }))}
          value={a.value} clearable={false} simpleValue={true}
          onChange={(v) => {
            attrs[i].value = v
            this.setState(() => ({ 'custom-attributes': attrs }))
          }} required />
        )
      } else if (type && type['attribute-type'] === 'Date') {
        return (
          <DatePicker
            selected={a.value}
            dateFormat={this.props.theme.features.formats.shortDate} onChange={e => {
              attrs[i].value = e.toDate().toString()
              this.setState(() => ({ 'custom-attributes': attrs }))
            }} />
        )
      } else {
        return (
            <input type={type && type['attribute-type'] === 'Integer' ? 'number' : 'text'} value={a.value} placeholder={type && type['attribute-type'] === 'Integer' ? 'Attribute value (number)' : 'Attribute value'} className="cms-form__input" onChange={({ target }) => {
            attrs[i].value = type['attribute-type'] === 'Integer' ? Number(target.value) : target.value
            this.setState(() => ({ 'custom-attributes': attrs }))
          }} required />
        )
      }
    } else {
      return (
        <input type="text" readOnly className="cms-form__input" value={a.value} />
      )
    }
  }

  updateResourceDate = (date, dateName) => {
    this.setState(state => {
      const { resource } = state
      resource[dateName] = date
        ? date
            .utc()
            .toDate()
            .toString()
        : null
      return {
        ...state,
        resource,
      }
    })
  }

  handleInputChange = (e) => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    this.setState({
      resource: update
    })
  }

  scrubResource = (resource) => {
    const blackListKeys = [
      'position', 'episodes-count', 'restricted-users', 'restricted-companies',
      'videos-count', 'number-of-episodes', 'updatable', 'programme-id', 'programme-name',
      'asset-materials-count','episodes','has-assets','custom-attributes','series-talents', 'updatable'
    ]
    const resourceToSave = {...resource}
    blackListKeys.forEach((key) => {
      delete resourceToSave[key]
    })
    return resourceToSave
  }

  handleSubmit = (e) => {
    const { theme, onSave, hideModal, fetchSeriesFormData, isEdit } = this.props
    const resource = {...this.state.resource}
    if (!resource.programme?.id) {
      return this.setState({
        apiErrors: {
          [theme.localisation.programme.upper]: ' - required field'
        }
      })
    }
    resource.data = this.state.data.reduce((obj, item) => {
      obj[item.key] = item.value
      return obj
    }, {})
    this.setState({ isLoading: true })
    onSave(this.scrubResource(resource))
      .then((response) => {
        response.programme = resource.programme
        if (isEdit) {
          CustomAttributeActions.createOrUpdate(this.state['custom-attributes'], fetchSeriesFormData)
          if(theme.features.talents) {
            SeriesTalentActions.createOrUpdate(this.state.talents, fetchSeriesFormData)
          }
        } else {
          CustomAttributeActions.createAndAssociate(response, this.state['custom-attributes'], fetchSeriesFormData)
          if(theme.features.talents) {
            SeriesTalentActions.createAndAssociate(response, this.state.talents, fetchSeriesFormData)
          }
        }
        setTimeout(hideModal, 200)
      })
      .catch((apiErrors) => this.setState({ apiErrors, isLoading: false }))
  }

  renderErrors = () => {
    const {prefix} = this.props
    if(this.state.apiErrors) {
      return (
        <ul className={`${prefix}form__errors`}>
          { Object.keys(this.state.apiErrors).map((key, i) => {
            const error = this.state.apiErrors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  renderForm = () => {
    const { theme, prefix, onSave } = this.props
    const { data, resource, talents } = this.state
    if (!resource) return null

    const attrs = this.state['custom-attributes']
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')

    return (
      <div className={`${prefix}form`}>
        {!this.props.programmeId &&
          <FormControl label={theme.localisation.programme.upper} required={true}>
            <ProgrammeSearchSuggestions
              required={true}
              clearQuery={true}
              onSubmit={() => {}}
              onSuggestionSelected={(e, p) => {
                const apiErrors = {...this.state.apiErrors}
                delete apiErrors[theme.localisation.programme.upper]
                this.setState({
                  resource: {
                    ...resource,
                    programme: {
                      id: p.suggestion.programme.id
                    }
                  },
                  apiErrors
                })
              }}
              allProgrammes={true}
              {...(resource['programme-name'] && {value: resource['programme-name']})}
            />
          </FormControl>
        }
        <FormControl type="text" name="name" label="Name" value={resource.name} required onChange={this.handleInputChange} />
        {resource.id &&
          <FormControl
            key="external_id"
            type="text"
            label={easytrack ? 'EasyTrack ID' : 'External ID'}
            name="external-id"
            readonly
            value={resource['external-id'] || ''}
          />
        }
        <FormControl label="Description">
          <Editor
            value={resource.description}
            onChange={(value) => { this.handleInputChange({ target: { name: 'description', value: value } }) }}
          />
        </FormControl>
        <FormControl modifiers={['start']} label="Status">
          <div className="checkbox">
            <input type="checkbox" name="active" id="active"
              className="checkbox__input"
              checked={resource.active}
              onChange={this.handleBooleanChange('active')}
              disabled={this.props.seriesFormCV.updatableUsed ? !resource.updatable : false}
            />
            <label htmlFor="active" className="checkbox__label">Active</label>
          </div>
        </FormControl>
        <FormControl modifiers={['start']} label=" ">
          <div className="checkbox">
            <input type="checkbox" name="restricted" className="checkbox__input" id="restricted" checked={resource['restricted']} onChange={this.handleBooleanChange('restricted')} />
            <label htmlFor="restricted" className="checkbox__label">Restricted</label>
          </div>
        </FormControl>
        <FormControl modifiers={['start']} label=" ">
          <div className="checkbox">
            <input type="checkbox" name="showInProgrammeDescription" className="checkbox__input" id="showInProgrammeDescription" checked={resource['show-in-programme-description']} onChange={this.handleBooleanChange('show-in-programme-description')} />
            <label htmlFor="showInProgrammeDescription" className="checkbox__label">{`Show in ${theme.localisation.programme.lower} description`}</label>
          </div>
        </FormControl>
        {theme.features.programmeOverview.seriesEpisodeCount &&
          <FormControl
            type="text"
            label="Number of Episodes"
            name="manual-number-of-episodes"
            value={
              resource.hasOwnProperty('manual-number-of-episodes')
                ? resource['manual-number-of-episodes']
                : (resource['number-of-episodes'] !== undefined && resource['number-of-episodes'].toString())
            }
            onChange={this.handleInputChange}
          />
        }
        {theme.features.seriesReleaseDate.enabled &&
          <FormControl
            type="date"
            label="Release Date"
            selected={resource['release-date']}
            onChange={e =>  this.updateResourceDate(e, 'release-date')}
            dateFormat={theme.features.formats.mediumDate}
            isClearable={true}
            showYearDropdown
          />
        }

        {theme.features.talents && (
          <>
            <h3 className="cms-form__title">
              {pluralize(theme.localisation.talent.upper)}
            </h3>
            <div>
              {talents.map((a, i) => {
                return (
                  <div className="cms-form__group" key={i} style={{ margin: '0px 20px 20px'}}>
                      <div className="cms-form__group-actions">
                      <Button
                        type="button"
                        className="button button--smallest button--error"
                        onClick={() => {
                          if (a.id) {
                            SeriesTalentActions.deleteResource({ id: a.id })
                          }
                          this.setState(() => ({
                            talents: talents.filter((item, index) => i !== index)
                          }))
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <FormControl label={theme.localisation.talent.upper}>
                      <Select.Async
                        loadOptions={this.searchForTalent}
                        value={a['talent']}
                        clearable={false}
                        simpleValue={true}
                        onChange={v => {
                          talents[i]['talent'] = this.state.searchResults.filter((result) => {
                            return parseInt(result.id) === parseInt(v)
                          })[0]
                          this.setState(() => ({ talents }))
                        }}
                        labelKey="full-name"
                        valueKey="id"
                        required
                      />
                    </FormControl>
                    <FormControl label={`${theme.localisation.talent.upper} Type`}>
                      <Select
                        options={this.props.talentTypes.map(t => ({...t, label: t.name, value: t.id}))}
                        value={a['talent-type'] && a['talent-type'].id}
                        clearable={false}
                        simpleValue={true}
                        onChange={v => {
                          talents[i]['talent-type'].id = v
                          this.setState(() => ({ talents }))
                        }}
                        required
                      />
                    </FormControl>
                    <FormControl
                      type="textarea"
                      label={'Summary'}
                      outerStyle={{ width: '100%' }}
                      style={{ height: '70px' }}
                      value={a['summary']}
                      onChange={({target}) => {
                        talents[i].summary = target.value
                        this.setState(() => ({ talents }))
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="cms-form__actions">
              <Button
                className="button button--small"
                onClick={this.addTalent}
                type="button"
              >
                Add A New {theme.localisation.talent.upper}
              </Button>
            </div>
          </>
        )}

        <h3 className="cms-form__title">Custom Attributes</h3>
        <div className="cms-form__table">
          {this.state['custom-attributes'].map((a, i) => {
            return (
              <div className="cms-form__control" key={i}>
                <div>
                  {!ReadOnlyAttrs.includes(a['custom-attribute-type'].name) ? (
                    <Select
                      options={this.props.types.map(t => ({ ...t, label: t.name, value: t.id }))}
                      value={a['custom-attribute-type'].id} clearable={false} simpleValue={true}
                      onChange={(v) => {
                        attrs[i]['custom-attribute-type'].id = v
                        attrs[i].value = ''
                        this.setState(() => ({ 'custom-attributes': attrs }))
                      }} required />
                  ) : (
                      <input type="text" readOnly className="cms-form__input" value={a['custom-attribute-type'].name} />
                    )}
                </div>
                <div>{this.renderAttributeValue(a,i)}</div>
                <div>
                  {!ReadOnlyAttrs.includes(a['custom-attribute-type'].name) &&
                    <Button type="button" className="button button--small button--filled button--danger" onClick={() => {
                      if (a.id) {
                        CustomAttributeActions.deleteResource({ id: a.id })
                      }
                      this.setState(() => ({
                        'custom-attributes': attrs.filter((item, index) => i !== index)
                      }))
                    }}>Delete</Button>
                  }
                </div>
              </div>
            )
          })}
        </div>

        <div className="cms-form__actions">
          <Button className="button button--small" onClick={this.addAttribute} type="button">Add A New Attribute</Button>
        </div>
        {this.renderErrors()}
        <div className="cms-form__control cms-form__control--actions">
          <Button type="button" onClick={this.handleSubmit} className={buttonClasses}>Save {this.resourceName}</Button>
        </div>
      </div>
    )
  }

  navClick = (linkPath) => (e) => {
    this.props.hideModal()
    if (this.props.programmeId) {
      return this.props.history.push(linkPath)
    }
    const returnPathState = { backUrl: `/admin/${this.props.theme.localisation.series.path}` }
    this.props.history.push({ pathname: linkPath, state: returnPathState, search: this.props.location.search })
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    if (!resource?.id) return null
    const { hideModal, onSave, theme } = this.props
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    if (resource['episodes-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This {theme.localisation.series.lower} has {resource['episodes-count']} episode(s). Please delete all <button  className={'text-button text-button--plain'}
            onClick={this.navClick(`/admin/${theme.localisation.programme.path}/${resource.programme.id}/${theme.localisation.series.path}/${resource.id}/episodes`)}
          >episodes</button> first.</p>
          <Button type="button" className="button button--reversed" onClick={hideModal}>Cancel</Button>
        </div>
      )
    } else if (resource['videos-count'] > 0) {
      return (
        <div className="u-align-center">
          <p>This {theme.localisation.series.lower} has {resource['videos-count']} video(s). Please delete all <button className={'text-button text-button--plain'}
            onClick={this.navClick(`/admin/${theme.localisation.programme.path}/${resource.programme.id}/${theme.localisation.series.path}/${resource.id}/${theme.localisation.video.path}`)}
          >videos</button> first.</p>
          <Button type="button" className="button button--reversed" onClick={hideModal}>Cancel</Button>
        </div>
      )
    } else {
      return (
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the {theme.localisation.series.lower} <strong>{resource.name}</strong>? This will delete all associated assets.</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={hideModal}>Cancel</Button>
            <Button type="button" className={buttonClasses} onClick={() => {
               this.setState({ isLoading: true })
               onSave(resource).then(() => setTimeout(hideModal, 200))
            }}>
              Delete
            </Button>
          </div>
        </div>
      )
    }
  }

  render() {
    return this.props.isDelete ? this.renderDeleteForm() : this.renderForm()
  }

}
const enhance = compose(
  withTheme,
  withPrefix,
  withRouter,
  withClientVariables('seriesFormCV', allVariables),
  withHooks((props) => {
    const { features } = props.theme
    const { programmeId } = props
    const [formData, setFormData] = useState({
      programme: programmeId ? {
        id: programmeId
      } : null,
      description: '',
      active: true,
      restricted: features.restrictions.seriesDefault,
      data: {}
    })
    const seriesResource = useResource('series')
    useEffect(() => {
      if (props.isDelete) {
        seriesResource.findOne(props.resource.id, {
          fields: {
            'series': 'name,active,restricted,episodes-count,videos-count,programme-id,programme-name',
          },
        }).then((response) => {
          setFormData({
            ...response,
            ...(response['programme-id'] && { programme: { id: response['programme-id'] }})
          })
        })
      } else if (props.resource) { // updateResource
        seriesResource.findOne(props.resource.id, {
          include: [
            'restricted-companies,restricted-users,custom-attributes,custom-attributes.custom-attribute-type',
            features.talents && 'series-talents,series-talents.talent,series-talents.talent-type'
          ].filter(Boolean).join(','),
          fields: {
            'series': [
              'name,description,position,episodes-count,data,active,restricted,restricted-users',
              'restricted-companies,videos-count,show-in-programme-description,custom-attributes',
              'number-of-episodes,external-id,updatable,programme-id,programme-name',
              features.talents && 'series-talents',
              features.seriesReleaseDate.enabled && 'release-date'
            ].filter(Boolean).join(','),
            'custom-attributes': 'value,custom-attribute-type,position',
            'series-talents': 'talent,talent-type,summary',
            'talents': 'full-name',
            'talent-types': 'name'
          },
        }).then((response) => {
          setFormData({
            ...response,
            ...(response['programme-id'] && { programme: { id: response['programme-id'] }})
          })
        })
      }
    }, [])

    return {
      resource: formData
    }
  })
)

export default enhance(SeriesForm)

