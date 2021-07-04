// React
import React from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

// Store
import MarketingActivitiesStore from 'javascript/stores/marketing-activities'
import MarketingCategoriesStore from 'javascript/stores/marketing-categories'

// Actions
import MarketingActivitiesActions from 'javascript/actions/marketing-activities'
import MarketingCategoriesActions from 'javascript/actions/marketing-categories'

// Components
import Button from 'javascript/components/button'
import DatePicker from 'javascript/components/datepicker'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'
import withTheme from 'javascript/utils/theme/withTheme'

class MarketingActivitiesForm extends React.Component {
  constructor(props) {
    super(props)
    const { activity } = this.props
    this.resourceName = 'Marketing Activity'
    this.state = {
      activity: {},
      marketingCategories: [],
      selectedProgrammes: [],
      selectedCategory: '',
      isEditing: false,
      loading: false,
      errors: null,
      categoriesOpen: false
    }
    if (activity) {
      this.state = {
        activity,
        selectedProgrammes: activity['programmes'].map(programme => ({
          value: programme.id,
          label: programme.title
        })),
        selectedCategory: activity['marketing-category'].id,
        isEditing: true,
      }
    }
  }
  componentWillMount() {
    MarketingCategoriesStore.on('change', this.getResources)
  }
  componentWillUnmount() {
    MarketingCategoriesStore.removeListener('change', this.getResources)
  }
  componentDidMount() {
    MarketingCategoriesActions.getResources({
      fields: {
        'marketing-categories': 'name'
      }
    })
  }

  getResources = () => {
    this.setState({
      marketingCategories: MarketingCategoriesStore.getResources()
    })
    if (this.state.marketingCategories) {
      this.finishedLoading()
    }
    this.unsetModal()
  }

  retrieveErrors = () => {
    this.setState({
      errors: MarketingActivitiesStore.getErrors(),
      loading: false
    })
  }

  renderErrors = () => {
    if (this.state.errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)} {error}</li>
            )
          })}
        </ul>
      )
    }
  }

  marketingActivityKeys = () => {
    return [
      'date',
      'description',
      'programmes',
      'marketing-category'
    ]
  }

  saveActivity = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    let { activity } = this.state
    const keys = ['id', ...this.marketingActivityKeys()]
    MarketingActivitiesActions.updateResource(Object.keys(activity).filter(key => keys.includes(key)).reduce((obj, key) => {
      obj[key] = activity[key]
      return obj
    }, {}))
  }

  createActivity = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    let { activity } = this.state
    const keys = this.marketingActivityKeys()
    MarketingActivitiesActions.createResource(Object.keys(activity).filter(key => keys.includes(key)).reduce((obj, key) => {
      obj[key] = activity[key]
      return obj
    }, {}))
  }

  handleDescriptionChange = (e) => {
    const activity = Object.assign({}, this.state.activity)
    activity['description'] = e.target.value
    this.setState({
      activity
    })
  }

  handleProgrammeChange = (values) => {
    const { activity } = Object.assign({}, this.state)
    const programmes = []
    values.map((val) => {
      this.props.programmes.map((programme) => {
        if (val.value == programme.id) {
          programmes.push(programme)
        }
      })
    })
    activity.programmes = programmes
    this.setState({
      activity,
      selectedProgrammes: values
    })
  }

  handleCategoryChange = (selectedCategory) => {
    const { activity } = Object.assign({}, this.state)
    activity['marketing-category'] = this.state.marketingCategories.filter((category) => {
      return category.id === selectedCategory.value
    })[0]

    this.setState({
      activity,
      selectedCategory: selectedCategory.value
    })
  }

  handleDateChange = (date) => {
    const activity = Object.assign({}, this.state.activity)
    activity['date'] = date.toDate().toString()
    this.setState({
      activity
    })
  }

  renderCategories = (categories = []) => {
    const options = categories.map((category) => {
      return {
        value: category.id,
        label: category.name
      }
    })
    return <Select options={options} value={this.state.selectedCategory} multi={false}
      onChange={(e)=>{
        this.handleCategoryChange(e)
        this.setState({categoriesOpen: false})}
      }
      onFocus={()=>{this.setState({categoriesOpen: true})}}
      onBlur={()=>{this.setState({categoriesOpen: false})}}
      required />
  }

  renderProgrammes = (programmes) => {
    const options = programmes.filter((programme) => {
      return programme.label !== 'All'
    }).map((programme) => {
      return {
        value: programme.value,
        label: programme.label
      }
    })
    return <Select options={options} value={this.state.selectedProgrammes} multi={true} onChange={this.handleProgrammeChange} required/>
  }

  render() {
    const { activity, isEditing, loading, marketingCategories } = this.state
    const { programmes, closeEvent, theme } = this.props
    let submitAction = isEditing ? this.saveActivity : this.createActivity
    let buttonText = isEditing ? `Save ${this.resourceName}` : `Create ${this.resourceName}`
    let buttonClasses = loading ? 'button button--filled button--loading' : 'button button--filled'
    return (
      <div className="container">
        <form className="cms-form cms-form--large" onSubmit={submitAction}>
          <h3 className="cms-form__title cms-form__title--compact">{this.resourceName} Details</h3>
          <FormControl label="Activity Date">
            <DatePicker selected={activity['date']} required onChange={this.handleDateChange} dateFormat={theme.features.formats.mediumDate} showYearDropdown />
          </FormControl>
          <FormControl type="text" label="Description" name="description" value={activity['description']} maxlength="255" onChange={this.handleDescriptionChange} required/>
          <FormControl label={pluralize(theme.localisation.programme.upper)}>
            {this.renderProgrammes(programmes)}
          </FormControl>
          <FormControl label="Activity Category">
            {this.renderCategories(marketingCategories)}
          </FormControl>
          <div className="cms-form__control cms-form__control--actions" style={{paddingBottom: this.state.categoriesOpen ? '80px': '00'}}>
            {this.renderErrors()}
            <Button className={buttonClasses} onClick={closeEvent}>Cancel</Button>
            <Button type="submit" className={buttonClasses}>{buttonText}</Button>
          </div>
        </form>
      </div>
    )
  }
}

export default withTheme(MarketingActivitiesForm)
