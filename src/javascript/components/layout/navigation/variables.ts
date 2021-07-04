export default {
  closeButtonClasses: {
    default: 'button button--icon',
    ae: 'button burger'
  },
  cmsResourceItemsHaveDivide: {
    default: true,
    'wildbrain': false
  },
  icon: {
    default: () => null,
    ae: (name, theme) => name === theme.variables.SystemPages.account.upper && 'i-account' ||
      name === theme.localisation.catalogue.upper && 'i-catalogue' || null
  }
}