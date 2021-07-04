import React from 'react'

interface Props {
  message: string
}

const EmptySelection: React.FC<Props> = ({
  message
}) => {
  return (
    <div>
      <div className="virtual__empty-selection-hr"/>
      <div className="virtual__empty-selection-msg">
        {message}
      </div>
      <div className="virtual__empty-selection-hr"/>
    </div>
  )
}

export default EmptySelection

