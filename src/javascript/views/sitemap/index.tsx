// React
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Meta from 'react-document-meta'

import { findAllByModel } from 'javascript/utils/apiMethods'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import allClientVariables from './variables'
import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withLoader, { WithLoaderType } from 'javascript/components/hoc/with-loader'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'

import Banner from 'javascript/components/banner'

import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { WithUserType } from 'javascript/components/hoc/with-user'

interface Props extends WithThemeType, WithUserType, WithLoaderType {}

const blackListPageTypes = (user) => ({
  'anonymous_access': true,
  'catalogue': true,
  'dashboard': !user,
  'forgotten_password': true,
  'home': true,
  'login': !!user,
  'my_assets': !user,
  'my_programmes': !user,
  'passport': !user,
  'private_video_access': true,
  'producer_hub': !user,
  'register': !!user,
  'reset_password': true,
  'sitemap': true,
})

const accountPageTypes = {
  'account': true,
  'approvals': true,
  'events': true,
  'list': true,
  'profile': true,
  'meeting': true,
  'reporting': true,
}

const Sitemap: React.FC<Props> = ({
  pageIsLoading,
  theme,
  user,
}) => {
  const [collections, setCollections] = useState(null)
  const [pages, setPages] = useState(null)
  const [programmes, setProgrammes] = useState(null)

  const { systemPages } = useSystemPages()
  const sitemapCV = useClientVariables(allClientVariables)

  pageIsLoading([!collections, !pages, !programmes])

  useEffect(() => {
    findAllByModel('collections', {
      fields: [
        'title', 'position', 'pages', 'published', 'slug',
      ],
      include: [ 'pages' ],
      includeFields: {
        pages: [
          'title', 'position', 'published', 'slug'
        ]
      },
      sort: 'position'
    }).then(setCollections)

    findAllByModel('pages', {
      include: ['collection'],
      fields: [
        'title', 'position', 'published', 'slug', 'page-type', 'collection'
      ],
      filter: {
        parentless: true,
        all: true
      },
      sort: 'position'
    }).then((pagesResponse) => {
      const blacklistedPages = blackListPageTypes(user)
      const allowedPages = pagesResponse.filter((pg) => !blacklistedPages[pg['page-type']] && !accountPageTypes[pg['page-type']])
      const accountPages = user ? pagesResponse.filter((pg) => accountPageTypes[pg['page-type']]) : []
      const account = {
        ...accountPages.find((pg) => pg['page-type'] === 'account'),
        pages: accountPages.filter((pg) => pg['page-type'] !== 'account')
      }
      setPages([account, ...allowedPages])
    })

    findAllByModel('programmes', {
      fields: [ 'id', 'title' ],
      page: {
        size: 'all'
      },
      filter: {
        restricted: false,
        active: true
      }
    }).then(setProgrammes)

  }, [user])

  const renderPages = () => {
    let links
    if (pages && collections) {
      links = collections.concat(pages).sort((a,b) => a.position - b.position)
    }
    if (links) {
      return links.map((link) => {
        const menuItemEnabled = systemPages.includesSlugAndEnabledFeature(link.slug).enabled
        if (menuItemEnabled && link.published) {
          if(link.pages) {
            let subItems = link.pages.map((subLink, i) => {
              const subMenuItemEnabled = systemPages.includesSlugAndEnabledFeature(subLink.slug).enabled
              if (subLink.published && subMenuItemEnabled) {
                return (
                  <li key={ i }>
                    <NavLink to={ `/${link.slug}/${subLink.slug}` }>{ subLink.title }</NavLink>
                  </li>
                )
              }
            })
            return (
              <li key={ link.id }>
                <NavLink to={ `/${link.slug}` }>{ link.title }</NavLink>
                <ul>
                  { subItems }
                </ul>
              </li>
            )
          } else {
            return (
              <li key={ link.id }>
                <NavLink to={ `/${link.slug}` }>{ link.title }</NavLink>
              </li>
            )
          }
        }
      })
    }
  }

  const renderProgrammes = () => {
    let links = (programmes || []).sort((a, b) => a.title.localeCompare(b.title)).map((link) => {
      return (
        <li key={ link.id }>
          <NavLink to={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(link, theme)}`}>{ link.title }</NavLink>
        </li>
      )
    })
    return links
  }

  return (
    <Meta
      title={`${theme.localisation.client} :: Sitemap`}
      description='Where content lives'
      meta={{
        name: {
          robots: 'noindex'
        }
      }}>
      <main>
        <div className="fade-on-load">
          <LoadPageBannerImage slug="sitemap" fallbackBannerImage={sitemapCV.defaultBannerImage}>
            {({ image }) => {
              return (
                <Banner
                  title="Sitemap"
                  classes={sitemapCV.bannerClasses}
                  image={image}
                />
              )
            }}
          </LoadPageBannerImage>
          <section className="section section--shade">
            <div className="container wysiwyg">
              <ul>
                <li>
                  <NavLink exact to="/">Home</NavLink>
                </li>
                <li>
                  <NavLink exact to={`/${theme.variables.SystemPages.catalogue.path}`}>{ theme.variables.SystemPages.catalogue.upper }</NavLink>
                  <ul>
                    { renderProgrammes() }
                  </ul>
                </li>
                { renderPages() }
              </ul>
            </div>
          </section>
        </div>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withLoader,
)

export default enhance(Sitemap)
