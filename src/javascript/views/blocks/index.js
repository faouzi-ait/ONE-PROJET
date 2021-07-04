import accordion from 'javascript/views/blocks/_accordion'
import accountManager from 'javascript/views/blocks/_account-manager'
import bannerCarousel from 'javascript/views/blocks/_banner-carousel'
import bannerScroller from 'javascript/views/blocks/_banner-scroller'
import cards from 'javascript/views/blocks/_cards'
import castAndCrew from 'javascript/views/blocks/_cast-and-crew'
import collections from 'javascript/views/blocks/_collections'
import contactPerson from 'javascript/views/blocks/_contact-person'
import contentPlaceholder from 'javascript/views/blocks/_content-placeholder'
import continueWatching from 'javascript/views/blocks/_continue-watching'
import featuredContentGrid from 'javascript/views/blocks/_featured-content-grid'
import gallery from 'javascript/views/blocks/_gallery'
import genreTags from 'javascript/views/blocks/_genre-tags'
import htmlMarkup from 'javascript/views/blocks/_html-markup'
import image from 'javascript/views/blocks/_image'
import intro from 'javascript/views/blocks/_intro'
import locations from 'javascript/views/blocks/_locations'
import logos from 'javascript/views/blocks/_logos'
import mostPopular from 'javascript/views/blocks/_most-popular'
import news from 'javascript/views/blocks/_news'
import pages from 'javascript/views/blocks/_pages'
import people from 'javascript/views/blocks/_people'
import press from 'javascript/views/blocks/_press'
import productionCompanies from 'javascript/views/blocks/_production-companies'
import programme from 'javascript/views/blocks/_programme'
import programmeGrid from 'javascript/views/blocks/_programme-grid'
import programmes from 'javascript/views/blocks/_programmes'
import promo from 'javascript/views/blocks/_promo'
import promoCarousel from 'javascript/views/blocks/_promo-carousel'
import quote from 'javascript/views/blocks/_quote'
import recommendedGenres from 'javascript/views/blocks/_recommended-genres'
import recommendedList from 'javascript/views/blocks/_recommended-list'
import recommendedProgrammes from 'javascript/views/blocks/_recommended-programmes'
import relatedPages from 'javascript/views/blocks/_related-pages'
import services from 'javascript/views/blocks/_services'
import shorthand from 'javascript/views/blocks/_shorthand'
import stats from 'javascript/views/blocks/_stats'
import teamMembers from 'javascript/views/blocks/_team-members'
import text from 'javascript/views/blocks/_text'
import textAndItems from 'javascript/views/blocks/_text-and-items'
import twitter from 'javascript/views/blocks/_twitter'
import video from 'javascript/views/blocks/_video'

const cache = {
  'accordion': accordion,
  'account-manager': accountManager,
  'banner-carousel': bannerCarousel,
  'banner-scroller': bannerScroller,
  'cards': cards,
  'cast-and-crew': castAndCrew,
  'collections': collections,
  'contact-person': contactPerson,
  'content-placeholder': contentPlaceholder,
  'continue-watching': continueWatching,
  'featured-content-grid': featuredContentGrid,
  'gallery': gallery,
  'genre-tags': genreTags,
  'html-markup': htmlMarkup,
  'image': image,
  'intro': intro,
  'locations': locations,
  'logos': logos,
  'most-popular': mostPopular,
  'news': news,
  'pages': pages,
  'people': people,
  'press': press,
  'production-companies': productionCompanies,
  'programme': programme,
  'programme-grid': programmeGrid,
  'programmes': programmes,
  'promo': promo,
  'promo-carousel': promoCarousel,
  'quote': quote,
  'recommended-genres': recommendedGenres,
  'recommended-list': recommendedList,
  'recommended-programmes': recommendedProgrammes,
  'related-pages': relatedPages,
  'services': services,
  'shorthand': shorthand,
  'stats': stats,
  'team-members': teamMembers,
  'text': text,
  'text-and-items': textAndItems,
  'twitter': twitter,
  'video': video
}

export default (block, assets, props, isMedia) => {
  if (cache[block.type]) {
    return cache[block.type](block, assets, props, isMedia)
  } else {
    console.error(`views/blocks - "${block.type}" block type does not exist!`)
    return null
  }
}