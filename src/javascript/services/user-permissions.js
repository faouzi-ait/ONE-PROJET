function hasRole(user, roleName) {
  return user?.roles?.find(role => role.name == roleName)
}

export function isInternal(user) {
  return user['user-type'] == 'internal'
}

export function isExternal(user) {
  return user['user-type'] == 'external'
}

export function isBuyer(user) {
  return user['buyer-type'] == 'buyer'
}

export function isAdmin(user) {
  return hasRole(user, 'admin')
}

export function hasAtLeastOnePermission(user) {
  return user?.roles.find(role => Object.keys(role['permissions']).length > 0)
}

export function hasAdminPanelAccess(user) {
  return isAdmin(user) || hasAtLeastOnePermission(user)
}

export function hasPermission(user, permission) {
  return user?.roles?.find(role => role['permissions'][permission])
}

export function hasAnyPermission(user, permissions) {
  return user?.roles?.find(role => permissions.find(permission => role['permissions'][permission]))
}

export function hasAllPermissions(user, permissions) {
  return user?.roles && permissions.every(permission => hasPermission(user, permission))
}

export function checkPermissions(user, linkOrRoute) {
  return isAdmin(user) || hasAnyPermission(user, linkOrRoute.permissions)
}

export function checkFEPermissions(user, linkOrRoute) {
  if(!linkOrRoute.user && !linkOrRoute.permissions) { return true }
  if(!user) { return false }
  if(isAdmin(user)) { return true }
  return ( !linkOrRoute.user
           || linkOrRoute.user === true
           || (linkOrRoute.user === 'internal' && isInternal(user))
           || (linkOrRoute.user === 'external' && isExternal(user))
           || (linkOrRoute.user === 'external_buyer' && isBuyer(user))
         ) && (!linkOrRoute.permissions || hasAnyPermission(user, linkOrRoute.permissions))
}
