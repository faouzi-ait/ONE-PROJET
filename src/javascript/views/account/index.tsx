// React
import React from 'react'
import Banner from 'javascript/components/banner'
import Card from 'javascript/components/card'
import Meta from 'react-document-meta'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import {
  isAdmin,
  isInternal,
  hasPermission,
} from 'javascript/services/user-permissions'
import useSWR from 'swr'
import { findAllByModel } from 'javascript/utils/apiMethods'
import PageLoader from 'javascript/components/page-loader'
import Icon from 'javascript/components/icon'

import allClientVariables from './variables'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { WithUserType } from 'javascript/components/hoc/with-user'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'


interface Props extends WithThemeType, WithUserType {}

const MyAccount: React.FC<Props> = ({ theme, user }) => {

  const accountCV = useClientVariables(allClientVariables)
  const isLite = theme.features.lite
  const { data, error } = useSWR('my-account-images', () =>
    findAllByModel('pages', {
      fields: ['banner-urls', 'slug', 'thumbnail'],
      filter: {
        slug: [
          theme.variables.SystemPages.account.path,
          theme.variables.SystemPages.profile.path,
          theme.variables.SystemPages.list.path,
          `meetings`,
          `events`,
          `approvals`,
          `reporting`,
        ].join(','),
      },
    }),
  )


  let bannerImageFromApi = undefined
  let profileImage = ''
  let meetingsImage = ''
  let eventsImage = ''
  let approvalsImage = ''
  let reportingImage = ''
  let listImage = ''

  const fallbackImage = isLite ? accountCV.bannerImage : undefined
  if (data) {
    data.forEach(page => {
      switch (page.slug) {
        case theme.variables.SystemPages.account.path:
          bannerImageFromApi = page?.['banner-urls']?.default ? page?.['banner-urls'] : fallbackImage
          break
        case theme.variables.SystemPages.profile.path:
          profileImage = page['thumbnail'].url || fallbackImage
          break
        case theme.variables.SystemPages.list.path:
          listImage = page['thumbnail'].url || fallbackImage
          break
        case `meetings`:
          meetingsImage = page['thumbnail'].url || fallbackImage
          break
        case `events`:
          eventsImage = page['thumbnail'].url || fallbackImage
          break
        case `approvals`:
          approvalsImage = page['thumbnail'].url || fallbackImage
          break
        case `reporting`:
          reportingImage = page['thumbnail'].url || fallbackImage
          break
        default:
          bannerImageFromApi = NO_CUSTOM_BANNER
      }
    })
  }

  const renderTitle = (title, iconId) => {
    return (
      <>
        <ClientSpecific client="ae">
          <Icon id={iconId} className="card__title-icon" />
        </ClientSpecific>
        {title}
      </>
    )
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.variables.SystemPages.account.upper}`}
      meta={{
        description: `Your gateway to ${theme.localisation.client}`,
      }}
    >
      <main>
        <PageLoader loaded={data} errored={error}>
          <div className="fade-on-load">
            <Banner
              title={theme.variables.SystemPages.account.upper}
              classes={accountCV.bannerClasses}
              image={bannerImageFromApi === NO_CUSTOM_BANNER ? accountCV.bannerImage : bannerImageFromApi}
            />

            <Breadcrumbs
              paths={[
                {
                  name: theme.variables.SystemPages.account.upper,
                  url: `/${theme.variables.SystemPages.account.path}`,
                },
              ]}
            />
            <AccountNavigation currentPage={`/${theme.variables.SystemPages.account.path}`} />
            <section className={accountCV.sectionClasses}>
              <div className={accountCV.containerClasses}>
                <div className={accountCV.gridClasses}>
                  <ClientProps
                    clientProps={{
                      size: {
                        'default': 'poster',
                        'ae': 'posterLarge'
                      },
                  }}
                  renderProp={(clientProps) => (
                    <div>
                      <Card
                        title={renderTitle(theme.variables.SystemPages.profile.upper, 'i-user')}
                        url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.profile.path}`}
                        images={profileImage !== 'liteBanner' && [
                          profileImage || require('images/theme/pages/profile.png')
                        ]}
                        classes={['poster']}
                        {...clientProps}
                      />
                    </div>
                  )} />
                  {theme.features.users.lists && (
                    <div>
                      <Card
                        title={renderTitle(theme.variables.SystemPages.list.upper, 'i-lists')}
                        url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}`}
                        images={listImage !== 'liteBanner' && [
                          listImage || require('images/theme/pages/lists.png')
                        ]}
                        classes={['poster']}
                        size="poster"
                      />
                    </div>
                  )}
                  {theme.features.users.meetings.enabled &&
                    isInternal(user) && (
                      <div className="lg-hidden">
                        <Card
                          title={renderTitle(theme.variables.SystemPages.meeting.upper, 'i-meetings')}
                          url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`}
                          images={meetingsImage !== 'liteBanner' && [
                            meetingsImage || require('images/theme/pages/meetings.png')
                          ]}
                          classes={['poster']}
                          size="poster"
                        />
                      </div>
                    )}
                  {theme.features.users.meetings.events && isInternal(user) && (
                    <div className="lg-hidden">
                      <Card
                        title={theme.variables.SystemPages.events.upper}
                        url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.events.path}`}
                        images={eventsImage !== 'liteBanner' && [
                          eventsImage || require('images/theme/pages/events.png')
                        ]}
                        classes={['poster']}
                        size="poster"
                      />
                    </div>
                  )}
                  {(isAdmin(user) ||
                    hasPermission(user, 'manage_approvals')) && (
                    <div>
                      <Card
                        title={renderTitle(theme.variables.SystemPages.approvals.upper, 'i-approvals')}
                        url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.approvals.path}`}
                        images={approvalsImage !== 'liteBanner' && [
                          approvalsImage || require('images/theme/pages/user-approvals.png')
                        ]}
                        classes={['poster']}
                        size="poster"
                      />
                    </div>
                  )}
                  {theme.features.reporting &&
                    (isAdmin(user) ||
                      hasPermission(user, 'view_reporting')) && (
                      <div className="lg-hidden">
                        <Card
                          title={renderTitle(theme.variables.SystemPages.reporting.upper, 'i-reporting')}
                          url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.reporting.path}`}
                          images={reportingImage !== 'liteBanner' && [
                            reportingImage || require('images/theme/pages/reporting.png')
                          ]}
                          classes={['poster']}
                          size="poster"
                        />
                      </div>
                    )}
                </div>
              </div>
            </section>
          </div>
        </PageLoader>
      </main>
    </Meta>
  )
}

export default MyAccount
