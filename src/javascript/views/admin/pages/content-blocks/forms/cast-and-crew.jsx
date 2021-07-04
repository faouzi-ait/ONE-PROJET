import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'

import withTheme from 'javascript/utils/theme/withTheme'
class CastCrewBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        title: props.block ? props.block.title : '',
        people: props.block ? props.block.people.map((obj) => Object.assign({}, obj)) : [],
        bgImage: props. block ? props.block.bgImage : {
          id: null,
          name: null
        },
        type: 'cast-and-crew'
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: []
    }
    this.resourceName = 'person'
    this.model = {
      name: '',
      role: '',
      imageIds: []
    },
    this.theme = props.theme
  }

  setValidation = () => ['people']
  setResourceValidation = () => ['name', 'role', 'imageIds']
}

export default withTheme(CastCrewBlockForm)