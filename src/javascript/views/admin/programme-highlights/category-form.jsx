import React from 'react'
import Select from 'react-select'

// Actions
import ResourceActions from 'javascript/actions/programme-highlight-categories'
import GenresActions from 'javascript/actions/genres'

// Stores
import ResourceStore from 'javascript/stores/programme-highlight-categories'
import GenresStore from 'javascript/stores/genres'

// Components
import FormControl from 'javascript/components/form-control'


export default class HighlightCategoryForm extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      genres: [],
      name: props.category ? props.category.name : '',
      selectedGenre: props.category && props.category.genre
    }
  }

  componentWillMount(){
    ResourceStore.on('error', this.setErrorsToState)
    ResourceStore.on('resourceUpdated', this.props.closeEvent)
    ResourceStore.on('change', this.props.closeEvent)
    GenresStore.on('dataChange', this.setGenresToState)
  }

  componentWillUnmount(){
    ResourceStore.removeListener('error', this.setErrorsToState)
    ResourceStore.removeListener('resourceUpdated', this.props.closeEvent)
    ResourceStore.removeListener('change', this.props.closeEvent)
    GenresStore.removeListener('dataChange', this.setGenresToState)
  }

  componentDidMount(){
    GenresActions.getDataResources({
      fields: {
        genres: 'name'
      },
      page: {
        size: 200
      },
      filter: {
        'with-programmes-for-user': true,
      },
    })
  }

  setGenresToState = () => {
    this.setState({
      genres: GenresStore.getDataResources()
    })
  }

  setErrorsToState = () => {
    this.setState({
      errors: ResourceStore.getErrors()
    })
  }

  handleInputChange = (e) => {
    const resource = this.state
    resource[e.target.name] = e.target.value
    this.setState({
      resource
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    const { category, highlightPageId } = this.props
    const { selectedGenre, name } = this.state
    const update = {
      name,
      ...(selectedGenre && { genre: selectedGenre}),
      ...(category && { id: category.id}),
      ...(highlightPageId && { 'programme-highlight-page': { id: highlightPageId }}),
    }
    if (category) {
      ResourceActions.updateResource(update)
    } else {
      ResourceActions.createResource(update)
    }
  }

  setSelectedGenre = (selectedGenre) => {
    this.setState({ selectedGenre })
  }

  render(){
    const {errors = {}, genres, selectedGenre, name} = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <FormControl
          type="text"
          label="Name"
          name="name"
          required
          error={errors.name}
          onChange={this.handleInputChange}
          value={name} />

        <FormControl label="Genre">
          <Select
            valueKey="id"
            labelKey="name"
            value={selectedGenre}
            onChange={this.setSelectedGenre}
            options={genres} />
        </FormControl>

        <div class="cms-form__control cms-form__control--actions">
          <input type="submit" className="cms-button" value="Save" />
        </div>
      </form>
    )
  }
}