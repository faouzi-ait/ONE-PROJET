import React, { useEffect, useState } from 'react'
import NavLink from 'javascript/components/nav-link'
import styled from 'styled-components'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import DashboardCard from 'javascript/components/admin/dashboard/card'

const Features = (props) => {

  return (
    <DashboardCard
      title={`What's going on?`}
      icon={`i-admin-star`}
      subHeading={false}
      width={'35'}
      height={'35'}
    >
      <Heading>Roadmap</Heading>
      <Copy>Take a look at what's coming up in our product roadmap or make a suggestion</Copy>
      <NavLink
        href="https://thisisone.tv/roadmap"
        target="_blank"
        className="cms-button"
        ignorePrefixing
      >
        View Roadmap
      </NavLink>
      <Heading>Support</Heading>
      <Copy>View our support articles for all key features </Copy>
      <NavLink
        href="http://support.thisisone.tv"
        target="_blank"
        className="cms-button"
        ignorePrefixing
      >
        View Support Articles
      </NavLink>
    </DashboardCard>
  )
}

const Heading = styled.h2`
  font-size: 16px
  font-weight: bold
  margin: 20px 0 10px
  margin-right: auto
`

const Copy = styled.p`
  font-size: 14px
  margin: 0 0 20px
  margin-right: auto
  max-width: 100%
`

export default Features
