import { ThemeContext } from './ThemeProvider'

const ThemeConsumer = ThemeContext.Consumer

export default ThemeConsumer

/**
 * Usage:
 * 
 * <ThemeConsumer>
 *   {(theme) => (
 *      <SomeComponent themeVariable={theme.variable}></SomeComponent>
 *   )}
 * </ThemeConsumer>
 */