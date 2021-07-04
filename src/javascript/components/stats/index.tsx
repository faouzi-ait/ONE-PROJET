import React from 'react'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import allClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

import 'stylesheets/core/generic/statistic.sass'
interface Props {
  items: ItemType[]
  title?: string,
  centered: boolean,
  statsCV: any
}

interface ItemType {
  label: string,
  value: string
}

const Stats: React.FC<Props> = ({
  items,
  title,
  centered,
  statsCV
}) => {

  return (
    <div data-testid="stats-block">
      { title && (
        <h2 className="content-block__heading" data-testid="stats-title">{ title }</h2>
      )}
      <div className="content-block__content">
        <div className={`grid grid--wrap ${centered && 'grid--justify'}`} data-testid="stats-grid">
          {items?.map((item, i) => {
            return (
              <div className={statsCV.statisticClasses} key={`stat-${i}`} data-testid="stats-item">
                <span className="statistic__detail">{item.value}</span>
                <span className="statistic__label">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const enhance = compose(
  withTheme,
  withClientVariables('statsCV', allClientVariables)
)

export default enhance(Stats)
