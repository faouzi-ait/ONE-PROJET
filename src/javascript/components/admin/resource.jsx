// React
import React from 'react'
import HelperComponent from 'javascript/components/helper'
import withPrefix from 'javascript/components/hoc/with-prefix'

class Resource extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = `${props.prefix}table__row`
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    return (
      <tr className={ `with-action ${this.state.classes}` }
        name={this.props.name}
        draggable={this.props.draggable}
        onDragEnd={this.props.onDragEnd}
        onDragOver={this.props.onDragOver}
        onDragStart={this.props.onDragStart}
        onDrop={this.props.onDrop}
      >
        <td>{ this.props.name}</td>
        { this.props.fields && this.props.fields() }
        { this.props.children &&
          <td className={`${this.props.prefix}table__actions`}>
            { this.props.children }
          </td>
        }
      </tr>
    )
  }
}

export default withPrefix(Resource)