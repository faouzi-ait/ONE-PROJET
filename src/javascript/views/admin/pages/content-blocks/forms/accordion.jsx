import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'

import withTheme from 'javascript/utils/theme/withTheme'

class AccordianBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        title: null,
        background: props.block ? props.block.background : 'light',
        accordions: props.block ? props.block.accordions.map((obj) => Object.assign({}, obj)) : [],
        bgImage: props. block ? props.block.bgImage : {
          id: null,
          name: null
        },
        type: 'accordion'
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: [],
    }
    this.resourceName = 'accordions'
    this.model = {
      title: '',
      content: ''
    }
    this.theme = props.theme
  }

  setValidation = () => ['accordions']
  setResourceValidation = () => ['title', 'content']
}

export default withTheme(AccordianBlockForm)