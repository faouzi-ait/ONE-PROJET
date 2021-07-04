// React
import React, { useContext } from "react";
import styled from 'styled-components'
import icons from 'javascript/config/svg-icons'
import useClientVariables, { useDefaultClientVariables } from 'javascript/utils/client-switch/use-client-variables'
import clientVars from 'javascript/components/icon/variables'
import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'
import { StylePrefixContext } from 'javascript/utils/style-prefix/style-prefix-provider'

interface Props {
  id: string;
  width?: string | number;
  height?: string | number;
  classes?: string;
  viewBox?: string;
  style?: any;
  //This is required to pass from styled components
  className?: string
  ignorePrefixing?: boolean
  classesToPrefix?: string[]
}

const Icon: React.FC<Props> = ({
  id,
  width,
  height,
  classes,
  viewBox,
  style,
  className,
  ignorePrefixing,
  classesToPrefix,
 }) => {

  const stylePrefixEntryPoint = useContext(StylePrefixContext)
  const clientVariables =  stylePrefixEntryPoint === 'admin' ? useDefaultClientVariables(clientVars) : useClientVariables(clientVars)
  return (
    <ApplyPrefixStyles
      providedClassNames={ className || classes || clientVariables[id]?.classes}
      classesToPrefix={classesToPrefix || ['button']}
      ignorePrefixing={ignorePrefixing}
      renderProp={(classNames) => {
        return (
          <IconSVG
            width={width || clientVariables[id]?.width}
            height={height || clientVariables[id]?.height}
            viewBox={viewBox || clientVariables[id]?.viewBox}
            className={ classNames }
            style={style}
          >
            {icons[stylePrefixEntryPoint][id] && icons[stylePrefixEntryPoint][id]()}
          </IconSVG>
        )
      }}
    />
  )
}

const IconSVG = styled.svg``

export default Icon;