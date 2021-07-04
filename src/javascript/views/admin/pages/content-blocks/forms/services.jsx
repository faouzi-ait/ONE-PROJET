import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'
import withTheme from 'javascript/utils/theme/withTheme'

class BannerCarouselBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        background: props.block ? props.block.background : 'light',
        items: props.block ? props.block.items.map((obj) => Object.assign({}, obj)) : [],
        type: 'services',
        title: null
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: []
    }
    this.resourceName = 'items'
    this.model = {
      title: '',
      intro: ''
    }
    this.theme = props.theme
  }

  setValidation = () => ['items']
  setResourceValidation = () => ['title', 'intro']
}

export default withTheme(BannerCarouselBlockForm)