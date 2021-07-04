import React from 'react'
import 'stylesheets/core/components/quote-card'

export default ({quote, citation}) => (
  <blockquote>
    <h2>{quote}</h2>
    <cite>{citation}</cite>
  </blockquote>
)