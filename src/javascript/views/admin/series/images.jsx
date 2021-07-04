// React
import React from 'react'
import pluralize from 'pluralize'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
import Notification from 'javascript/components/notification'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Span from 'javascript/components/span'

// Store
import ResourceStore from 'javascript/stores/series'
import ImagesStore from 'javascript/stores/series-images'

// Actions
import ResourceActions from 'javascript/actions/series'
import ImageActions from 'javascript/actions/series-images'

export default class SeriesImagesView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      programme: null,
      series: null,
      resources: [],
      loaded: false,
      loading: false,
      deleting: false
    }
  }

  componentWillMount() {
    ResourceStore.on('change', this.getResources)
    ImagesStore.on('imagesUploaded', this.redirect)
    ImagesStore.on('error', this.retrieveErrors)
    ImagesStore.on('imageDeleted', this.updateResources)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('change', this.getResources)
    ImagesStore.removeListener('imagesUploaded', this.redirect)
    ImagesStore.removeListener('error', this.retrieveErrors)
    ImagesStore.removeListener('imageDeleted', this.updateResources)
    ResourceStore.unsetResource()
  }

  componentDidMount() {
    ResourceActions.getResource(this.props.match.params.series, {
      include: 'series-images',
      fields: {
        series: 'name,series-images'
      }
    })
  }

  redirect = () => {
    this.props.history.push(this.backUrl())
  }

  backUrl = () => {
    if (this.props.location.state?.backUrl) {
      return this.props.location.state.backUrl + this.props.location.search
    }
    return `/admin/${this.props.theme.localisation.programme.path}/${this.props.match.params.programme}/${this.props.theme.localisation.series.path}`
  }

  getResources = () => {
    const series = ResourceStore.getResource() || []
    this.setState({
      series,
      resources: series['series-images'] && series['series-images'].length ? series['series-images'] : [{
        path: 'No file chosen',
      }],
      loaded: true
    })
  }

  updateResources = () => {
    this.setState({
      deleting: false
    })
  }

  retrieveErrors = () => {
    this.setState({
      errors: ImagesStore.getErrors(),
      loading: false
    })
  }

  renderErrors = () => {
    if(this.state.errors) {
      return (
        <ul className="cms-form__errors">
          { Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  addImage = () => {
    const { resources } = this.state
    const update = resources
    update[Object.keys(resources).length] = {
      path: 'No file chosen',
      value: ''
    }

    this.setState({
      resources: update
    })
  }

  removeImage = (id, index) => {
    const confirmed = window.confirm('This action is irreversible. Do you wish to remove this image?');
    let deleting = true
    let update

    if (!confirmed) { return }
    if(id){
      update = this.state.resources.filter((item) => {
        return item.id !== id
      })
      ImageActions.deleteImage(this.props.match.params.series,id)
    } else {
      update = this.state.resources.filter((item, itemIndex) => {
        return itemIndex !== index
      })
    }

    this.setState({
      resources: update,
      deleting
    })
  }

  handleFileChange = (e) => {
    const target = e.target.name
    const input = this.refs[target]
    let update = this.state.resources
    if (input.files && input.files[0]) {
      const reader = new FileReader()

      const file = new Blob([input.files[0]], {type: input.files[0].type});
      file.name = input.files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
      const now = Date.now();
      file.lastModifiedDate = new Date(now);
      file.lastModified = now

      reader.onload = (e) => {
        update[target] = {
          preview: e.target.result,
          file: file,
          path: file.name
        }
        this.setState({
          resources: update
        })
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  uploadImage = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    ImageActions.uploadImages(this.state.resources.filter(item=>!item.id), this.props.match.params.series)
  }

  renderImages = () => {
    const {resources} = this.state
    const fileTypes = this.props.theme.features.acceptedFileTypes.gallery
    return resources.map((resource, index) => {
      return (
        <div className="file-input" key={`image-${index}`}>
          <div className="file-input__preview">
            <img src={ resource && resource.preview || resource.file && resource.file.admin_preview && resource.file.admin_preview.url } />
          </div>
          {(resource && resource.preview || resource.file && resource.file.admin_preview && resource.file.admin_preview.url) ? (
            <Button type="button" className="file-input__remove" onClick={()=>this.removeImage(resource.id, index)}>
              <Icon id="i-close" />
            </Button>
          ):(
            <>
              <input type="file" name={index} ref={index} defaultValue="" onChange={ this.handleFileChange } className="file-input__input" accept={fileTypes} />
              <Span className="button button--filled button--small" classesToPrefix={['button']} >
                Select an Image
              </Span>
            </>
          )}
          <span className="file-input__path">{ resource && resource.path }</span>
        </div>
      )
    })
  }

  render() {
    if(!this.state.loaded) {
      return (
        <main>
          <PageHeader title="Manage Images" />
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    } else {
      const { resources, series, loading } = this.state
      const buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'
      const { theme } = this.props
      return (
        <main>
          <PageHeader title={ `Manage Images for ${series.name}` }>
            <NavLink to={this.backUrl()} className="button">
              <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
              Back to { pluralize(theme.localisation.series.upper) }
            </NavLink>
          </PageHeader>
          <div className="container">
            <form className="cms-form cms-form--large" onSubmit={ this.uploadImage }>
              <h3 className="cms-form__title">Images (Minimum width 360px)</h3>
              {this.renderImages()}
              {Object.keys(resources).length < 4 &&
                <Button type="button" className="button button--small" onClick={this.addImage}>Add image</Button>
              }
              <div className="cms-form__control cms-form__control--actions">
                { this.renderErrors() }
                <NavLink to={ `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}` } className="button">Cancel</NavLink>
                <Button type="submit" className={ buttonClasses }>Upload Images</Button>
              </div>
            </form>
          </div>
          {this.state.deleting &&
            <Notification complete={true}>Image Removed</Notification>
          }
        </main>
      )
    }
  }
}
