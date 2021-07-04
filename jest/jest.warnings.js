global.originalLogError = global.console.error

global.console.error = (...args) => {
  /**
   * Avoid jsdom error message after submitting a form
   * https://github.com/jsdom/jsdom/issues/1937
   */
  const errorMessage = "Not implemented: HTMLFormElement.prototype.submit"
  if (args && args[0].includes(errorMessage)) {
    return false
  }

  global.originalLogError(...args)
  return true
}

global.originalLogWarning = global.console.warn
global.console.warn = (...args) => {
  /**
   * Devour is complaining because we are adding attributes to the models for mirageJS filters to work.
   * As these are not defined they cannot be serialised. Ignoring the warnings to keep console clear.
   */
  const devourWarningMessage = ", but it is not present on model config and therefore not deserialized."
  if (args && args[0].includes(devourWarningMessage)) {
    return false
  }

  global.originalLogWarning(...args)
  return true
}