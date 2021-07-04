import { ColorType } from 'javascript/utils/theme/types/ApiStylesType'
import { TypographyType } from 'javascript/utils/theme/types/ApiStylesType'
import { RecursiveRequired } from 'javascript/utils/theme/types/ThemeType'

export type MakeDefaultStyles<T> = (params: { colors: ColorType; typography: TypographyType }) => RecursiveRequired<T>