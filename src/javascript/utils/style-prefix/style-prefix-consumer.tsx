import { StylePrefixContext, StylePrefixType } from 'javascript/utils/style-prefix/style-prefix-provider'

const StylePrefixConsumer = StylePrefixContext.Consumer

export default StylePrefixConsumer

/**
 * Usage:
 *
 * <StylePrefixConsumer>
 *   {(entrypoint) => (
 *      <SomeComponent className={entryPoint === 'admin' ? 'cms-style' : 'application-style'}></SomeComponent>
 *   )}
 * </StylePrefixConsumer>
 */


 export const getPrefix = (entryPoint: StylePrefixType) => {
    return entryPoint === 'admin' ? 'cms-' : ''
 }