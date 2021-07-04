import React from 'react'
import usePrefix from 'javascript/utils/hooks/use-prefix'

export const TableHeader = (props) => {
  const {colSpan, field, title, sort = null} = props
  const { prefix } = usePrefix()
  return (
    <th colSpan={colSpan ? colSpan : 1}>
        <button
            className={[
                `${prefix}table__sort`,
                !field && 'inactive',
                sort && sort.indexOf(field) === 0 && 'reverse',
                (sort && sort.indexOf(field) === 0 || sort && sort.substr(1).indexOf(field) === 0) && 'active'
              ].filter(x => x).join(` ${prefix}table__sort--`)
            }
            onClick={props.onClick}
          >
            {title}
          </button>
    </th>
  )
}

export default TableHeader