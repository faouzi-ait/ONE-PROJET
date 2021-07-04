import React from 'react'

// Actions
import TeamMembersActions from 'javascript/actions/team-members'

// Stores
import TeamMembersStore from 'javascript/stores/team-members'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import PageHeader from 'javascript/components/admin/layout/page-header'
import NavLink from 'javascript/components/nav-link'
import Span from 'javascript/components/span'

const ImagesView = ({teamMember, preview, path, updateImage, uploadImage, loading, theme}) => (
  <main>
    <PageHeader title={ `Manage Images for ${teamMember['first-name']} ${teamMember['last-name']}`}>
      <NavLink to={`/admin/${theme.localisation.team.path}`} className="button">
        <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
        Back to Team Members
      </NavLink>
    </PageHeader>

    <div className="container">
      <form className="cms-form cms-form--large" onSubmit={uploadImage}>
        <h3 className="cms-form__title">Avatar</h3>
        <div className="file-input">
          <div className="file-input__preview">
            <img src={preview || teamMember.image.admin_preview.url} />
          </div>
          <input type="file" className="file-input__input" onChange={updateImage} />
          <Span className="button button--filled button--small" classesToPrefix={['button']} >
            Select an Image
          </Span>
          <span className="file-input__path">{path}</span>
        </div>

        <div className="cms-form__control cms-form__control--actions">
          <NavLink to={`/admin/${theme.localisation.team.path}`} className="button">Cancel</NavLink>
          <Button type="submit" className={['button button--filled', loading && 'button--loading'].join(' ')}>Upload Image</Button>
        </div>
      </form>
    </div>
  </main>
)

export default class TeamMembersImages extends React.Component {
  state = {}

  componentWillMount(){
    TeamMembersStore.on('change', this.mapResourcesToState)
    TeamMembersStore.on('imageUploaded', this.redirect)
  }

  componentWillUnmount(){
    TeamMembersStore.removeListener('change', this.mapResourcesToState)
    TeamMembersStore.removeListener('imageUploaded', this.redirect)
  }

  componentDidMount(){
    const {id} = this.props.match.params

    TeamMembersActions.getResource(id, {
      fields: {
        'team-members': 'first-name,last-name,image'
      }
    })
  }

  mapResourcesToState = () => {
    this.setState({
      teamMember: TeamMembersStore.getResource()
    })
  }

  updateImage = ({target}) => {
    const {files} = target

    const file = new Blob([files[0]], {type: files[0].type});
    file.name = files[0].name.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
    const now = Date.now();
    file.lastModifiedDate = new Date(now);
    file.lastModified = now

    const reader = new FileReader()

    reader.onload = (e) => {
      this.setState({
        preview: e.target.result,
        path: file.name
      })
    }

    reader.readAsDataURL(file)
  }

  uploadImage = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    const { params } = this.props.match
    TeamMembersActions.uploadImage(params.id, this.state.preview)
  }

  redirect = () => {
    this.props.history.push(`/admin/${this.props.theme.localisation.team.path}`)
  }

  render(){
    if(!this.state.teamMember){
      return (
        <main>
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    }

    return <ImagesView {...{
      ...this.props,
      ...this.state,
      updateImage: this.updateImage,
      uploadImage: this.uploadImage
    }} />
  }
}