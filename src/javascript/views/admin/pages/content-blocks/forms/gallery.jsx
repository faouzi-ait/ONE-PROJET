import NestedBlock from 'javascript/views/admin/pages/content-blocks/nested-block'

import withTheme from 'javascript/utils/theme/withTheme'
class GalleryBlockForm extends NestedBlock {
  constructor(props) {
    super(props)
    this.state = {
      block: {
        title: null,
        background: props.block ? props.block.background : 'light',
        images: props.block ? props.block.images.map((obj) => Object.assign({}, obj)) : [],
        bgImage: props. block ? props.block.bgImage : {
          id: null,
          name: null
        },
        type: 'gallery'
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: []
    }
    this.resourceName = 'image'
    this.model = {
      title: '',
      description: '',
      alt: '',
      imageIds: []
    },
    this.theme = props.theme
  }

  setValidation = () => ['images']
  setResourceValidation = () => ['title', 'alt', 'imageIds']
}

export default withTheme(GalleryBlockForm)