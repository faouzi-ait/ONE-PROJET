const makeNavigation = (navigationMapping, navOptions) => {
  const navigationMenu = []
  try {
    let navId = 0
    navigationMapping.forEach((navKey) => {
      if (Array.isArray(navKey)) {
        if (!navigationMenu.length) throw 'Cannot build subNav on first element'
        const subNavIndex = navigationMenu.length - 1
        if (!navigationMenu[subNavIndex].subNav) {
          navigationMenu[subNavIndex].subNav = []
        }
        navKey.forEach((subNavKey, subNavId) => {
          const subNavItem = navOptions[subNavKey](`${navId-1}-${subNavId}`)
          if (subNavItem) {
            navigationMenu[subNavIndex].subNav.push(subNavItem)
          }
        })
      } else {
        const navItem = navOptions[navKey](navId)
        if (navItem) {
          navId += 1
          navigationMenu.push(navItem)
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
  return navigationMenu
}

export default makeNavigation

