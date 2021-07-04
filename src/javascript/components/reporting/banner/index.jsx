import React from 'react'

import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import allClientVariables from './variables'
import Banner from 'javascript/components/banner'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

const ReportingBanner = (props) => {
  const reportingBannerCV = useClientVariables(allClientVariables)
  return (
    <LoadPageBannerImage
      slug={props.theme.variables.SystemPages.reporting.path}
      fallbackBannerImage={reportingBannerCV.defaultBannerImage}
    >
      {({ image }) => {
        return (
          <Banner
            title="Reporting"
            copy={props.copy}
            classes={reportingBannerCV.bannerClasses}
            image={image}
          />
        )
      }}
    </LoadPageBannerImage>
  )
}

export default ReportingBanner
