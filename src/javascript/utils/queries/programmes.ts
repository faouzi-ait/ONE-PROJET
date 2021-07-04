import { ThemeType } from '../theme/types/ThemeType'

const programmesQuery = (theme: ThemeType, cv:any = {}) => {
  const fields = {
    programmes: [
      'title,thumbnail,short-description,genres,introduction',
      theme.features.programmeOverview?.logoTitle && 'logo',
      theme.features.programmeOverview?.episodeTag && 'number-of-episodes',
      theme.features.programmeTypes.enabled && 'programme-type',
      (cv.durationTag || cv.brandTag) && 'custom-attributes',
      theme.features.customCatalogues.enabled && 'catalogues',
      theme.features.programmeReleaseDate.newRelease && 'new-release',
    ].filter(Boolean).join(','),
    genres: 'name,parent-id'
  }
  const include = ['genres']
  if(theme.features.programmeTypes.enabled){
    fields['programme-type'] = 'name'
    include.push('programme-type')
  }
  if(cv.durationTag || cv.brandTag){
    fields['custom-attributes'] = 'custom-attribute-type,value,position'
    include.push('custom-attributes,custom-attributes.custom-attribute-type')
  }
  if(theme.features.customCatalogues.enabled) {
    fields['catalogues'] = 'name'
    include.push('catalogues')
  }

  return {
    include: include.filter(Boolean).join(','),
    fields
  }
}

export default programmesQuery