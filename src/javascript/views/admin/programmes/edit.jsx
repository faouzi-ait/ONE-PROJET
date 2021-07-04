// React
import React from 'react'
import pluralize from 'pluralize'

import programmeFormVariables from 'javascript/views/admin/programmes/form/variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

// Store
import ResourceStore from 'javascript/stores/programmes'
import VideoStore from 'javascript/stores/videos'

// Actions
import ResourceActions from 'javascript/actions/programmes'
import VideoActions from 'javascript/actions/videos'

// Components
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Form from 'javascript/views/admin/programmes/form'
import NavLink from 'javascript/components/nav-link'
import {
  ActionMenu,
  ActionMenuItem,
} from 'javascript/components/admin/action-menu'


class ProgrammesEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      programme: null,
      loaded: false,
    }
  }

  componentWillMount() {
    ResourceStore.on('change', this.getResources)
    ResourceStore.on('save', this.redirect)
    VideoStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('change', this.getResources)
    ResourceStore.removeListener('save', this.redirect)
    VideoStore.removeListener('change', this.getResources)
    ResourceStore.unsetResource()
  }

  componentDidMount() {
    const { theme } = this.props
    const programmes = [
      'video-banner,genres,qualities,production-companies,languages,title',
      'introduction,description,short-description,production-start,production-end',
      'active,number-of-series,number-of-episodes,data,pdf-url,pdf-name',
      'custom-attributes,promo-video-id,show-related-programmes',
      'related-programmes,thumbnail,publish-date,external-id,restricted,updatable,visibility',
      (theme.features.programmeOverview?.logoTitle || theme.features.programmeOverview?.logoTitleBanner) && 'logo',
      theme.features.dataSync && 'data-sync',
      process.env.TARGET_ENV === 'production' && 'pdf-id',
      theme.features.programmeReleaseDate.enabled && 'release-date'
    ]
    const include = [
      'video-banner,genres,qualities,production-companies,languages,custom-attributes',
      'custom-attributes.custom-attribute-type,related-programmes,related-programmes.genres',
    ]

    if (this.props.programmeFormCV.createdDate) {
      programmes.push('created-at')
    }

    const fields = {
      genres: 'name',
      qualities: 'name',
      languages: 'name',
      'production-companies': 'name',
      'custom-attributes': 'value,custom-attribute-type,position',
    }

    if (theme.features.programmeTypes.enabled) {
      programmes.push('programme-type')
      include.push('programme-type')
      fields['programme-types'] = 'name'
    }

    if (theme.features.customCatalogues.enabled) {
      programmes.push('catalogues')
      include.push('catalogues')
      fields['catalogues'] = 'name'
    }

    if (theme.features.talents) {
      programmes.push('programme-talents')
      include.push('programme-talents,programme-talents.talent,programme-talents.talent-type')
      fields['programme-talents'] = 'talent,talent-type,summary'
      fields['talents'] = 'full-name'
      fields['talent-types'] = 'name'
    }

    if (theme.features.programmeFormats.enabled) {
      programmes.push('format,format-programmes,title-with-genre')
      include.push('format,format-programmes')
    }

    ResourceActions.getResource(this.props.match.params.programme, {
      include: include.filter(Boolean).join(','),
      fields: {
        ...fields,
        programmes: programmes.filter(Boolean).join(',')
      }
    })

    VideoActions.getResources({
      sort: 'position',
      filter: {
        programme_id: this.props.match.params.programme,
        restricted: false
      },
      fields: {
        videos: 'name,programme-name,series-name,episode-name,parent-type',
      },
      page: {
        size: 200
      }
    })
  }

  redirect = () => {
    this.props.history.push(
      `/admin/${this.props.theme.localisation.programme.path}/`,
    )
  }

  getResources = () => {
    const resource = ResourceStore.getResource()
    const allVideos = VideoStore.getResources().map(v => {
      if(v['parent-type'] === 'Series'){
        return ({
          ...v,
          name: `Series - ${v['series-name']}, ${v.name}`
        })
      } else if(v['parent-type'] === 'Episode'){
        return ({
          ...v,
          name: `Series - ${v['series-name']}, Episode - ${v['episode-name']}, ${v.name}`
        })
      } else {
        return ({
          ...v
        })
      }
    })

    this.setState({
      //wait for duplicate to get full resource
      programme: !resource['duplicate-id'] ? resource : null,
      videos: allVideos,
    })

    if (resource && !resource['duplicate-id'] && !this.state.loaded) {
      this.setState({
        loaded: true,
      })
    }
  }

  render() {
    const id = this.props.match.params.programme
    const { theme } = this.props
    const adminProgrammes = `/admin/${theme.localisation.programme.path}`
    if (!this.state.loaded) {
      return (
        <main>
          <PageHeader title={`Edit ${theme.localisation.programme.upper}`} />
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    } else {
      return (
        <main>
          <PageHeader title={`Edit ${theme.localisation.programme.upper}`}>
            <ActionMenu name="Actions">
              <ActionMenuItem
                label={`Manage ${pluralize(theme.localisation.series.upper)}`}
                link={`${adminProgrammes}/${id}/${theme.localisation.series.path}`}
              />
              <ActionMenuItem
                label="Manage Images"
                link={`${adminProgrammes}/${id}/images`}
              />
              <ActionMenuItem
                label={`Manage ${pluralize(theme.localisation.video.upper)}`}
                link={`${adminProgrammes}/${id}/${theme.localisation.video.path}`}
              />
              <ActionMenuItem
                label="Manage Content"
                link={`${adminProgrammes}/${id}/content`}
              />
              <ActionMenuItem
                label={`Manage ${pluralize(theme.localisation.productionCompany.upper)}`}
                link={`${adminProgrammes}/${id}/${theme.localisation.productionCompany.path}`}
              />
              <ActionMenuItem
                label="View"
                href={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(this.state.programme, theme)}`}
                divide
              />
            </ActionMenu>
            <NavLink
              to={`/admin/${theme.localisation.programme.path}`}
              className="button"
            >
              <Icon
                width="8"
                height="13"
                id="i-admin-back"
                classes="button__icon"
              />
              Back to {pluralize(theme.localisation.programme.upper)}
            </NavLink>
          </PageHeader>
          <Form
            programme={this.state.programme}
            videos={this.state.videos}
          />
        </main>
      )
    }
  }
}
const enhance = compose(
  withClientVariables('programmeFormCV', programmeFormVariables),
)

export default enhance(ProgrammesEdit)