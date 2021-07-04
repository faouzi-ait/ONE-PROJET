import React, { useMemo } from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'

import allClientVariables from './variables'

import { RouteComponentProps, withRouter } from 'react-router'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import useTheme from 'javascript/utils/theme/useTheme'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import { useImpersonationState } from 'javascript/utils/hooks/use-impersonation-state'

interface Props extends RouteComponentProps {
  isCurrentlyImpersonating: boolean
}

const SUPPORT_URL = 'https://support.thisisone.tv/en/articles/'

const SupportArticleLink: React.FC<Props> = ({
  location,
  isCurrentlyImpersonating
}) => {
  const theme = useTheme()
  const supportLinkCV = useClientVariables(allClientVariables)
  const path = location.pathname

  const [pathHasArticle, colorType] = useMemo(() => {
    return urlMappings(theme).reduce<[boolean | string, 'invertedColors' | 'colors']>((foundMatch, curr) => {
      if (foundMatch[0]) return foundMatch
      for (let i = 0; i < curr.regex.length; i += 1) {
        if (curr.regex[i].test(path)) return [curr.article, curr.invertedColors ? 'invertedColors' : 'colors']
      }
      return foundMatch
    }, [false, 'colors'])
  }, [path])

  if (pathHasArticle) {
    return (
      <SupportLinkButton
        target="_blank"
        {...supportLinkCV[colorType]}
        impersonating={isCurrentlyImpersonating}
        href={SUPPORT_URL + pathHasArticle}
      >
        ?
      </SupportLinkButton>
    )
  }
  return null
}

const enhance = compose(
  withRouter,
  withHooks(() => {
    const { status } = useImpersonationState()
    return {
      isCurrentlyImpersonating: status === 'impersonating',
    }
  })
)

export default enhance(SupportArticleLink)

const SupportLinkButton = styled.a<{ bgColor: string, color: string, impersonating: boolean }>`
  font-size: 20px;
  font-weight: bold;
  text-decoration: none;
  position: absolute;
  width: 28px;
  height: 28px;
  top: ${props => props.impersonating ? '100px' : '25px'};
  right: 50px;
  z-index: 100;
  background-color: ${props => props.bgColor};
  color: ${props => props.color};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`
type ArticleMappingType = {
  regex: RegExp[]
  article: string
  invertedColors?: boolean
}

const urlMappings: (theme: ThemeType) => ArticleMappingType[] = ({ localisation }) => ([{
  regex: [new RegExp(`/admin$`)],
  article: '3524559-cms-dashboard',
  invertedColors: true
}, {
  regex: [new RegExp(`/admin/${localisation.news.path}$`), new RegExp(`/admin/${localisation.newsCategory.path}$`)],
  article: '4338062-news-articles',
}, {
  regex: [new RegExp(`/admin/config/\\w*$`)],
  article: '3758473-config-page',
}, {
  regex: [new RegExp(`/admin/companies$`)],
  article: '2665823-companies',
}, {
  regex: [new RegExp(`/admin/users$`), new RegExp(`/admin/users/[\\w\\d-]*`)],
  article: '2665827-users',
}, {
  regex: [new RegExp(`/admin/roles$`)],
  article: '2665829-roles',
}, {
  regex: [new RegExp(`/admin/pages$`)],
  article: '2665838-pages',
}, {
  regex: [
    new RegExp(`/admin/pages/\\d+/edit$`),
    new RegExp(`/admin/pages/collection/\\d+/content$`),
    new RegExp(`/admin/${localisation.programme.path}/\\d+/content$`),
    new RegExp(`/admin/${localisation.news.path}/[\\w\\d-]*/edit$`),
    new RegExp(`/admin/${localisation.catalogue.path}/[\\w\\d-]*/content$`)
  ],
  article: '2665839-pages-content-blocks',
}, {
  regex: [new RegExp(`/admin/${localisation.programme.path}/new$`)],
  article: '2665894-programmes-new-programme',
}, {
  regex: [new RegExp(`/admin/${localisation.programme.path}/\\d+/${localisation.video.path}$`)],
  article: '2665947-programmes-manage-videos',
}, {
  regex: [new RegExp(`/admin/${localisation.video.path}$`)],
  article: '2666110-videos',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.genre.path)}$`)],
  article: '2666476-genres',
}, {
  regex: [new RegExp(`/admin/qualities$`)],
  article: '2666478-qualities',
}, {
  regex: [new RegExp(`/admin/[\\w\\d-]*/\\d+/image-cropper/banner/[\\w\\d-]*$`)],
  article: '3618369-image-cropping-tool',
}, {
  regex: [new RegExp(`/admin/languages$`)],
  article: '2666482-languages',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.productionCompany.path)}$`)],
  article: '2666485-production-companies',
}, {
  regex: [new RegExp(`/admin/custom-attributes$`)],
  article: '2666494-custom-attributes',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.asset.lower)}/categories$`)],
  article: '2666506-asset-management-categories',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.asset.lower)}/management$`)],
  article: '2666513-assets',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.asset.lower)}/access$`)],
  article: '2666522-assets-access-reports',
}, {
  regex: [new RegExp(`/admin/${pluralize(localisation.asset.lower)}/permissions$`)],
  article: '2666517-asset-permissions',
}, {
  regex: [new RegExp(`/admin/permissions$`)],
  article: '2665831-copy-permissions',
}, {
  regex: [new RegExp(`/admin/${localisation.video.path}/\\d+/private-access$`)],
  article: '3049918-private-video-access',
}, {
  regex: [new RegExp(`/admin/styles/[\\w\\d-]*$`)],
  article: '4560919-styles-one-lite',
}, {
  regex: [new RegExp(`/admin/highlights*$`)],
  article: '2666112-highlights',
}])