import { ModalType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'

const makeDefaultModalsStyles: MakeDefaultStyles<ModalType> = ({
  colors,
  typography,
}) => ({
  backgroundColor: '#000000',
  backgroundOpacity: 80,
})

export default makeDefaultModalsStyles
