export const scrubNullValuesFromStyles = styleObj =>
  Object.keys(styleObj).reduce((acc, key) => {
    /* Ensure styleObj values that are set to null from the API are not saved and therefore override inheritedLiteStyles */
    if (styleObj[key] === null) return acc
    if (typeof styleObj[key] === 'object' && !Array.isArray(styleObj[key])) {
      acc[key] = scrubNullValuesFromStyles(styleObj[key])
    } else {
      acc[key] = styleObj[key]
    }
    return acc
  }, {})
