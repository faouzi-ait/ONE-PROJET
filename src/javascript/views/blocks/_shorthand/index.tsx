import React, {useEffect, useRef} from 'react'
import styled from 'styled-components'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'

const Shorthand: BlockFunction<Props['block']> = ({
  block
}) => {

  const scriptRef = useRef<HTMLScriptElement>()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://embed.shorthand.com/embed_9.js`
    scriptRef.current = script
    document.body.appendChild(script)
  }, [])
  
  useEffect(() => {    
    setTimeout(() => {
      if(block.url){     
        //@ts-ignore   
        window.Shorthand?.embed("#sh_embed", block.url)
      }
    }, 500)
    
  }, [scriptRef, block])

  return (
    <ShorthandContainer>
      <div id="sh_embed"></div>
    </ShorthandContainer>
  )

}

const ShorthandBlock: BlockFunction<Props['block']> = (
  block,
) => {
  return (
    <Shorthand
      block={block}
    />
  )
}

export default ShorthandBlock


interface Props {
  block: any
}

const ShorthandContainer = styled.div`
  position: relative;
  z-index: 30
`
