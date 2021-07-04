import React from 'react'
import Icon from 'javascript/components/icon'

const ExpandedColumn = (props) => (
  <div style={{
    display: 'flex',
    alignItems: 'center'
  }}>
    <div style={{
      backgroundColor: `#${props.theme.variables.ChartTextColor}`,
      borderRadius: '50%',
      width: '5px',
      height: '5px',
      margin: '0px 10px',
    }}>
    </div>
    <div>
      {props.children}
    </div>
  </div>
)

export default ExpandedColumn