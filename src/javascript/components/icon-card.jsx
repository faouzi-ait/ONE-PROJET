import React from 'react'
import PropTypes from 'prop-types'
import Button from 'javascript/components/button'

// Styles
import 'stylesheets/core/components/icon-card'

// Render
const IconCard = ({ Icon, onClick }) => (
  <Button
    type="button"
    onClick={onClick}
    className="icon-card"
  >
    <Icon />
  </Button>
)

// Prop Types
IconCard.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default IconCard