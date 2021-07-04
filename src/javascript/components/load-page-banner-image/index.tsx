import { findAllByModel } from 'javascript/utils/apiMethods'
import React from 'react'
import useSWR from 'swr'

import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from 'javascript/components/hoc/with-wait-for-loading-div'

interface Props extends WithWaitForLoadingDivType {
  slug: string
  children: React.FC<{ image?: string }>
  fallbackBannerImage?: string
}

const LoadPageBannerImage: React.FC<Props> = ({
  slug,
  children,
  fallbackBannerImage,
  waitForLoading,
}) => {
  const { data } = useSWR(`page-images/${slug}`, () => {
    waitForLoading.waitFor('loadPageBannerImage')
    return findAllByModel('pages', {
      fields: ['banner-urls'],
      filter: {
        slug,
      },
    }).then((pages) => {
      waitForLoading.finished('loadPageBannerImage')
      return pages?.[0] || NO_CUSTOM_BANNER
    })
  })

  let customBanner
  if (data) {
    if (data?.['banner-urls'] && Object.keys(data?.['banner-urls']).length > 0) {
      customBanner = data['banner-urls']
    } else {
      customBanner = fallbackBannerImage || NO_CUSTOM_BANNER
    }
  }

  return <>{children({ image: customBanner })}</>
}

export default withWaitForLoadingDiv(LoadPageBannerImage)