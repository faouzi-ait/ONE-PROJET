import { ThemeType } from '../theme/types/ThemeType'

const programmesQuery = (theme: ThemeType, cv:any = {}) => {
  const fields = {
    programmes: [
      'id,title,thumbnail,short-description,genres,introduction,data',
      'custom-attributes,restricted,active-series-counter',
      theme.features.programmeOverview.logoTitle && 'logo',
      theme.features.programmeOverview.episodeTag && 'number-of-episodes',
      theme.features.programmeTypes.enabled && 'programme-type',
      theme.features.programmeReleaseDate.newRelease && 'new-release',
      theme.features.customCatalogues.enabled && 'catalogues',
      (cv.durationTag || cv.brandTag) && 'custom-attributes',
    ].filter(Boolean).join(','),
    genres: 'name,parent-id'
  }
  const include = ['programme.genres']
  if(theme.features.programmeTypes.enabled){
    fields['programme-type'] = 'name'
    include.push('programme.programme-type')
  }
  if(cv.durationTag || cv.brandTag){
    fields['custom-attributes'] = 'custom-attribute-type,value,position'
    include.push('programme.custom-attributes,programme.custom-attributes.custom-attribute-type')
  }
  if(theme.features.customCatalogues.enabled) {
    fields['catalogues'] = 'name'
    include.push('programme.catalogues')
  }

  return {
    include: include.filter(Boolean).join(','),
    fields
  }
}

export default programmesQuery