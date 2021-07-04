import { ThemeType } from '../theme/types/ThemeType'

export const getPagesToPreventAddingThumbnailsTo = (theme: ThemeType) => {
  return [
    theme.variables.SystemPages.login.path,
    theme.variables.SystemPages.account.path,
    theme.variables.SystemPages.register.path,
    theme.variables.SystemPages.forgottenPassword.path,
    theme.variables.SystemPages.resetPassword.path,
    theme.variables.SystemPages.dashboard.path,
    theme.variables.SystemPages.sitemap.path,
    theme.variables.SystemPages.privateVideoAccess.path,
    'team-members',
    theme.localisation.passport.path,
  ]
}