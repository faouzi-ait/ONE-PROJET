/**
 * Use this type for logic which replaces region tags,
 * keyed by the name of the component
 */

export interface BannerType {
  title?: string
  copy?: string
  classes?: string[]
  image?: string
}

export interface IconType {
  width: number
  height: number
  viewBox?: string
}

export interface CarouselSlideBreakpointType {
  slidesToShow?: number,
  arrows?: boolean
  dots?: boolean
  scrollBar?: boolean
}
export interface CarouselSlideType {
  xlarge?: CarouselSlideBreakpointType,
  large?: CarouselSlideBreakpointType,
  medium?: CarouselSlideBreakpointType,
  small?: CarouselSlideBreakpointType
}
export interface OptionType {
  value: string,
  label: string
}
export interface ComponentsType {
  brands?: any,
  banners?: {
    forgottenPassword?: BannerType
    confirmation?: BannerType
  }
  filters?: {
    titleIcon?: IconType
  }
  addToList : {
    carousel?: CarouselSlideType
  }
  forms: {
    titleOptions: OptionType[]
  }
}
