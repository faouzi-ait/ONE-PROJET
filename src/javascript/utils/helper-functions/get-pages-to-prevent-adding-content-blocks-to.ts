import { ThemeType } from '../theme/types/ThemeType'

export const getPagesToPreventAddingContentBlocksDataTo = (theme: ThemeType) => {
  return [
    theme.variables.SystemPages.login.path,
    theme.variables.SystemPages.account.path,
    theme.variables.SystemPages.register.path,
    theme.variables.SystemPages.forgottenPassword.path,
    theme.variables.SystemPages.resetPassword.path,
    theme.variables.SystemPages.list.path,
    theme.variables.SystemPages.sitemap.path,
    theme.variables.SystemPages.privateVideoAccess.path,
    theme.localisation.passport.path,
    theme.variables.SystemPages.profile.path,
    theme.variables.SystemPages.meeting.path,
    theme.variables.SystemPages.events.path,
    theme.variables.SystemPages.approvals.path,
    theme.variables.SystemPages.reporting.path,
    theme.variables.SystemPages.news.path,
    theme.variables.SystemPages.myAssets.path,
  ]
}