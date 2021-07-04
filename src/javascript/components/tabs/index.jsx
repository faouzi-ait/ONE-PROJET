import React from 'react'

import 'stylesheets/core/components/tabs'
import 'stylesheets/admin/components/cms-tabs'

import compose from 'javascript/utils/compose'
import withPrefix from 'javascript/components/hoc/with-prefix'

import Select from 'react-select'
import Icon from 'javascript/components/icon'


class Tabs extends React.Component {
  constructor(props) {
    super(props)
    this.media = window.matchMedia('(min-width: 768px)')
    this.state = {
      active: props.active || 0,
      showTabs: this.media.matches,
    }
  }

  componentWillMount() {
    this.media.addListener(this.resize)
  }

  componentWillUnmount() {
    this.media.removeListener(this.resize)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.active !== this.props.active) {
      this.setState({
        active: this.props.active
      })
    }
  }

  resize = ({ matches }) => {
    this.setState(() => ({
      showTabs: matches,
    }))
  }

  changeTab = e => {
    const { onChange = function() {} } = this.props
    this.setState(
      {
        active: e.value,
      },
      onChange.bind(null, e),
    )
  }

  render() {
    let { children, prefix } = this.props
    children = children.filter(tab => tab)
    return (
      <div className={`${this.props.containerClasses || ''}`}>
        {children.length > 1 && (
          <div className="container">
            {this.state.showTabs ? (
              <div className={`${prefix}tabs ${this.props.classes || ''}`}>
                {children.map((item, key) => {
                  if (item === undefined) {
                    return false
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      className={[
                        `${prefix}tabs__item`,
                        key == this.state.active && 'active',
                        item.props.icon && 'with-icon'
                      ].join(` ${prefix}tabs__item--`)}
                      onClick={this.changeTab.bind(null, { value: key })}
                    >
                      {item.props.icon && (
                        <Icon {...item.props.icon} className="tabs__icon" />
                      )}
                      <span className={`${prefix}tabs__title`}>{item.props.title}</span>
                      {item.props.subtitle && (
                        <span className={`${prefix}tabs__sub`}>{item.props.subtitle}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Select
                value={this.state.active}
                className={`${prefix}tabs__select`}
                onChange={this.changeTab}
                placeholder={false}
                clearable={false}
                searchable={false}
                options={children.map((item, key) => {
                  if (item === undefined) {
                    return false
                  }
                  return {
                    value: key,
                    label: item.props.title,
                  }
                })}
              />
            )}
          </div>
        )}

        {children.map((t, i) => {
          if (t === undefined) {
            return false
          }

          return React.cloneElement(t, {
            key: i,
            title: null,
            style: {
              display: i === this.state.active ? 'block' : 'none',
            },
          })
        })}
      </div>
    )
  }
}

const enhance = compose(
  withPrefix
)

export default enhance(Tabs)