import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import withTheme from 'javascript/utils/theme/withTheme'

class PressBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        presses: props.block ? props.block.presses.map((obj) => Object.assign({}, obj)) : [],
        type: 'press',
        bgImage: props. block ? props.block.bgImage : {
          id: null,
          name: null
        },
        title: null
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: []
    }
    this.resourceName = 'press'
    this.model = {
      quote: '',
      name: '',
      author: '',
      imageIds: []
    }
    this.theme = props.theme
  }

  setValidation = () => ['presses']
}

export default withTheme(PressBlockForm)