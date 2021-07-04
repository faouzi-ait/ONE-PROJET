import React from 'react'
import pluralize from 'pluralize'
import compose from 'javascript/utils/compose'

import Checkbox from 'javascript/components/custom-checkbox'

import { ProgrammeType, SeriesType, VideoType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import withTheme from 'javascript/utils/theme/withTheme'

interface ListItemType {
  listPosition: number
  isSelected: boolean
}
interface Props {
  resource: ListItemType & ProgrammeType | ListItemType & SeriesType | ListItemType & VideoType
  theme: ThemeType
  toggleListItemSelected?: (id: number) => (e: any) => void
  viewOnly?: boolean
}

const ListItem: React.FC<Props> = ({
  resource,
  theme,
  toggleListItemSelected = () => {},
  viewOnly = false
}) => {


  const renderParentNames = () => { // i.e. programme / series / episode
    const programmePath = `/admin/${theme.localisation.programme.path}/${resource['programme-id'] || resource['id']}`
    const videosPath = theme.localisation.video.path
    const seriesPath = `${theme.localisation.series.path}/${resource['series-id']}`
    const episodePath = `episodes/${resource['episode-id']}`
    const parentTypes = []
    if (resource.type === 'programmes') {
      parentTypes.push({
        name: '',
        path: `${programmePath}`
      })
    } else if (resource.type === 'series') {
      parentTypes.push({
        name: resource['programme-name'],
        path: `${programmePath}`
      })
    } else if (resource.type === 'videos') {
      parentTypes.push({
        name: resource[ 'programme-name' ],
        path: `${programmePath}/${videosPath}`
      },
      {
        name: resource[ 'series-name' ],
        path: `${programmePath}/${seriesPath}/${videosPath}`
      },
      {
        name: resource[ 'episode-name' ],
        path: `${programmePath}/${seriesPath}/${episodePath}/${videosPath}`
      })
    }
    return parentTypes
      .filter((parent) => parent.name)
      .map((parent, i) => (
        <div key={i}>
          {parent.name}
        </div>
      ))
  }

  return (
    <tr>
      <td  style={{maxWidth: '40px'}}>
        <Checkbox
          id={`${resource.type}_${resource.id}`}
          labeless={true}
          disabled={viewOnly}
          value={resource.id}
          checked={resource.isSelected}
          onChange={toggleListItemSelected(resource.id)}
        />
      </td>
      <td  style={{maxWidth: '220px'}}>
        {resource['title-with-genre'] || resource['name']}
      </td>
      <td  style={{maxWidth: '220px'}}>
        { theme.localisation[resource.type]
            ? theme.localisation[resource.type].upper
            : theme.localisation[pluralize.singular(resource.type)].upper
        }
      </td>
      <td>
        {renderParentNames()}
      </td>
    </tr>
  )
}

const enhance = compose(
  withTheme
)

export default enhance(ListItem)