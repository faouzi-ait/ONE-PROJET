import React from 'react'
import { fileSizeString } from 'javascript/utils/generic-tools'
import withTheme from 'javascript/utils/theme/withTheme'

import 'stylesheets/core/components/my-assets'
// Components
import Checkbox from 'javascript/components/custom-checkbox'
import NavLink from 'javascript/components/nav-link'

// Types
import { AssetMaterialType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import usePrefix from 'javascript/utils/hooks/use-prefix'

const fileIcons = (function requireAll(r) {
  return r.keys().reduce((acc, curr) => {
    acc[curr.replace('./', '').replace('.svg', '')] = r(curr)
    return acc
  }, {})
})(require.context('images/theme/file-types', false, /\.(svg)$/))


interface Props {
  markAssetForDownload: (resourceId: string, checked: boolean) => void
  resources: AssetMaterialType[]
  theme: ThemeType
}

const AssetList: React.FC<Props> = ({
  resources,
  markAssetForDownload,
  theme
}) => {

  if (!resources) return null

  const { prefix } = usePrefix()

  if (resources.length > 0) {
    return (
      <div className="container">
        <table className={`${prefix}table`}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Filename</th>
              <th>Programme Name</th>
              <th>File Size</th>
              <th>Selected</th>
            </tr>
          </thead>
          <tbody>{resources.map((resource => (
            <AssetItem
              key={resource.id}
              resource={resource as any}
              markAssetForDownload={markAssetForDownload}
              theme={theme}
            />
          )))}</tbody>
        </table>
      </div>
    )
  } else {
    return (
      <div className="container">
        <div className="panel u-align-center">
          <p>
            There are currently no assets to display!
          </p>
        </div>
      </div>
    )
  }
}

export default withTheme(AssetList)

interface AssetItemProps {
  markAssetForDownload: (resourceId: string, checked: boolean) => void
  resource: AssetMaterialType & { selected: boolean }
  theme: ThemeType
}

const AssetItem: React.FC<AssetItemProps> = ({
  resource,
  markAssetForDownload,
  theme
}) => {
  let assetItem = {}
  let fileSize = 0
  if (resource['asset-items'] && resource['asset-items'].length) {
    resource['asset-items'].map(file => {
      fileSize += file['file-size']
    })
    assetItem = resource['asset-items'][0]
  }

  const type = assetItem['file-type']
  let imgClass = ''
  //@ts-ignore
  let thumbnailSrc = assetItem?.file?.thumb?.url
  if (type && theme.features.acceptedFileTypes.icons.includes(type)) {
    thumbnailSrc = fileIcons[ type ]
    imgClass = 'file-type'
  }

  const findProgrammePath = (resource) => {
    return theme?.features.programmeSlugs.enabled ? resource['programme-slug'] : resource['programme-id']
  }

  return (
    <tr>
      <td style={{maxWidth: '40px'}}>
        <img src={thumbnailSrc} alt="" className={imgClass} style={{ display: 'block', maxWidth: '60px'}} />
      </td>
      <td style={{maxWidth: '220px'}}>
        {resource.name} <br/>
        <small>{resource?.['asset-category']?.name}</small>
      </td>
      <td style={{maxWidth: '220px'}}>
        <NavLink to={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}`}>{resource['programme-name']}</NavLink>
      </td>
      <td>
        {fileSizeString(fileSize)}
      </td>
      <td>
        <Checkbox
          id={`asset-selected_${resource.id}`}
          name={'asset-selected'}
          value={resource.id}
          checked={resource.selected}
          onChange={ ({ target }) => markAssetForDownload(target.value, target.checked)}
        />
      </td>
    </tr>
  )
}