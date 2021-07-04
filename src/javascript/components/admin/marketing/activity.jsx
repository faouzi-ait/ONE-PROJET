// React
import React from 'react'
import { Features } from 'javascript/config/features'
import moment from 'moment'

// Components
import {
  ActionMenu,
  ActionMenuItem,
} from 'javascript/components/admin/action-menu'
import styled from 'styled-components'

export default class Activity extends React.Component {
  render() {
    const { activity, editActivity, deleteActivity } = this.props
    return (
      <TableRow className={`with-action`}>
        <td>{moment(activity.date).format(Features.formats.shortDate)}</td>
        <td colSpan="3">
          <TitlesList>
            {(activity.programmes || []).map(programme => {
              return <li>{programme.title}</li>
            })}
          </TitlesList>
        </td>
        <td>{activity['marketing-category'].name}</td>
        <td colSpan="2">{activity.description}</td>
        <td>
          <ActionMenu name="Actions">
            <ActionMenuItem
              label="Edit"
              onClick={() => {
                editActivity(activity)
              }}
            />
            <ActionMenuItem
              label="Delete"
              onClick={() => {
                deleteActivity(activity)
              }}
            />
          </ActionMenu>
        </td>
      </TableRow>
    )
  }
}

const TitlesList = styled.ul`
  list-style: none;
  padding: 0px;
  min-width: 140px;
  li {
    font-size: 12px;
    line-height: 1.66;
    margin-bottom: 12px;
    opacity: 0.7;
    font-style: italic;
  }
`

const TableRow = styled.tr`
  font-size: 13px;
  line-height: 1.66;
  td:first-child {
    padding-left: 30px !important;
  }
`