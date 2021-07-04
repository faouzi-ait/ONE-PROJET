// React
import React from 'react'
import pluralize from 'pluralize'
import DOMPurify from 'dompurify'
import moment from 'moment'

import programmeFormVariables from 'javascript/views/admin/programmes/form/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

// Store
import ResourceStore from 'javascript/stores/programmes'

// Actions
import ResourceActions from 'javascript/actions/programmes'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import NavLink from 'javascript/components/nav-link'
import Icon from 'javascript/components/icon'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'

class ProgrammesShow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      programme: null,
      loaded: false
    }
  }

  componentWillMount() {
    ResourceStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('change', this.getResources)
    ResourceStore.unsetResource()
  }

  componentDidMount() {
    const { theme } = this.props

    const programmes = [
      'banner-urls,genres,qualities,production-companies,active,title,introduction',
      'description,number-of-series,number-of-episodes,production-start,production-end',
      'thumbnail,data,languages,custom-attributes,publish-date,external-id,updatable,visibility',
      'release-date'
    ]

    const include = [
      'genres,qualities,production-companies,languages,custom-attributes'
    ]

    if (this.props.programmeFormCV.createdDate) {
      programmes.push('created-at')
    }

    const fields = {
      qualities: 'name',
      'production-companies': 'name',
      languages: 'name',
      'custom-attributes': 'name,value'
    }

    if (theme.features.talents) {
      programmes.push('programme-talents')
      include.push('programme-talents,programme-talents.talent,programme-talents.talent-type')
      fields['programme-talents'] = 'talent,talent-type'
      fields['talents'] = 'firstname,surname'
      fields['talent-types'] = 'name'
    }

    if (theme.features.programmeTypes.enabled) {
      programmes.push('programme-type')
      include.push('programme-type')
      fields['programme-types'] = 'name'
    }

    ResourceActions.getResource(this.props.match.params.programme, {
      include: include.filter(Boolean).join(','),
      fields: {
        ...fields,
        programmes: programmes.filter(Boolean).join(',')
      }
    })
  }

  getResources = () => {
    this.setState({
      programme: ResourceStore.getResource(),
      loaded: true
    })
  }

  renderSubGenres = (id) => {
    let subGenres = this.state.programme.genres.map((subGenre) => {
      if (id == subGenre['parent-id']) {
        return (
          <li key={subGenre.id}>{subGenre.name}</li>
        )
      }
    })
    if (subGenres.length > 0) {
      return (
        <ul>
          {subGenres}
        </ul>
      )
    }
  }

  renderGenres = () => {
    let genres = this.state.programme.genres.map((genre) => {
      if (!genre['parent-id']) {
        return (
          <li key={genre.id}>
            {genre.name}
            {this.renderSubGenres(genre.id)}
          </li>
        )
      }
    })
    if (genres.length > 0) {
      return (
        <ul>
          {genres}
        </ul>
      )
    }
  }

  renderList = (arr) => {
    let items = arr.map((item) => {
      return (
        <li key={item.id}>{item.name}</li>
      )
    })
    if (items.length > 0) {
      return (
        <ul>
          {items}
        </ul>
      )
    }
  }

  renderDates = (programme) => {
    let start = ''
    let end = ''
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    if (programme['production-start']) {
      start = monthNames[moment(programme['production-start']).month()] + ' ' + moment(programme['production-start']).year()
    }
    if (programme['production-end']) {
      end = monthNames[moment(programme['production-end']).month()] + ' ' + moment(programme['production-end']).year()
    }

    return (
      <span>
        {start} - {end}
      </span>
    )
  }

  renderProgramme = () => {
    const { programme } = this.state
    const { theme } = this.props
    const publishDate = programme['publish-date'] ? `Publish Date: ${moment(programme['publish-date']).format(theme.features.formats.shortDate)}` : '';
    let status = programme.active ? 'Active' : 'Inactive'
    let statusClass = programme.active ? 'page-actions__status' : 'page-actions__status page-actions__status--disabled'
    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')
    return (
      <div className="container">
        <div className="page-actions">
          <ActionMenu name="Actions">
            <ActionMenuItem label={`Manage ${pluralize(theme.localisation.series.upper)}`} link={`/admin/${theme.localisation.programme.path}/${programme.id}/${theme.localisation.series.path}`} />
            <ActionMenuItem label="Manage Images" link={`/admin/${theme.localisation.programme.path}/` + programme.id + '/images'} />
            <ActionMenuItem label={`Manage ${pluralize(theme.localisation.video.upper)}`} link={`/admin/${theme.localisation.programme.path}/${programme.id}/${theme.localisation.video.path}`} />
            <ActionMenuItem label="Edit" link={`/admin/${theme.localisation.programme.path}/` + programme.id + '/edit'} divide />
          </ActionMenu>
          <span className={statusClass}>{publishDate}</span>
          <span className={statusClass}>{status}</span>
        </div>
        <table className="cms-table cms-table--programme">
          <thead>
            <tr>
              <th colSpan="2">Images</th>
            </tr>
          </thead>
          <tbody>
            {programme['banner-urls'] && programme['banner-urls']['default']?.large?.normal &&
              <tr>
                <td><strong>Banner</strong></td>
                <td><img src={programme['banner-urls']['default'].large.normal} role="presentation" /></td>
              </tr>
            }
            {programme.thumbnail &&
              <tr>
                <td><strong>Thumbnail</strong></td>
                <td><img src={programme.thumbnail.admin_preview.url} role="presentation" /></td>
              </tr>
            }
          </tbody>
        </table>
        <table className="cms-table cms-table--programme">
          <thead>
            <tr>
              <th colSpan="2">Overview</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{easytrack ? 'EasyTrack ID' : 'External ID'}</strong></td>
              <td>{programme['external-id']}</td>
            </tr>
            <tr>
              <td><strong>Available on</strong></td>
              <td>
                { (programme.visibility === 'visible' || programme.visibility === 'web_only') &&
                  <span class="count count--success">Web</span>
                }
                { (programme.visibility === 'visible' || programme.visibility === 'app_only') &&
                  <span class="count count--warning">App</span>
                }
              </td>
            </tr>
            <tr>
              <td><strong>Introduction</strong></td>
              <td>{programme['introduction']}</td>
            </tr>
            <tr>
              <td><strong>Description</strong></td>
              <td dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(programme['description']) }} className="wysiwyg"></td>
            </tr>
            <tr>
              <td><strong>{pluralize(theme.localisation.genre.upper)}</strong></td>
              <td>{this.renderGenres()}</td>
            </tr>
            { theme.features.programmeTypes.enabled && (
              <tr>
                <td><strong>{theme.localisation.programmeType.upper}</strong></td>
                <td>{ programme['programme-type'] ? programme['programme-type']['name'] : ''}</td>
              </tr>
            )}
            <tr>
              <td><strong>{`Number of ${pluralize(theme.localisation.series.upper)}`}</strong></td>
              <td>{programme['number-of-series']}</td>
            </tr>
            <tr>
              <td><strong>Number of Episodes</strong></td>
              <td>{programme['number-of-episodes']}</td>
            </tr>
            { this.props.programmeFormCV.createdDate && (
              <tr>
                <td><strong>Created date</strong></td>
                <td>{ moment.utc(programme['created-at']).format(theme.features.formats.shortDate) }</td>
              </tr>
            )}
          </tbody>
        </table>
        <table className="cms-table cms-table--programme">
          <thead>
            <tr>
              <th colSpan="2">Production</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{pluralize(theme.localisation.productionCompany.upper)}</strong></td>
              <td>
                <ul>
                  {programme['production-companies'].map(({ name }, i) => (<li key={i}>{name}</li>))}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Qualities</strong></td>
              <td>{this.renderList(programme['qualities'])}</td>
            </tr>
            <tr>
              <td><strong>Production Dates</strong></td>
              <td>
                {this.renderDates(programme)}
              </td>
            </tr>
            {programme.languages &&
              <tr>
                <td><strong>Languages</strong></td>
                <td>
                  <ul>
                    {programme.languages.map(({ name }, i) => (<li key={i}>{name}</li>))}
                  </ul>
                </td>
              </tr>
            }
            <tr>
              <td><strong>Release Date</strong></td>
              <td>
                {programme['release-date'] ? moment.utc(programme['release-date']).format(theme.features.formats.shortDate) : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {theme.features.talents &&
          <>
            <table className="cms-table cms-table--programme">
              <thead>
                <tr>
                  <th colSpan="2">{pluralize(theme.localisation.talent.upper)}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.programme['programme-talents'].map((t, i) => {
                  return (
                    <tr key={i}>
                      <td><strong>{`${t.talent.firstname} ${t.talent.surname}`}</strong></td>
                      <td>{t['talent-type'].name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <table className="cms-table cms-table--programme">
              <thead>
                <tr>
                  <th colSpan="2">Custom Attributes</th>
                </tr>
              </thead>
              <tbody>
                {this.state.programme['custom-attributes'].map((attr, i) => {
                  return (
                    <tr key={i}>
                      <td><strong>{attr.name}</strong></td>
                      <td>
                        {
                          typeof attr.value === typeof true ? attr.value ? 'Yes' : 'No' : attr.value
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        }
      </div>
    )
  }

  render() {
    const { theme } = this.props
    if (!this.state.loaded) {
      return (
        <main>
          <PageHeader title={`${theme.localisation.programme.upper} Details`} />
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    } else {
      return (
        <main>
          <PageHeader title={this.state.programme.title}>
            <NavLink to={`/admin/${theme.localisation.programme.path}`} className="button">
              <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
              Back to {pluralize(theme.localisation.programme.upper)}
            </NavLink>
          </PageHeader>
          {this.renderProgramme()}
        </main>
      )
    }
  }
}

const enhance = compose(
  withClientVariables('programmeFormCV', programmeFormVariables),
)

export default enhance(ProgrammesShow)
