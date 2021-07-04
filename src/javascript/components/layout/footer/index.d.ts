import React from 'react'
import { PageType } from 'javascript/types/ModelTypes'

interface Props {
  pages: (
    | Partial<PageType>
    | { 'content-positionable': { id: any; title: any } })[]
}

declare class Footer extends React.Component<Props> {}

export default Footer
