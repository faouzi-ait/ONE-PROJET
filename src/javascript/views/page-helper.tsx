import React from 'react'
import ReactDOM from 'react-dom'

export default class PageHelper<
  InheritedProps extends any,
  InheritedState extends any
> extends React.Component<
  InheritedProps,
  InheritedState & {
    errored: boolean
    loaded: boolean
  }
> {
  constructor(props) {
    super(props)
    // @ts-ignore
    this.state = {
      errored: false,
      loaded: false,
    }
  }

  receivedError = () => {
    //@ts-ignore
    this.setState({
      errored: true,
    })
  }

  finishedLoading = () => {
    //@ts-ignore
    this.setState({
      loaded: true,
    })
  }

  unsetModal = (callback: (() => void) | any = () => {}) => {
    if (this.refs.modal) {
      ReactDOM.findDOMNode(this.refs.modal).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState(
          {
            //@ts-ignore
            modal: () => {},
          },
          typeof callback === 'function' ? callback : () => {},
        )
      }, 500)
    }
  }
}
