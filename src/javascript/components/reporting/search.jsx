import React from 'react'
import { withRouter } from 'react-router-dom';

import Autosuggest from 'react-autosuggest'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import StylePrefixConsumer from 'javascript/utils/style-prefix/style-prefix-consumer'

class ReportingSearch extends React.Component {

  renderClear = () => {
    if(this.props.onClear && this.props.value) {
      return (
        <Button
          type="button"
          className="programme-search__clear"
          classesToPrefix={['programme-search']}
          onClick={ this.props.onClear }
        >
          <Icon id="i-close" />
          Clear Search
        </Button>
      )
    }
  }

  render() {
    let buttonClasses = 'button button--filled'
    /* #region  drg */
    buttonClasses = 'button button--filled button--search'
    /* #endregion */
    const modifiers = this.props.modifiers ? ['programme-search', ...this.props.modifiers] : ['programme-search']
    return (
      <StylePrefixConsumer>
        {(entryPoint) => {
          let formClasses = modifiers.join(' programme-search--')
          if (entryPoint === 'admin') {
            formClasses = formClasses.replace('programme-search', 'cms-programme-search')
          }
          return (
            <form className={ formClasses } onSubmit={((e) => {
              e.preventDefault()
              this.props.onSearch(e)
            }) }>
              <div className="container">
                <Autosuggest
                  suggestions={ this.props.suggestions }
                  onSuggestionsFetchRequested={ this.props.onSearch }
                  onSuggestionsClearRequested={ this.props.onReset }
                  getSuggestionValue={(suggestion) => (suggestion.label)}
                  renderSuggestion={(suggestion) => {
                      return <span>{ suggestion.label }</span>
                  }}
                  onSuggestionSelected={ (e, p) => this.props.onSelect(p) }
                  inputProps={{
                    placeholder: this.props.placeholder,
                    value: this.props.value || '',
                    onChange: this.props.onChange,
                    className: 'programme-search__input'
                  }}
                />
                { this.renderClear() }
                <Button type="submit" class={buttonClasses}>
                  <Icon id="i-mag" classes="button__icon"/>
                  Search
                </Button>
              </div>
            </form>
          )
       }}
      </StylePrefixConsumer>
    )
  }

}

export default withRouter(ReportingSearch)