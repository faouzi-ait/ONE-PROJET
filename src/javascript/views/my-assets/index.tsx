import React from 'react'

import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Meta from 'react-document-meta'
import MyAssets from 'javascript/components/my-assets'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import { WithThemeType } from 'javascript/utils/theme/withTheme'

interface Props extends WithThemeType {
}

const MyAssetsView: React.FC<Props> = ({
  theme,
}) => {
  const bannerClasses = ['short']
  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.variables.SystemPages.myAssets.upper}`}
      meta={{
        description: `Manage / Download ${theme.localisation.myAssets}`
      }}>
      <main>
        <div className="fade-on-load">
          <LoadPageBannerImage slug={theme.variables.SystemPages.myAssets.path}>
            {({ image }) => (
              <Banner
                title={theme.variables.SystemPages.myAssets.upper}
                classes={bannerClasses}
                image={image}
              />
            )}
          </LoadPageBannerImage>
          <div style={{ marginTop: '25px'}}>
            <Breadcrumbs paths={[{ name: theme.variables.SystemPages.myAssets.upper, url: `/${theme.variables.SystemPages.myAssets.path}` }]} />
          </div>
          <section className="section section--shade">
            <MyAssets myAssetsOnlyDisabled={true} />
          </section>
        </div>
      </main>
      <SmallScreenMessage />
    </Meta>
  )
}

export default MyAssetsView