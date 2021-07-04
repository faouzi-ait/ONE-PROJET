import React from 'react'

interface Props {
  classes: string[]
}

interface State {
  classes: string
}

export default class HelperComponent<InheritedProps extends any, InheritedState extends State> extends React.Component<InheritedProps & Props, InheritedState & State> {
  resourceName: string
  constructor(props) {
    super(props)
    // @ts-ignore
    this.state = {
      classes: ''
    }
  }
  componentWillReceiveProps(props) {
    this.setState({
      classes: [this.resourceName, ...(props.classes || [])].filter(Boolean).join(
        ` ${this.resourceName}--`,
      ),
    })
  }

  setClasses = (props: Props) => {
    this.setState({
      classes: [this.resourceName, ...(props.classes || [])].filter(Boolean).join(
        ` ${this.resourceName}--`,
      ),
    })
  }
}
