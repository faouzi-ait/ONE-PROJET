import { ApiLocalisationType } from 'javascript/utils/theme/types/ApiLocalisationType'
import { ApiFeatureType } from 'javascript/utils/theme/types/ApiFeaturesType'
import { ThemeVariablesType } from './ThemeVariablesType'
import { ApiStyleType } from 'javascript/utils/theme/types/ApiStylesType'
import { ComponentsType } from './ComponentsType'

/** The shape which the theme follows */
export type ThemeType = {
  features: ApiFeatureType
  localisation: ApiLocalisationType
  variables: ThemeVariablesType
  customer: any
  styles: RecursiveRequired<ApiStyleType>
  components: ComponentsType
}

export type CustomThemeType = RecursivePartial<ThemeType>

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? U extends object
      ? RecursivePartial<U>[]
      : any[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

export type RecursiveRequired<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? RecursiveRequired<U>[]
    : T[P] extends object
    ? RecursiveRequired<T[P]>
    : T[P]
}
