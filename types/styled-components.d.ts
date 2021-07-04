import { ThemeType } from "javascript/utils/theme/types/ThemeType";

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}