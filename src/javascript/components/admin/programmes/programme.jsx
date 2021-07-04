// React
import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import styled from 'styled-components'

import HelperComponent from 'javascript/components/helper'
import NavLink from 'javascript/components/nav-link'
import withTheme from 'javascript/utils/theme/withTheme'

class Resource extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'cms-table__row'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    return (
      <tr
        className={`with-action ${this.state.classes}`}
        name={this.props.name}
        draggable={this.props.draggable}
        onDragEnd={this.props.onDragEnd}
        onDragOver={this.props.onDragOver}
        onDragStart={this.props.onDragStart}
        onDrop={this.props.onDrop}
      >
        <td className="cms-table__image">
          {this.props.images.map((image, i) => {
            if (this.props.linkTo) {
              return (
                <Link key={i} to={this.props.linkTo}>
                  <img src={image} role="presentation" />
                </Link>
              )
            } else {
              return <img src={image} role="presentation" key={i} />
            }
          })}
        </td>
        <td>
          {this.props.linkTo ? (
            <NavLink to={this.props.linkTo}>{this.props.name}</NavLink>
          ) : (
            <p>{this.props.name}</p>
          )}
        </td>
        {this.props.tags && (
          <CountTagColumn>
            {this.props.tags.map(t => (
              <span className="count count--disabled" key={t.id}>
                {t.name}
              </span>
            ))}
          </CountTagColumn>
        )}
        <CountTagColumn>
          {this.props.active === false && (
            <span class="count count--disabled">Inactive</span>
          )}
        </CountTagColumn>
        <CountTagColumn>
          {this.props.restricted && (
            <span class="count count--warning">Restricted</span>
          )}
        </CountTagColumn>
        {this.props.createdDate && (
          <td>
            {moment(this.props.createdDate).format(this.props.theme.features.formats.shortDate)}
          </td>
        )}
        <td className="cms-table__actions">{this.props.children}</td>
      </tr>
    )
  }
}

export default withTheme(Resource)

const CountTagColumn = styled.td`
  max-width: 80px;
`