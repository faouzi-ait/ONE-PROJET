import NestedBlock from "javascript/views/admin/pages/content-blocks/nested-block";

import withTheme from 'javascript/utils/theme/withTheme'
import locationsClientVariables from 'javascript/views/blocks/_locations/variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

class LocationsBlockForm extends NestedBlock {
  constructor(props) {
    super(props);
    this.state = {
      block: {
        background: props.block ? props.block.background : "light",
        title: props.block ? props.block.title : "",
        locations: props.block
          ? props.block.locations.map(obj => Object.assign({}, obj))
          : [],
        bgImage: props.block
          ? props.block.bgImage
          : {
              id: null,
              name: null
            },
        type: "locations"
      },
      fileManager: () => {},
      errors: [],
      resourceErrors: []
    };
    this.resourceName = "location";
    this.model = {
      name: "",
      subtitle: "",
      addressOne: "",
      addressTwo: "",
      addressThree: "",
      addressFour: "",
      email: "",
      telephone: "",
      imageIds: []
    };
    this.theme = props.theme
  }
  setValidation = () => ["locations"];
  setResourceValidation = () => this.props.locationsCV.validation;
}

const enhance = compose(
  withTheme,
  withClientVariables('locationsCV', locationsClientVariables)
)

export default enhance(LocationsBlockForm)