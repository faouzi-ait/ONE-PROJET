import React from 'react'

import 'stylesheets/core/components/paginator'

import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables, { withDefaultClientVariables } from 'javascript/utils/client-switch/with-client-variables'
import withPrefix from '../hoc/with-prefix'

import Button from 'javascript/components/button'
import Div from 'javascript/components/div'
import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'
import Select from 'react-select'
import Span from 'javascript/components/span'

class Paginator extends HelperComponent {
  constructor(props) {
    super(props)
    this.updatePage = this.updatePage.bind(this)
    this.updatePageSize = this.updatePageSize.bind(this)
    this.renderPrevious = this.renderPrevious.bind(this)
    this.renderNext = this.renderNext.bind(this)
    this.renderFirst = this.renderFirst.bind(this)
    this.renderLast = this.renderLast.bind(this)
    this.renderPages = this.renderPages.bind(this)
    this.renderPageSize = this.renderPageSize.bind(this)
    this.resourceName = 'paginator'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  updatePage(e) {
    this.props.onChange(parseInt(e.target.dataset.page))
  }

  updatePageSize(e) {
    this.props.onPageSizeChange(e.value)
  }

  renderPrevious() {
    const { currentPage, totalPages } = this.props
    let disabled = currentPage === 1
    let url = currentPage - 1
    if(totalPages > 0) {
      return (
        <Button disabled={disabled && true}
          onClick={ this.updatePage }
          data-page={ !disabled && url }
          className={disabled ? 'paginator__arrow paginator__arrow--is-disabled paginator__arrow--previous' : 'paginator__arrow paginator__arrow--previous'}
          classesToPrefix={['paginator']}
        >
          <Icon {...this.getCmsFriendlyClientVariables().arrowIcon} id="i-left-arrow" classes="paginator__icon" />
          Previous Page
        </Button>
      )
    }
  }

  getCmsFriendlyClientVariables = () => {
    const {
      defaultPaginatorClientVariables,
      paginatorClientVariables,
      stylePrefixEntryPoint,
    } = this.props
    return stylePrefixEntryPoint === 'admin' ? defaultPaginatorClientVariables : paginatorClientVariables
  }

  renderNext() {
    const { currentPage, totalPages } = this.props
    let disabled = currentPage === totalPages
    let url = currentPage + 1
    if(totalPages > 0) {
      return (
        <Button disabled={disabled && true}
          onClick={ this.updatePage }
          data-page={ !disabled && url }
          className={disabled ? 'paginator__arrow paginator__arrow--is-disabled paginator__arrow--next' : 'paginator__arrow paginator__arrow--next'}
          classesToPrefix={['paginator']}
        >
          <Icon {...this.getCmsFriendlyClientVariables().arrowIcon} id="i-right-arrow" classes="paginator__icon" />
          Next Page
        </Button>
      )
      }
  }

  renderFirst() {
    const { currentPage, totalPages } = this.props
    if(currentPage > 3 && totalPages > 7) {
      return (
        <Div className="paginator__end" classesToPrefix={['paginator']}>
          <Button onClick={ this.updatePage } data-page="1" className="paginator__button" classesToPrefix={['paginator']}>1</Button>
          <Span className="paginator__ellipsis" classesToPrefix={['paginator']}>...</Span>
        </Div>
      )
    }
  }

  renderLast() {
    const { currentPage, totalPages } = this.props
    if(totalPages > 7 && currentPage < (totalPages - 4)) {
      return (
        <Div className="paginator__end" classesToPrefix={['paginator']}>
          <Span className="paginator__ellipsis" classesToPrefix={['paginator']}>...</Span>
          <Button onClick={ this.updatePage } data-page={ totalPages } className="paginator__button" classesToPrefix={['paginator']}>{ totalPages }</Button>
        </Div>
      )
    }
  }

  renderPageSize() {
    const { currentPageSize, onPageSizeChange} = this.props

    const pageOptions = [{
      value: 50,
      label: 50
    },{
      value: 100,
      label: 100
    },{
      value: 200,
      label: 200
    }]
    if (onPageSizeChange) {
      return (
        <Select
          options={pageOptions}
          value={currentPageSize || 50}
          onChange={this.updatePageSize}
          clearable={false}
          searchable={false}
        />
      )
    }
  }

  renderPages() {
    const { currentPage, totalPages } = this.props
    let start = currentPage - 2 < 1 ? 1 : currentPage - 2
    start = start + 7 > totalPages ? totalPages - 6 : start
    start = start < 1 ? 1 : start
    let end = start + 7 > totalPages ? totalPages : 7 + start - 1
    let pages = []
    for(let i = start; i <= end; i ++) {
      pages.push(i)
    }
    let buttons = pages.map((page) => {
      let classes = ['paginator__button', page === currentPage && 'is-active'].join(` paginator__button--`)
      return (
        <Button key={ page } onClick={ this.updatePage } data-page={ page } className={ classes } classesToPrefix={['paginator']}>{ page }</Button>
      )
    })
    return buttons
  }

  render() {
    return (
      <div className={ this.state.classes }>
        { this.props.totalPages > 1 && this.renderPrevious() }
        { this.props.totalPages > 1 && this.renderFirst() }
        { this.props.totalPages > 1 && this.renderPages() }
        { this.props.totalPages > 1 && this.renderLast() }
        { this.props.totalPages > 1 && this.renderNext() }
        { this.renderPageSize() }
      </div>
    )
  }

}

const enhance = compose(
  withClientVariables('paginatorClientVariables', allClientVariables),
  withDefaultClientVariables('defaultPaginatorClientVariables', allClientVariables),
  withPrefix,
)

export default enhance(Paginator)