// React
import React from 'react'
import moment from 'moment'

import NavLink from 'javascript/components/nav-link'
import compose from 'javascript/utils/compose'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withPrefix, { WithPrefixType } from 'javascript/components/hoc/with-prefix'

import { SeriesType } from 'javascript/types/ModelTypes'

interface Props extends WithThemeType, WithPrefixType {
  resource: SeriesType
  classes?: string[]
}

const SeriesResource: React.FC<Props> = ({
  classes = [],
  children,
  prefix,
  resource,
  theme,
}) => {

  const renderProgrammeName = () => {
    if (resource['programme-id']) {
      return (
        <NavLink to={`/admin/${theme.localisation.programme.path}/${resource['programme-id']}`} >
          {resource['programme-name']}
        </NavLink>
      )
    }
  }

  const rowClasses = [`${prefix}table__row`, ...classes].filter(Boolean).join(
    ` ${prefix}table__row--`,
  )

  return (
    <tr className={`with-action ${rowClasses}`} key={resource.id} >
      <td style={{'maxWidth': '220px'}}>
        {resource.name}
      </td>
      <td>
        {renderProgrammeName()}
      </td>
      <td style={{minWidth: '180px'}}>
        {resource.active ? (
          <span className="count count--success">Active</span>
        ) : (
          <span className="count count--disabled">Inactive</span>
        )}
        {resource.restricted &&
          <span className="count count--warning">Restricted</span>
        }
      </td>
      <td>
        {moment(resource['created-at']).format(theme.features.formats.shortDate)}
      </td>
      <td>
        {children}
      </td>
    </tr>
  )
}

const enhance = compose(
  withTheme,
  withPrefix
)
export default enhance(SeriesResource)

