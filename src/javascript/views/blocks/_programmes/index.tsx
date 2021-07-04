import React from 'react'
import Programmes from 'javascript/components/cards/programmes'
import getGridClass from 'javascript/utils/helper-functions/get-grid-class'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'

import allClientVariables from './variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'


const EnhancedPeopleBlock: BlockFunction<Props['block']> = (props) => {
  const _programmesCV = useClientVariables(allClientVariables)
  const otherProps = _programmesCV.otherProps(props)  
  return (
    <Programmes {...otherProps} ids={props.block.pages.map(p => p.resource.id)} render={children => (
        <div className={`grid grid--${getGridClass(props.block.numberOfItems) || 'four'}`}>{children}</div>
      )}
    />
  )
}

const ProgrammesBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedPeopleBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default ProgrammesBlock

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  adminMode: boolean
}