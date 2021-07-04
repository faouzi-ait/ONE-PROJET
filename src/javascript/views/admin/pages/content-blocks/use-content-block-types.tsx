import { useMemo } from 'react'
import useTheme from 'javascript/utils/theme/useTheme'

type BlockLocationsType = 'page' | 'programme' | 'news' | 'customCatalogue' | 'passport' | 'collection'

const contentBlockPackages = {
  core: [
    'text',
    'quote',
    'accordion',
    'stats',
    'video',
    'image',
    'gallery',
    'genre-tags', 
    'cast-and-crew', 
    'locations',
    'related-pages', 
    'promo-carousel',
  ],
  proCore: [
    'people', 
    'most-popular', 
    'press'
  ],
  page: [
    'production-companies',
    'banner-carousel',
    'promo',
    'twitter',
    'team-members',
    'html-markup',
  ],
  proPage: [
    'services', 
    'contact-person', 
    'featured-content-grid',
  ],
  catalogue: [
    'recommended-list'
  ],
  contentPlus: [
    'recommended-programmes', 
    'account-manager', 
    'continue-watching', 
    'recommended-genres', 
  ]
}

const useContentBlockTypes = (blockLocation: BlockLocationsType) => {
  const { features: { contentBlocks } } = useTheme()

  const apiConfiguredBlocks = useMemo<string[]>(() => {
    return (contentBlocks.enabledBlocks[blockLocation] || []).reduce((acc, cbName) => {
      return [
        ...acc,
        ...(contentBlockPackages[cbName] || [cbName])
      ]
    }, [])
  }, [contentBlocks.enabledBlocks])

  return {
    apiConfiguredBlocks
  }
}

export default useContentBlockTypes
